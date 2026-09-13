"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Product, ProductCategory } from "@/data/products";

type ProductQuickViewProps = {
  product: Product | null;
  onClose: () => void;
};

type FlowKey = "panel" | "inverter" | "battery" | "load";

type QuickViewProfile = {
  role: string;
  why: string;
  tool:
    | "panel"
    | "inverter"
    | "battery"
    | "portable"
    | "system";
};

const FLOW_ITEMS: Array<{
  key: FlowKey;
  icon: string;
  label: string;
}> = [
  { key: "panel", icon: "▦", label: "Generation" },
  { key: "inverter", icon: "↯", label: "Conversion" },
  { key: "battery", icon: "▣", label: "Storage" },
  { key: "load", icon: "⌂", label: "Loads" },
];

function getProfile(product: Product): QuickViewProfile {
  const source = `${product.name} ${product.search}`.toLowerCase();

  if (product.category === "panel") {
    return {
      role: product.role || "Generation",
      why:
        source.includes("jinko tiger neo 590")
          ? "Use panel wattage as one part of array design. Roof geometry, string voltage and inverter MPPT limits still determine the final layout."
          : source.includes("jinko tiger neo 625")
            ? "High-output N-Type panels can reduce module count, but final array design still depends on roof area, string voltage and inverter limits."
            : "Use panel wattage as one part of array design; roof geometry, string voltage and inverter MPPT limits still determine the final layout.",
      tool: "panel",
    };
  }

  if (product.category === "inverter") {
    return {
      role: product.role || "Control + Conversion",
      why:
        "Inverter choice should follow the real load profile. Rated output, startup surge, electrical phase, PV input and battery architecture all need to work together.",
      tool: "inverter",
    };
  }

  if (product.category === "battery") {
    return {
      role: product.role || "Storage",
      why:
        "Battery selection should start with required backup energy, then confirm voltage, BMS/current limits and inverter compatibility.",
      tool: "battery",
    };
  }

  if (product.category === "portable") {
    return {
      role: product.role || "Portable Storage",
      why:
        "Portable power should be compared using both output wattage and stored energy because they answer different questions: what can run, and for how long.",
      tool: "portable",
    };
  }

  return {
    role: product.role || "Complete Solar System",
    why:
      source.includes("pump")
        ? "A solar pump package is a planning path, not a universal fit. Match it to pump duty, water requirement, solar resource, phase and site conditions."
        : "A complete package is a planning path, not a universal fit. Match it to actual connected load, backup hours, phase and site conditions.",
    tool: "system",
  };
}

function parseRatedKw(product: Product) {
  const source = `${product.power} ${product.name}`;

  const kw = source.match(/(\d+(?:\.\d+)?)\s*kw\b/i);
  if (kw) {
    return Number(kw[1]);
  }

  const watts = source.match(/(\d+(?:\.\d+)?)\s*w\b/i);
  if (watts) {
    return Number(watts[1]) / 1000;
  }

  return null;
}

function parsePanelWatts(product: Product) {
  const source = `${product.power} ${product.name}`;
  const watts = source.match(/(\d+(?:\.\d+)?)\s*w\b/i);

  return watts ? Number(watts[1]) : null;
}

function parseEnergyKwh(product: Product) {
  const source = `${product.power} ${product.name} ${product.search}`;

  const kwh = source.match(/(\d+(?:\.\d+)?)\s*kwh\b/i);
  if (kwh) {
    return Number(kwh[1]);
  }

  const wh = source.match(/(\d+(?:\.\d+)?)\s*wh\b/i);
  if (wh) {
    return Number(wh[1]) / 1000;
  }

  const voltage = source.match(/(\d+(?:\.\d+)?)\s*v\b/i);
  const ampHours = source.match(/(\d+(?:\.\d+)?)\s*ah\b/i);

  if (voltage && ampHours) {
    return (Number(voltage[1]) * Number(ampHours[1])) / 1000;
  }

  return null;
}

function activeFlowKeys(category: ProductCategory): FlowKey[] {
  if (category === "system") {
    return ["panel", "inverter", "battery", "load"];
  }

  if (category === "portable") {
    return ["battery", "load"];
  }

  if (
    category === "panel" ||
    category === "inverter" ||
    category === "battery"
  ) {
    return [category];
  }

  return [];
}

