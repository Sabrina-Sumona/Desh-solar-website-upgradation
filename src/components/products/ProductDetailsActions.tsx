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
  window.localStorage.setItem(
    CART_KEY,
    JSON.stringify(items)
  );

  const count = items.reduce(
    (total, item) =>
      total + Math.max(1, Number(item.qty) || 1),
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
        hasQuote: items.some(
          (item) => item.quoteOnly
        ),
      },
    })
  );
}

export default function ProductDetailsActions({
  product,
}: ProductDetailsActionsProps) {
  const [quantity, setQuantity] = useState(0);
  const [cartQuantity, setCartQuantity] = useState(0);

  const refreshFromCart = () => {
    const item = readCart().find(
      (cartItem) =>
        String(cartItem.id) === product.id
    );

    setCartQuantity(
      item
        ? Math.max(1, Number(item.qty) || 1)
        : 0
    );
  };

  useEffect(() => {
    refreshFromCart();

    const handleCartChange = () =>
      refreshFromCart();
    const handleStorage = () =>
      refreshFromCart();

    window.addEventListener(
      "deshsolar:cartchange",
      handleCartChange
    );
    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        "deshsolar:cartchange",
        handleCartChange
      );
      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, [product.id]);

  const updateCartQuantity = (
    nextQuantity: number
  ) => {
    const items = readCart();

    const existingIndex = items.findIndex(
      (item) =>
        String(item.id) === product.id
    );

    if (nextQuantity <= 0) {
      const nextItems =
        existingIndex >= 0
          ? items.filter(
              (_, index) =>
                index !== existingIndex
            )
          : items;

      writeCart(nextItems);
      setCartQuantity(0);
      setQuantity(0);
      return;
    }

    if (existingIndex >= 0) {
      items[existingIndex] = {
        ...items[existingIndex],
        qty: nextQuantity,
      };
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: product.price ?? 0,
        priceText:
          product.priceText ||
          "Contact for price",
        image: product.image,
        category: product.categoryLabel,
        quoteOnly: product.price === null,
        qty: nextQuantity,
      });
    }

    writeCart(items);
    setCartQuantity(nextQuantity);
  };

  const addToCart = () => {
    const items = readCart();

    const existing = items.find(
      (item) =>
        String(item.id) === product.id
    );

    const existingQuantity = existing
      ? Math.max(
          1,
          Number(existing.qty) || 1
        )
      : 0;

    updateCartQuantity(
      existingQuantity + quantity
    );

    setQuantity(0);
  };

  const decreaseCart = () => {
    updateCartQuantity(cartQuantity - 1);
  };

  const increaseCart = () => {
    updateCartQuantity(
      Math.min(99, cartQuantity + 1)
    );
  };

  const removeFromCart = () => {
    updateCartQuantity(0);
  };

  const inCart = cartQuantity > 0;

  return (
    <div className="pdPurchaseControls">
      <div
        className={`pdQuantityControl ${
          inCart ? "pdQuantityControlInCart" : ""
        }`}
      >
        <span>
          {inCart ? "IN CART" : "QUANTITY"}
        </span>

        <div>
          <button
            type="button"
            aria-label={
              inCart && cartQuantity === 1
                ? `Remove ${product.name} from cart`
                : "Decrease quantity"
            }
            onClick={
              inCart
                ? decreaseCart
                : () =>
                    setQuantity((current) =>
                      Math.max(
                        0,
                        current - 1
                      )
                    )
            }
          >
            −
          </button>

          <strong>
            {inCart
              ? cartQuantity
              : quantity}
          </strong>

          <button
            type="button"
            aria-label="Increase quantity"
            onClick={
              inCart
                ? increaseCart
                : () =>
                    setQuantity((current) =>
                      Math.min(
                        99,
                        current + 1
                      )
                    )
            }
          >
            +
          </button>
        </div>
      </div>

      {inCart ? (
        <button
          className="pdRemoveCart"
          type="button"
          onClick={removeFromCart}
        >
          Remove from Cart
          <span>
            {cartQuantity}{" "}
            {cartQuantity === 1
              ? "item"
              : "items"}
          </span>
        </button>
      ) : (
        <button
          className="pdAddCart"
          type="button"
          onClick={addToCart}
          disabled={quantity <= 0}
          aria-disabled={quantity <= 0}
        >
          {product.price === null
            ? "Add for Quote"
            : "Add to Cart"}
        </button>
      )}
    </div>
  );
}
