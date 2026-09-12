"use client";

import Image from "next/image";
import Link from "next/link";
import {
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

type ProjectItem = {
  id: string;
  title: string;
  category: string;
  image: string;
  text: string;
  href: string;
};

const FEATURED_PROJECTS: ProjectItem[] = [
  {
    id: "01",
    title: "Residential Solar",
    category: "Residential",
    image: "/assets/projects-real/residential.webp",
    text: "Solar solutions designed around household energy needs.",
    href: "/projects?type=residential",
  },
  {
    id: "02",
    title: "Commercial Solar",
    category: "Commercial",
    image: "/assets/projects-real/commercial.webp",
    text: "Solar energy solutions for offices, businesses and commercial spaces.",
    href: "/projects?type=commercial",
  },
  {
    id: "03",
    title: "Industrial Solar",
    category: "Industrial",
    image: "/assets/projects-real/industrial.webp",
    text: "Engineering-focused solar solutions for larger operational loads.",
    href: "/projects?type=industrial",
  },
  {
    id: "04",
    title: "Agriculture Solar",
    category: "Agriculture",
    image: "/assets/projects-real/agriculture.webp",
    text: "Solar applications planned around agricultural and field energy requirements.",
    href: "/projects?type=agriculture",
  },
  {
    id: "05",
    title: "Filling Station Solar",
    category: "Filling Station",
    image: "/assets/projects-real/filling.webp",
    text: "Solar solutions for filling-station and service-site energy requirements.",
    href: "/projects?type=filling-station",
  },
  {
    id: "06",
    title: "Off-Grid Solar",
    category: "Off-Grid",
    image: "/assets/projects-real/offgrid.webp",
    text: "Independent solar energy solutions for locations requiring off-grid operation.",
    href: "/projects?type=off-grid",
  },
];

const AUTO_SCROLL_SPEED = 32;
const AUTO_RESUME_DELAY = 450;
const DRAG_THRESHOLD = 5;

function ProjectCard({
  project,
  duplicate = false,
}: {
  project: ProjectItem;
  duplicate?: boolean;
}) {
  return (
    <article className="featuredProjectCard">
      <Link
        href={project.href}
        className="featuredProjectImage"
        tabIndex={duplicate ? -1 : undefined}
        aria-hidden={duplicate ? "true" : undefined}
      >
        <Image
          src={project.image}
          alt={duplicate ? "" : project.title}
          fill
          draggable={false}
          className="featuredProjectImageAsset"
          sizes="(max-width: 720px) 82vw, (max-width: 1100px) 44vw, 31vw"
        />

        <div className="featuredProjectOverlay" />

        <span className="featuredProjectCategory">
          {project.category}
        </span>
      </Link>

      <div className="featuredProjectContent">
        <h3>{project.title}</h3>

        <p>{project.text}</p>

        <Link
          href={project.href}
          className="featuredProjectLink"
          tabIndex={duplicate ? -1 : undefined}
          aria-hidden={duplicate ? "true" : undefined}
        >
          View Project
          <span>→</span>
        </Link>
      </div>
    </article>
  );
}

export default function FeaturedProjects() {
  const viewportRef =
    useRef<HTMLDivElement>(null);

  const trackRef =
    useRef<HTMLDivElement>(null);

  const firstGroupRef =
    useRef<HTMLDivElement>(null);

  const groupWidthRef =
    useRef(0);

  const translateRef =
    useRef(0);

  const dragStartXRef =
    useRef(0);

  const dragStartTranslateRef =
    useRef(0);

  const activePointerIdRef =
    useRef<number | null>(null);

  const pointerDownRef =
    useRef(false);

  const didDragRef =
    useRef(false);

  const resumeAtRef =
    useRef(0);

  const [isDragging, setIsDragging] =
    useState(false);

  const applyTransform = () => {
    const track =
      trackRef.current;

    if (!track) {
      return;
    }

    track.style.transform =
      `translate3d(${translateRef.current}px, 0, 0)`;
  };

  const normalizePosition = (
    adjustDragOrigin = false
  ) => {
    const width =
      groupWidthRef.current;

    if (width <= 0) {
      return;
    }

    /*
     * Three identical groups are rendered.
     * Keep the visible position inside the middle loop range.
     * Moving exactly one group width is visually identical,
     * so this reset is seamless.
     */
    while (
      translateRef.current <=
      -2 * width
    ) {
      translateRef.current +=
        width;

      if (adjustDragOrigin) {
        dragStartTranslateRef.current +=
          width;
      }
    }

    while (
      translateRef.current >= 0
    ) {
      translateRef.current -=
        width;

      if (adjustDragOrigin) {
        dragStartTranslateRef.current -=
          width;
      }
    }
  };

  useLayoutEffect(() => {
    const track =
      trackRef.current;

    const firstGroup =
      firstGroupRef.current;

    if (
      !track ||
      !firstGroup
    ) {
      return;
    }

    let animationFrame = 0;
    let lastFrameTime =
      performance.now();

    const measure = () => {
      const width =
        firstGroup.getBoundingClientRect()
          .width;

      if (width <= 0) {
        return;
      }

      const previousWidth =
        groupWidthRef.current;

      groupWidthRef.current =
        width;

      if (previousWidth === 0) {
        translateRef.current =
          -width;

        applyTransform();

        return;
      }

      /*
       * Keep approximately the same visual loop position
       * after responsive resizing.
       */
      const progress =
        -translateRef.current /
        previousWidth;

      translateRef.current =
        -progress * width;

      normalizePosition();
      applyTransform();
    };

    measure();

    const resizeObserver =
      new ResizeObserver(measure);

    resizeObserver.observe(
      firstGroup
    );

    const animate = (
      currentTime: number
    ) => {
      const delta =
        Math.min(
          currentTime -
            lastFrameTime,
          40
        );

      lastFrameTime =
        currentTime;

      const reduceMotion =
        window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;

      const canAutoMove =
        !reduceMotion &&
        !pointerDownRef.current &&
        currentTime >=
          resumeAtRef.current &&
        groupWidthRef.current > 0;

      if (canAutoMove) {
        translateRef.current -=
          (AUTO_SCROLL_SPEED *
            delta) /
          1000;

        normalizePosition();
        applyTransform();
      }

      animationFrame =
        window.requestAnimationFrame(
          animate
        );
    };

    animationFrame =
      window.requestAnimationFrame(
        animate
      );

    return () => {
      resizeObserver.disconnect();

      window.cancelAnimationFrame(
        animationFrame
      );
    };
  }, []);

  const handlePointerDown = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {
    if (
      !event.isPrimary ||
      (event.pointerType === "mouse" &&
        event.button !== 0)
    ) {
      return;
    }

    const viewport =
      viewportRef.current;

    if (!viewport) {
      return;
    }

    pointerDownRef.current = true;

    activePointerIdRef.current =
      event.pointerId;

    dragStartXRef.current =
      event.clientX;

    dragStartTranslateRef.current =
      translateRef.current;

    didDragRef.current = false;

    resumeAtRef.current =
      Number.POSITIVE_INFINITY;

    setIsDragging(true);

    viewport.setPointerCapture(
      event.pointerId
    );
  };

  const handlePointerMove = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {
    if (
      !pointerDownRef.current ||
      activePointerIdRef.current !==
        event.pointerId
    ) {
      return;
    }

    const distance =
      event.clientX -
      dragStartXRef.current;

    if (
      Math.abs(distance) >=
      DRAG_THRESHOLD
    ) {
      didDragRef.current = true;
    }

    if (!didDragRef.current) {
      return;
    }

    translateRef.current =
      dragStartTranslateRef.current +
      distance;

    normalizePosition(true);
    applyTransform();

    /*
     * touch-action: pan-y in CSS lets vertical page scrolling
     * remain native while horizontal movement belongs here.
     */
    if (
      event.pointerType !== "touch"
    ) {
      event.preventDefault();
    }
  };

  const finishPointerInteraction = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {
    const viewport =
      viewportRef.current;

    if (
      viewport &&
      activePointerIdRef.current !==
        null &&
      viewport.hasPointerCapture(
        activePointerIdRef.current
      )
    ) {
      viewport.releasePointerCapture(
        activePointerIdRef.current
      );
    }

    pointerDownRef.current = false;

    activePointerIdRef.current =
      null;

    normalizePosition();
    applyTransform();

    resumeAtRef.current =
      performance.now() +
      AUTO_RESUME_DELAY;

    setIsDragging(false);

    /*
     * The browser can dispatch a click immediately after
     * pointerup. Keep the drag flag alive just long enough
     * to cancel that accidental click.
     */
    window.setTimeout(() => {
      didDragRef.current = false;
    }, 0);
  };

  const handleClickCapture = (
    event: ReactMouseEvent<HTMLDivElement>
  ) => {
    if (!didDragRef.current) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    didDragRef.current = false;
  };

  return (
    <section
      className="featuredProjects"
      id="featured-projects"
    >
      <div className="featuredProjectsGlow featuredProjectsGlowOne" />
      <div className="featuredProjectsGlow featuredProjectsGlowTwo" />

      <div className="featuredProjectsInner">
        {/* HEADER */}

        <div className="featuredProjectsHeader">
          <div>
            <div className="featuredProjectsEyebrow">
              Featured Projects
            </div>

            <h2>
              Solar in <span>action.</span>
            </h2>
          </div>

          <div className="featuredProjectsHeaderRight">
            <p>
              Explore solar applications across residential,
              commercial, industrial, agricultural, filling-station
              and off-grid environments.
            </p>

            <Link href="/projects">
              View All Projects →
            </Link>
          </div>
        </div>

        {/* AUTO-MOVING + DRAGGABLE PROJECT STRIP */}

        <div
          ref={viewportRef}
          className={`featuredProjectsViewport ${
            isDragging
              ? "isDragging"
              : ""
          }`}
          aria-label="Featured solar project categories. The showcase moves automatically. Click and drag, or swipe, to explore manually."
          onPointerDown={
            handlePointerDown
          }
          onPointerMove={
            handlePointerMove
          }
          onPointerUp={
            finishPointerInteraction
          }
          onPointerCancel={
            finishPointerInteraction
          }
          onLostPointerCapture={
            finishPointerInteraction
          }
          onClickCapture={
            handleClickCapture
          }
          onDragStart={(event) =>
            event.preventDefault()
          }
        >
          <div
            ref={trackRef}
            className="featuredProjectsTrack"
          >
            <div
              ref={firstGroupRef}
              className="featuredProjectsGroup"
              aria-hidden="true"
            >
              {FEATURED_PROJECTS.map(
                (project) => (
                  <ProjectCard
                    key={`before-${project.id}`}
                    project={project}
                    duplicate
                  />
                )
              )}
            </div>

            <div className="featuredProjectsGroup">
              {FEATURED_PROJECTS.map(
                (project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                  />
                )
              )}
            </div>

            <div
              className="featuredProjectsGroup"
              aria-hidden="true"
            >
              {FEATURED_PROJECTS.map(
                (project) => (
                  <ProjectCard
                    key={`after-${project.id}`}
                    project={project}
                    duplicate
                  />
                )
              )}
            </div>
          </div>
        </div>

        {/* FOOTER NOTE */}

        <div className="featuredProjectsFooter">
          <div className="featuredProjectsDataNote">
            <span />

            Project details will be updated with verified
            Desh Solar project information.
          </div>

          <div className="featuredProjectsMotionHint">
            <span className="featuredProjectsMotionDot" />

            Auto-moving · drag or swipe anytime
          </div>
        </div>
      </div>
    </section>
  );
}
