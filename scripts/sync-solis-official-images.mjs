#!/usr/bin/env node

/**
 * Desh Solar - Solis official product image sync
 *
 * Run from:
 *   D:\desh-solar-website\frontend
 *
 * This script reads image candidates only from official Solis / SolisStorage
 * product pages, blocks competitor-store assets, and saves selected images to:
 *   public/assets/products/
 */

import fs from "node:fs/promises";
import path from "node:path";
import { load } from "cheerio";

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
  "solis-official-image-report.json"
);

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
  "AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Chrome/155.0 Safari/537.36 DeshSolarOfficialMedia/1.0";

const MIN_IMAGE_BYTES = Number(
  process.env.SOLIS_MIN_IMAGE_BYTES || 12000
);

const REQUEST_DELAY_MS = Number(
  process.env.SOLIS_IMAGE_DELAY_MS || 250
);

const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
]);

const BLOCKED_DOMAINS = [
  "ipsbazarbd.com",
  "solar.com.bd",
];

/**
 * Official manufacturer product pages.
 */
const PAGES = {
  intellihome:
    "https://www.solisstorage.com/en/product/20260208221431.html",

  flexcore:
    "https://www.solisstorage.com/my/product/flexcore-id.html",

  lowSingle:
    "https://www.solisinverters.com/global/energy_storage_inverters19/S6-EH1P%283-10%29K-L-PLUS_gl.html",

  largeSingle:
    "https://www.solisinverters.com/global/energy_storage_inverters17/S6-EH1P%2812-16%29K-L",

  lowThree:
    "https://www.solisinverters.com/global/energy_storage_inverters22/S6-EH3P%288-15%29K_gl.html",

  highThree:
    "https://www.solisinverters.com/global/energy_storage_inverters16/S6-EH3P50K-H_th.html",

  offGrid:
    "https://www.solisinverters.com/global/energy_storage_inverters13/s6_eo1p_4-5k_48.html",
};

/**
 * Exact production filenames expected by the current importer.
 *
 * Solis often publishes one official product/enclosure image for
 * an entire inverter family. In that case the same official family
 * image is saved under each exact catalogue model prefix.
 */
