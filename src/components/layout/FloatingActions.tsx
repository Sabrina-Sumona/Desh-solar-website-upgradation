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
          {/* Prototype-style classic desk telephone */}
          <path
            d="M7.05 6.2h9.9c.75 0 1.36.61 1.36 1.36v.7c0 .75-.61 1.36-1.36 1.36h-1.7c-.54 0-1.02-.32-1.24-.81l-.25-.57h-3.52l-.25.57c-.22.49-.7.81-1.24.81h-1.7c-.75 0-1.36-.61-1.36-1.36v-.7c0-.75.61-1.36 1.36-1.36Z"
          />

          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8.08 10.58h7.84c1.03 0 1.86.83 1.86 1.86v4.67c0 1.03-.83 1.86-1.86 1.86H8.08a1.86 1.86 0 0 1-1.86-1.86v-4.67c0-1.03.83-1.86 1.86-1.86Zm3.92 2.05a2.15 2.15 0 1 0 0 4.3 2.15 2.15 0 0 0 0-4.3Z"
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
