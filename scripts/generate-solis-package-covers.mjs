#!/usr/bin/env node

/**
 * Desh Solar - Solis package cover generator
 *
 * Creates customer-facing package cover images using:
 *   - locally stored official Solis inverter images
 *   - clean Desh Solar package graphics
 *   - no competitor/source-store images
 *
 * Output:
 *   public/assets/products/
 *
 * Run from:
 *   D:\desh-solar-website\frontend
 */

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();

const PRODUCT_DIR = path.join(
  ROOT,
  "public",
  "assets",
  "products"
);

const WIDTH = 1200;
const HEIGHT = 900;

const IMAGE_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".avif",
];

const PACKAGES = [
  {
    output:
      "solis-solis-3kw-hybrid-solar-system-package.png",

    inverterPrefix:
      "solis-s6-eh1p3k-l-plus",

    eyebrow:
      "SOLIS HYBRID SOLAR PACKAGE",

    title:
      "3kW Hybrid Solar System",

    subtitle:
      "Complete residential solar + backup solution",

    specs: [
      "3kW Solis Hybrid Inverter",
      "3.6kW Solar Array",
      "48V 100Ah Lithium Battery",
      "Structure + Protection",
      "Professional Installation",
    ],

    stats: [
      ["SOLAR", "3.6 kW"],
      ["INVERTER", "3 kW"],
      ["BATTERY", "48V 100Ah"],
    ],
  },

  {
    output:
      "solis-solis-6kw-hybrid-solar-system-package.png",

    inverterPrefix:
      "solis-s6-eh1p6k-l-plus",

    eyebrow:
      "SOLIS HYBRID SOLAR PACKAGE",

    title:
      "6kW Hybrid Solar System",

    subtitle:
      "Higher-capacity home and business solar solution",

    specs: [
      "6kW Solis Hybrid Inverter",
      "7.2kW Solar Array",
      "48V 100Ah Lithium Battery",
      "Structure + Protection",
      "Professional Installation",
    ],

    stats: [
      ["SOLAR", "7.2 kW"],
      ["INVERTER", "6 kW"],
      ["BATTERY", "48V 100Ah"],
    ],
  },

  {
    output:
      "solis-5kw-solis-hybrid-inverter-with-5kw-lithium-battery-combo-package.png",

    inverterPrefix:
      "solis-s6-eh1p5k-l-plus",

    eyebrow:
      "SOLIS ENERGY STORAGE COMBO",

    title:
      "5kW Hybrid + 5kWh Battery",

    subtitle:
      "Compact hybrid backup package",

    specs: [
      "5kW IP66 Solis Hybrid Inverter",
      "LVTOPSUN 5kWh LiFePO4 Battery",
      "Necessary Battery Cable",
      "Solar Ready",
      "Expandable System",
    ],

    stats: [
      ["INVERTER", "5 kW"],
      ["BATTERY", "5 kWh"],
      ["TYPE", "LiFePO4"],
    ],
  },

  {
    output:
      "solis-8kw-solis-hybrid-inverter-with-10kw-lithium-battery-combo-package.png",

    inverterPrefix:
      "solis-s6-eh1p8k-l-plus",

    eyebrow:
      "SOLIS COMPLETE HYBRID PACKAGE",

    title:
      "8kW Hybrid + 10kWh Battery",

    subtitle:
      "High-capacity solar and storage system",

    specs: [
      "8kW Official Solis Hybrid Inverter",
      "10.625kW Tier-1 Solar Array",
      "51.2V 200Ah Lithium Battery",
      "Structure + Protection",
      "Professional Installation",
    ],

    stats: [
      ["SOLAR", "10.625 kW"],
      ["INVERTER", "8 kW"],
      ["BATTERY", "10.24 kWh"],
    ],
  },
];

function escapeXml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