const TARGETS = [
  {
    prefix:
      "solis-intellihome-5kwh-od",

    page:
      PAGES.intellihome,

    hints: [
      "intellihome",
      "5kwh",
      "battery",
    ],
  },

  {
    prefix:
      "solis-intellihome-16kwh-od",

    page:
      PAGES.intellihome,

    hints: [
      "intellihome",
      "16kwh",
      "battery",
    ],
  },

  {
    prefix:
      "solis-flexcore-id-60kwh",

    page:
      PAGES.flexcore,

    hints: [
      "flexcore",
      "60",
      "storage",
      "battery",
    ],
  },

  ...[
    "solis-s6-eh1p3k-l-plus",
    "solis-s6-eh1p5k-l-plus",
    "solis-s6-eh1p6k-l-plus",
    "solis-s6-eh1p8k-l-plus",
  ].map(
    (prefix) => ({
      prefix,

      page:
        PAGES.lowSingle,

      hints: [
        "s6",
        "eh1p",
        "3-10",
        "l-plus",
        "inverter",
      ],
    })
  ),

  ...[
    "solis-s6-eh1p9-9k03-nv-yd-l",
    "solis-s6-eh1p12k03-nv-yd-l",
    "solis-s6-eh1p16k03-nv-yd-l",
    "solis-s6-eh1p18k03-nv-yd-l",
  ].map(
    (prefix) => ({
      prefix,

      page:
        PAGES.largeSingle,

      hints: [
        "s6",
        "eh1p",
        "9.9-18",
        "k03",
        "nv",
        "yd",
        "inverter",
      ],
    })
  ),

  ...[
    "solis-s6-eh3p12k02-nv-yd-l",
    "solis-s6-eh3p15k02-nv-yd-l",
    "solis-s6-eh3p18k02-nv-yd-l",
  ].map(
    (prefix) => ({
      prefix,

      page:
        PAGES.lowThree,

      hints: [
        "s6",
        "eh3p",
        "5-18",
        "k02",
        "nv",
        "yd",
        "inverter",
      ],
    })
  ),

  ...[
    "solis-s6-eh3p30k-h",
    "solis-s6-eh3p50k-h",
  ].map(
    (prefix) => ({
      prefix,

      page:
        PAGES.highThree,

      hints: [
        "s6",
        "eh3p",
        "29.9-50",
        "inverter",
      ],
    })
  ),

  {
    prefix:
      "solis-s6-eo1p",

    page:
      PAGES.offGrid,

    hints: [
      "s6",
      "eo1p",
      "4-6",
      "48",
      "inverter",
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

function normalizeUrl(
  value,
  base
) {
  if (!value) {
    return null;
  }

  try {
    const url =
      new URL(
        String(
          value
        ).trim(),
        base
      );

    url.hash =
      "";

    return url.href;
  } catch {
    return null;
  }
}

function isBlocked(
  url
) {
  try {
    const host =
      new URL(
        url
      )
        .hostname
        .toLowerCase();

    return BLOCKED_DOMAINS.some(
      (domain) =>
        host ===
          domain ||
        host.endsWith(
          `.${domain}`
        )
    );
  } catch {
    return true;
  }
}

function extensionFromUrl(
  url
) {
  try {
    const ext =
      path
        .extname(
          new URL(
            url
          ).pathname
        )
        .toLowerCase();

    return IMAGE_EXTENSIONS.has(
      ext
    )
      ? ext
      : "";
  } catch {
    return "";
  }
}

function extensionFromContentType(
  contentType,
  url
) {
  const type =
    String(
      contentType ||
        ""
    ).toLowerCase();

  if (
    type.includes(
      "webp"
    )
  ) {
    return ".webp";
  }

  if (
    type.includes(
      "png"
    )
  ) {
    return ".png";
  }

  if (
    type.includes(
      "avif"
    )
  ) {
    return ".avif";
  }

  if (
    type.includes(
      "jpeg"
    ) ||
    type.includes(
      "jpg"
    )
  ) {
    return ".jpg";
  }

  const ext =
    extensionFromUrl(
      url
    );

  return ext ===
    ".jpeg"
    ? ".jpg"
    : ext ||
        ".jpg";
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
          500 *
            attempt
        );
      }
    }
  }

  throw new Error(
    lastError
      ?.message ||
      String(
        lastError
      )
  );
}

function addCandidate(
  list,
  value,
  base,
  score,
  text = "",
  source = "page"
) {
  const url =
    normalizeUrl(
      value,
      base
    );

  if (
    !url ||
    isBlocked(
      url
    )
  ) {
    return;
  }

  const ext =
    extensionFromUrl(
      url
    );

  const looksLikeImage =
    IMAGE_EXTENSIONS.has(
      ext
    ) ||
    /image|img|photo|picture|upload|product|media|file/i.test(
      url
    );

  if (
    !looksLikeImage
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
        score
      );

    existing.text =
      `${existing.text} ${text}`
        .trim();

    return;
  }

  list.push({
    url,

    baseScore:
      score,

    text,

    source,
  });
}

