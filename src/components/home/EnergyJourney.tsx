"use client";

import { useState } from "react";

type EnergyNodeId =
  | "sun"
  | "panel"
  | "inverter"
  | "battery"
  | "loads";

type EnergyNode = {
  id: EnergyNodeId;
  step: string;
  icon: string;
  shortLabel: string;
  title: string;
  description: string;
  energy: string;
  role: string;
};

const ENERGY_NODES: EnergyNode[] = [
  {
    id: "sun",
    step: "01",
    icon: "☀",
    shortLabel: "Sun",
    title:
      "Solar energy begins with sunlight.",
    description:
      "Sunlight reaches the solar array and provides the renewable energy source that starts the entire system.",
    energy:
      "Solar Irradiance",
    role:
      "Primary Energy Source",
  },

  {
    id: "panel",
    step: "02",
    icon: "▦",
    shortLabel: "Solar Panel",
    title:
      "Solar panels convert sunlight into DC electricity.",
    description:
      "Photovoltaic modules capture sunlight and convert it into direct-current electrical energy that can be managed by the solar system.",
    energy:
      "DC Electricity",
    role:
      "Energy Generation",
  },

  {
    id: "inverter",
    step: "03",
    icon: "↯",
    shortLabel: "Inverter",
    title:
      "The inverter manages and converts the energy.",
    description:
      "The inverter converts solar DC power into usable AC electricity while coordinating energy between solar generation, battery storage and electrical loads.",
    energy:
      "DC → AC",
    role:
      "Energy Management",
  },

  {
    id: "battery",
    step: "04",
    icon: "▣",
    shortLabel: "Battery",
    title:
      "Battery storage keeps energy available for later.",
    description:
      "When the system produces surplus energy, the battery can store it. When additional power is required, stored energy flows back through the inverter before being supplied to connected loads.",
    energy:
      "Charge ↔ Discharge",
    role:
      "Energy Storage",
  },

  {
    id: "loads",
    step: "05",
    icon: "⌂",
    shortLabel: "Loads",
    title:
      "Usable electricity reaches everyday electrical loads.",
    description:
      "The inverter supplies usable AC electricity to lighting, fans, appliances, electronics, office equipment and other connected electrical loads.",
    energy:
      "AC Electricity",
    role:
      "Energy Consumption",
  },
];

