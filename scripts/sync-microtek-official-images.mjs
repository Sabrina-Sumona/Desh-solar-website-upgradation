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
const MIN_IMAGE_BYTES = 8000;

const BAD_TERMS = [
  "logo",
  "favicon",
  "icon",
  "wishlist",
  "shareicon",
  "share-icon",
  "banner",
  "header",
  "footer",
  "facebook",
  "youtube",
  "instagram",
  "linkedin",
  "placeholder",
  "loading",
  "default",
  "certificate",
  "badge",
  "award",
  "arrow",
  "button",
  "close",
  "menu",
  "search",
  "newsletter",
  "qrcode",
  "qr-code",
  "sprite",
  "loader",
  "payment",
  "app-store",
  "play-store",
];

const FAMILIES = {
  jumbo2500: {
    name: "Microtek JUMBO 2500 / 2750 official family",
    pages: [
      "https://www.microtek.in/product/power-backup-solutions/best-home-ups-india",
      "https://www.microtek.in/product/power-backup-solutions/best-home-ups-india/listing",
    ],
    strongTerms: [
      "jumbo ups",
      "jumbo",
    ],
  },

  jumbo3500: {
    name: "Microtek JUMBO 3500 official family",
    pages: [
      "https://www.microtek.in/product/power-backup-solutions/best-home-ups-india",
      "https://www.microtek.in/product/power-backup-solutions/best-home-ups-india/listing",
    ],
    strongTerms: [
      "jumbo ups",
      "jumbo",
    ],
  },

  jumbo5500: {
    name: "Microtek JUMBO 5500 official family",
    pages: [
      "https://www.microtek.in/product/power-backup-solutions/best-home-ups-india",
      "https://www.microtek.in/product/power-backup-solutions/best-home-ups-india/listing",
    ],
    strongTerms: [
      "jumbo ups",
      "jumbo",
    ],
  },

  heavy1550: {
    name: "Microtek Heavy Duty 1550",
    pages: [
      "https://www.microtek.in/product/power-backup-solutions/combos/listing?product_series=81",
    ],
    strongTerms: [
      "1550",
      "heavy duty",
      "vturbo",
    ],
  },

  luxe1000: {
    name: "Microtek LUXE 1000",
    pages: [
      "https://www.microtek.in/product/power-backup-solutions/best-inverter-for-home-india/listing",
    ],
    strongTerms: [
      "luxe 1000",
      "1000",
    ],
  },

  luxe1200: {
    name: "Microtek LUXE 1200",
    pages: [
      "https://www.microtek.in/product/power-backup-solutions/best-inverter-for-home-india/listing",
    ],
    strongTerms: [
      "luxe 1200",
      "1200",
      "950va",
    ],
  },

  luxe1400: {
    name: "Microtek LUXE 1400",
    pages: [
      "https://www.microtek.in/product/power-backup-solutions/best-inverter-for-home-india/listing",
    ],
    strongTerms: [
      "luxe 1400",
      "1400",
      "1100va",
    ],
  },

  solar1235: {
    name: "Microtek Solar PCU 1235",
    pages: [
      "https://www.microtek.in/product/solar-solutions/solar-power-conditioning-units/listing/solar-pcu-123512v",
    ],
    strongTerms: [
      "1235",
      "solar pcu",
    ],
  },

  /*
   * Legacy 1435.
   * Microtek still confirms it in the official solar catalogue,
   * but the current site may no longer expose its individual image.
   *
   * Use official standard PCU 1235 family image as controlled fallback.
   */
  solar1435: {
    name: "Microtek Solar PCU 1435 legacy family",
    pages: [
      "https://www.microtek.in/product/solar-solutions/solar-power-conditioning-units/listing/solar-pcu-123512v",
    ],
    strongTerms: [
      "1235",
      "solar pcu",
    ],
  },

  solar1450: {
    name: "Microtek Solar PCU 1450 family",
    pages: [
      "https://www.microtek.in/product/solar-solutions/solar-power-conditioning-units/listing/solar-pcu-123512v",
    ],
    strongTerms: [
      "1235",
      "solar pcu",
    ],
  },

  /*
   * Legacy 2035.
   * Controlled fallback to official 2335 family.
   */
  solar2035: {
    name: "Microtek Solar PCU 2035 legacy family",
    pages: [
      "https://www.microtek.in/product/solar-solutions/solar-power-conditioning-units/listing/solar-pcu-233524v",
    ],
    strongTerms: [
      "2335",
      "solar pcu",
    ],
  },

  solar2335: {
    name: "Microtek Solar PCU 2335",
    pages: [
      "https://www.microtek.in/product/solar-solutions/solar-power-conditioning-units/listing/solar-pcu-233524v",
    ],
    strongTerms: [
      "2335",
      "solar pcu",
    ],
  },

  /*
   * Legacy 2350.
   * Controlled fallback to current HI-END PWM 2550 family.
   */
  solar2350: {
    name: "Microtek Solar PCU 2350 legacy family",
    pages: [
      "https://www.microtek.in/product/solar-solutions/solar-power-conditioning-units/listing?product_series=53",
    ],
    strongTerms: [
      "2550",
      "hi-end pwm",
    ],
  },

  solar2550: {
    name: "Microtek HI-END PWM PCU 2550",
    pages: [
      "https://www.microtek.in/product/solar-solutions/solar-power-conditioning-units/listing?product_series=53",
    ],
    strongTerms: [
      "2550",
      "hi-end pwm",
    ],
  },

  solar4050: {
    name: "Microtek PWM Solar PCU 4050",
    pages: [
      "https://www.microtek.in/product/solar-solutions/solar-power-conditioning-units/listing?product_series=53",
    ],
    strongTerms: [
      "4050",
      "3500va",
      "pwm solar pcu",
    ],
  },

  mppt2kva: {
    name: "Microtek MPPT 2790 24V",
    pages: [
      "https://www.microtek.in/product/solar-solutions/solar-power-conditioning-units/listing?product_series=43",
    ],
    strongTerms: [
      "2790",
      "2000w",
      "2500va",
    ],
  },

  mppt3kva: {
    name: "Microtek MPPT 4560 48V",
    pages: [
      "https://www.microtek.in/product/solar-solutions/solar-power-conditioning-units/listing?product_series=43",
    ],
    strongTerms: [
      "4560",
      "3500w",
      "4375va",
    ],
  },
};

