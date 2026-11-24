
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const generatedPath = path.join(
  root, "src", "data", "external-products.generated.ts"
);

const reviewDir = path.join(
  root, "migration-output",
  "smarten-official-review", "candidates"
);

const assetsDir = path.join(
  root, "public", "assets", "products"
);

const backupDir = path.join(
  root, "migration-output",
  "smarten-official-review", "backups"
);

const placeholder =
  "/assets/products/product-placeholder.svg";

const approved = [
  {
    id: "ext-smarten-smarten-prime-plus-mppt-controller-50ah-12-24v-3cbb429e",
    name: "Smarten PRIME PLUS Mppt Controller 50ah 12/24v",
    source: "../high-resolution/smarten-prime-plus-50a-hq.webp",
    filename: "smarten-smarten-prime-plus-mppt-controller-50ah-12-24v.webp",
  },
  {
    id: "ext-smarten-smarten-ips-nova-1100va-machine-only-bes-bee91c46",
    name: "SMARTEN IPS NOVA 1100VA MACHINE ONLY » Bes",
    source: "smarten-nova-1100-review.jpg",
    filename: "smarten-smarten-ips-nova-1100va-machine-only-bes.jpg",
  },
  {
    id: "ext-smarten-smarten-nova-700va-12v-pure-sine-wave-home-ups-17941fc0",
    name: "Smarten Nova 700VA 12V Pure Sine Wave Home UPS",
    source: "smarten-nova-700-review.jpg",
    filename: "smarten-smarten-nova-700va-12v-pure-sine-wave-home-ups.jpg",
  },
];

function sha256(bytes) {
  return crypto
    .createHash("sha256")
    .update(bytes)
    .digest("hex");
}

function objectSpans(arrayText) {
  const spans = [];
  let depth = 0;
  let start = -1;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < arrayText.length; index++) {
    const ch = arrayText[index];

    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === "{") {
      if (depth === 0) start = index;
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth < 0) {
        throw new Error("Malformed product JSON object");
      }
      if (depth === 0) {
        spans.push({ start, end: index + 1 });
      }
    }
  }

  if (depth !== 0 || inString) {
    throw new Error("Unbalanced generated product JSON");
  }

  return spans;
}

function replaceOne(block, pattern, replacement, label) {
  const found = [...block.matchAll(pattern)];

  if (found.length !== 1) {
    throw new Error(`Expected exactly one ${label} field`);
  }

  return block.replace(pattern, replacement);
}

