import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, "..");

const CATALOG_FILE = path.join(
  ROOT,
  "migration-output",
  "catalog-source.csv"
);

const OUTPUT_DIR = path.join(
  ROOT,
  "public",
  "assets",
  "products"
);

const FORCE = process.argv.includes("--force");

const MIN_IMAGE_BYTES = 15000;

/*
 * Sources:
 *
 * AC-drive rows:
 * Official M-Driver 900 Series Fan/Pump VFD
 *
 * Solar rows:
 * Official/manufacturer PV500 product pages.
 *
 * Made-in-China pages below belong to
 * Shenzhen M-Driver Technology Co., Ltd.
 */
const SOURCES = {
  acDrive: {
    type: "official",
    url:
      "https://www.m-driver.com/products/ac-drives-vfd/900-Series-Fan-and-Pump-VFD-Drive.html",
  },

  solarLowSingle: {
    type: "manufacturer",
    url:
      "https://mdriver.en.made-in-china.com/product/TFgaHSkdnLVP/China-Single-Phase-220V-0-75kw-1-5kw-2-2kw-Solar-Water-Pump-Inverter-1HP-2HP-3HP.html",
  },

  solar4Single: {
    type: "manufacturer",
    url:
      "https://mdriver.en.made-in-china.com/product/VdsGMqfklIco/China-Single-Phase-220V-5HP-Solar-Pump-Inverter-4kw-Solar-VFD.html",
  },

  solarLow380: {
    type: "manufacturer",
    url:
      "https://mdriver.en.made-in-china.com/product/dwNfZtWAHQGn/China-3-Phase-380V-0-75kw-1-5kw-2-2kw-Solar-Pumping-Inverter.html",
  },

  solarMedium380: {
    type: "manufacturer",
    url:
      "https://mdriver.en.made-in-china.com/product/cZVtlSbyMkWP/China-380V-440V-460V-AC-Pump-Drive-Inverter-4kw-5-5kw-7-5kw-Solar-Water-Pumping-Controller.html",
  },

  solar11: {
    type: "manufacturer",
    url:
      "https://mdriver.en.made-in-china.com/product/pwCGmJsvHEtN/China-3-Phase-440V-460V-7-5kw-11kw-Solar-Water-Pump-Inverter-10HP-15HP-VFD-Drives.html",
  },

  solar15: {
    type: "manufacturer",
    url:
      "https://mdriver.en.made-in-china.com/product/ZFjAhqgGnmtX/China-380V-3pH-15kw-18-5kw-Solar-Water-Pump-Inverter-with-MPPT.html",
  },

  solar22: {
    type: "manufacturer",
    url:
      "https://mdriver.en.made-in-china.com/product/HwhANyTKkRcB/China-380V-30HP-Solar-Pump-Inverter-22kw-MPPT-VFD-Drive.html",
  },
};

function parseCsv(text) {
  const rows = [];

  let row = [];
  let value = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          value += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        value += char;
      }

      continue;
    }

    if (char === '"') {
      quoted = true;
      continue;
    }

    if (char === ",") {
      row.push(value);
      value = "";
      continue;
    }

    if (char === "\n") {
      row.push(
        value.replace(/\r$/, "")
      );

      rows.push(row);

      row = [];
      value = "";

      continue;
    }

    value += char;
  }

  if (value.length || row.length) {
    row.push(value);
    rows.push(row);
  }

  if (!rows.length) {
    return [];
  }

  const headers = rows[0];

  return rows
    .slice(1)
    .filter((item) =>
      item.some(
        (field) =>
          String(field).trim()
      )
    )
    .map((item) => {
      const result = {};

      headers.forEach(
        (header, index) => {
          result[
            String(header).trim()
          ] =
            item[index] ?? "";
        }
      );

      return result;
    });
}

function normalize(value) {
  return String(
    value ?? ""
  )
    .trim()
    .toLowerCase();
}

