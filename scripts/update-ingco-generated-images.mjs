

/**
 * Desh Solar - INGCO Approved Image Integration
 *
 * Updates image and importedGallery fields for
 * 10 approved INGCO products.
 *
 * Does not run the external catalog importer.
 *
 * Run:
 * node .\scripts\update-ingco-generated-images.mjs
 */

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const generatedPath = path.join(
  root,
  "src",
  "data",
  "external-products.generated.ts"
);

const publicImagesDir = path.join(
  root,
  "public",
  "assets",
  "products"
);

const reviewDir = path.join(
  root,
  "migration-output",
  "ingco-official-review"
);

const backupDir = path.join(
  root,
  "migration-output",
  "ingco-sync-backup"
);

const placeholder =
  "/assets/products/product-placeholder.svg";

// Exact approved INGCO model mappings
const approved = [
  [
    "INGCO 12V Cordless Drill 1.5Ah (2x Battery)",
    "CDLI12202",
    "ingco-ingco-12v-cordless-drill-1-5ah-2x-battery.webp"
  ],
  [
    "INGCO 12V Cordless Impact Driver Dual Battery",
    "CIRLI1201",
    "ingco-ingco-12v-cordless-impact-driver-dual-battery.webp"
  ],
  [
    "INGCO 16V Brushless Cordless Drill Dual Battery",
    "CDLI16682",
    "ingco-ingco-16v-brushless-cordless-drill-dual-battery.webp"
  ],
  [
    "INGCO 16V Lithium-Ion Battery 2.0Ah",
    "FBLI1620",
    "ingco-ingco-16v-lithium-battery-2-0ah.webp"
  ],
  [
    "INGCO 16V M16 Battery Charger",
    "FCLI1613",
    "ingco-ingco-16v-m16-battery-charger.webp"
  ],
  [
    "INGCO Lithium-Ion 1.5Ah battery",
    "FBLI12153",
    "ingco-ingco-lithium-1-5ah-battery.webp"
  ],
  [
    "INGCO 12v Cordless Drill 1.5ah",
    "CDLI12456",
    "ingco-ingco-12v-cordless-drill-1-5ah.webp"
  ],
  [
    "INGCO 4V Cordless Screwdriver",
    "CSDLI0406",
    "ingco-ingco-4v-cordless-screwdriver.webp"
  ],
  [
    "INGCO 4V Lithium-Ion Cordless Screwdriver",
    "CSDLI0442",
    "ingco-ingco-4v-lithium-cordless-screwdriver.webp"
  ],
  [
    "INGCO 8V Cordless Screwdriver 1.5Ah",
    "CSDLI08025",
    "ingco-ingco-8v-cordless-screwdriver-1-5ah.webp"
  ]
];

function hash(bytes) {
  return crypto
    .createHash("sha256")
    .update(bytes)
    .digest("hex");
}

function extractGeneratedArray(text) {
  const regex =
    /=\s*(\[\s*\{[\s\S]*?\}\s*\])\s+as\s+unknown\s+as\s+Product\[\]\s*;/m;

  const match = regex.exec(text);

  if (!match) {
    throw new Error(
      "Cannot locate generated Product[] JSON array. No files changed."
    );
  }

  const arrayText = match[1];
  const products = JSON.parse(arrayText);

  if (!Array.isArray(products)) {
    throw new Error(
      "Generated data is not a product array."
    );
  }

  return {
    products,
    arrayText,
    start: match.index + match[0].indexOf(arrayText)
  };
}

