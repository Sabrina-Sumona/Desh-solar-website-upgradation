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
        >
          <path d="M6.62 10.79a15.46 15.46 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.49a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.19 2.2Z" />
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
        >
          <path d="M5.5 15.5 12 9l6.5 6.5" />
        </svg>

        <span className="floatingActionTooltip">
          Go to top
        </span>
      </button>
    </>
  );
}
