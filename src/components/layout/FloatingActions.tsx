"use client";

import { useEffect, useState } from "react";

export default function FloatingActions() {
  const [showBackToTop, setShowBackToTop] =
    useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      setShowBackToTop(
        window.scrollY > 520
      );
    };

    updateVisibility();

    window.addEventListener(
      "scroll",
      updateVisibility,
      {
        passive: true,
      }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        updateVisibility
      );
    };
  }, []);

  const goToTop = () => {
    const reduceMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

    window.scrollTo({
      top: 0,
      behavior:
        reduceMotion
          ? "auto"
          : "smooth",
    });
  };

  return (
    <>
      {/* PHONE — BOTTOM LEFT */}

      <a
        href="tel:01754477488"
        className="floatingAction floatingPhone"
        aria-label="Call Desh Solar at 01754-477488"
        title="Call Desh Solar"
      >
        <span
          className="floatingPhonePulse"
          aria-hidden="true"
        />

        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="floatingPhoneIcon"
        >
          <path d="M5.15 5.75c.38-1.14 1.44-1.9 2.64-1.9h8.42c1.2 0 2.26.76 2.64 1.9l.42 1.26a1.65 1.65 0 0 1-1.57 2.17h-2.03a1.65 1.65 0 0 1-1.59-1.2l-.18-.62H10.1l-.18.62a1.65 1.65 0 0 1-1.59 1.2H6.3a1.65 1.65 0 0 1-1.57-2.17l.42-1.26Z" />
          <path d="M7.35 10.65h9.3c1.22 0 2.2.99 2.2 2.2v4.05c0 1.22-.98 2.2-2.2 2.2h-9.3a2.2 2.2 0 0 1-2.2-2.2v-4.05c0-1.21.98-2.2 2.2-2.2Z" />
          <circle
            cx="12"
            cy="14.88"
            r="2.05"
            className="floatingPhoneDial"
          />
        </svg>

        <span className="floatingActionTooltip">
          01754-477488
        </span>
      </a>

      {/* BACK TO TOP — BOTTOM RIGHT */}

      <button
        type="button"
        className={`floatingAction floatingBackToTop ${
          showBackToTop
            ? "isVisible"
            : ""
        }`}
        aria-label="Go to top"
        title="Go to top"
        onClick={goToTop}
        tabIndex={
          showBackToTop
            ? 0
            : -1
        }
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="floatingTopIcon"
        >
          <path d="M12 18V6" />
          <path d="m6.9 11.1 5.1-5.1 5.1 5.1" />
        </svg>

        <span className="floatingActionTooltip">
          Go to top
        </span>
      </button>
    </>
  );
}
