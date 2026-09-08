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
];

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
        {/* ===============================================
            LOGO
            =============================================== */}

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

        {/* ===============================================
            DESKTOP NAVIGATION
            =============================================== */}

        <div className="navLinks">
          {/* PRODUCTS MEGA MENU */}

          <div className="navMegaWrap">
            <Link
              href="/products"
              className={`navItem ${
                isActive("/products")
                  ? "navItemActive"
                  : ""
              }`}
            >
              Products
            </Link>

            <div className="navMegaPanel">
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
                    Build Your System →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* NORMAL NAV */}

          {MAIN_NAV_LINKS.map(
            (item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`navItem ${
                  isActive(item.href)
                    ? "navItemActive"
                    : ""
                }`}
              >
                {item.label}
              </Link>
            )
          )}

          {/* =============================================
              UPGRADED FEATURE BLOCK
              ============================================= */}

          <div
            className="navFeatureBlock"
            aria-label="Desh Solar upgraded features"
          >
            <span className="navFeatureGlow" />

            {FEATURE_LINKS.map(
              (item) => (
                <Link
                  href={item.href}
                  key={item.href}
                  className={`navFeatureItem ${
                    item.className
                  } ${
                    isActive(item.href)
                      ? "navFeatureActive"
                      : ""
                  }`}
                >
                  <span className="navFeatureIcon">
                    {item.icon}
                  </span>

                  <span>
                    {item.label}
                  </span>
                </Link>
              )
            )}

            <Link
              href="/build-your-system"
              className={`navFeatureBuild ${
                isActive(
                  "/build-your-system"
                )
                  ? "navFeatureActive"
                  : ""
              }`}
            >
              Build Your System

              <span>
                →
              </span>
            </Link>
          </div>

          {/* CART */}

          <Link
            href="/cart"
            className={`navCart ${
              isActive("/cart")
                ? "navCartActive"
                : ""
            }`}
            aria-label="Shopping cart"
          >
            <span className="navCartIcon">
              ◇
            </span>

            <span className="cartCount">
              0
            </span>
          </Link>
        </div>

        {/* ===============================================
            MOBILE BUTTON
            =============================================== */}

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

      {/* =================================================
          MOBILE MENU
          ================================================= */}

      <div
        id="mobileMenu"
        className={`mobileMenu ${
          mobileOpen
            ? "open"
            : ""
        }`}
      >
        <Link
          href="/products"
          onClick={closeMobileMenu}
        >
          Products
          <span>→</span>
        </Link>

        {MAIN_NAV_LINKS.map(
          (item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMobileMenu}
            >
              {item.label}
              <span>→</span>
            </Link>
          )
        )}

        {/* MOBILE FEATURE GROUP */}

        <div className="mobileFeatureGroup">
          <div className="mobileFeatureLabel">
            Upgraded Solar Tools
          </div>

          <Link
            href="/engineering-lab"
            className="mobileFeatureLink"
            onClick={closeMobileMenu}
          >
            <span>
              <i>⌁</i>
              Engineering Lab
            </span>

            <b>→</b>
          </Link>

          <Link
            href="/customer-support"
            className="mobileFeatureLink"
            onClick={closeMobileMenu}
          >
            <span>
              <i>◉</i>
              Customer Support
            </span>

            <b>→</b>
          </Link>

          <Link
            href="/build-your-system"
            className="mobileFeatureBuild"
            onClick={closeMobileMenu}
          >
            <span>
              Build Your System
            </span>

            <b>→</b>
          </Link>
        </div>

        <Link
          href="/cart"
          onClick={closeMobileMenu}
          className="mobileCart"
        >
          Cart
          <span>◇</span>
        </Link>
      </div>
    </header>
  );
}