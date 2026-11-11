#!/usr/bin/env node

/**
 * Desh Solar
 * Solis remaining 27 official image sync
 *
 * PURPOSE
 * -------
 * Fill only the remaining 27 Solis products that still use placeholders.
 *
 * Existing Solis images are NOT modified.
 *
 * Sources:
 *   - solisinverters.com
 *   - solisstorage.com
 *   - official Solis CDN/media hosts
 *
 * Safety:
 *   - competitor/store images are blocked
 *   - small icons/logos/banners are rejected
 *   - image dimensions are validated with sharp
 *
 * Run from:
 *   D:\desh-solar-website\frontend
 */

import fs from "node:fs/promises";
import path from "node:path";
import { load } from "cheerio";
import sharp from "sharp";

const ROOT = process.cwd();

const PRODUCT_DIR = path.join(
  ROOT,
  "public",
  "assets",
  "products"
);

const REPORT_DIR = path.join(
  ROOT,
  "migration-output"
);

const REPORT_FILE = path.join(
  REPORT_DIR,
  "solis-remaining-27-image-report.json"
);

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
  "AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Chrome/157.0 Safari/537.36 DeshSolarOfficialMedia/2.0";

const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
]);

const MIN_BYTES = 10000;
const MIN_WIDTH = 280;
const MIN_HEIGHT = 280;
const REQUEST_DELAY_MS = 250;

const OFFICIAL_HOST_RULES = [
  "solisinverters.com",
  "ginlong.com",
  "solisstorage.com",
  "cmsdata.solisinverters.com",
  "storage-official-website.oss-eu-central-1.aliyuncs.com",
];

const BLOCKED_TEXT =
  /logo|favicon|icon|wechat|facebook|linkedin|youtube|instagram|qr|map|flag|certificate|banner|news|case|loading|placeholder|arrow|appstore|googleplay|footer|header|language/i;

/**
 * Official family pages.
 */
const FAMILY_PAGES = {
  s5gr3p:
    "https://www.solisinverters.com/bd/solarinverter5/S5-GR3P%283-20%29K_bd.html",

  s5gc25:
    "https://www.solisinverters.com/bd/solarinverter8/S5-GC%2825-50%29K_bd.html",

  s5gc50:
    "https://www.solisinverters.com/global/solarinverter12/50_60k_s5_gl.html",

  /**
   * S5-GC80K
   *
   * Official UK download center currently lists
   * S5-GC80K under Product Image.
   */
  s5gc80:
    "https://www.solisinverters.com/uk/downloadcenter",

  /**
   * Separate S5-GC100K / S5-GC110K family.
   */
  s5gc100110:
    "https://www.solisinverters.com/ie/othervideo/40289f488abfc1c6018ac0090f526220.html",

  s6eh3pLow:
    "https://www.solisinverters.com/bd/energy_storage_inverters22/S6-EH3P%288-18%29K02-NV-YD-L_bd.html",

  s6eh3p20:
    "https://www.solisinverters.com/bd/energy_storage_inverters18/S6-EH3P%2815-20%29K-H_bd.html",

  s6eh3p40:
    "https://www.solisinverters.com/global/energy_storage_inverters16/S6-EH3P50K-H_th.html",

  s6eh3p125:
    "https://www.solisinverters.com/bd/energy_storage_inverters38/S6-EH3P%2880-125%29K10-NV-YD-H_bd.html",

  s6gc:
    "https://www.solisinverters.com/bd/solarinverter28/S6-GC%2880-125%29K_bd.html",

  s6gc25:
    "https://www.solisinverters.com/bd/solarinverter32/S6-GC3P%2825-36%29K03-NV-ND_bd.html",

  s6gc40:
    "https://www.solisinverters.com/bd/solarinverter33/S6-GC3P%2840-60%29K-NV-ND_bd.html",

  s6gc150:
    "https://www.solisinverters.com/bd/solarinverter34/S6-GC3P150K07-NV-ND_bd.html",

  flexcore:
    "https://www.solisstorage.com/my/product/flexcore-id.html",
};

/**
 * Exactly the 27 missing catalogue image prefixes.
 */
