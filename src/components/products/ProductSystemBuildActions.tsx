"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
} from "react";

import type { Product } from "@/data/products";

type ProductSystemBuildActionsProps = {
  product: Product;
};

type SystemBuildProduct = {
  id: string;
  name: string;
  category: Product["category"];
  categoryLabel: string;
  brandLabel: string;
  power: string;
  image: string;
  priceText: string;
  addedAt: string;
};

const SYSTEM_BUILD_KEY =
  "deshSolarSystemBuildV1";

function readSystemBuild(): SystemBuildProduct[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(
        SYSTEM_BUILD_KEY
      ) || "[]"
    );

    return Array.isArray(parsed)
      ? parsed.filter(
          (item) =>
            item &&
            typeof item.id === "string"
        )
      : [];
  } catch {
    return [];
  }
}

function writeSystemBuild(
  items: SystemBuildProduct[]
) {
  window.localStorage.setItem(
    SYSTEM_BUILD_KEY,
    JSON.stringify(items)
  );

  window.dispatchEvent(
    new CustomEvent(
      "deshsolar:systembuildchange",
      {
        detail: {
          items,
          count: items.length,
        },
      }
    )
  );
}

type ToastState = {
  message: string;
  tone: "added" | "removed";
} | null;

export default function ProductSystemBuildActions({
  product,
}: ProductSystemBuildActionsProps) {
  const [added, setAdded] =
    useState(false);
  const [toast, setToast] =
    useState<ToastState>(null);
  const toastTimerRef =
    useRef<number | null>(null);

  const showToast = (
    message: string,
    tone: "added" | "removed"
  ) => {
    setToast({ message, tone });

    if (toastTimerRef.current) {
      window.clearTimeout(
        toastTimerRef.current
      );
    }

    toastTimerRef.current =
      window.setTimeout(() => {
        setToast(null);
        toastTimerRef.current = null;
      }, 2400);
  };

  useEffect(() => {
    const sync = () => {
      const items = readSystemBuild();

      setAdded(
        items.some(
          (item) => item.id === product.id
        )
      );
    };

    sync();

    window.addEventListener(
      "deshsolar:systembuildchange",
      sync
    );

    window.addEventListener(
      "storage",
      sync
    );

    return () => {
      window.removeEventListener(
        "deshsolar:systembuildchange",
        sync
      );

      window.removeEventListener(
        "storage",
        sync
      );

      if (toastTimerRef.current) {
        window.clearTimeout(
          toastTimerRef.current
        );
        toastTimerRef.current = null;
      }
    };
  }, [product.id]);

  const toggleSystemBuild = () => {
    const current = readSystemBuild();

    const exists = current.some(
      (item) => item.id === product.id
    );

    if (exists) {
      const next = current.filter(
        (item) => item.id !== product.id
      );

      writeSystemBuild(next);
      setAdded(false);
      showToast(
        "Removed from My System",
        "removed"
      );
      return;
    }

    const next: SystemBuildProduct[] = [
      ...current,
      {
        id: product.id,
        name: product.name,
        category: product.category,
        categoryLabel:
          product.categoryLabel,
        brandLabel: product.brandLabel,
        power: product.power,
        image: product.image,
        priceText: product.priceText,
        addedAt: new Date().toISOString(),
      },
    ];

    writeSystemBuild(next);
    setAdded(true);
    showToast(
      "Added to My System",
      "added"
    );
  };

  return (
    <>
      <div className="pdBuilderActions">
        <button
          type="button"
          className={`pdBuilderButton pdBuilderUseButton${
            added ? " isAdded" : ""
          }`}
          onClick={toggleSystemBuild}
          aria-pressed={added}
          aria-label={
            added
              ? `Remove ${product.name} from My System`
              : `Add ${product.name} to My System`
          }
        >
          {added
            ? "Remove from My System −"
            : "Use in My System +"}
        </button>

        <Link
          className="pdBuilderButton pdBuilderButtonSecondary"
          href="/build-your-system"
        >
          View My System →
        </Link>
      </div>

      {toast && (
        <div
          className={`pdSystemToast ${
            toast.tone === "added"
              ? "isAdded"
              : "isRemoved"
          }`}
          role="status"
          aria-live="polite"
        >
          <span
            className="pdSystemToastIcon"
            aria-hidden="true"
          >
            {toast.tone === "added"
              ? "✓"
              : "−"}
          </span>

          <div>
            <small>BUILD YOUR SYSTEM</small>
            <strong>{toast.message}</strong>
            <span>{product.name}</span>
          </div>
        </div>
      )}
    </>
  );
}
