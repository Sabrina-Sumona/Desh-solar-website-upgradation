#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { load } from "cheerio";

const ROOT = process.cwd();

const APPROVED_DIR = path.join(
  ROOT,
  "public",
  "assets",
  "products"
);

const MAIN_IMPORTER = path.join(
  ROOT,
  "scripts",
  "sync-external-products.mjs"
);

const OFFICIAL_ORIGIN =
  "https://crownmicroglobal.com";

const OFFICIAL_HOSTS = new Set([
  "crownmicroglobal.com",
  "www.crownmicroglobal.com",
]);

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
  "AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Chrome/155.0 Safari/537.36 " +
  "DeshSolarCrownBatteryFamilyFix/1.0";

const REQUEST_DELAY_MS = Number(
  process.env.CROWN_IMAGE_DELAY_MS || 180
);

const FAMILIES = [
  {
    key: "cmlb-12.8v-100-200",

    titlePatterns: [
      /cmlb\s*12\.8v?\s*100.*cmlb\s*12\.8v?\s*200/i,
      /12\.8\s*[- ]?\s*100ah.*12\.8\s*[- ]?\s*200ah/i,
    ],

    prefixes: [
      "crown-micro-cmlb-12-8v-100",
      "crown-micro-cmlb-12-8v-200",
    ],
  },

  {
    key: "cmlb-25.6v-100-200",

    titlePatterns: [
      /cmlb\s*25\.6v?\s*100.*cmlb\s*25\.6v?\s*200/i,
      /25\.6\s*[- ]?\s*100ah.*25\.6\s*[- ]?\s*200ah/i,
    ],

    prefixes: [
      "crown-micro-cmlb-25-6v-100",
    ],
  },
];

const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
]);

function sleep(ms) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms)
  );
}

function normalizeUrl(
  value,
  base = OFFICIAL_ORIGIN
) {
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

function isOfficialUrl(value) {
  try {
    return OFFICIAL_HOSTS.has(
      new URL(value).hostname.toLowerCase()
    );
  } catch {
    return false;
  }
}

async function fetchWithRetry(
  url,
  options = {},
  attempts = 3
) {
  let lastError;

  for (
    let attempt = 1;
    attempt <= attempts;
    attempt += 1
  ) {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        ...options,

        headers: {
          "user-agent": USER_AGENT,
          "accept-language":
            "en-US,en;q=0.9",

          ...(options.headers || {}),
        },
      });

      if (!response.ok) {
        throw new Error(
          `${response.status} ${response.statusText}`
        );
      }

      return response;
    } catch (error) {
      lastError = error;

      if (attempt < attempts) {
        await sleep(700 * attempt);
      }
    }
  }

  throw new Error(
    `Failed ${url}: ${
      lastError?.message ||
      String(lastError)
    }`
  );
}

