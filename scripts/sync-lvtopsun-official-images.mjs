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

const BAD_TERMS = [
  "logo",
  "icon",
  "favicon",
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
  "news",
  "article",
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
];

const FAMILIES = {
  battery128: {
    name: "LVTOPSUN 12.8V / 12V LiFePO4 Battery",
    pages: [
      "https://www.lvtopsun.com/products/",
      "https://www.lvtopsun.com/downloads/",
    ],
    hints: [
      "128100",
      "12.8",
      "12v",
      "lifepo4",
      "battery",
    ],
  },

  battery256100: {
    name: "LVTOPSUN LVTS-256100 25.6V 100Ah",
    pages: [
      "https://www.lvtopsun.com/low-voltage-ess/",
      "https://www.lvtopsun.com/downloads/",
    ],
    hints: [
      "256100",
      "25.6",
      "battery",
    ],
  },

  battery256200: {
    name: "LVTOPSUN LVTS-256200 25.6V 200Ah",
    pages: [
      "https://www.lvtopsun.com/low-voltage-ess/",
      "https://www.lvtopsun.com/downloads/",
    ],
    hints: [
      "256200",
      "25.6",
      "battery",
    ],
  },

  battery512100: {
    name: "LVTOPSUN LVTS-512100-G3",
    pages: [
      "https://www.lvtopsun.com/lvtopsun-battery/",
      "https://www.lvtopsun.com/downloads/",
      "https://www.lvtopsun.com/low-voltage-ess/",
    ],
    hints: [
      "512100",
      "512100-g3",
      "51.2",
      "battery",
    ],
  },

  battery512200: {
    name: "LVTOPSUN 51.2V 200Ah / 10.24kWh Battery",
    pages: [
      "https://www.lvtopsun.com/low-voltage-ess/",
      "https://www.lvtopsun.com/products/",
    ],
    hints: [
      "512200",
      "200ah",
      "10.24",
      "battery",
    ],
  },

  battery512314G3: {
    name: "LVTOPSUN LVTS-512314-G3",
    pages: [
      "https://www.lvtopsun.com/low-voltage-ess/",
      "https://www.lvtopsun.com/downloads/",
      "https://www.lvtopsun.com/lvtopsun-battery/",
    ],
    hints: [
      "512314-g3",
      "512314",
      "314",
      "16kwh",
      "battery",
    ],
  },

  battery512314G4: {
    name: "LVTOPSUN LVTS-512314-G4",
    pages: [
      "https://www.lvtopsun.com/low-voltage-ess/",
      "https://www.lvtopsun.com/news/how-to-connect-lvtopsun-batteries-to-voltronic-power-inverters/",
    ],
    hints: [
      "512314-g4",
      "512314",
      "314",
      "16kwh",
      "g4",
    ],
  },

  battery512392: {
    name: "LVTOPSUN LVTS-512392 20kWh Battery",
    pages: [
      "https://www.lvtopsun.com/lvts-512392-solar-battery-storage-wholesale-51-2v-392ah-20kwh-80-dod-energy-storage-battery-bulk-supply/",
      "https://www.lvtopsun.com/low-voltage-ess/",
    ],
    hints: [
      "512392",
      "392ah",
      "20kwh",
      "battery",
    ],
  },

  inverter4kw: {
    name: "LVTOPSUN LVTS-4KW-HYD",
    pages: [
      "https://www.lvtopsun.com/products/",
    ],
    hints: [
      "4kw-hyd",
      "lvts-4kw",
      "4kw",
      "hybrid",
    ],
  },

  inverter6kw: {
    name: "LVTOPSUN LVTS-6KW-HYD",
    pages: [
      "https://www.lvtopsun.com/products/",
    ],
    hints: [
      "6kw-hyd",
      "lvts-6kw",
      "6kw",
      "hybrid",
    ],
  },

  inverter12kw: {
    name: "LVTOPSUN LVTS-12KW-HYD",
    pages: [
      "https://www.lvtopsun.com/products/",
    ],
    hints: [
      "12kw-hyd",
      "lvts-12kw",
      "12kw",
      "hybrid",
    ],
  },

  inverter15kw: {
    name: "LVTOPSUN LVTS-15KW-HYD",
    pages: [
      "https://www.lvtopsun.com/products/",
    ],
    hints: [
      "15kw-hyd",
      "lvts-15kw",
      "15kw",
      "hybrid",
    ],
  },

  portable64314: {
    name: "LVTOPSUN LVTS-64314",
    pages: [
      "https://www.lvtopsun.com/low-voltage-ess/",
      "https://www.lvtopsun.com/news/portable-power-stations-from-outdoor-adventures-to-reliable-backup-power/",
    ],
    hints: [
      "64314",
      "portable",
      "power-station",
      "2009.6",
    ],
  },
};

