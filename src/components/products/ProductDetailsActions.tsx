"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/data/products";

type ProductDetailsActionsProps = {
  product: Product;
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  priceText: string;
  image: string;
  category: string;
  quoteOnly: boolean;
  qty: number;
};

const CART_KEY = "deshSolarCartV1";

function readCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(CART_KEY) || "[]"
    );

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));

  const count = items.reduce(
    (total, item) => total + Math.max(1, Number(item.qty) || 1),
    0
  );

  const subtotal = items.reduce(
    (total, item) =>
      total +
      (item.quoteOnly
        ? 0
        : Number(item.price || 0) *
          Math.max(1, Number(item.qty) || 1)),
    0
  );

  window.dispatchEvent(
    new CustomEvent("deshsolar:cartchange", {
      detail: {
        items,
        count,
        subtotal,
        hasQuote: items.some((item) => item.quoteOnly),
      },
    })
  );
}

export default function ProductDetailsActions({
  product,
}: ProductDetailsActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [status, setStatus] = useState("Add to Cart");

  const refreshFromCart = () => {
    const item = readCart().find(
      (cartItem) => String(cartItem.id) === product.id
    );

    setCartQuantity(item ? Math.max(1, Number(item.qty) || 1) : 0);
  };

  useEffect(() => {
    refreshFromCart();

    const handleCartChange = () => refreshFromCart();
    const handleStorage = () => refreshFromCart();

    window.addEventListener(
      "deshsolar:cartchange",
      handleCartChange
    );
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(
        "deshsolar:cartchange",
        handleCartChange
      );
      window.removeEventListener("storage", handleStorage);
    };
  }, [product.id]);

  const addToCart = () => {
    const items = readCart();
    const existing = items.find(
      (item) => String(item.id) === product.id
    );

    if (existing) {
      existing.qty =
        Math.max(1, Number(existing.qty) || 1) + quantity;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: product.price ?? 0,
        priceText: product.priceText || "Contact for price",
        image: product.image,
        category: product.categoryLabel,
        quoteOnly: product.price === null,
        qty: quantity,
      });
    }

    writeCart(items);
    refreshFromCart();

    setStatus(
      product.price === null ? "Added for Quote ✓" : "Added to Cart ✓"
    );

    window.setTimeout(() => {
      setStatus("Add to Cart");
    }, 1600);
  };

  return (
    <div className="pdPurchaseControls">
      <div className="pdQuantityControl">
        <span>QUANTITY</span>

        <div>
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() =>
              setQuantity((current) => Math.max(1, current - 1))
            }
          >
            −
          </button>

          <strong>{quantity}</strong>

          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() =>
              setQuantity((current) => Math.min(99, current + 1))
            }
          >
            +
          </button>
        </div>
      </div>

      <button
        className="pdAddCart"
        type="button"
        onClick={addToCart}
      >
        {status}
        {cartQuantity > 0 && (
          <span>{cartQuantity} in cart</span>
        )}
      </button>
    </div>
  );
}
