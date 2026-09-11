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
          {/* Option 11 — Minimal Handset */}
          <path
            d="M7.35 3.9 9.5 3.1a1.65 1.65 0 0 1 2.02.78l1.35 2.5a1.65 1.65 0 0 1-.37 2.01l-1.54 1.45a12.6 12.6 0 0 0 3.2 3.2l1.45-1.54a1.65 1.65 0 0 1 2.01-.37l2.5 1.35a1.65 1.65 0 0 1 .78 2.02l-.8 2.15a2.6 2.6 0 0 1-2.64 1.68c-3.29-.3-6.4-1.86-8.94-4.4-2.54-2.54-4.1-5.65-4.4-8.94A2.6 2.6 0 0 1 7.35 3.9Z"
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
