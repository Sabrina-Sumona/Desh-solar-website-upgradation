#!/usr/bin/env node

/**
 * Desh Solar
 * Solis missing official image repair
 *
 * Repairs only the 8 Solis products that were not downloaded
 * by sync-solis-official-images.mjs.
 *
 * Official source pages only:
 *   - solisinverters.com
 *   - cmsdata.solisinverters.com
 *
 * Run from:
 *   D:\desh-solar-website\frontend
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
  "solis-missing-official-image-report.json"
);

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
  "AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Chrome/155.0 Safari/537.36 DeshSolarOfficialMedia/1.1";

const MIN_IMAGE_BYTES = 10000;

const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
]);

const PAGES = {
  /**
   * Official current Solis page:
   * S6-EH1P(9.9-18)K03-NV-YD-L
   */
  largeSingle:
    "https://www.solisinverters.com/global/energy_storage_inverters17/S6-EH1P%289.9-18%29K-L_gl.html",

  /**
   * Official current Solis page:
   * S6-EH3P(5-18)K02-NV-YD-L
   */
  lowThree:
    "https://www.solisinverters.com/global/energy_storage_inverters22/S6-EH3P%285-18%29K_gl.html",

  /**
   * Official current Solis page:
   * S6-EO1P(4-6)K-48
   */
  offGrid:
    "https://www.solisinverters.com/global/energy_storage_inverters13/s6_eo1p_4-6k_48.html",
};

const TARGETS = [
  {
    prefix:
      "solis-s6-eh1p9-9k03-nv-yd-l",

    page:
      PAGES.largeSingle,

    family:
      "S6-EH1P(9.9-18)K03-NV-YD-L",
  },

  {
    prefix:
      "solis-s6-eh1p12k03-nv-yd-l",

    page:
      PAGES.largeSingle,

    family:
      "S6-EH1P(9.9-18)K03-NV-YD-L",
  },

  {
    prefix:
      "solis-s6-eh1p16k03-nv-yd-l",

    page:
      PAGES.largeSingle,

    family:
      "S6-EH1P(9.9-18)K03-NV-YD-L",
  },

  {
    prefix:
      "solis-s6-eh1p18k03-nv-yd-l",

    page:
      PAGES.largeSingle,

    family:
      "S6-EH1P(9.9-18)K03-NV-YD-L",
  },

  {
    prefix:
      "solis-s6-eh3p12k02-nv-yd-l",

    page:
      PAGES.lowThree,

    family:
      "S6-EH3P(5-18)K02-NV-YD-L",
  },

  {
    prefix:
      "solis-s6-eh3p15k02-nv-yd-l",

    page:
      PAGES.lowThree,

    family:
      "S6-EH3P(5-18)K02-NV-YD-L",
  },

  {
    prefix:
      "solis-s6-eh3p18k02-nv-yd-l",

    page:
      PAGES.lowThree,

    family:
      "S6-EH3P(5-18)K02-NV-YD-L",
  },

  {
    prefix:
      "solis-s6-eo1p",

    page:
      PAGES.offGrid,

    family:
      "S6-EO1P(4-6)K-48",
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
    lastError?.message ||
    String(
      lastError
    )
  );
}

function normalizeUrl(
  value,
  base
) {
  if (
    !value
  ) {
    return null;
  }

  try {
    const url =
      new URL(
        String(
          value
        )
          .replaceAll(
            "\\/",
            "/"
          )
          .trim(),
        base
      );

    url.hash =
      "";

    return url.href;
  } catch {
    return null;
  }
}