async function findProductImage(prefix) {
  const files = await fs.readdir(PRODUCT_DIR);

  const lowerPrefix =
    prefix.toLowerCase();

  const match =
    files.find((file) => {
      const ext =
        path.extname(file).toLowerCase();

      if (
        !IMAGE_EXTENSIONS.includes(ext)
      ) {
        return false;
      }

      const base =
        path
          .basename(file, ext)
          .toLowerCase();

      return (
        base === lowerPrefix ||
        base.startsWith(
          `${lowerPrefix}-`
        )
      );
    });

  if (!match) {
    throw new Error(
      `Missing official inverter image for prefix: ${prefix}`
    );
  }

  return path.join(
    PRODUCT_DIR,
    match
  );
}

async function createInverterPanel(
  sourcePath
) {
  const image =
    await sharp(sourcePath)
      .resize(
        430,
        520,
        {
          fit: "contain",
          background: {
            r: 255,
            g: 255,
            b: 255,
            alpha: 0,
          },
        }
      )
      .png()
      .toBuffer();

  return image;
}

function packageSvg(
  pkg
) {
  const specRows =
    pkg.specs
      .map(
        (
          item,
          index
        ) => `
          <g transform="translate(0 ${index * 54})">
            <circle
              cx="15"
              cy="17"
              r="15"
              fill="#EAF4EF"
            />

            <path
              d="M9 17.5 L13.5 22 L22 12.5"
              fill="none"
              stroke="#0F6B4F"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />

            <text
              x="44"
              y="25"
              font-family="Arial, Helvetica, sans-serif"
              font-size="23"
              font-weight="600"
              fill="#20352F"
            >
              ${escapeXml(item)}
            </text>
          </g>
        `
      )
      .join("");

  const statWidth = 188;

  const statCards =
    pkg.stats
      .map(
        (
          item,
          index
        ) => {
          const x =
            78 +
            index *
              (
                statWidth +
                18
              );

          return `
            <g transform="translate(${x} 704)">
              <rect
                width="${statWidth}"
                height="105"
                rx="20"
                fill="#FFFFFF"
                stroke="#DCE7E2"
                stroke-width="2"
              />

              <text
                x="${statWidth / 2}"
                y="35"
                text-anchor="middle"
                font-family="Arial, Helvetica, sans-serif"
                font-size="14"
                font-weight="700"
                letter-spacing="1.6"
                fill="#71817B"
              >
                ${escapeXml(item[0])}
              </text>

              <text
                x="${statWidth / 2}"
                y="75"
                text-anchor="middle"
                font-family="Arial, Helvetica, sans-serif"
                font-size="25"
                font-weight="700"
                fill="#102A23"
              >
                ${escapeXml(item[1])}
              </text>
            </g>
          `;
        }
      )
      .join("");

  return `
    <svg
      width="${WIDTH}"
      height="${HEIGHT}"
      viewBox="0 0 ${WIDTH} ${HEIGHT}"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="bg"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop
            offset="0%"
            stop-color="#F7FAF8"
          />

          <stop
            offset="100%"
            stop-color="#EEF4F1"
          />
        </linearGradient>

        <linearGradient
          id="accent"
          x1="0"
          y1="0"
          x2="1"
          y2="0"
        >
          <stop
            offset="0%"
            stop-color="#0F6B4F"
          />

          <stop
            offset="100%"
            stop-color="#174E3F"
          />
        </linearGradient>

        <filter
          id="shadow"
          x="-40%"
          y="-40%"
          width="180%"
          height="180%"
        >
          <feDropShadow
            dx="0"
            dy="18"
            stdDeviation="24"
            flood-color="#173F33"
            flood-opacity="0.14"
          />
        </filter>
      </defs>

      <rect
        width="${WIDTH}"
        height="${HEIGHT}"
        fill="url(#bg)"
      />

      <circle
        cx="1070"
        cy="105"
        r="245"
        fill="#E1EFE8"
        opacity="0.8"
      />

      <circle
        cx="1030"
        cy="790"
        r="280"
        fill="#E8F2ED"
      />

      <rect
        x="0"
        y="0"
        width="18"
        height="${HEIGHT}"
        fill="#0F6B4F"
      />

      <g transform="translate(78 58)">
        <rect
          width="188"
          height="40"
          rx="20"
          fill="#102A23"
        />

        <text
          x="94"
          y="26"
          text-anchor="middle"
          font-family="Arial, Helvetica, sans-serif"
          font-size="15"
          font-weight="700"
          letter-spacing="1.6"
          fill="#FFFFFF"
        >
          DESH SOLAR
        </text>
      </g>

      <text
        x="78"
        y="142"
        font-family="Arial, Helvetica, sans-serif"
        font-size="17"
        font-weight="700"
        letter-spacing="2.2"
        fill="#0F6B4F"
      >
        ${escapeXml(pkg.eyebrow)}
      </text>

      <text
        x="78"
        y="205"
        font-family="Arial, Helvetica, sans-serif"
        font-size="49"
        font-weight="700"
        fill="#102A23"
      >
        ${escapeXml(pkg.title)}
      </text>

      <text
        x="78"
        y="250"
        font-family="Arial, Helvetica, sans-serif"
        font-size="22"
        font-weight="400"
        fill="#687973"
      >
        ${escapeXml(pkg.subtitle)}
      </text>

      <rect
        x="78"
        y="287"
        width="79"
        height="6"
        rx="3"
        fill="#C7A35A"
      />

      <g
        transform="translate(78 335)"
      >
        ${specRows}
      </g>

      ${statCards}

      <g
        transform="translate(710 130)"
        filter="url(#shadow)"
      >
        <rect
          width="405"
          height="590"
          rx="38"
          fill="#FFFFFF"
        />

        <rect
          x="18"
          y="18"
          width="369"
          height="554"
          rx="29"
          fill="#F8FBF9"
          stroke="#E0E9E5"
          stroke-width="2"
        />
      </g>

      <g
        transform="translate(697 168)"
      >
        <!-- inverter image will be composited here -->
      </g>

      <g
        transform="translate(747 654)"
      >
        <rect
          width="330"
          height="44"
          rx="22"
          fill="url(#accent)"
        />

        <text
          x="165"
          y="29"
          text-anchor="middle"
          font-family="Arial, Helvetica, sans-serif"
          font-size="16"
          font-weight="700"
          letter-spacing="1.4"
          fill="#FFFFFF"
        >
          SOLIS HYBRID TECHNOLOGY
        </text>
      </g>

      <text
        x="1123"
        y="855"
        text-anchor="end"
        font-family="Arial, Helvetica, sans-serif"
        font-size="14"
        fill="#7C8984"
      >
        Package configuration image • Desh Solar
      </text>
    </svg>
  `;
}

