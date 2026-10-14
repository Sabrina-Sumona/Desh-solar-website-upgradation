#!/usr/bin/env node

/**
 * Desh Solar external catalogue importer
 *
 * Sources:
 *   - https://ipsbazarbd.com/
 *   - https://solar.com.bd/
 *
 * Customer-facing rules:
 *   1. Never show source-store names in product titles.
 *   2. Use the lowest valid price found across matched source listings.
 *   3. Never use competitor/source-site images on the production storefront.
 *   4. Production images come only from public/assets/products/.
 *   5. If no approved local image exists, use a clean Desh Solar placeholder.
 *   6. Normalize noisy/invalid source brand labels before generating products.
 *
 * Source-site images are optional INTERNAL REFERENCE ONLY. If
 * DOWNLOAD_SOURCE_IMAGES=0, they are not downloaded and the reference folder
 * is not recreated when it has been deleted.
 */

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { load } from "cheerio";

const ROOT = process.cwd();

const OUTPUT_TS = path.join(
  ROOT,
  "src",
  "data",
  "external-products.generated.ts"
);

const BASE_PRODUCTS = path.join(
  ROOT,
  "src",
  "data",
  "products.base.ts"
);

const REPORT_DIR = path.join(ROOT, "migration-output");

/**
 * Approved/licensed/Desh Solar production images only.
 */
const APPROVED_IMAGE_DIR = path.join(
  ROOT,
  "public",
  "assets",
  "products"
);

/**
 * Optional source-site reference images. Never customer-facing.
 */
const REFERENCE_IMAGE_DIR = path.join(
  ROOT,
  "public",
  "assets",
  "products-imported-reference"
);

const APPROVED_PLACEHOLDER_PUBLIC_PATH =
  "/assets/products/product-placeholder.svg";

const MAX_GALLERY_IMAGES = Number(
  process.env.MAX_GALLERY_IMAGES || 4
);

const DOWNLOAD_REFERENCE_IMAGES =
  process.env.DOWNLOAD_SOURCE_IMAGES !== "0";

const REQUEST_DELAY_MS = Number(
  process.env.IMPORT_DELAY_MS || 180
);

const MAX_PRODUCTS = Number(
  process.env.MAX_PRODUCTS || 0
);

const SOURCES = [
  {
    key: "ipsbazarbd.com",
    origin: "https://ipsbazarbd.com",
    shop: "https://ipsbazarbd.com/shop/",
    page: (n) =>
      n === 1
        ? "https://ipsbazarbd.com/shop/"
        : `https://ipsbazarbd.com/shop/page/${n}/`,
  },
  {
    key: "solar.com.bd",
    origin: "https://solar.com.bd",
    shop: "https://solar.com.bd/",
    page: (n) =>
      n === 1
        ? "https://solar.com.bd/"
        : `https://solar.com.bd/page/${n}/`,
  },
];

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
  "AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Chrome/155.0 Safari/537.36 DeshSolarCatalogAudit/1.0";

const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".gif",
]);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options = {}, attempts = 3) {
  let lastError;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        ...options,
        headers: {
          "user-agent": USER_AGENT,
          "accept-language": "en-US,en;q=0.9,bn;q=0.7",
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          ...(options.headers || {}),
        },
      });

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      return response;
    } catch (error) {
      lastError = error;
      await sleep(450 * (attempt + 1));
    }
  }

  throw new Error(
    `Failed ${url}: ${lastError?.message || String(lastError)}`
  );
}

async function fetchText(url) {
  const response = await fetchWithRetry(url);
  return response.text();
}

function decodeHtml(text = "") {
  const $ = load(`<div>${text}</div>`);
  return $("div").text().replace(/\s+/g, " ").trim();
}

/**
 * Remove source-store branding and obvious store-only title suffixes.
 * Standalone "IPS" stays because IPS is also a valid product type.
 */
function cleanSourceBranding(value = "") {
  const original = decodeHtml(String(value));

  if (!original) {
    return original;
  }

  const cleaned = original
    .replace(/\bips\s*bazar\s*bd\b/gi, " ")
    .replace(/\bips\s*bazar\b/gi, " ")
    .replace(/\bipsbazarbd(?:\.com)?\b/gi, " ")
    .replace(/\bsolar\s*\.\s*com\s*\.\s*bd\b/gi, " ")
    .replace(/\bsolar\s+com\s+bd\b/gi, " ")
    .replace(/\bsolarbd\b/gi, " ")
    .replace(/\s*[-–—|:]\s*solar\s*bd\s*$/gi, "")
    .replace(/\s*[»›]+\s*$/g, "")
    .replace(/\(\s*\)|\[\s*\]/g, " ")
    .replace(/\s*[-–—|:]+\s*$/g, "")
    .replace(/^\s*[-–—|:]+\s*/g, "")
    .replace(/\s+([,;])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();

  return cleaned || original;
}

function normalizeUrl(value, base) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value, base);
    url.hash = "";
    return url.href;
  } catch {
    return null;
  }
}

function normalizeText(value = "") {
  return decodeHtml(String(value))
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\b(lifepo4|lithium-ion|lithium ion)\b/g, "lithium")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function slugify(value = "") {
  return (
    normalizeText(value)
      .replace(/\s+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 96) || "product"
  );
}

function shortHash(value) {
  return crypto
    .createHash("sha1")
    .update(value)
    .digest("hex")
    .slice(0, 8);
}

function safeArray(value) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function walkJson(value, visitor) {
  if (!value || typeof value !== "object") {
    return;
  }

  visitor(value);

  if (Array.isArray(value)) {
    value.forEach((item) => walkJson(item, visitor));
    return;
  }

  Object.values(value).forEach((item) => walkJson(item, visitor));
}

function findJsonLdProduct($) {
  const candidates = [];

  $('script[type="application/ld+json"]').each((_, element) => {
    const raw = $(element).text().trim();

    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw);

      walkJson(parsed, (node) => {
        const type = safeArray(node?.["@type"]).map(String);

        if (
          type.some((item) => item.toLowerCase() === "product")
        ) {
          candidates.push(node);
        }
      });
    } catch {
      // DOM extraction remains available.
    }
  });

  return candidates[0] || null;
}

function xmlLocs(xml) {
  const $ = load(xml, { xmlMode: true });

  return $("loc")
    .map((_, element) => $(element).text().trim())
    .get()
    .filter(Boolean);
}

async function discoverFromSitemaps(source) {
  const seeds = [
    `${source.origin}/wp-sitemap.xml`,
    `${source.origin}/sitemap_index.xml`,
    `${source.origin}/product-sitemap.xml`,
    `${source.origin}/product-sitemap1.xml`,
    `${source.origin}/wp-sitemap-posts-product-1.xml`,
  ];

  const seenSitemaps = new Set();
  const productUrls = new Set();

  async function visit(sitemapUrl, depth = 0) {
    if (depth > 2 || seenSitemaps.has(sitemapUrl)) {
      return;
    }

    seenSitemaps.add(sitemapUrl);

    try {
      const xml = await fetchText(sitemapUrl);
      const locs = xmlLocs(xml);

      for (const loc of locs) {
        const normalized = normalizeUrl(loc, source.origin);

        if (!normalized) {
          continue;
        }

        const pathname = new URL(normalized).pathname;

        if (/\/product\/[^/]+\/?$/i.test(pathname)) {
          productUrls.add(normalized);
        } else if (
          /\.xml(?:$|\?)/i.test(normalized) &&
          /product|post|sitemap/i.test(normalized)
        ) {
          await visit(normalized, depth + 1);
        }
      }
    } catch {
      // Not all sitemap variants exist on every site.
    }
  }

  for (const seed of seeds) {
    await visit(seed);

    if (productUrls.size > 20) {
      break;
    }
  }

  return productUrls;
}