const TARGETS = [
  {
    prefix:
      "lvtopsun-lvtopsun-12-8v-100ah-lithium-battery-lithium",
    family: "battery128",
  },

  {
    prefix:
      "lvtopsun-lvtopsun-12-8v-200ah-2-56kwh-lithium-energy-storage-battery",
    family: "battery128",
  },

  {
    prefix:
      "lvtopsun-lvtopsun-12-8v-280ah-3-58kwh-lithium-iron-phosphate-battery",
    family: "battery128",
  },

  {
    prefix:
      "lvtopsun-lvtopsun-12v-8100-deep-cycle-lithium",
    family: "battery128",
  },

  {
    prefix:
      "lvtopsun-lvtopsun-25-6v-100ah-2-56-kwh-lithium-iron-phosphate-battery",
    family: "battery256100",
  },

  {
    prefix:
      "lvtopsun-lvtopsun-25-6v-100ah-2-56-kwh-lithium-iron-phosphate-battery-abs-case",
    family: "battery256100",
  },

  {
    prefix:
      "lvtopsun-lvtopsun-25-6v-200ah-5-12kwh-lithium-iron-phosphate-battery",
    family: "battery256200",
  },

  {
    prefix:
      "lvtopsun-lvtopsun-25-6v-200ah-lithium-lithium-battery",
    family: "battery256200",
  },

  {
    prefix:
      "lvtopsun-lvtopsun-51-2v-100ah-5-12kwh-lithium-iron-phosphate-battery",
    family: "battery512100",
  },

  {
    prefix:
      "lvtopsun-lvts-512100-g3a",
    family: "battery512100",
  },

  {
    prefix:
      "lvtopsun-lvtopsun-51-2v-200ah-10-24kwh-lithium-iron-phosphate-battery",
    family: "battery512200",
  },

  {
    prefix:
      "lvtopsun-lvtopsun-51-2v-314ah-16kwh-lithium-battery",
    family: "battery512314G3",
  },

  {
    prefix:
      "lvtopsun-lvtopsun-51-2v-314ah-lithium-battery",
    family: "battery512314G3",
  },

  {
    prefix:
      "lvtopsun-lvtopsun-g3-51-2v-314a-16-kwh-lifepo-solar-energy-storage-battery",
    family: "battery512314G3",
  },

  {
    prefix:
      "lvtopsun-lvts-512314-g3a",
    family: "battery512314G3",
  },

  {
    prefix:
      "lvtopsun-lvtopsun-g4-51-2v-314a-16-kwh-lithium-solar-energy-storage-battery",
    family: "battery512314G4",
  },

  {
    prefix:
      "lvtopsun-lvts-512392-g4",
    family: "battery512392",
  },

  {
    prefix:
      "lvtopsun-lvtopsun-4kw-24v-solar-off-grid-hybrid-inverter",
    family: "inverter4kw",
  },

  {
    prefix:
      "lvtopsun-lvtopsun-6kw-48v-solar-off-grid-hybrid-inverter",
    family: "inverter6kw",
  },

  {
    prefix:
      "lvtopsun-lvtopsun-12kw-48v-solar-off-grid-hybrid-inverter",
    family: "inverter12kw",
  },

  {
    prefix:
      "lvtopsun-lvts-15kw-hyd",
    family: "inverter15kw",
  },

  {
    prefix:
      "lvtopsun-lvts-64314",
    family: "portable64314",
  },
];