async function generatePackage(
  pkg
) {
  const inverterPath =
    await findProductImage(
      pkg.inverterPrefix
    );

  console.log(
    `\nGenerating: ${pkg.output}`
  );

  console.log(
    `  Inverter: ${path.basename(
      inverterPath
    )}`
  );

  const baseSvg =
    Buffer.from(
      packageSvg(
        pkg
      )
    );

  const inverter =
    await createInverterPanel(
      inverterPath
    );

  const outputPath =
    path.join(
      PRODUCT_DIR,
      pkg.output
    );

  await sharp(baseSvg)
    .composite([
      {
        input:
          inverter,

        left:
          695,

        top:
          155,
      },
    ])
    .png({
      quality:
        95,
    })
    .toFile(
      outputPath
    );

  const stat =
    await fs.stat(
      outputPath
    );

  console.log(
    `  OK: /assets/products/${pkg.output}`
  );

  console.log(
    `  Size: ${Math.round(
      stat.size /
        1024
    )} KB`
  );
}

async function main() {
  await fs.mkdir(
    PRODUCT_DIR,
    {
      recursive:
        true,
    }
  );

  console.log(
    "Solis package cover generator"
  );

  console.log(
    "============================="
  );

  console.log(
    `Packages: ${PACKAGES.length}`
  );

  for (
    const pkg of
    PACKAGES
  ) {
    await generatePackage(
      pkg
    );
  }

  console.log(
    "\n============================="
  );

  console.log(
    "Generated: 4/4"
  );

  console.log(
    "No competitor images used."
  );

  console.log(
    "Official local Solis inverter images retained."
  );
}

main().catch(
  (error) => {
    console.error(
      "\nPACKAGE COVER GENERATION FAILED"
    );

    console.error(
      error
    );

    process.exitCode =
      1;
  }
);