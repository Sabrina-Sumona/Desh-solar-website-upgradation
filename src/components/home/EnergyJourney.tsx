"use client";

import { useMemo, useState } from "react";

type StepKey =
  | "sun"
  | "panel"
  | "inverter"
  | "battery"
  | "loads";

type StepItem = {
  key: StepKey;
  step: string;
  short: string;
  title: string;
  headline: string;
  description: string;
  energyState: string;
  systemRole: string;
  icon: string;
};

const STEPS: StepItem[] = [
  {
    key: "sun",
    step: "STEP 01",
    short: "Sun",
    title: "Sun",
    headline:
      "Solar energy begins with sunlight.",
    description:
      "Sunlight reaches the solar array and provides the renewable energy source that starts the entire system.",
    energyState: "Solar Irradiance",
    systemRole: "Primary Energy Source",
    icon: "☀",
  },
  {
    key: "panel",
    step: "STEP 02",
    short: "Solar Panel",
    title: "Solar Panel",
    headline:
      "The solar panel captures energy.",
    description:
      "Solar panels collect sunlight and convert it into DC electrical energy that can move into the rest of the system.",
    energyState: "DC Generation",
    systemRole: "Energy Capture",
    icon: "▦",
  },
  {
    key: "inverter",
    step: "STEP 03",
    short: "Inverter",
    title: "Inverter",
    headline:
      "The inverter manages and converts the energy.",
    description:
      "The inverter converts solar DC power into usable AC electricity while coordinating energy between solar generation, battery storage and electrical loads.",
    energyState: "DC → AC",
    systemRole: "Energy Management",
    icon: "↯",
  },
  {
    key: "battery",
    step: "STEP 04",
    short: "Battery",
    title: "Battery",
    headline:
      "The battery stores energy for later use.",
    description:
      "Battery storage keeps available power for backup or later consumption when solar production is low or when additional support is needed.",
    energyState: "Stored Energy",
    systemRole: "Backup / Storage",
    icon: "▣",
  },
  {
    key: "loads",
    step: "STEP 05",
    short: "Loads",
    title: "Loads",
    headline:
      "The loads use the electricity.",
    description:
      "Lights, fans, appliances and other devices receive usable electricity from the system for everyday operation.",
    energyState: "AC Consumption",
    systemRole: "End Use",
    icon: "⌂",
  },
];