function decodeHtml(value) {
  return String(value ?? "")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function normalizeUrl(raw, baseUrl) {
  if (!raw) {
    return null;
  }

  let value = decodeHtml(
    String(raw).trim()
  );

  if (
    !value ||
    value.startsWith("data:") ||
    value.startsWith("javascript:") ||
    value.startsWith("#")
  ) {
    return null;
  }

  value = value.replaceAll(
    "\\/",
    "/"
  );

  if (
    value.startsWith("//")
  ) {
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
  if (!url) {
    return false;
  }

  const clean =
    url
      .split("?")[0]
      .split("#")[0]
      .toLowerCase();

  return (
    clean.endsWith(".png") ||
    clean.endsWith(".jpg") ||
    clean.endsWith(".jpeg") ||
    clean.endsWith(".webp")
  );
}

function safeDecode(value) {
  try {
    return decodeURIComponent(
      value
    ).toLowerCase();
  } catch {
    return String(
      value
    ).toLowerCase();
  }
}

function isBadCandidate(url) {
  const lower =
    safeDecode(url);

  return BAD_TERMS.some(
    (term) =>
      lower.includes(term)
  );
}

function extractImages(
  html,
  baseUrl
) {
  const candidates =
    new Set();

  const attrRegex =
    /(?:src|data-src|data-original|data-lazy-src|data-image|data-url|href)\s*=\s*["']([^"']+)["']/gi;

  for (
    const match of html.matchAll(
      attrRegex
    )
  ) {
    const url =
      normalizeUrl(
        match[1],
        baseUrl
      );

    if (
      url &&
      isImageUrl(url)
    ) {
      candidates.add(url);
    }
  }

  const srcsetRegex =
    /(?:srcset|data-srcset)\s*=\s*["']([^"']+)["']/gi;

  for (
    const match of html.matchAll(
      srcsetRegex
    )
  ) {
    const entries =
      match[1].split(",");

    for (
      const entry of entries
    ) {
      const raw =
        entry
          .trim()
          .split(/\s+/)[0];

      const url =
        normalizeUrl(
          raw,
          baseUrl
        );

      if (
        url &&
        isImageUrl(url)
      ) {
        candidates.add(url);
      }
    }
  }

  const cssRegex =
    /url\((["']?)([^"'()]+?\.(?:png|jpe?g|webp)(?:\?[^"'()]*)?)\1\)/gi;

  for (
    const match of html.matchAll(
      cssRegex
    )
  ) {
    const url =
      normalizeUrl(
        match[2],
        baseUrl
      );

    if (
      url &&
      isImageUrl(url)
    ) {
      candidates.add(url);
    }
  }

  const absoluteRegex =
    /https?:\\?\/\\?\/[^"'<>\\\s]+?\.(?:png|jpe?g|webp)(?:\?[^"'<>\\\s]*)?/gi;

  for (
    const match of html.matchAll(
      absoluteRegex
    )
  ) {
    const url =
      normalizeUrl(
        match[0],
        baseUrl
      );

    if (
      url &&
      isImageUrl(url)
    ) {
      candidates.add(url);
    }
  }

  return [
    ...candidates,
  ];
}

function scoreCandidate(
  url,
  family
) {
  if (
    !url ||
    isBadCandidate(url)
  ) {
    return -100000;
  }

  const lower =
    safeDecode(url);

  let score = 0;

  for (
    const hint of
    family.hints ?? []
  ) {
    if (
      lower.includes(
        hint.toLowerCase()
      )
    ) {
      score += 1200;
    }
  }

  if (
    lower.includes(
      "lvtopsun.com"
    )
  ) {
    score += 100;
  }

  if (
    lower.includes(
      "/uploads/"
    )
  ) {
    score += 150;
  }

  if (
    lower.includes(
      "product"
    )
  ) {
    score += 100;
  }

  if (
    lower.includes(
      "battery"
    )
  ) {
    score += 80;
  }

  if (
    lower.includes(
      "inverter"
    )
  ) {
    score += 80;
  }

  if (
    lower.endsWith(
      ".png"
    )
  ) {
    score += 100;
  }

  if (
    lower.endsWith(
      ".webp"
    )
  ) {
    score += 80;
  }

  if (
    lower.endsWith(
      ".jpg"
    ) ||
    lower.endsWith(
      ".jpeg"
    )
  ) {
    score += 50;
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
    new Set();

  let firstSuccessfulPage =
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

      if (
        !firstSuccessfulPage
      ) {
        firstSuccessfulPage =
          page;
      }

      const candidates =
        extractImages(
          html,
          page
        );

      for (
        const candidate of
        candidates
      ) {
        allCandidates.add(
          candidate
        );
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
      ...allCandidates,
    ]
      .map((url) => ({
        url,
        score:
          scoreCandidate(
            url,
            family
          ),
      }))
      .filter(
        (item) =>
          item.score > 0
      )
      .sort(
        (a, b) =>
          b.score -
          a.score
      );

  if (
    !ranked.length
  ) {
    console.log("");
    console.log(
      "Top raw candidates:"
    );

    console.log(
      [
        ...allCandidates,
      ]
        .filter(
          (url) =>
            !isBadCandidate(
              url
            )
        )
        .slice(
          0,
          30
        )
        .join("\n")
    );

    throw new Error(
      `No safe image candidate for ${family.name}`
    );
  }

  console.log(
    `Selected: ${ranked[0].url}`
  );

  console.log(
    `Score: ${ranked[0].score}`
  );

  return {
    url:
      ranked[0].url,
    referer:
      firstSuccessfulPage ??
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

  // LVTOPSUN official product assets can legitimately be
  // slightly below 10 KB, so use 8 KB instead of 10 KB.
  if (
    buffer.length <
    8000
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
      const ext =
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
          ext
        )
      ) {
        return false;
      }

      const basename =
        path.basename(
          file,
          ext
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
    const ext =
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
        ext
      )
    ) {
      continue;
    }

    const basename =
      path.basename(
        file,
        ext
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
    "LVTOPSUN official image sync"
  );

  console.log(
    "============================"
  );

  console.log(
    `Targets: ${TARGETS.length}`
  );

  console.log(
    `Force: ${FORCE ? "YES" : "NO"}`
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
    "============================"
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
    "First visually inspect all LVTOPSUN images."
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