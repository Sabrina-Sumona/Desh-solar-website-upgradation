"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type PropertyType =
  | "home"
  | "business"
  | "factory"
  | "agriculture"
  | "filling-station"
  | "other";

const PROPERTY_OPTIONS: {
  value: PropertyType;
  label: string;
  icon: string;
  description: string;
}[] = [
  {
    value: "home",
    label: "Home",
    icon: "⌂",
    description:
      "Residential rooftop solar and backup planning.",
  },
  {
    value: "business",
    label: "Business",
    icon: "▤",
    description:
      "Office, retail and commercial energy requirements.",
  },
  {
    value: "factory",
    label: "Factory",
    icon: "▥",
    description:
      "Industrial loads and larger system planning.",
  },
  {
    value: "agriculture",
    label: "Agriculture",
    icon: "♧",
    description:
      "Irrigation, pumps and farm energy requirements.",
  },
  {
    value: "filling-station",
    label: "Filling Station",
    icon: "⛽",
    description:
      "Station operations, lighting and backup loads.",
  },
  {
    value: "other",
    label: "Other",
    icon: "◇",
    description:
      "Mixed or specialized energy requirements.",
  },
];

const BACKUP_OPTIONS = [
  {
    value: "0",
    label: "No Backup",
    description:
      "Mainly reduce electricity use from the grid.",
  },
  {
    value: "2",
    label: "2 Hours",
    description:
      "Short backup for essential loads.",
  },
  {
    value: "4",
    label: "4 Hours",
    description:
      "Balanced backup for common requirements.",
  },
  {
    value: "8",
    label: "8+ Hours",
    description:
      "Extended backup and greater battery storage.",
  },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-BD", {
    maximumFractionDigits: 0,
  }).format(value);
}

