"use client";

import Image from "next/image";
import {
  type PointerEvent as ReactPointerEvent,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

type Brand = {
  name: string;
  image: string;
  logoClassName?: string;
};

const BRANDS: Brand[] = [
  {
    name: "Huawei",
    image: "/assets/brand/huawei.png",
    logoClassName: "brandLogoHuawei",
  },
  {
    name: "Crown Micro",
    image: "/assets/brand/crown-micro.png",
    logoClassName: "brandLogoCrown",
  },
  {
    name: "LVTOPSUN",
    image: "/assets/brand/lvtopsun.png",
    logoClassName: "brandLogoLvtopsun",
  },
  {
    name: "HiTHIUM",
    image: "/assets/brand/h'ithium.png",
    logoClassName: "brandLogoHithium",
  },
  {
    name: "Walton",
    image: "/assets/brand/walton.png",
    logoClassName: "brandLogoWalton",
  },
  {
    name: "JinkoSolar",
    image: "/assets/brand/jinkosolar.png",
    logoClassName: "brandLogoJinko",
  },
  {
    name: "AIKO",
    image: "/assets/brand/aiko'.png",
    logoClassName: "brandLogoAiko",
  },
  {
    name: "LONGi",
    image: "/assets/brand/longi.png",
    logoClassName: "brandLogoLongi",
  },
  {
    name: "Growatt",
    image: "/assets/brand/growatt.png",
    logoClassName: "brandLogoGrowatt",
  },
  {
    name: "DJDC",
    image: "/assets/brand/dongjin.png",
    logoClassName: "brandLogoDjdc",
  },
  {
    name: "GoodWe",
    image: "/assets/brand/goodwe.png",
    logoClassName: "brandLogoGoodwe",
  },
  {
    name: "SAKO",
    image: "/assets/brand/sako.png",
    logoClassName: "brandLogoSako",
  },
  {
    name: "Haier",
    image: "/assets/brand/haier.png",
    logoClassName: "brandLogoHaier",
  },
];

const AUTO_SCROLL_SPEED = 34;
const AUTO_RESUME_DELAY = 450;
const DRAG_THRESHOLD = 5;

function BrandGroup({
  duplicate = false,
}: {
  duplicate?: boolean;
}) {
  return (
    <div
      className="brandMarqueeGroup"
      aria-hidden={duplicate ? "true" : undefined}
    >
      {BRANDS.map((brand) => (
        <div
          className="brandMarqueeLogo"
          key={`${duplicate ? "duplicate-" : ""}${brand.name}`}
        >
          <Image
            src={brand.image}
            alt={duplicate ? "" : `${brand.name} logo`}
            width={260}
            height={110}
            draggable={false}
            className={`brandMarqueeLogoImage ${
              brand.logoClassName ?? ""
            }`}
            sizes="(max-width: 720px) 145px, (max-width: 900px) 165px, 185px"
          />
        </div>
      ))}
    </div>
  );
}

export default function BrandMarquee() {
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
        firstGroup
          .getBoundingClientRect()
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
      new ResizeObserver(() => {
        measure();
      });

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
      Math.abs(distance) <
      DRAG_THRESHOLD
    ) {
      return;
    }

    translateRef.current =
      dragStartTranslateRef.current +
      distance;

    normalizePosition(true);
    applyTransform();

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

    pointerDownRef.current =
      false;

    activePointerIdRef.current =
      null;

    normalizePosition();
    applyTransform();

    resumeAtRef.current =
      performance.now() +
      AUTO_RESUME_DELAY;

    setIsDragging(false);
  };

  return (
    <section
      className="brandMarquee"
      aria-label="Solar technology brands"
    >
      <div className="brandMarqueeTop">
        <span className="brandMarqueeLine" />

        <div className="brandMarqueeEyebrow">
          Solar Technology Brands
        </div>

        <span className="brandMarqueeLine" />
      </div>

      <div
        ref={viewportRef}
        className={`brandMarqueeViewport ${
          isDragging
            ? "isDragging"
            : ""
        }`}
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
        onDragStart={(event) =>
          event.preventDefault()
        }
      >
        <div
          ref={trackRef}
          className="brandMarqueeTrack"
        >
          <div
            ref={firstGroupRef}
            className="brandMarqueeGroup"
            aria-hidden="true"
          >
            {BRANDS.map((brand) => (
              <div
                className="brandMarqueeLogo"
                key={`before-${brand.name}`}
              >
                <Image
                  src={brand.image}
                  alt=""
                  width={260}
                  height={110}
                  draggable={false}
                  className={`brandMarqueeLogoImage ${
                    brand.logoClassName ?? ""
                  }`}
                  sizes="(max-width: 720px) 145px, (max-width: 900px) 165px, 185px"
                />
              </div>
            ))}
          </div>

          <BrandGroup />

          <BrandGroup duplicate />
        </div>
      </div>
    </section>
  );
}