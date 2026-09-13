"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/data/products";
import {
  getProductPlanningProfile,
  parseEnergyKwh,
  parsePanelWatts,
  parseRatedKw,
} from "@/lib/products/productPlanning";

import styles from "./ProductPlanningPanel.module.css";

type ProductPlanningPanelProps = {
  product: Product;
  variant?: "quick" | "details";
};

export default function ProductPlanningPanel({
  product,
  variant = "details",
}: ProductPlanningPanelProps) {
  const profile = getProductPlanningProfile(product);

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

  const isDetails = variant === "details";

  return (
    <section
      className={`${styles.panel} ${
        isDetails ? styles.details : styles.quick
      }`}
    >
      {isDetails && (
        <div className={styles.sectionHeading}>
          <div>
            <span>DECISION SUPPORT</span>
            <h2>Why this product & quick planning.</h2>
          </div>

          <p>
            This uses the same product-selection logic shown in Quick View,
            so the full Product Details page always contains the complete
            decision-support information.
          </p>
        </div>
      )}

      <div className={styles.grid}>
        <article className={styles.whyCard}>
          <small>WHY THIS PRODUCT?</small>

          {isDetails && <h3>{profile.role}</h3>}

          <p>{profile.why}</p>

          {isDetails && (
            <div className={styles.tags}>
              {product.bestFor.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          )}
        </article>

        <article className={styles.toolCard}>
          <small>QUICK PLANNING TOOL</small>
          <h3>{heading}</h3>

          <div className={styles.tool}>
            <label>{planning.label}</label>

            {profile.tool !== "system" && (
              <input
                type="number"
                min={profile.tool === "panel" ? 0 : 50}
                value={value}
                onChange={(event) =>
                  setValue(
                    Math.max(0, Number(event.target.value) || 0)
                  )
                }
              />
            )}

            <strong>{planning.result}</strong>
            <span>{planning.note}</span>
          </div>
        </article>
      </div>
    </section>
  );
}