async function run() {
  console.log("\n=== SMARTEN GENERATED IMAGE SYNC ===");

  if (new Set(approved.map(item => item.id)).size !== 3) {
    throw new Error("Duplicate approved product IDs");
  }

  const map = new Map(
    approved.map(item => [item.id, item])
  );

  // Verify all approved image files.
  for (const item of approved) {
    const source = await fs.readFile(
      path.join(reviewDir, item.source)
    );

    const live = await fs.readFile(
      path.join(assetsDir, item.filename)
    );

    if (
      source.length < 5000 ||
      sha256(source) !== sha256(live)
    ) {
      throw new Error(
        `Image missing/mismatched: ${item.name}`
      );
    }

    console.log(`Image verified: ${item.name}`);
  }

  const original = await fs.readFile(
    generatedPath, "utf8"
  );

  const pattern =
    /=\s*(\[\s*\{[\s\S]*?\}\s*\])\s+as\s+unknown\s+as\s+Product\[\]\s*;/m;

  const match = pattern.exec(original);

  if (!match) {
    throw new Error(
      "Generated Product[] array not found; file unchanged"
    );
  }

  const arrayText = match[1];
  const items = JSON.parse(arrayText);
  const spans = objectSpans(arrayText);

  if (spans.length !== items.length) {
    throw new Error("Product object span mismatch");
  }

  const smarten = items.filter(
    item => String(item.brand).toLowerCase() === "smarten"
  );

  if (smarten.length !== 9) {
    throw new Error(
      `Expected 9 Smarten products; found ${smarten.length}`
    );
  }

  const seen = new Set();
  let cursor = 0;
  let resultArray = "";
  let changes = 0;

  // Modify only the three approved product objects.
  for (const span of spans) {
    const block = arrayText.slice(span.start, span.end);
    const item = JSON.parse(block);
    const config = map.get(item.id);

    let nextBlock = block;

    if (config) {
      if (
        seen.has(item.id) ||
        item.name !== config.name ||
        String(item.brand).toLowerCase() !== "smarten"
      ) {
        throw new Error(
          `Unexpected/duplicate Smarten record: ${item.id}`
        );
      }

      seen.add(item.id);

      const webPath =
        `/assets/products/${config.filename}`;

      if (
        item.image !== placeholder &&
        item.image !== webPath
      ) {
        throw new Error(
          `Unexpected current image on ${item.name}: ${item.image}`
        );
      }

      if (
        !Array.isArray(item.importedGallery) ||
        (
          item.importedGallery.length !== 0 &&
          !(
            item.importedGallery.length === 1 &&
            item.importedGallery[0] === webPath
          )
        )
      ) {
        throw new Error(
          `Unexpected gallery on ${item.name}`
        );
      }

      nextBlock = replaceOne(
        nextBlock,
        /(^[ \t]*"image"\s*:\s*)"(?:\\.|[^"\\])*"/gm,
        (_all, key) => `${key}${JSON.stringify(webPath)}`,
        "image"
      );

      nextBlock = replaceOne(
        nextBlock,
        /(^[ \t]*"importedGallery"\s*:\s*)\[[\s\S]*?\]/gm,
        (_all, key) => `${key}[${JSON.stringify(webPath)}]`,
        "importedGallery"
      );

      const desired = {
        ...item,
        image: webPath,
        importedGallery: [webPath]
      };

      if (
        JSON.stringify(JSON.parse(nextBlock)) !==
        JSON.stringify(desired)
      ) {
        throw new Error(
          `Unexpected product field change: ${item.name}`
        );
      }

      if (nextBlock !== block) changes++;
    }

    resultArray +=
      arrayText.slice(cursor, span.start) + nextBlock;

    cursor = span.end;
  }

  resultArray += arrayText.slice(cursor);

  if (seen.size !== 3) {
    throw new Error(
      `Expected 3 mapped products; found ${seen.size}`
    );
  }

  // Validate every record after transformation.
  const resultItems = JSON.parse(resultArray);

  if (resultItems.length !== items.length) {
    throw new Error("Product count changed unexpectedly");
  }

  for (let index = 0; index < items.length; index++) {
    const orig = items[index];
    const next = resultItems[index];

    if (map.has(orig.id)) {
      const webPath =
        `/assets/products/${map.get(orig.id).filename}`;

      if (
        next.image !== webPath ||
        JSON.stringify(next.importedGallery) !==
          JSON.stringify([webPath])
      ) {
        throw new Error(
          "Final approved image validation failed"
        );
      }
    } else if (
      JSON.stringify(orig) !== JSON.stringify(next)
    ) {
      throw new Error(
        `Unapproved product changed: ${orig.id}`
      );
    }
  }

  if (changes === 0) {
    console.log(
      "\nAlready synchronized: 3/3. No file changes required."
    );
    return;
  }

  const pos =
    match.index + match[0].indexOf(arrayText);

  const output =
    original.slice(0, pos) +
    resultArray +
    original.slice(pos + arrayText.length);

  // Back up generated catalog before writing.
  await fs.mkdir(backupDir, {
    recursive: true
  });

  const stamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-");

  const backup = path.join(
    backupDir,
    `external-products.generated-${stamp}.ts`
  );

  await fs.copyFile(generatedPath, backup);

  const temp =
    `${generatedPath}.smarten-${process.pid}.tmp`;

  try {
    await fs.writeFile(temp, output, "utf8");
    await fs.rename(temp, generatedPath);
  } finally {
    await fs.rm(temp, { force: true }).catch(() => {});
  }

  console.log("\n=== FINAL RESULTS ===");
  console.log("Smarten products: 9");
  console.log("Approved generated images: 3/9");
  console.log("Remaining Smarten placeholders: 6");
  console.log("Other products modified: 0");
  console.log(`Backup: ${backup}`);

  console.log(
    "\nSMARTEN GENERATED IMAGE SYNC PASSED - 3/9"
  );
}

run().catch(error => {
  console.error(
    `\nSMARTEN GENERATED IMAGE SYNC FAILED: ${error.message}`
  );
  process.exitCode = 1;
});
