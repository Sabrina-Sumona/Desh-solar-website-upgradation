#!/usr/bin/env node

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

const APPROVED_DIR = path.join(
  ROOT,
  "public",
  "assets",
  "products"
);

const REPORT_DIR = path.join(
  ROOT,
  "migration-output"
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
  "DeshSolarCrownFamilySync/3.0";

const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
]);

/**
 * Official Crown Micro product families.
 *
 * Important:
 * Multiple capacities on these official pages share the same
 * manufacturer family artwork. We therefore save that official
 * family image under each exact Desh Solar product prefix.
 */
const FAMILY_MAP = [
  {
    key: "xavier-1.5kw-3kw",

    titleHints: [
      "Xaiver 1.5KW 3KW",
      "Xavier 1.5KW 3KW",
    ],

    slugHints: [
      "xaiver-1-5kw-3kw",
      "xavier-1-5kw-3kw",
    ],

    models: [
      "X-1.5KW-PF1",
      "X-3KW-PF1",
    ],
  },

  {
    key: "voltmore-1kw-3kw",

    titleHints: [
      "Voltmore 1KW 3KW",
    ],

    slugHints: [
      "voltmore-1kw-3kw",
    ],

    models: [
      "VMGI-1KW-SP",
      "VMGI-2KW-SP",
      "VMGI-3KW-SP",
    ],
  },

  {
    key: "voltmore-3.6kw-8kw",

    titleHints: [
      "Voltmore 3.6KW 8KW",
    ],

    slugHints: [
      "voltmore-3-6kw-8kw",
    ],

    models: [
      "VMGI-3.6KW-SP",
      "VMGI-4KW-SP",
      "VMGI-5KW-SP",
      "VMGI-6KW-SP",
      "VMGI-8KW-SP",
    ],
  },

  {
    key: "voltmore-3kw-12kw",

    titleHints: [
      "Voltmore 3KW 12KW",
    ],

    slugHints: [
      "voltmore-3kw-12kw",
    ],

    models: [
      "VMGI-3KW",
      "VMGI-4KW",
      "VMGI-5KW",
      "VMGI-6KW",
      "VMGI-8KW",
      "VMGI-10KW",
      "VMGI-12KW",
    ],
  },

  {
    key: "voltmore-15kw-25kw",

    titleHints: [
      "Voltmore 15KW 25KW",
    ],

    slugHints: [
      "voltmore-15kw-25kw",
    ],

    models: [
      "VMGI-15KW",
      "VMGI-20KW",
      "VMGI-25KW",
    ],
  },

  {
    key: "voltmore-30kw-40kw",

    titleHints: [
      "Voltmore 30KW 40KW",
    ],

    slugHints: [
      "voltmore-30kw-40kw",
    ],

    models: [
      "VMGI-30KW",
      "VMGI-40KW",
    ],
  },

  {
    key: "voltmore-50kw-80kw",

    titleHints: [
      "Voltmore 50KW 80KW",
    ],

    slugHints: [
      "voltmore-50kw-80kw",
    ],

    models: [
      "VMGI-50KW",
      "VMGI-60KW",
      "VMGI-70KW",
      "VMGI-80KW",
    ],
  },

  {
    key: "voltmore-125kw",

    titleHints: [
      "Voltmore 125KW",
    ],

    slugHints: [
      "voltmore-125kw",
    ],

    models: [
      "VMGI-125KW",
    ],
  },

  {
    key: "voltmore-350kw",

    titleHints: [
      "Voltmore 350KW",
    ],

    slugHints: [
      "voltmore-350kw",
    ],

    models: [
      "VMGI-350KW-1",
      "VMGI-350KW-2",
    ],
  },
];

function sleep(ms) {
  return new Promise(
    (resolve) =>
      setTimeout(
        resolve,
        ms
      )
  );
}

