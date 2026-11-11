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
  "language",
];

const FAMILIES = {
  // ============================================================
  // BATTERIES
  // ============================================================

  seF5: {
    name: "Deye SE-F5 / SE-F5 Plus",
    pages: [
      "https://www.deyeinverter.com/product/",
      "https://www.deyeinverter.com/download/product-2/",
    ],
    hints: [
      "se-f5",
      "sef5",
      "battery",
    ],
  },

  seF16: {
    name: "Deye SE-F16",
    pages: [
      "https://www.deyeinverter.com/product/",
      "https://www.deyeinverter.com/download/product-2/",
    ],
    hints: [
      "se-f16",
      "sef16",
      "battery",
    ],
  },

  seG51: {
    name: "Deye SE-G5.1",
    pages: [
      "https://www.deyeinverter.com/product/",
      "https://www.deyeinverter.com/download/product-2/",
    ],
    hints: [
      "se-g5",
      "seg5",
      "g5.1",
      "battery",
    ],
  },

  // ============================================================
  // SINGLE PHASE HYBRID SG04
  // SUN-3/3.6/5/6K-SG04LP1-EU
  // ============================================================

  sg04lp1: {
    name:
      "Deye SUN-3/3.6/5/6K-SG04LP1-EU-SM1/SM2",
    pages: [
      "https://www.deyeinverter.com/product/single-phase-low-voltage-hybrid-inverter/sun3-3-6-5-6ksg04lp1eu-36kw-single-phase-2-mppt-hybrid-inverter-lv-battery-supported-2346.html",
    ],
    hints: [
      "sg04lp1",
      "3.6-6k",
      "single-phase",
      "hybrid",
    ],
  },

  // ============================================================
  // SINGLE PHASE HYBRID SG02
  // SUN-7.6/8/10/12K-SG02LP1
  // ============================================================

  sg02lp1: {
    name:
      "Deye SUN-7.6/8/10/12K-SG02LP1-EU-AM2/AM3",
    pages: [
      "https://www.deyeinverter.com/product/hybrid-inverter-1/sun7-6-8-10-12ksg02lp1euam2-am3-7-612kw-single-phase-2-mppt-hybrid-inverter-lv-battery-supported.html",
    ],
    hints: [
      "sg02lp1",
      "7.6-12",
      "single-phase",
      "hybrid",
    ],
  },

  // ============================================================
  // THREE PHASE HYBRID SG04
  // SUN-5/6/8/10/12K-SG04LP3-EU
  // ============================================================

  sg04lp3: {
    name:
      "Deye SUN-5/6/8/10/12K-SG04LP3-EU",
    pages: [
      "https://de.deyeinverter.com/product/hybrid-inverter-1/sun5-6-8-10-12ksg04lp3.html",
      "https://www.deyeinverter.com/product/",
    ],
    hints: [
      "sg04lp3",
      "5-12k",
      "three-phase",
      "hybrid",
    ],
  },

  // ============================================================
  // SINGLE PHASE HYBRID SG05
  // 8kW entry in catalog
  //
  // Current fallback uses SG02 family visual if no direct
  // product page exposes a usable image.
  // Must be visually checked afterward.
  // ============================================================

  sg05lp1: {
    name:
      "Deye SUN-8K-SG05LP1-EU-SM2",
    pages: [
      "https://www.deyeinverter.com/product/",
      "https://www.deyeinverter.com/product/hybrid-inverter-1/sun7-6-8-10-12ksg02lp1euam2-am3-7-612kw-single-phase-2-mppt-hybrid-inverter-lv-battery-supported.html",
    ],
    hints: [
      "sg05lp1",
      "8k",
      "single-phase",
      "hybrid",
    ],
  },

  // ============================================================
  // THREE PHASE HYBRID SG05
  // SUN-14/15/16/18/20K-SG05LP3
  // ============================================================

  sg05lp3Large: {
    name:
      "Deye SUN-14/15/16/18/20K-SG05LP3-EU-SM2",
    pages: [
      "https://www.deyeinverter.com/product/three-phase-hybrid-inverter-1/sun14-15-16-18-20ksg05lp3eusm2-1420kw-three-phase-2-mppt-hybrid-inverter-lv-battery-supported.html",
    ],
    hints: [
      "sg05lp3",
      "14-20k",
      "20k",
      "three-phase",
      "hybrid",
    ],
  },

  // ============================================================
  // OFF GRID OG01
  // SUN-3.6/5/6K-OG01LP1-EU-AM2
  // ============================================================

  og01lp1: {
    name:
      "Deye SUN-3.6/5/6K-OG01LP1-EU-AM2",
    pages: [
      "https://www.deyeinverter.com/product/",
      "https://www.deyeinverter.com/download/product-1/",
    ],
    hints: [
      "og01lp1",
      "3.6",
      "5k",
      "6k",
      "off-grid",
      "offgrid",
    ],
  },

  // ============================================================
  // OFF GRID OG03
  // ============================================================

  og03lp1: {
    name:
      "Deye SUN-6K-OG03LP1-EU-AM2",
    pages: [
      "https://www.deyeinverter.com/product/",
      "https://www.deyeinverter.com/download/product-1/",
    ],
    hints: [
      "og03lp1",
      "6k",
      "off-grid",
      "offgrid",
    ],
  },

  // ============================================================
  // ALL IN ONE
  // ============================================================

  allInOne: {
    name:
      "Deye All-in-One Hybrid ESS",
    pages: [
      "https://www.deyeinverter.com/product/",
      "https://www.deyeinverter.com/download/product-2/",
    ],
    hints: [
      "all-in-one",
      "allinone",
      "ess",
      "hybrid",
      "battery",
    ],
  },
};