export default function EnergyJourney() {
  const [activeKey, setActiveKey] =
    useState<StepKey>("sun");

  const activeStep = useMemo(
    () =>
      STEPS.find(
        (item) =>
          item.key === activeKey
      ) ?? STEPS[0],
    [activeKey]
  );

  return (
    <section className="systemTechSection">
      {/* =====================================================
          SECTION HEADER
          ===================================================== */}

      <div className="systemTechHeader">
        <div className="systemTechHeaderLeft">
          <div className="systemTechKicker">
            INTERACTIVE SOLAR ENERGY JOURNEY
          </div>

          <h2 className="systemTechTitle">
            See how energy moves
            <br />
            through the{" "}
            <span>system.</span>
          </h2>
        </div>

        <div className="systemTechHeaderRight">
          Select any stage to understand
          its role in a complete solar
          energy system—from sunlight and
          generation to storage and
          everyday electricity use.
        </div>
      </div>

      {/* =====================================================
          MAIN LAYOUT
          ===================================================== */}

      <div className="systemTechLayout">
        {/* ===================================================
            LEFT — ENERGY FLOW
            =================================================== */}

        <div className="systemTechVisualizer">
          <div className="systemTechFlowGrid">
            {/* ===============================================
                SUN
                =============================================== */}

            <button
              type="button"
              aria-pressed={
                activeKey === "sun"
              }
              className={`systemNode nodeSun ${
                activeKey === "sun"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveKey("sun")
              }
            >
              <span className="systemNodeStep">
                01
              </span>

              <span className="systemNodeIcon systemNodeIconSun">
                ☀
              </span>

              <span className="systemNodeTitle">
                Sun
              </span>

              <span className="systemNodeText">
                Renewable source
              </span>
            </button>

            {/* ===============================================
                SUN → PANEL
                =============================================== */}

            <div className="flowLine lineSunPanel">
              <span className="flowTrack" />

              <span className="flowDot dotLight" />

              <span className="flowLabel labelLight">
                LIGHT
              </span>
            </div>

            {/* ===============================================
                SOLAR PANEL
                =============================================== */}

            <button
              type="button"
              aria-pressed={
                activeKey === "panel"
              }
              className={`systemNode nodePanel ${
                activeKey === "panel"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveKey("panel")
              }
            >
              <span className="systemNodeStep">
                02
              </span>

              <span className="systemNodeIcon systemNodeIconPanel">
                ▦
              </span>

              <span className="systemNodeTitle">
                Solar Panel
              </span>

              <span className="systemNodeText">
                DC generation
              </span>
            </button>

            {/* ===============================================
                PANEL → INVERTER
                =============================================== */}

            <div className="flowLine linePanelInverter">
              <span className="flowTrack" />

              <span className="flowDot dotDc" />

              <span className="flowLabel labelDc">
                DC
              </span>
            </div>

            {/* ===============================================
                INVERTER + BATTERY COLUMN
                =============================================== */}

            <div className="systemTechInverterColumn">
              <button
                type="button"
                aria-pressed={
                  activeKey === "inverter"
                }
                className={`systemNode nodeInverter ${
                  activeKey === "inverter"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setActiveKey(
                    "inverter"
                  )
                }
              >
                <span className="systemNodeStep">
                  03
                </span>

                <span className="systemNodeIcon systemNodeIconInverter">
                  ↯
                </span>

                <span className="systemNodeTitle">
                  Inverter
                </span>

                <span className="systemNodeText">
                  Convert + manage
                </span>
              </button>

              {/* =============================================
                  INVERTER ↕ BATTERY

                  Dot A:
                  Inverter → Battery

                  Dot B:
                  Battery → Inverter

                  CSS timing makes them alternate.
                  ============================================= */}

              <div className="flowLineVertical lineInverterBattery">
                <span className="flowTrackVertical" />

                <span
                  className="flowDotVertical flowDotDown"
                  aria-hidden="true"
                />

                <span
                  className="flowDotVertical flowDotUp"
                  aria-hidden="true"
                />

                <span className="flowLabelVertical">
                  CHARGE &amp; DISCHARGE
                </span>
              </div>

              {/* =============================================
                  BATTERY
                  ============================================= */}

              <button
                type="button"
                aria-pressed={
                  activeKey === "battery"
                }
                className={`systemNode nodeBattery ${
                  activeKey === "battery"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setActiveKey(
                    "battery"
                  )
                }
              >
                <span className="systemNodeStep">
                  04
                </span>

                <span className="systemNodeIcon systemNodeIconBattery">
                  ▣
                </span>

                <span className="systemNodeTitle">
                  Battery
                </span>

                <span className="systemNodeText">
                  Energy storage
                </span>
              </button>
            </div>

            {/* ===============================================
                INVERTER → LOADS
                =============================================== */}

            <div className="flowLine lineInverterLoads">
              <span className="flowTrack" />

              <span className="flowDot dotAc" />

              <span className="flowLabel labelAc">
                AC
              </span>
            </div>

            {/* ===============================================
                LOADS
                =============================================== */}

            <button
              type="button"
              aria-pressed={
                activeKey === "loads"
              }
              className={`systemNode nodeLoads ${
                activeKey === "loads"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveKey("loads")
              }
            >
              <span className="systemNodeStep">
                05
              </span>

              <span className="systemNodeIcon systemNodeIconLoads">
                ⌂
              </span>

              <span className="systemNodeTitle">
                Loads
              </span>

              <span className="systemNodeText">
                Everyday energy
              </span>
            </button>
          </div>
        </div>

        {/* ===================================================
            RIGHT — DETAILS
            =================================================== */}

        <aside
          className="systemTechDetails"
          aria-live="polite"
        >
          <div>
            <div className="systemTechDetailsTop">
              <div>
                <div className="detailsStep">
                  {activeStep.step}
                </div>

                <div className="detailsSub">
                  {activeStep.short}
                </div>
              </div>

              <div
                className="detailsIcon"
                aria-hidden="true"
              >
                {activeStep.icon}
              </div>
            </div>

            <h3 className="detailsHeadline">
              {activeStep.headline}
            </h3>

            <p className="detailsDescription">
              {activeStep.description}
            </p>
          </div>

          <div className="systemTechDetailsBottom">
            <div className="detailsMetaGrid">
              <div className="detailsMetaCard">
                <div className="detailsMetaLabel">
                  ENERGY STATE
                </div>

                <div className="detailsMetaValue">
                  {
                    activeStep.energyState
                  }
                </div>
              </div>

              <div className="detailsMetaCard">
                <div className="detailsMetaLabel">
                  SYSTEM ROLE
                </div>

                <div className="detailsMetaValue">
                  {
                    activeStep.systemRole
                  }
                </div>
              </div>
            </div>

            <div className="detailsHint">
              <span className="detailsHintLine" />

              <span>
                Select another system
                component to continue
                exploring.
              </span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}