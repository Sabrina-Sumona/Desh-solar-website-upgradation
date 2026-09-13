"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { products } from "@/data/products";

import styles from "./CartPageClient.module.css";

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

function money(value: number) {
  return `৳ ${Math.round(value).toLocaleString("en-US")}`;
}

function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = JSON.parse(
      window.localStorage.getItem(CART_KEY) || "[]"
    );

    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function normalizeCartItem(item: Partial<CartItem>): CartItem {
  const source = products.find(
    (product) => product.id === String(item.id ?? "")
  );

  return {
    id: String(item.id ?? source?.id ?? ""),
    name: String(item.name ?? source?.name ?? "Product"),
    price: Number(item.price ?? source?.price ?? 0) || 0,
    priceText: String(
      item.priceText ??
        source?.priceText ??
        "Contact for price"
    ),
    image: String(item.image ?? source?.image ?? ""),
    category: String(
      item.category ?? source?.categoryLabel ?? "Product"
    ),
    quoteOnly: Boolean(
      item.quoteOnly ?? source?.price === null
    ),
    qty: Math.max(1, Math.floor(Number(item.qty) || 1)),
  };
}

function dispatchCartChange(items: CartItem[]) {
  const count = items.reduce(
    (total, item) => total + item.qty,
    0
  );

  const subtotal = items.reduce(
    (total, item) =>
      total +
      (item.quoteOnly ? 0 : item.price * item.qty),
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

export default function CartPageClient() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const loadCart = () => {
    const normalized = readStoredCart()
      .map(normalizeCartItem)
      .filter((item) => item.id);

    setItems(normalized);
  };

  useEffect(() => {
    loadCart();
    setHydrated(true);

    const handleStorage = () => loadCart();
    const handleCartChange = () => loadCart();

    window.addEventListener("storage", handleStorage);
    window.addEventListener(
      "deshsolar:cartchange",
      handleCartChange
    );

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(
        "deshsolar:cartchange",
        handleCartChange
      );
    };
  }, []);

  const saveItems = (nextItems: CartItem[]) => {
    const normalized = nextItems
      .map(normalizeCartItem)
      .filter((item) => item.id);

    window.localStorage.setItem(
      CART_KEY,
      JSON.stringify(normalized)
    );

    setItems(normalized);
    dispatchCartChange(normalized);
  };

  const setQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      saveItems(items.filter((item) => item.id !== id));
      return;
    }

    saveItems(
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              qty: Math.max(1, Math.floor(quantity)),
            }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    saveItems(items.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    saveItems([]);
  };

  const itemCount = useMemo(
    () =>
      items.reduce(
        (total, item) => total + item.qty,
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
            : item.price * item.qty),
        0
      ),
    [items]
  );

  const hasQuoteItems = useMemo(
    () => items.some((item) => item.quoteOnly),
    [items]
  );

  const estimatedTotalLabel =
    hasQuoteItems && subtotal === 0
      ? "Quotation required"
      : money(subtotal);

  if (!hydrated) {
    return (
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.shell}>
            <span className={styles.eyebrow}>
              SHOPPING CART
            </span>
            <h1>Your solar cart.</h1>
            <p>Loading your selected products…</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.shell}>
          <span className={styles.eyebrow}>
            SHOPPING CART
          </span>

          <h1>Your solar cart.</h1>

          <p>
            Review your selected products, adjust quantities and
            continue when you are ready. Items that require a
            quotation will be finalized after technical and
            commercial review.
          </p>
        </div>
      </section>

      <section className={styles.cartSection}>
        <div className={`${styles.shell} ${styles.layout}`}>
          <section className={styles.cartCard}>
            <header className={styles.cardHeader}>
              <div>
                <small>CART ITEMS</small>
                <h2>
                  {itemCount}{" "}
                  {itemCount === 1 ? "item" : "items"}
                </h2>
              </div>

              <div className={styles.headerActions}>
                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={clearCart}
                    className={styles.clearButton}
                  >
                    Clear Cart
                  </button>
                )}

                <Link href="/products">
                  Continue Shopping →
                </Link>
              </div>
            </header>

            {items.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <span>☀</span>
                </div>

                <h3>Your cart is empty.</h3>

                <p>
                  Browse the Desh Solar catalogue and add the
                  products or complete systems you want to review.
                </p>

                <Link href="/products">
                  Browse Products →
                </Link>
              </div>
            ) : (
              <div className={styles.itemList}>
                {items.map((item) => (
                  <article
                    className={styles.cartItem}
                    key={item.id}
                  >
                    <Link
                      className={styles.imageWrap}
                      href={`/products/${item.id}`}
                    >
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={180}
                          height={140}
                          sizes="(max-width: 700px) 92px, 120px"
                        />
                      ) : (
                        <span>No image</span>
                      )}
                    </Link>

                    <div className={styles.itemInfo}>
                      <div className={styles.itemTopline}>
                        <span>{item.category}</span>

                        {item.quoteOnly && (
                          <b>Quote Required</b>
                        )}
                      </div>

                      <h3>
                        <Link
                          href={`/products/${item.id}`}
                        >
                          {item.name}
                        </Link>
                      </h3>

                      <div className={styles.itemMetaRow}>
                        <div>
                          <small>UNIT PRICE</small>
                          <strong
                            className={
                              item.quoteOnly
                                ? styles.quotePrice
                                : undefined
                            }
                          >
                            {item.quoteOnly
                              ? "Contact for price"
                              : item.priceText}
                          </strong>
                        </div>

                        <div>
                          <small>QUANTITY</small>

                          <div className={styles.quantity}>
                            <button
                              type="button"
                              aria-label={`Decrease quantity of ${item.name}`}
                              onClick={() =>
                                setQuantity(
                                  item.id,
                                  item.qty - 1
                                )
                              }
                            >
                              −
                            </button>

                            <span>{item.qty}</span>

                            <button
                              type="button"
                              aria-label={`Increase quantity of ${item.name}`}
                              onClick={() =>
                                setQuantity(
                                  item.id,
                                  item.qty + 1
                                )
                              }
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className={styles.lineTotal}>
                          <small>ITEM TOTAL</small>
                          <strong>
                            {item.quoteOnly
                              ? "Quote"
                              : money(
                                  item.price * item.qty
                                )}
                          </strong>
                        </div>
                      </div>

                      <div className={styles.itemBottom}>
                        <Link
                          href={`/products/${item.id}`}
                        >
                          View Product Details
                        </Link>

                        <button
                          type="button"
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
          </section>

          <aside className={styles.summary}>
            <small>ORDER SUMMARY</small>
            <h2>Cart total</h2>

            <div className={styles.summaryRow}>
              <span>Products</span>
              <strong>{itemCount}</strong>
            </div>

            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <strong>{estimatedTotalLabel}</strong>
            </div>

            {hasQuoteItems && (
              <div className={styles.quoteBanner}>
                One or more items require a quotation.
                Their final price is not included in the
                current subtotal.
              </div>
            )}

            <p className={styles.summaryNote}>
              Shipping, installation, applicable taxes and
              final technical compatibility will be confirmed
              before the order is finalized.
            </p>

            {items.length > 0 ? (
              <Link
                className={styles.checkoutButton}
                href="/checkout"
              >
                Continue to Checkout →
              </Link>
            ) : (
              <span
                className={`${styles.checkoutButton} ${styles.checkoutDisabled}`}
              >
                Continue to Checkout →
              </span>
            )}

            <Link
              className={styles.consultLink}
              href="/contact-us"
            >
              Need help with your system? Contact Desh Solar
            </Link>
          </aside>
        </div>
      </section>

      <section className={styles.supportBand}>
        <div className={styles.shell}>
          <div>
            <small>NOT SURE ABOUT COMPATIBILITY?</small>
            <h2>
              We can review your cart before you order.
            </h2>
          </div>

          <p>
            Solar products work as part of a complete system.
            Desh Solar can review your selected products against
            your load, backup target and installation conditions.
          </p>

          <Link href="/build-your-system">
            Build Your System →
          </Link>
        </div>
      </section>
    </main>
  );
}
