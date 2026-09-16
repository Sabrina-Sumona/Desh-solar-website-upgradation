"use client";

import { useCallback, useEffect, useState } from "react";
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
  const [cartQuantity, setCartQuantity] =
    useState(0);

  const refreshFromCart = useCallback(() => {
    const item = readCart().find(
      (cartItem) =>
        String(cartItem.id) === product.id
    );

    setCartQuantity(
      item
        ? Math.max(1, Number(item.qty) || 1)
        : 0
    );
  }, [product.id]);

  useEffect(() => {
    const initialFrame =
      window.requestAnimationFrame(refreshFromCart);

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
      window.cancelAnimationFrame(initialFrame);
      window.removeEventListener(
        "deshsolar:cartchange",
        handleCartChange
      );
      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, [refreshFromCart]);

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
        category:
          product.categoryLabel ||
          "Product",
        quoteOnly: product.price === null,
        qty: nextQuantity,
      });
    }

    writeCart(items);
    setCartQuantity(nextQuantity);
  };

  const addToCart = () => {
    const existing = readCart().find(
      (item) =>
        String(item.id) === product.id
    );

    const currentQuantity = existing
      ? Math.max(
          1,
          Number(existing.qty) || 1
        )
      : 0;

    updateCartQuantity(
      Math.min(99, currentQuantity + 1)
    );
  };

  const decrementCart = () => {
    updateCartQuantity(cartQuantity - 1);
  };

  const incrementCart = () => {
    updateCartQuantity(
      Math.min(99, cartQuantity + 1)
    );
  };

  const removeFromCart = () => {
    updateCartQuantity(0);
  };

  return (
    <div className="pdPurchaseControls">
      {cartQuantity > 0 ? (
        <div className="pdDetailCartAddedControls">
          <div className="pdDetailCartQuantityRow">
            <button
              type="button"
              className="pdDetailCartQtyButton"
              onClick={decrementCart}
              aria-label={
                cartQuantity === 1
                  ? `Remove ${product.name} from cart`
                  : `Decrease quantity of ${product.name}`
              }
            >
              −
            </button>

            <div className="pdDetailCartQtyStatus">
              <strong>{cartQuantity}</strong>
              <span>
                {product.price === null
                  ? "selected for quote"
                  : "in cart"}
              </span>
            </div>

            <button
              type="button"
              className="pdDetailCartQtyButton"
              onClick={incrementCart}
              disabled={cartQuantity >= 99}
              aria-label={`Increase quantity of ${product.name}`}
            >
              +
            </button>
          </div>

          <button
            type="button"
            className="pdRemoveCart"
            onClick={removeFromCart}
          >
            Remove from Cart
          </button>
        </div>
      ) : (
        <button
          className="pdAddCart"
          type="button"
          onClick={addToCart}
          aria-label={`Add ${product.name} to cart`}
        >
          {product.price === null
            ? "Add for Quote +"
            : "Add to Cart +"}
        </button>
      )}
    </div>
  );
}
