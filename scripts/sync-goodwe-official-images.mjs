import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, "..");
const OUTPUT_DIR = path.join(PROJECT_ROOT, "public", "assets", "products");

const FORCE = process.argv.includes("--force");

/**
 * We deliberately use official GoodWe pages only.
 *
 * Each family defines:
 * - page: official product page
 * - preferredTokens: clean product/overview image filenames preferred
 * - hints: fallback scoring terms
 *
 * The scraper rejects logos, icons, banners, certificates, etc.
 */
const FAMILIES = {
  lynxA5: {
    name: "GoodWe Lynx A 5kWh",
    page: "https://en.goodwe.com/lynxa-series",
    preferredTokens: ["LynxAG1combination-31.png", "LynxAG1combination-1.png"],
    hints: ["lynx", "battery", "combination"],
  },

  lynxA10: {
    name: "GoodWe Lynx A G4 10kWh",
    page: "https://en.goodwe.com/lynx-a-g4-series-10kwh",
    preferredTokens: ["LynxAG410kWh-31.png", "LynxAG410kWh-2.png"],
    hints: ["lynx", "10kwh", "battery"],
  },

  lynxA16: {
    name: "GoodWe Lynx A G4 16kWh",
    page: "https://en.goodwe.com/lynx-a-g4-series-16kwh",
    preferredTokens: ["Non-touch-31.png", "20260416-141311.png"],
    hints: ["non-touch", "16kwh", "battery"],
  },

  batS: {
    name: "GoodWe BAT-S 25.6–56.3kWh",
    page: "https://en.goodwe.com/bat-25-56-series",
    preferredTokens: ["BAT50-31.png", "BAT50-1.png"],
    hints: ["bat50", "battery"],
  },

  batC100: {
    name: "GoodWe BAT-C 60–112.6kWh",
    page: "https://en.goodwe.com/au/bat-60-112-series",
    preferredTokens: ["BAT100kWh-31.png", "BAT100kWh-1.png", "BAT100kWh-2.png"],
    hints: ["bat100", "battery"],
  },

  esUniq: {
    name: "GoodWe ES Uniq 3–12kW",
    page: "https://en.goodwe.com/es-uniq",
    preferredTokens: ["ESUniq3-6kW-31.png", "ESUniq3-6kW-1.png"],
    hints: ["esuniq", "uniq"],
  },

  etLv: {
    name: "GoodWe ET LV 5–20kW",
    page: "https://en.goodwe.com/et-lv-series",
    preferredTokens: ["ETLV6-20K-31.png", "ETLV6-20K-1.png"],
    hints: ["etlv", "et-lv"],
  },

  et25_50: {
    name: "GoodWe ET 25–50kW",
    page: "https://en.goodwe.com/et-25-50kw",
    preferredTokens: ["ET-50kW-31.png", "ET-50kW-1.png"],
    hints: ["et-50kw", "et50"],
  },

  et75_100: {
    name: "GoodWe ET 75–100kW",
    page: "https://en.goodwe.com/et-100kw",
    preferredTokens: ["ET100K-31.png", "ET100K-1.png"],
    hints: ["et100"],
  },

  xsG3: {
    name: "GoodWe XS G3",
    page: "https://en.goodwe.com/xs-g3",
    preferredTokens: ["XS-G3-31.png", "XS-G3-1.png"],
    hints: ["xs-g3", "xsg3"],
  },

  sdtSmall: {
    name: "GoodWe SDT G3 4–30kW",
    page: "https://en.goodwe.com/sdt-g3",
    preferredTokens: ["(Venus)SDTG38-15kW-31.png", "(Venus)SDTG38-15kW-1.png"],
    hints: ["sdtg3", "venus"],
  },

  sdtMedium: {
    name: "GoodWe SDT G3 25–40kW",
    page: "https://en.goodwe.com/sdt-g3-25-40kw",
    preferredTokens: ["SDTG340k-31.png", "SDTG340k-1.png"],
    hints: ["sdtg340", "40k"],
  },

  sdt50: {
    name: "GoodWe SDT G3 30–50kW",
    page: "https://en.goodwe.com/sdt-g3-50kw",
    preferredTokens: ["SDTG350kW-31.png", "SDTG350kW-1.png"],
    hints: ["sdtg350", "50kw"],
  },

  gt100_125: {
    name: "GoodWe GT 100–125kW",
    page: "https://en.goodwe.com/gt-series",
    preferredTokens: ["GT125-31.png", "GT125-1.png"],
    hints: ["gt125", "gt100"],
  },

  gt150: {
    name: "GoodWe GT 150kW",
    page: "https://vn-test.goodwe.com/gt-150kw",
    preferredTokens: ["GT150kW-31.png", "GT150kW-1.png"],
    hints: ["gt150"],
  },

  eoG2: {
    name: "GoodWe EO G2 3–6kW Off-Grid",
    page: "https://en.goodwe.com/eo-g2",
    preferredTokens: ["1000_772_03.png", "20260819-095639.png"],
    hints: ["1000_772", "20260819", "eo"],
  },
};