export default function MiniSystemBuilder() {
  const [property, setProperty] =
    useState<PropertyType>("home");

  const [monthlyBill, setMonthlyBill] =
    useState(5000);

  const [backupHours, setBackupHours] =
    useState("4");

  const selectedProperty =
    PROPERTY_OPTIONS.find(
      (item) => item.value === property
    ) ?? PROPERTY_OPTIONS[0];

  /*
   * Homepage-only planning preview.
   *
   * This is intentionally a simple
   * educational estimate.
   *
   * The final 7-step builder will use
   * appliance/load, roof, backup and
   * electricity information in much
   * greater detail.
   */
  const preview = useMemo(() => {
    const assumedTariff = 12;

    const monthlyUnits =
      monthlyBill / assumedTariff;

    const dailyUnits =
      monthlyUnits / 30;

    const targetOffset = 0.8;

    const requiredDailySolar =
      dailyUnits * targetOffset;

    const peakSunHours = 4.5;

    const systemEfficiency = 0.82;

    const estimatedPv =
      requiredDailySolar /
      (peakSunHours * systemEfficiency);

    const pvKw = Math.max(
      1,
      Math.round(estimatedPv * 10) / 10
    );

    const panelCount = Math.max(
      2,
      Math.ceil((pvKw * 1000) / 590)
    );

    let backupClass = "No battery selected";

    if (backupHours === "2") {
      backupClass = "Light battery backup";
    }

    if (backupHours === "4") {
      backupClass = "Balanced battery backup";
    }

    if (backupHours === "8") {
      backupClass = "Extended battery backup";
    }

    return {
      monthlyUnits: Math.round(monthlyUnits),
      dailyUnits:
        Math.round(dailyUnits * 10) / 10,
      pvKw,
      panelCount,
      backupClass,
    };
  }, [monthlyBill, backupHours]);

  const builderHref =
    `/build-your-system?property=${property}` +
    `&bill=${monthlyBill}` +
    `&backup=${backupHours}`;

  return (
    <section
      className="miniSystemBuilder"
      id="mini-system-builder"
    >
      <div className="miniSystemBuilderGlow miniSystemBuilderGlowOne" />

      <div className="miniSystemBuilderGlow miniSystemBuilderGlowTwo" />

      <div className="miniSystemBuilderInner">
        {/* ================================================
            HEADER
            ================================================ */}

        <div className="miniSystemBuilderHeader">
          <div>
            <div className="miniSystemBuilderEyebrow">
              Start Planning Your System
            </div>

            <h2>
              A few details.
              <br />
              <span>
                A smarter starting point.
              </span>
            </h2>
          </div>

          <div className="miniSystemBuilderHeaderCopy">
            <p>
              Start with a few basic details and we&apos;ll
              carry them into the complete Desh Solar
              system-planning experience.
            </p>

            <small>
              QUICK PLANNING PREVIEW — FINAL SYSTEM DESIGN
              REQUIRES DETAILED LOAD AND SITE INFORMATION.
            </small>
          </div>
        </div>

        {/* ================================================
            BUILDER
            ================================================ */}

        <div className="miniSystemBuilderShell">
          {/* LEFT SIDE */}

          <div className="miniSystemBuilderForm">
            {/* --------------------------------------------
                PROPERTY
                -------------------------------------------- */}

            <div className="miniBuilderSection">
              <div className="miniBuilderSectionTop">
                <div>
                  <span>01</span>

                  <div>
                    <small>
                      PROPERTY
                    </small>

                    <strong>
                      What are we planning for?
                    </strong>
                  </div>
                </div>
              </div>

              <div className="miniPropertyGrid">
                {PROPERTY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`miniPropertyOption ${
                      property === option.value
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setProperty(option.value)
                    }
                    aria-pressed={
                      property === option.value
                    }
                  >
                    <span>
                      {option.icon}
                    </span>

                    <strong>
                      {option.label}
                    </strong>
                  </button>
                ))}
              </div>

              <p className="miniBuilderSelectionDescription">
                {selectedProperty.description}
              </p>
            </div>

            {/* --------------------------------------------
                MONTHLY BILL
                -------------------------------------------- */}

            <div className="miniBuilderSection">
              <div className="miniBuilderSectionTop">
                <div>
                  <span>02</span>

                  <div>
                    <small>
                      ELECTRICITY
                    </small>

                    <strong>
                      Approximate monthly electricity bill
                    </strong>
                  </div>
                </div>

                <b>
                  ৳{formatCurrency(monthlyBill)}
                </b>
              </div>

              <input
                className="miniBuilderRange"
                type="range"
                min="1000"
                max="100000"
                step="500"
                value={monthlyBill}
                aria-label="Approximate monthly electricity bill"
                onChange={(event) =>
                  setMonthlyBill(
                    Number(event.target.value)
                  )
                }
              />

              <div className="miniBuilderRangeLabels">
                <span>
                  ৳1,000
                </span>

                <span>
                  ৳25,000
                </span>

                <span>
                  ৳50,000
                </span>

                <span>
                  ৳100,000+
                </span>
              </div>
            </div>

            {/* --------------------------------------------
                BACKUP
                -------------------------------------------- */}

            <div className="miniBuilderSection">
              <div className="miniBuilderSectionTop">
                <div>
                  <span>03</span>

                  <div>
                    <small>
                      BACKUP
                    </small>

                    <strong>
                      How much backup would you like?
                    </strong>
                  </div>
                </div>
              </div>

              <div className="miniBackupGrid">
                {BACKUP_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`miniBackupOption ${
                      backupHours === option.value
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setBackupHours(option.value)
                    }
                    aria-pressed={
                      backupHours === option.value
                    }
                  >
                    <strong>
                      {option.label}
                    </strong>

                    <small>
                      {option.description}
                    </small>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ==============================================
              RIGHT SIDE — PLANNING PREVIEW
              ============================================== */}

          <aside className="miniSystemPreview">
            <div className="miniSystemPreviewTop">
              <div>
                <small>
                  QUICK SYSTEM PREVIEW
                </small>

                <h3>
                  {selectedProperty.label}
                  <br />
                  <span>
                    planning snapshot
                  </span>
                </h3>
              </div>

              <span className="miniSystemPreviewIcon">
                {selectedProperty.icon}
              </span>
            </div>

            <p className="miniSystemPreviewLead">
              Based on the basic information entered above,
              this gives you an initial direction before the
              detailed 7-step system builder.
            </p>

            <div className="miniSystemPreviewMetrics">
              <div>
                <small>
                  EST. MONTHLY USE
                </small>

                <strong>
                  {preview.monthlyUnits}
                  <em>
                    kWh
                  </em>
                </strong>
              </div>

              <div>
                <small>
                  EST. DAILY USE
                </small>

                <strong>
                  {preview.dailyUnits}
                  <em>
                    kWh
                  </em>
                </strong>
              </div>

              <div>
                <small>
                  STARTING PV RANGE
                </small>

                <strong>
                  {preview.pvKw}
                  <em>
                    kW
                  </em>
                </strong>
              </div>

              <div>
                <small>
                  590W PANEL EQUIVALENT
                </small>

                <strong>
                  {preview.panelCount}
                  <em>
                    panels
                  </em>
                </strong>
              </div>
            </div>

            <div className="miniSystemPreviewBackup">
              <small>
                BACKUP DIRECTION
              </small>

              <strong>
                {preview.backupClass}
              </strong>
            </div>

            <div className="miniSystemPreviewFlow">
              <div>
                <span>
                  Property
                </span>

                <b>
                  →
                </b>

                <span>
                  Load
                </span>

                <b>
                  →
                </b>

                <span>
                  Solar
                </span>

                {backupHours !== "0" && (
                  <>
                    <b>
                      +
                    </b>

                    <span>
                      Battery
                    </span>
                  </>
                )}
              </div>
            </div>

            <Link
              href={builderHref}
              className="miniSystemBuilderContinue"
            >
              Continue to Full System Builder
              <span>
                →
              </span>
            </Link>

            <div className="miniSystemBuilderDisclaimer">
              <span />

              This homepage preview uses simplified assumptions
              only. Final system sizing depends on actual
              appliances, running load, startup surge, backup
              requirement, roof conditions, electricity use and
              technical review.
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}