const TARGETS = [
  {
    prefix: "microtek-jumbo-home-ups-model-jm-sw-2750-24v",
    family: "jumbo2500",
  },

  {
    prefix: "microtek-microtek-1435-solar-inverter-best-price-at",
    family: "solar1435",
  },

  {
    prefix: "microtek-microtek-1450-solar-inverter-best-price-only-at",
    family: "solar1450",
  },

  {
    prefix: "microtek-1550-12v",
    family: "heavy1550",
  },

  {
    prefix: "microtek-microtek-jumbo-2500-24v-sinewave",
    family: "jumbo2500",
  },

  {
    prefix: "microtek-microtek-jumbo-3500-home-ups-best-price-at",
    family: "jumbo3500",
  },

  {
    prefix: "microtek-microtek-jumbo-ups-jm-sw-5500-48v-best-price",
    family: "jumbo5500",
  },

  {
    prefix: "microtek-800va-12v",
    family: "luxe1200",
  },

  {
    prefix: "microtek-1100va-12v",
    family: "luxe1400",
  },

  {
    prefix: "microtek-microtek-mppt-based-solar-pcu-2kva-24v",
    family: "mppt2kva",
  },

  {
    prefix: "microtek-microtek-mppt-solar-pcu-3kva-48v-best-price",
    family: "mppt3kva",
  },

  {
    prefix: "microtek-1235-12v",
    family: "solar1235",
  },

  {
    prefix: "microtek-microtek-solar-pcu-2035-24v-best-price-at",
    family: "solar2035",
  },

  {
    prefix: "microtek-microtek-solar-pcu-2335-24v-best-price-at",
    family: "solar2335",
  },

  {
    prefix: "microtek-microtek-solar-pcu-2350-24v-best-price-at",
    family: "solar2350",
  },

  {
    prefix: "microtek-microtek-solar-pcu-2550-24v-best-price-in-bd",
    family: "solar2550",
  },

  {
    prefix: "microtek-microtek-solar-pcu-4050-48v-with-pwm-charger",
    family: "solar4050",
  },

  {
    prefix: "microtek-microtek-ups-luxe-sw-1000-12v-best-price-at",
    family: "luxe1000",
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

function normalizeText(value) {
  return decodeHtml(String(value ?? ""))
    .toLowerCase()
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(value) {
  return decodeHtml(
    String(value ?? "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function normalizeUrl(raw, baseUrl) {
  if (!raw) return null;

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
      new URL(url).pathname.toLowerCase();

    return (
      pathname.endsWith(".png") ||
      pathname.endsWith(".jpg") ||
      pathname.endsWith(".jpeg") ||
      pathname.endsWith(".webp")
    );
  } catch {
    return false;
  }
}

function isOfficialMicrotekUrl(url) {
  try {
    const host =
      new URL(url).hostname.toLowerCase();

    return (
      host === "microtek.in" ||
      host.endsWith(".microtek.in")
    );
  } catch {
    return false;
  }
}

function isBadCandidate(candidate) {
  const combined =
    normalizeText(
      `${candidate.url} ${candidate.text ?? ""}`
    );

  return BAD_TERMS.some(
    (term) =>
      combined.includes(
        normalizeText(term)
      )
  );
}

function extractImageCandidates(
  html,
  baseUrl
) {
  const map = new Map();

  function addCandidate(
    rawUrl,
    text = ""
  ) {
    const url =
      normalizeUrl(
        rawUrl,
        baseUrl
      );

    if (
      !url ||
      !isImageUrl(url)
    ) {
      return;
    }

    const current =
      map.get(url);

    if (current) {
      current.text =
        `${current.text} ${text}`.trim();

      return;
    }

    map.set(url, {
      url,
      text:
        stripTags(text),
    });
  }

  const imgRegex =
    /<img\b[^>]*>/gi;

  for (
    const match of
    html.matchAll(imgRegex)
  ) {
    const tag =
      match[0];

    const src =
      tag.match(
        /\b(?:src|data-src|data-original|data-lazy-src)\s*=\s*["']([^"']+)["']/i
      );

    const alt =
      tag.match(
        /\balt\s*=\s*["']([^"']*)["']/i
      );

    const title =
      tag.match(
        /\btitle\s*=\s*["']([^"']*)["']/i
      );

    const context = [
      alt?.[1],
      title?.[1],
      tag,
    ]
      .filter(Boolean)
      .join(" ");

    if (src) {
      addCandidate(
        src[1],
        context
      );
    }

    const srcset =
      tag.match(
        /\b(?:srcset|data-srcset)\s*=\s*["']([^"']+)["']/i
      );

    if (srcset) {
      for (
        const entry of
        srcset[1].split(",")
      ) {
        const raw =
          entry
            .trim()
            .split(/\s+/)[0];

        addCandidate(
          raw,
          context
        );
      }
    }
  }

  const attrRegex =
    /(?:src|data-src|data-original|data-lazy-src|href)\s*=\s*["']([^"']+\.(?:png|jpe?g|webp)(?:\?[^"']*)?)["']/gi;

  for (
    const match of
    html.matchAll(attrRegex)
  ) {
    addCandidate(
      match[1]
    );
  }

  return [
    ...map.values(),
  ];
}

function scoreCandidate(
  candidate,
  family
) {
  if (
    !candidate?.url ||
    !isOfficialMicrotekUrl(
      candidate.url
    ) ||
    isBadCandidate(
      candidate
    )
  ) {
    return -100000;
  }

  const combined =
    normalizeText(
      `${candidate.url} ${candidate.text ?? ""}`
    );

  let score = 0;
  let matched = false;

  for (
    const term of
    family.strongTerms
  ) {
    const normalized =
      normalizeText(term);

    if (
      combined.includes(
        normalized
      )
    ) {
      score += 3000;
      matched = true;
    }
  }

  /*
   * Important:
   * At least one family/model identifier must match.
   */
  if (!matched) {
    return -100000;
  }

  score += 500;

  if (
    combined.includes(
      "upload product"
    )
  ) {
    score += 500;
  }

  if (
    combined.includes(
      "product"
    )
  ) {
    score += 150;
  }

  return score;
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
      `Page request failed: ${response.status}`
    );
  }

  return await response.text();
}

async function resolveFamilyImage(
  familyKey
) {
  const family =
    FAMILIES[
      familyKey
    ];

  if (!family) {
    throw new Error(
      `Unknown family: ${familyKey}`
    );
  }

  console.log("");
  console.log(
    `Family: ${family.name}`
  );

  const candidates =
    new Map();

  let referer =
    family.pages[0];

  for (
    const page of
    family.pages
  ) {
    try {
      console.log(
        `Page: ${page}`
      );

      const html =
        await fetchHtml(
          page
        );

      referer = page;

      for (
        const candidate of
        extractImageCandidates(
          html,
          page
        )
      ) {
        candidates.set(
          candidate.url,
          candidate
        );
      }
    } catch (error) {
      console.log(
        `WARN ${page}: ${
          error instanceof Error
            ? error.message
            : String(error)
        }`
      );
    }
  }

  const ranked =
    [
      ...candidates.values(),
    ]
      .map(
        (candidate) => ({
          ...candidate,

          score:
            scoreCandidate(
              candidate,
              family
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
      `No safe official family image found for ${family.name}`
    );
  }

  console.log(
    `Selected: ${ranked[0].url}`
  );

  return {
    url:
      ranked[0].url,

    referer,
  };
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

      redirect:
        "follow",
    });

  if (!response.ok) {
    throw new Error(
      `Image request failed: ${response.status}`
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

function extensionFromUrl(url) {
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

async function removeExisting(prefix) {
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

async function findExisting(prefix) {
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

async function main() {
  await fs.mkdir(
    OUTPUT_DIR,
    {
      recursive: true,
    }
  );

  console.log("");
  console.log(
    "Microtek official/family image sync"
  );

  console.log(
    "==================================="
  );

  const familyCache =
    new Map();

  const imageCache =
    new Map();

  const failures = [];

  let completed = 0;
  let skipped = 0;
  let failed = 0;

  for (
    const target of
    TARGETS
  ) {
    try {
      const existing =
        await findExisting(
          target.prefix
        );

      if (
        existing &&
        !FORCE
      ) {
        console.log(
          `SKIP ${target.prefix}`
        );

        skipped++;
        continue;
      }

      let resolved =
        familyCache.get(
          target.family
        );

      if (!resolved) {
        resolved =
          await resolveFamilyImage(
            target.family
          );

        familyCache.set(
          target.family,
          resolved
        );
      }

      let buffer =
        imageCache.get(
          resolved.url
        );

      if (!buffer) {
        buffer =
          await downloadImage(
            resolved.url,
            resolved.referer
          );

        imageCache.set(
          resolved.url,
          buffer
        );
      }

      await removeExisting(
        target.prefix
      );

      const extension =
        extensionFromUrl(
          resolved.url
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

        family:
          target.family,

        error:
          message,
      });
    }
  }

  console.log("");
  console.log(
    "==================================="
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
        `- ${item.prefix} [${item.family}]`
      );

      console.log(
        `  ${item.error}`
      );
    }
  }

  console.log("");
  console.log(
    "Do NOT regenerate the main catalog yet."
  );

  console.log(
    "Visually inspect Microtek images first."
  );

  if (
    failed > 0
  ) {
    process.exitCode =
      1;
  }
}

main().catch(
  (error) => {
    console.error(
      error
    );

    process.exitCode =
      1;
  }
);