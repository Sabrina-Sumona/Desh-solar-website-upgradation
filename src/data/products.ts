/*
 * Desh Solar master catalogue wrapper.
 *
 * IMPORTANT:
 * 1) Rename your CURRENT src/data/products.ts to src/data/products.base.ts.
 * 2) Put this file at src/data/products.ts.
 * 3) The importer writes external products to external-products.generated.ts.
 *
 * This preserves your existing hand-curated catalogue while allowing the
 * IPS Bazar + Solar.com.bd catalogue to be generated independently.
 */

import {
  productApplications as baseProductApplications,
  products as baseProducts,
  type Product as BaseProduct,
  type ProductCategory as BaseProductCategory,
} from "./products.base";
import { externalProducts } from "./external-products.generated";

export type ProductCategory = BaseProductCategory | "ips" | "component";

export type Product = Omit<BaseProduct, "category" | "categoryLabel"> & {
  category: ProductCategory;
  categoryLabel: string;
  /** Detailed grouping used for future filters without exploding top-level categories. */
  subcategory?: string;
  /** Manufacturer model / SKU when the source exposes it. */
  model?: string;
  /** Where this catalogue record was discovered. Internal audit metadata only. */
  sourceSites?: Array<"ipsbazarbd.com" | "solar.com.bd">;
  sourceUrls?: string[];
  /** Competitor/reference price. Never treated as Desh Solar's selling price automatically. */
  sourcePriceText?: string | null;
  /** Local gallery paths downloaded by the import script, when available. */
  importedGallery?: string[];
  /** Import review state. */
  importStatus?: "ready" | "review";
};

export const productApplications = baseProductApplications;

export const productCategories = [
  { value: "all", label: "All Products" },
  { value: "panel", label: "Solar Panels" },
  { value: "inverter", label: "Solar Inverters" },
  { value: "battery", label: "Batteries" },
  { value: "ips", label: "IPS / UPS" },
  { value: "portable", label: "Portable Power" },
  { value: "component", label: "Components & Protection" },
  { value: "system", label: "Complete Systems" },
] as const;

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\b(lifepo4|lithium ion|lithium-ion)\b/g, "lithium")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function productKey(product: Product) {
  const brand = normalize(product.brandLabel || product.brand || "");
  const model = normalize(product.model || "");

  // Exact brand + model is the strongest safe duplicate key.
  if (brand && model && model.length >= 3) {
    return `model:${brand}:${model}`;
  }

  // Fallback is intentionally conservative. We do NOT merge only by capacity,
  // because two different models can share the same wattage / Ah / kWh.
  return `name:${normalize(product.name)}`;
}

/**
 * Existing Desh Solar records win if an imported record has the same exact
 * model/name key. This protects your manually curated price/image/content.
 */
function mergeProducts() {
  const result: Product[] = [];
  const seen = new Set<string>();

  for (const product of [
    ...(baseProducts as unknown as Product[]),
    ...(externalProducts as Product[]),
  ]) {
    const key = productKey(product);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(product);
  }

  return result;
}

export const products: Product[] = mergeProducts();
