"use client";

import { useEffect, useRef } from "react";

export default function CinematicIntro() {
  const rootRef = useRef<HTMLDivElement>(null);
  const cinematicRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const pageProgressRef = useRef<HTMLDivElement>(null);
  const scrubFillRef = useRef<HTMLDivElement>(null);
  const heroCopyRef = useRef<HTMLDivElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const cinematic = cinematicRef.current;
    const video = videoRef.current;
    const loader = loaderRef.current;
    const pageProgress = pageProgressRef.current;
    const scrubFill = scrubFillRef.current;
    const heroCopy = heroCopyRef.current;
    const scrollCue = scrollCueRef.current;

    if (
      !root ||
      !cinematic ||
      !video ||
      !loader ||
      !pageProgress ||
      !scrubFill ||
      !heroCopy ||
      !scrollCue
    ) {
      return;
    }

    const sceneCopies = Array.from(
      root.querySelectorAll<HTMLElement>(".sceneCopy")
    );

    const timelineItems = Array.from(
      root.querySelectorAll<HTMLElement>(".tItem")
    );

    let duration = 10;
    let targetTime = 0;
    let currentTarget = 0;
    let metadataReady = false;
    let metadataInitialized = false;
    let rafId = 0;

    const clamp = (
      value: number,
      min: number,
      max: number
    ) => Math.max(min, Math.min(max, value));

    const smoothstep = (
      start: number,
      end: number,
      value: number
    ) => {
      const t = clamp(
        (value - start) / (end - start),
        0,
        1
      );

      return t * t * (3 - 2 * t);
    };

    const storyProgress = () => {
      const rect =
        cinematic.getBoundingClientRect();

      const total =
        cinematic.offsetHeight -
        window.innerHeight;

      if (total <= 0) {
        return 0;
      }

      return clamp(
        -rect.top / total,
        0,
        1
      );
    };

    const setCopy = (
      element: HTMLElement,
      progress: number,
      start: number,
      end: number
    ) => {
      const fade = 0.035;

      const fadeIn =
        smoothstep(
          start,
          start + fade,
          progress
        );

      const fadeOut =
        1 -
        smoothstep(
          end - fade,
          end,
          progress
        );

      const opacity =
        Math.min(
          fadeIn,
          fadeOut
        );

      element.style.opacity =
        String(opacity);

      element.style.transform =
        `translateY(${
          (1 - opacity) * 24
        }px)`;
    };

    const updateUI = () => {
      const documentElement =
        document.documentElement;

      const maxScroll =
        documentElement.scrollHeight -
        window.innerHeight;

      if (maxScroll > 0) {
        pageProgress.style.width =
          `${
            (window.scrollY /
              maxScroll) *
            100
          }%`;
      }

      const progress =
        storyProgress();

      scrubFill.style.width =
        `${progress * 100}%`;

      targetTime =
        progress *
        Math.max(
          0.01,
          duration - 0.02
        );

      /*
       * Opening hero disappears
       * before the first main
       * solar-generation stage.
       */
      const heroFade =
        1 -
        smoothstep(
          0.015,
          0.09,
          progress
        );

      heroCopy.style.opacity =
        String(heroFade);

      heroCopy.style.transform =
        `translateY(${
          (1 - heroFade) * -22
        }px)`;

      scrollCue.style.opacity =
        String(
          1 -
          smoothstep(
            0.025,
            0.11,
            progress
          )
        );

      /*
       * Show / hide each story
       * caption based on the
       * updated video's timing.
       */
      sceneCopies.forEach(
        (element) => {
          const start =
            Number(
              element.dataset.start
            ) || 0;

          const end =
            Number(
              element.dataset.end
            ) || 1;

          setCopy(
            element,
            progress,
            start,
            end
          );
        }
      );

      /*
       * Update right-side story
       * timeline.
       */
      timelineItems.forEach(
        (item, index) => {
          const threshold =
            Number(
              item.dataset.p
            ) || 0;

          const next =
            index <
            timelineItems.length - 1
              ? Number(
                  timelineItems[
                    index + 1
                  ].dataset.p
                )
              : 1.01;

          item.classList.toggle(
            "active",
            progress >=
              threshold &&
              progress < next
          );
        }
      );
    };

    /*
     * Smoothly seek the video
     * instead of jumping directly
     * between frames.
     */
    const renderVideo = () => {
      if (metadataReady) {
        currentTarget +=
          (
            targetTime -
            currentTarget
          ) *
          0.34;

        if (
          Math.abs(
            video.currentTime -
            currentTarget
          ) > 0.012
        ) {
          try {
            video.currentTime =
              currentTarget;
          } catch {
            // Browser may briefly
            // reject seeking while
            // initializing.
          }
        }
      }

      rafId =
        requestAnimationFrame(
          renderVideo
        );
    };

    const metadataLoaded = () => {
      if (metadataInitialized) {
        return;
      }

      metadataInitialized = true;

      duration =
        video.duration || 10;

      metadataReady = true;

      video.pause();

      try {
        video.currentTime = 0.01;
      } catch {
        // Ignore initial seek
        // errors.
      }

      window.setTimeout(
        () => {
          loader.classList.add(
            "done"
          );
        },
        260
      );
    };

    const canPlay = () => {
      if (metadataReady) {
        loader.classList.add(
          "done"
        );
      }
    };

    video.addEventListener(
      "loadedmetadata",
      metadataLoaded
    );

    video.addEventListener(
      "canplay",
      canPlay
    );

    if (video.readyState >= 1) {
      metadataLoaded();
    }

    /*
     * Loader fallback in case a
     * browser delays the video
     * readiness event.
     */
    const loaderFallback =
      window.setTimeout(() => {
        loader.classList.add(
          "done"
        );
      }, 3500);

    /*
     * Used by the bridge section
     * below the cinematic.
     */
    const revealObserver =
      new IntersectionObserver(
        (entries) => {
          entries.forEach(
            (entry) => {
              if (
                entry.isIntersecting
              ) {
                entry.target.classList.add(
                  "in"
                );
              }
            }
          );
        },
        {
          threshold: 0.15,
        }
      );

    root
      .querySelectorAll(".reveal")
      .forEach((element) => {
        revealObserver.observe(
          element
        );
      });

    window.addEventListener(
      "scroll",
      updateUI,
      {
        passive: true,
      }
    );

    window.addEventListener(
      "resize",
      updateUI
    );

    updateUI();
    renderVideo();

    return () => {
      video.removeEventListener(
        "loadedmetadata",
        metadataLoaded
      );

      video.removeEventListener(
        "canplay",
        canPlay
      );

      window.removeEventListener(
        "scroll",
        updateUI
      );

      window.removeEventListener(
        "resize",
        updateUI
      );

      window.clearTimeout(
        loaderFallback
      );

      cancelAnimationFrame(
        rafId
      );

      revealObserver.disconnect();
    };
  }, []);

  return (
    <div ref={rootRef}>
      {/* Page progress */}

      <div
        ref={pageProgressRef}
        className="pageProgress"
      />

      {/* Video loader */}

      <div
        ref={loaderRef}
        className="cinematicLoader"
      >
        <div className="loaderBox">
          <div className="loaderRing" />

          <div className="loaderText">
            Preparing solar journey
          </div>
        </div>
      </div>

      {/* ==================================================
          CINEMATIC INTRO
          ================================================== */}

      <section
        ref={cinematicRef}
        className="cinematic"
        id="top"
      >
        <div className="stage">
          <video
            ref={videoRef}
            muted
            playsInline
            preload="metadata"
            tabIndex={-1}
          >
            <source
              src="/assets/desh-solar-energy-flow.mp4"
              type="video/mp4"
            />
          </video>

          <div className="noise" />

          {/* INTRO */}

          <div
            ref={heroCopyRef}
            className="heroCopy"
          >
            <div className="kicker">
              Desh Solar / Interactive
              energy journey
            </div>

            <h1>
              FOLLOW
              <br />
              THE{" "}
              <span>
                ENERGY.
              </span>
            </h1>

            <p>
              Scroll to move through
              the solar system
              itself—from sunlight on
              the roof to electricity
              flowing through the home.
            </p>
          </div>

          {/* ==================================================
              01 — SUN / SOLAR PANELS
              Approx. 0.5s – 2.1s
              ================================================== */}

          <div
            className="sceneCopy"
            data-start=".05"
            data-end=".21"
          >
            <div className="small">
              01 / Solar generation
            </div>

            <h2>
              CAPTURE
              <br />
              THE{" "}
              <span className="gold">
                SUN.
              </span>
            </h2>

            <p>
              Sunlight reaches the
              rooftop solar array and
              becomes clean electrical
              energy.
            </p>
          </div>

          {/* ==================================================
              02 — ENERGY FLOW
              Approx. 1.8s – 2.9s
              ================================================== */}

          <div
            className="sceneCopy right"
            data-start=".18"
            data-end=".29"
          >
            <div className="small">
              02 / Follow the current
            </div>

            <h2>
              ENERGY
              <br />
              IN{" "}
              <span className="gold">
                MOTION.
              </span>
            </h2>

            <p>
              Follow the solar current
              as energy leaves the
              rooftop panels and moves
              toward the system&apos;s
              power electronics.
            </p>
          </div>

          {/* ==================================================
              03 — INVERTER
              Approx. 2.2s – 3.5s
              ================================================== */}

          <div
            className="sceneCopy"
            data-start=".22"
            data-end=".35"
          >
            <div className="small">
              03 / Convert the current
            </div>

            <h2>
              MEET THE
              <br />

              <span className="blue">
                INVERTER.
              </span>
            </h2>

            <p>
              The inverter converts
              solar DC electricity into
              usable AC power for the
              building and intelligently
              manages energy throughout
              the system.
            </p>
          </div>

          {/* ==================================================
              04 — BATTERY
              Approx. 3.4s – 5.1s
              ================================================== */}

          <div
            className="sceneCopy right"
            data-start=".34"
            data-end=".51"
          >
            <div className="small">
              04 / Store the energy
            </div>

            <h2>
              SAVE POWER
              <br />

              <span className="green">
                FOR LATER.
              </span>
            </h2>

            <p>
              Surplus solar energy can
              charge the battery so
              stored power remains
              available when sunlight
              drops or backup energy is
              needed.
            </p>
          </div>

          {/* ==================================================
              05 — HOME
              Approx. 4.8s – 8.1s
              ================================================== */}

          <div
            className="sceneCopy"
            data-start=".48"
            data-end=".80"
          >
            <div className="small">
              05 / Into the home
            </div>

            <h2>
              POWER
              <br />
              EVERY{" "}
              <span className="blue">
                ROOM.
              </span>
            </h2>

            <p>
              Electricity flows through
              the home and powers the
              everyday loads that keep
              life moving—from lighting
              and cooling to appliances
              and electronics.
            </p>
          </div>

          {/* ==================================================
              06 — POWERED SYSTEM
              Approx. 8.2s – 10.08s
              ================================================== */}

          <div
            className="sceneCopy right"
            data-start=".81"
            data-end=".995"
          >
            <div className="small">
              06 / Complete system
            </div>

            <h2>
              ONE SYSTEM.
              <br />

              <span className="green">
                EVERYDAY ENERGY.
              </span>
            </h2>

            <p>
              Solar generation,
              intelligent conversion,
              battery storage and
              everyday electrical loads
              work together as one
              connected energy system.
            </p>
          </div>

          {/* SCROLL INDICATOR */}

          <div
            ref={scrollCueRef}
            className="scrollCue"
          >
            <span className="scrollMouse" />

            Scroll to control the
            animation
          </div>

          {/* ==================================================
              RIGHT-SIDE TIMELINE
              ================================================== */}

          <div className="timeline">
            <div
              className="tItem active"
              data-p=".03"
            >
              <span>Sun</span>
              <i className="tDot" />
            </div>

            <div
              className="tItem"
              data-p=".10"
            >
              <span>Panels</span>
              <i className="tDot" />
            </div>

            <div
              className="tItem"
              data-p=".22"
            >
              <span>Inverter</span>
              <i className="tDot" />
            </div>

            <div
              className="tItem"
              data-p=".34"
            >
              <span>Battery</span>
              <i className="tDot" />
            </div>

            <div
              className="tItem"
              data-p=".48"
            >
              <span>Home</span>
              <i className="tDot" />
            </div>

            <div
              className="tItem"
              data-p=".81"
            >
              <span>Powered</span>
              <i className="tDot" />
            </div>
          </div>

          <div className="scrubLabel">
            Scroll-controlled cinematic
          </div>

          <div className="scrubBar">
            <div
              ref={scrubFillRef}
              className="scrubFill"
            />
          </div>
        </div>
      </section>

      {/* ==================================================
          TRANSITION / BRIDGE
          ================================================== */}

      <section className="bridge">
        <div className="reveal">
          <div className="bridgeEyebrow">
            A complete solar ecosystem
          </div>

          <h2>
            ONE SYSTEM.
            <br />

            <span className="green">
              EVERYDAY ENERGY.
            </span>
          </h2>

          <p>
            The journey begins with
            sunlight and continues
            through generation,
            conversion, storage and
            everyday use. Now explore
            the solar solutions behind
            that complete energy
            ecosystem.
          </p>

          <div className="flowRow">
            <span className="flowNode">
              ☀ Sun
            </span>

            <span className="flowArrow">
              →
            </span>

            <span className="flowNode">
              Solar Panels
            </span>

            <span className="flowArrow">
              →
            </span>

            <span className="flowNode">
              Inverter
            </span>

            <span className="flowArrow">
              →
            </span>

            <span className="flowNode">
              Battery
            </span>

            <span className="flowArrow">
              →
            </span>

            <span className="flowNode">
              Home / Business
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}