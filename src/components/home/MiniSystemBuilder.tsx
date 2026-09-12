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

type BackupType =
  | "none"
  | "essential"
  | "partial"
  | "extended"
  | "unsure";

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

const BACKUP_OPTIONS = [
  {
    value: "none" as BackupType,
    label: "None",
  },
  {
    value: "essential" as BackupType,
    label: "Essential",
  },
  {
    value: "partial" as BackupType,
    label: "Partial",
  },
  {
    value: "extended" as BackupType,
    label: "Extended",
  },
  {
    value: "unsure" as BackupType,
    label: "Not Sure",
  },
];

export default function MiniSystemBuilder() {
  const [property, setProperty] =
    useState<PropertyType>("home");

  const [systemType, setSystemType] =
    useState<SystemType>("hybrid");

  const [backup, setBackup] =
    useState<BackupType>("essential");

  const selectedProperty =
    PROPERTY_OPTIONS.find(
      (item) => item.value === property
    ) ?? PROPERTY_OPTIONS[0];

  const selectedSystem =
    SYSTEM_OPTIONS.find(
      (item) => item.value === systemType
    ) ?? SYSTEM_OPTIONS[2];

  const selectedBackup =
    BACKUP_OPTIONS.find(
      (item) => item.value === backup
    ) ?? BACKUP_OPTIONS[1];

  function handleSystemSelect(
    nextSystem: SystemType
  ) {
    setSystemType(nextSystem);

    /*
     * Standard on-grid systems do not use
     * battery backup.
     */
    if (nextSystem === "on-grid") {
      setBackup("none");
      return;
    }

    /*
     * Off-grid and hybrid systems require
     * battery/storage planning.
     *
     * If the previous selection was "None",
     * move to Essential as the starting point.
     */
    if (
      nextSystem === "off-grid" ||
      nextSystem === "hybrid"
    ) {
      if (backup === "none") {
        setBackup("essential");
      }
    }
  }

  function handleBackupSelect(
    nextBackup: BackupType
  ) {
    /*
     * On-grid:
     * backup is not part of this system type.
     */
    if (systemType === "on-grid") {
      if (nextBackup !== "none") {
        return;
      }
    }

    /*
     * Off-grid and hybrid:
     * battery backup is part of the system,
     * so "None" is not available.
     */
    if (
      (systemType === "off-grid" ||
        systemType === "hybrid") &&
      nextBackup === "none"
    ) {
      return;
    }

    setBackup(nextBackup);
  }

  const backupHint =
    systemType === "on-grid"
      ? "On-grid systems focus on bill saving and normally do not provide battery backup during a grid outage."
      : systemType === "off-grid"
        ? "Off-grid systems operate independently from the utility grid and require battery storage."
        : "Hybrid systems combine solar, battery storage and grid support for savings plus backup.";

  const builderHref =
    `/build-your-system?property=${property}` +
    `&systemType=${systemType}` +
    `&backup=${backup}`;

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
            Make three quick choices.
            We&apos;ll handle the details
            in the full system builder.
          </p>
        </div>

        {/* OPTIONS */}

        <div className="miniBuilderSteps">
          {/* PROPERTY */}

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
                      handleSystemSelect(
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

          {/* BACKUP */}

          <div className="miniBuilderStep">
            <div className="miniBuilderStepHeader">
              <span>
                03
              </span>

              <div>
                <small>
                  BACKUP
                </small>

                <strong>
                  Backup level
                </strong>
              </div>
            </div>

            <div className="miniBuilderOptions miniBuilderBackupOptions">
              {BACKUP_OPTIONS.map(
                (option) => {
                  const disabled =
                    systemType ===
                    "on-grid"
                      ? option.value !==
                        "none"
                      : option.value ===
                        "none";

                  return (
                    <button
                      key={option.value}
                      type="button"
                      disabled={
                        disabled
                      }
                      className={`miniBuilderOption miniBuilderTextOption ${
                        backup ===
                        option.value
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        handleBackupSelect(
                          option.value
                        )
                      }
                      aria-pressed={
                        backup ===
                        option.value
                      }
                    >
                      <strong>
                        {
                          option.label
                        }
                      </strong>
                    </button>
                  );
                }
              )}
            </div>

            <p className="miniBuilderBackupHint">
              {backupHint}
            </p>
          </div>
        </div>

        {/* RESULT / CTA */}

        <div className="miniBuilderFooter">
          <div className="miniBuilderSelection">
            <small>
              YOUR STARTING POINT
            </small>

            <div>
              <span>
                {
                  selectedProperty.label
                }
              </span>

              <b>
                →
              </b>

              <span>
                {
                  selectedSystem.label
                }
              </span>

              <b>
                →
              </b>

              <span>
                {selectedBackup.label}
              </span>
            </div>
          </div>

          <div className="miniBuilderAction">
            <p>
              Detailed load, appliance,
              roof, backup and system
              sizing continues in the full
              builder.
            </p>

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
    </section>
  );
}