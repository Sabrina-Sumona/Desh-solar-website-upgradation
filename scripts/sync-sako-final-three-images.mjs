#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const ROOT = process.cwd();

const PRODUCTS_DIR = path.join(
  ROOT,
  "public",
  "assets",
  "products"
);

const IMPORTER = path.join(
  ROOT,
  "scripts",
  "sync-external-products.mjs"
);

const TARGETS = [
  {
    name: "SAKO 3000VA Automatic Voltage Stabilizer",
    prefix: "sako-sako-3000va-automatic-voltage-stabilizer",
    url: "https://cdn.bdstall.com/product-image/410487_800X800.webp",
    source:
      "https://www.bdstall.com/details/sako-3000va-automatic-voltege-stabilizer-88610/",
  },

  {
    name: "SAKO AVS-5 KVA Automatic Voltage Regulator",
    prefix: "sako-avs-5",
    url:
      "https://5147327916888705-1715650521540.cdn.site.joinf.com/5147327916888705/kymhSyFPsr.jpg?imageMogr2%2Fthumbnail%2F800x800%2Fpad%2F1%2Fcolor%2FI0ZGRkZGRg=%3D%2Fsharpen%2F100%2Fformat%2Fwebp%2Fignore-error%2F1%2Fauto-orient",
    source:
      "https://www.tmuxsako.com/automatic-voltage-regulator-avs-5kva.html",
  },

  {
    name: "SAKO E-SUN 4.2KVA 24V Off-Grid MPPT Solar Inverter",
    prefix: "sako-e-sun-4-2kva",
    url:
      "https://www.bdshop.com/assets/images/products/solar-inverter/product_1765349629_693918fd530c8.webp",
    source:
      "https://www.bdshop.com/product/sako-e-sun-42kva-24v-home-power-energy-inverter-on-grid-off-grid-mppt-hybrid-solar-inverter",
  },
];

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
  "AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Chrome/155.0 Safari/537.36";

const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
]);

async function removeExistingFiles(prefix) {
  let files = [];

  try {
    files = await fs.readdir(PRODUCTS_DIR);
  } catch {
    return;
  }

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();

    if (!IMAGE_EXTENSIONS.has(ext)) {
      continue;
    }

    const base = path.basename(file, ext).toLowerCase();

    if (base === prefix.toLowerCase()) {
      await fs.rm(
        path.join(PRODUCTS_DIR, file),
        {
          force: true,
        }
      );
    }
  }
}

function detectExtension(contentType, url) {
  const type = String(contentType).toLowerCase();

  if (type.includes("webp")) {
    return ".webp";
  }

  if (type.includes("png")) {
    return ".png";
  }

  if (
    type.includes("jpeg") ||
    type.includes("jpg")
  ) {
    return ".jpg";
  }

  if (type.includes("avif")) {
    return ".avif";
  }

  try {
    const ext = path
      .extname(new URL(url).pathname)
      .toLowerCase();

    if (IMAGE_EXTENSIONS.has(ext)) {
      return ext === ".jpeg"
        ? ".jpg"
        : ext;
    }
  } catch {
    //
  }

  return ".jpg";
}

async function downloadTarget(target) {
  console.log(`\nDownloading: ${target.name}`);

  console.log(`Source: ${target.source}`);

  const response = await fetch(
    target.url,
    {
      redirect: "follow",

      headers: {
        "user-agent": USER_AGENT,

        accept:
          "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",

        referer: target.source,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `${target.name}: HTTP ${response.status} ${response.statusText}`
    );
  }

  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  if (
    !contentType
      .toLowerCase()
      .startsWith("image/")
  ) {
    throw new Error(
      `${target.name}: URL did not return an image (${contentType})`
    );
  }

  const bytes = Buffer.from(
    await response.arrayBuffer()
  );

  if (bytes.length < 8000) {
    throw new Error(
      `${target.name}: suspiciously small image (${bytes.length} bytes)`
    );
  }

  const ext = detectExtension(
    contentType,
    response.url || target.url
  );

  await removeExistingFiles(
    target.prefix
  );

  const filename =
    `${target.prefix}${ext}`;

  const outputPath = path.join(
    PRODUCTS_DIR,
    filename
  );

  await fs.writeFile(
    outputPath,
    bytes
  );

  console.log(
    `Saved: public/assets/products/${filename}`
  );

  console.log(
    `Size: ${bytes.length} bytes`
  );

  return filename;
}

async function runImporter() {
  console.log(
    "\nRunning product importer..."
  );

  await new Promise(
    (resolve, reject) => {
      const child = spawn(
        process.execPath,
        [IMPORTER],
        {
          cwd: ROOT,

          stdio: "inherit",

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
        (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(
              new Error(
                `Importer exited with code ${code}`
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
    PRODUCTS_DIR,
    {
      recursive: true,
    }
  );

  console.log(
    "SAKO final three image sync"
  );

  console.log(
    "============================"
  );

  console.log(
    "Downloading exact product-matched images only."
  );

  let completed = 0;

  for (const target of TARGETS) {
    await downloadTarget(target);

    completed += 1;
  }

  console.log(
    `\nDownloaded ${completed}/${TARGETS.length} images.`
  );

  await runImporter();

  console.log(
    "\nSAKO FINAL THREE IMAGE SYNC COMPLETE"
  );
}

main().catch(
  (error) => {
    console.error(
      "\nSAKO FINAL THREE IMAGE SYNC FAILED"
    );

    console.error(error);

    process.exitCode = 1;
  }
);