function productText(row) {
  return [
    row.name,
    row.title,
    row.model,
    row.category,
    row.sourceUrl,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getPowerKw(text) {
  const matches = [
    ...text.matchAll(
      /(\d+(?:\.\d+)?)\s*k?w/gi
    ),
  ];

  if (!matches.length) {
    return null;
  }

  for (const match of matches) {
    const value =
      Number(match[1]);

    if (
      Number.isFinite(value) &&
      value <= 100
    ) {
      return value;
    }
  }

  return null;
}

function selectSource(row) {
  const text =
    productText(row);

  const power =
    getPowerKw(text);

  const isSolar =
    /solar|pump/i.test(text);

  const isAcDrive =
    /ac\s*drive|vfd/i.test(text) &&
    !isSolar;

  if (isAcDrive) {
    return SOURCES.acDrive;
  }

  if (
    power != null &&
    power >= 21
  ) {
    return SOURCES.solar22;
  }

  if (
    power != null &&
    power >= 14
  ) {
    return SOURCES.solar15;
  }

  if (
    power != null &&
    power >= 10
  ) {
    return SOURCES.solar11;
  }

  const is380 =
    /380\s*v|three[\s-]*phase|3[\s-]*phase/i.test(
      text
    );

  if (
    is380 &&
    power != null &&
    power >= 4
  ) {
    return SOURCES.solarMedium380;
  }

  if (
    is380
  ) {
    return SOURCES.solarLow380;
  }

  if (
    power != null &&
    power >= 3.5
  ) {
    return SOURCES.solar4Single;
  }

  return SOURCES.solarLowSingle;
}

function decodeHtml(value) {
  return String(
    value ?? ""
  )
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&#x27;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function normalizeUrl(
  raw,
  baseUrl
) {
  if (!raw) {
    return null;
  }

  let value =
    decodeHtml(
      String(raw).trim()
    )
      .replaceAll("\\/", "/");

  if (
    !value ||
    value.startsWith("data:") ||
    value.startsWith("javascript:")
  ) {
    return null;
  }

  if (
    value.startsWith("//")
  ) {
    value =
      `https:${value}`;
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

function rejectCandidate(url) {
  const text =
    url.toLowerCase();

  return (
    text.includes("logo") ||
    text.includes("favicon") ||
    text.includes("banner") ||
    text.includes("icon") ||
    text.includes("loading") ||
    text.includes("placeholder") ||
    text.includes("payment") ||
    text.includes("certificate") ||
    text.includes("qrcode") ||
    text.includes("qr-code") ||
    text.includes("avatar")
  );
}

function extractCandidates(
  html,
  pageUrl
) {
  const candidates =
    new Map();

  function add(
    rawUrl,
    score = 0,
    description = ""
  ) {
    const url =
      normalizeUrl(
        rawUrl,
        pageUrl
      );

    if (
      !url ||
      !isImageUrl(url) ||
      rejectCandidate(url)
    ) {
      return;
    }

    const lower =
      `${url} ${description}`
        .toLowerCase();

    let finalScore =
      score;

    if (
      lower.includes(
        "image.made-in-china.com"
      )
    ) {
      finalScore += 1000;
    }

    if (
      lower.includes(
        "m-driver.com/upload"
      )
    ) {
      finalScore += 1100;
    }

    if (
      lower.includes("product")
    ) {
      finalScore += 200;
    }

    if (
      lower.includes("inverter")
    ) {
      finalScore += 160;
    }

    if (
      lower.includes("solar")
    ) {
      finalScore += 120;
    }

    if (
      lower.includes("pump")
    ) {
      finalScore += 100;
    }

    if (
      lower.includes("vfd")
    ) {
      finalScore += 80;
    }

    const existing =
      candidates.get(url);

    if (
      !existing ||
      finalScore >
        existing.score
    ) {
      candidates.set(
        url,
        {
          url,
          score:
            finalScore,
        }
      );
    }
  }

  const imgTags =
    html.match(
      /<img\b[^>]*>/gi
    ) ?? [];

  for (
    const tag of imgTags
  ) {
    const alt =
      tag.match(
        /\balt=["']([^"']*)["']/i
      )?.[1] ?? "";

    const width =
      Number(
        tag.match(
          /\bwidth=["']?(\d+)/i
        )?.[1] ?? 0
      );

    const srcset =
      tag.match(
        /\bsrcset=["']([^"']+)["']/i
      );

    if (srcset) {
      for (
        const item of
          srcset[1].split(",")
      ) {
        const match =
          item
            .trim()
            .match(
              /^(\S+)(?:\s+(\d+)w)?/
            );

        if (!match) {
          continue;
        }

        add(
          match[1],
          500 +
            Number(
              match[2] ?? 0
            ),
          alt
        );
      }
    }

    for (
      const attr of [
        "data-large-image",
        "data-large_image",
        "data-zoom-image",
        "data-src",
        "src",
      ]
    ) {
      const regex =
        new RegExp(
          `\\b${attr}=["']([^"']+)["']`,
          "i"
        );

      const match =
        tag.match(regex);

      if (match) {
        add(
          match[1],
          300 + width,
          alt
        );
      }
    }
  }

  const metaPatterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi,

    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/gi,

    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/gi,
  ];

  for (
    const pattern of
      metaPatterns
  ) {
    for (
      const match of
        html.matchAll(pattern)
    ) {
      add(
        match[1],
        600,
        "product"
      );
    }
  }

  return [
    ...candidates.values(),
  ].sort(
    (a, b) =>
      b.score - a.score
  );
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

      redirect: "follow",
    });

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status}`
    );
  }

  return await response.text();
}

async function downloadImage(
  url,
  referer
) {
  const response =
    await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/157 Safari/537.36",

        Accept:
          "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",

        Referer:
          referer,
      },

      redirect: "follow",
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

function extensionFor(
  url,
  contentType = ""
) {
  const lowerType =
    contentType.toLowerCase();

  if (
    lowerType.includes("webp")
  ) {
    return ".webp";
  }

  if (
    lowerType.includes("png")
  ) {
    return ".png";
  }

  try {
    const pathname =
      new URL(url)
        .pathname
        .toLowerCase();

    if (
      pathname.endsWith(".webp")
    ) {
      return ".webp";
    }

    if (
      pathname.endsWith(".png")
    ) {
      return ".png";
    }
  } catch {}

  return ".jpg";
}

async function removePrefixFiles(
  prefix
) {
  const files =
    await fs.readdir(
      OUTPUT_DIR
    );

  const lowerPrefix =
    prefix.toLowerCase();

  for (
    const file of files
  ) {
    const ext =
      path
        .extname(file)
        .toLowerCase();

    if (
      ![
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
      ].includes(ext)
    ) {
      continue;
    }

    const base =
      path
        .basename(
          file,
          ext
        )
        .toLowerCase();

    if (
      base === lowerPrefix
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

async function hasImage(
  prefix
) {
  const files =
    await fs.readdir(
      OUTPUT_DIR
    );

  const lowerPrefix =
    prefix.toLowerCase();

  return files.some(
    (file) => {
      const ext =
        path
          .extname(file)
          .toLowerCase();

      return (
        [
          ".jpg",
          ".jpeg",
          ".png",
          ".webp",
        ].includes(ext) &&
        path
          .basename(
            file,
            ext
          )
          .toLowerCase() ===
          lowerPrefix
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

  const csvText =
    await fs.readFile(
      CATALOG_FILE,
      "utf8"
    );

  const rows =
    parseCsv(csvText);

  const byId =
    new Map();

  for (
    const row of rows
  ) {
    const brand =
      normalize(
        row.brand
      );

    if (
      brand !== "m-driver" &&
      brand !== "m driver" &&
      brand !== "mdriver"
    ) {
      continue;
    }

    const key =
      row.id ||
      row.approvedImagePrefix ||
      row.name;

    if (
      !byId.has(key)
    ) {
      byId.set(
        key,
        row
      );
    }
  }

  const products = [
    ...byId.values(),
  ];

  console.log("");
  console.log(
    "M-Driver official image sync"
  );
  console.log(
    "============================"
  );
  console.log(
    `Canonical products: ${products.length}`
  );

  let completed = 0;
  let skipped = 0;
  let failed = 0;

  const pageCache =
    new Map();

  const failures = [];

  for (
    const product of products
  ) {
    const prefix =
      String(
        product.approvedImagePrefix ??
        ""
      ).trim();

    if (!prefix) {
      failed++;

      failures.push({
        name:
          product.name,
        error:
          "Missing approvedImagePrefix",
      });

      continue;
    }

    if (
      !FORCE &&
      await hasImage(prefix)
    ) {
      console.log(
        `SKIP ${prefix}`
      );

      skipped++;
      continue;
    }

    const source =
      selectSource(product);

    console.log("");
    console.log(
      `Product: ${product.name}`
    );

    console.log(
      `Prefix: ${prefix}`
    );

    console.log(
      `Source: ${source.url}`
    );

    try {
      let candidates =
        pageCache.get(
          source.url
        );

      if (!candidates) {
        const html =
          await fetchHtml(
            source.url
          );

        candidates =
          extractCandidates(
            html,
            source.url
          );

        pageCache.set(
          source.url,
          candidates
        );
      }

      if (
        !candidates.length
      ) {
        throw new Error(
          "No suitable image candidates"
        );
      }

      let selected = null;
      let buffer = null;

      for (
        const candidate of
          candidates
      ) {
        try {
          buffer =
            await downloadImage(
              candidate.url,
              source.url
            );

          selected =
            candidate.url;

          break;
        } catch {
          // Try next candidate.
        }
      }

      if (
        !selected ||
        !buffer
      ) {
        throw new Error(
          "Could not download an acceptable product image"
        );
      }

      await removePrefixFiles(
        prefix
      );

      const ext =
        extensionFor(
          selected
        );

      const output =
        path.join(
          OUTPUT_DIR,
          `${prefix}${ext}`
        );

      await fs.writeFile(
        output,
        buffer
      );

      console.log(
        `OK: ${path.basename(output)}`
      );

      console.log(
        `Bytes: ${buffer.length}`
      );

      console.log(
        `Image source: ${selected}`
      );

      completed++;
    } catch (error) {
      failed++;

      const message =
        error instanceof Error
          ? error.message
          : String(error);

      failures.push({
        name:
          product.name,
        error:
          message,
      });

      console.log(
        `FAIL: ${message}`
      );
    }
  }

  console.log("");
  console.log(
    "============================"
  );

  console.log(
    `Completed: ${completed}/${products.length}`
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
      const failure of
        failures
    ) {
      console.log(
        `- ${failure.name}`
      );

      console.log(
        `  ${failure.error}`
      );
    }
  }

  console.log("");
  console.log(
    "Do NOT regenerate external-products yet."
  );

  console.log(
    "First visually inspect all M-Driver images."
  );

  if (
    failed > 0
  ) {
    process.exitCode = 1;
  }
}

main().catch(
  (error) => {
    console.error(error);
    process.exitCode = 1;
  }
);