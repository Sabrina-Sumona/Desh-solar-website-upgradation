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

type GoalType =
  | "reduce-cost"
  | "backup"
  | "solar-backup"
  | "maximize-solar"
  | "off-grid";

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

const GOAL_OPTIONS = [
  {
    value: "reduce-cost" as GoalType,
    label: "Cost Saving",
    icon: "↓",
  },
  {
    value: "backup" as GoalType,
    label: "Backup",
    icon: "▣",
  },
  {
    value: "solar-backup" as GoalType,
    label: "Solar + Backup",
    icon: "↯",
  },
  {
    value: "maximize-solar" as GoalType,
    label: "Max Solar",
    icon: "☀",
  },
  {
    value: "off-grid" as GoalType,
    label: "Off-Grid",
    icon: "◎",
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

  const [goal, setGoal] =
    useState<GoalType>("solar-backup");

  const [backup, setBackup] =
    useState<BackupType>("essential");

  const selectedProperty =
    PROPERTY_OPTIONS.find(
      (item) => item.value === property
    ) ?? PROPERTY_OPTIONS[0];

  const selectedGoal =
    GOAL_OPTIONS.find(
      (item) => item.value === goal
    ) ?? GOAL_OPTIONS[2];

  const selectedBackup =
    BACKUP_OPTIONS.find(
      (item) => item.value === backup
    ) ?? BACKUP_OPTIONS[1];

  function handleGoalSelect(
    nextGoal: GoalType
  ) {
    setGoal(nextGoal);

    if (
      nextGoal === "off-grid" &&
      backup === "none"
    ) {
      setBackup("extended");
    }
  }

  function handleBackupSelect(
    nextBackup: BackupType
  ) {
    if (
      goal === "off-grid" &&
      nextBackup === "none"
    ) {
      return;
    }

    setBackup(nextBackup);
  }

  const builderHref =
    `/build-your-system?property=${property}` +
    `&goal=${goal}` +
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

          {/* GOAL */}

          <div className="miniBuilderStep">
            <div className="miniBuilderStepHeader">
              <span>
                02
              </span>

              <div>
                <small>
                  GOAL
                </small>

                <strong>
                  Energy goal
                </strong>
              </div>
            </div>

            <div className="miniBuilderOptions miniBuilderGoalOptions">
              {GOAL_OPTIONS.map(
                (option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`miniBuilderOption ${
                      goal ===
                      option.value
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      handleGoalSelect(
                        option.value
                      )
                    }
                    aria-pressed={
                      goal ===
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
                    goal ===
                      "off-grid" &&
                    option.value ===
                      "none";

                  return (
                    <button
                      key={
                        option.value
                      }
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
                  selectedGoal.label
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