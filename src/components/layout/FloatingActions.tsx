"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
} from "react";

export default function FloatingActions() {
  const [showBackToTop, setShowBackToTop] =
    useState(false);

  const animationFrameRef =
    useRef<number | null>(null);

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

      if (
        animationFrameRef.current !== null
      ) {
        cancelAnimationFrame(
          animationFrameRef.current
        );
      }
    };
  }, []);

  const goToTop = () => {
    const reduceMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

    const html =
      document.documentElement;

    const body =
      document.body;

    const previousHtmlScrollBehavior =
      html.style.scrollBehavior;

    const previousBodyScrollBehavior =
      body.style.scrollBehavior;

    /*
     * Disable the global CSS smooth scrolling
     * temporarily because we are controlling
     * the animation ourselves.
     */
    html.style.scrollBehavior = "auto";
    body.style.scrollBehavior = "auto";

    if (
      animationFrameRef.current !== null
    ) {
      cancelAnimationFrame(
        animationFrameRef.current
      );

      animationFrameRef.current = null;
    }

    if (reduceMotion) {
      window.scrollTo(0, 0);

      html.style.scrollBehavior =
        previousHtmlScrollBehavior;

      body.style.scrollBehavior =
        previousBodyScrollBehavior;

      return;
    }

    const startPosition =
      window.scrollY;

    if (startPosition <= 0) {
      window.scrollTo(0, 0);

      html.style.scrollBehavior =
        previousHtmlScrollBehavior;

      body.style.scrollBehavior =
        previousBodyScrollBehavior;

      return;
    }

    const startTime =
      performance.now();

    /*
     * Smooth but not too slow.
     * Long pages still reach the top quickly.
     */
    const duration = Math.min(
      1000,
      Math.max(
        650,
        startPosition * 0.12
      )
    );

    /*
     * Smooth ease-in-out curve.
     */
    const easeInOutCubic = (
      progress: number
    ) => {
      return progress < 0.5
        ? 4 *
            progress *
            progress *
            progress
        : 1 -
            Math.pow(
              -2 * progress + 2,
              3
            ) /
              2;
    };

    const animateScroll = (
      currentTime: number
    ) => {
      const elapsed =
        currentTime - startTime;

      const progress = Math.min(
        elapsed / duration,
        1
      );

      const easedProgress =
        easeInOutCubic(progress);

      const nextPosition =
        startPosition *
        (1 - easedProgress);

      window.scrollTo(
        0,
        nextPosition
      );

      if (progress < 1) {
        animationFrameRef.current =
          requestAnimationFrame(
            animateScroll
          );

        return;
      }

      /*
       * Final position is exactly 0.
       * There is no visible snap because
       * the animation already reached 0.
       */
      window.scrollTo(0, 0);

      animationFrameRef.current =
        null;

      /*
       * Restore the original CSS behavior
       * after the scroll is completely done.
       */
      requestAnimationFrame(() => {
        html.style.scrollBehavior =
          previousHtmlScrollBehavior;

        body.style.scrollBehavior =
          previousBodyScrollBehavior;
      });
    };

    animationFrameRef.current =
      requestAnimationFrame(
        animateScroll
      );
  };

  return (
    <>
      <a
        href="tel:01754477488"
        className="floatingAction floatingPhone"
        aria-label="Call Desh Solar at 01754-477488"
        title="Call Desh Solar"
      >
        <Image
          src="/assets/icons/phone-prototype-exact.png"
          alt=""
          width={32}
          height={32}
          className="floatingPhoneImage"
          aria-hidden="true"
        />

        <span className="floatingActionTooltip">
          01754-477488
        </span>
      </a>

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