const TARGETS = [
  // ============================================================
  // BATTERIES
  // ============================================================

  {
    prefix: "deye-se-f5-l",
    family: "seF5",
  },

  {
    prefix: "deye-se-f5",
    family: "seF5",
  },

  {
    prefix: "deye-se-f5-c",
    family: "seF5",
  },

  {
    prefix: "deye-se-f16",
    family: "seF16",
  },

  {
    prefix: "deye-se-f16-c",
    family: "seF16",
  },

  {
    prefix: "deye-se-g5-1",
    family: "seG51",
  },

  // ============================================================
  // SG04LP1 SINGLE PHASE
  // ============================================================

  {
    prefix:
      "deye-sun-3k-sg04lp1-eu-sm1",
    family: "sg04lp1",
  },

  {
    prefix:
      "deye-sun-3-6k-sg04lp1-eu-sm2",
    family: "sg04lp1",
  },

  {
    prefix:
      "deye-sun-5k-sg04lp1-eu-sm2",
    family: "sg04lp1",
  },

  {
    prefix:
      "deye-sun-6k-sg04lp1-eu-sm2",
    family: "sg04lp1",
  },

  // ============================================================
  // SG02LP1 SINGLE PHASE
  // ============================================================

  {
    prefix:
      "deye-sun-10k-sg02lp1-eu-am3",
    family: "sg02lp1",
  },

  {
    prefix:
      "deye-sun-12k-sg02lp1-eu-am3",
    family: "sg02lp1",
  },

  // ============================================================
  // SG04LP3 THREE PHASE
  // ============================================================

  {
    prefix:
      "deye-sun-5k-sg04lp3-eu",
    family: "sg04lp3",
  },

  {
    prefix:
      "deye-sun-6k-sg04lp3-eu",
    family: "sg04lp3",
  },

  {
    prefix:
      "deye-sun-8k-sg04lp3-eu",
    family: "sg04lp3",
  },

  {
    prefix:
      "deye-sun-10k-sg04lp3-eu",
    family: "sg04lp3",
  },

  {
    prefix:
      "deye-sun-12k-sg04lp3-eu",
    family: "sg04lp3",
  },

  // ============================================================
  // SG05LP1
  // ============================================================

  {
    prefix:
      "deye-sun-8k-sg05lp1-eu-sm2",
    family: "sg05lp1",
  },

  // ============================================================
  // SG05LP3 THREE PHASE
  // ============================================================

  {
    prefix:
      "deye-sun-20k-sg05lp3-eu-sm2",
    family: "sg05lp3Large",
  },

  {
    prefix:
      "deye-deye-20kw-three-phase-hybrid-inverter",
    family: "sg05lp3Large",
  },

  // ============================================================
  // OG01 OFF GRID
  // ============================================================

  {
    prefix:
      "deye-sun-3-6k-og01lp1-eu-am2",
    family: "og01lp1",
  },

  {
    prefix:
      "deye-sun-5k-og01lp1-eu-am2",
    family: "og01lp1",
  },

  {
    prefix:
      "deye-sun-6k-og01lp1-eu-am2",
    family: "og01lp1",
  },

  {
    prefix:
      "deye-deye-6kw-single-phase-off-grid-inverter",
    family: "og01lp1",
  },

  // ============================================================
  // OG03 OFF GRID
  // ============================================================

  {
    prefix:
      "deye-sun-6k-og03lp1-eu-am2",
    family: "og03lp1",
  },

  // ============================================================
  // GENERIC 6KW HYBRID
  // ============================================================

  {
    prefix:
      "deye-deye-6kw-hybrid-solar-inverter",
    family: "sg04lp1",
  },

  // ============================================================
  // ALL IN ONE
  // ============================================================

  {
    prefix:
      "deye-deye-all-in-one-hybrid-system-with-kit",
    family: "allInOne",
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

  value = value.replaceAll("\\/", "/");

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

function isBadCandidate(url) {
  let lower;

  try {
    lower =
      decodeURIComponent(
        url
      ).toLowerCase();
  } catch {
    lower =
      String(url).toLowerCase();
  }

  return BAD_TERMS.some(
    (term) =>
      lower.includes(term)
  );
}

function extractImageCandidates(
  html,
  baseUrl
) {
  const candidates =
    new Set();

  const attributeRegex =
    /(?:src|data-src|data-original|data-lazy-src|data-image|data-url|href)\s*=\s*["']([^"']+)["']/gi;

  for (
    const match of html.matchAll(
      attributeRegex
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
    const items =
      match[1].split(",");

    for (
      const item of items
    ) {
      const raw =
        item
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

function normalizeSearchText(
  value
) {
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
    normalizeSearchText(
      url
    );

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
      score += 1000;
    }
  }

  if (
    lower.includes(
      "deyeinverter"
    )
  ) {
    score += 100;
  }

  if (
    lower.includes(
      "/deyeinverter/"
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
    score += 100;
  }

  if (
    lower.includes(
      "inverter"
    )
  ) {
    score += 100;
  }

  if (
    lower.endsWith(
      ".png"
    )
  ) {
    score += 80;
  }

  if (
    lower.endsWith(
      ".webp"
    )
  ) {
    score += 60;
  }

  if (
    lower.endsWith(
      ".jpg"
    ) ||
    lower.endsWith(
      ".jpeg"
    )
  ) {
    score += 40;
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

  if (
    !response.ok
  ) {
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

  const allCandidates =
    new Set();

  console.log("");
  console.log(
    `Family: ${family.name}`
  );

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

      const candidates =
        extractImageCandidates(
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

  if (
    !response.ok
  ) {
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
    10000
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
    "Deye official image sync"
  );

  console.log(
    "========================"
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

      if (
        !resolved
      ) {
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

      if (
        !buffer
      ) {
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
    "========================"
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
    "Do NOT regenerate external-products.generated.ts yet."
  );

  console.log(
    "First visually inspect all Deye images."
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