function normalizeMatchText(
  value = ""
) {
  return String(
    value
  )
    .toLowerCase()
    .replace(
      /&/g,
      " and "
    )
    .replace(
      /[^a-z0-9.]+/g,
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

function isOfficialUrl(
  value
) {
  try {
    return OFFICIAL_HOSTS.has(
      new URL(
        value
      ).hostname.toLowerCase()
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
      const response =
        await fetch(
          url,
          {
            redirect:
              "follow",

            ...options,

            headers: {
              "user-agent":
                USER_AGENT,

              "accept-language":
                "en-US,en;q=0.9",

              ...(options.headers ||
                {}),
            },
          }
        );

      if (
        !response.ok
      ) {
        throw new Error(
          `${response.status} ${response.statusText}`
        );
      }

      return response;
    } catch (
      error
    ) {
      lastError =
        error;

      if (
        attempt <
        attempts
      ) {
        await sleep(
          700 *
            attempt
        );
      }
    }
  }

  throw new Error(
    `Failed ${url}: ${
      lastError?.message ||
      String(
        lastError
      )
    }`
  );
}

async function fetchText(
  url
) {
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

function xmlLocs(
  xml
) {
  const $ =
    load(
      xml,
      {
        xmlMode:
          true,
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
        xmlLocs(
          xml
        )
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
            depth +
              1
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
    await visit(
      seed
    );
  }

  /**
   * Direct official family-page fallbacks.
   *
   * Even if Crown's sitemap misses a page, these known
   * product slugs are still attempted.
   */
  for (
    const family of
    FAMILY_MAP
  ) {
    for (
      const slug of
      family.slugHints
    ) {
      productUrls.add(
        `${OFFICIAL_ORIGIN}/product/${slug}/`
      );
    }
  }

  return [
    ...productUrls,
  ].sort();
}

function parseCsv(
  text
) {
  const rows =
    [];

  let row =
    [];

  let field =
    "";

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

    if (
      quoted
    ) {
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

          i +=
            1;
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

      row =
        [];

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
    .slice(
      1
    )
    .filter(
      (
        values
      ) =>
        values.some(
          (
            value
          ) =>
            value !==
            ""
        )
    )
    .map(
      (
        values
      ) =>
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
  ].map(
    (
      row
    ) => ({
      id:
        row.id,

      model:
        row.model,

      name:
        row.name,

      prefix:
        row.approvedImagePrefix,

      approvedImage:
        row.approvedImage,
    })
  );
}

function familyForModel(
  model
) {
  return (
    FAMILY_MAP.find(
      (
        family
      ) =>
        family.models.includes(
          model
        )
    ) ||
    null
  );
}

async function buildOfficialPageIndex(
  urls
) {
  const pages =
    [];

  console.log(
    `Official product-page candidates: ${urls.length}`
  );

  console.log(
    "Indexing official Crown pages...\n"
  );

  for (
    let index = 0;
    index <
    urls.length;
    index += 1
  ) {
    const url =
      urls[
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

      pages.push({
        url,

        html,

        title,

        titleCompact:
          compact(
            title
          ),

        slugCompact:
          compact(
            new URL(
              url
            ).pathname
          ),
      });
    } catch {
      /**
       * Some direct fallback slug variants might not exist.
       * Sitemap-discovered official pages remain available.
       */
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
  const ranked =
    pages
      .map(
        (
          page
        ) => {
          let score =
            0;

          const reasons =
            [];

          for (
            const hint of
            family.titleHints
          ) {
            const hintCompact =
              compact(
                hint
              );

            if (
              page.titleCompact ===
              hintCompact
            ) {
              score +=
                300;

              reasons.push(
                `exact-title:${hint}`
              );
            } else if (
              page.titleCompact.includes(
                hintCompact
              )
            ) {
              score +=
                220;

              reasons.push(
                `title:${hint}`
              );
            }
          }

          for (
            const slug of
            family.slugHints
          ) {
            const slugCompact =
              compact(
                slug
              );

            if (
              page.slugCompact.includes(
                slugCompact
              )
            ) {
              score +=
                260;

              reasons.push(
                `slug:${slug}`
              );
            }
          }

          if (
            page.titleCompact.includes(
              "voltmore"
            ) &&
            family.key.startsWith(
              "voltmore-"
            )
          ) {
            score +=
              20;
          }

          if (
            (
              page.titleCompact.includes(
                "xavier"
              ) ||
              page.titleCompact.includes(
                "xaiver"
              )
            ) &&
            family.key.startsWith(
              "xavier-"
            )
          ) {
            score +=
              20;
          }

          return {
            page,
            score,
            reasons,
          };
        }
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
    ranked[
      0
    ];

  return (
    best &&
    best.score >=
      220
  )
    ? best
    : null;
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
    "flag",
    "avatar",
    "placeholder",
    "woocommerce-placeholder",
    "cropped-",
  ].some(
    (
      word
    ) =>
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
    for (
      const item of
      value
    ) {
      walkJson(
        item,
        visitor
      );
    }

    return;
  }

  for (
    const item of
    Object.values(
      value
    )
  ) {
    walkJson(
      item,
      visitor
    );
  }
}

function collectImageCandidates(
  page,
  family
) {
  const $ =
    load(
      page.html
    );

  const byUrl =
    new Map();

  const familyCompact =
    compact(
      family.titleHints[
        0
      ]
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
      familyCompact &&
      haystack.includes(
        familyCompact
      )
    ) {
      score +=
        35;
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

        180,

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

        175,

        "data-large-image",

        description
      );

      add(
        $(element).attr(
          "data-src"
        ),

        150,

        "gallery-data-src",

        description
      );

      add(
        $(element).attr(
          "src"
        ),

        130,

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
          (
            node
          ) => {
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
                (
                  type
                ) =>
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

                165,

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

    155,

    "og-image",

    page.title
  );

  add(
    $(
      'meta[name="twitter:image"]'
    ).attr(
      "content"
    ),

    145,

    "twitter-image",

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

async function prefixAlreadyExists(
  prefix
) {
  try {
    const files =
      await fs.readdir(
        APPROVED_DIR
      );

    return files.some(
      (
        file
      ) => {
        const ext =
          path
            .extname(
              file
            )
            .toLowerCase();

        return (
          IMAGE_EXTENSIONS.has(
            ext
          ) &&
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
  } catch {
    return false;
  }
}

async function removeMainPrefixFiles(
  prefix
) {
  try {
    const files =
      await fs.readdir(
        APPROVED_DIR
      );

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
  } catch {
    // Nothing to remove.
  }
}

async function downloadFamilyImage(
  family,
  pageMatch
) {
  const candidates =
    collectImageCandidates(
      pageMatch.page,
      family
    );

  if (
    !candidates.length
  ) {
    throw new Error(
      "No official image candidate found on family product page."
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

      return {
        bytes,

        ext:
          extensionFromContentType(
            contentType,
            candidate.url
          ),

        imageUrl:
          candidate.url,

        detectedVia:
          candidate.source,

        imageScore:
          candidate.score,
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
      "No image could be downloaded."
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
    "family",
    "officialPageTitle",
    "officialPageUrl",
    "officialImageUrl",
    "detectedVia",
    "savedFile",
    "error",
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
        (
          row
        ) =>
          headers
            .map(
              (
                key
              ) =>
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
    "\nRunning main catalogue importer once with source-image downloads OFF...\n"
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

  const allTargets =
    await loadCrownTargets();

  const targets =
    allTargets.filter(
      (
        target
      ) =>
        familyForModel(
          target.model
        )
    );

  console.log(
    "Crown Micro official FAMILY-PAGE image sync"
  );

  console.log(
    "==========================================="
  );

  console.log(
    `Mapped missing-family models: ${targets.length}`
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

  const pages =
    await buildOfficialPageIndex(
      urls
    );

  const familyPageCache =
    new Map();

  const familyImageCache =
    new Map();

  const audit =
    [];

  let downloaded =
    0;

  let skipped =
    0;

  let unmatchedFamily =
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

    const family =
      familyForModel(
        target.model
      );

    console.log(
      `\n[${index + 1}/${targets.length}] ${target.model}`
    );

    console.log(
      target.name
    );

    if (
      !target.prefix
    ) {
      failed +=
        1;

      audit.push({
        model:
          target.model,

        name:
          target.name,

        status:
          "failed",

        family:
          family.key,

        error:
          "Missing approvedImagePrefix",
      });

      console.log(
        "FAILED: missing approvedImagePrefix"
      );

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
      skipped +=
        1;

      audit.push({
        model:
          target.model,

        name:
          target.name,

        status:
          "skipped-existing",

        family:
          family.key,

        savedFile:
          target.approvedImage,
      });

      console.log(
        "SKIP: approved image already exists"
      );

      continue;
    }

    let pageMatch =
      familyPageCache.get(
        family.key
      );

    if (
      !pageMatch
    ) {
      pageMatch =
        findFamilyPage(
          family,
          pages
        );

      familyPageCache.set(
        family.key,
        pageMatch ||
          null
      );
    }

    if (
      !pageMatch
    ) {
      unmatchedFamily +=
        1;

      audit.push({
        model:
          target.model,

        name:
          target.name,

        status:
          "unmatched-family-page",

        family:
          family.key,

        error:
          "Official family page not found.",
      });

      console.log(
        `UNMATCHED FAMILY PAGE: ${family.key}`
      );

      continue;
    }

    console.log(
      `Family page: ${pageMatch.page.title}`
    );

    console.log(
      `URL: ${pageMatch.page.url}`
    );

    try {
      let familyImage =
        familyImageCache.get(
          family.key
        );

      if (
        !familyImage
      ) {
        familyImage =
          await downloadFamilyImage(
            family,
            pageMatch
          );

        familyImageCache.set(
          family.key,
          familyImage
        );
      }

      await removeMainPrefixFiles(
        target.prefix
      );

      const filename =
        `${target.prefix}${familyImage.ext}`;

      await fs.writeFile(
        path.join(
          APPROVED_DIR,
          filename
        ),
        familyImage.bytes
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

        family:
          family.key,

        officialPageTitle:
          pageMatch
            .page
            .title,

        officialPageUrl:
          pageMatch
            .page
            .url,

        officialImageUrl:
          familyImage.imageUrl,

        detectedVia:
          familyImage.detectedVia,

        savedFile:
          `/assets/products/${filename}`,
      });

      console.log(
        `SAVED: public/assets/products/${filename}`
      );

      console.log(
        `Image: ${familyImage.imageUrl}`
      );
    } catch (
      error
    ) {
      failed +=
        1;

      audit.push({
        model:
          target.model,

        name:
          target.name,

        status:
          "failed",

        family:
          family.key,

        officialPageTitle:
          pageMatch
            .page
            .title,

        officialPageUrl:
          pageMatch
            .page
            .url,

        error:
          error.message,
      });

      console.log(
        `FAILED: ${error.message}`
      );
    }

    await sleep(
      REQUEST_DELAY_MS
    );
  }

  const auditPath =
    path.join(
      REPORT_DIR,
      "crown-micro-family-page-image-audit.csv"
    );

  await fs.writeFile(
    auditPath,
    rowsToCsv(
      audit
    ),
    "utf8"
  );

  console.log(
    "\n==========================================="
  );

  console.log(
    `Downloaded: ${downloaded}`
  );

  console.log(
    `Skipped existing: ${skipped}`
  );

  console.log(
    `Unmatched family page: ${unmatchedFamily}`
  );

  console.log(
    `Failed: ${failed}`
  );

  console.log(
    `Mapped models: ${targets.length}`
  );

  console.log(
    "Audit: migration-output/crown-micro-family-page-image-audit.csv"
  );

  if (
    RERUN_CATALOG &&
    downloaded >
      0
  ) {
    await runMainImporter();
  }

  console.log(
    "\nDONE"
  );

  if (
    unmatchedFamily ||
    failed
  ) {
    console.log(
      "Unmatched/failed products were left unchanged; no competitor image was used."
    );
  }
}

main().catch(
  (
    error
  ) => {
    console.error(
      "\nCROWN FAMILY PAGE SYNC FAILED"
    );

    console.error(
      error
    );

    process.exitCode =
      1;
  }
);