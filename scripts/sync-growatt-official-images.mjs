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
  "flag",
  "certificate",
  "certification",
  "award",
  "badge",
  "social",
  "facebook",
  "youtube",
  "instagram",
  "linkedin",
  "banner",
  "avatar",
  "header",
  "footer",
  "loading",
  "placeholder",
  "default",
  "arrow",
  "button",
  "play",
  "close",
  "search",
  "menu",
  "map",
  "tel",
  "mail",
  "address",
  "subscribe",
  "newsletter",
  "qrcode",
  "qr-code",
];

const FAMILIES = {
  hope50: {
    name: "Growatt HOPE 5.0L/LW-B1",
    pages: [
      "https://en.growatt.com/products/hope-5.0l-lw-b1",
    ],
    hints: [
      "hope 5.0",
      "hope-5.0",
      "5.0l",
      "5.0lw",
      "battery",
    ],
  },

  hope55: {
    name: "Growatt HOPE 5.5L-A1",
    pages: [
      "https://en.growatt.com/products/hope-5.0l-lw-b1",
    ],
    hints: [
      "hope 5.5",
      "5.5l-a1",
      "5.5l",
      "hope",
      "battery",
    ],
  },

  hope160: {
    name: "Growatt HOPE 16.0LM-A1",
    pages: [
      "https://en.growatt.com/products/hope-16.0lm-a1",
    ],
    hints: [
      "16.0lm",
      "16.0lm-a1",
      "hope 16",
      "battery",
    ],
  },

  spe3500: {
    name: "Growatt SPE 3.5-7KTL HVM-G2",
    pages: [
      "https://en.growatt.com/products/spe-3.5-7ktl-hvm-g2",
    ],
    hints: [
      "spe 3.5",
      "spe 3.5-7",
      "spe 3.5-6k",
      "3500",
      "hvm-g2",
      "inverter",
    ],
  },

  spe12000: {
    name: "Growatt SPE 8000-12000 ES",
    pages: [
      "https://en.growatt.com/products/spe-8000-12000-es",
    ],
    hints: [
      "spe 8-12k",
      "spe 8000",
      "spe 12000",
      "8000-12000",
      "12000",
      "inverter",
    ],
  },

  spf3500_5000: {
    name: "Growatt SPF 3000-5000 ES/ES LITE",
    pages: [
      "https://en.growatt.com/products/spf-3000-5000-es-es-lite",
    ],
    hints: [
      "spf 3500",
      "spf 5000",
      "3500~5000",
      "3000-5000",
      "spf",
      "inverter",
    ],
  },

  spf6000plus: {
    name: "Growatt SPF 6000 ES Plus",
    pages: [
      "https://en.growatt.com/products/spf-6000-es-plus",
    ],
    hints: [
      "spf 6000 es plus",
      "spf 6000",
      "6000 es plus",
      "inverter",
    ],
  },

  spf3000tl: {
    name: "Growatt SPF 3000TL LVM",
    pages: [
      "https://en.growatt.com/products/spf-3000tl-lvm",
    ],
    hints: [
      "spf 3000tl",
      "3000tl lvm",
      "spf3000tl",
      "inverter",
    ],
  },

  wit: {
    name: "Growatt WIT 4-25K-HU",
    pages: [
      "https://en.growatt.com/products/wit-4-25k-hu",
    ],
    hints: [
      "wit 4-25k",
      "wit 10k",
      "wit 15k",
      "wit",
      "inverter",
    ],
  },

  max100: {
    name: "Growatt MAX 100-150KTL3-X LV",
    pages: [
      "https://en.growatt.com/products/max-100-150ktl3-x-lv",
    ],
    hints: [
      "max 100",
      "100-150ktl3",
      "100kw",
      "max",
      "inverter",
    ],
  },

  mic1kw: {
    name: "Growatt MIC 750-3300TL-X",
    pages: [
      "https://tr.growatt.com/products/mic-750-3300tl-x",
      "https://en.growatt.com/products/mic-750-3300tl-x-x2%28pro%29",
    ],
    hints: [
      "mic 750~3300tl-x",
      "mic 750-3300tl-x",
      "750~3300tl-x",
      "750-3300tl-x",
      "mic",
      "inverter",
    ],
  },

  infinity1000pro: {
    name: "Growatt INFINITY 1000 Pro",
    pages: [
      "https://en.growatt.com/products/infinity-1000-pro",
    ],
    hints: [
      "infinity 1000",
      "1000 pro",
      "power station",
      "portable",
      "ups",
    ],
  },
};

