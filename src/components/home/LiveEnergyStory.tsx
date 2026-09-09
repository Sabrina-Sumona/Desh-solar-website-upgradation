"use client";

import { useMemo, useState } from "react";

type FlowState =
  | "solar"
  | "battery-charge"
  | "battery-discharge"
  | "grid-import"
  | "grid-export";

type Simulation = {
  hour: number;
  solar: number;
  load: number;
  batteryPower: number;
  batterySoc: number;
  grid: number;
  flowStates: FlowState[];
  headline: string;
  description: string;
};

const clamp = (
  value: number,
  min: number,
  max: number
) => Math.max(min, Math.min(max, value));

const round1 = (value: number) =>
  Math.round(value * 10) / 10;

function gaussian(
  hour: number,
  center: number,
  width: number,
  amplitude: number
) {
  return (
    amplitude *
    Math.exp(
      -Math.pow(hour - center, 2) /
        (2 * Math.pow(width, 2))
    )
  );
}

function getSolarPower(hour: number) {
  if (hour < 6 || hour > 18) {
    return 0;
  }

  const normalized = Math.sin(
    ((hour - 6) / 12) * Math.PI
  );

  return round1(
    Math.max(0, normalized * 5.8)
  );
}

function getLoadPower(hour: number) {
  const baseLoad = 0.9;

  const morning = gaussian(
    hour,
    8,
    1.5,
    0.9
  );

  const daytime = gaussian(
    hour,
    13,
    3.3,
    0.45
  );

  const evening = gaussian(
    hour,
    20,
    2,
    2.1
  );

  return round1(
    baseLoad +
      morning +
      daytime +
      evening
  );
}

function getBatterySoc(hour: number) {
  if (hour < 6) {
    return 42;
  }

  if (hour < 10) {
    return Math.round(
      42 + ((hour - 6) / 4) * 25
    );
  }

  if (hour < 15) {
    return Math.round(
      67 + ((hour - 10) / 5) * 27
    );
  }

  if (hour < 18) {
    return Math.round(
      94 - ((hour - 15) / 3) * 5
    );
  }

  if (hour < 23) {
    return Math.round(
      89 - ((hour - 18) / 5) * 42
    );
  }

  return 47;
}

function getSimulation(
  hour: number
): Simulation {
  const solar = getSolarPower(hour);
  const load = getLoadPower(hour);
  const batterySoc = getBatterySoc(hour);
  const balance = solar - load;

  let batteryPower = 0;
  let grid = 0;

  const flowStates: FlowState[] = [];

  if (solar > 0.05) {
    flowStates.push("solar");
  }

  if (balance > 0) {
    if (batterySoc < 95) {
      batteryPower = Math.min(
        balance,
        2.8
      );

      flowStates.push(
        "battery-charge"
      );
    }

    const remaining =
      balance - batteryPower;

    if (remaining > 0.05) {
      grid = -remaining;
      flowStates.push(
        "grid-export"
      );
    }
  }

  if (balance < 0) {
    const deficit = Math.abs(balance);

    if (batterySoc > 22) {
      batteryPower = -Math.min(
        deficit,
        2.5
      );

      flowStates.push(
        "battery-discharge"
      );
    }

    const remaining =
      deficit -
      Math.abs(batteryPower);

    if (remaining > 0.05) {
      grid = remaining;
      flowStates.push(
        "grid-import"
      );
    }
  }

  let headline =
    "Solar energy is powering the home.";

  let description =
    "Solar generation is supplying the connected electrical loads.";

  if (
    flowStates.includes(
      "battery-charge"
    ) &&
    flowStates.includes(
      "grid-export"
    )
  ) {
    headline =
      "Solar is powering the home, charging the battery and exporting surplus.";

    description =
      "Generation is higher than the current load. Part of the surplus charges the battery while remaining energy can flow toward the grid.";
  } else if (
    flowStates.includes(
      "battery-charge"
    )
  ) {
    headline =
      "Solar is powering the home and charging the battery.";

    description =
      "Available solar generation exceeds the current electrical load, allowing surplus energy to charge the battery.";
  } else if (
    flowStates.includes(
      "battery-discharge"
    ) &&
    !flowStates.includes(
      "grid-import"
    )
  ) {
    headline =
      "Stored battery energy is supporting the home.";

    description =
      "Solar generation is low or unavailable, so stored battery energy flows back through the inverter to support the electrical loads.";
  } else if (
    flowStates.includes(
      "battery-discharge"
    ) &&
    flowStates.includes(
      "grid-import"
    )
  ) {
    headline =
      "Battery and grid are supporting the home together.";

    description =
      "The battery contributes stored energy while the grid supplies the remaining load requirement.";
  } else if (
    flowStates.includes(
      "grid-import"
    )
  ) {
    headline =
      "The grid is supplying the current electrical demand.";

    description =
      "Solar generation is unavailable or insufficient, so electricity is being imported from the grid.";
  } else if (
    flowStates.includes(
      "grid-export"
    )
  ) {
    headline =
      "Surplus solar energy is flowing toward the grid.";

    description =
      "Solar generation is higher than the immediate system requirement, allowing excess energy to flow outward.";
  }

  return {
    hour,
    solar: round1(solar),
    load: round1(load),
    batteryPower: round1(
      batteryPower
    ),
    batterySoc,
    grid: round1(grid),
    flowStates,
    headline,
    description,
  };
}

