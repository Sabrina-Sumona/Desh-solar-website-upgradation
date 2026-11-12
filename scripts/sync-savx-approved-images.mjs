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
const MIN_IMAGE_BYTES = 7000;

const TARGETS = [
  {
    prefix:
      "savx-savx-elite-12-volt-100ah-lithium-lithium-battery",
    label:
      "Savx Elite 12V 100Ah LiFePO4 Battery",
    page:
      "https://ipsbazarbd.com/product/savx-12v-100ah-lifepo4-lithium-battery/",
  },

  {
    prefix:
      "savx-savx-f1-12v-100ah-lithium-battery",
    label:
      "SavX F1 12V 100Ah LiFePO4 Battery",
    page:
      "https://ipsbazarbd.com/product/savx-12v-100ah-lifep04-lithium-battery/",
  },

  {
    prefix:
      "savx-savx-f2-100ah-24v-lithium-battery",
    label:
      "Savx F2 100Ah 24V Lithium Battery",
    page:
      "https://ipsbazarbd.com/product/savx-f2-100ah-24v-lithium-battery/",
  },

  {
    prefix:
      "savx-savx-lithium-phosphate-battery-48v-100ah",
    label:
      "Savx 48V 100Ah Lithium Phosphate Battery",
    page:
      "https://ipsbazarbd.com/product/lithium-battery-48v-100ah-lifepo4/",
  },

  {
    prefix:
      "savx-savx-20w-solar-street-light",
    label:
      "Savx 20W Solar Street Light",
    page:
      "https://ipsbazarbd.com/product/savx-20w-solar-street-light/",
  },

  {
    prefix:
      "savx-1500-12v",
    label:
      "Savx F3 1500-12V Solar Inverter",
    page:
      "https://ipsbazarbd.com/product/savx-solar-inverter-f3-1500-12v-mppt-base/",
  },

  {
    prefix:
      "savx-2500-24v",
    label:
      "Savx F3 2500-24V Solar Inverter",
    page:
      "https://ipsbazarbd.com/product/savx-solar-inverter-f3-2500-24v-mppt-base/",
  },

  {
    prefix:
      "savx-3000-24v",
    label:
      "Savx F3 3000-24V Solar Inverter",
    page:
      "https://ipsbazarbd.com/product/savx-solar-inverter-f4-3000-24v-mppt-base/",
  },

  {
    prefix:
      "savx-3500-24v",
    label:
      "Savx F3 3500-24V Solar Inverter",
    page:
      "https://ipsbazarbd.com/product/savx-solar-inverter-f3-3500-24v-mppt-base/",
  },

  {
    prefix:
      "savx-5500-48v",
    label:
      "Savx F3 5500-48V Solar Inverter",
    page:
      "https://ipsbazarbd.com/product/savx-solar-inverter-f3-5500-48v-mppt-base/",
  },

  {
    prefix:
      "savx-savx-100w-12v-mono-solar-panel",
    label:
      "Savx 100W 12V Mono Solar Panel",
    page:
      "https://ipsbazarbd.com/product/savx-100w-12v-mono-solar-panel/",
  },

  {
    prefix:
      "savx-savx-150w-12v-mono-solar-panel",
    label:
      "Savx 150W 12V Mono Solar Panel",
    page:
      "https://ipsbazarbd.com/product/savx-150w-12v-mono-solar-panel/",
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
      "https://ipsbazarbd.com/product/savx-n-type-topcon-series-250-watt-monocrystalline-solar-panel/",
  },

  {
    prefix:
      "savx-savx-n-type-topcon-series-350-watt-monocrystalline-solar-panel",
    label:
      "SAVX N-Type TOPCon 350W Panel",
    page:
      "https://ipsbazarbd.com/product/savx-n-type-topcon-series-350-watt-monocrystalline-solar-panel/",
  },

  {
    prefix:
      "savx-savx-1500-inverter-djdc-100ah-li-ion-battery-pack",
    label:
      "Savx 1500 Inverter + DJDC 100Ah Battery Pack",
    page:
      "https://ipsbazarbd.com/product/1500w-solar-system-with-lithium-battery-2/",
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
      pathname.endsWith(".jpg") ||
      pathname.endsWith(".jpeg") ||
      pathname.endsWith(".png") ||
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
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",

        "Accept-Language":
          "en-US,en;q=0.9",
      },

      redirect:
        "follow",
    });

  if (!response.ok) {
    throw new Error(
      `Product page request failed: HTTP ${response.status}`
    );
  }

  return await response.text();
}