function productLinksFromHtml(html, base) {
  const $ = load(html);
  const urls = new Set();

  $('a[href*="/product/"]').each((_, element) => {
    const href = normalizeUrl($(element).attr("href"), base);

    if (!href) {
      return;
    }

    const pathname = new URL(href).pathname;

    if (/\/product\/[^/]+\/?$/i.test(pathname)) {
      urls.add(href);
    }
  });

  return urls;
}

async function discoverFromPagination(source) {
  const all = new Set();
  let emptyPages = 0;

  for (let page = 1; page <= 60; page += 1) {
    const url = source.page(page);

    try {
      const html = await fetchText(url);
      const pageLinks = productLinksFromHtml(html, source.origin);

      if (pageLinks.size === 0) {
        emptyPages += 1;

        if (emptyPages >= 2) {
          break;
        }
      } else {
        emptyPages = 0;
        pageLinks.forEach((item) => all.add(item));
      }

      process.stdout.write(
        `\r${source.key}: discovered ${all.size} product URLs (page ${page})   `
      );

      await sleep(REQUEST_DELAY_MS);
    } catch (error) {
      if (page > 1) {
        break;
      }

      console.warn(
        `\nPagination discovery warning (${source.key}): ${error.message}`
      );
    }
  }

  process.stdout.write("\n");

  return all;
}

async function discoverProducts(source) {
  console.log(`\nDiscovering ${source.key} ...`);

  const sitemap = await discoverFromSitemaps(source);

  if (sitemap.size >= 20) {
    console.log(`${source.key}: ${sitemap.size} URLs from sitemap.`);
    return sitemap;
  }

  console.log(
    `${source.key}: sitemap incomplete (${sitemap.size}); using pagination fallback.`
  );

  const pages = await discoverFromPagination(source);
  pages.forEach((url) => sitemap.add(url));

  return sitemap;
}

/**
 * Canonical brand aliases.
 * Specific patterns should appear before broader ones.
 */
const BRAND_ALIASES = [
  { canonical: "DYE Artisans", patterns: [/\bdye\s+artisans?\b/i] },
  { canonical: "EVE", patterns: [/\beve\b/i] },
  { canonical: "True Power", patterns: [/\btrue\s+power\b/i] },
  { canonical: "Crown Micro", patterns: [/\bcrown\s+micro\b/i] },

  {
    canonical: "Jinko Solar",
    patterns: [
      /\bjinko\s*solar\b/i,
      /\bjinkosolar\b/i,
      /\bjinko\b/i,
    ],
  },

  {
    canonical: "JA Solar",
    patterns: [/\bja\s+solar\b/i],
  },

  {
    canonical: "Su-vastika",
    patterns: [
      /\bsu[\s-]*vastika\b/i,
      /\bsuvastika\b/i,
    ],
  },

  { canonical: "GoodWe", patterns: [/\bgoodwe\b/i] },
  { canonical: "Ecolith", patterns: [/\becolith\b/i] },

  {
    canonical: "LiWATT",
    patterns: [
      /\bliwatt\b/i,
      /\bli[\s-]*watt\b/i,
    ],
  },

  { canonical: "Saif Power", patterns: [/\bsaif\s+power\b/i] },
  { canonical: "Rahimafrooz", patterns: [/\brahimafrooz\b/i] },
  { canonical: "Eastern", patterns: [/\beastern\b/i] },
  { canonical: "Rimso", patterns: [/\brimso\b/i] },
  { canonical: "Deye", patterns: [/\bdeye\b/i] },
  { canonical: "Solis", patterns: [/\bsolis\b/i] },
  { canonical: "SAKO", patterns: [/\bsako\b/i] },
  { canonical: "LVTOPSUN", patterns: [/\blvtopsun\b/i] },
  { canonical: "Growatt", patterns: [/\bgrowatt\b/i] },
  { canonical: "TOMZN", patterns: [/\btomzn\b/i] },
  { canonical: "M-Driver", patterns: [/\bm[\s-]*driver\b/i] },
  { canonical: "SUNSHINE", patterns: [/\bsunshine\b/i] },
  { canonical: "EcoFlow", patterns: [/\becoflow\b/i] },
  { canonical: "REC", patterns: [/\brec\b/i] },
  { canonical: "LONGi", patterns: [/\blongi\b/i] },
  { canonical: "INGCO", patterns: [/\bingco\b/i] },
  { canonical: "Smarten", patterns: [/\bsmarten\b/i] },
  { canonical: "GENIXGREEN", patterns: [/\bgenixgreen\b/i] },
  { canonical: "SavX", patterns: [/\bsavx\b/i] },
  { canonical: "Hithium", patterns: [/\bhithium\b/i] },
  { canonical: "Hinvert", patterns: [/\bhinvert\b/i] },
  { canonical: "TOTAL", patterns: [/\btotal\b/i] },
  { canonical: "DEMUDA", patterns: [/\bdemuda\b/i] },
  { canonical: "DJDC", patterns: [/\bdjdc\b/i] },
  { canonical: "SRNE", patterns: [/\bsrne\b/i] },
  { canonical: "Exide", patterns: [/\bexide\b/i] },
  { canonical: "PowMr", patterns: [/\bpowmr\b/i] },
  { canonical: "AKAIYAI", patterns: [/\bakaiyai\b/i] },
  { canonical: "LUXWATT", patterns: [/\bluxwatt\b/i] },
  { canonical: "AIKO", patterns: [/\baiko\b/i] },
  { canonical: "Bluetti", patterns: [/\bbluetti\b/i] },
  { canonical: "KSTAR", patterns: [/\bkstar\b/i] },
  { canonical: "AE Solar", patterns: [/\bae\s+solar\b/i] },
  { canonical: "SUNON", patterns: [/\bsunon\b/i] },
  { canonical: "Luminous", patterns: [/\bluminous\b/i] },
  { canonical: "Li-Max", patterns: [/\bli[\s-]*max\b/i] },
  { canonical: "Secure", patterns: [/\bsecure\b/i] },

  {
    canonical: "Sukam",
    patterns: [
      /\bsu[\s-]*kam\b/i,
      /\bsukam\b/i,
    ],
  },

  { canonical: "LEADER", patterns: [/\bleader\b/i] },
  { canonical: "Vestwood", patterns: [/\bvestwoods?\b/i] },
  { canonical: "Trina", patterns: [/\btrina\b/i] },
  { canonical: "Lesso", patterns: [/\blesso\b/i] },
  { canonical: "IFADA", patterns: [/\bifada\b/i] },
  { canonical: "UTL", patterns: [/\butl\b/i] },
  { canonical: "Huawei", patterns: [/\bhuawei\b/i] },
  { canonical: "SOSEN", patterns: [/\bsosen\b/i] },
  { canonical: "Microtek", patterns: [/\bmicrotek\b/i] },
  { canonical: "JK", patterns: [/\bjk\s+bms\b/i] },

  // Keep Crown after Crown Micro.
  { canonical: "Crown", patterns: [/\bcrown\b/i] },
];

const INVALID_BRAND_VALUES = new Set(
  [
    "brands",
    "brand",
    "solar",
    "heavy",
    "heavy-duty",
    "heavy duty",
    "mono",
    "lithium",
    "wifi",
    "original",
    "xt60i",
    "dual",
    "single",
    "electric",
    "true",
    "general",
    "dc",
    "ac",
    "safty",
    "safety",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "100",
    "1500w",
    "3000w",
  ].map((value) => value.toLowerCase())
);