function formatTime(value: number) {
  const totalMinutes = Math.round(
    value * 60
  );

  const minutesPerDay =
    24 * 60;

  const normalizedMinutes =
    ((totalMinutes % minutesPerDay) +
      minutesPerDay) %
    minutesPerDay;

  const hour24 = Math.floor(
    normalizedMinutes / 60
  );
  const minute =
    normalizedMinutes % 60;

  const period =
    hour24 >= 12 ? "PM" : "AM";

  const hour12 =
    hour24 % 12 === 0
      ? 12
      : hour24 % 12;

  return `${hour12}:${String(
    minute
  ).padStart(2, "0")} ${period}`;
}

function getDayPhase(hour: number) {
  if (hour >= 7 && hour < 17) {
    return "day";
  }

  if (
    (hour >= 5 && hour < 7) ||
    (hour >= 17 && hour < 19)
  ) {
    return "twilight";
  }

  return "night";
}

export default function LiveEnergyStory() {
  const [hour, setHour] =
    useState(13);

  const simulation = useMemo(
    () => getSimulation(hour),
    [hour]
  );

  const phase = getDayPhase(hour);

  const isDay =
    hour >= 6 && hour <= 18;

  const sunProgress = clamp(
    (hour - 6) / 12,
    0,
    1
  );

  const celestialX =
    10 + sunProgress * 80;

  const celestialY =
    32 -
    Math.sin(
      sunProgress * Math.PI
    ) *
      21;

  const hasFlow = (
    flow: FlowState
  ) =>
    simulation.flowStates.includes(
      flow
    );

  const batteryLabel =
    simulation.batteryPower > 0
      ? `Charging ${Math.abs(
          simulation.batteryPower
        ).toFixed(1)} kW`
      : simulation.batteryPower < 0
        ? `Discharging ${Math.abs(
            simulation.batteryPower
          ).toFixed(1)} kW`
        : "Standby";

  const gridLabel =
    simulation.grid > 0
      ? `Import ${simulation.grid.toFixed(
          1
        )} kW`
      : simulation.grid < 0
        ? `Export ${Math.abs(
            simulation.grid
          ).toFixed(1)} kW`
        : "Balanced";

  return (
    <section
      className={`liveEnergyStory liveEnergyStory--${phase}`}
      id="live-energy-story"
    >
      <div className="liveEnergyGlow liveEnergyGlowOne" />
      <div className="liveEnergyGlow liveEnergyGlowTwo" />

      <div className="liveEnergyInner">
        <div className="liveEnergyHeader">
          <div>
            <div className="liveEnergyEyebrow">
              Live Day / Night Energy Story
            </div>

            <h2>
              Watch the system
              <br />
              change with{" "}
              <span>time.</span>
            </h2>
          </div>

          <div className="liveEnergyHeaderCopy">
            <p>
              Move the time slider
              through the day to see
              how solar generation,
              household demand,
              battery storage and
              grid interaction can
              change.
            </p>

            <small>
              Interactive planning
              simulation — not live
              monitored system data.
            </small>
          </div>
        </div>

        <div className="liveEnergyExperience">
          <div className="liveEnergyVisual">
            <div className="liveEnergyVisualTop liveEnergyVisualTop--phaseOnly">
              <div
                className={`liveEnergyPhaseBadge liveEnergyPhaseBadge--${phase}`}
              >
                <span />

                {phase === "day"
                  ? "Day"
                  : phase ===
                      "twilight"
                    ? "Transition"
                    : "Night"}
              </div>
            </div>

            <svg
              className="liveEnergySvg"
              viewBox="0 0 900 570"
              role="img"
              aria-label="Interactive solar home energy flow diagram"
            >
              <defs>
                <linearGradient
                  id="houseWall"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#17313c"
                  />
                  <stop
                    offset="100%"
                    stopColor="#0b1c24"
                  />
                </linearGradient>

                <linearGradient
                  id="roofGradient"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#173140"
                  />
                  <stop
                    offset="100%"
                    stopColor="#0a1820"
                  />
                </linearGradient>

                <linearGradient
                  id="panelGradient"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#255273"
                  />
                  <stop
                    offset="100%"
                    stopColor="#102b3d"
                  />
                </linearGradient>

                <filter
                  id="solarGlow"
                  x="-200%"
                  y="-200%"
                  width="400%"
                  height="400%"
                >
                  <feGaussianBlur
                    stdDeviation="7"
                    result="blur"
                  />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <filter
                  id="softGlow"
                  x="-100%"
                  y="-100%"
                  width="300%"
                  height="300%"
                >
                  <feGaussianBlur
                    stdDeviation="4"
                    result="blur"
                  />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <mask
                  id="liveMoonMask"
                  maskUnits="userSpaceOnUse"
                  x="680"
                  y="45"
                  width="90"
                  height="90"
                >
                  <rect
                    x="680"
                    y="45"
                    width="90"
                    height="90"
                    fill="white"
                  />
                  <circle
                    cx="730"
                    cy="76"
                    r="22"
                    fill="black"
                  />
                </mask>
              </defs>

              <g className="liveCelestial">
                {isDay ? (
                  <>
                    <circle
                      cx={`${celestialX}%`}
                      cy={`${celestialY}%`}
                      r="20"
                      className="liveSunCore"
                      filter="url(#solarGlow)"
                    />

                    <circle
                      cx={`${celestialX}%`}
                      cy={`${celestialY}%`}
                      r="38"
                      className="liveSunHalo"
                    />
                  </>
                ) : (
                  <>
                    <circle
                      cx="720"
                      cy="85"
                      r="24"
                      className="liveMoon"
                      filter="url(#softGlow)"
                      mask="url(#liveMoonMask)"
                    />
                  </>
                )}
              </g>

              <g
                className="liveStars"
                opacity={
                  phase === "night"
                    ? 1
                    : phase ===
                        "twilight"
                      ? 0.35
                      : 0
                }
              >
                <circle
                  cx="120"
                  cy="80"
                  r="1.8"
                />
                <circle
                  cx="180"
                  cy="55"
                  r="1.2"
                />
                <circle
                  cx="630"
                  cy="90"
                  r="1.5"
                />
                <circle
                  cx="790"
                  cy="145"
                  r="1.4"
                />
                <circle
                  cx="345"
                  cy="90"
                  r="1.3"
                />
                <circle
                  cx="550"
                  cy="50"
                  r="1.1"
                />
              </g>

              <path
                d="M40 500 C220 470 660 470 860 500"
                className="liveGround"
              />

              {/* ------------------------------------------
                  HOUSE
                  ------------------------------------------ */}

              <g className="liveHouse">
                {/* Wider architectural shell for a less compact layout */}

                <path
                  d="M185 285 L450 125 L715 285 Z"
                  fill="url(#roofGradient)"
                  className="liveRoof"
                />

                <rect
                  x="225"
                  y="285"
                  width="470"
                  height="220"
                  rx="6"
                  fill="url(#houseWall)"
                  className="liveHouseWall"
                />

                {/* Door */}

                <rect
                  x="430"
                  y="374"
                  width="80"
                  height="120"
                  rx="4"
                  className="liveDoor"
                />

                <circle
                  cx="495"
                  cy="438"
                  r="3"
                  className="liveDoorHandle"
                />

                {/* Left window */}

                <g className="liveWindow">
                  <rect
                    x="285"
                    y="326"
                    width="90"
                    height="76"
                    rx="3"
                  />

                  <line
                    x1="330"
                    y1="326"
                    x2="330"
                    y2="402"
                  />

                  <line
                    x1="285"
                    y1="364"
                    x2="375"
                    y2="364"
                  />
                </g>

                {/* Right window */}

                <g className="liveWindow">
                  <rect
                    x="545"
                    y="326"
                    width="90"
                    height="76"
                    rx="3"
                  />

                  <line
                    x1="590"
                    y1="326"
                    x2="590"
                    y2="402"
                  />

                  <line
                    x1="545"
                    y1="364"
                    x2="635"
                    y2="364"
                  />
                </g>

                {/* Solar panels — spaced cleanly across the roof */}

                <g className="livePanels">
                  <polygon
                    points="326,223 421,166 465,191 369,249"
                    fill="url(#panelGradient)"
                  />

                  <polygon
                    points="387,258 484,200 529,226 431,285"
                    fill="url(#panelGradient)"
                  />

                  <line
                    x1="357"
                    y1="204"
                    x2="400"
                    y2="229"
                  />

                  <line
                    x1="388"
                    y1="185"
                    x2="432"
                    y2="210"
                  />

                  <line
                    x1="418"
                    y1="239"
                    x2="462"
                    y2="265"
                  />

                  <line
                    x1="449"
                    y1="220"
                    x2="493"
                    y2="246"
                  />
                </g>
              </g>

              {/* ------------------------------------------
                  SOLAR PANEL -> INVERTER

                  Routed through the open strip beside the
                  left window so the architecture remains clear.
                  ------------------------------------------ */}

              <path
                d="M432 250 C405 279 329 282 262 302 L262 443 C272 450 281 452 292 452"
                className={`liveFlowLine liveFlowSolar ${
                  hasFlow("solar")
                    ? "active"
                    : ""
                }`}
              />

              {/* ------------------------------------------
                  INVERTER — below the left window
                  ------------------------------------------ */}

              <g
                className="liveDevice liveInverter"
                transform="translate(292 414)"
              >
                <rect
                  width="92"
                  height="86"
                  rx="13"
                />

                <circle
                  cx="46"
                  cy="29"
                  r="15"
                />

                <text
                  x="46"
                  y="34"
                  textAnchor="middle"
                  className="liveDeviceSymbol"
                >
                  ↯
                </text>

                <text
                  x="46"
                  y="67"
                  textAnchor="middle"
                >
                  INVERTER
                </text>
              </g>

              {/* ------------------------------------------
                  LOAD — clear central zone above the door
                  ------------------------------------------ */}

              <g
                className="liveLoadNode liveLoadNodeMain"
                transform="translate(470 316)"
              >
                <circle
                  cx="0"
                  cy="0"
                  r="29"
                />

                <text
                  x="0"
                  y="5"
                  textAnchor="middle"
                  className="liveLoadIcon"
                >
                  ⌂
                </text>
              </g>

              {/* ------------------------------------------
                  INVERTER -> LOAD

                  The line uses the vertical clear channel
                  between the left window and the door.
                  ------------------------------------------ */}

              <path
                d="M384 442 L410 442 L410 352 C410 328 428 316 441 316"
                className="liveFlowLine liveFlowLoad active"
              />

              {/* ------------------------------------------
                  BATTERY — below/right of the right window
                  ------------------------------------------ */}

              <g
                className="liveDevice liveBattery"
                transform="translate(615 408) scale(0.88)"
              >
                <rect
                  width="88"
                  height="104"
                  rx="13"
                />

                <rect
                  x="22"
                  y="27"
                  width="44"
                  height="44"
                  rx="5"
                  className="liveBatteryOutline"
                />

                <rect
                  x="27"
                  y={
                    67 -
                    simulation.batterySoc *
                      0.36
                  }
                  width="34"
                  height={
                    simulation.batterySoc *
                    0.36
                  }
                  rx="2"
                  className="liveBatteryFill"
                />

                <text
                  x="44"
                  y="90"
                  textAnchor="middle"
                >
                  {simulation.batterySoc}%
                </text>
              </g>

              {/* ------------------------------------------
                  INVERTER <-> BATTERY

                  Routed below the door so neither the door
                  nor the windows are crossed.
                  ------------------------------------------ */}

              <path
                d="M384 468 C398 496 410 518 440 520 L590 520 C610 520 620 500 628 492"
                className={`liveFlowLine liveFlowBattery ${
                  hasFlow(
                    "battery-charge"
                  ) ||
                  hasFlow(
                    "battery-discharge"
                  )
                    ? "active"
                    : ""
                } ${
                  hasFlow(
                    "battery-discharge"
                  )
                    ? "reverse"
                    : ""
                }`}
              />

              {/* ------------------------------------------
                  GRID
                  ------------------------------------------ */}

              <g
                className="liveGridTower"
                transform="translate(75 290)"
              >
                <path d="M45 0 L15 165" />
                <path d="M45 0 L75 165" />

                <line
                  x1="25"
                  y1="50"
                  x2="65"
                  y2="50"
                />

                <line
                  x1="20"
                  y1="87"
                  x2="70"
                  y2="87"
                />

                <line
                  x1="15"
                  y1="124"
                  x2="75"
                  y2="124"
                />

                <line
                  x1="28"
                  y1="50"
                  x2="64"
                  y2="87"
                />

                <line
                  x1="62"
                  y1="50"
                  x2="26"
                  y2="87"
                />

                <line
                  x1="23"
                  y1="87"
                  x2="70"
                  y2="124"
                />

                <line
                  x1="67"
                  y1="87"
                  x2="20"
                  y2="124"
                />
              </g>

              {/* ------------------------------------------
                  INVERTER <-> GRID

                  The line stays outside the house and keeps
                  the lower-left side visually open.
                  ------------------------------------------ */}

              <path
                d="M292 458 C252 472 210 467 157 435"
                className={`liveFlowLine liveFlowGrid ${
                  hasFlow(
                    "grid-import"
                  ) ||
                  hasFlow(
                    "grid-export"
                  )
                    ? "active"
                    : ""
                } ${
                  hasFlow(
                    "grid-import"
                  )
                    ? "reverse"
                    : ""
                }`}
              />

              <text
                x="444"
                y="108"
                className="liveSvgLabel"
              >
                SOLAR ARRAY
              </text>

              <text
                x="94"
                y="485"
                className="liveSvgLabel"
              >
                GRID
              </text>

              <text
                x="450"
                y="359"
                className="liveSvgLabel"
              >
                LOADS
              </text>

              <text
                x="635"
                y="512"
                className="liveSvgLabel"
              >
                BATTERY
              </text>
            </svg>

            <div className="liveEnergyVisualLegend">
              <span>
                <i className="legendSolar" />
                Solar
              </span>

              <span>
                <i className="legendBattery" />
                Battery
              </span>

              <span>
                <i className="legendGrid" />
                Grid
              </span>
            </div>

            <div className="liveEnergyControl">
              <div className="liveEnergyControlTop">
                <div>
                  <small>
                    SIMULATED TIME
                  </small>
                  <strong>
                    {formatTime(hour)}
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setHour(13)
                  }
                >
                  Reset to Midday
                </button>
              </div>

              <input
                aria-label="Simulated time of day"
                type="range"
                min="5"
                max="24"
                step="0.25"
                value={hour}
                onChange={(event) =>
                  setHour(
                    Number(
                      event.target.value
                    )
                  )
                }
              />

              <div className="liveEnergyTicks">
                <span>5:00 AM</span>
                <span>9:00 AM</span>
                <span>1:00 PM</span>
                <span>6:00 PM</span>
                <span>12:00 AM</span>
              </div>

              <div className="liveEnergyDisclaimer">
                <span />
                Illustrative energy
                behavior for explaining
                system operation.
                Generation, storage and
                grid values are
                simulated, not
                guaranteed performance
                or live monitoring
                data.
              </div>
            </div>
          </div>

          <div className="liveEnergyDashboard">
            <div className="liveEnergyDashboardHeader">
              <div>
                <small>
                  ENERGY STATUS
                </small>

                <h3>
                  {simulation.headline}
                </h3>
              </div>

              <div className="liveEnergyTime">
                <span>
                  {isDay ? "☀" : "☾"}
                </span>
                <strong>
                  {formatTime(hour)}
                </strong>
              </div>
            </div>

            <p className="liveEnergyDescription">
              {simulation.description}
            </p>

            <div className="liveEnergyMetrics">
              <div className="liveEnergyMetric liveEnergyMetricSolar">
                <div>
                  <span>☀</span>
                  <small>SOLAR</small>
                </div>

                <strong>
                  {simulation.solar.toFixed(
                    1
                  )}
                  <em>kW</em>
                </strong>

                <p>
                  {simulation.solar > 0
                    ? "Generating"
                    : "No generation"}
                </p>
              </div>

              <div className="liveEnergyMetric liveEnergyMetricLoad">
                <div>
                  <span>⌂</span>
                  <small>LOAD</small>
                </div>

                <strong>
                  {simulation.load.toFixed(
                    1
                  )}
                  <em>kW</em>
                </strong>

                <p>
                  Current demand
                </p>
              </div>

              <div className="liveEnergyMetric liveEnergyMetricBattery">
                <div>
                  <span>▣</span>
                  <small>
                    BATTERY
                  </small>
                </div>

                <strong>
                  {
                    simulation.batterySoc
                  }
                  <em>%</em>
                </strong>

                <p>{batteryLabel}</p>
              </div>

              <div className="liveEnergyMetric liveEnergyMetricGrid">
                <div>
                  <span>↔</span>
                  <small>GRID</small>
                </div>

                <strong>
                  {Math.abs(
                    simulation.grid
                  ).toFixed(1)}
                  <em>kW</em>
                </strong>

                <p>{gridLabel}</p>
              </div>
            </div>

            <div className="liveEnergyResult">
              <small>
                CURRENT ENERGY FLOW
              </small>

              <div>
                {simulation.solar >
                  0 && (
                  <span>Solar</span>
                )}

                {simulation.solar >
                  0 && <b>→</b>}

                <span>Inverter</span>

                {hasFlow(
                  "battery-charge"
                ) && (
                  <>
                    <b>→</b>
                    <span>Battery</span>
                  </>
                )}

                {hasFlow(
                  "battery-discharge"
                ) && (
                  <>
                    <b>←</b>
                    <span>Battery</span>
                  </>
                )}

                <b>→</b>
                <span>Loads</span>

                {hasFlow(
                  "grid-import"
                ) && (
                  <>
                    <b>←</b>
                    <span>Grid</span>
                  </>
                )}

                {hasFlow(
                  "grid-export"
                ) && (
                  <>
                    <b>→</b>
                    <span>Grid</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}