#!/usr/bin/env node

/**
 * Desh Solar - Crown Micro ALL official product image sync
 *
 * Reads the current generated catalogue, finds every Crown Micro product,
 * discovers Crown Micro's official product pages from official sitemaps,
 * matches product pages by exact model/family/capacity, downloads the best
 * official product image using the exact approvedImagePrefix, writes an audit,
 * then runs the main catalogue importer once.
 *
 * Safety:
 * - Only crownmicroglobal.com pages/images are accepted.
 * - Existing approved images are skipped unless FORCE=1.
 * - Low-confidence/unmatched products are left on the placeholder.
 * - No competitor images are ever used.
 *
 * Run from:
 *   D:\desh-solar-website\frontend
 *
 * Command:
 *   node .\scripts\sync-crown-micro-all-official-images.mjs
 *
 * Optional:
 *   $env:FORCE="1"
 *   $env:RERUN_CATALOG="0"
 */

import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { load } from "cheerio";

const ROOT = process.cwd();

const CATALOG_CSV = path.join(
  ROOT,
  "migration-output",
  "catalog-source.csv"
);

const REPORT_DIR = path.join(
  ROOT,
  "migration-output"
);

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

const FORCE =
  process.env.FORCE === "1";

const RERUN_CATALOG =
  process.env.RERUN_CATALOG !== "0";

const REQUEST_DELAY_MS =
  Number(
    process.env.CROWN_IMAGE_DELAY_MS ||
      180
  );

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
  "AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Chrome/155.0 Safari/537.36 " +
  "DeshSolarCrownOfficialSync/2.0";

const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
]);

