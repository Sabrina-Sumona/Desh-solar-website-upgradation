"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Product } from "@/data/products";
import ProductPlanningPanel from "@/components/products/ProductPlanningPanel";
import {
  getActiveFlowKeys,
  getProductPlanningProfile,
  PRODUCT_FLOW_ITEMS,
} from "@/lib/products/productPlanning";

type ProductQuickViewProps = {
  product: Product | null;
  onClose: () => void;
};

export default function ProductQuickView({
  product,
  onClose,
}: ProductQuickViewProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!product) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [product, onClose]);

  if (!product) {
    return null;
  }

  const profile = getProductPlanningProfile(product);
  const activeKeys = getActiveFlowKeys(product.category);

  const buildHref =
    `/build-your-system?selectedProduct=${encodeURIComponent(product.id)}` +
    `&productType=${encodeURIComponent(product.category)}` +
    `&selectedName=${encodeURIComponent(product.name)}` +
    `&selectedRating=${encodeURIComponent(product.power)}`;

  const askHref =
    `/contact-us?source=product` +
    `&product=${encodeURIComponent(product.name)}` +
    `&productType=${encodeURIComponent(product.category)}`;

  return (
    <>
      <button
        type="button"
        className="pqvdBackdrop"
        aria-label="Close product quick view"
        onClick={onClose}
      />

      <aside
        className="pqvdDrawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pqvd-title"
      >
        <div className="pqvdHead">
          <small>PRODUCT QUICK VIEW</small>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close quick view"
          >
            ×
          </button>
        </div>

        <div className="pqvdContent">
          <div className="pqvdMedia">
            <Image
              src={product.image}
              alt={product.name}
              width={900}
              height={620}
              sizes="(max-width: 620px) 100vw, 560px"
              priority
            />
          </div>

          <div className="pqvdEyebrow">{profile.role}</div>

          <h2 id="pqvd-title">{product.name}</h2>

          <p className="pqvdLead">{profile.why}</p>

          <div className="pqvdTags">
            {product.bestFor.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>

          <div className="pqvdSection">
            <small>SYSTEM ROLE</small>
            <h3>{profile.role}</h3>

            <div
              className="pqvdMiniFlow"
              aria-label="Product role in solar system"
            >
              {PRODUCT_FLOW_ITEMS.map((item, index) => (
                <div className="pqvdFlowItem" key={item.key}>
                  <span
                    className={
                      activeKeys.includes(item.key) ? "active" : ""
                    }
                    title={item.label}
                  >
                    {item.icon}
                  </span>

                  {index < PRODUCT_FLOW_ITEMS.length - 1 && (
                    <i aria-hidden="true">→</i>
                  )}
                </div>
              ))}
            </div>
          </div>

          <ProductPlanningPanel
            product={product}
            variant="quick"
          />

          <div className="pqvdActions">
            <Link href={`/products/${product.id}`}>
              View Product Details →
            </Link>

            <Link href={buildHref}>
              Use in My System →
            </Link>

            <Link className="secondary" href={askHref}>
              Ask About Product →
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