async function fetchText(url) {
  const response =
    await fetchWithRetry(
      url,
      {
        headers: {
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      }
    );

  return response.text();
}

function xmlLocs(xml) {
  const $ = load(
    xml,
    {
      xmlMode: true,
    }
  );

  return $("loc")
    .map(
      (_, element) =>
        $(element)
          .text()
          .trim()
    )
    .get()
    .filter(Boolean);
}

async function discoverOfficialProductUrls() {
  const seeds = [
    `${OFFICIAL_ORIGIN}/wp-sitemap-posts-product-1.xml`,
    `${OFFICIAL_ORIGIN}/wp-sitemap-posts-product-2.xml`,
    `${OFFICIAL_ORIGIN}/product-sitemap.xml`,
    `${OFFICIAL_ORIGIN}/sitemap_index.xml`,
    `${OFFICIAL_ORIGIN}/wp-sitemap.xml`,
  ];

  const seenSitemaps =
    new Set();

  const productUrls =
    new Set();

  async function visit(
    sitemapUrl,
    depth = 0
  ) {
    if (
      depth > 3 ||
      seenSitemaps.has(
        sitemapUrl
      ) ||
      !isOfficialUrl(
        sitemapUrl
      )
    ) {
      return;
    }

    seenSitemaps.add(
      sitemapUrl
    );

    try {
      const xml =
        await fetchText(
          sitemapUrl
        );

      for (
        const loc of
        xmlLocs(xml)
      ) {
        const normalized =
          normalizeUrl(loc);

        if (
          !normalized ||
          !isOfficialUrl(
            normalized
          )
        ) {
          continue;
        }

        const pathname =
          new URL(
            normalized
          ).pathname;

        if (
          /\/product\/[^/]+\/?$/i.test(
            pathname
          )
        ) {
          productUrls.add(
            normalized
          );
        } else if (
          /\.xml(?:$|\?)/i.test(
            normalized
          ) &&
          /product|sitemap|post/i.test(
            normalized
          )
        ) {
          await visit(
            normalized,
            depth + 1
          );
        }
      }
    } catch {
      // Optional sitemap variant.
    }
  }

  for (
    const seed of
    seeds
  ) {
    await visit(seed);
  }

  return [
    ...productUrls,
  ].sort();
}

async function buildPageIndex(
  urls
) {
  const pages = [];

  console.log(
    `Official product-page candidates: ${urls.length}`
  );

  console.log(
    "Indexing official Crown pages...\n"
  );

  for (
    let index = 0;
    index < urls.length;
    index += 1
  ) {
    const url =
      urls[index];

    try {
      const html =
        await fetchText(url);

      const $ =
        load(html);

      const title =
        $(
          "h1.product_title, h1.entry-title, h1"
        )
          .first()
          .text()
          .replace(
            /\s+/g,
            " "
          )
          .trim() ||
        $(
          'meta[property="og:title"]'
        )
          .attr("content")
          ?.replace(
            /\s+/g,
            " "
          )
          .trim() ||
        "";

      pages.push({
        url,
        html,
        title,
      });
    } catch {
      // Skip unreadable page.
    }

    process.stdout.write(
      `\rIndexed ${index + 1}/${urls.length} pages   `
    );

    await sleep(
      REQUEST_DELAY_MS
    );
  }

  process.stdout.write(
    "\n\n"
  );

  return pages;
}

function findFamilyPage(
  family,
  pages
) {
  return (
    pages.find(
      (page) =>
        family.titlePatterns.some(
          (pattern) =>
            pattern.test(
              page.title
            )
        )
    ) ||
    null
  );
}

function isBadImageCandidate(
  value
) {
  const lower =
    String(value)
      .toLowerCase();

  return [
    "logo",
    "favicon",
    "icon",
    "loader",
    "spinner",
    "payment",
    "flag",
    "avatar",
    "placeholder",
    "woocommerce-placeholder",
    "cropped-",
  ].some(
    (word) =>
      lower.includes(word)
  );
}

function addCandidate(
  map,
  rawUrl,
  score,
  source,
  base
) {
  const url =
    normalizeUrl(
      rawUrl,
      base
    );

  if (
    !url ||
    !isOfficialUrl(url) ||
    isBadImageCandidate(url)
  ) {
    return;
  }

  if (
    /\/wp-content\/uploads\//i.test(
      url
    )
  ) {
    score += 10;
  }

  if (
    /-\d+x\d+\.(?:jpg|jpeg|png|webp|avif)(?:\?|$)/i.test(
      url
    )
  ) {
    score -= 20;
  }

  const existing =
    map.get(url);

  if (
    !existing ||
    score >
      existing.score
  ) {
    map.set(
      url,
      {
        url,
        score,
        source,
      }
    );
  }
}

function collectImageCandidates(
  page
) {
  const $ =
    load(
      page.html
    );

  const map =
    new Map();

  $(
    ".woocommerce-product-gallery__image a[href], .woocommerce-product-gallery a[href]"
  ).each(
    (_, element) => {
      addCandidate(
        map,
        $(element).attr(
          "href"
        ),
        200,
        "woocommerce-gallery-link",
        page.url
      );
    }
  );

  $(
    ".woocommerce-product-gallery img, .product-images img, .woocommerce-product-gallery__image img"
  ).each(
    (_, element) => {
      addCandidate(
        map,
        $(element).attr(
          "data-large_image"
        ),
        190,
        "data-large-image",
        page.url
      );

      addCandidate(
        map,
        $(element).attr(
          "data-src"
        ),
        170,
        "gallery-data-src",
        page.url
      );

      addCandidate(
        map,
        $(element).attr(
          "src"
        ),
        150,
        "gallery-src",
        page.url
      );
    }
  );

  addCandidate(
    map,
    $(
      'meta[property="og:image"]'
    ).attr(
      "content"
    ),
    180,
    "og-image",
    page.url
  );

  addCandidate(
    map,
    $(
      'meta[name="twitter:image"]'
    ).attr(
      "content"
    ),
    160,
    "twitter-image",
    page.url
  );

  return [
    ...map.values(),
  ].sort(
    (a, b) =>
      b.score -
      a.score
  );
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
      IMAGE_EXTENSIONS.has(
        ext
      )
    ) {
      return ext ===
        ".jpeg"
        ? ".jpg"
        : ext;
    }
  } catch {
    // Ignore malformed URL.
  }

  return ".jpg";
}