/**
 * Exact website prefixes from catalog-source.csv.
 *
 * We reuse an official image only when GoodWe itself groups
 * the products into the same product family.
 */
const TARGETS = [
  // --------------------
  // BATTERIES
  // --------------------
  {
    prefix: "goodwe-45-60v",
    family: "lynxA10",
  },

  {
    prefix: "goodwe-goodwe-51-2v-314ah-16kwh-lithium-iron-phosphate-battery",
    family: "lynxA16",
  },

  {
    prefix: "goodwe-goodwe-51-2v-5kwh-lithium-iron-phosphate-battery",
    family: "lynxA5",
  },

  {
    prefix: "goodwe-2-bat-i-g10",
    family: "batS",
  },

  {
    prefix: "goodwe-4-bat-ac-g10",
    family: "batC100",
  },

  // --------------------
  // ET HIGH VOLTAGE
  // --------------------
  {
    prefix: "goodwe-gw100k-et-g10",
    family: "et75_100",
  },

  {
    prefix: "goodwe-gw25k-et-10",
    family: "et25_50",
  },

  {
    prefix: "goodwe-gw50k-et-10",
    family: "et25_50",
  },

  // --------------------
  // GT
  // --------------------
  {
    prefix: "goodwe-gw100k-gt",
    family: "gt100_125",
  },

  {
    prefix: "goodwe-gw125k-gt",
    family: "gt100_125",
  },

  {
    prefix: "goodwe-gw150k-gt-g10",
    family: "gt150",
  },

  // --------------------
  // XS G3
  // --------------------
  {
    prefix: "goodwe-gw1000-xs-30",
    family: "xsG3",
  },

  {
    prefix: "goodwe-gw3000-xs-30",
    family: "xsG3",
  },

  // --------------------
  // ES UNIQ
  // --------------------
  {
    prefix: "goodwe-gw3000-es-c10",
    family: "esUniq",
  },

  {
    prefix: "goodwe-gw5000-es-c10",
    family: "esUniq",
  },

  {
    prefix: "goodwe-gw6000-es-c10",
    family: "esUniq",
  },

  {
    prefix: "goodwe-gw8000-es-c10",
    family: "esUniq",
  },

  {
    prefix: "goodwe-gw10k-es-c10",
    family: "esUniq",
  },

  {
    prefix: "goodwe-gw12k-es-c10",
    family: "esUniq",
  },

  // --------------------
  // ET LV
  // --------------------
  {
    prefix: "goodwe-gw6ket-l-g10",
    family: "etLv",
  },

  {
    prefix: "goodwe-gw8ket-l-g10",
    family: "etLv",
  },

  {
    prefix: "goodwe-gw12k-et-l-g10",
    family: "etLv",
  },

  {
    prefix: "goodwe-gw15ket-l-g10",
    family: "etLv",
  },

  {
    prefix: "goodwe-gw20ket-l-g10",
    family: "etLv",
  },

  // --------------------
  // SDT G3
  // --------------------
  {
    prefix: "goodwe-gw10k-sdt-30",
    family: "sdtSmall",
  },

  {
    prefix: "goodwe-gw20k-sdt-30",
    family: "sdtSmall",
  },

  {
    prefix: "goodwe-gw25k-sdt-c30",
    family: "sdtMedium",
  },

  {
    prefix: "goodwe-gw30k-sdt-c30",
    family: "sdtMedium",
  },

  {
    prefix: "goodwe-gw50k-sdt-c30",
    family: "sdt50",
  },

  // --------------------
  // GENERIC OFF-GRID ROWS
  //
  // Catalog source does not expose an exact GoodWe model.
  // EO G2 is GoodWe's current official 3–6kW off-grid family.
  // These should still receive visual QA.
  // --------------------
  {
    prefix: "goodwe-goodwe-3kw-off-grid-hybrid-inverter",
    family: "eoG2",
  },

  {
    prefix: "goodwe-goodwe-5kw-off-grid-hybrid-inverter",
    family: "eoG2",
  },

  {
    prefix: "goodwe-goodwe-6kw-off-grid-hybrid-inverter",
    family: "eoG2",
  },

  // --------------------
  // IPS DUPLICATE / VAGUE ROWS
  // --------------------
  {
    prefix: "goodwe-goodwe-15-kw-three-phase-48v-hybrid-inverter",
    family: "etLv",
  },

  {
    prefix: "goodwe-goodwe-50kw-three-phase-on-grid-inverter",
    family: "sdt50",
  },

  {
    prefix: "goodwe-goodwe-6kw-single-phase-hybrid-solar-inverter",
    family: "esUniq",
  },

  {
    prefix: "goodwe-goodwe-8kw-single-phase-hybrid-solar-inverter",
    family: "esUniq",
  },
];