function normalizeBrandCandidate(value = "") {
  const cleaned = cleanSourceBranding(
    decodeHtml(String(value))
  )
    .replace(/[»|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return "";
  }

  const lower = cleaned.toLowerCase();

  if (INVALID_BRAND_VALUES.has(lower)) {
    return "";
  }

  /**
   * Reject specification values accidentally exposed as brands.
   */
  if (
    /^\d+(?:\.\d+)?\s*(?:w|kw|wh|kwh|v|a|ah|va|kva|mm|mm2|mm²|hp)?$/i.test(
      cleaned
    )
  ) {
    return "";
  }

  return cleaned;
}

function inferCanonicalBrandFromText(value = "") {
  const text = decodeHtml(String(value));

  for (const brand of BRAND_ALIASES) {
    if (
      brand.patterns.some((pattern) =>
        pattern.test(text)
      )
    ) {
      return brand.canonical;
    }
  }

  return "";
}

function canonicalizeBrand(
  candidate,
  title,
  breadcrumb = ""
) {
  const cleanCandidate =
    normalizeBrandCandidate(candidate);

  /**
   * Prefer title/breadcrumb evidence.
   * This fixes source labels like Brands, 4, Heavy, Solar, etc.
   */
  const inferredFromProduct =
    inferCanonicalBrandFromText(
      `${title} ${breadcrumb}`
    );

  if (inferredFromProduct) {
    return inferredFromProduct;
  }

  if (!cleanCandidate) {
    return "Other";
  }

  const canonicalCandidate =
    inferCanonicalBrandFromText(
      cleanCandidate
    );

  if (canonicalCandidate) {
    return canonicalCandidate;
  }

  /**
   * Preserve unknown but plausible manufacturer names.
   */
  return cleanCandidate;
}

function getBrand(
  productLd,
  title,
  $,
  breadcrumb
) {
  const ldBrand =
    productLd?.brand;

  const candidate =
    (
      typeof ldBrand === "string"
        ? ldBrand
        : ldBrand?.name
    ) ||
    productLd?.manufacturer?.name ||
    $('[itemprop="brand"]')
      .first()
      .text()
      .trim() ||
    $(
      ".product-brand, .brand, .wd-product-brands"
    )
      .first()
      .text()
      .trim() ||
    "";

  return canonicalizeBrand(
    candidate,
    title,
    breadcrumb
  );
}

function extractModel(
  productLd,
  title
) {
  /**
   * Some source sites expose shortened or incorrect SKU / MPN values.
   *
   * For known product families where the title contains a clearly more
   * complete model, prefer the exact model written in the title.
   *
   * Examples:
   *
   * ARCEUS-3      -> ARCEUS-3.6KW
   * NOVA-9        -> NOVA-9.8KW
   * 5KW-PF1       -> X-1.5KW-PF1
   * blank/partial -> XAVIER-II-5.6KW
   * VOLTMORE-*    -> VMGI-*
   */

  /**
   * Handles:
   *   Xavier-II 5.6KW
   *   XAVIER-II-3.6KW
   *
   * Normalized output:
   *   XAVIER-II-5.6KW
   */
  const xavierSpaced =
    title.match(
      /\bXAVIER-II[\s-]+(\d+(?:\.\d+)?KW)\b/i
    );

  if (
    xavierSpaced?.[1]
  ) {
    return `XAVIER-II-${xavierSpaced[1].toUpperCase()}`;
  }

  const preferredTitlePatterns = [
    /**
     * VOLTMORE may appear before VMGI in the title.
     * We intentionally keep only the actual VMGI model.
     *
     * Examples:
     * VMGI-1KW-SP
     * VMGI-3.6KW-SP
     * VMGI-25KW
     * VMGI-350KW-1
     */
    /\bVMGI-\d+(?:\.\d+)?KW(?:-(?:SP|\d+))?\b/i,

    /**
     * Crown Micro off-grid families.
     */
    /\bARCEUS-\d+(?:\.\d+)?KW\b/i,
    /\bELEGO-VI-\d+(?:\.\d+)?KW\b/i,
    /\bNOVA-\d+(?:\.\d+)?KW\b/i,
    /\bXAVIER-II-\d+(?:\.\d+)?KW\b/i,
    /\bX-\d+(?:\.\d+)?KW-PF1\b/i,
  ];

  for (
    const pattern of
    preferredTitlePatterns
  ) {
    const match =
      title.match(pattern);

    if (
      match?.[0]
    ) {
      return match[0].toUpperCase();
    }
  }

  /**
   * For all other products, keep a good structured MPN/model/SKU.
   */
  const direct =
    productLd?.mpn ||
    productLd?.model ||
    productLd?.sku;

  if (
    direct &&
    String(direct).trim() &&
    !/^\d{1,5}$/.test(
      String(direct).trim()
    )
  ) {
    return decodeHtml(
      String(direct)
    ).trim();
  }

  /**
   * Generic title fallback.
   *
   * Supports model-like tokens such as:
   * JKM620N-66HL4M-BDV
   * SUN-6K-SG03LP1
   * SPF-6000-ES
   */
  const tokens =
    title.match(
      /\b(?=[A-Z0-9.-]{4,}\b)(?=[A-Z0-9.-]*[A-Z])(?=[A-Z0-9.-]*\d)[A-Z0-9]+(?:-[A-Z0-9.]+)+\b/gi
    );

  return (
    tokens?.[0] ||
    ""
  );
}

function classify(
  title,
  breadcrumb,
  categoryText
) {
  const text =
    normalizeText(
      `${title} ${breadcrumb} ${categoryText}`
    );

  /**
   * 1. COMPLETE SYSTEM / PACKAGE
   *
   * Package detection must stay first because package titles may contain
   * battery, inverter, panel, cable, UPS or IPS.
   */
  if (
    /combo package|complete solar|solar system|pump package|full solar combo|ips combo package|solar combo/.test(
      text
    )
  ) {
    return {
      category:
        "system",

      label:
        "Complete System",

      subcategory:
        /pump/.test(text)
          ? "Solar Pump Package"
          : "Solar Package",
    };
  }

  /**
   * 2. PORTABLE POWER
   */
  if (
    /portable power station|portable ups power/.test(
      text
    )
  ) {
    return {
      category:
        "portable",

      label:
        "Portable Power",

      subcategory:
        "Portable Power Station",
    };
  }

  /**
   * 3. COMPONENTS / ACCESSORIES
   *
   * These intentionally run before battery/panel detection.
   */

  if (
    /\bmc4\b|solar connector|pv connector/.test(
      text
    )
  ) {
    return {
      category:
        "component",

      label:
        "Components & Protection",

      subcategory:
        "Connector",
    };
  }

  if (
    /dc cable|dc wire|solar cable|battery cable|flexible battery cable|pv cable|power cable/.test(
      text
    )
  ) {
    return {
      category:
        "component",

      label:
        "Components & Protection",

      subcategory:
        "DC Cable",
    };
  }

  if (
    /ac cable|ac wire/.test(
      text
    )
  ) {
    return {
      category:
        "component",

      label:
        "Components & Protection",

      subcategory:
        "AC Cable",
    };
  }

  if (
    /solar roof mounting|solar panel mounting|mounting kit|mounting structure|mounting rail|l foot|l-foot|roof clamp|mid clamp|end clamp|solar clamp/.test(
      text
    )
  ) {
    return {
      category:
        "component",

      label:
        "Components & Protection",

      subcategory:
        "Mounting Structure",
    };
  }

  if (
    /solar street light|street light|solar light|solar flood light/.test(
      text
    )
  ) {
    return {
      category:
        "component",

      label:
        "Components & Protection",

      subcategory:
        "Solar Lighting",
    };
  }

  if (
    !/\binverter\b/.test(text) &&
    (
      /charge controller/.test(
        text
      ) ||
      /\bpwm controller\b/.test(
        text
      ) ||
      /\bmppt controller\b/.test(
        text
      ) ||
      /\bsolar controller\b/.test(
        text
      )
    )
  ) {
    return {
      category:
        "component",

      label:
        "Components & Protection",

      subcategory:
        "Charge Controller",
    };
  }

  if (
    /\bmccb\b/.test(
      text
    )
  ) {
    return {
      category:
        "component",

      label:
        "Components & Protection",

      subcategory:
        /\bdc\b/.test(
          text
        )
          ? "DC MCCB"
          : "AC MCCB",
    };
  }

  if (
    /\bmcb\b/.test(
      text
    )
  ) {
    return {
      category:
        "component",

      label:
        "Components & Protection",

      subcategory:
        /\bdc\b/.test(
          text
        )
          ? "DC MCB"
          : "AC MCB",
    };
  }

  if (
    /circuit breaker/.test(
      text
    )
  ) {
    return {
      category:
        "component",

      label:
        "Components & Protection",

      subcategory:
        /\bdc\b/.test(
          text
        )
          ? "DC Circuit Breaker"
          : "AC Circuit Breaker",
    };
  }

  if (
    /\bspd\b|surge protection|surge protector/.test(
      text
    )
  ) {
    return {
      category:
        "component",

      label:
        "Components & Protection",

      subcategory:
        /\bdc\b/.test(
          text
        )
          ? "DC SPD"
          : "AC SPD",
    };
  }

  if (
    /fuse holder/.test(
      text
    )
  ) {
    return {
      category:
        "component",

      label:
        "Components & Protection",

      subcategory:
        "Fuse Holder",
    };
  }

  if (
    /\bfuse\b/.test(
      text
    )
  ) {
    return {
      category:
        "component",

      label:
        "Components & Protection",

      subcategory:
        /\bac\b/.test(
          text
        )
          ? "AC Fuse"
          : "DC Fuse",
    };
  }

  if (
    /va protector|voltage protector|voltage protection|current protector|current protection|over voltage protection|under voltage protection/.test(
      text
    )
  ) {
    return {
      category:
        "component",

      label:
        "Components & Protection",

      subcategory:
        "VA / Voltage Protector",
    };
  }

  if (
    /\bats\b|automatic transfer switch|dual power automatic transfer switch/.test(
      text
    )
  ) {
    return {
      category:
        "component",

      label:
        "Components & Protection",

      subcategory:
        "ATS",
    };
  }

  if (
    /\bavr\b|voltage stabilizer|automatic voltage regulator/.test(
      text
    )
  ) {
    return {
      category:
        "component",

      label:
        "Components & Protection",

      subcategory:
        "AVR / Voltage Stabilizer",
    };
  }

  if (
    /lightning arrester|lightning arrestor|lightning protection/.test(
      text
    )
  ) {
    return {
      category:
        "component",

      label:
        "Components & Protection",

      subcategory:
        "Lightning Protection",
    };
  }

  if (
    /cable casing|cable tray|electric cable casing|electrical casing/.test(
      text
    )
  ) {
    return {
      category:
        "component",

      label:
        "Components & Protection",

      subcategory:
        "Cable Management",
    };
  }

  if (
    /solar tool|crimping tool|crimper|spanner|nut screw bit|drill bit|socket for drill/.test(
      text
    )
  ) {
    return {
      category:
        "component",

      label:
        "Components & Protection",

      subcategory:
        "Solar Tools",
    };
  }

  /**
   * 4. IPS / UPS
   */
  if (
    /home ips|solar ips|home ups|online ups|\bips\b|\bups\b/.test(
      text
    ) &&
    !/portable/.test(
      text
    )
  ) {
    return {
      category:
        "ips",

      label:
        "IPS / UPS",

      subcategory:
        /solar ips/.test(
          text
        )
          ? "Solar IPS"
          : /online ups/.test(
              text
            )
            ? "Online UPS"
            : /\bups\b/.test(
                text
              )
              ? "UPS"
              : "Home IPS",
    };
  }

  /**
   * 5. SOLAR PANEL
   */
  if (
    /solar panel|photovoltaic|\bpv panel\b|bifacial.*panel/.test(
      text
    )
  ) {
    return {
      category:
        "panel",

      label:
        "Solar Panel",

      subcategory:
        /bifacial/.test(
          text
        )
          ? "Bifacial Solar Panel"
          : /portable/.test(
              text
            )
            ? "Portable Solar Panel"
            : "Solar Panel",
    };
  }

  /**
   * 6. BATTERY
   */
  if (
    /battery|lifepo4|lead acid|tubular/.test(
      text
    )
  ) {
    const subcategory =
      /tubular/.test(
        text
      )
        ? "Tubular Battery"
        : /lead acid/.test(
            text
          )
          ? "Lead Acid Battery"
          : /lithium|lifepo4/.test(
              text
            )
            ? "Lithium Battery"
            : "Battery";

    return {
      category:
        "battery",

      label:
        "Battery",

      subcategory,
    };
  }

  /**
   * 7. INVERTER
   */
  if (
    /inverter/.test(
      text
    )
  ) {
    const subcategory =
      /on grid hybrid|on-grid hybrid/.test(
        text
      )
        ? "On-Grid Hybrid Inverter"
        : /off grid hybrid|off-grid hybrid/.test(
            text
          )
          ? "Off-Grid Hybrid Inverter"
          : /hybrid/.test(
              text
            )
            ? "Hybrid Solar Inverter"
            : /off grid|off-grid/.test(
                text
              )
              ? "Off-Grid Inverter"
              : /on grid|on-grid/.test(
                  text
                )
                ? "On-Grid Inverter"
                : "Solar Inverter";

    return {
      category:
        "inverter",

      label:
        "Solar Inverter",

      subcategory,
    };
  }

  /**
   * 8. FALLBACK COMPONENT
   */
  return {
    category:
      "component",

    label:
      "Components & Protection",

    subcategory:
      "Solar Accessory",
  };
}

function extractPower(title) {
  const matches = [];

  const regex =
    /\b(\d+(?:\.\d+)?)\s*(kW|W|kWh|Wh|kVA|VA|V|Ah|A|HP)\b/gi;

  for (
    const match of
    title.matchAll(regex)
  ) {
    const normalized =
      `${match[1]}${match[2]}`;

    if (
      !matches.some(
        (item) =>
          item.toLowerCase() ===
          normalized.toLowerCase()
      )
    ) {
      matches.push(
        normalized
      );
    }

    if (
      matches.length >= 3
    ) {
      break;
    }
  }

  return matches.length
    ? matches.join(" / ")
    : "See exact model specification";
}

function bestFor(
  classification
) {
  switch (
    classification.category
  ) {
    case "panel":
      return [
        classification.subcategory,
        "PV Generation",
        "Solar Projects",
      ];

    case "inverter":
      return [
        classification.subcategory,
        "Solar Conversion",
        "System Integration",
      ];

    case "battery":
      return [
        classification.subcategory,
        "Energy Storage",
        "Backup",
      ];

    case "ips":
      return [
        classification.subcategory,
        "Home / Office Backup",
        "Power Continuity",
      ];

    case "portable":
      return [
        "Portable Backup",
        "Outdoor / Emergency",
        "Mobile Power",
      ];

    case "system":
      return [
        classification.subcategory,
        "Complete Solution",
        "System Planning",
      ];

    default:
      return [
        classification.subcategory,
        "Solar Installation",
        "Balance of System",
      ];
  }
}

function appsFor(
  classification
) {
  switch (
    classification.category
  ) {
    case "portable":
      return [
        "home",
        "backup",
        "portable",
      ];

    case "system":
      return [
        "home",
        "business",
        "industrial",
      ];

    case "component":
      return [
        "home",
        "business",
        "industrial",
      ];

    case "ips":
      return [
        "home",
        "business",
        "backup",
      ];

    default:
      return [
        "home",
        "business",
        "industrial",
      ];
  }
}

function roleFor(category) {
  return (
    {
      panel:
        "Generation",

      inverter:
        "Conversion + Control",

      battery:
        "Storage",

      ips:
        "Backup Conversion + Control",

      portable:
        "Portable Storage",

      component:
        "Balance of System",

      system:
        "Complete Solar System",
    }[category] ||
    "Solar Equipment"
  );
}

/**
 * Source-site images are only internal reference.
 */
function collectReferenceImageUrls(
  productLd,
  $,
  base
) {
  const list = [];

  const add = (
    value
  ) => {
    if (!value) {
      return;
    }

    if (
      typeof value ===
      "object"
    ) {
      value =
        value.url ||
        value.contentUrl;
    }

    const normalized =
      normalizeUrl(
        String(value),
        base
      );

    if (
      !normalized ||
      normalized.startsWith(
        "data:"
      )
    ) {
      return;
    }

    if (
      !list.includes(
        normalized
      )
    ) {
      list.push(
        normalized
      );
    }
  };

  safeArray(
    productLd?.image
  ).forEach(add);

  add(
    $(
      'meta[property="og:image"]'
    ).attr(
      "content"
    )
  );

  add(
    $(
      'meta[name="twitter:image"]'
    ).attr(
      "content"
    )
  );

  $(
    ".woocommerce-product-gallery img, .product-images img, .wd-carousel-item img"
  ).each(
    (
      _,
      element
    ) => {
      add(
        $(element).attr(
          "data-large_image"
        )
      );

      add(
        $(element).attr(
          "data-src"
        )
      );

      add(
        $(element).attr(
          "src"
        )
      );
    }
  );

  return list.slice(
    0,
    MAX_GALLERY_IMAGES
  );
}

function parseMoneyNumber(
  value
) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const normalized =
    String(value)
      .replace(
        /,/g,
        ""
      )
      .replace(
        /[^0-9.]/g,
        ""
      )
      .trim();

  if (!normalized) {
    return null;
  }

  const number =
    Number(
      normalized
    );

  return (
    Number.isFinite(
      number
    ) &&
    number >= 100
  )
    ? number
    : null;
}

