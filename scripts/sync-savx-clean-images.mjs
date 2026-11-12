import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, "..");

const OUTPUT_DIR = path.join(
  ROOT,
  "public",
  "assets",
  "products"
);

const FORCE = process.argv.includes("--force");
const MIN_IMAGE_BYTES = 5000;

const TARGETS = [
  {
    prefix:
      "savx-savx-elite-12-volt-100ah-lithium-lithium-battery",
    label:
      "Savx Elite 12V 100Ah LiFePO4 Battery",
    page:
      "https://bme.com.bd/savx-elite-12v-100ah-lifepo4-lithium-battery",
  },

  {
    prefix:
      "savx-savx-f1-12v-100ah-lithium-battery",
    label:
      "SavX F1 12V 100Ah LiFePO4 Battery",
    page:
      "https://bme.com.bd/savx-12v-100ah-lifep04-lithium-battery",
  },

  {
    prefix:
      "savx-savx-f2-100ah-24v-lithium-battery",
    label:
      "Savx F2 100Ah 24V Lithium Battery",
    page:
      "https://bme.com.bd/savx-f2-100ah-24v-lithium-battery",
  },

  {
    prefix:
      "savx-savx-lithium-phosphate-battery-48v-100ah",
    label:
      "Savx 48V 100Ah Lithium Battery",
    page:
      "https://www.bme.com.bd/savx-48v-100ah-lithium-battery",
  },

  {
    prefix:
      "savx-2500-24v",
    label:
      "Savx F3 2500-24V Solar Inverter",
    page:
      "https://bme.com.bd/savx-f3-2500-24v-mppt-base-solar-inverter",
  },

  {
    prefix:
      "savx-3500-24v",
    label:
      "Savx F3 3500-24V Solar Inverter",
    page:
      "https://bme.com.bd/savx-f3-3500-24v-mppt-base-solar-inverter",
  },

  {
    prefix:
      "savx-5500-48v",
    label:
      "Savx F3 5500-48V Solar Inverter",
    page:
      "https://www.bme.com.bd/savx-f3-5500-48v-solar-inverter",
  },

  {
    prefix:
      "savx-savx-100w-12v-mono-solar-panel",
    label:
      "Savx 100W 12V Mono Solar Panel",
    page:
      "https://www.asthaworld.com/savx-100w-12v-mono-solar-panel",
  },

  {
    prefix:
      "savx-savx-150w-12v-mono-solar-panel",
    label:
      "Savx 150W 12V Mono Solar Panel",
    page:
      "https://www.asthaworld.com/savx-150w-12v-mono-solar-panel",
  },

  {
    prefix:
      "savx-savx-n-type-topcon-series-200-watt-monocrystalline-solar-panel",
    label:
      "SAVX N-Type TOPCon 200W Panel",
    page:
      "https://ipsbazarbd.com/product/savx-n-series-200-watt-monocrystalline-solar-panel/",
  },

  {
    prefix:
      "savx-savx-n-type-topcon-series-250-watt-monocrystalline-solar-panel",
    label:
      "SAVX N-Type TOPCon 250W Panel",
    page:
      "https://zupplus.com/products/savx-n-type-topcon-series-250-watt-monocrystalline-solar-panel",
  },

  {
    prefix:
      "savx-savx-n-type-topcon-series-350-watt-monocrystalline-solar-panel",
    label:
      "SAVX N-Type TOPCon 350W Panel",
    page:
      "https://zupplus.com/products/50-watt-monocrystalline-solar-panel",
  },
];

function decodeHtml(value) {
  return String(value ?? "")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&#x27;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function normalizeUrl(raw, baseUrl) {
  if (!raw) {
    return null;
  }

  let value = decodeHtml(
    String(raw).trim()
  ).replaceAll("\\/", "/");

  if (
    !value ||
    value.startsWith("data:") ||
    value.startsWith("javascript:") ||
    value.startsWith("#")
  ) {
    return null;
  }

  if (value.startsWith("//")) {
    value = `https:${value}`;
  }

  try {
    return new URL(
      value,
      baseUrl
    ).href;
  } catch {
    return null;
  }
}

function isImageUrl(url) {
  try {
    const pathname =
      new URL(url)
        .pathname
        .toLowerCase();

    return (
      pathname.endsWith(".png") ||
      pathname.endsWith(".jpg") ||
      pathname.endsWith(".jpeg") ||
      pathname.endsWith(".webp")
    );
  } catch {
    return false;
  }
}

