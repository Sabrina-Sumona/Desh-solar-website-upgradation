"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import type { Product } from "@/data/products";
import { getProductGalleryImages } from "@/lib/products/productGallery";

import styles from "./ProductImageGallery.module.css";

type ProductImageGalleryProps = {
  product: Product;
};

export default function ProductImageGallery({
  product,
}: ProductImageGalleryProps) {
  const images = useMemo(
    () => getProductGalleryImages(product),
    [product]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  const activeImage = images[activeIndex] ?? product.image;
  const hasMultipleImages = images.length > 1;

  const showPrevious = () => {
    setActiveIndex((current) =>
      current <= 0 ? images.length - 1 : current - 1
    );
  };

  const showNext = () => {
    setActiveIndex((current) =>
      current >= images.length - 1 ? 0 : current + 1
    );
  };

  useEffect(() => {
    setActiveIndex(0);
    setLightboxOpen(false);
  }, [product.id]);

  useEffect(() => {
    if (!lightboxOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxOpen(false);
      }

      if (hasMultipleImages && event.key === "ArrowLeft") {
        showPrevious();
      }

      if (hasMultipleImages && event.key === "ArrowRight") {
        showNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    const focusTimer = window.setTimeout(() => {
      closeRef.current?.focus();
    }, 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [lightboxOpen, hasMultipleImages, images.length]);

  return (
    <>
      <div className={styles.gallery}>
        <button
          type="button"
          className={styles.mainImage}
          onClick={() => setLightboxOpen(true)}
          aria-label={`Enlarge image of ${product.name}`}
        >
          <Image
            src={activeImage}
            alt={product.name}
            width={1100}
            height={850}
            priority
            sizes="(max-width: 900px) 94vw, 48vw"
          />

          <span className={styles.categoryBadge}>
            {product.categoryLabel}
          </span>

          <span className={styles.zoomHint}>
            <span aria-hidden="true">⌕</span>
            Click to enlarge
          </span>

          {hasMultipleImages && (
            <span className={styles.counter}>
              {activeIndex + 1} / {images.length}
            </span>
          )}
        </button>

        {hasMultipleImages && (
          <div
            className={styles.thumbnailRow}
            aria-label={`${product.name} image gallery`}
          >
            {images.map((image, index) => (
              <button
                type="button"
                className={`${styles.thumbnail}${
                  index === activeIndex
                    ? ` ${styles.thumbnailActive}`
                    : ""
                }`}
                key={`${image}-${index}`}
                onClick={() => setActiveIndex(index)}
                aria-label={`Show image ${index + 1} of ${images.length}`}
                aria-pressed={index === activeIndex}
              >
                <Image
                  src={image}
                  alt=""
                  width={140}
                  height={105}
                  sizes="92px"
                />
              </button>
            ))}
          </div>
        )}

        <div className={styles.galleryMeta}>
          <span>
            {hasMultipleImages
              ? `${images.length} approved product images`
              : "Real product / system image"}
          </span>

          <small>
            {hasMultipleImages
              ? "Select a thumbnail or open the image for a closer look."
              : "Open the image for a closer look."}
          </small>
        </div>
      </div>

      {lightboxOpen && (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={`${product.name} image viewer`}
        >
          <button
            type="button"
            className={styles.backdrop}
            onClick={() => setLightboxOpen(false)}
            aria-label="Close image viewer"
          />

          <div className={styles.lightboxPanel}>
            <div className={styles.lightboxHeader}>
              <div>
                <small>{product.brandLabel}</small>
                <b>{product.name}</b>
              </div>

              <button
                ref={closeRef}
                type="button"
                className={styles.closeButton}
                onClick={() => setLightboxOpen(false)}
                aria-label="Close image viewer"
              >
                ×
              </button>
            </div>

            <div className={styles.lightboxImage}>
              <Image
                src={activeImage}
                alt={product.name}
                width={1500}
                height={1150}
                sizes="96vw"
                priority
              />

              {hasMultipleImages && (
                <>
                  <button
                    type="button"
                    className={`${styles.navButton} ${styles.navPrevious}`}
                    onClick={showPrevious}
                    aria-label="Previous product image"
                  >
                    ←
                  </button>

                  <button
                    type="button"
                    className={`${styles.navButton} ${styles.navNext}`}
                    onClick={showNext}
                    aria-label="Next product image"
                  >
                    →
                  </button>

                  <span className={styles.lightboxCounter}>
                    {activeIndex + 1} / {images.length}
                  </span>
                </>
              )}
            </div>

            {hasMultipleImages && (
              <div className={styles.lightboxThumbnails}>
                {images.map((image, index) => (
                  <button
                    type="button"
                    className={`${styles.thumbnail}${
                      index === activeIndex
                        ? ` ${styles.thumbnailActive}`
                        : ""
                    }`}
                    key={`lightbox-${image}-${index}`}
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Show image ${index + 1}`}
                    aria-pressed={index === activeIndex}
                  >
                    <Image
                      src={image}
                      alt=""
                      width={140}
                      height={105}
                      sizes="92px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