function priceTextFromLd(
  productLd,
  $
) {
  const offers =
    Array.isArray(
      productLd?.offers
    )
      ? productLd.offers[0]
      : productLd?.offers;

  const price =
    offers?.price ??
    offers?.lowPrice;

  const currency =
    offers?.priceCurrency ||
    "BDT";

  if (
    price !== undefined &&
    price !== null &&
    String(price).trim()
  ) {
    return `${currency} ${String(
      price
    ).trim()}`;
  }

  const dom =
    $(
      ".summary .price, .product-price-summary .price, p.price"
    )
      .first()
      .text()
      .replace(
        /\s+/g,
        " "
      )
      .trim();

  return dom || null;
}

/**
 * Source price priority:
 * 1. JSON-LD
 * 2. WooCommerce sale price
 * 3. Main product price
 */
function numericSourcePrice(
  productLd,
  $
) {
  const offers =
    Array.isArray(
      productLd?.offers
    )
      ? productLd.offers[0]
      : productLd?.offers;

  const structured =
    parseMoneyNumber(
      offers?.price ??
      offers?.lowPrice
    );

  if (
    structured !==
    null
  ) {
    return structured;
  }

  const saleCandidates =
    $(
      ".summary .price ins .woocommerce-Price-amount, " +
      ".summary .price ins bdi, " +
      "p.price ins .woocommerce-Price-amount, " +
      "p.price ins bdi"
    )
      .map(
        (
          _,
          element
        ) =>
          parseMoneyNumber(
            $(element).text()
          )
      )
      .get()
      .filter(
        (value) =>
          value !== null
      );

  if (
    saleCandidates.length
  ) {
    return Math.min(
      ...saleCandidates
    );
  }

  const normalCandidates =
    $(
      ".summary .price .woocommerce-Price-amount, " +
      ".summary .price bdi, " +
      "p.price .woocommerce-Price-amount, " +
      "p.price bdi"
    )
      .map(
        (
          _,
          element
        ) =>
          parseMoneyNumber(
            $(element).text()
          )
      )
      .get()
      .filter(
        (value) =>
          value !== null
      );

  if (
    normalCandidates.length
  ) {
    return Math.min(
      ...normalCandidates
    );
  }

  return null;
}