function extensionFromUrl(
  url
) {
  try {
    return path
      .extname(
        new URL(
          url
        ).pathname
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

  if (
    ext ===
    ".jpeg"
  ) {
    return ".jpg";
  }

  return IMAGE_EXTENSIONS.has(
    ext
  )
    ? ext
    : ".jpg";
}

function allowedImageHost(
  url
) {
  try {
    const host =
      new URL(
        url
      )
        .hostname
        .toLowerCase();

    return (
      host ===
        "www.solisinverters.com" ||
      host ===
        "solisinverters.com" ||
      host ===
        "cmsdata.solisinverters.com" ||
      host.endsWith(
        ".solisinverters.com"
      )
    );
  } catch {
    return false;
  }
}

function addCandidate(
  list,
  value,
  base,
  score,
  source,
  text = ""
) {
  const url =
    normalizeUrl(
      value,
      base
    );

  if (
    !url ||
    !allowedImageHost(
      url
    )
  ) {
    return;
  }

  const lower =
    url.toLowerCase();

  if (
    /logo|favicon|gotop|map|flag|wechat|facebook|linkedin|youtube|instagram|qr|loading|icon/.test(
      lower
    )
  ) {
    return;
  }

  const ext =
    extensionFromUrl(
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
    existing.score =
      Math.max(
        existing.score,
        score
      );

    existing.text =
      `${existing.text} ${text}`
        .trim();

    return;
  }

  list.push({
    url,
    score,
    source,
    text,
  });
}

function walkJson(
  value,
  visitor
) {
  if (
    !value
  ) {
    return;
  }

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

  if (
    typeof value !==
    "object"
  ) {
    return;
  }

  visitor(
    value
  );

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
    load(
      html
    );

  const list =
    [];

  addCandidate(
    list,
    $(
      'meta[property="og:image:secure_url"]'
    ).attr(
      "content"
    ),
    pageUrl,
    150,
    "og:image:secure_url"
  );

  addCandidate(
    list,
    $(
      'meta[property="og:image"]'
    ).attr(
      "content"
    ),
    pageUrl,
    145,
    "og:image"
  );

  addCandidate(
    list,
    $(
      'meta[name="twitter:image"]'
    ).attr(
      "content"
    ),
    pageUrl,
    140,
    "twitter:image"
  );

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
            const images =
              node.image;

            if (
              typeof images ===
              "string"
            ) {
              addCandidate(
                list,
                images,
                pageUrl,
                135,
                "json-ld:image",
                node.name ||
                  ""
              );
            }

            if (
              Array.isArray(
                images
              )
            ) {
              images.forEach(
                (
                  image
                ) => {
                  if (
                    typeof image ===
                    "string"
                  ) {
                    addCandidate(
                      list,
                      image,
                      pageUrl,
                      135,
                      "json-ld:image",
                      node.name ||
                        ""
                    );
                  } else if (
                    image?.url ||
                    image?.contentUrl
                  ) {
                    addCandidate(
                      list,
                      image.url ||
                        image.contentUrl,
                      pageUrl,
                      135,
                      "json-ld:image",
                      `${
                        node.name ||
                        ""
                      } ${
                        image.name ||
                        ""
                      }`
                    );
                  }
                }
              );
            }

            if (
              node.contentUrl
            ) {
              addCandidate(
                list,
                node.contentUrl,
                pageUrl,
                130,
                "json-ld:contentUrl",
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

      const attributes =
        [
          [
            "data-large_image",
            125,
          ],
          [
            "data-original",
            115,
          ],
          [
            "data-src",
            110,
          ],
          [
            "data-lazy-src",
            108,
          ],
          [
            "src",
            100,
          ],
        ];

      for (
        const [
          attribute,
          score,
        ] of attributes
      ) {
        addCandidate(
          list,
          node.attr(
            attribute
          ),
          pageUrl,
          score,
          `img:${attribute}`,
          text
        );
      }

      const srcsets =
        [
          node.attr(
            "srcset"
          ),
          node.attr(
            "data-srcset"
          ),
        ]
          .filter(
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
          const imageUrl =
            piece
              .trim()
              .split(
                /\s+/
              )[0];

          addCandidate(
            list,
            imageUrl,
            pageUrl,
            118,
            "srcset",
            text
          );
        }
      }
    }
  );

  /**
   * Solis sometimes embeds product images in script data.
   */
  const regex =
    /https?:\\?\/\\?\/[^"'<>\\\s]+?\.(?:png|jpe?g|webp|avif)(?:\?[^"'<>\\\s]*)?/gi;

  for (
    const match of
    html.matchAll(
      regex
    )
  ) {
    addCandidate(
      list,
      match[0],
      pageUrl,
      80,
      "raw-html"
    );
  }

  return list;
}

function rankCandidates(
  candidates
) {
  return candidates
    .map(
      (
        candidate,
        index
      ) => {
        const lower =
          `${
            candidate.url
          } ${
            candidate.text
          }`
            .toLowerCase();

        let score =
          candidate.score;

        if (
          lower.includes(
            "cmsdata.solisinverters.com"
          )
        ) {
          score +=
            45;
        }

        if (
          /product|inverter|energy|storage|detail|proimg|goods/.test(
            lower
          )
        ) {
          score +=
            20;
        }

        if (
          /banner|news|case|certificate|customer|footer|header|map|logo|language/.test(
            lower
          )
        ) {
          score -=
            120;
        }

        /**
         * Earlier DOM position is slightly preferred.
         */
        score -=
          index *
          0.05;

        return {
          ...candidate,
          finalScore:
            score,
        };
      }
    )
    .sort(
      (
        a,
        b
      ) =>
        b.finalScore -
        a.finalScore
    );
}

async function getCandidates(
  page,
  cache
) {
  if (
    cache.has(
      page
    )
  ) {
    return cache.get(
      page
    );
  }

  console.log(
    `\nOfficial page:\n  ${page}`
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

  const ranked =
    rankCandidates(
      collectCandidates(
        html,
        response.url ||
          page
      )
    );

  cache.set(
    page,
    ranked
  );

  console.log(
    `  Candidate images: ${ranked.length}`
  );

  return ranked;
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

  const prefixLower =
    prefix.toLowerCase();

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

async function downloadImage(
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
    MIN_IMAGE_BYTES
  ) {
    throw new Error(
      `Too small: ${bytes.length} bytes`
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

    candidateSource:
      candidate.source,

    candidateScore:
      candidate.finalScore,
  };
}

async function syncTarget(
  target,
  cache
) {
  const candidates =
    await getCandidates(
      target.page,
      cache
    );

  const attempts =
    [];

  /**
   * Try enough official candidates to avoid failing
   * because the first item is a small feature icon.
   */
  for (
    const candidate of
    candidates.slice(
      0,
      30
    )
  ) {
    try {
      const result =
        await downloadImage(
          candidate,
          target
        );

      return {
        status:
          "downloaded",

        prefix:
          target.prefix,

        family:
          target.family,

        officialPage:
          target.page,

        ...result,

        attempts,
      };
    } catch (
      error
    ) {
      attempts.push({
        url:
          candidate.url,

        source:
          candidate.source,

        score:
          candidate.finalScore,

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
      target.page,

    error:
      "No valid official image candidate downloaded.",

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
    "Solis missing official image repair"
  );

  console.log(
    "==================================="
  );

  console.log(
    `Missing targets: ${TARGETS.length}`
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

        family:
          target.family,

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
      250
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

    targetCount:
      TARGETS.length,

    downloadedCount:
      downloaded.length,

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
    "\n==================================="
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
      "\nStill failed:"
    );

    failed.forEach(
      (
        item
      ) =>
        console.log(
          `  - ${item.prefix}`
        )
    );

    process.exitCode =
      2;
  }
}

main().catch(
  (error) => {
    console.error(
      "\nSOLIS REPAIR FAILED"
    );

    console.error(
      error
    );

    process.exitCode =
      1;
  }
);