async function downloadBestImage(
  page
) {
  const candidates =
    collectImageCandidates(
      page
    );

  if (
    !candidates.length
  ) {
    throw new Error(
      "No product image candidate found."
    );
  }

  const errors = [];

  for (
    const candidate of
    candidates
  ) {
    try {
      const response =
        await fetchWithRetry(
          candidate.url,
          {
            headers: {
              accept:
                "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",

              referer:
                page.url,
            },
          }
        );

      const contentType =
        response.headers.get(
          "content-type"
        ) ||
        "";

      if (
        !contentType
          .toLowerCase()
          .startsWith(
            "image/"
          )
      ) {
        throw new Error(
          `Not an image (${
            contentType ||
            "unknown"
          })`
        );
      }

      const bytes =
        Buffer.from(
          await response.arrayBuffer()
        );

      if (
        bytes.length <
        8000
      ) {
        throw new Error(
          `Image too small (${bytes.length} bytes)`
        );
      }

      return {
        bytes,

        ext:
          extensionFromContentType(
            contentType,
            candidate.url
          ),

        imageUrl:
          candidate.url,

        source:
          candidate.source,
      };
    } catch (
      error
    ) {
      errors.push(
        `${candidate.url} -> ${error.message}`
      );
    }
  }

  throw new Error(
    errors
      .slice(
        0,
        3
      )
      .join(
        " | "
      ) ||
      "Unable to download official family image."
  );
}

async function removePrefixFiles(
  prefix
) {
  let files = [];

  try {
    files =
      await fs.readdir(
        APPROVED_DIR
      );
  } catch {
    return;
  }

  for (
    const file of
    files
  ) {
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
      base ===
        prefix.toLowerCase()
    ) {
      await fs.rm(
        path.join(
          APPROVED_DIR,
          file
        ),
        {
          force:
            true,
        }
      );
    }
  }
}

async function runMainImporter() {
  console.log(
    "\nRunning main catalogue importer once...\n"
  );

  await new Promise(
    (
      resolve,
      reject
    ) => {
      const child =
        spawn(
          process.execPath,
          [
            MAIN_IMPORTER,
          ],
          {
            cwd:
              ROOT,

            stdio:
              "inherit",

            env: {
              ...process.env,

              DOWNLOAD_SOURCE_IMAGES:
                "0",
            },
          }
        );

      child.on(
        "error",
        reject
      );

      child.on(
        "exit",
        (code) => {
          if (
            code ===
            0
          ) {
            resolve();
          } else {
            reject(
              new Error(
                `Main importer exited with code ${code}`
              )
            );
          }
        }
      );
    }
  );
}

async function main() {
  await fs.mkdir(
    APPROVED_DIR,
    {
      recursive:
        true,
    }
  );

  const urls =
    await discoverOfficialProductUrls();

  const pages =
    await buildPageIndex(
      urls
    );

  let familiesFixed =
    0;

  let filesWritten =
    0;

  for (
    const family of
    FAMILIES
  ) {
    const page =
      findFamilyPage(
        family,
        pages
      );

    if (!page) {
      throw new Error(
        `Correct official family page not found for ${family.key}`
      );
    }

    console.log(
      `Family: ${family.key}`
    );

    console.log(
      `Page: ${page.title}`
    );

    console.log(
      `URL: ${page.url}`
    );

    const image =
      await downloadBestImage(
        page
      );

    console.log(
      `Official image: ${image.imageUrl}`
    );

    for (
      const prefix of
      family.prefixes
    ) {
      await removePrefixFiles(
        prefix
      );

      const filename =
        `${prefix}${image.ext}`;

      await fs.writeFile(
        path.join(
          APPROVED_DIR,
          filename
        ),
        image.bytes
      );

      console.log(
        `SAVED: public/assets/products/${filename}`
      );

      filesWritten +=
        1;
    }

    familiesFixed +=
      1;

    console.log("");
  }

  console.log(
    "========================================"
  );

  console.log(
    `Families fixed: ${familiesFixed}`
  );

  console.log(
    `Files written: ${filesWritten}`
  );

  await runMainImporter();

  console.log(
    "\nDONE"
  );
}

main().catch(
  (error) => {
    console.error(
      "\nCROWN BATTERY FAMILY FIX FAILED"
    );

    console.error(
      error
    );

    process.exitCode =
      1;
  }
);