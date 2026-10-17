#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const ROOT = process.cwd();

const IMAGE_URL =
  "https://sakopower.com/wp-content/uploads/2025/12/li-sun-lithium-battery2.jpg";

const APPROVED_DIR = path.join(
  ROOT,
  "public",
  "assets",
  "products"
);

const MAIN_IMPORTER = path.join(
  ROOT,
  "scripts",
  "sync-external-products.mjs"
);

const TARGETS = [
  {
    model: "SK-25.6V200AH",
    prefix: "sako-sk-25-6v200ah",
  },
  {
    model: "SK-51.2V200AH",
    prefix: "sako-sk-51-2v200ah",
  },
];

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
  "AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Chrome/155.0 Safari/537.36 DeshSolarSakoLiSunFamilyFallback/1.0";

async function removeExistingPrefixFiles(prefix) {
  let files = [];

  try {
    files = await fs.readdir(APPROVED_DIR);
  } catch {
    return;
  }

  const imageExts = new Set([
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".avif",
  ]);

  for (const file of files) {
    const ext =
      path
        .extname(file)
        .toLowerCase();

    if (!imageExts.has(ext)) {
      continue;
    }

    const base =
      path
        .basename(file, ext)
        .toLowerCase();

    if (
      base ===
      prefix.toLowerCase()
    ) {
      await fs.rm(
        path.join(
          APPROVED_DIR,
          file
        ),
        {
          force: true,
        }
      );
    }
  }
}

async function rerunImporter() {
  await new Promise(
    (resolve, reject) => {
      const child = spawn(
        process.execPath,
        [MAIN_IMPORTER],
        {
          cwd: ROOT,
          stdio: "inherit",

          env: {
            ...process.env,
            DOWNLOAD_SOURCE_IMAGES: "0",
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
                `Main importer exited with code ${code}`
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
    APPROVED_DIR,
    {
      recursive: true,
    }
  );

  console.log(
    "SAKO Li-Sun official family-image fallback"
  );

  console.log(
    "========================================"
  );

  console.log(
    "Using one official SAKO Li-Sun family image"
  );

  console.log(
    "for two confirmed Li-Sun capacity variants."
  );

  console.log(
    `Image: ${IMAGE_URL}\n`
  );

  const response =
    await fetch(
      IMAGE_URL,
      {
        redirect: "follow",

        headers: {
          "user-agent":
            USER_AGENT,

          accept:
            "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",

          referer:
            "https://sakopower.com/",
        },
      }
    );

  if (!response.ok) {
    throw new Error(
      `Image download failed: ${response.status} ${response.statusText}`
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
      `URL did not return an image: ${
        contentType || "unknown"
      }`
    );
  }

  const bytes =
    Buffer.from(
      await response.arrayBuffer()
    );

  if (
    bytes.length < 8000
  ) {
    throw new Error(
      `Image is suspiciously small: ${bytes.length} bytes`
    );
  }

  let ext = ".jpg";

  if (
    contentType
      .toLowerCase()
      .includes("png")
  ) {
    ext = ".png";
  } else if (
    contentType
      .toLowerCase()
      .includes("webp")
  ) {
    ext = ".webp";
  } else if (
    contentType
      .toLowerCase()
      .includes("avif")
  ) {
    ext = ".avif";
  }

  for (const target of TARGETS) {
    await removeExistingPrefixFiles(
      target.prefix
    );

    const filename =
      `${target.prefix}${ext}`;

    await fs.writeFile(
      path.join(
        APPROVED_DIR,
        filename
      ),
      bytes
    );

    console.log(
      `${target.model} -> public/assets/products/${filename}`
    );
  }

  console.log(
    "\nRunning main importer..."
  );

  await rerunImporter();

  console.log(
    "\nDONE"
  );

  console.log(
    "These are official FAMILY images,"
  );

  console.log(
    "not claimed as exact model-specific hero images."
  );
}

main().catch(
  (error) => {
    console.error(
      "\nSAKO LI-SUN FAMILY FALLBACK FAILED"
    );

    console.error(error);

    process.exitCode = 1;
  }
);