export default function EnergyJourney() {
  const [activeNode, setActiveNode] =
    useState<EnergyNodeId>("sun");

  const selectedNode =
    ENERGY_NODES.find(
      (node) =>
        node.id === activeNode
    ) ?? ENERGY_NODES[0];

  return (
    <section
      className="energyJourney"
      id="energy-journey"
    >
      <div className="energyJourneyGlow energyJourneyGlowOne" />
      <div className="energyJourneyGlow energyJourneyGlowTwo" />

      <div className="energyJourneyInner">
        {/* ================================================
            SECTION HEADER
            ================================================ */}

        <div className="energyJourneyHeader">
          <div>
            <div className="energyJourneyEyebrow">
              Interactive Solar Energy Journey
            </div>

            <h2>
              See how energy moves
              <br />
              through the{" "}
              <span>
                system.
              </span>
            </h2>
          </div>

          <p>
            Select any stage to understand
            its role in a complete solar
            energy system—from sunlight
            and generation to storage and
            everyday electricity use.
          </p>
        </div>

        {/* ================================================
            MAIN SYSTEM + INFORMATION
            ================================================ */}

        <div className="energySystemShell">
          {/* ==============================================
              MAIN SYSTEM DIAGRAM
              ============================================== */}

          <div className="energySystemDiagram">
            {/* SUN */}

            <button
              type="button"
              className={`energyNode energyNodeSun ${
                activeNode === "sun"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveNode("sun")
              }
              aria-pressed={
                activeNode === "sun"
              }
            >
              <span className="energyNodeStep">
                01
              </span>

              <span className="energyNodeIcon">
                ☀
              </span>

              <strong>
                Sun
              </strong>

              <small>
                Renewable source
              </small>
            </button>

            {/* SUN → PANEL */}

            <div className="energyConnector">
              <span className="energyConnectorLine" />

              <span className="energyPulse" />

              <b>
                LIGHT
              </b>
            </div>

            {/* PANEL */}

            <button
              type="button"
              className={`energyNode ${
                activeNode === "panel"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveNode(
                  "panel"
                )
              }
              aria-pressed={
                activeNode === "panel"
              }
            >
              <span className="energyNodeStep">
                02
              </span>

              <span className="energyNodeIcon energyPanelIcon">
                ▦
              </span>

              <strong>
                Solar Panel
              </strong>

              <small>
                DC generation
              </small>
            </button>

            {/* PANEL → INVERTER */}

            <div className="energyConnector">
              <span className="energyConnectorLine" />

              <span className="energyPulse" />

              <b>
                DC
              </b>
            </div>

            {/* INVERTER */}

            <button
              type="button"
              className={`energyNode energyNodeInverter ${
                activeNode ===
                "inverter"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveNode(
                  "inverter"
                )
              }
              aria-pressed={
                activeNode ===
                "inverter"
              }
            >
              <span className="energyNodeStep">
                03
              </span>

              <span className="energyNodeIcon">
                ↯
              </span>

              <strong>
                Inverter
              </strong>

              <small>
                Convert + manage
              </small>
            </button>

            {/* INVERTER → LOADS */}

            <div className="energyConnector energyConnectorAC">
              <span className="energyConnectorLine" />

              <span className="energyPulse" />

              <b>
                AC
              </b>
            </div>

            {/* LOADS */}

            <button
              type="button"
              className={`energyNode ${
                activeNode === "loads"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveNode(
                  "loads"
                )
              }
              aria-pressed={
                activeNode === "loads"
              }
            >
              <span className="energyNodeStep">
                05
              </span>

              <span className="energyNodeIcon">
                ⌂
              </span>

              <strong>
                Loads
              </strong>

              <small>
                Everyday energy
              </small>
            </button>

            {/* ============================================
                INVERTER ↕ BATTERY
                ============================================ */}

            <div className="energyBatteryBranch">
              <div className="batteryVerticalLine">
                <span className="batteryPulse batteryPulseDown" />

                <span className="batteryPulse batteryPulseUp" />
              </div>

              <div className="batteryFlowLabel">
                CHARGE ↕ DISCHARGE
              </div>

              <button
                type="button"
                className={`energyNode energyBatteryNode ${
                  activeNode ===
                  "battery"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setActiveNode(
                    "battery"
                  )
                }
                aria-pressed={
                  activeNode ===
                  "battery"
                }
              >
                <span className="energyNodeStep">
                  04
                </span>

                <span className="energyNodeIcon">
                  ▣
                </span>

                <strong>
                  Battery
                </strong>

                <small>
                  Energy storage
                </small>
              </button>
            </div>
          </div>

          {/* ==============================================
              DYNAMIC INFORMATION PANEL
              ============================================== */}

          <div
            className="energyInfoPanel"
            key={
              selectedNode.id
            }
          >
            <div className="energyInfoTop">
              <div>
                <span className="energyInfoStep">
                  STEP{" "}
                  {
                    selectedNode.step
                  }
                </span>

                <span className="energyInfoCategory">
                  {
                    selectedNode.shortLabel
                  }
                </span>
              </div>

              <span className="energyInfoIcon">
                {
                  selectedNode.icon
                }
              </span>
            </div>

            <h3>
              {
                selectedNode.title
              }
            </h3>

            <p>
              {
                selectedNode.description
              }
            </p>

            <div className="energyInfoStats">
              <div>
                <small>
                  ENERGY STATE
                </small>

                <strong>
                  {
                    selectedNode.energy
                  }
                </strong>
              </div>

              <div>
                <small>
                  SYSTEM ROLE
                </small>

                <strong>
                  {
                    selectedNode.role
                  }
                </strong>
              </div>
            </div>

            <div className="energyInfoHint">
              <span />

              Select another system
              component to continue
              exploring.
            </div>
          </div>
        </div>

        {/* ================================================
            MINI SYSTEM SUMMARY

            Same architecture as above:

            Sun → Panel → Inverter → Loads
                            ↕
                         Battery
            ================================================ */}

        <div className="energyJourneySummary">
          <div className="energySummaryMainFlow">
            {/* GENERATION */}

            <div className="energySummaryItem">
              <small>
                GENERATION
              </small>

              <strong>
                Sun → Panel
              </strong>
            </div>

            <span className="energySummaryArrow">
              →
            </span>

            {/* MANAGEMENT / INVERTER */}

            <div className="energySummaryItem energySummaryInverter">
              <small>
                MANAGEMENT
              </small>

              <strong>
                Inverter
              </strong>

              {/* Battery branch */}

              <div className="energySummaryBatteryBranch">
                <span className="energySummaryVerticalArrow">
                  ↕
                </span>

                <div className="energySummaryBattery">
                  <small>
                    STORAGE
                  </small>

                  <strong>
                    Battery
                  </strong>
                </div>
              </div>
            </div>

            <span className="energySummaryArrow">
              →
            </span>

            {/* LOADS */}

            <div className="energySummaryItem">
              <small>
                CONSUMPTION
              </small>

              <strong>
                Loads
              </strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}