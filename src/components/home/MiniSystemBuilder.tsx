"use client";

import Link from "next/link";
import { useState } from "react";

type PropertyType =
  | "home"
  | "business"
  | "factory"
  | "agriculture"
  | "filling-station"
  | "other";

type SystemType =
  | "on-grid"
  | "off-grid"
  | "hybrid";

const PROPERTY_OPTIONS = [
  {
    value: "home" as PropertyType,
    label: "Home",
    icon: "⌂",
  },
  {
    value: "business" as PropertyType,
    label: "Business",
    icon: "▤",
  },
  {
    value: "factory" as PropertyType,
    label: "Factory",
    icon: "▥",
  },
  {
    value: "agriculture" as PropertyType,
    label: "Agriculture",
    icon: "♧",
  },
  {
    value: "filling-station" as PropertyType,
    label: "Filling Station",
    icon: "⛽",
  },
  {
    value: "other" as PropertyType,
    label: "Other",
    icon: "◇",
  },
];

const SYSTEM_OPTIONS = [
  {
    value: "on-grid" as SystemType,
    label: "On-Grid",
    description: "Bill saving",
    icon: "↔",
  },
  {
    value: "off-grid" as SystemType,
    label: "Off-Grid",
    description: "Independent power",
    icon: "◎",
  },
  {
    value: "hybrid" as SystemType,
    label: "Hybrid",
    description: "Solar + backup",
    icon: "⚡",
  },
];

export default function MiniSystemBuilder() {
  const [property, setProperty] =
    useState<PropertyType>("home");

  const [systemType, setSystemType] =
    useState<SystemType>("hybrid");

  const builderHref =
    `/build-your-system?property=${property}` +
    `&systemType=${systemType}`;

  return (
    <section
      className="miniSystemBuilder"
      id="mini-system-builder"
    >
      <div className="miniSystemBuilderGlow" />

      <div className="miniSystemBuilderInner">
        {/* HEADER */}

        <div className="miniSystemBuilderHeader">
          <div>
            <div className="miniSystemBuilderEyebrow">
              Build Your System
            </div>

            <h2>
              Start your{" "}
              <span>
                solar plan.
              </span>
            </h2>
          </div>

          <p>
            Make two quick choices.
            We&apos;ll handle the details
            in the full system builder.
          </p>
        </div>

        {/* MAIN BUILDER */}

        <div className="miniBuilderSteps">
          {/* PROPERTY TYPE */}

          <div className="miniBuilderStep">
            <div className="miniBuilderStepHeader">
              <span>
                01
              </span>

              <div>
                <small>
                  PROPERTY
                </small>

                <strong>
                  Property type
                </strong>
              </div>
            </div>

            <div className="miniBuilderOptions miniBuilderPropertyOptions">
              {PROPERTY_OPTIONS.map(
                (option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`miniBuilderOption ${
                      property ===
                      option.value
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setProperty(
                        option.value
                      )
                    }
                    aria-pressed={
                      property ===
                      option.value
                    }
                  >
                    <span>
                      {option.icon}
                    </span>

                    <strong>
                      {option.label}
                    </strong>
                  </button>
                )
              )}
            </div>
          </div>

          {/* SYSTEM TYPE */}

          <div className="miniBuilderStep">
            <div className="miniBuilderStepHeader">
              <span>
                02
              </span>

              <div>
                <small>
                  SYSTEM
                </small>

                <strong>
                  System type
                </strong>
              </div>
            </div>

            <div className="miniBuilderOptions miniBuilderSystemOptions">
              {SYSTEM_OPTIONS.map(
                (option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`miniBuilderOption miniBuilderSystemOption ${
                      systemType ===
                      option.value
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setSystemType(
                        option.value
                      )
                    }
                    aria-pressed={
                      systemType ===
                      option.value
                    }
                  >
                    <span>
                      {option.icon}
                    </span>

                    <strong>
                      {option.label}
                    </strong>

                    <small>
                      {
                        option.description
                      }
                    </small>
                  </button>
                )
              )}
            </div>
          </div>

          {/* NEXT STEP */}

          <div className="miniBuilderStep miniBuilderContinueStep">
            <div className="miniBuilderStepHeader">
              <span>
                03
              </span>

              <div>
                <small>
                  NEXT STEP
                </small>

                <strong>
                  Build your system
                </strong>
              </div>
            </div>

            <div className="miniBuilderContinueContent">
              <div>
                <h3>
                  Ready for detailed
                  system planning?
                </h3>

                <p>
                  Continue with appliance
                  load, roof, battery,
                  system sizing and other
                  project details.
                </p>
              </div>

              <Link
                href={builderHref}
                className="miniBuilderContinue"
              >
                Continue to Build Your System

                <span>
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}