async function run() {
  console.log("\n=== INGCO GENERATED DATA SYNC ===");

  const original = await fs.readFile(
    generatedPath,
    "utf8"
  );

  const {
    products,
    arrayText,
    start
  } = extractGeneratedArray(original);

  const productMap = new Map(
    approved.map(([name, model, filename]) => [
      name,
      { model, filename }
    ])
  );

  if (
    productMap.size !== 10 ||
    new Set(approved.map((item) => item[1])).size !== 10
  ) {
    throw new Error(
      "Approved mapping must contain exactly 10 unique products/models."
    );
  }

  const ingco = products.filter(
    (product) =>
      String(product.brand).toLowerCase() === "ingco"
  );

  if (ingco.length !== 10) {
    throw new Error(
      `Expected 10 generated INGCO records; found ${ingco.length}. No files changed.`
    );
  }

  const seen = new Set();

  // Validate all products and images before writing.
  for (const product of ingco) {
    const item = productMap.get(product.name);

    if (
      !item ||
      seen.has(product.name) ||
      !String(product.id).startsWith("ext-ingco-")
    ) {
      throw new Error(
        `Unexpected or duplicate INGCO product: ${product.name} (${product.id})`
      );
    }

    seen.add(product.name);

    const webPath =
      `/assets/products/${item.filename}`;

    if (
      product.image !== placeholder &&
      product.image !== webPath
    ) {
      throw new Error(
        `Refusing to overwrite a different image for ${item.model}: ${product.image}`
      );
    }

    if (
      !Array.isArray(product.importedGallery) ||
      !(
        product.importedGallery.length === 0 ||
        (
          product.importedGallery.length === 1 &&
          product.importedGallery[0] === webPath
        )
      )
    ) {
      throw new Error(
        `Unexpected gallery for ${item.model}`
      );
    }

    const livePath = path.join(
      publicImagesDir,
      item.filename
    );

    const reviewPath = path.join(
      reviewDir,
      `${item.model.toLowerCase()}-corrected-review.webp`
    );

    const live = await fs.readFile(livePath);
    const review = await fs.readFile(reviewPath);

    if (
      live.length < 1000 ||
      hash(live) !== hash(review)
    ) {
      throw new Error(
        `Approved image verification failed: ${item.model}`
      );
    }

    console.log(
      `Verified approved image: ${item.model}`
    );
  }

  if (seen.size !== 10) {
    throw new Error(
      `Expected 10 mapped products, found ${seen.size}.`
    );
  }

  // Preserve all non-INGCO product data.
  const beforeOthers = JSON.stringify(
    products.filter(
      (product) =>
        String(product.brand).toLowerCase() !== "ingco"
    )
  );

  // Update only the approved image fields.
  for (const product of ingco) {
    const { filename } = productMap.get(
      product.name
    );

    const webPath =
      `/assets/products/${filename}`;

    product.image = webPath;
    product.importedGallery = [webPath];

    // Keep importStatus and all other fields unchanged.
  }

  const afterOthers = JSON.stringify(
    products.filter(
      (product) =>
        String(product.brand).toLowerCase() !== "ingco"
    )
  );

  if (beforeOthers !== afterOthers) {
    throw new Error(
      "Non-INGCO products changed unexpectedly."
    );
  }

  const newline = original.includes("\r\n")
    ? "\r\n"
    : "\n";

  const updatedArray = JSON.stringify(
    products,
    null,
    2
  ).replace(/\n/g, newline);

  const updated =
    original.slice(0, start) +
    updatedArray +
    original.slice(start + arrayText.length);

  // Final data validation before writing.
  const verified = extractGeneratedArray(
    updated
  ).products;

  const verifiedIngco = verified.filter(
    (product) =>
      String(product.brand).toLowerCase() === "ingco"
  );

  for (const product of verifiedIngco) {
    const mapping = productMap.get(product.name);

    if (!mapping) {
      throw new Error(
        `Unknown INGCO product: ${product.name}`
      );
    }

    const webPath =
      `/assets/products/${mapping.filename}`;

    if (
      product.image !== webPath ||
      JSON.stringify(product.importedGallery) !==
        JSON.stringify([webPath])
    ) {
      throw new Error(
        `Post-update validation failed: ${product.name}`
      );
    }
  }

  if (verifiedIngco.length !== 10) {
    throw new Error(
      "Post-update INGCO count mismatch."
    );
  }

  if (updated === original) {
    console.log(
      "\nAlready synchronized: 10/10 INGCO images."
    );
    console.log("No changes required.");
    return;
  }

  // Backup original generated data.
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

  await fs.copyFile(
    generatedPath,
    backup
  );

  console.log(`Backup created: ${backup}`);

  // Write using a temporary file.
  const temp =
    `${generatedPath}.ingco-${process.pid}.tmp`;

  try {
    await fs.writeFile(
      temp,
      updated,
      "utf8"
    );

    await fs.rename(
      temp,
      generatedPath
    );
  } finally {
    await fs.rm(
      temp,
      { force: true }
    ).catch(() => {});
  }

  console.log("\n========== FINAL RESULTS ==========");

  console.log("INGCO products: 10");
  console.log("Approved main image references: 10/10");
  console.log("Approved gallery references: 10/10");
  console.log("Other product objects changed: 0");

  console.log(
    "\nINGCO GENERATED DATA SYNC PASSED - 10/10"
  );

  console.log(
    "Browser rendering still needs verification."
  );
}

run().catch((error) => {
  console.error(
    "\nINGCO GENERATED DATA SYNC FAILED:"
  );

  console.error(error.message);

  process.exitCode = 1;
});