function collectJsonLdImages(
  value,
  list,
  base
) {
  if (
    !value
  ) {
    return;
  }

  if (
    typeof value ===
    "string"
  ) {
    addCandidate(
      list,
      value,
      base,
      75,
      "json-ld image",
      "json-ld"
    );

    return;
  }

  if (
    Array.isArray(
      value
    )
  ) {
    value.forEach(
      (item) =>
        collectJsonLdImages(
          item,
          list,
          base
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

  if (
    value.image
  ) {
    collectJsonLdImages(
      value.image,
      list,
      base
    );
  }

  if (
    value.contentUrl
  ) {
    addCandidate(
      list,
      value.contentUrl,
      base,
      80,
      `${value.name || ""} ${value.caption || ""}`,
      "json-ld-contentUrl"
    );
  }
}

function collectCandidates(
  html,
  pageUrl
) {
  const $ =
    load(
      html
    );

  const list =
    [];

  const meta = [
    [
      'meta[property="og:image:secure_url"]',
      72,
      "og:image:secure_url",
    ],

    [
      'meta[property="og:image"]',
      70,
      "og:image",
    ],

    [
      'meta[name="twitter:image"]',
      65,
      "twitter:image",
    ],
  ];

  for (
    const [
      selector,
      score,
      source,
    ] of meta
  ) {
    $(
      selector
    ).each(
      (
        _,
        element
      ) => {
        addCandidate(
          list,
          $(
            element
          ).attr(
            "content"
          ),
          pageUrl,
          score,
          "",
          source
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
        collectJsonLdImages(
          JSON.parse(
            raw
          ),
          list,
          pageUrl
        );
      } catch {
        // Ignore malformed JSON-LD.
      }
    }
  );

  $(
    "img"
  ).each(
    (
      _,
      element
    ) => {
      const node =
        $(
          element
        );

      const text = [
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

      for (
        const attr of
        [
          "data-large_image",
          "data-original",
          "data-src",
          "data-lazy-src",
          "src",
        ]
      ) {
        addCandidate(
          list,
          node.attr(
            attr
          ),
          pageUrl,
          attr ===
            "data-large_image"
            ? 58
            : 38,
          text,
          `img:${attr}`
        );
      }

      const srcset =
        node.attr(
          "srcset"
        ) ||
        node.attr(
          "data-srcset"
        ) ||
        "";

      for (
        const part of
        srcset.split(
          ","
        )
      ) {
        const url =
          part
            .trim()
            .split(
              /\s+/
            )[0];

        if (
          url
        ) {
          addCandidate(
            list,
            url,
            pageUrl,
            44,
            text,
            "img:srcset"
          );
        }
      }
    }
  );

  $(
    "source"
  ).each(
    (
      _,
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
        ) ||
        "";

      for (
        const part of
        srcset.split(
          ","
        )
      ) {
        const url =
          part
            .trim()
            .split(
              /\s+/
            )[0];

        if (
          url
        ) {
          addCandidate(
            list,
            url,
            pageUrl,
            42,
            "",
            "source:srcset"
          );
        }
      }
    }
  );

  $(
    '[style*="url("]'
  ).each(
    (
      _,
      element
    ) => {
      const style =
        $(
          element
        ).attr(
          "style"
        ) ||
        "";

      for (
        const match of
        style.matchAll(
          /url\((['"]?)(.*?)\1\)/gi
        )
      ) {
        addCandidate(
          list,
          match[2],
          pageUrl,
          32,
          `${
            $(
              element
            ).attr(
              "class"
            ) ||
            ""
          } ${
            $(
              element
            ).attr(
              "id"
            ) ||
            ""
          }`,
          "style:url"
        );
      }
    }
  );

  /**
   * Catch image URLs embedded inside page JavaScript / JSON.
   */
  const rawImageRegex =
    /https?:\\?\/\\?\/[^"'\s<>]+?\.(?:jpe?g|png|webp|avif)(?:\?[^"'\s<>]*)?/gi;

  for (
    const match of
    html.matchAll(
      rawImageRegex
    )
  ) {
    addCandidate(
      list,
      match[0].replaceAll(
        "\\/",
        "/"
      ),
      pageUrl,
      20,
      "",
      "html-regex"
    );
  }

  return list;
}

function scoreCandidate(
  candidate,
  target
) {
  const haystack =
    `${candidate.url} ${candidate.text}`
      .toLowerCase()
      .replace(
        /%28|%29/g,
        " "
      )
      .replace(
        /[^a-z0-9.]+/g,
        " "
      );

  let score =
    candidate.baseScore;

  for (
    const rawHint of
    target.hints
  ) {
    const parts =
      rawHint
        .toLowerCase()
        .replace(
          /[^a-z0-9.]+/g,
          " "
        )
        .trim()
        .split(
          /\s+/
        )
        .filter(
          Boolean
        );

    if (
      parts.length &&
      parts.every(
        (part) =>
          haystack.includes(
            part
          )
      )
    ) {
      score +=
        18;
    } else {
      for (
        const part of
        parts
      ) {
        if (
          part.length >=
            2 &&
          haystack.includes(
            part
          )
        ) {
          score +=
            5;
        }
      }
    }
  }

  if (
    /product|inverter|battery|storage|gallery|detail|large/.test(
      haystack
    )
  ) {
    score +=
      18;
  }

  if (
    /cmsdata\.solisinverters\.com/.test(
      haystack
    )
  ) {
    score +=
      18;
  }

  if (
    /logo|favicon|icon|facebook|linkedin|youtube|instagram|wechat|qr|banner|certificate|news|case|map|flag|loading|placeholder/.test(
      haystack
    )
  ) {
    score -=
      90;
  }

  return score;
}

async function getPageCandidates(
  pageUrl,
  cache
) {
  if (
    cache.has(
      pageUrl
    )
  ) {
    return cache.get(
      pageUrl
    );
  }

  console.log(
    `\nFetching official page:\n  ${pageUrl}`
  );

  const response =
    await fetchWithRetry(
      pageUrl,
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
        pageUrl
    );

  if (
    !candidates.length
  ) {
    throw new Error(
      "No image candidates found on official page."
    );
  }

  cache.set(
    pageUrl,
    candidates
  );

  return candidates;
}

async function removeExisting(
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

    const prefixLower =
      prefix.toLowerCase();

    if (
      base ===
        prefixLower ||
      base.replace(
        /-\d+$/,
        ""
      ) ===
        prefixLower
    ) {
      await fs.rm(
        path.join(
          PRODUCT_DIR,
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

async function downloadCandidate(
  candidate,
  target
) {
  const response =
    await fetchWithRetry(
      candidate.url,
      {
        headers: {
          accept:
            "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",

          referer:
            target.page,
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
      `Not an image: ${
        contentType ||
        "unknown content-type"
      }`
    );
  }

  const bytes =
    Buffer.from(
      await response.arrayBuffer()
    );

  if (
    bytes.length <
    MIN_IMAGE_BYTES
  ) {
    throw new Error(
      `Image too small: ${bytes.length} bytes`
    );
  }

  const ext =
    extensionFromContentType(
      contentType,
      response.url ||
        candidate.url
    );

  await removeExisting(
    target.prefix
  );

  const filename =
    `${target.prefix}${ext}`;

  await fs.writeFile(
    path.join(
      PRODUCT_DIR,
      filename
    ),
    bytes
  );

  return {
    filename,

    publicPath:
      `/assets/products/${filename}`,

    bytes:
      bytes.length,

    sourceUrl:
      response.url ||
      candidate.url,
  };
}

async function syncTarget(
  target,
  cache
) {
  const candidates =
    await getPageCandidates(
      target.page,
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
              target
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
        18
      );

  const attempts =
    [];

  for (
    const candidate of
    ranked
  ) {
    try {
      const downloaded =
        await downloadCandidate(
          candidate,
          target
        );

      return {
        status:
          "downloaded",

        prefix:
          target.prefix,

        officialPage:
          target.page,

        selectedCandidateScore:
          candidate.score,

        selectedCandidateSource:
          candidate.source,

        ...downloaded,

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

    officialPage:
      target.page,

    error:
      "No valid image candidate could be downloaded.",

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
    "Solis official product image sync"
  );

  console.log(
    "================================="
  );

  console.log(
    `Hardware targets: ${TARGETS.length}`
  );

  console.log(
    "Source discovery: official Solis / SolisStorage pages only"
  );

  console.log(
    "Competitor-store assets: blocked"
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
          `  Size: ${Math.round(
            result.bytes /
              1024
          )} KB`
        );

        console.log(
          `  Source: ${result.sourceUrl}`
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

        officialPage:
          target.page,

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

  const downloaded =
    results.filter(
      (item) =>
        item.status ===
        "downloaded"
    );

  const failed =
    results.filter(
      (item) =>
        item.status ===
        "failed"
    );

  const report = {
    generatedAt:
      new Date().toISOString(),

    hardwareTargetCount:
      TARGETS.length,

    downloadedCount:
      downloaded.length,

    failedCount:
      failed.length,

    blockedDomains:
      BLOCKED_DOMAINS,

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
    "\n================================="
  );

  console.log(
    `Downloaded: ${downloaded.length}/${TARGETS.length}`
  );

  console.log(
    `Failed:     ${failed.length}`
  );

  console.log(
    `Report:     ${path.relative(
      ROOT,
      REPORT_FILE
    )}`
  );

  if (
    failed.length
  ) {
    console.log(
      "\nFailed targets:"
    );

    failed.forEach(
      (item) =>
        console.log(
          `  - ${item.prefix}: ${item.error}`
        )
    );

    process.exitCode =
      2;
  }
}

main().catch(
  (error) => {
    console.error(
      "\nSOLIS IMAGE SYNC FAILED"
    );

    console.error(
      error
    );

    process.exitCode =
      1;
  }
);