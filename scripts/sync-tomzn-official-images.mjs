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

const BAD_IMAGE_TERMS = [
  "logo",
  "favicon",
  "icon",
  "avatar",
  "banner",
  "header",
  "footer",
  "placeholder",
  "loading",
  "loader",
  "facebook",
  "instagram",
  "youtube",
  "linkedin",
  "payment",
  "qrcode",
  "qr-code",
  "sprite",
  "woocommerce-placeholder",
];

const TARGETS = [
  {
    prefix: "tomzn-d52-2066",
    label: "TOMZN D52-2066",
    searchTerms: [
      "D52-2066",
      "WIFI Smart 6IN1 Meter",
    ],
    knownPage:
      "https://tomzn.com/product/tomzn-wifi-smart-6in1-meter-din-rail-ac-monitor-110v-220v-100a-voltmeter-current-power-factor-active-kwh-energy-frequency-tuya/",
  },

  {
    prefix:
      "tomzn-tomzn-solar-mc4-connector-set-32a-1000v-board-and-wire-end-waterproof-pv-terminal",
    label: "TOMZN MC4 Connector 32A 1000V",
    searchTerms: [
      "MC4 connector 32A 1000V",
      "solar MC4 connector",
    ],
  },

  {
    prefix: "tomzn-tob1-63h",
    label: "TOMZN TOB1-63H",
    searchTerms: [
      "TOB1-63H",
      "2P AC MCB",
    ],
    knownPage:
      "https://tomzn.com/product/2p-50a-400v-50hz-60hz-circuit-breaker-ac-mcb-safety-breaker-c-type/",
  },

  {
    prefix: "tomzn-tob1l-63hd",
    label: "TOMZN TOB1L-63HD",
    searchTerms: [
      "TOB1L-63HD",
      "RCBO 2P",
    ],
  },

  {
    prefix: "tomzn-tob1z-125",
    label: "TOMZN TOB1Z-125",
    searchTerms: [
      "TOB1Z-125",
      "DC MCB 125A",
    ],
  },

  {
    prefix: "tomzn-tob1z-63",
    label: "TOMZN TOB1Z-63",
    searchTerms: [
      "TOB1Z-63",
      "DC MCB 500V",
    ],
    knownPage:
      "https://tomzn.com/product/2p-dc-mcb-6ka-500v-mini-circuit-breaker-3a-6a-10a-16a-20a-25a-32a-40a-50a-63a-y-connection/",
  },

  {
    prefix: "tomzn-tob3l-32f",
    label: "TOMZN TOB3L-32F",
    searchTerms: [
      "TOB3L-32F",
      "RCBO 1P+N",
    ],
  },

  {
    prefix: "tomzn-tob7z-63",
    label: "TOMZN TOB7Z-63",
    searchTerms: [
      "TOB7Z-63",
      "DC 1000V MCB",
    ],
    knownPage:
      "https://tomzn.com/product/tomzn-tob7z-63-2p-dc-1000v-solar-mini-circuit-breaker-3a-6a-10a-16a-20a-25a-32a-40a-50a-63a-dc-mcb-for-pv-system/",
  },

  {
    prefix: "tomzn-toiso-32",
    label: "TOMZN TOISO-32",
    searchTerms: [
      "TOISO-32",
      "DC isolator 1200V 32A",
    ],
  },

  {
    prefix: "tomzn-tom7z-250",
    label: "TOMZN TOM7Z-250/2300",
    searchTerms: [
      "TOM7Z-250",
      "TOM7Z-250/2300",
      "DC MCCB 250A",
    ],
  },

  {
    prefix: "tomzn-tompd-63sw",
    label: "TOMZN TOMPD-63SW",
    searchTerms: [
      "TOMPD-63SW",
      "WiFi smart circuit breaker 63A",
    ],
    knownPage:
      "https://tomzn.com/product/tomzn-2p-63a-110v-220v-tuya-wifi-smart-switch-kwh-metering-circuit-breaker-timer-with-voltage-current-and-leakage-protection/",
  },

  {
    prefix: "tomzn-topv-30",
    label: "TOMZN TOPV-30",
    searchTerms: [
      "TOPV-30",
      "PV fuse 1000V",
    ],
  },

  {
    prefix: "tomzn-topv-32x",
    label: "TOMZN TOPV-32X",
    searchTerms: [
      "TOPV-32X",
      "PV fuse holder LED",
    ],
  },

  {
    prefix: "tomzn-toq3-2p",
    label: "TOMZN TOQ3-2P/63",
    searchTerms: [
      "TOQ3-2P",
      "TOQ3-2P/63",
      "automatic transfer switch 2P",
    ],
  },

  {
    prefix: "tomzn-tovpd1-60-ec",
    label: "TOMZN TOVPD1-60-EC",
    searchTerms: [
      "TOVPD1-60-EC",
      "over under voltage protector",
    ],
    knownPage:
      "https://tomzn.com/product/tomzn-din-rail-230v-adjustable-over-and-under-voltage-protective-device-protector-relay-monitor-current-limit-63a/",
  },

  {
    prefix: "tomzn-tzg40-c",
    label: "TOMZN TZG40-C",
    searchTerms: [
      "TZG40-C",
      "AC SPD 275V",
    ],
  },

  {
    prefix: "tomzn-tzg40-pv",
    label: "TOMZN TZG40-PV",
    searchTerms: [
      "TZG40-PV",
      "DC SPD 1000V",
    ],
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

function stripTags(value) {
  return decodeHtml(
    String(value ?? "")
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function normalizeText(value) {
  return decodeHtml(String(value ?? ""))
    .toLowerCase()
    .replace(/[_/]+/g, " ")
    .replace(/[-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
    return new URL(value, baseUrl).href;
  } catch {
    return null;
  }
}

function isOfficialTomznUrl(url) {
  try {
    const host =
      new URL(url).hostname.toLowerCase();

    return (
      host === "tomzn.com" ||
      host === "www.tomzn.com" ||
      host.endsWith(".tomzn.com")
    );
  } catch {
    return false;
  }
}

function isImageUrl(url) {
  try {
    const pathname =
      new URL(url).pathname.toLowerCase();

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

function isBadImageUrl(url) {
  const lower =
    decodeHtml(
      decodeURIComponent(url)
    ).toLowerCase();

  return BAD_IMAGE_TERMS.some(
    (term) =>
      lower.includes(term)
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
      `Page request failed: HTTP ${response.status}`
    );
  }

  return await response.text();
}

function extractProductLinks(
  html,
  baseUrl
) {
  const results =
    new Map();

  const anchorRegex =
    /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  for (
    const match of
    html.matchAll(anchorRegex)
  ) {
    const url =
      normalizeUrl(
        match[1],
        baseUrl
      );

    if (
      !url ||
      !isOfficialTomznUrl(url)
    ) {
      continue;
    }

    let pathname;

    try {
      pathname =
        new URL(url).pathname;
    } catch {
      continue;
    }

    if (
      !pathname.includes(
        "/product/"
      )
    ) {
      continue;
    }

    const text =
      stripTags(
        match[2]
      );

    const current =
      results.get(url);

    if (current) {
      current.text =
        `${current.text} ${text}`.trim();
    } else {
      results.set(
        url,
        {
          url,
          text,
        }
      );
    }
  }

  return [
    ...results.values(),
  ];
}

function modelTokens(target) {
  const source =
    target.searchTerms[0];

  return normalizeText(source)
    .split(" ")
    .filter(
      (token) =>
        token.length >= 3
    );
}

function scoreProductLink(
  candidate,
  target
) {
  const haystack =
    normalizeText(
      `${candidate.url} ${candidate.text}`
    );

  let score = 0;

  for (
    const term of
    target.searchTerms
  ) {
    const normalized =
      normalizeText(term);

    if (
      haystack.includes(
        normalized
      )
    ) {
      score += 5000;
    }

    for (
      const token of
      normalized.split(" ")
    ) {
      if (
        token.length >= 3 &&
        haystack.includes(token)
      ) {
        score += 500;
      }
    }
  }

  for (
    const token of
    modelTokens(target)
  ) {
    if (
      haystack.includes(token)
    ) {
      score += 1000;
    }
  }

  return score;
}

function pageMatchesTarget(
  html,
  target
) {
  const text =
    normalizeText(
      stripTags(html)
    );

  const primary =
    normalizeText(
      target.searchTerms[0]
    );

  if (
    text.includes(primary)
  ) {
    return true;
  }

  /*
   * Some TOMZN product names do not include the exact SKU
   * in the title but include it inside the description.
   *
   * Require multiple meaningful tokens in that case.
   */

  const tokens =
    modelTokens(target);

  let matches = 0;

  for (
    const token of
    tokens
  ) {
    if (
      text.includes(token)
    ) {
      matches++;
    }
  }

  return (
    matches >=
    Math.min(
      2,
      tokens.length
    )
  );
}

async function discoverOfficialPage(
  target
) {
  /*
   * First prefer a page we have already confirmed manually.
   */

  if (target.knownPage) {
    try {
      const html =
        await fetchHtml(
          target.knownPage
        );

      if (
        pageMatchesTarget(
          html,
          target
        )
      ) {
        console.log(
          `Confirmed known page: ${target.knownPage}`
        );

        return {
          url:
            target.knownPage,
          html,
        };
      }

      console.log(
        "Known page did not pass model verification; falling back to TOMZN search."
      );
    } catch (error) {
      console.log(
        `Known page unavailable: ${
          error instanceof Error
            ? error.message
            : String(error)
        }`
      );
    }
  }

  const candidateMap =
    new Map();

  for (
    const searchTerm of
    target.searchTerms
  ) {
    const searchUrl =
      `https://tomzn.com/?s=${encodeURIComponent(
        searchTerm
      )}`;

    console.log(
      `Search: ${searchUrl}`
    );

    try {
      const html =
        await fetchHtml(
          searchUrl
        );

      for (
        const result of
        extractProductLinks(
          html,
          searchUrl
        )
      ) {
        candidateMap.set(
          result.url,
          result
        );
      }
    } catch (error) {
      console.log(
        `WARN search failed: ${
          error instanceof Error
            ? error.message
            : String(error)
        }`
      );
    }
  }

  const ranked =
    [
      ...candidateMap.values(),
    ]
      .map(
        (candidate) => ({
          ...candidate,

          score:
            scoreProductLink(
              candidate,
              target
            ),
        })
      )
      .filter(
        (candidate) =>
          candidate.score > 0
      )
      .sort(
        (a, b) =>
          b.score -
          a.score
      );

  if (!ranked.length) {
    throw new Error(
      `No TOMZN product page found for ${target.label}`
    );
  }

  /*
   * Verify candidates by loading the actual product page.
   */

  for (
    const candidate of
    ranked.slice(0, 10)
  ) {
    try {
      console.log(
        `Checking product page: ${candidate.url}`
      );

      const html =
        await fetchHtml(
          candidate.url
        );

      if (
        pageMatchesTarget(
          html,
          target
        )
      ) {
        console.log(
          `Resolved page: ${candidate.url}`
        );

        return {
          url:
            candidate.url,
          html,
        };
      }
    } catch {
      // Continue to the next search result.
    }
  }

  throw new Error(
    `No verified TOMZN product page found for ${target.label}`
  );
}

function extractMetaImage(
  html,
  baseUrl
) {
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/i,

    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["'][^>]*>/i,

    /<meta[^>]+property=["']og:image:secure_url["'][^>]+content=["']([^"']+)["'][^>]*>/i,
  ];

  for (
    const pattern of
    patterns
  ) {
    const match =
      html.match(pattern);

    if (!match) {
      continue;
    }

    const url =
      normalizeUrl(
        match[1],
        baseUrl
      );

    if (
      url &&
      isImageUrl(url) &&
      !isBadImageUrl(url)
    ) {
      return url;
    }
  }

  return null;
}

function extractWooCommerceImages(
  html,
  baseUrl
) {
  const candidates =
    [];

  /*
   * WooCommerce product gallery images.
   */

  const figureRegex =
    /<(?:div|figure)\b[^>]*(?:woocommerce-product-gallery|woocommerce-product-gallery__image)[^>]*>[\s\S]*?<\/(?:div|figure)>/gi;

  for (
    const match of
    html.matchAll(figureRegex)
  ) {
    const block =
      match[0];

    const imageRegex =
      /(?:href|src|data-src|data-large_image)=["']([^"']+\.(?:png|jpe?g|webp)(?:\?[^"']*)?)["']/gi;

    for (
      const imageMatch of
      block.matchAll(
        imageRegex
      )
    ) {
      const url =
        normalizeUrl(
          imageMatch[1],
          baseUrl
        );

      if (
        url &&
        isImageUrl(url) &&
        !isBadImageUrl(url)
      ) {
        candidates.push(url);
      }
    }
  }

  /*
   * Fallback: product image classes.
   */

  const imgRegex =
    /<img\b[^>]*(?:wp-post-image|attachment-woocommerce_single|woocommerce-product-gallery)[^>]*>/gi;

  for (
    const match of
    html.matchAll(
      imgRegex
    )
  ) {
    const tag =
      match[0];

    const srcMatch =
      tag.match(
        /\b(?:data-large_image|data-src|src)=["']([^"']+)["']/i
      );

    if (!srcMatch) {
      continue;
    }

    const url =
      normalizeUrl(
        srcMatch[1],
        baseUrl
      );

    if (
      url &&
      isImageUrl(url) &&
      !isBadImageUrl(url)
    ) {
      candidates.push(url);
    }
  }

  return [
    ...new Set(candidates),
  ];
}

function resolveProductImage(
  html,
  productPage
) {
  /*
   * For a normal WooCommerce product page, og:image is
   * generally the product's featured image.
   */

  const metaImage =
    extractMetaImage(
      html,
      productPage
    );

  if (metaImage) {
    console.log(
      `OG image: ${metaImage}`
    );

    return metaImage;
  }

  const gallery =
    extractWooCommerceImages(
      html,
      productPage
    );

  if (gallery.length) {
    console.log(
      `Gallery image: ${gallery[0]}`
    );

    return gallery[0];
  }

  throw new Error(
    "No safe product image found on official TOMZN product page"
  );
}

async function downloadImage(
  imageUrl,
  productPage
) {
  const response =
    await fetch(
      imageUrl,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/157 Safari/537.36",

          Accept:
            "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",

          Referer:
            productPage,
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
      `Rejected non-image response: ${type || "unknown"}`
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
      `Rejected suspiciously small image: ${buffer.length} bytes`
    );
  }

  return buffer;
}

function extensionFromUrl(
  url
) {
  const pathname =
    new URL(url)
      .pathname
      .toLowerCase();

  if (
    pathname.endsWith(
      ".jpg"
    ) ||
    pathname.endsWith(
      ".jpeg"
    )
  ) {
    return ".jpg";
  }

  if (
    pathname.endsWith(
      ".webp"
    )
  ) {
    return ".webp";
  }

  return ".png";
}

async function findExisting(
  prefix
) {
  const files =
    await fs.readdir(
      OUTPUT_DIR
    );

  return files.find(
    (file) => {
      const ext =
        path
          .extname(file)
          .toLowerCase();

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

async function removeExisting(
  prefix
) {
  const files =
    await fs.readdir(
      OUTPUT_DIR
    );

  for (
    const file of
    files
  ) {
    const ext =
      path
        .extname(file)
        .toLowerCase();

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
    "TOMZN official image sync"
  );

  console.log(
    "========================="
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

  const failures =
    [];

  for (
    const target of
    TARGETS
  ) {
    try {
      console.log("");
      console.log(
        `Product: ${target.label}`
      );

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

      const product =
        await discoverOfficialPage(
          target
        );

      const imageUrl =
        resolveProductImage(
          product.html,
          product.url
        );

      if (
        !isOfficialTomznUrl(
          product.url
        )
      ) {
        throw new Error(
          "Resolved product page is not on tomzn.com"
        );
      }

      console.log(
        `Image: ${imageUrl}`
      );

      const buffer =
        await downloadImage(
          imageUrl,
          product.url
        );

      /*
       * Only remove an existing image after the new image
       * has downloaded and passed validation.
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
    "========================="
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
      const item of
      failures
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
    "First visually inspect the TOMZN image grid."
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

    console.error(
      error
    );

    process.exitCode = 1;
  }
);