function formatBdtPrice(
  value
) {
  if (
    !Number.isFinite(
      value
    ) ||
    value <= 0
  ) {
    return "Contact for price";
  }

  return `৳${new Intl.NumberFormat(
    "en-BD",
    {
      maximumFractionDigits:
        2,
    }
  ).format(value)}`;
}

async function parseProduct(
  source,
  url
) {
  const html =
    await fetchText(
      url
    );

  const $ =
    load(
      html
    );

  const ld =
    findJsonLdProduct(
      $
    );

  const rawTitle =
    decodeHtml(
      ld?.name ||
      $(
        "h1.product_title, h1.entry-title, h1"
      )
        .first()
        .text() ||
      $(
        'meta[property="og:title"]'
      ).attr(
        "content"
      ) ||
      ""
    );

  const title =
    cleanSourceBranding(
      rawTitle
    );

  if (!title) {
    throw new Error(
      "No product title found"
    );
  }

  const breadcrumb =
    decodeHtml(
      $(
        ".woocommerce-breadcrumb, .wd-breadcrumbs, nav.breadcrumb, .breadcrumb"
      )
        .first()
        .text()
    );

  const categoryText =
    decodeHtml(
      $(
        ".posted_in, .product_meta, .product-categories"
      )
        .first()
        .text()
    );

  const classification =
    classify(
      title,
      breadcrumb,
      categoryText
    );

  const brandLabel =
    getBrand(
      ld,
      title,
      $,
      breadcrumb
    );

  const model =
    extractModel(
      ld,
      title
    );

  const referenceImageUrls =
    collectReferenceImageUrls(
      ld,
      $,
      source.origin
    );

  const sourcePriceText =
    priceTextFromLd(
      ld,
      $
    );

  const sourcePrice =
    numericSourcePrice(
      ld,
      $
    );

  const strongKey =
    model
      ? `model:${normalizeText(
          brandLabel
        )}:${normalizeText(
          model
        )}`
      : `name:${normalizeText(
          title
        )}`;

  return {
    source:
      source.key,

    url,

    title,

    brandLabel:
      brandLabel ||
      "Other",

    brand:
      slugify(
        brandLabel ||
        "Other"
      ),

    model,

    sourcePriceText,

    sourcePrice,

    classification,

    power:
      extractPower(
        title
      ),

    referenceImageUrls,

    strongKey,
  };
}

function extensionFromContentType(
  contentType,
  url
) {
  const lower =
    String(
      contentType ||
      ""
    ).toLowerCase();

  if (
    lower.includes(
      "webp"
    )
  ) {
    return ".webp";
  }

  if (
    lower.includes(
      "png"
    )
  ) {
    return ".png";
  }

  if (
    lower.includes(
      "avif"
    )
  ) {
    return ".avif";
  }

  if (
    lower.includes(
      "gif"
    )
  ) {
    return ".gif";
  }

  if (
    lower.includes(
      "jpeg"
    ) ||
    lower.includes(
      "jpg"
    )
  ) {
    return ".jpg";
  }

  try {
    const ext =
      path
        .extname(
          new URL(
            url
          ).pathname
        )
        .toLowerCase();

    if (
      [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".avif",
        ".gif",
      ].includes(
        ext
      )
    ) {
      return ext ===
        ".jpeg"
        ? ".jpg"
        : ext;
    }
  } catch {
    // Ignore malformed URLs.
  }

  return ".jpg";
}