async function fetchHtml(url) {
  const response =
    await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/157 Safari/537.36",

        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/avif,*/*;q=0.8",

        "Accept-Language":
          "en-US,en;q=0.9",
      },

      redirect:
        "follow",
    });

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status}`
    );
  }

  return await response.text();
}

function extractImage(
  html,
  pageUrl
) {
  const candidates =
    new Map();

  function addCandidate(
    rawUrl,
    width = 0,
    priority = 0
  ) {
    const url =
      normalizeUrl(
        rawUrl,
        pageUrl
      );

    if (
      !url ||
      !isImageUrl(url)
    ) {
      return;
    }

    const lower =
      url.toLowerCase();

    if (
      lower.includes("logo") ||
      lower.includes("favicon") ||
      lower.includes("placeholder") ||
      lower.includes("loading") ||
      lower.includes("spinner") ||
      lower.includes("icon")
    ) {
      return;
    }

    const score =
      priority * 100000 +
      Number(width || 0);

    const current =
      candidates.get(url);

    if (
      !current ||
      score > current.score
    ) {
      candidates.set(url, {
        url,
        score,
      });
    }
  }

  // Product/gallery IMG tags.
  const imgTags =
    html.match(
      /<img\b[^>]*>/gi
    ) ?? [];

  for (const tag of imgTags) {
    const lower =
      tag.toLowerCase();

    const looksProduct =
      lower.includes("product") ||
      lower.includes("gallery") ||
      lower.includes("woocommerce") ||
      lower.includes("zoom") ||
      lower.includes("main-image") ||
      lower.includes("product-image");

    const priority =
      looksProduct ? 10 : 1;

    const srcsetMatch =
      tag.match(
        /\bsrcset=["']([^"']+)["']/i
      );

    if (srcsetMatch) {
      const parts =
        srcsetMatch[1]
          .split(",")
          .map((item) =>
            item.trim()
          )
          .filter(Boolean);

      for (const part of parts) {
        const match =
          part.match(
            /^(\S+)(?:\s+(\d+)w)?$/i
          );

        if (!match) {
          continue;
        }

        addCandidate(
          match[1],
          Number(match[2] ?? 0),
          priority + 2
        );
      }
    }

    const dataLarge =
      tag.match(
        /\bdata-(?:large_image|zoom-image|large-image)=["']([^"']+)["']/i
      );

    if (dataLarge) {
      addCandidate(
        dataLarge[1],
        5000,
        priority + 5
      );
    }

    const dataSrc =
      tag.match(
        /\bdata-(?:src|lazy-src)=["']([^"']+)["']/i
      );

    if (dataSrc) {
      addCandidate(
        dataSrc[1],
        0,
        priority + 1
      );
    }

    const src =
      tag.match(
        /\bsrc=["']([^"']+)["']/i
      );

    if (src) {
      addCandidate(
        src[1],
        0,
        priority
      );
    }
  }

  // Links to full-size images.
  const linkRegex =
    /<a\b[^>]+href=["']([^"']+\.(?:png|jpe?g|webp)(?:\?[^"']*)?)["'][^>]*>/gi;

  for (
    const match of html.matchAll(
      linkRegex
    )
  ) {
    addCandidate(
      match[1],
      6000,
      12
    );
  }

  // JSON-LD images.
  const jsonImageRegex =
    /"image"\s*:\s*(?:"([^"]+)"|\[\s*"([^"]+)")/gi;

  for (
    const match of html.matchAll(
      jsonImageRegex
    )
  ) {
    addCandidate(
      match[1] || match[2],
      0,
      7
    );
  }

  // OG / Twitter fallback.
  const metaPatterns = [
    /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["'][^>]*>/gi,

    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["'][^>]*>/gi,

    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/gi,

    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["'][^>]*>/gi,
  ];

  for (
    const pattern of metaPatterns
  ) {
    for (
      const match of html.matchAll(
        pattern
      )
    ) {
      addCandidate(
        match[1],
        0,
        3
      );
    }
  }

  const ranked =
    [...candidates.values()]
      .sort(
        (a, b) =>
          b.score - a.score
      );

  if (!ranked.length) {
    throw new Error(
      "No suitable product image found"
    );
  }

  return ranked[0].url;
}

async function downloadImage(
  imageUrl,
  referer
) {
  const response =
    await fetch(imageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/157 Safari/537.36",

        Accept:
          "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",

        Referer:
          referer,
      },

      redirect:
        "follow",
    });

  if (!response.ok) {
    throw new Error(
      `Image HTTP ${response.status}`
    );
  }

  const type =
    (
      response.headers.get(
        "content-type"
      ) ?? ""
    ).toLowerCase();

  if (
    !type.startsWith(
      "image/"
    )
  ) {
    throw new Error(
      `Not an image: ${type}`
    );
  }

  const buffer =
    Buffer.from(
      await response.arrayBuffer()
    );

  if (
    buffer.length <
    MIN_IMAGE_BYTES
  ) {
    throw new Error(
      `Image too small: ${buffer.length} bytes`
    );
  }

  return buffer;
}

function extensionFromUrl(url) {
  const pathname =
    new URL(url)
      .pathname
      .toLowerCase();

  if (
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg")
  ) {
    return ".jpg";
  }

  if (
    pathname.endsWith(".webp")
  ) {
    return ".webp";
  }

  return ".png";
}

async function removeExisting(prefix) {
  const files =
    await fs.readdir(
      OUTPUT_DIR
    );

  for (const file of files) {
    const ext =
      path.extname(file)
        .toLowerCase();

    if (
      ![
        ".png",
        ".jpg",
        ".jpeg",
        ".webp",
      ].includes(ext)
    ) {
      continue;
    }

    const stem =
      path.basename(
        file,
        ext
      );

    if (
      stem.toLowerCase() ===
      prefix.toLowerCase()
    ) {
      await fs.rm(
        path.join(
          OUTPUT_DIR,
          file
        ),
        {
          force: true,
        }
      );
    }
  }
}

async function exists(prefix) {
  const files =
    await fs.readdir(
      OUTPUT_DIR
    );

  return files.some(
    (file) => {
      const ext =
        path.extname(file)
          .toLowerCase();

      return (
        [
          ".png",
          ".jpg",
          ".jpeg",
          ".webp",
        ].includes(ext) &&
        path
          .basename(
            file,
            ext
          )
          .toLowerCase() ===
          prefix.toLowerCase()
      );
    }
  );
}

async function main() {
  await fs.mkdir(
    OUTPUT_DIR,
    {
      recursive: true,
    }
  );

  console.log("");
  console.log(
    "SavX clean image sync"
  );
  console.log(
    "===================="
  );
  console.log(
    `Targets: ${TARGETS.length}`
  );
  console.log(
    `Force: ${FORCE ? "YES" : "NO"}`
  );

  let completed = 0;
  let skipped = 0;
  let failed = 0;

  const failures = [];

  for (const target of TARGETS) {
    try {
      if (
        !FORCE &&
        await exists(
          target.prefix
        )
      ) {
        console.log(
          `SKIP ${target.prefix}`
        );

        skipped++;
        continue;
      }

      console.log("");
      console.log(
        `Product: ${target.label}`
      );

      console.log(
        `Source: ${target.page}`
      );

      const html =
        await fetchHtml(
          target.page
        );

      const imageUrl =
        extractImage(
          html,
          target.page
        );

      console.log(
        `Image: ${imageUrl}`
      );

      const buffer =
        await downloadImage(
          imageUrl,
          target.page
        );

      await removeExisting(
        target.prefix
      );

      const extension =
        extensionFromUrl(
          imageUrl
        );

      const destination =
        path.join(
          OUTPUT_DIR,
          `${target.prefix}${extension}`
        );

      await fs.writeFile(
        destination,
        buffer
      );

      console.log(
        `OK ${target.prefix}${extension}`
      );

      console.log(
        `Size: ${buffer.length} bytes`
      );

      completed++;
    } catch (error) {
      failed++;

      const message =
        error instanceof Error
          ? error.message
          : String(error);

      failures.push({
        target:
          target.label,
        error:
          message,
      });

      console.log(
        `FAIL ${target.label}: ${message}`
      );
    }
  }

  console.log("");
  console.log(
    "===================="
  );

  console.log(
    `Completed: ${completed}/${TARGETS.length}`
  );

  console.log(
    `Skipped:   ${skipped}`
  );

  console.log(
    `Failed:    ${failed}`
  );

  if (failures.length) {
    console.log("");
    console.log(
      "Failures:"
    );

    for (const item of failures) {
      console.log(
        `- ${item.target}`
      );

      console.log(
        `  ${item.error}`
      );
    }
  }

  console.log("");
  console.log(
    "NOTE: 4 SavX products are intentionally not included yet:"
  );

  console.log(
    "- F3 1500-12V"
  );

  console.log(
    "- F3/F4 3000-24V"
  );

  console.log(
    "- 20W Solar Street Light"
  );

  console.log(
    "- 1500 + DJDC 100Ah combo"
  );

  console.log("");
  console.log(
    "Do NOT run the main catalog sync yet."
  );

  if (
    failed > 0
  ) {
    process.exitCode = 1;
  }
}

main().catch(
  (error) => {
    console.error("");
    console.error(
      "Fatal error:"
    );
    console.error(error);
    process.exitCode = 1;
  }
);