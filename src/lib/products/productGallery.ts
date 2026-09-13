import type { Product } from "@/data/products";

/**
 * Add only real/approved additional images here.
 *
 * Example:
 * "jinko590": [
 *   "/assets/products-real/jinko590-side.webp",
 *   "/assets/products-real/jinko590-back.webp",
 * ],
 *
 * Do not add duplicate formats of the same photo just to create thumbnails.
 */
export const PRODUCT_GALLERY_IMAGES: Partial<
  Record<string, string[]>
> = {};

export function getProductGalleryImages(product: Product) {
  const additionalImages =
    PRODUCT_GALLERY_IMAGES[product.id] ?? [];

  return Array.from(
    new Set([product.image, ...additionalImages].filter(Boolean))
  );
}
