"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import CartQuickDrawer from "@/components/cart/CartQuickDrawer";

const PRODUCT_LINKS = [
  {
    label: "Solar Panels",
    href: "/products?category=solar-panel",
    icon: "☀",
  },
  {
    label: "Inverters",
    href: "/products?category=inverter",
    icon: "↯",
  },
  {
    label: "Batteries",
    href: "/products?category=battery",
    icon: "▣",
  },
  {
    label: "Complete Systems",
    href: "/products?category=complete-system",
    icon: "◎",
  },
];

const MAIN_NAV_LINKS = [
  {
    label: "Projects",
    href: "/projects",
  },
  {
    label: "Tools & Technology",
    href: "/tools-and-technology",
  },
  {
    label: "About Us",
    href: "/about",
  },
  {
    label: "Contact Us",
    href: "/contact",
  },
];

const FEATURE_LINKS = [
  {
    label: "Engineering Lab",
    href: "/engineering-lab",
    icon: "⌁",
    className: "navFeatureEngineering",
    mobileClassName: "mobileFeatureEngineering",
  },
  {
    label: "Customer Support",
    href: "/customer-support",
    icon: "◉",
    className: "navFeatureSupport",
    mobileClassName: "mobileFeatureSupport",
  },
  {
    label: "Build Your System",
    href: "/build-your-system",
    icon: "✦",
    className: "navFeatureBuilder",
    mobileClassName: "mobileFeatureBuilder",
  },
];

const CART_KEY = "deshSolarCartV1";

type HeaderCartItem = {
  id: string;
  name: string;
  qty: number;
};

function getStoredCartItems(): HeaderCartItem[] {
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
          typeof item.id !== "undefined"
      )
      .map((item) => ({
        id: String(item.id),
        name:
          typeof item.name === "string" &&
          item.name.trim()
            ? item.name
            : "Product",
        qty: Math.max(
          1,
          Number(item.qty) || 1
        ),
      }));
  } catch {
    return [];
  }
}

function getStoredCartCount() {
  return getStoredCartItems().reduce(
    (total, item) => total + item.qty,
    0
  );
}

function CartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="20" r="1.25" />
      <circle cx="18" cy="20" r="1.25" />
      <path d="M3 4h2.2l2.1 10.1a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 1.9-1.4L21 8H6.1" />
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartToast, setCartToast] = useState<{
    type: "added" | "removed";
    productName: string;
  } | null>(null);

  const previousCartItemsRef =
    useRef<HeaderCartItem[]>([]);
  const cartToastTimerRef =
    useRef<number | null>(null);

  useEffect(() => {
    const showCartToast = (
      type: "added" | "removed",
      productName: string
    ) => {
      setCartToast({
        type,
        productName,
      });

      if (cartToastTimerRef.current !== null) {
        window.clearTimeout(
          cartToastTimerRef.current
        );
      }

      cartToastTimerRef.current =
        window.setTimeout(() => {
          setCartToast(null);
          cartToastTimerRef.current = null;
        }, 2400);
    };

    const syncCart = (
      showToast = false
    ) => {
      const currentItems =
        getStoredCartItems();
      const previousItems =
        previousCartItemsRef.current;

      setCartCount(
        currentItems.reduce(
          (total, item) =>
            total + item.qty,
          0
        )
      );

      if (showToast) {
        const previousIds = new Set(
          previousItems.map(
            (item) => item.id
          )
        );
        const currentIds = new Set(
          currentItems.map(
            (item) => item.id
          )
        );

        const addedItem =
          currentItems.find(
            (item) =>
              !previousIds.has(item.id)
          );

        const removedItem =
          previousItems.find(
            (item) =>
              !currentIds.has(item.id)
          );

        if (addedItem) {
          showCartToast(
            "added",
            addedItem.name
          );
        } else if (removedItem) {
          showCartToast(
            "removed",
            removedItem.name
          );
        }
      }

      previousCartItemsRef.current =
        currentItems;
    };

    syncCart(false);

    const handleCartChange = () =>
      syncCart(true);
    const handleStorage = () =>
      syncCart(true);
    const handlePassiveSync = () =>
      syncCart(false);

    window.addEventListener(
      "deshsolar:cartchange",
      handleCartChange
    );
    window.addEventListener(
      "storage",
      handleStorage
    );
    window.addEventListener(
      "focus",
      handlePassiveSync
    );
    window.addEventListener(
      "pageshow",
      handlePassiveSync
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
      window.removeEventListener(
        "focus",
        handlePassiveSync
      );
      window.removeEventListener(
        "pageshow",
        handlePassiveSync
      );

      if (cartToastTimerRef.current !== null) {
        window.clearTimeout(
          cartToastTimerRef.current
        );
      }
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileOpen]);

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  const openCart = useCallback(() => {
    setMobileOpen(false);
    setCartOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setCartOpen(false);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  };

  return (
    <header className="siteHeader">
      <nav
        className="nav"
        aria-label="Primary navigation"
      >
        {/* =================================================
            BRAND
            ================================================= */}

        <Link
          href="/"
          className="brand"
          aria-label="Desh Solar Home"
          onClick={closeMobileMenu}
        >
          <Image
            src="/assets/desh-solar-logo.png"
            alt="Desh Solar"
            width={220}
            height={54}
            priority
            className="brandLogoImage"
          />
        </Link>

        {/* =================================================
            DESKTOP NAVIGATION
            ================================================= */}

        <div className="navLinks">
          {/* PRODUCTS */}

          <div className="navMegaWrap">
            <Link
              href="/products"
              aria-current={
                isActive("/products")
                  ? "page"
                  : undefined
              }
              className={`navItem navInteractiveItem ${
                isActive("/products")
                  ? "navItemActive"
                  : ""
              }`}
            >
              <span className="navItemGlow" />

              <span className="navItemText">
                Products
              </span>
            </Link>

            <div className="navMegaPanel">
              <div className="megaAmbientGlow" />

              <div className="megaGrid">
                <div className="megaGroup">
                  <div className="megaLabel">
                    Solar Products
                  </div>

                  <div className="megaLinks">
                    {PRODUCT_LINKS.map((item) => (
                      <Link
                        href={item.href}
                        key={item.label}
                      >
                        <i>
                          {item.icon}
                        </i>

                        <span>
                          {item.label}
                        </span>

                        <b>→</b>
                      </Link>
                    ))}
                  </div>

                  <Link
                    href="/build-your-system"
                    className="megaBuildLink"
                  >
                    <span>
                      Build Your System
                    </span>

                    <b>→</b>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* STANDARD NAVIGATION */}

          {MAIN_NAV_LINKS.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={
                  active
                    ? "page"
                    : undefined
                }
                className={`navItem navInteractiveItem ${
                  active
                    ? "navItemActive"
                    : ""
                }`}
              >
                <span className="navItemGlow" />

                <span className="navItemText">
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* =================================================
              UPGRADED FEATURES
              ================================================= */}

          <div
            className="navFeatureBlock"
            aria-label="Desh Solar upgraded features"
          >
            <span
              className="navFeatureAmbient"
              aria-hidden="true"
            />

            <span
              className="navFeatureSweep"
              aria-hidden="true"
            />

            {FEATURE_LINKS.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  href={item.href}
                  key={item.href}
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                  className={`navFeatureItem ${
                    item.className
                  } ${
                    active
                      ? "navFeatureActive"
                      : ""
                  }`}
                >
                  <span
                    className="navFeatureIcon"
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>

                  <span className="navFeatureText">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* =================================================
              CART
              ================================================= */}

          <button
            type="button"
            aria-current={
              isActive("/cart")
                ? "page"
                : undefined
            }
            aria-expanded={cartOpen}
            aria-controls="cartQuickDrawer"
            className={`navCart ${
              isActive("/cart")
                ? "navCartActive"
                : ""
            }`}
            aria-label={`Open shopping cart. ${cartCount} ${
              cartCount === 1 ? "item" : "items"
            } in cart`}
            onClick={openCart}
          >
            <span
              className="navCartGlow"
              aria-hidden="true"
            />

            <span className="navCartIcon">
              <CartIcon />
            </span>

            <span className="navCartLabel">
              Cart
            </span>

            <span
              className="cartCount"
              aria-hidden="true"
            >
              {cartCount}
            </span>
          </button>
        </div>

        {/* =================================================
            MOBILE MENU TOGGLE
            ================================================= */}

        <button
          type="button"
          className={`navToggle ${
            mobileOpen
              ? "active"
              : ""
          }`}
          aria-label={
            mobileOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={mobileOpen}
          aria-controls="mobileMenu"
          onClick={() =>
            setMobileOpen(
              (open) => !open
            )
          }
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {/* ===================================================
          MOBILE MENU
          =================================================== */}

      <div
        id="mobileMenu"
        className={`mobileMenu ${
          mobileOpen
            ? "open"
            : ""
        }`}
      >
        <span
          className="mobileMenuAmbient mobileMenuAmbientOne"
          aria-hidden="true"
        />

        <span
          className="mobileMenuAmbient mobileMenuAmbientTwo"
          aria-hidden="true"
        />

        <div className="mobileMenuInner">
          {/* ===============================================
              STANDARD MOBILE MENU
              =============================================== */}

          <div className="mobilePrimaryLinks">
            <Link
              href="/products"
              onClick={closeMobileMenu}
              aria-current={
                isActive("/products")
                  ? "page"
                  : undefined
              }
              className={`mobilePrimaryLink ${
                isActive("/products")
                  ? "mobilePrimaryActive"
                  : ""
              }`}
            >
              <span className="mobilePrimaryGlow" />

              <span className="mobilePrimaryText">
                Products
              </span>

              <b>→</b>
            </Link>

            {MAIN_NAV_LINKS.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                  className={`mobilePrimaryLink ${
                    active
                      ? "mobilePrimaryActive"
                      : ""
                  }`}
                >
                  <span className="mobilePrimaryGlow" />

                  <span className="mobilePrimaryText">
                    {item.label}
                  </span>

                  <b>→</b>
                </Link>
              );
            })}
          </div>

          {/* ===============================================
              UPGRADED FEATURES
              =============================================== */}

          <div className="mobileFeatureGroup">
            <span
              className="mobileFeatureAmbient"
              aria-hidden="true"
            />

            <span
              className="mobileFeatureSweep"
              aria-hidden="true"
            />

            <div className="mobileFeatureLabel">
              Upgraded Solar Features
            </div>

            {FEATURE_LINKS.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`mobileFeatureLink ${
                    item.mobileClassName
                  } ${
                    active
                      ? "mobileFeatureActive"
                      : ""
                  }`}
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                  onClick={closeMobileMenu}
                >
                  <span className="mobileFeatureLinkGlow" />

                  <span>
                    <i>
                      {item.icon}
                    </i>

                    <span className="mobileFeatureText">
                      {item.label}
                    </span>
                  </span>

                  <b>→</b>
                </Link>
              );
            })}
          </div>

          {/* ===============================================
              MOBILE CART
              =============================================== */}

          <button
            type="button"
            onClick={openCart}
            aria-current={
              isActive("/cart")
                ? "page"
                : undefined
            }
            aria-expanded={cartOpen}
            aria-controls="cartQuickDrawer"
            className={`mobileCart ${
              isActive("/cart")
                ? "mobileCartActive"
                : ""
            }`}
            aria-label={`Open shopping cart. ${cartCount} ${
              cartCount === 1 ? "item" : "items"
            } in cart`}
          >
            <span className="mobileCartGlow" />

            <span className="mobileCartLabel">
              <span className="mobileCartIcon">
                <CartIcon />
              </span>

              Cart
            </span>

            <span
              className="mobileCartCount"
              aria-hidden="true"
            >
              {cartCount}
            </span>
          </button>
        </div>
      </div>

      {cartToast && (
        <div
          className={`headerCartToast ${
            cartToast.type === "added"
              ? "headerCartToastAdded"
              : "headerCartToastRemoved"
          }`}
          role="status"
          aria-live="polite"
        >
          <span
            className="headerCartToastPointer"
            aria-hidden="true"
          />

          <small>CART</small>

          <strong>
            {cartToast.type === "added"
              ? "Added to Cart"
              : "Removed from Cart"}
          </strong>

          <span className="headerCartToastProduct">
            {cartToast.productName}
          </span>
        </div>
      )}

      <CartQuickDrawer
        open={cartOpen}
        onClose={closeCart}
      />
    </header>
  );
}