/**
 * Reference image only.
 * Never used as production product.image.
 */
async function downloadReferenceImage(
  url,
  basename
) {
  const response =
    await fetchWithRetry(
      url,
      {
        headers: {
          accept:
            "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        },
      }
    );

  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  if (
    !contentType.startsWith(
      "image/"
    )
  ) {
    throw new Error(
      `Not an image (${contentType || "unknown content-type"})`
    );
  }

  const ext =
    extensionFromContentType(
      contentType,
      url
    );

  const filename =
    `${basename}${ext}`;

  const output =
    path.join(
      REFERENCE_IMAGE_DIR,
      filename
    );

  const bytes =
    Buffer.from(
      await response.arrayBuffer()
    );

  await fs.writeFile(
    output,
    bytes
  );

  return `/assets/products-imported-reference/${filename}`;
}

async function ensureProductionPlaceholder() {
  const output =
    path.join(
      APPROVED_IMAGE_DIR,
      "product-placeholder.svg"
    );

  try {
    await fs.access(
      output
    );

    return;
  } catch {
    // Create below.
  }

  const svg =
`<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="900" viewBox="0 0 1200 900" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="900" fill="#F3F5F4"/>
  <rect x="330" y="210" width="540" height="360" rx="28" fill="#FFFFFF" stroke="#D9DFDC" stroke-width="4"/>
  <circle cx="600" cy="390" r="92" fill="#ECF1EF"/>
  <path d="M565 420L600 350L635 420H565Z" fill="#94A39D"/>
  <rect x="478" y="620" width="244" height="18" rx="9" fill="#CAD3CF"/>
  <text x="600" y="700" text-anchor="middle" fill="#5E6A65" font-size="38" font-family="Arial, Helvetica, sans-serif">DESH SOLAR</text>
  <text x="600" y="752" text-anchor="middle" fill="#89938F" font-size="25" font-family="Arial, Helvetica, sans-serif">Product image coming soon</text>
</svg>
`;

  await fs.writeFile(
    output,
    svg,
    "utf8"
  );
}

async function getExistingReferenceImages(
  id
) {
  try {
    const files =
      await fs.readdir(
        REFERENCE_IMAGE_DIR
      );

    const prefix =
      `${id}-`;

    return files
      .filter(
        (file) =>
          file.startsWith(
            prefix
          ) &&
          IMAGE_EXTENSIONS.has(
            path
              .extname(
                file
              )
              .toLowerCase()
          )
      )
      .sort()
      .slice(
        0,
        MAX_GALLERY_IMAGES
      )
      .map(
        (file) =>
          `/assets/products-imported-reference/${file}`
      );
  } catch {
    return [];
  }
}

async function syncReferenceImages(
  product,
  id,
  failures
) {
  const existing =
    await getExistingReferenceImages(
      id
    );

  if (
    !DOWNLOAD_REFERENCE_IMAGES
  ) {
    return existing;
  }

  if (
    !product.referenceImageUrls.length
  ) {
    return existing;
  }

  await fs.mkdir(
    REFERENCE_IMAGE_DIR,
    {
      recursive:
        true,
    }
  );

  const gallery =
    [];

  for (
    let index = 0;
    index <
    product.referenceImageUrls.length;
    index += 1
  ) {
    try {
      const local =
        await downloadReferenceImage(
          product.referenceImageUrls[
            index
          ],
          `${id}-${index + 1}`
        );

      gallery.push(
        local
      );

      await sleep(
        Math.max(
          80,
          Math.round(
            REQUEST_DELAY_MS /
            2
          )
        )
      );
    } catch (error) {
      failures.push({
        id,

        name:
          product.title,

        imageUrl:
          product.referenceImageUrls[
            index
          ],

        error:
          error.message,
      });
    }
  }

  return gallery.length
    ? gallery
    : existing;
}

function escapeRegex(
  value
) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

function approvedImageSort(
  prefixes
) {
  return (
    a,
    b
  ) => {
    const aBase =
      path
        .basename(
          a,
          path.extname(
            a
          )
        )
        .toLowerCase();

    const bBase =
      path
        .basename(
          b,
          path.extname(
            b
          )
        )
        .toLowerCase();

    const rank =
      (base) => {
        for (
          let index = 0;
          index <
          prefixes.length;
          index += 1
        ) {
          const prefix =
            prefixes[
              index
            ];

          if (
            base ===
            prefix
          ) {
            return (
              index *
              100
            );
          }

          const suffix =
            base.match(
              new RegExp(
                `^${escapeRegex(
                  prefix
                )}-(\\d+)$`
              )
            );

          if (
            suffix
          ) {
            return (
              index *
              100 +
              Number(
                suffix[
                  1
                ]
              )
            );
          }
        }

        return 999999;
      };

    return (
      rank(
        aBase
      ) -
      rank(
        bBase
      ) ||
      a.localeCompare(
        b
      )
    );
  };
}

/**
 * Production image lookup.
 *
 * Put approved images in:
 *
 * public/assets/products/
 *
 * Example:
 *
 * growatt-spf-6000-es-plus.jpg
 * growatt-spf-6000-es-plus-1.jpg
 * growatt-spf-6000-es-plus-2.jpg
 */
async function resolveApprovedProductImages(
  product,
  id
) {
  try {
    const files =
      await fs.readdir(
        APPROVED_IMAGE_DIR
      );

    const friendlyPrefix =
      slugify(
        `${product.brandLabel}-${product.model || product.title}`
      )
        .toLowerCase();

    const titlePrefix =
      slugify(
        product.title
      )
        .toLowerCase();

    const idPrefix =
      id.toLowerCase();

    const prefixes = [
      friendlyPrefix,
      titlePrefix,
      idPrefix,
    ].filter(
      (
        value,
        index,
        array
      ) =>
        value &&
        array.indexOf(
          value
        ) ===
          index
    );

    const matches =
      files
        .filter(
          (file) => {
            const ext =
              path
                .extname(
                  file
                )
                .toLowerCase();

            if (
              !IMAGE_EXTENSIONS.has(
                ext
              )
            ) {
              return false;
            }

            const base =
              path
                .basename(
                  file,
                  ext
                )
                .toLowerCase();

            return prefixes.some(
              (
                prefix
              ) =>
                base ===
                  prefix ||
                new RegExp(
                  `^${escapeRegex(
                    prefix
                  )}-\\d+$`
                ).test(
                  base
                )
            );
          }
        )
        .sort(
          approvedImageSort(
            prefixes
          )
        )
        .slice(
          0,
          MAX_GALLERY_IMAGES
        )
        .map(
          (file) =>
            `/assets/products/${file}`
        );

    return {
      main:
        matches[0] ||
        APPROVED_PLACEHOLDER_PUBLIC_PATH,

      gallery:
        matches,

      prefix:
        friendlyPrefix,
    };
  } catch {
    return {
      main:
        APPROVED_PLACEHOLDER_PUBLIC_PATH,

      gallery:
        [],

      prefix:
        slugify(
          `${product.brandLabel}-${product.model || product.title}`
        ),
    };
  }
}

function csvEscape(
  value
) {
  const text =
    value === null ||
    value === undefined
      ? ""
      : String(
          value
        );

  return `"${text.replaceAll(
    '"',
    '""'
  )}"`;
}

function toCsv(
  rows,
  headers
) {
  return (
    [
      headers
        .map(
          csvEscape
        )
        .join(
          ","
        ),

      ...rows.map(
        (row) =>
          headers
            .map(
              (key) =>
                csvEscape(
                  row[
                    key
                  ]
                )
            )
            .join(
              ","
            )
      ),
    ].join(
      "\n"
    ) +
    "\n"
  );
}

function jaccard(
  a,
  b
) {
  const A =
    new Set(
      normalizeText(
        a
      )
        .split(
          " "
        )
        .filter(
          (item) =>
            item.length >
            1
        )
    );

  const B =
    new Set(
      normalizeText(
        b
      )
        .split(
          " "
        )
        .filter(
          (item) =>
            item.length >
            1
        )
    );

  if (
    !A.size ||
    !B.size
  ) {
    return 0;
  }

  const intersection =
    [...A].filter(
      (item) =>
        B.has(
          item
        )
    ).length;

  const union =
    new Set([
      ...A,
      ...B,
    ]).size;

  return union
    ? intersection /
      union
    : 0;
}

async function readExistingNames() {
  try {
    const text =
      await fs.readFile(
        BASE_PRODUCTS,
        "utf8"
      );

    const names =
      [];

    for (
      const match of
      text.matchAll(
        /(?:"name"|name)\s*:\s*["'`]([^"'`]+)["'`]/g
      )
    ) {
      if (
        match[
          1
        ] &&
        !names.includes(
          match[
            1
          ]
        )
      ) {
        names.push(
          match[
            1
          ]
        );
      }
    }

    return names;
  } catch {
    return [];
  }
}

function tsString(
  value
) {
  return JSON.stringify(
    value,
    null,
    2
  );
}

function productToGeneratedRecord(
  item,
  index
) {
  const classification =
    item.classification;

  const validPrices =
    item.sourcePrices.filter(
      (value) =>
        Number.isFinite(
          value
        ) &&
        value > 0
    );

  const lowestSourcePrice =
    validPrices.length
      ? Math.min(
          ...validPrices
        )
      : null;

  return {
    id:
      item.id,

    name:
      cleanSourceBranding(
        item.title
      ),

    category:
      classification.category,

    categoryLabel:
      classification.label,

    subcategory:
      classification.subcategory,

    brand:
      item.brand,

    brandLabel:
      item.brandLabel,

    model:
      item.model ||
      undefined,

    power:
      item.power,

    priceText:
      lowestSourcePrice !==
      null
        ? formatBdtPrice(
            lowestSourcePrice
          )
        : "Contact for price",

    price:
      lowestSourcePrice,

    oldPriceText:
      null,

    oldPrice:
      null,

    apps:
      appsFor(
        classification
      ),

    search:
      normalizeText(
        `${cleanSourceBranding(
          item.title
        )} ${item.brandLabel} ${
          item.model ||
          ""
        } ${classification.label} ${classification.subcategory} ${item.power}`
      ),

    warranty:
      "Confirm current manufacturer / Desh Solar warranty",

    /**
     * Customer-facing images:
     * approved production folder only.
     */
    image:
      item.approvedImages.main,

    importedGallery:
      item.approvedImages.gallery,

    role:
      roleFor(
        classification.category
      ),

    bestFor:
      bestFor(
        classification
      ),

    featuredOrder:
      10000 +
      index,

    /**
     * Internal metadata.
     * Never display source information to customers.
     */
    sourceSites:
      item.sources,

    sourceUrls:
      item.sourceUrls,

    sourcePriceText:
      item.sourcePriceTexts
        .filter(
          Boolean
        )
        .join(
          " | "
        ) ||
      null,

    importStatus:
      item.model &&
      item.approvedImages
        .gallery.length
        ? "ready"
        : "review",
  };
}

async function main() {
  await fs.mkdir(
    REPORT_DIR,
    {
      recursive:
        true,
    }
  );

  await fs.mkdir(
    APPROVED_IMAGE_DIR,
    {
      recursive:
        true,
    }
  );

  /**
   * Do not recreate reference folder if reference downloads are disabled.
   */
  if (
    DOWNLOAD_REFERENCE_IMAGES
  ) {
    await fs.mkdir(
      REFERENCE_IMAGE_DIR,
      {
        recursive:
          true,
      }
    );
  }

  await ensureProductionPlaceholder();

  const allDiscovered =
    [];

  for (
    const source of
    SOURCES
  ) {
    const urls = [
      ...(
        await discoverProducts(
          source
        )
      ),
    ];

    const limited =
      MAX_PRODUCTS > 0
        ? urls.slice(
            0,
            MAX_PRODUCTS
          )
        : urls;

    console.log(
      `${source.key}: reading ${limited.length} product pages ...`
    );

    let done =
      0;

    for (
      const url of
      limited
    ) {
      try {
        const parsed =
          await parseProduct(
            source,
            url
          );

        allDiscovered.push(
          parsed
        );
      } catch (
        error
      ) {
        console.warn(
          `\nSkip ${url}: ${error.message}`
        );
      }

      done +=
        1;

      process.stdout.write(
        `\r${source.key}: ${done}/${limited.length} read   `
      );

      await sleep(
        REQUEST_DELAY_MS
      );
    }

    process.stdout.write(
      "\n"
    );
  }

  const duplicateRows =
    [];

  const merged =
    new Map();

  for (
    const item of
    allDiscovered
  ) {
    const existing =
      merged.get(
        item.strongKey
      );

    if (
      !existing
    ) {
      merged.set(
        item.strongKey,
        {
          ...item,

          sources: [
            item.source,
          ],

          sourceUrls: [
            item.url,
          ],

          sourcePrices: [
            item.sourcePrice,
          ],

          sourcePriceTexts: [
            item.sourcePriceText,
          ],

          referenceImageUrls: [
            ...item.referenceImageUrls,
          ],
        }
      );

      continue;
    }

    duplicateRows.push({
      key:
        item.strongKey,

      keptName:
        existing.title,

      duplicateName:
        item.title,

      keptSource:
        existing.sources.join(
          " + "
        ),

      duplicateSource:
        item.source,

      keptUrl:
        existing.sourceUrls[
          0
        ],

      duplicateUrl:
        item.url,
    });

    if (
      !existing.sources.includes(
        item.source
      )
    ) {
      existing.sources.push(
        item.source
      );
    }

    if (
      !existing.sourceUrls.includes(
        item.url
      )
    ) {
      existing.sourceUrls.push(
        item.url
      );
    }

    existing.sourcePrices.push(
      item.sourcePrice
    );

    existing.sourcePriceTexts.push(
      item.sourcePriceText
    );

    for (
      const image of
      item.referenceImageUrls
    ) {
      if (
        !existing.referenceImageUrls.includes(
          image
        ) &&
        existing.referenceImageUrls.length <
          MAX_GALLERY_IMAGES
      ) {
        existing.referenceImageUrls.push(
          image
        );
      }
    }
  }

  const unique = [
    ...merged.values(),
  ].sort(
    (
      a,
      b
    ) =>
      a.classification.category.localeCompare(
        b.classification.category
      ) ||
      a.brandLabel.localeCompare(
        b.brandLabel
      ) ||
      a.title.localeCompare(
        b.title
      )
  );

  const imageFailures =
    [];

  for (
    let index = 0;
    index <
    unique.length;
    index += 1
  ) {
    const item =
      unique[
        index
      ];

    const idBase =
      slugify(
        `${item.brandLabel}-${item.model || item.title}`
      );

    item.id =
      `ext-${idBase}-${shortHash(
        item.strongKey
      )}`;

    /**
     * Optional reference images.
     * Never customer-facing.
     */
    item.referenceImages =
      await syncReferenceImages(
        item,
        item.id,
        imageFailures
      );

    /**
     * Production storefront images.
     */
    item.approvedImages =
      await resolveApprovedProductImages(
        item,
        item.id
      );

    process.stdout.write(
      `\rImages: ${index + 1}/${unique.length}   `
    );
  }

  process.stdout.write(
    "\n"
  );

  const generated =
    unique.map(
      productToGeneratedRecord
    );

  const ts =
    `/* AUTO-GENERATED by scripts/sync-external-products.mjs.\n` +
    ` * Generated: ${new Date().toISOString()}\n` +
    ` * Competitor/source images are NEVER used in customer-facing product fields.\n` +
    ` * Production images must exist under public/assets/products/.\n` +
    ` */\n` +
    `import type { Product } from "./products";\n\n` +
    `export const externalProducts = ${tsString(
      generated
    )} as unknown as Product[];\n`;

  await fs.writeFile(
    OUTPUT_TS,
    ts,
    "utf8"
  );

  /**
   * Internal catalogue/source audit.
   */
  const sourceRows =
    unique.flatMap(
      (item) =>
        item.sourceUrls.map(
          (
            sourceUrl,
            index
          ) => ({
            id:
              item.id,

            name:
              cleanSourceBranding(
                item.title
              ),

            brand:
              item.brandLabel,

            model:
              item.model,

            category:
              item.classification
                .category,

            subcategory:
              item.classification
                .subcategory,

            sourceSite:
              item.sources[
                index
              ] ||
              item.sources[
                0
              ],

            sourceUrl,

            sourcePrice:
              item.sourcePrices[
                index
              ] ??
              "",

            sourcePriceText:
              item.sourcePriceTexts[
                index
              ] ||
              "",

            approvedImagePrefix:
              item.approvedImages
                .prefix,

            approvedImage:
              item.approvedImages
                .main,

            referenceImages:
              item.referenceImages.join(
                " | "
              ),

            review:
              item.model &&
              item.approvedImages
                .gallery.length
                ? "ready"
                : "needs-approved-image-or-model-review",
          })
        )
    );

  await fs.writeFile(
    path.join(
      REPORT_DIR,
      "catalog-source.csv"
    ),

    toCsv(
      sourceRows,
      [
        "id",
        "name",
        "brand",
        "model",
        "category",
        "subcategory",
        "sourceSite",
        "sourceUrl",
        "sourcePrice",
        "sourcePriceText",
        "approvedImagePrefix",
        "approvedImage",
        "referenceImages",
        "review",
      ]
    ),

    "utf8"
  );

  await fs.writeFile(
    path.join(
      REPORT_DIR,
      "duplicate-report.csv"
    ),

    toCsv(
      duplicateRows,
      [
        "key",
        "keptName",
        "duplicateName",
        "keptSource",
        "duplicateSource",
        "keptUrl",
        "duplicateUrl",
      ]
    ),

    "utf8"
  );

  await fs.writeFile(
    path.join(
      REPORT_DIR,
      "image-failures.csv"
    ),

    toCsv(
      imageFailures,
      [
        "id",
        "name",
        "imageUrl",
        "error",
      ]
    ),

    "utf8"
  );

  const existingNames =
    await readExistingNames();

  const possibleExisting =
    [];

  for (
    const item of
    unique
  ) {
    let best =
      null;

    for (
      const existingName of
      existingNames
    ) {
      const score =
        jaccard(
          cleanSourceBranding(
            item.title
          ),
          existingName
        );

      if (
        !best ||
        score >
        best.score
      ) {
        best = {
          existingName,
          score,
        };
      }
    }

    if (
      best &&
      best.score >=
        0.67
    ) {
      possibleExisting.push({
        importedName:
          cleanSourceBranding(
            item.title
          ),

        existingName:
          best.existingName,

        similarity:
          best.score.toFixed(
            3
          ),

        sourceUrl:
          item.sourceUrls[
            0
          ],

        action:
          best.score >=
          0.86
            ? "LIKELY DUPLICATE - REVIEW"
            : "POSSIBLE DUPLICATE - REVIEW",
      });
    }
  }

  await fs.writeFile(
    path.join(
      REPORT_DIR,
      "possible-existing-duplicates.csv"
    ),

    toCsv(
      possibleExisting,
      [
        "importedName",
        "existingName",
        "similarity",
        "sourceUrl",
        "action",
      ]
    ),

    "utf8"
  );

  const approvedProductCount =
    unique.filter(
      (item) =>
        item.approvedImages
          .gallery.length >
        0
    ).length;

  const placeholderProductCount =
    unique.length -
    approvedProductCount;

  const summary = {
    generatedAt:
      new Date().toISOString(),

    sourcePageRecords:
      allDiscovered.length,

    uniqueExternalProducts:
      unique.length,

    exactExternalDuplicatesMerged:
      duplicateRows.length,

    possibleExistingDeshSolarDuplicates:
      possibleExisting.length,

    approvedProductImagesFound:
      approvedProductCount,

    productsUsingPlaceholder:
      placeholderProductCount,

    referenceImagesAvailable:
      unique.reduce(
        (
          sum,
          item
        ) =>
          sum +
          item.referenceImages
            .length,
        0
      ),

    referenceImageFailures:
      imageFailures.length,

    categories:
      Object.fromEntries(
        [
          ...new Set(
            unique.map(
              (item) =>
                item
                  .classification
                  .category
            )
          ),
        ]
          .sort()
          .map(
            (
              category
            ) => [
              category,

              unique.filter(
                (item) =>
                  item
                    .classification
                    .category ===
                  category
              ).length,
            ]
          )
      ),

    brands:
      Object.fromEntries(
        [
          ...new Set(
            unique.map(
              (item) =>
                item.brandLabel
            )
          ),
        ]
          .sort(
            (
              a,
              b
            ) =>
              a.localeCompare(
                b
              )
          )
          .map(
            (
              brand
            ) => [
              brand,

              unique.filter(
                (item) =>
                  item.brandLabel ===
                  brand
              ).length,
            ]
          )
      ),

    note:
      "Customer-facing images come only from public/assets/products/. Source images are reference-only. Product price uses the lowest valid matched source price. Brands are canonicalized, invalid source labels fall back to Other, and known truncated model values are corrected from exact product titles.",
  };

  await fs.writeFile(
    path.join(
      REPORT_DIR,
      "import-summary.json"
    ),

    JSON.stringify(
      summary,
      null,
      2
    ) +
    "\n",

    "utf8"
  );

  console.log(
    "\nDONE"
  );

  console.log(
    JSON.stringify(
      summary,
      null,
      2
    )
  );

  console.log(
    `\nGenerated: ${path.relative(
      ROOT,
      OUTPUT_TS
    )}`
  );

  console.log(
    `Approved:  ${path.relative(
      ROOT,
      APPROVED_IMAGE_DIR
    )}`
  );

  if (
    DOWNLOAD_REFERENCE_IMAGES
  ) {
    console.log(
      `Reference: ${path.relative(
        ROOT,
        REFERENCE_IMAGE_DIR
      )}`
    );
  } else {
    console.log(
      "Reference: disabled (DOWNLOAD_SOURCE_IMAGES=0)"
    );
  }

  console.log(
    `Reports:   ${path.relative(
      ROOT,
      REPORT_DIR
    )}`
  );
}

main().catch(
  (error) => {
    console.error(
      "\nIMPORT FAILED"
    );

    console.error(
      error
    );

    process.exitCode =
      1;
  }
);