function sleep(ms) {
  return new Promise(
    (resolve) =>
      setTimeout(resolve, ms)
  );
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
      const response =
        await fetch(url, {
          redirect: "follow",

          ...options,

          headers: {
            "user-agent":
              USER_AGENT,

            "accept-language":
              "en-US,en;q=0.9",

            ...(options.headers ||
              {}),
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

      if (
        attempt <
        attempts
      ) {
        await sleep(
          650 *
            attempt
        );
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

function normalizeUrl(
  value,
  base = OFFICIAL_ORIGIN
) {
  if (!value) {
    return null;
  }

  try {
    const url =
      new URL(
        value,
        base
      );

    url.hash = "";

    return url.href;
  } catch {
    return null;
  }
}

function isOfficialUrl(value) {
  try {
    const host =
      new URL(
        value
      ).hostname.toLowerCase();

    return OFFICIAL_HOSTS.has(
      host
    );
  } catch {
    return false;
  }
}

function normalizeMatchText(
  value = ""
) {
  return String(value)
    .toLowerCase()
    .replace(
      /&/g,
      " and "
    )
    .replace(
      /[^a-z0-9]+/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

function compact(
  value = ""
) {
  return normalizeMatchText(
    value
  ).replace(
    /\s+/g,
    ""
  );
}

function xmlLocs(xml) {
  const $ =
    load(
      xml,
      {
        xmlMode: true,
      }
    );

  return $("loc")
    .map(
      (
        _,
        element
      ) =>
        $(element)
          .text()
          .trim()
    )
    .get()
    .filter(
      Boolean
    );
}

async function discoverOfficialProductUrls() {
  const seeds = [
    `${OFFICIAL_ORIGIN}/wp-sitemap-posts-product-1.xml`,
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

      const locs =
        xmlLocs(
          xml
        );

      for (
        const loc of
        locs
      ) {
        const normalized =
          normalizeUrl(
            loc
          );

        if (
          !normalized ||
          !isOfficialUrl(
            normalized
          )
        ) {
          continue;
        }

        let pathname =
          "";

        try {
          pathname =
            new URL(
              normalized
            ).pathname;
        } catch {
          continue;
        }

        if (
          /\/product\/[^/]+\/?$/i.test(
            pathname
          )
        ) {
          productUrls.add(
            normalized
          );

          continue;
        }

        if (
          /\.xml(?:$|\?)/i.test(
            normalized
          ) &&
          /product|sitemap|post/i.test(
            normalized
          )
        ) {
          await visit(
            normalized,
            depth +
              1
          );
        }
      }
    } catch {
      // Some sitemap variants may not exist.
    }
  }

  for (
    const seed of
    seeds
  ) {
    await visit(
      seed
    );
  }

  return [
    ...productUrls,
  ].sort();
}

function parseCsv(text) {
  const rows = [];

  let row = [];
  let field = "";
  let quoted =
    false;

  for (
    let i = 0;
    i <
    text.length;
    i += 1
  ) {
    const ch =
      text[i];

    if (quoted) {
      if (
        ch === '"'
      ) {
        if (
          text[
            i + 1
          ] === '"'
        ) {
          field +=
            '"';

          i += 1;
        } else {
          quoted =
            false;
        }
      } else {
        field +=
          ch;
      }

      continue;
    }

    if (
      ch === '"'
    ) {
      quoted =
        true;

      continue;
    }

    if (
      ch === ","
    ) {
      row.push(
        field
      );

      field =
        "";

      continue;
    }

    if (
      ch === "\n"
    ) {
      row.push(
        field.replace(
          /\r$/,
          ""
        )
      );

      rows.push(
        row
      );

      row = [];

      field =
        "";

      continue;
    }

    field +=
      ch;
  }

  if (
    field.length ||
    row.length
  ) {
    row.push(
      field.replace(
        /\r$/,
        ""
      )
    );

    rows.push(
      row
    );
  }

  if (
    !rows.length
  ) {
    return [];
  }

  const headers =
    rows[0];

  return rows
    .slice(1)
    .filter(
      (values) =>
        values.some(
          (value) =>
            value !==
            ""
        )
    )
    .map(
      (values) =>
        Object.fromEntries(
          headers.map(
            (
              header,
              index
            ) => [
              header,
              values[
                index
              ] ??
                "",
            ]
          )
        )
    );
}

async function loadCrownTargets() {
  const csv =
    await fs.readFile(
      CATALOG_CSV,
      "utf8"
    );

  const rows =
    parseCsv(
      csv
    );

  const byId =
    new Map();

  for (
    const row of
    rows
  ) {
    if (
      row.brand !==
      "Crown Micro"
    ) {
      continue;
    }

    if (
      !byId.has(
        row.id
      )
    ) {
      byId.set(
        row.id,
        row
      );
    }
  }

  return [
    ...byId.values(),
  ]
    .map(
      (row) => ({
        id:
          row.id,

        model:
          row.model,

        name:
          row.name,

        category:
          row.category,

        subcategory:
          row.subcategory,

        prefix:
          row.approvedImagePrefix,

        approvedImage:
          row.approvedImage,
      })
    )
    .sort(
      (
        a,
        b
      ) =>
        a.name.localeCompare(
          b.name
        )
    );
}

function extractCapacityTokens(
  value = ""
) {
  const tokens =
    new Set();

  const text =
    String(
      value
    );

  for (
    const match of
    text.matchAll(
      /\b\d+(?:\.\d+)?\s*(?:kw|kva|w|va)\b/gi
    )
  ) {
    tokens.add(
      compact(
        match[0]
      )
    );
  }

  return [
    ...tokens,
  ];
}

function modelFamily(
  model = ""
) {
  const upper =
    String(
      model
    ).toUpperCase();

  if (
    upper.startsWith(
      "VMGI-"
    )
  ) {
    return "vmgi";
  }

  if (
    upper.startsWith(
      "ARCEUS-"
    )
  ) {
    return "arceus";
  }

  if (
    upper.startsWith(
      "ELEGO-"
    )
  ) {
    return "elego";
  }

  if (
    upper.startsWith(
      "NOVA-"
    )
  ) {
    return "nova";
  }

  if (
    upper.startsWith(
      "XAVIER-II-"
    )
  ) {
    return "xavierii";
  }

  if (
    /^X-/.test(
      upper
    )
  ) {
    return "xavier";
  }

  return compact(
    upper.split(
      "-"
    )[0] ||
      upper
  );
}

function cleanPageText($) {
  $(
    "script, style, noscript, svg"
  ).remove();

  return $("body")
    .text()
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

async function buildOfficialPageIndex(
  productUrls
) {
  const pages =
    [];

  console.log(
    `Official product pages discovered: ${productUrls.length}`
  );

  console.log(
    "Indexing official product pages...\n"
  );

  for (
    let index = 0;
    index <
    productUrls.length;
    index += 1
  ) {
    const url =
      productUrls[
        index
      ];

    try {
      const html =
        await fetchText(
          url
        );

      const $ =
        load(
          html
        );

      const title =
        $(
          "h1.product_title, h1.entry-title, h1"
        )
          .first()
          .text()
          .trim() ||
        $(
          'meta[property="og:title"]'
        ).attr(
          "content"
        ) ||
        $("title")
          .text()
          .trim() ||
        "";

      const bodyText =
        cleanPageText(
          $
        );

      pages.push({
        url,

        html,

        title,

        text:
          `${title} ${bodyText}`,

        normalized:
          normalizeMatchText(
            `${title} ${bodyText}`
          ),

        compact:
          compact(
            `${title} ${bodyText}`
          ),
      });
    } catch (error) {
      console.warn(
        `Skip official page ${url}: ${error.message}`
      );
    }

    process.stdout.write(
      `\rIndexed ${index + 1}/${productUrls.length} official pages   `
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

function scorePageForTarget(
  target,
  page
) {
  const model =
    target.model ||
    "";

  const modelCompact =
    compact(
      model
    );

  const nameCompact =
    compact(
      target.name
    );

  const family =
    modelFamily(
      model ||
      target.name
    );

  const capacities =
    extractCapacityTokens(
      `${model} ${target.name}`
    );

  const titleCompact =
    compact(
      page.title
    );

  const pageCompact =
    page.compact;

  let score =
    0;

  const reasons =
    [];

  if (
    modelCompact &&
    titleCompact.includes(
      modelCompact
    )
  ) {
    score +=
      220;

    reasons.push(
      "exact-model-in-title"
    );
  } else if (
    modelCompact &&
    pageCompact.includes(
      modelCompact
    )
  ) {
    score +=
      160;

    reasons.push(
      "exact-model-in-page"
    );
  }

  if (
    family &&
    titleCompact.includes(
      family
    )
  ) {
    score +=
      55;

    reasons.push(
      "family-in-title"
    );
  } else if (
    family &&
    pageCompact.includes(
      family
    )
  ) {
    score +=
      25;

    reasons.push(
      "family-in-page"
    );
  }

  for (
    const token of
    capacities
  ) {
    if (
      titleCompact.includes(
        token
      )
    ) {
      score +=
        40;

      reasons.push(
        `capacity-title:${token}`
      );
    } else if (
      pageCompact.includes(
        token
      )
    ) {
      score +=
        18;

      reasons.push(
        `capacity-page:${token}`
      );
    }
  }

  if (
    nameCompact &&
    titleCompact.includes(
      nameCompact
    )
  ) {
    score +=
      80;

    reasons.push(
      "full-name-in-title"
    );
  }

  if (
    target.model
      ?.toUpperCase()
      .includes(
        "-SP"
      )
  ) {
    if (
      /single\s*phase/i.test(
        page.text
      ) ||
      pageCompact.includes(
        "singlephase"
      )
    ) {
      score +=
        20;

      reasons.push(
        "single-phase"
      );
    }
  } else if (
    target.model
      ?.toUpperCase()
      .startsWith(
        "VMGI-"
      )
  ) {
    if (
      /three\s*phase/i.test(
        page.text
      ) ||
      pageCompact.includes(
        "threephase"
      )
    ) {
      score +=
        12;

      reasons.push(
        "three-phase"
      );
    }
  }

  /**
   * Avoid weak family-only matches
   * when exact target capacity is missing.
   */
  if (
    modelCompact &&
    !pageCompact.includes(
      modelCompact
    ) &&
    capacities.length
  ) {
    const exactCapacityPresent =
      capacities.some(
        (token) =>
          pageCompact.includes(
            token
          )
      );

    if (
      !exactCapacityPresent
    ) {
      score -=
        35;

      reasons.push(
        "capacity-missing"
      );
    }
  }

  return {
    score,
    reasons,
  };
}

function findBestPage(
  target,
  pages
) {
  const ranked =
    pages
      .map(
        (page) => ({
          page,

          ...scorePageForTarget(
            target,
            page
          ),
        })
      )
      .sort(
        (
          a,
          b
        ) =>
          b.score -
          a.score
      );

  const best =
    ranked[0];

  if (
    !best ||
    best.score <
      150
  ) {
    return {
      match:
        null,

      candidates:
        ranked.slice(
          0,
          3
        ),
    };
  }

  return {
    match:
      best,

    candidates:
      ranked.slice(
        0,
        3
      ),
  };
}

function isBadImageCandidate(
  value
) {
  const lower =
    value.toLowerCase();

  return [
    "logo",
    "favicon",
    "icon",
    "loader",
    "spinner",
    "payment",
    "country",
    "flag",
    "avatar",
    "placeholder",
    "woocommerce-placeholder",
    "cropped-",
  ].some(
    (word) =>
      lower.includes(
        word
      )
  );
}

function walkJson(
  value,
  visitor
) {
  if (
    !value ||
    typeof value !==
      "object"
  ) {
    return;
  }

  visitor(
    value
  );

  if (
    Array.isArray(
      value
    )
  ) {
    value.forEach(
      (item) =>
        walkJson(
          item,
          visitor
        )
    );

    return;
  }

  Object.values(
    value
  ).forEach(
    (item) =>
      walkJson(
        item,
        visitor
      )
  );
}

function collectImageCandidates(
  page,
  target
) {
  const $ =
    load(
      page.html
    );

  const byUrl =
    new Map();

  const modelCompact =
    compact(
      target.model ||
      target.name
    );

  const family =
    modelFamily(
      target.model ||
      target.name
    );

  const add = (
    rawUrl,
    baseScore,
    source,
    description = ""
  ) => {
    const url =
      normalizeUrl(
        rawUrl,
        page.url
      );

    if (
      !url ||
      !isOfficialUrl(
        url
      ) ||
      isBadImageCandidate(
        url
      )
    ) {
      return;
    }

    let score =
      baseScore;

    const haystack =
      compact(
        `${url} ${description}`
      );

    if (
      modelCompact &&
      haystack.includes(
        modelCompact
      )
    ) {
      score +=
        45;
    }

    if (
      family &&
      haystack.includes(
        family
      )
    ) {
      score +=
        20;
    }

    if (
      /\/wp-content\/uploads\//i.test(
        url
      )
    ) {
      score +=
        10;
    }

    if (
      /-\d+x\d+\.(?:jpg|jpeg|png|webp|avif)(?:\?|$)/i.test(
        url
      )
    ) {
      score -=
        18;
    }

    const existing =
      byUrl.get(
        url
      );

    if (
      !existing ||
      score >
        existing.score
    ) {
      byUrl.set(
        url,
        {
          url,
          score,
          source,
          description,
        }
      );
    }
  };

  $(
    ".woocommerce-product-gallery__image a[href], " +
      ".woocommerce-product-gallery a[href]"
  ).each(
    (
      _,
      element
    ) => {
      add(
        $(element).attr(
          "href"
        ),

        165,

        "woocommerce-gallery-link",

        `${
          $(element).attr(
            "title"
          ) ||
          ""
        } ${
          $(element)
            .find(
              "img"
            )
            .attr(
              "alt"
            ) ||
          ""
        }`
      );
    }
  );

  $(
    ".woocommerce-product-gallery img, " +
      ".product-images img, " +
      ".woocommerce-product-gallery__image img"
  ).each(
    (
      _,
      element
    ) => {
      const description =
        `${
          $(element).attr(
            "alt"
          ) ||
          ""
        } ${
          $(element).attr(
            "title"
          ) ||
          ""
        }`;

      add(
        $(element).attr(
          "data-large_image"
        ),

        160,

        "data-large-image",

        description
      );

      add(
        $(element).attr(
          "data-src"
        ),

        135,

        "gallery-data-src",

        description
      );

      add(
        $(element).attr(
          "src"
        ),

        120,

        "gallery-src",

        description
      );
    }
  );

  $(
    'script[type="application/ld+json"]'
  ).each(
    (
      _,
      element
    ) => {
      const raw =
        $(element)
          .text()
          .trim();

      if (!raw) {
        return;
      }

      try {
        const parsed =
          JSON.parse(
            raw
          );

        walkJson(
          parsed,
          (node) => {
            const types =
              Array.isArray(
                node?.[
                  "@type"
                ]
              )
                ? node[
                    "@type"
                  ].map(
                    String
                  )
                : [
                    String(
                      node?.[
                        "@type"
                      ] ||
                        ""
                    ),
                  ];

            if (
              !types.some(
                (type) =>
                  type.toLowerCase() ===
                  "product"
              )
            ) {
              return;
            }

            const images =
              Array.isArray(
                node.image
              )
                ? node.image
                : node.image
                  ? [
                      node.image,
                    ]
                  : [];

            for (
              const image of
              images
            ) {
              const value =
                typeof image ===
                "string"
                  ? image
                  : image?.url ||
                    image?.contentUrl;

              add(
                value,

                150,

                "json-ld-product-image",

                node.name ||
                  ""
              );
            }
          }
        );
      } catch {
        // Ignore malformed JSON-LD.
      }
    }
  );

  add(
    $(
      'meta[property="og:image"]'
    ).attr(
      "content"
    ),

    135,

    "og-image",

    $(
      'meta[property="og:title"]'
    ).attr(
      "content"
    ) ||
      page.title
  );

  add(
    $(
      'meta[name="twitter:image"]'
    ).attr(
      "content"
    ),

    125,

    "twitter-image",

    $(
      'meta[name="twitter:title"]'
    ).attr(
      "content"
    ) ||
      page.title
  );

  return [
    ...byUrl.values(),
  ].sort(
    (
      a,
      b
    ) =>
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

function escapeRegex(
  value
) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

async function removeExistingPrefixFiles(
  prefix
) {
  let files =
    [];

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

    const base =
      path
        .basename(
          file,
          ext
        )
        .toLowerCase();

    if (
      IMAGE_EXTENSIONS.has(
        ext
      ) &&
      (
        base ===
          prefix.toLowerCase() ||
        new RegExp(
          `^${escapeRegex(
            prefix.toLowerCase()
          )}-\\d+$`
        ).test(
          base
        )
      )
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

async function prefixAlreadyExists(
  prefix
) {
  try {
    const files =
      await fs.readdir(
        APPROVED_DIR
      );

    return files.some(
      (file) => {
        const ext =
          path
            .extname(
              file
            )
            .toLowerCase();

        const base =
          path
            .basename(
              file,
              ext
            )
            .toLowerCase();

        return (
          IMAGE_EXTENSIONS.has(
            ext
          ) &&
          base ===
            prefix.toLowerCase()
        );
      }
    );
  } catch {
    return false;
  }
}

async function downloadBestImage(
  target,
  pageMatch
) {
  const candidates =
    collectImageCandidates(
      pageMatch.page,
      target
    );

  if (
    !candidates.length
  ) {
    throw new Error(
      "No official product image candidates found on matched page."
    );
  }

  const errors =
    [];

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
                pageMatch
                  .page
                  .url,
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

      const ext =
        extensionFromContentType(
          contentType,
          candidate.url
        );

      const filename =
        `${target.prefix}${ext}`;

      const outputPath =
        path.join(
          APPROVED_DIR,
          filename
        );

      await removeExistingPrefixFiles(
        target.prefix
      );

      await fs.writeFile(
        outputPath,
        bytes
      );

      return {
        filename,

        savedFile:
          `/assets/products/${filename}`,

        imageUrl:
          candidate.url,

        imageDetectedVia:
          candidate.source,

        imageScore:
          candidate.score,

        bytes:
          bytes.length,
      };
    } catch (error) {
      errors.push(
        `${candidate.url} -> ${error.message}`
      );
    }
  }

  throw new Error(
    "Matched an official page, but no candidate image could be downloaded. " +
      errors
        .slice(
          0,
          3
        )
        .join(
          " | "
        )
  );
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

function rowsToCsv(
  rows
) {
  const headers = [
    "model",
    "name",
    "status",
    "approvedImagePrefix",
    "matchedPageTitle",
    "matchedPageUrl",
    "pageScore",
    "pageReasons",
    "officialImageUrl",
    "imageDetectedVia",
    "imageScore",
    "savedFile",
    "bytes",
    "error",
    "candidate1",
    "candidate2",
    "candidate3",
  ];

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

async function runMainImporter() {
  console.log(
    "\nRunning main catalogue importer ONCE with source images disabled...\n"
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
        (
          code
        ) => {
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

  await fs.mkdir(
    REPORT_DIR,
    {
      recursive:
        true,
    }
  );

  const targets =
    await loadCrownTargets();

  console.log(
    "Crown Micro ALL official image sync"
  );

  console.log(
    "===================================="
  );

  console.log(
    `Catalogue Crown Micro products: ${targets.length}`
  );

  console.log(
    `FORCE: ${
      FORCE
        ? "yes"
        : "no"
    }`
  );

  console.log(
    "Official domain only: crownmicroglobal.com\n"
  );

  const urls =
    await discoverOfficialProductUrls();

  if (
    !urls.length
  ) {
    throw new Error(
      "No official Crown Micro product pages discovered from sitemaps."
    );
  }

  const pages =
    await buildOfficialPageIndex(
      urls
    );

  if (
    !pages.length
  ) {
    throw new Error(
      "Official product pages were discovered but none could be indexed."
    );
  }

  const audit =
    [];

  let downloaded =
    0;

  let skipped =
    0;

  let unmatched =
    0;

  let failed =
    0;

  for (
    let index = 0;
    index <
    targets.length;
    index += 1
  ) {
    const target =
      targets[
        index
      ];

    console.log(
      `\n[${index + 1}/${targets.length}] ${
        target.model ||
        "NO MODEL"
      }`
    );

    console.log(
      target.name
    );

    const candidatesForAudit =
      [];

    if (
      !target.prefix
    ) {
      console.log(
        "SKIP: no approvedImagePrefix."
      );

      failed +=
        1;

      audit.push({
        model:
          target.model,

        name:
          target.name,

        status:
          "failed-no-prefix",

        approvedImagePrefix:
          target.prefix,

        error:
          "No approvedImagePrefix in catalog-source.csv",
      });

      continue;
    }

    if (
      !FORCE &&
      (
        await prefixAlreadyExists(
          target.prefix
        )
      )
    ) {
      console.log(
        "SKIP: approved image already exists."
      );

      skipped +=
        1;

      audit.push({
        model:
          target.model,

        name:
          target.name,

        status:
          "skipped-existing",

        approvedImagePrefix:
          target.prefix,

        savedFile:
          target.approvedImage,
      });

      continue;
    }

    const result =
      findBestPage(
        target,
        pages
      );

    for (
      let c = 0;
      c <
      result.candidates.length;
      c += 1
    ) {
      const item =
        result.candidates[
          c
        ];

      candidatesForAudit[
        c
      ] =
        `${item.score} | ${item.page.title} | ${item.page.url}`;
    }

    if (
      !result.match
    ) {
      console.log(
        "UNMATCHED: no sufficiently confident official product page."
      );

      unmatched +=
        1;

      audit.push({
        model:
          target.model,

        name:
          target.name,

        status:
          "unmatched",

        approvedImagePrefix:
          target.prefix,

        error:
          "No official product page reached confidence threshold.",

        candidate1:
          candidatesForAudit[
            0
          ] ||
          "",

        candidate2:
          candidatesForAudit[
            1
          ] ||
          "",

        candidate3:
          candidatesForAudit[
            2
          ] ||
          "",
      });

      continue;
    }

    console.log(
      `Matched: ${result.match.page.title}`
    );

    console.log(
      `Page:    ${result.match.page.url}`
    );

    console.log(
      `Score:   ${result.match.score}`
    );

    try {
      const image =
        await downloadBestImage(
          target,
          result.match
        );

      console.log(
        `Saved:   public/assets/products/${image.filename}`
      );

      console.log(
        `Image:   ${image.imageUrl}`
      );

      downloaded +=
        1;

      audit.push({
        model:
          target.model,

        name:
          target.name,

        status:
          "downloaded",

        approvedImagePrefix:
          target.prefix,

        matchedPageTitle:
          result.match
            .page
            .title,

        matchedPageUrl:
          result.match
            .page
            .url,

        pageScore:
          result.match
            .score,

        pageReasons:
          result.match
            .reasons
            .join(
              " | "
            ),

        officialImageUrl:
          image.imageUrl,

        imageDetectedVia:
          image.imageDetectedVia,

        imageScore:
          image.imageScore,

        savedFile:
          image.savedFile,

        bytes:
          image.bytes,

        candidate1:
          candidatesForAudit[
            0
          ] ||
          "",

        candidate2:
          candidatesForAudit[
            1
          ] ||
          "",

        candidate3:
          candidatesForAudit[
            2
          ] ||
          "",
      });
    } catch (error) {
      console.log(
        `FAILED: ${error.message}`
      );

      failed +=
        1;

      audit.push({
        model:
          target.model,

        name:
          target.name,

        status:
          "failed-image-download",

        approvedImagePrefix:
          target.prefix,

        matchedPageTitle:
          result.match
            .page
            .title,

        matchedPageUrl:
          result.match
            .page
            .url,

        pageScore:
          result.match
            .score,

        pageReasons:
          result.match
            .reasons
            .join(
              " | "
            ),

        error:
          error.message,

        candidate1:
          candidatesForAudit[
            0
          ] ||
          "",

        candidate2:
          candidatesForAudit[
            1
          ] ||
          "",

        candidate3:
          candidatesForAudit[
            2
          ] ||
          "",
      });
    }

    await sleep(
      REQUEST_DELAY_MS
    );
  }

  const auditPath =
    path.join(
      REPORT_DIR,
      "crown-micro-all-official-image-audit.csv"
    );

  await fs.writeFile(
    auditPath,
    rowsToCsv(
      audit
    ),
    "utf8"
  );

  console.log(
    "\n===================================="
  );

  console.log(
    `Downloaded: ${downloaded}`
  );

  console.log(
    `Skipped existing: ${skipped}`
  );

  console.log(
    `Unmatched: ${unmatched}`
  );

  console.log(
    `Failed: ${failed}`
  );

  console.log(
    `Total Crown Micro: ${targets.length}`
  );

  console.log(
    "Audit: migration-output/crown-micro-all-official-image-audit.csv"
  );

  if (
    RERUN_CATALOG &&
    downloaded >
      0
  ) {
    await runMainImporter();
  } else if (
    !RERUN_CATALOG
  ) {
    console.log(
      "\nCatalogue rerun disabled because RERUN_CATALOG=0."
    );
  }

  console.log(
    "\nDONE"
  );

  if (
    unmatched ||
    failed
  ) {
    console.log(
      "Any unmatched/failed model was intentionally left unchanged; no competitor image was used."
    );
  }
}

main().catch(
  (error) => {
    console.error(
      "\nCROWN MICRO ALL IMAGE SYNC FAILED"
    );

    console.error(
      error
    );

    process.exitCode =
      1;
  }
);