const TARGETS = [
  {
    prefix: "solis-flexcore-id-80kwh",
    family: "flexcore",
    hints: [
      "flexcore",
      "storage",
      "battery",
    ],
    copyFromPrefix: "solis-flexcore-id-60kwh",
  },

  {
    prefix: "solis-s5-gc25k",
    family: "s5gc25",
    hints: [
      "s5",
      "gc",
      "25",
      "50",
    ],
  },

  {
    prefix: "solis-s5-gc30k",
    family: "s5gc25",
    hints: [
      "s5",
      "gc",
      "25",
      "50",
    ],
  },

  {
    prefix: "solis-s5-gc40k",
    family: "s5gc25",
    hints: [
      "s5",
      "gc",
      "25",
      "50",
    ],
  },

  {
    prefix: "solis-s5-gc50k",
    family: "s5gc50",
    hints: [
      "s5",
      "gc",
      "50",
      "60",
    ],
  },

  {
    prefix: "solis-s5-gc60k",
    family: "s5gc50",
    hints: [
      "s5",
      "gc",
      "50",
      "60",
    ],
  },

  {
    prefix: "solis-s5-gc80k",
    family: "s5gc80",
    hints: [
      "s5",
      "gc80",
      "s5-gc80k",
      "80",
      "80k",
      "product",
      "image",
      "inverter",
    ],
  },

  {
    prefix: "solis-s5-gc100k",
    family: "s5gc100110",
    hints: [
      "s5",
      "gc",
      "100",
      "110",
      "100k",
      "s5-gc",
      "inverter",
    ],
  },

  {
    prefix: "solis-s5-gc110k",
    family: "s5gc100110",
    hints: [
      "s5",
      "gc",
      "100",
      "110",
      "110k",
      "s5-gc",
      "inverter",
    ],
  },

  {
    prefix: "solis-s5-gr3p3k",
    family: "s5gr3p",
    hints: [
      "s5",
      "gr3p",
      "3",
      "20",
    ],
  },

  {
    prefix: "solis-s5-gr3p5k",
    family: "s5gr3p",
    hints: [
      "s5",
      "gr3p",
      "3",
      "20",
    ],
  },

  {
    prefix: "solis-s5-gr3p10k",
    family: "s5gr3p",
    hints: [
      "s5",
      "gr3p",
      "3",
      "20",
    ],
  },

  {
    prefix: "solis-s5-gr3p15k",
    family: "s5gr3p",
    hints: [
      "s5",
      "gr3p",
      "3",
      "20",
    ],
  },

  {
    prefix: "solis-s5-gr3p20k",
    family: "s5gr3p",
    hints: [
      "s5",
      "gr3p",
      "3",
      "20",
    ],
  },

  {
    prefix: "solis-s6-eh3p10k02-nv-yd-l",
    family: "s6eh3pLow",
    hints: [
      "s6",
      "eh3p",
      "8",
      "18",
      "k02",
      "nv",
      "yd",
    ],
  },

  {
    prefix: "solis-s6-eh3p125k10-nv-yd-h",
    family: "s6eh3p125",
    hints: [
      "s6",
      "eh3p",
      "80",
      "125",
      "k10",
    ],
  },

  {
    prefix: "solis-s6-eh3p20k-h",
    family: "s6eh3p20",
    hints: [
      "s6",
      "eh3p",
      "15",
      "20",
    ],
  },

  {
    prefix: "solis-s6-eh3p40k-h",
    family: "s6eh3p40",
    hints: [
      "s6",
      "eh3p",
      "30",
      "50",
    ],
  },

  {
    prefix: "solis-s6-gc80k",
    family: "s6gc",
    hints: [
      "s6",
      "gc",
      "80",
      "125",
    ],
  },

  {
    prefix: "solis-s6-gc100k",
    family: "s6gc",
    hints: [
      "s6",
      "gc",
      "80",
      "125",
    ],
  },

  {
    prefix: "solis-s6-gc110k",
    family: "s6gc",
    hints: [
      "s6",
      "gc",
      "80",
      "125",
    ],
  },

  {
    prefix: "solis-s6-gc125k",
    family: "s6gc",
    hints: [
      "s6",
      "gc",
      "80",
      "125",
    ],
  },

  {
    prefix: "solis-s6-gc3p25k03-nv-nd",
    family: "s6gc25",
    hints: [
      "s6",
      "gc3p",
      "25",
      "36",
      "nv",
      "nd",
    ],
  },

  {
    prefix: "solis-s6-gc3p30k03-nv-nd",
    family: "s6gc25",
    hints: [
      "s6",
      "gc3p",
      "25",
      "36",
      "nv",
      "nd",
    ],
  },

  {
    prefix: "solis-s6-gc3p40k03-nv-nd",
    family: "s6gc40",
    hints: [
      "s6",
      "gc3p",
      "40",
      "60",
      "nv",
      "nd",
    ],
  },

  {
    prefix: "solis-s6-gc3p50k04-nv-nd",
    family: "s6gc40",
    hints: [
      "s6",
      "gc3p",
      "40",
      "60",
      "nv",
      "nd",
    ],
  },

  {
    prefix: "solis-s6-gc3p150k07-nv-nd",
    family: "s6gc150",
    hints: [
      "s6",
      "gc3p",
      "150",
      "nv",
      "nd",
    ],
  },
];

