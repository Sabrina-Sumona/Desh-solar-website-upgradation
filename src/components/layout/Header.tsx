"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  {
    label: "Products",
    href: "/products",
  },
  {
    label: "Projects",
    href: "/projects",
  },
  {
    label: "Tools and Technology",
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
  {
    label: "Customer Support",
    href: "/customer-support",
  },
];

export default function Header() {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  /*
   * Temporary cart count.
   *
   * Later this will come from the global
   * Zustand cart store.
   */
  const cartCount = 0;

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileOpen((current) => !current);
  };

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  /*
   * Close mobile navigation when switching
   * back to desktop size.
   *
   * setState happens inside the resize event
   * callback, not synchronously inside the
   * effect body.
   */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1050) {
        setMobileOpen(false);
      }
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, []);

  /*
   * Prevent the document behind the mobile
   * navigation from scrolling.
   */
  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [mobileOpen]);

  /*
   * Allow Escape to close the mobile menu.
   */
  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="nav">
        {/* ================================================
            BRAND
            ================================================ */}

        <Link
          href="/"
          className="brand"
          aria-label="Desh Solar Home"
          onClick={closeMobileMenu}
        >
          <Image
            src="/assets/desh-solar-logo.png"
            alt="Desh Solar"
            width={320}
            height={92}
            priority
            className="brandLogoImage"
          />
        </Link>

        {/* ================================================
            DESKTOP NAVIGATION
            ================================================ */}

        <nav
          className="navLinks"
          aria-label="Primary navigation"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`navItem ${
                isActive(item.href)
                  ? "active"
                  : ""
              }`}
            >
              {item.label}
            </Link>
          ))}

          <Link
            href="/build-your-system"
            className={`navCta ${
              isActive(
                "/build-your-system"
              )
                ? "active"
                : ""
            }`}
          >
            Build Your System
          </Link>

          <Link
            href="/cart"
            className={`navCart ${
              isActive("/cart")
                ? "active"
                : ""
            }`}
            aria-label={`Cart with ${cartCount} items`}
          >
            <span
              className="navCartIcon"
              aria-hidden="true"
            >
              🛒
            </span>

            <span className="navCartText">
              Cart
            </span>

            <span className="navCartCount">
              {cartCount}
            </span>
          </Link>
        </nav>

        {/* ================================================
            MOBILE TOGGLE
            ================================================ */}

        <button
          type="button"
          className={`navToggle ${
            mobileOpen ? "active" : ""
          }`}
          aria-label={
            mobileOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={mobileOpen}
          aria-controls="mobileMenu"
          onClick={toggleMobileMenu}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {/* ================================================
          MOBILE NAVIGATION
          ================================================ */}

      <nav
        id="mobileMenu"
        className={`mobileMenu ${
          mobileOpen ? "open" : ""
        }`}
        aria-label="Mobile navigation"
      >
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={
              isActive(item.href)
                ? "active"
                : undefined
            }
            onClick={closeMobileMenu}
          >
            {item.label}
          </Link>
        ))}

        <Link
          href="/build-your-system"
          className="mobileCta"
          onClick={closeMobileMenu}
        >
          Build Your System
        </Link>

        <Link
          href="/cart"
          className="mobileCart"
          onClick={closeMobileMenu}
        >
          <span>
            Cart
          </span>

          <span className="mobileCartCount">
            {cartCount}
          </span>
        </Link>
      </nav>
    </>
  );
}