function QuickPlanningTool({
  product,
  profile,
}: {
  product: Product;
  profile: QuickViewProfile;
}) {
  const [value, setValue] = useState(
    profile.tool === "portable"
      ? 300
      : profile.tool === "battery"
        ? 1000
        : profile.tool === "inverter"
          ? 4000
          : 1000
  );

  const planning = useMemo(() => {
    if (profile.tool === "system") {
      return {
        label: "Complete system / package",
        result: "Review against your actual load profile",
        note:
          "Use Build Your System to check connected load, surge, backup hours and PV planning before final package selection.",
      };
    }

    if (profile.tool === "panel") {
      const watts = parsePanelWatts(product);

      if (!watts || watts <= 0) {
        return {
          label: "Usable roof area (sq ft)",
          result: "Confirm panel wattage before estimating roof fit",
          note:
            "Final panel count also depends on real roof geometry, setbacks, orientation and the inverter string design.",
        };
      }

      const pvKw = Math.max(0, value) / 65;
      const count = Math.max(
        0,
        Math.floor((pvKw * 1000) / watts)
      );

      return {
        label: "Usable roof area (sq ft)",
        result: `~${count} panels • ~${(
          (count * watts) /
          1000
        ).toFixed(1)} kWp`,
        note:
          "Illustrative estimate using ~65 sq ft per kWp planning allowance. Final layout requires a site survey.",
      };
    }

    if (profile.tool === "inverter") {
      const ratingKw = parseRatedKw(product);
      const runningKw = Math.max(0, value) / 1000;

      let result = "Confirm rated inverter output";

      if (ratingKw && ratingKw > 0) {
        if (runningKw <= ratingKw * 0.8) {
          result = "Within a conservative planning range";
        } else if (runningKw <= ratingKw) {
          result = "Near rated output — review surge";
        } else {
          result = "Above rated output — consider larger class";
        }
      }

      return {
        label: "Estimated running load (W)",
        result,
        note:
          "Running-load comparison only. Startup surge, phase, PV input and product limits still require review.",
      };
    }

    const energyKwh = parseEnergyKwh(product);

    if (!energyKwh || energyKwh <= 0) {
      return {
        label: "Illustrative backup load (W)",
        result: "Confirm usable battery energy before estimating runtime",
        note:
          "Actual runtime depends on usable energy, load duty cycle, conversion losses and product limits.",
      };
    }

    const loadKw = Math.max(1, value) / 1000;
    const hours = (energyKwh * 0.85) / loadKw;

    return {
      label: "Illustrative backup load (W)",
      result: `~${hours.toFixed(1)} hours illustrative`,
      note:
        "Uses nominal energy × 85% illustrative factor. Actual runtime depends on load duty cycle and product limits.",
    };
  }, [product, profile.tool, value]);

  const heading =
    profile.tool === "panel"
      ? "Estimate roof fit"
      : profile.tool === "inverter"
        ? "Check load class"
        : profile.tool === "system"
          ? "Review package fit"
          : "Estimate backup";

  return (
    <div className="pqvdSection">
      <small>QUICK PLANNING TOOL</small>
      <h3>{heading}</h3>

      <div className="pqvdQuickTool">
        <label>{planning.label}</label>

        {profile.tool !== "system" && (
          <input
            type="number"
            min={profile.tool === "panel" ? 0 : 50}
            value={value}
            onChange={(event) =>
              setValue(Math.max(0, Number(event.target.value) || 0))
            }
          />
        )}

        <div className="pqvdToolResult">{planning.result}</div>
        <span className="pqvdToolNote">{planning.note}</span>
      </div>
    </div>
  );
}

export default function ProductQuickView({
  product,
  onClose,
}: ProductQuickViewProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!product) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [product, onClose]);

  if (!product) {
    return null;
  }

  const profile = getProfile(product);
  const activeKeys = activeFlowKeys(product.category);

  const buildHref =
    `/build-your-system?selectedProduct=${encodeURIComponent(product.id)}` +
    `&productType=${encodeURIComponent(product.category)}` +
    `&selectedName=${encodeURIComponent(product.name)}` +
    `&selectedRating=${encodeURIComponent(product.power)}`;

  const askHref =
    `/contact-us?source=product` +
    `&product=${encodeURIComponent(product.name)}` +
    `&productType=${encodeURIComponent(product.category)}`;

  return (
    <>
      <button
        type="button"
        className="pqvdBackdrop"
        aria-label="Close product quick view"
        onClick={onClose}
      />

      <aside
        className="pqvdDrawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pqvd-title"
      >
        <div className="pqvdHead">
          <small>PRODUCT QUICK VIEW</small>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close quick view"
          >
            ×
          </button>
        </div>

        <div className="pqvdContent">
          <div className="pqvdMedia">
            <Image
              src={product.image}
              alt={product.name}
              width={900}
              height={620}
              sizes="(max-width: 620px) 100vw, 560px"
              priority
            />
          </div>

          <div className="pqvdEyebrow">{profile.role}</div>

          <h2 id="pqvd-title">{product.name}</h2>

          <p className="pqvdLead">{profile.why}</p>

          <div className="pqvdTags">
            {product.bestFor.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>

          <div className="pqvdSection">
            <small>SYSTEM ROLE</small>
            <h3>{profile.role}</h3>

            <div
              className="pqvdMiniFlow"
              aria-label="Product role in solar system"
            >
              {FLOW_ITEMS.map((item, index) => (
                <div className="pqvdFlowItem" key={item.key}>
                  <span
                    className={
                      activeKeys.includes(item.key) ? "active" : ""
                    }
                    title={item.label}
                  >
                    {item.icon}
                  </span>

                  {index < FLOW_ITEMS.length - 1 && (
                    <i aria-hidden="true">→</i>
                  )}
                </div>
              ))}
            </div>
          </div>

          <QuickPlanningTool
            product={product}
            profile={profile}
          />

          <div className="pqvdSection">
            <small>WHY THIS PRODUCT?</small>
            <p>{profile.why}</p>
          </div>

          <div className="pqvdActions">
            <Link href={`/products/${product.id}`}>
              View Product Details →
            </Link>

            <Link href={buildHref}>
              Use in My System →
            </Link>

            <Link className="secondary" href={askHref}>
              Ask About Product →
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