function sleep(ms) {
  return new Promise(
    (resolve) =>
      setTimeout(resolve, ms)
  );
}

function normalizeUrl(value, base) {
  if (!value) {
    return null;
  }

  try {
    const clean = String(value)
      .replaceAll("\\/", "/")
      .trim();

    const url = new URL(clean, base);

    url.hash = "";

    return url.href;
  } catch {
    return null;
  }
}

function isOfficialUrl(value) {
  try {
    const host = new URL(value)
      .hostname
      .toLowerCase();

    return OFFICIAL_HOST_RULES.some(
      (allowed) =>
        host === allowed ||
        host.endsWith(`.${allowed}`)
    );
  } catch {
    return false;
  }
}

function imageExtensionFromUrl(value) {
  try {
    return path
      .extname(
        new URL(value).pathname
      )
      .toLowerCase();
  } catch {
    return "";
  }
}

function extensionFromContentType(
  contentType,
  url
) {
  const type = String(
    contentType || ""
  ).toLowerCase();

  if (
    type.includes("webp")
  ) {
    return ".webp";
  }

  if (
    type.includes("png")
  ) {
    return ".png";
  }

  if (
    type.includes("avif")
  ) {
    return ".avif";
  }

  if (
    type.includes("jpeg") ||
    type.includes("jpg")
  ) {
    return ".jpg";
  }

  const ext =
    imageExtensionFromUrl(url);

  if (
    ext === ".jpeg"
  ) {
    return ".jpg";
  }

  return IMAGE_EXTENSIONS.has(ext)
    ? ext
    : ".jpg";
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

              ...(
                options.headers ||
                {}
              ),
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
          attempt * 500
        );
      }
    }
  }

  throw new Error(
    lastError?.message ||
      String(lastError)
  );
}

function addCandidate(
  list,
  rawValue,
  base,
  baseScore,
  source,
  text = ""
) {
  const url =
    normalizeUrl(
      rawValue,
      base
    );

  if (
    !url ||
    !isOfficialUrl(url)
  ) {
    return;
  }

  const combined =
    `${url} ${text}`
      .toLowerCase();

  if (
    BLOCKED_TEXT.test(
      combined
    )
  ) {
    return;
  }

  const ext =
    imageExtensionFromUrl(
      url
    );

  if (
    ext &&
    !IMAGE_EXTENSIONS.has(
      ext
    )
  ) {
    return;
  }

  const existing =
    list.find(
      (item) =>
        item.url ===
        url
    );

  if (
    existing
  ) {
    existing.baseScore =
      Math.max(
        existing.baseScore,
        baseScore
      );

    existing.text =
      `${existing.text} ${text}`
        .trim();

    return;
  }

  list.push({
    url,
    baseScore,
    source,
    text,
  });
}