function extractFeaturedImage(
  html,
  pageUrl
) {
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,

    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/i,

    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,

    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["'][^>]*>/i,

    /<img\b[^>]*class=["'][^"']*wp-post-image[^"']*["'][^>]*src=["']([^"']+)["']/i,

    /<img\b[^>]*src=["']([^"']+)["'][^>]*class=["'][^"']*wp-post-image[^"']*["']/i,
  ];

  for (
    const pattern of patterns
  ) {
    const match =
      html.match(pattern);

    if (!match) {
      continue;
    }

    const url =
      normalizeUrl(
        match[1],
        pageUrl
      );

    if (
      url &&
      isImageUrl(url)
    ) {
      return url;
    }
  }

  throw new Error(
    "Could not locate featured product image"
  );
}

async function downloadImage(
  imageUrl,
  referer
) {
  const response =
    await fetch(
      imageUrl,
      {
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
      }
    );

  if (!response.ok) {
    throw new Error(
      `Image request failed: HTTP ${response.status}`
    );
  }

  const contentType =
    (
      response.headers.get(
        "content-type"
      ) ?? ""
    ).toLowerCase();

  if (
    !contentType.startsWith(
      "image/"
    )
  ) {
    throw new Error(
      `Rejected non-image response: ${contentType || "unknown"}`
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
      `Suspiciously small image: ${buffer.length} bytes`
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

async function findExisting(prefix) {
  const files =
    await fs.readdir(
      OUTPUT_DIR
    );

  return files.find(
    (file) => {
      const ext =
        path.extname(file).toLowerCase();

      if (
        ![
          ".png",
          ".jpg",
          ".jpeg",
          ".webp",
        ].includes(ext)
      ) {
        return false;
      }

      return (
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

async function removeExisting(prefix) {
  const files =
    await fs.readdir(
      OUTPUT_DIR
    );

  for (const file of files) {
    const ext =
      path.extname(file).toLowerCase();

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

    if (
      path
        .basename(
          file,
          ext
        )
        .toLowerCase() ===
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

async function main() {
  await fs.mkdir(
    OUTPUT_DIR,
    {
      recursive: true,
    }
  );

  console.log("");
  console.log(
    "SavX approved image sync"
  );

  console.log(
    "========================"
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

  for (
    const target of TARGETS
  ) {
    try {
      const existing =
        await findExisting(
          target.prefix
        );

      if (
        existing &&
        !FORCE
      ) {
        console.log(
          `SKIP ${target.prefix} -> ${existing}`
        );

        skipped++;
        continue;
      }

      console.log("");
      console.log(
        `Product: ${target.label}`
      );

      console.log(
        `Page: ${target.page}`
      );

      const html =
        await fetchHtml(
          target.page
        );

      const imageUrl =
        extractFeaturedImage(
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

      /*
       * Only remove an existing file after the replacement
       * has downloaded successfully.
       */
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
        `OK   ${target.prefix}${extension}`
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

      console.log(
        `FAIL ${target.prefix}: ${message}`
      );

      failures.push({
        prefix:
          target.prefix,

        label:
          target.label,

        error:
          message,
      });
    }
  }

  console.log("");
  console.log(
    "========================"
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

  if (
    failures.length
  ) {
    console.log("");
    console.log(
      "Failures:"
    );

    for (
      const item of failures
    ) {
      console.log(
        `- ${item.prefix}`
      );

      console.log(
        `  ${item.label}`
      );

      console.log(
        `  ${item.error}`
      );
    }
  }

  console.log("");
  console.log(
    "IMPORTANT:"
  );

  console.log(
    "Do NOT run sync-external-products.mjs yet."
  );

  console.log(
    "First visually inspect all 16 SavX images."
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