const TARGETS = [
  {
    prefix:
      "growatt-growatt-51-2v-100ah-5-12kwh-lithium-battery-hope-5-5l",
    family: "hope55",
  },

  {
    prefix:
      "growatt-0lm-a1",
    family: "hope160",
  },

  {
    prefix:
      "growatt-0l-b1",
    family: "hope50",
  },

  {
    prefix:
      "growatt-5l-a1",
    family: "hope55",
  },

  {
    prefix:
      "growatt-growatt-12kw-single-phase-off-grid-hybrid-solar-inverter",
    family: "spe12000",
  },

  {
    prefix:
      "growatt-growatt-1kw-on-grid-solar-inverter",
    family: "mic1kw",
  },

  {
    prefix:
      "growatt-3-phase",
    family: "max100",
  },

  {
    prefix:
      "growatt-growatt-spe-3500-24v-hybrid-solar-inverter",
    family: "spe3500",
  },

  {
    prefix:
      "growatt-growatt-spf-3500-es-3-5kw-48v-off-grid-hybrid-solar-inverter",
    family: "spf3500_5000",
  },

  {
    prefix:
      "growatt-growatt-spf-5000-es-5kw-off-grid-hybrid-solar-inverter",
    family: "spf3500_5000",
  },

  {
    prefix:
      "growatt-growatt-spf-6000-es-plus-6kw-off-grid-hybrid-inverter",
    family: "spf6000plus",
  },

  {
    prefix:
      "growatt-10k-hu",
    family: "wit",
  },

  {
    prefix:
      "growatt-growatt-solar-spf-off-grid-inverter-5kw-5000-es",
    family: "spf3500_5000",
  },

  {
    prefix:
      "growatt-growatt-spe-12000-es-solar-inverter-for-hybrid-official",
    family: "spe12000",
  },

  {
    prefix:
      "growatt-growatt-spf-3000-tl-solar-inverter-best-priceips-bazar",
    family: "spf3000tl",
  },

  {
    prefix:
      "growatt-growatt-spf-3500-es-off-grid-inverter",
    family: "spf3500_5000",
  },

  {
    prefix:
      "growatt-growatt-spf-6000es-plus-off-grid-inverter-official",
    family: "spf6000plus",
  },

  {
    prefix:
      "growatt-15k-hu",
    family: "wit",
  },

  {
    prefix:
      "growatt-growatt-infinity-1000-pro-portable-ups-power-station",
    family: "infinity1000pro",
  },

  {
    prefix:
      "growatt-6kw-growatt-hybrid-inverter-with-5kw-lithium-battery-combo-package",
    family: "spf6000plus",
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
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function normalizeUrl(raw, baseUrl) {
  if (!raw) {
    return null;
  }

  let value = decodeHtml(
    String(raw).trim()
  );

  value = value.replaceAll("\\/", "/");

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

function safeDecode(value) {
  try {
    return decodeURIComponent(
      String(value)
    ).toLowerCase();
  } catch {
    return String(
      value
    ).toLowerCase();
  }
}

function isImageUrl(url) {
  if (!url) {
    return false;
  }

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

function isOfficialGrowattUrl(url) {
  try {
    const host =
      new URL(url).hostname.toLowerCase();

    return (
      host.endsWith("growatt.com") ||
      host.includes("globalso.com")
    );
  } catch {
    return false;
  }
}

function isBadCandidate(candidate) {
  const combined =
    `${candidate.url} ${candidate.text ?? ""}`
      .toLowerCase();

  return BAD_TERMS.some(
    (term) =>
      combined.includes(term)
  );
}

function extractImageCandidates(
  html,
  baseUrl
) {
  const map =
    new Map();

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

    const existing =
      map.get(url);

    if (existing) {
      existing.text =
        `${existing.text} ${text}`
          .trim();

      return;
    }

    map.set(url, {
      url,
      text:
        stripTags(text),
    });
  }

  const imgTagRegex =
    /<img\b[^>]*>/gi;

  for (
    const match of html.matchAll(
      imgTagRegex
    )
  ) {
    const tag =
      match[0];

    const srcMatch =
      tag.match(
        /\b(?:src|data-src|data-original|data-lazy-src)\s*=\s*["']([^"']+)["']/i
      );

    const altMatch =
      tag.match(
        /\balt\s*=\s*["']([^"']*)["']/i
      );

    const titleMatch =
      tag.match(
        /\btitle\s*=\s*["']([^"']*)["']/i
      );

    const classMatch =
      tag.match(
        /\bclass\s*=\s*["']([^"']*)["']/i
      );

    const context =
      [
        altMatch?.[1],
        titleMatch?.[1],
        classMatch?.[1],
      ]
        .filter(Boolean)
        .join(" ");

    if (srcMatch) {
      addCandidate(
        srcMatch[1],
        context
      );
    }

    const srcsetMatch =
      tag.match(
        /\b(?:srcset|data-srcset)\s*=\s*["']([^"']+)["']/i
      );

    if (srcsetMatch) {
      const entries =
        srcsetMatch[1].split(",");

      for (
        const entry of entries
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
    const match of html.matchAll(
      attrRegex
    )
  ) {
    addCandidate(
      match[1],
      ""
    );
  }

  const cssRegex =
    /url\((["']?)([^"'()]+?\.(?:png|jpe?g|webp)(?:\?[^"'()]*)?)\1\)/gi;

  for (
    const match of html.matchAll(
      cssRegex
    )
  ) {
    addCandidate(
      match[2],
      ""
    );
  }

  const absoluteRegex =
    /https?:\\?\/\\?\/[^"'<>\\\s]+?\.(?:png|jpe?g|webp)(?:\?[^"'<>\\\s]*)?/gi;

  for (
    const match of html.matchAll(
      absoluteRegex
    )
  ) {
    addCandidate(
      match[0],
      ""
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
    isBadCandidate(candidate)
  ) {
    return -100000;
  }

  const urlText =
    safeDecode(
      candidate.url
    );

  const metaText =
    String(
      candidate.text ?? ""
    ).toLowerCase();

  const combined =
    `${urlText} ${metaText}`;

  let score = 0;

  if (
    isOfficialGrowattUrl(
      candidate.url
    )
  ) {
    score += 500;
  }

  for (
    const hint of
    family.hints ?? []
  ) {
    const normalizedHint =
      hint.toLowerCase();

    if (
      urlText.includes(
        normalizedHint
      )
    ) {
      score += 2200;
    }

    if (
      metaText.includes(
        normalizedHint
      )
    ) {
      score += 1800;
    }

    if (
      combined.includes(
        normalizedHint
      )
    ) {
      score += 400;
    }
  }

  if (
    urlText.includes(
      "/upload/"
    ) ||
    urlText.includes(
      "/uploads/"
    )
  ) {
    score += 250;
  }

  if (
    combined.includes(
      "product"
    )
  ) {
    score += 120;
  }

  if (
    combined.includes(
      "battery"
    )
  ) {
    score += 80;
  }

  if (
    combined.includes(
      "inverter"
    )
  ) {
    score += 80;
  }

  if (
    combined.includes(
      "power station"
    )
  ) {
    score += 80;
  }

  if (
    urlText.endsWith(
      ".png"
    )
  ) {
    score += 100;
  }

  if (
    urlText.endsWith(
      ".webp"
    )
  ) {
    score += 80;
  }

  if (
    urlText.endsWith(
      ".jpg"
    ) ||
    urlText.endsWith(
      ".jpeg"
    )
  ) {
    score += 60;
  }

  return score;
}

async function fetchHtml(
  url
) {
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
      `Page request failed: ${response.status} ${response.statusText}`
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

  const allCandidates =
    new Map();

  let successfulPage =
    null;

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

      if (!successfulPage) {
        successfulPage =
          page;
      }

      const candidates =
        extractImageCandidates(
          html,
          page
        );

      for (
        const candidate of
        candidates
      ) {
        const existing =
          allCandidates.get(
            candidate.url
          );

        if (existing) {
          existing.text =
            `${existing.text} ${candidate.text}`
              .trim();
        } else {
          allCandidates.set(
            candidate.url,
            candidate
          );
        }
      }
    } catch (error) {
      console.log(
        `WARN page failed: ${page}`
      );

      console.log(
        error instanceof Error
          ? error.message
          : String(error)
      );
    }
  }

  const ranked =
    [
      ...allCandidates.values(),
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
      `No safe official image candidate found for ${family.name}`
    );
  }

  console.log(
    "Top candidates:"
  );

  for (
    const item of
    ranked.slice(
      0,
      5
    )
  ) {
    console.log(
      `  ${item.score} -> ${item.url}`
    );

    if (item.text) {
      console.log(
        `    ${item.text.slice(0, 160)}`
      );
    }
  }

  console.log(
    `Selected: ${ranked[0].url}`
  );

  return {
    url:
      ranked[0].url,
    referer:
      successfulPage ??
      family.pages[0],
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
      redirect: "follow",
    });

  if (!response.ok) {
    throw new Error(
      `Image request failed: ${response.status} ${response.statusText}`
    );
  }

  const contentType =
    (
      response.headers.get(
        "content-type"
      ) ?? ""
    ).toLowerCase();

  if (
    !contentType.startsWith(
      "image/"
    )
  ) {
    throw new Error(
      `Rejected non-image response: ${contentType || "unknown"}`
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
    new URL(
      url
    ).pathname.toLowerCase();

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
      const extension =
        path
          .extname(
            file
          )
          .toLowerCase();

      if (
        ![
          ".png",
          ".jpg",
          ".jpeg",
          ".webp",
        ].includes(
          extension
        )
      ) {
        return false;
      }

      const basename =
        path.basename(
          file,
          extension
        );

      return (
        basename.toLowerCase() ===
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
    const extension =
      path
        .extname(
          file
        )
        .toLowerCase();

    if (
      ![
        ".png",
        ".jpg",
        ".jpeg",
        ".webp",
      ].includes(
        extension
      )
    ) {
      continue;
    }

    const basename =
      path.basename(
        file,
        extension
      );

    if (
      basename.toLowerCase() ===
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
    "Growatt official image sync"
  );

  console.log(
    "==========================="
  );

  console.log(
    `Targets: ${TARGETS.length}`
  );

  console.log(
    `Force: ${FORCE ? "YES" : "NO"}`
  );

  console.log(
    `Minimum image size: ${MIN_IMAGE_BYTES} bytes`
  );

  const familyCache =
    new Map();

  const imageCache =
    new Map();

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

      const family =
        FAMILIES[
          target.family
        ];

      if (!family) {
        throw new Error(
          `Unknown family: ${target.family}`
        );
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
        `OK   ${target.prefix}${extension} (${buffer.length} bytes)`
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
    "==========================="
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
    "IMPORTANT:"
  );

  console.log(
    "Do NOT run sync-external-products.mjs yet."
  );

  console.log(
    "Visually inspect all Growatt images first."
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
    console.error("");
    console.error(
      "Fatal error:"
    );

    console.error(
      error
    );

    process.exitCode =
      1;
  }
);