function walkJson(
  value,
  visitor
) {
  if (!value) {
    return;
  }

  if (
    Array.isArray(value)
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

  if (
    typeof value !==
    "object"
  ) {
    return;
  }

  visitor(value);

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

function collectCandidates(
  html,
  pageUrl
) {
  const $ =
    load(html);

  const candidates =
    [];

  const metas = [
    [
      'meta[property="og:image:secure_url"]',
      170,
    ],

    [
      'meta[property="og:image"]',
      165,
    ],

    [
      'meta[name="twitter:image"]',
      155,
    ],
  ];

  for (
    const [
      selector,
      score,
    ] of metas
  ) {
    $(
      selector
    ).each(
      (
        _,
        element
      ) => {
        addCandidate(
          candidates,
          $(
            element
          ).attr(
            "content"
          ),
          pageUrl,
          score,
          selector,
          ""
        );
      }
    );
  }

  $(
    'script[type="application/ld+json"]'
  ).each(
    (
      _,
      element
    ) => {
      const raw =
        $(
          element
        )
          .text()
          .trim();

      if (
        !raw
      ) {
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
            const text =
              `${
                node.name ||
                ""
              } ${
                node.caption ||
                ""
              } ${
                node.description ||
                ""
              }`;

            if (
              typeof node.image ===
              "string"
            ) {
              addCandidate(
                candidates,
                node.image,
                pageUrl,
                150,
                "json:image",
                text
              );
            }

            if (
              Array.isArray(
                node.image
              )
            ) {
              node.image.forEach(
                (
                  image
                ) => {
                  if (
                    typeof image ===
                    "string"
                  ) {
                    addCandidate(
                      candidates,
                      image,
                      pageUrl,
                      150,
                      "json:image",
                      text
                    );
                  } else {
                    addCandidate(
                      candidates,
                      image?.url ||
                        image?.contentUrl,
                      pageUrl,
                      150,
                      "json:image",
                      `${
                        text
                      } ${
                        image?.name ||
                        ""
                      }`
                    );
                  }
                }
              );
            }

            addCandidate(
              candidates,
              node.contentUrl,
              pageUrl,
              145,
              "json:contentUrl",
              text
            );
          }
        );
      } catch {
        // Ignore broken JSON-LD.
      }
    }
  );

  $(
    "img"
  ).each(
    (
      index,
      element
    ) => {
      const node =
        $(
          element
        );

      const text =
        [
          node.attr(
            "alt"
          ),

          node.attr(
            "title"
          ),

          node.attr(
            "class"
          ),

          node.attr(
            "id"
          ),
        ]
          .filter(
            Boolean
          )
          .join(
            " "
          );

      const attrs = [
        [
          "data-large_image",
          145,
        ],

        [
          "data-original",
          135,
        ],

        [
          "data-src",
          130,
        ],

        [
          "data-lazy-src",
          128,
        ],

        [
          "src",
          120,
        ],
      ];

      for (
        const [
          attr,
          score,
        ] of attrs
      ) {
        addCandidate(
          candidates,
          node.attr(
            attr
          ),
          pageUrl,
          score -
            index *
              0.1,
          `img:${attr}`,
          text
        );
      }

      const srcsets = [
        node.attr(
          "srcset"
        ),

        node.attr(
          "data-srcset"
        ),
      ].filter(
        Boolean
      );

      for (
        const srcset of
        srcsets
      ) {
        for (
          const piece of
          srcset.split(
            ","
          )
        ) {
          const src =
            piece
              .trim()
              .split(
                /\s+/
              )[0];

          addCandidate(
            candidates,
            src,
            pageUrl,
            132 -
              index *
                0.1,
            "srcset",
            text
          );
        }
      }
    }
  );

  $(
    "source"
  ).each(
    (
      index,
      element
    ) => {
      const srcset =
        $(
          element
        ).attr(
          "srcset"
        ) ||
        $(
          element
        ).attr(
          "data-srcset"
        );

      if (
        !srcset
      ) {
        return;
      }

      for (
        const piece of
        srcset.split(
          ","
        )
      ) {
        const src =
          piece
            .trim()
            .split(
              /\s+/
            )[0];

        addCandidate(
          candidates,
          src,
          pageUrl,
          125 -
            index *
              0.1,
          "source:srcset"
        );
      }
    }
  );

  /**
   * Some official download-center product images
   * may be exposed as direct links rather than <img>.
   */
  $(
    "a[href]"
  ).each(
    (
      index,
      element
    ) => {
      const node =
        $(
          element
        );

      const href =
        node.attr(
          "href"
        );

      const resolved =
        normalizeUrl(
          href,
          pageUrl
        );

      if (
        !resolved
      ) {
        return;
      }

      const ext =
        imageExtensionFromUrl(
          resolved
        );

      if (
        !IMAGE_EXTENSIONS.has(
          ext
        )
      ) {
        return;
      }

      const text =
        `${
          node.text() ||
          ""
        } ${
          node.attr(
            "title"
          ) ||
          ""
        }`;

      addCandidate(
        candidates,
        href,
        pageUrl,
        140 -
          index *
            0.05,
        "a:href",
        text
      );
    }
  );

  const rawRegex =
    /https?:\\?\/\\?\/[^"'<>\\\s]+?\.(?:png|jpe?g|webp|avif)(?:\?[^"'<>\\\s]*)?/gi;

  for (
    const match of
    html.matchAll(
      rawRegex
    )
  ) {
    addCandidate(
      candidates,
      match[0],
      pageUrl,
      80,
      "raw-html"
    );
  }

  return candidates;
}

function scoreCandidate(
  candidate,
  hints
) {
  const text =
    `${candidate.url} ${candidate.text}`
      .toLowerCase()
      .replace(
        /[^a-z0-9.]+/g,
        " "
      );

  let score =
    candidate.baseScore;

  if (
    candidate.url.includes(
      "cmsdata.solisinverters.com"
    )
  ) {
    score +=
      35;
  }

  if (
    candidate.url.includes(
      "storage-official-website"
    )
  ) {
    score +=
      35;
  }

  if (
    /product|inverter|battery|storage|gallery|detail|proimg|goods/.test(
      text
    )
  ) {
    score +=
      20;
  }

  for (
    const rawHint of
    hints
  ) {
    const hint =
      String(
        rawHint
      )
        .toLowerCase()
        .replace(
          /[^a-z0-9.]+/g,
          " "
        )
        .trim();

    if (
      !hint
    ) {
      continue;
    }

    if (
      text.includes(
        hint
      )
    ) {
      score +=
        12;
    }

    const pieces =
      hint
        .split(
          /\s+/
        )
        .filter(
          (
            item
          ) =>
            item.length >=
            2
        );

    for (
      const piece of
      pieces
    ) {
      if (
        text.includes(
          piece
        )
      ) {
        score +=
          3;
      }
    }
  }

  if (
    BLOCKED_TEXT.test(
      text
    )
  ) {
    score -=
      200;
  }

  return score;
}

async function getFamilyCandidates(
  familyKey,
  cache
) {
  if (
    cache.has(
      familyKey
    )
  ) {
    return cache.get(
      familyKey
    );
  }

  const page =
    FAMILY_PAGES[
      familyKey
    ];

  if (
    !page
  ) {
    throw new Error(
      `Missing family page: ${familyKey}`
    );
  }

  console.log(
    `\nOfficial family page:\n  ${page}`
  );

  const response =
    await fetchWithRetry(
      page,
      {
        headers: {
          accept:
            "text/html,application/xhtml+xml",
        },
      }
    );

  const html =
    await response.text();

  const candidates =
    collectCandidates(
      html,
      response.url ||
        page
    );

  cache.set(
    familyKey,
    candidates
  );

  console.log(
    `  candidates found: ${candidates.length}`
  );

  return candidates;
}

async function downloadAndValidate(
  candidate,
  officialPage
) {
  const response =
    await fetchWithRetry(
      candidate.url,
      {
        headers: {
          accept:
            "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",

          referer:
            officialPage,
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
      `Not image: ${
        contentType ||
        "unknown"
      }`
    );
  }

  const bytes =
    Buffer.from(
      await response.arrayBuffer()
    );

  if (
    bytes.length <
    MIN_BYTES
  ) {
    throw new Error(
      `Too small: ${bytes.length} bytes`
    );
  }

  let metadata;

  try {
    metadata =
      await sharp(
        bytes
      ).metadata();
  } catch (
    error
  ) {
    throw new Error(
      `Sharp validation failed: ${error.message}`
    );
  }

  const width =
    Number(
      metadata.width ||
        0
    );

  const height =
    Number(
      metadata.height ||
        0
    );

  if (
    width <
      MIN_WIDTH ||
    height <
      MIN_HEIGHT
  ) {
    throw new Error(
      `Dimensions too small: ${width}x${height}`
    );
  }

  const ratio =
    width /
    height;

  if (
    ratio >
      3.2 ||
    ratio <
      0.25
  ) {
    throw new Error(
      `Suspicious aspect ratio: ${width}x${height}`
    );
  }

  return {
    bytes,

    width,

    height,

    contentType,

    finalUrl:
      response.url ||
      candidate.url,
  };
}

async function findExistingFile(
  prefix
) {
  const files =
    await fs
      .readdir(
        PRODUCT_DIR
      )
      .catch(
        () => []
      );

  const lower =
    prefix.toLowerCase();

  return (
    files.find(
      (
        file
      ) => {
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

        return (
          base ===
            lower ||
          base.startsWith(
            `${lower}-`
          )
        );
      }
    ) ||
    null
  );
}

async function copyFromExisting(
  fromPrefix,
  toPrefix
) {
  const source =
    await findExistingFile(
      fromPrefix
    );

  if (
    !source
  ) {
    throw new Error(
      `Source local image not found: ${fromPrefix}`
    );
  }

  const ext =
    path
      .extname(
        source
      )
      .toLowerCase();

  const target =
    `${toPrefix}${ext}`;

  await fs.copyFile(
    path.join(
      PRODUCT_DIR,
      source
    ),

    path.join(
      PRODUCT_DIR,
      target
    )
  );

  const stat =
    await fs.stat(
      path.join(
        PRODUCT_DIR,
        target
      )
    );

  return {
    filename:
      target,

    publicPath:
      `/assets/products/${target}`,

    bytes:
      stat.size,

    copiedFrom:
      source,
  };
}

async function saveImage(
  prefix,
  validated,
  sourceUrl
) {
  const ext =
    extensionFromContentType(
      validated.contentType,
      validated.finalUrl
    );

  const filename =
    `${prefix}${ext}`;

  const output =
    path.join(
      PRODUCT_DIR,
      filename
    );

  await fs.writeFile(
    output,
    validated.bytes
  );

  return {
    filename,

    publicPath:
      `/assets/products/${filename}`,

    bytes:
      validated.bytes.length,

    width:
      validated.width,

    height:
      validated.height,

    sourceUrl,
  };
}

async function syncTarget(
  target,
  cache
) {
  /**
   * Do not overwrite a completed target.
   */
  const existing =
    await findExistingFile(
      target.prefix
    );

  if (
    existing
  ) {
    return {
      status:
        "already-exists",

      prefix:
        target.prefix,

      file:
        existing,
    };
  }

  /**
   * Reuse already downloaded official family image
   * only when explicitly allowed.
   */
  if (
    target.copyFromPrefix
  ) {
    try {
      const copied =
        await copyFromExisting(
          target.copyFromPrefix,
          target.prefix
        );

      return {
        status:
          "copied-official-family-image",

        prefix:
          target.prefix,

        family:
          target.family,

        ...copied,
      };
    } catch (
      error
    ) {
      console.log(
        `  local family copy unavailable: ${error.message}`
      );
    }
  }

  const page =
    FAMILY_PAGES[
      target.family
    ];

  const candidates =
    await getFamilyCandidates(
      target.family,
      cache
    );

  const ranked =
    candidates
      .map(
        (
          candidate
        ) => ({
          ...candidate,

          score:
            scoreCandidate(
              candidate,
              target.hints ||
                []
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
      )
      .slice(
        0,
        60
      );

  const attempts =
    [];

  for (
    const candidate of
    ranked
  ) {
    try {
      const validated =
        await downloadAndValidate(
          candidate,
          page
        );

      const saved =
        await saveImage(
          target.prefix,
          validated,
          candidate.url
        );

      return {
        status:
          "downloaded",

        prefix:
          target.prefix,

        family:
          target.family,

        officialPage:
          page,

        candidateScore:
          candidate.score,

        candidateSource:
          candidate.source,

        finalSourceUrl:
          validated.finalUrl,

        ...saved,

        attempts,
      };
    } catch (
      error
    ) {
      attempts.push({
        url:
          candidate.url,

        score:
          candidate.score,

        source:
          candidate.source,

        error:
          error.message,
      });
    }
  }

  return {
    status:
      "failed",

    prefix:
      target.prefix,

    family:
      target.family,

    officialPage:
      page,

    error:
      "No safe official product image passed validation.",

    attempts,
  };
}

async function main() {
  await fs.mkdir(
    PRODUCT_DIR,
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

  console.log(
    "Solis remaining 27 official image sync"
  );

  console.log(
    "======================================"
  );

  console.log(
    `Targets: ${TARGETS.length}`
  );

  console.log(
    "Existing Solis images: preserved"
  );

  console.log(
    "Competitor images: blocked"
  );

  const cache =
    new Map();

  const results =
    [];

  for (
    let index = 0;
    index <
      TARGETS.length;
    index += 1
  ) {
    const target =
      TARGETS[
        index
      ];

    console.log(
      `\n[${
        index + 1
      }/${
        TARGETS.length
      }] ${
        target.prefix
      }`
    );

    try {
      const result =
        await syncTarget(
          target,
          cache
        );

      results.push(
        result
      );

      if (
        result.status ===
        "downloaded"
      ) {
        console.log(
          `  OK: ${result.publicPath}`
        );

        console.log(
          `  Dimensions: ${result.width}x${result.height}`
        );

        console.log(
          `  Size: ${Math.round(
            result.bytes /
              1024
          )} KB`
        );

        console.log(
          `  Official source: ${result.finalSourceUrl}`
        );
      } else if (
        result.status ===
        "copied-official-family-image"
      ) {
        console.log(
          `  OK family copy: ${result.publicPath}`
        );

        console.log(
          `  From: ${result.copiedFrom}`
        );
      } else if (
        result.status ===
        "already-exists"
      ) {
        console.log(
          `  SKIP existing: ${result.file}`
        );
      } else {
        console.warn(
          `  FAILED: ${result.error}`
        );
      }
    } catch (
      error
    ) {
      results.push({
        status:
          "failed",

        prefix:
          target.prefix,

        family:
          target.family,

        error:
          error.message,

        attempts:
          [],
      });

      console.warn(
        `  FAILED: ${error.message}`
      );
    }

    await sleep(
      REQUEST_DELAY_MS
    );
  }

  const completed =
    results.filter(
      (
        result
      ) =>
        [
          "downloaded",
          "copied-official-family-image",
          "already-exists",
        ].includes(
          result.status
        )
    );

  const failed =
    results.filter(
      (
        result
      ) =>
        result.status ===
        "failed"
    );

  const report = {
    generatedAt:
      new Date().toISOString(),

    targetCount:
      TARGETS.length,

    completedCount:
      completed.length,

    failedCount:
      failed.length,

    results,
  };

  await fs.writeFile(
    REPORT_FILE,

    JSON.stringify(
      report,
      null,
      2
    ) +
      "\n",

    "utf8"
  );

  console.log(
    "\n======================================"
  );

  console.log(
    `Completed: ${completed.length}/${TARGETS.length}`
  );

  console.log(
    `Failed:    ${failed.length}`
  );

  console.log(
    `Report:    ${path.relative(
      ROOT,
      REPORT_FILE
    )}`
  );

  if (
    failed.length
  ) {
    console.log(
      "\nStill missing:"
    );

    failed.forEach(
      (
        item
      ) => {
        console.log(
          `  - ${item.prefix}`
        );
      }
    );

    process.exitCode =
      2;
  }
}

main().catch(
  (
    error
  ) => {
    console.error(
      "\nSOLIS REMAINING IMAGE SYNC FAILED"
    );

    console.error(
      error
    );

    process.exitCode =
      1;
  }
);