const BAD_TERMS = [
  "logo",
  "icon",
  "favicon",
  "flag",
  "certificate",
  "certification",
  "award",
  "badge",
  "ecovadis",
  "member",
  "social",
  "facebook",
  "linkedin",
  "youtube",
  "instagram",
  "wechat",
  "qr",
  "qrcode",
  "banner",
  "news",
  "article",
  "avatar",
  "header",
  "footer",
  "loading",
  "placeholder",
  "default",
  "map",
  "contact",
  "arrow",
  "button",
  "play",
  "close",
  "search",
  "menu",
];

function decodeHtml(value) {
  return String(value ?? "")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function normalizeUrl(raw, pageUrl) {
  if (!raw) return null;

  let value = decodeHtml(raw.trim());

  if (
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
    return new URL(value, pageUrl).href;
  } catch {
    return null;
  }
}

function isImageUrl(url) {
  if (!url) return false;

  const clean = url.split("?")[0].toLowerCase();

  return (
    clean.endsWith(".png") ||
    clean.endsWith(".jpg") ||
    clean.endsWith(".jpeg") ||
    clean.endsWith(".webp")
  );
}

function isBadCandidate(url) {
  const lower = decodeURIComponent(url).toLowerCase();

  return BAD_TERMS.some((term) => lower.includes(term));
}

function getExtensionFromUrl(url) {
  const pathname = new URL(url).pathname.toLowerCase();

  if (pathname.endsWith(".png")) return ".png";
  if (pathname.endsWith(".jpg")) return ".jpg";
  if (pathname.endsWith(".jpeg")) return ".jpg";
  if (pathname.endsWith(".webp")) return ".webp";

  return ".png";
}

function extractImageCandidates(html, pageUrl) {
  const candidates = new Set();

  // src, data-src, data-original, lazyload attributes
  const attributeRegex =
    /(?:src|data-src|data-original|data-lazy-src|data-image|data-url)\s*=\s*["']([^"']+)["']/gi;

  for (const match of html.matchAll(attributeRegex)) {
    const url = normalizeUrl(match[1], pageUrl);

    if (url && isImageUrl(url)) {
      candidates.add(url);
    }
  }

  // Also inspect absolute URLs embedded inside JS / JSON.
  const absoluteRegex =
    /https?:\\?\/\\?\/[^"'<>\\\s]+?\.(?:png|jpe?g|webp)(?:\?[^"'<>\\\s]*)?/gi;

  for (const match of html.matchAll(absoluteRegex)) {
    const cleaned = match[0].replaceAll("\\/", "/");
    const url = normalizeUrl(cleaned, pageUrl);

    if (url && isImageUrl(url)) {
      candidates.add(url);
    }
  }

  return [...candidates];
}

function scoreCandidate(url, family) {
  if (!url || isBadCandidate(url)) {
    return -100000;
  }

  let score = 0;

  const lowerUrl = decodeURIComponent(url).toLowerCase();

  // Strongest signal: exact known official product image filename.
  family.preferredTokens.forEach((token, index) => {
    if (lowerUrl.includes(token.toLowerCase())) {
      score += 10000 - index * 500;
    }
  });

  // Product-family filename hints.
  for (const hint of family.hints ?? []) {
    if (lowerUrl.includes(hint.toLowerCase())) {
      score += 800;
    }
  }

  // Overview images are usually clean isolated product renders.
  if (
    /-31\.(png|jpg|jpeg|webp)/i.test(lowerUrl) ||
    /_31\.(png|jpg|jpeg|webp)/i.test(lowerUrl)
  ) {
    score += 500;
  }

  // Main product hero.
  if (
    /-1\.(png|jpg|jpeg|webp)/i.test(lowerUrl) ||
    /_1\.(png|jpg|jpeg|webp)/i.test(lowerUrl)
  ) {
    score += 250;
  }

  if (lowerUrl.endsWith(".png")) {
    score += 80;
  }

  if (lowerUrl.endsWith(".webp")) {
    score += 60;
  }

  return score;
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/157 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(
      `Page request failed: ${response.status} ${response.statusText}`,
    );
  }

  return await response.text();
}

async function downloadBuffer(url, referer) {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/157 Safari/537.36",
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      Referer: referer,
    },
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(
      `Image request failed: ${response.status} ${response.statusText}`,
    );
  }

  const contentType = (
    response.headers.get("content-type") ?? ""
  ).toLowerCase();

  if (!contentType.startsWith("image/")) {
    throw new Error(`Rejected non-image response: ${contentType || "unknown"}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (buffer.length < 10000) {
    throw new Error(
      `Rejected suspiciously small image: ${buffer.length} bytes`,
    );
  }

  return buffer;
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function removeExistingPrefix(prefix) {
  const files = await fs.readdir(OUTPUT_DIR);

  const validExtensions = [".png", ".jpg", ".jpeg", ".webp"];

  for (const file of files) {
    const extension = path.extname(file).toLowerCase();
    const basename = path.basename(file, extension);

    if (
      validExtensions.includes(extension) &&
      basename.toLowerCase() === prefix.toLowerCase()
    ) {
      await fs.rm(path.join(OUTPUT_DIR, file), {
        force: true,
      });
    }
  }
}

async function resolveFamilyImage(familyKey) {
  const family = FAMILIES[familyKey];

  if (!family) {
    throw new Error(`Unknown family: ${familyKey}`);
  }

  console.log("");
  console.log(`Fetching family: ${family.name}`);
  console.log(`Source: ${family.page}`);

  const html = await fetchHtml(family.page);
  const candidates = extractImageCandidates(html, family.page);

  const ranked = candidates
    .map((url) => ({
      url,
      score: scoreCandidate(url, family),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (!ranked.length) {
    console.log("Top raw candidates:");
    console.log(candidates.slice(0, 20).join("\n"));

    throw new Error(
      `No safe GoodWe product image candidate found for ${family.name}`,
    );
  }

  console.log("Selected:");
  console.log(ranked[0].url);
  console.log(`Score: ${ranked[0].score}`);

  return ranked[0].url;
}

async function main() {
  console.log("");
  console.log("GoodWe official image sync");
  console.log("==========================");
  console.log(`Project: ${PROJECT_ROOT}`);
  console.log(`Output:  ${OUTPUT_DIR}`);
  console.log(`Force:   ${FORCE ? "YES" : "NO"}`);
  console.log("");

  await fs.mkdir(OUTPUT_DIR, {
    recursive: true,
  });

  const familyCache = new Map();
  const imageCache = new Map();

  let completed = 0;
  let skipped = 0;
  let failed = 0;

  const failures = [];

  for (const target of TARGETS) {
    try {
      const family = FAMILIES[target.family];

      if (!family) {
        throw new Error(`Family not found: ${target.family}`);
      }

      // If a correctly named image already exists and --force
      // was not supplied, leave it untouched.
      const existingFiles = await fs.readdir(OUTPUT_DIR);

      const existing = existingFiles.find((file) => {
        const extension = path.extname(file).toLowerCase();

        if (![".png", ".jpg", ".jpeg", ".webp"].includes(extension)) {
          return false;
        }

        return (
          path.basename(file, extension).toLowerCase() ===
          target.prefix.toLowerCase()
        );
      });

      if (existing && !FORCE) {
        console.log(`SKIP ${target.prefix} -> ${existing}`);
        skipped += 1;
        continue;
      }

      let imageUrl = familyCache.get(target.family);

      if (!imageUrl) {
        imageUrl = await resolveFamilyImage(target.family);

        familyCache.set(target.family, imageUrl);
      }

      let buffer = imageCache.get(imageUrl);

      if (!buffer) {
        buffer = await downloadBuffer(imageUrl, family.page);

        imageCache.set(imageUrl, buffer);
      }

      const extension = getExtensionFromUrl(imageUrl);

      await removeExistingPrefix(target.prefix);

      const destination = path.join(OUTPUT_DIR, `${target.prefix}${extension}`);

      await fs.writeFile(destination, buffer);

      console.log(`OK   ${target.prefix}${extension} (${buffer.length} bytes)`);

      completed += 1;
    } catch (error) {
      failed += 1;

      failures.push({
        prefix: target.prefix,
        family: target.family,
        error: error instanceof Error ? error.message : String(error),
      });

      console.error(`FAIL ${target.prefix}`);

      console.error(error instanceof Error ? error.message : error);
    }
  }

  console.log("");
  console.log("==========================");
  console.log("GoodWe sync finished");
  console.log("==========================");

  console.log(`Completed: ${completed}/${TARGETS.length}`);

  console.log(`Skipped:   ${skipped}`);

  console.log(`Failed:    ${failed}`);

  if (failures.length) {
    console.log("");
    console.log("Failures:");

    for (const item of failures) {
      console.log(`- ${item.prefix} [${item.family}]`);

      console.log(`  ${item.error}`);
    }
  }

  console.log("");
  console.log(
    "IMPORTANT: visually inspect all downloaded GoodWe images before regenerating the catalog.",
  );

  console.log(
    "Do NOT run sync-external-products.mjs until the downloaded images look correct.",
  );

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("");
  console.error("Fatal error:");
  console.error(error);
  process.exitCode = 1;
});
