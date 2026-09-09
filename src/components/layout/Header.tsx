"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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
  },
  {
    label: "Customer Support",
    href: "/customer-support",
    icon: "◉",
    className: "navFeatureSupport",
  },
  {
    label: "Build Your System",
    href: "/build-your-system",
    icon: "✦",
    className: "navFeatureBuilder",
  },
];

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

  const [mobileOpen, setMobileOpen] =
    useState(false);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        originalOverflow;
    };
  }, [mobileOpen]);

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  const isActive = (
    href: string
  ) => {
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
                    {PRODUCT_LINKS.map(
                      (item) => (
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
                      )
                    )}
                  </div>
                </div>

                <div className="megaFeature">
                  <small>
                    Complete Solar Planning
                  </small>

                  <h4>
                    Build a system around
                    your energy needs.
                  </h4>

                  <p>
                    Start with your property,
                    energy goal and backup
                    requirement.
                  </p>

                  <Link href="/build-your-system">
                    Build Your System

                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* STANDARD NAVIGATION */}

          {MAIN_NAV_LINKS.map(
            (item) => {
              const active =
                isActive(item.href);

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
            }
          )}

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

            {FEATURE_LINKS.map(
              (item) => {
                const active =
                  isActive(item.href);

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
              }
            )}
          </div>

          {/* =================================================
              CART
              ================================================= */}

          <Link
            href="/cart"
            aria-current={
              isActive("/cart")
                ? "page"
                : undefined
            }
            className={`navCart ${
              isActive("/cart")
                ? "navCartActive"
                : ""
            }`}
            aria-label="Shopping cart"
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
              aria-label="0 items in cart"
            >
              0
            </span>
          </Link>
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
        <div className="mobileMenuInner">
          {/* NORMAL MENU */}

          <div className="mobilePrimaryLinks">
            <Link
              href="/products"
              onClick={closeMobileMenu}
            >
              <span>
                Products
              </span>

              <b>→</b>
            </Link>

            {MAIN_NAV_LINKS.map(
              (item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                >
                  <span>
                    {item.label}
                  </span>

                  <b>→</b>
                </Link>
              )
            )}
          </div>

          {/* UPGRADED FEATURES */}

          <div className="mobileFeatureGroup">
            <span
              className="mobileFeatureAmbient"
              aria-hidden="true"
            />

            <div className="mobileFeatureLabel">
              Upgraded Solar Features
            </div>

            {FEATURE_LINKS.map(
              (item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="mobileFeatureLink"
                  onClick={closeMobileMenu}
                >
                  <span>
                    <i>
                      {item.icon}
                    </i>

                    {item.label}
                  </span>

                  <b>→</b>
                </Link>
              )
            )}
          </div>

          {/* CART */}

          <Link
            href="/cart"
            onClick={closeMobileMenu}
            className="mobileCart"
          >
            <span className="mobileCartLabel">
              <span className="mobileCartIcon">
                <CartIcon />
              </span>

              Cart
            </span>

            <span className="mobileCartCount">
              0
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}