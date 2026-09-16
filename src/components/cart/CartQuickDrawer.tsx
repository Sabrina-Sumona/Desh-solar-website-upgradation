"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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

type CartQuickDrawerProps = {
  open: boolean;
  onClose: () => void;
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

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(
        (item) =>
          item &&
          typeof item.id !== "undefined" &&
          typeof item.name === "string"
      )
      .map((item) => ({
        id: String(item.id),
        name: String(item.name),
        price: Number(item.price) || 0,
        priceText:
          typeof item.priceText === "string" &&
          item.priceText.trim()
            ? item.priceText
            : "Contact for price",
        image:
          typeof item.image === "string"
            ? item.image
            : "",
        category:
          typeof item.category === "string"
            ? item.category
            : "Product",
        quoteOnly: Boolean(item.quoteOnly),
        qty: Math.min(
          99,
          Math.max(1, Number(item.qty) || 1)
        ),
      }));
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

function formatMoney(value: number) {
  return `৳ ${new Intl.NumberFormat("en-BD", {
    maximumFractionDigits: 0,
  }).format(value)}`;
}

export default function CartQuickDrawer({
  open,
  onClose,
}: CartQuickDrawerProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const closeButtonRef =
    useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const syncCart = () => {
      setItems(readCart());
    };

    const initialFrame =
      window.requestAnimationFrame(syncCart);

    window.addEventListener(
      "deshsolar:cartchange",
      syncCart
    );
    window.addEventListener("storage", syncCart);
    window.addEventListener("focus", syncCart);

    return () => {
      window.cancelAnimationFrame(initialFrame);
      window.removeEventListener(
        "deshsolar:cartchange",
        syncCart
      );
      window.removeEventListener(
        "storage",
        syncCart
      );
      window.removeEventListener(
        "focus",
        syncCart
      );
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const syncFrame = window.requestAnimationFrame(() => {
      setItems(readCart());
    });

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    const focusTimer = window.setTimeout(
      () => {
        closeButtonRef.current?.focus();
      },
      0
    );

    return () => {
      window.cancelAnimationFrame(syncFrame);
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

      window.clearTimeout(focusTimer);
    };
  }, [open, onClose]);

  const count = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total +
          Math.max(
            1,
            Number(item.qty) || 1
          ),
        0
      ),
    [items]
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total +
          (item.quoteOnly
            ? 0
            : item.price *
              Math.max(
                1,
                Number(item.qty) || 1
              )),
        0
      ),
    [items]
  );

  const hasQuoteItems = items.some(
    (item) => item.quoteOnly
  );

  const pricedItemCount = items.filter(
    (item) => !item.quoteOnly
  ).length;

  const updateQuantity = (
    id: string,
    nextQuantity: number
  ) => {
    if (nextQuantity <= 0) {
      const next = readCart().filter(
        (item) => String(item.id) !== id
      );

      writeCart(next);
      setItems(next);
      return;
    }

    const next = readCart().map((item) =>
      String(item.id) === id
        ? {
            ...item,
            qty: Math.min(
              99,
              nextQuantity
            ),
          }
        : item
    );

    writeCart(next);
    setItems(next);
  };

  const removeItem = (id: string) => {
    const next = readCart().filter(
      (item) => String(item.id) !== id
    );

    writeCart(next);
    setItems(next);
  };

  if (!open) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className="cartQuickBackdrop"
        aria-label="Close cart preview"
        onClick={onClose}
      />

      <aside
        id="cartQuickDrawer"
        className="cartQuickDrawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cartQuickTitle"
      >
        <div className="cartQuickHead">
          <div>
            <small>SHOPPING CART</small>
            <h2 id="cartQuickTitle">
              Your Cart
            </h2>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            className="cartQuickClose"
            onClick={onClose}
            aria-label="Close cart preview"
          >
            ×
          </button>
        </div>

        <div className="cartQuickSummary">
          <span>
            {count}{" "}
            {count === 1 ? "item" : "items"}
          </span>

          {items.length > 0 && (
            <b>
              {hasQuoteItems &&
              pricedItemCount === 0
                ? "Quote required"
                : formatMoney(subtotal)}
            </b>
          )}
        </div>

        <div className="cartQuickContent">
          {items.length === 0 ? (
            <div className="cartQuickEmpty">
              <span aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="20" r="1.25" />
                  <circle cx="18" cy="20" r="1.25" />
                  <path d="M3 4h2.2l2.1 10.1a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 1.9-1.4L21 8H6.1" />
                </svg>
              </span>

              <small>YOUR CART IS EMPTY</small>
              <h3>
                Start with the products you need.
              </h3>
              <p>
                Add products to your cart and they
                will appear here instantly.
              </p>

              <Link
                href="/products"
                onClick={onClose}
              >
                Browse Products →
              </Link>
            </div>
          ) : (
            <div className="cartQuickItems">
              {items.map((item) => (
                <article
                  className="cartQuickItem"
                  key={item.id}
                >
                  <Link
                    className="cartQuickItemImage"
                    href={`/products/${item.id}`}
                    onClick={onClose}
                    aria-label={`View ${item.name}`}
                  >
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={180}
                        height={140}
                        sizes="88px"
                      />
                    ) : (
                      <span>NO IMAGE</span>
                    )}
                  </Link>

                  <div className="cartQuickItemBody">
                    <small>{item.category}</small>

                    <h3>
                      <Link
                        href={`/products/${item.id}`}
                        onClick={onClose}
                      >
                        {item.name}
                      </Link>
                    </h3>

                    <div className="cartQuickPriceRow">
                      <strong>
                        {item.quoteOnly
                          ? "Request quote"
                          : item.priceText}
                      </strong>

                      {!item.quoteOnly &&
                        item.qty > 1 && (
                          <span>
                            {formatMoney(
                              item.price *
                                item.qty
                            )}
                          </span>
                        )}
                    </div>

                    <div className="cartQuickControls">
                      <div className="cartQuickQty">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.qty - 1
                            )
                          }
                          aria-label={
                            item.qty === 1
                              ? `Remove ${item.name} from cart`
                              : `Decrease quantity of ${item.name}`
                          }
                        >
                          −
                        </button>

                        <strong>
                          {item.qty}
                        </strong>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.qty + 1
                            )
                          }
                          disabled={item.qty >= 99}
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        className="cartQuickRemove"
                        onClick={() =>
                          removeItem(item.id)
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="cartQuickFooter">
            <div className="cartQuickTotals">
              <span>
                {hasQuoteItems
                  ? "Priced subtotal"
                  : "Subtotal"}
              </span>

              <strong>
                {hasQuoteItems &&
                pricedItemCount === 0
                  ? "Quote required"
                  : formatMoney(subtotal)}
              </strong>
            </div>

            {hasQuoteItems &&
              pricedItemCount > 0 && (
                <p>
                  Quote-only products are not
                  included in the priced subtotal.
                </p>
              )}

            <Link
              className="cartQuickViewCart"
              href="/cart"
              onClick={onClose}
            >
              View Cart
              <span>→</span>
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
