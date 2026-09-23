"use client";

import { useEffect, useRef } from "react";

const PAGE_HTML = String.raw`
<section class="techIntro">
<div>
<div class="demoEyebrow">Tools &amp; Technology</div>
<h1>Desh Solar <span>Engineering Lab.</span></h1>
<p>Calculate, compare and understand the technical building blocks of a solar system before moving into full system planning.</p>
</div>
<div class="techIntroActions">
<a class="demoBtn" href="#engineering-tools">Open Engineering Tools →</a>
<a class="demoBtn secondary" href="/build-your-system">Build Your System →</a>
</div>
</section>
<section class="techSection" id="engineering-tools">
<div class="techHead">
<div>
<div class="demoEyebrow">Quick Engineering Tools</div>
<h2>Start with the calculation you need.</h2>
<p>Six fast planning tools are available immediately. Outputs are educational estimates, not final engineering approval.</p>
</div>
<span class="planningPill">Planning Mode • Technical review required</span>
</div>
<div class="toolTabs">
<button class="toolTab active" data-tool="generation"><span>☀</span><b>Generation</b><small>Daily / monthly / annual</small></button>
<button class="toolTab" data-tool="battery"><span>▣</span><b>Battery Backup</b><small>Runtime / storage need</small></button>
<button class="toolTab" data-tool="inverter"><span>↯</span><b>Inverter Sizing</b><small>Running + surge</small></button>
<button class="toolTab" data-tool="roof"><span>▤</span><b>Roof / Panel</b><small>PV potential</small></button>
<button class="toolTab" data-tool="load"><span>⌂</span><b>Load Calculator</b><small>Quick appliance load</small></button>
<button class="toolTab" data-tool="compat"><span>◇</span><b>Compatibility</b><small>Architecture screening</small></button>
</div>
<div class="toolWorkspace">
<article class="toolPanel active" data-panel="generation">
<div class="toolForm">
<div class="demoEyebrow">Solar Generation Calculator</div>
<h3>Estimate PV energy output.</h3>
<div class="labFields">
<label>PV size (kWp)<input id="genPV" min=".5" step=".1" type="number" value="6"/></label>
<label>Peak-sun hours<input id="genSun" max="7" min="2" step=".1" type="number" value="4.5"/></label>
<label>Performance factor (%)<input id="genFactor" max="95" min="50" type="number" value="82"/></label>
</div>
<p class="toolDisclaimer">Use site-specific solar-resource data for real engineering.</p>
</div>
<div class="toolResult">
<small>ESTIMATED DAILY GENERATION</small><strong id="genDaily">—</strong>
<div class="resultTiles">
<div><small>Monthly</small><b id="genMonth">—</b></div>
<div><small>Annual</small><b id="genYear">—</b></div>
<div><small>PV Size</small><b id="genPVOut">—</b></div>
</div>
<div class="miniBars" id="genBars"></div>
</div>
</article>
<article class="toolPanel" data-panel="battery">
<div class="toolForm">
<div class="demoEyebrow">Battery Backup Lab</div>
<h3>Estimate runtime or required storage.</h3>
<div class="modeButtons">
<button class="active" data-bat-mode="runtime" type="button">Battery → Runtime</button>
<button data-bat-mode="required" type="button">Hours → Battery</button>
</div>
<div class="labFields">
<label>Backup load (W)<input id="batLoad" min="50" type="number" value="1500"/></label>
<label data-runtime-input="">Battery capacity (kWh)<input id="batCapacity" min=".5" step=".1" type="number" value="5.12"/></label>
<label data-required-input="" hidden="">Backup target (h)<input id="batHours" min=".5" step=".5" type="number" value="4"/></label>
<label>Usable battery (%)<input id="batUsable" max="95" min="50" type="number" value="85"/></label>
<label>Efficiency (%)<input id="batEff" max="98" min="60" type="number" value="90"/></label>
</div>
<p class="toolDisclaimer">Real runtime depends on chemistry, current limits, BMS, temperature, age and inverter behaviour.</p>
</div>
<div class="toolResult">
<small id="batResultLabel">ESTIMATED BACKUP</small><strong id="batResult">—</strong>
<div class="batteryMeter"><i id="batteryFill"></i><span>BATTERY</span></div>
<div class="resultTiles">
<div><small>Load</small><b id="batLoadOut">—</b></div>
<div><small>Usable Energy</small><b id="batEnergy">—</b></div>
</div>
</div>
</article>
<article class="toolPanel" data-panel="inverter">
<div class="toolForm">
<div class="demoEyebrow">Inverter Sizing Tool</div>
<h3>Include startup surge, not only running load.</h3>
<div class="labFields">
<label>Running load (W)<input id="invRun" type="number" value="3200"/></label>
<label>Largest motor / compressor (W)<input id="invMotor" type="number" value="1200"/></label>
<label>Startup multiplier<input id="invSurge" max="5" min="1" step=".1" type="number" value="2.3"/></label>
<label>Planning margin (%)<input id="invMargin" max="50" min="0" type="number" value="15"/></label>
</div>
<p class="toolDisclaimer">Final selection must also verify phase, MPPT, battery limits and model-specific surge capability.</p>
</div>
<div class="toolResult">
<small>PLANNING INVERTER CLASS</small><strong id="invClass">—</strong>
<div class="resultTiles">
<div><small>Running</small><b id="invRunOut">—</b></div>
<div><small>Planning Peak</small><b id="invPeak">—</b></div>
<div><small>Surge Extra</small><b id="invExtra">—</b></div>
</div>
</div>
</article>
<article class="toolPanel" data-panel="roof">
<div class="toolForm">
<div class="demoEyebrow">Roof + Panel Lab</div>
<h3>Convert usable area into PV potential.</h3>
<div class="labFields">
<label>Usable area (sq ft)<input id="roofArea" type="number" value="1200"/></label>
<label>Panel power<select id="roofPanel"><option value="590">590 W</option><option value="625">625 W</option><option value="715">715 W</option></select></label>
<label>Space allowance / panel (sq ft)<input id="roofSpace" max="50" min="18" type="number" value="30"/></label>
<label>Layout factor<select id="roofFactor"><option value="1">Low constraints</option><option value=".9">Some constraints</option><option value=".75">Significant constraints</option></select></label>
</div>
<p class="toolDisclaimer">Roof shape, setbacks, tilt, mounting, shading and safe access change the final layout.</p>
</div>
<div class="toolResult">
<small>ROOF-LIMITED PV POTENTIAL</small><strong id="roofPV">—</strong>
<div class="resultTiles">
<div><small>Panels</small><b id="roofPanels">—</b></div>
<div><small>Approx. Area Used</small><b id="roofUsed">—</b></div>
</div>
<div class="panelField" id="roofVisual"></div>
</div>
</article>
<article class="toolPanel" data-panel="load">
<div class="toolForm">
<div class="demoEyebrow">Quick Load Calculator</div>
<h3>Build a fast connected-load profile.</h3>
<div class="quickLoads">
<label>Fans<input data-quick-load="" data-s="1.3" data-w="75" min="0" type="number" value="4"/></label>
<label>LED Lights<input data-quick-load="" data-s="1" data-w="12" min="0" type="number" value="8"/></label>
<label>1.5 Ton AC<input data-quick-load="" data-s="2.3" data-w="1700" min="0" type="number" value="1"/></label>
<label>Refrigerator<input data-quick-load="" data-s="3" data-w="180" min="0" type="number" value="1"/></label>
<label>Desktop PCs<input data-quick-load="" data-s="1.2" data-w="250" min="0" type="number" value="2"/></label>
<label>Water Pump<input data-quick-load="" data-s="3" data-w="750" min="0" type="number" value="0"/></label>
<label>Other load (W)<input id="otherLoad" min="0" type="number" value="0"/></label>
</div>
<a class="inlineLabLink" href="/build-your-system">Continue with the full property-based appliance builder →</a>
</div>
<div class="toolResult">
<small>CONNECTED RUNNING LOAD</small><strong id="loadRun">—</strong>
<div class="resultTiles">
<div><small>Planning Surge</small><b id="loadPeak">—</b></div>
<div><small>Inverter Class</small><b id="loadClass">—</b></div>
<div><small>Device Count</small><b id="loadCount">—</b></div>
</div>
</div>
</article>
<article class="toolPanel" data-panel="compat">
<div class="toolForm">
<div class="demoEyebrow">Compatibility Explorer</div>
<h3>Screen broad architecture families.</h3>
<div class="labFields">
<label>PV approach<select id="compPV"><option value="normal">Residential / commercial PV</option><option value="project">High-output project PV</option><option value="portable">Portable / low-voltage PV</option></select></label>
<label>Inverter architecture<select id="compInv"><option value="hybrid48">48 V-class hybrid</option><option value="project3p">Project / three-phase</option><option value="portable">Portable power input</option></select></label>
<label>Battery architecture<select id="compBat"><option value="lv48">Low-voltage lithium</option><option value="project">Project-scale storage</option><option value="none">No battery</option><option value="portable">Portable battery</option></select></label>
</div>
<p class="toolDisclaimer">This does not verify voltage, MPPT, current, BMS communication, string design or manufacturer approval.</p>
</div>
<div class="toolResult compatibilityPanel">
<small>ARCHITECTURE REVIEW</small><strong id="compStatus">—</strong><span id="compSummary"></span>
<div class="compatRows" id="compatRows"></div>
</div>
</article>
</div>
</section>
<section class="techSection altLab" id="energy-os">
<div class="techHead">
<div><div class="demoEyebrow">Interactive Solar Energy OS</div><h2>Click through the system.</h2><p>Each layer changes what engineers need to verify.</p></div>
</div>
<div class="energyLab">
<div class="energyNodes">
<button class="energyNodeLab active" data-energy="sun"><span>☀</span><b>Sun</b><small>Source</small></button><i>→</i>
<button class="energyNodeLab" data-energy="panel"><span>▤</span><b>Panel</b><small>Generation</small></button><i>→</i>
<button class="energyNodeLab" data-energy="inverter"><span>↯</span><b>Inverter</b><small>Control</small></button><i>↔</i>
<button class="energyNodeLab" data-energy="battery"><span>▣</span><b>Battery</b><small>Storage</small></button><i>→</i>
<button class="energyNodeLab" data-energy="load"><span>⌂</span><b>Loads</b><small>Demand</small></button>
</div>
<aside class="energyInspector">
<small id="energyK">ENERGY SOURCE</small><h3 id="energyT">Sunlight starts the system.</h3><p id="energyP"></p>
<div class="energyChecks" id="energyChecks"></div><a href="/build-your-system" id="energyA">Open planning route →</a>
</aside>
</div>
</section>
<section class="techSection" id="energy-simulator">
<div class="techHead">
<div><div class="demoEyebrow">Live Day / Night Energy Simulator</div><h2>See where the energy goes.</h2><p>A simplified hybrid-system monitoring demo across a 24-hour day.</p></div>
<div class="timeBadge"><small>SIMULATED TIME</small><b id="timeLabel">12:00 PM</b></div>
</div>
<div class="simGrid">
<div class="simControls">
<label>Time<input id="timeSlider" max="23" min="0" type="range" value="12"/></label>
<div class="tickRow"><span>6 AM</span><span>12 PM</span><span>6 PM</span><span>12 AM</span></div>
<div class="simFields">
<label>PV size (kWp)<input id="simPV" min="1" step=".5" type="number" value="6"/></label>
<label>Typical load (kW)<input id="simLoad" min=".2" step=".1" type="number" value="2.8"/></label>
<label>Battery state (%)<input id="simBattery" max="100" min="5" type="number" value="72"/></label>
</div>
<div class="simNote" id="simNote"></div>
</div>
<div class="monitorLab">
<div class="monitorHeader"><span>SYSTEM MONITORING DEMO</span><b id="simMode">Hybrid • Day mode</b></div>
<article><small>Solar</small><strong id="simSolar">—</strong><div><i id="solarBar"></i></div></article>
<article><small>Load</small><strong id="simLoadOut">—</strong><div><i id="loadBar"></i></div></article>
<article><small>Battery</small><strong id="simBatOut">—</strong><div><i id="batBar"></i></div></article>
<article><small>Grid</small><strong id="simGridOut">—</strong><div><i id="gridBar"></i></div></article>
<div class="simFlow"><div>☀<b>Solar</b></div><i>→</i><div>↯<b>Hybrid Control</b></div><i>→</i><div>⌂<b>Loads</b></div><small id="flowState">Solar → Loads</small></div>
</div>
</div>
</section>
<section class="techSection altLab" id="technology-explorer">
<div class="techHead"><div><div class="demoEyebrow">Technology Explorer</div><h2>Understand components before choosing products.</h2></div></div>
<div class="topicTabs">
<button class="active" data-topic="panel">Solar Panels</button>
<button data-topic="inverter">Inverters</button>
<button data-topic="battery">Lithium Batteries</button>
<button data-topic="protection">Protection</button>
<button data-topic="monitoring">Monitoring</button>
</div>
<div class="topicWorkspace">
<div class="topicImage"><img alt="Jinko Tiger Neo 590W Solar Panel" id="topicImage" src="/assets/products-real/jinko590.jpg"/><span>Representative catalogue reference</span></div>
<div class="topicCopy">
<div class="demoEyebrow" id="topicK">SOLAR PANELS</div><h3 id="topicT">The generation layer.</h3><p id="topicP"></p>
<div class="topicChecks" id="topicChecks"></div><a class="demoBtn" href="/products" id="topicLink">Explore Product →</a>
</div>
</div>
</section>
<section class="techSection" id="architecture-comparison">
<div class="techHead"><div><div class="demoEyebrow">System Architecture Comparison</div><h2>On-grid, hybrid or off-grid?</h2><p>The correct architecture depends on savings, backup and independence goals.</p></div></div>
<div class="archCards">
<article><span>ON-GRID</span><h3>Solar + Grid</h3><div>☀ → ▤ → ↯ → ⌂ ↔ GRID</div><ul><li>Grid-energy reduction focus</li><li>Battery is not the central layer</li><li>Interconnection conditions matter</li></ul></article>
<article class="featured"><span>HYBRID</span><h3>Solar + Battery + Grid</h3><div>☀ → ▤ → ↯ ↔ ▣ → ⌂</div><ul><li>Solar use + outage backup</li><li>Storage compatibility is critical</li><li>Essential-load planning helps</li></ul></article>
<article><span>OFF-GRID</span><h3>Solar + Storage</h3><div>☀ → ▤ → ↯ ↔ ▣ → ⌂</div><ul><li>Energy-autonomy focus</li><li>Storage becomes central</li><li>Daily energy budget matters</li></ul></article>
</div>
</section>
<section class="techSection altLab">
<div class="techHead"><div><div class="demoEyebrow">Protection &amp; System Engineering</div><h2>A solar system is more than three products.</h2><p>Safe engineering also includes protection, isolation, cabling, earthing, mounting and commissioning.</p></div></div>
<div class="protectFlow"><div>▤<b>PV Array</b></div><i>→</i><div>⛨<b>DC Protection</b></div><i>→</i><div>↯<b>Inverter</b></div><i>→</i><div>⛨<b>AC Protection</b></div><i>→</i><div>⌂<b>Loads / Grid</b></div></div>
<p class="safetyBox">Electrical protection and installation should be designed and carried out by qualified technical personnel. This page intentionally avoids DIY wiring instructions.</p>
</section>
<section class="techSection productBridge">
<div class="bridgeIntro"><div class="demoEyebrow">Technology → Products → System</div><h2>Learn first. Then choose equipment.</h2><p>Move from technology education into the real catalogue or the full system builder.</p></div>
<div class="bridgeGrid">
<a href="/products/jinko590"><img alt="Jinko Tiger Neo 590W Solar Panel" src="/assets/products-real/jinko590.jpg"/><small>Solar Panel</small><b>Jinko Tiger Neo 590W Solar Panel</b></a>
<a href="/products/goodwe6"><img alt="GoodWe 6kW Single Phase Off-Grid Hybrid Inverter" src="/assets/products-real/goodwe6.jpg"/><small>Inverter</small><b>GoodWe 6kW Single Phase Off-Grid Hybrid Inverter</b></a>
<a href="/products/hithium16"><img alt="HiTHIUM HEROEE 16 LiFePO4 Lithium Battery" src="/assets/products-real/hithium16.webp"/><small>Battery</small><b>HiTHIUM HEROEE 16 LiFePO4 Lithium Battery</b></a>
<a href="/products/sys6-51"><img alt="6kW 5.1kWh Single Phase Off-Grid Hybrid Solar System | 6.2kW PV | Double Utility Meter Distribution" src="/assets/products-real/sys6-51.jpg"/><small>Complete System</small><b>6kW 5.1kWh Single Phase Off-Grid Hybrid Solar System | 6.2kW PV | Double Utility Meter Distribution</b></a>
</div>
</section>
<div class="ctaBand techCta">
<div><h3>Ready to turn the tools into a system?</h3><p>Build a complete load, backup, roof and electricity profile.</p></div>
<div class="demoActions"><a class="demoBtn" href="/build-your-system">Open Build Your System →</a><a class="demoBtn secondary" href="/contact">Technical Review →</a></div>
</div>

<section class="futureBand demoReveal in">
<div class="countryMark">BD</div>
<small>Desh Solar • Bangladesh</small>
<h2>POWERING BANGLADESH FORWARD.</h2>
</section>`;

type EnergyInfo = {
  kicker: string;
  title: string;
  description: string;
  checks: Array<[string, string]>;
  href: string;
  cta: string;
};

type TopicInfo = {
  kicker: string;
  title: string;
  description: string;
  image: string;
  alt: string;
  href: string;
  checks: Array<[string, string]>;
};

export default function EngineeringLabClient() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const $ = <T extends Element = HTMLElement>(selector: string) =>
      root.querySelector(selector) as T | null;

    const $$ = <T extends Element = HTMLElement>(selector: string) =>
      Array.from(root.querySelectorAll(selector)) as T[];

    const field = (id: string) =>
      $<HTMLInputElement | HTMLSelectElement>(`#${id}`);

    const numberValue = (id: string, fallback = 0) => {
      const value = Number.parseFloat(field(id)?.value ?? "");
      return Number.isFinite(value) ? value : fallback;
    };

    const text = (id: string, value: string | number) => {
      const element = $<HTMLElement>(`#${id}`);
      if (element) element.textContent = String(value);
    };

    const clamp = (value: number, min: number, max: number) =>
      Math.max(min, Math.min(max, value));

    const inverterClasses = [
      1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 18, 20, 25, 30, 40, 50,
    ];

    const nextClass = (value: number) =>
      inverterClasses.find((item) => item >= value) ??
      Math.ceil(value / 10) * 10;

    // Engineering tool tabs + deep links
    const toolKeys = new Set([
      "generation",
      "battery",
      "inverter",
      "roof",
      "load",
      "compat",
    ]);

    const activateTool = (key: string, scrollToTools = false) => {
      if (!toolKeys.has(key)) return;

      $$<HTMLButtonElement>(".toolTab").forEach((item) =>
        item.classList.toggle("active", item.dataset.tool === key),
      );
      $$<HTMLElement>(".toolPanel").forEach((item) =>
        item.classList.toggle("active", item.dataset.panel === key),
      );

      if (scrollToTools) {
        window.requestAnimationFrame(() => {
          $("#engineering-tools")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        });
      }
    };

    const setToolHash = (key: string) => {
      const nextUrl = `${window.location.pathname}${window.location.search}#${key}`;
      window.history.replaceState(null, "", nextUrl);
    };

    $$<HTMLButtonElement>(".toolTab").forEach((button) => {
      button.onclick = () => {
        const key = button.dataset.tool;
        if (!key) return;
        activateTool(key);
        setToolHash(key);
      };
    });

    const activateToolFromHash = (scrollToTools = true) => {
      const key = window.location.hash.replace(/^#/, "").toLowerCase();
      if (toolKeys.has(key)) activateTool(key, scrollToTools);
    };

    const handleHashChange = () => activateToolFromHash(true);
    window.addEventListener("hashchange", handleHashChange);
    activateToolFromHash(true);

    // Solar generation calculator
    const generation = () => {
      const pv = Math.max(0.1, numberValue("genPV", 6));
      const sun = clamp(numberValue("genSun", 4.5), 1, 8);
      const factor = clamp(numberValue("genFactor", 82), 20, 100) / 100;
      const daily = pv * sun * factor;

      text("genDaily", `${daily.toFixed(1)} kWh`);
      text("genMonth", `${Math.round(daily * 30).toLocaleString()} kWh`);
      text("genYear", `${Math.round(daily * 365).toLocaleString()} kWh`);
      text("genPVOut", `${pv.toFixed(1)} kWp`);

      const bars = $<HTMLElement>("#genBars");
      if (bars) {
        bars.innerHTML = [
          0.76, 0.82, 0.9, 0.98, 1.05, 1.08, 1.02, 0.97, 0.93, 0.88,
          0.81, 0.74,
        ]
          .map(
            (height) =>
              `<i style="height:${Math.round(height * 62)}px"></i>`,
          )
          .join("");
      }
    };

    ["genPV", "genSun", "genFactor"].forEach((id) => {
      const input = field(id);
      if (input) input.oninput = generation;
    });
    generation();

    // Battery backup calculator
    let batteryMode: "runtime" | "required" = "runtime";

    const battery = () => {
      const load = Math.max(1, numberValue("batLoad", 1500));
      const usable = clamp(numberValue("batUsable", 85), 20, 100) / 100;
      const efficiency = clamp(numberValue("batEff", 90), 20, 100) / 100;

      text("batLoadOut", `${Math.round(load).toLocaleString()} W`);

      if (batteryMode === "runtime") {
        const capacity = Math.max(0.1, numberValue("batCapacity", 5.12));
        const usableEnergy = capacity * usable * efficiency;
        const hours = usableEnergy / (load / 1000);

        text("batResultLabel", "ESTIMATED BACKUP");
        text("batResult", `${hours.toFixed(1)} h`);
        text("batEnergy", `${usableEnergy.toFixed(1)} kWh`);

        const fill = $<HTMLElement>("#batteryFill");
        if (fill) fill.style.width = `${clamp(usable * 100, 5, 100)}%`;
      } else {
        const hours = Math.max(0.1, numberValue("batHours", 4));
        const required = ((load / 1000) * hours) / (usable * efficiency);

        text("batResultLabel", "REQUIRED BATTERY");
        text("batResult", `${required.toFixed(1)} kWh`);
        text("batEnergy", `${((load / 1000) * hours).toFixed(1)} kWh load`);

        const fill = $<HTMLElement>("#batteryFill");
        if (fill) fill.style.width = `${clamp((hours / 12) * 100, 8, 100)}%`;
      }
    };

    $$<HTMLButtonElement>("[data-bat-mode]").forEach((button) => {
      button.onclick = () => {
        batteryMode = button.dataset.batMode === "required" ? "required" : "runtime";

        $$<HTMLButtonElement>("[data-bat-mode]").forEach((item) =>
          item.classList.toggle("active", item === button),
        );
        $$<HTMLElement>("[data-runtime-input]").forEach((item) => {
          item.hidden = batteryMode !== "runtime";
        });
        $$<HTMLElement>("[data-required-input]").forEach((item) => {
          item.hidden = batteryMode !== "required";
        });
        battery();
      };
    });

    ["batLoad", "batCapacity", "batHours", "batUsable", "batEff"].forEach(
      (id) => {
        const input = field(id);
        if (input) input.oninput = battery;
      },
    );
    battery();

    // Inverter sizing
    const inverter = () => {
      const running = Math.max(0, numberValue("invRun", 3200));
      const motor = Math.max(0, numberValue("invMotor", 1200));
      const surge = Math.max(1, numberValue("invSurge", 2.3));
      const margin = Math.max(0, numberValue("invMargin", 15)) / 100;
      const extra = motor * Math.max(0, surge - 1);
      const peak = (running + extra) * (1 + margin);

      text("invClass", `${nextClass(peak / 1000)} kW`);
      text("invRunOut", `${(running / 1000).toFixed(1)} kW`);
      text("invPeak", `${(peak / 1000).toFixed(1)} kW`);
      text("invExtra", `${(extra / 1000).toFixed(1)} kW`);
    };

    ["invRun", "invMotor", "invSurge", "invMargin"].forEach((id) => {
      const input = field(id);
      if (input) input.oninput = inverter;
    });
    inverter();

    // Roof + panel planning
    const roof = () => {
      const area = Math.max(0, numberValue("roofArea", 1200));
      const wattage = Math.max(1, numberValue("roofPanel", 590));
      const space = Math.max(1, numberValue("roofSpace", 30));
      const factor = clamp(numberValue("roofFactor", 1), 0.2, 1);
      const panels = Math.max(0, Math.floor((area * factor) / space));

      text("roofPV", `${((panels * wattage) / 1000).toFixed(1)} kWp`);
      text("roofPanels", panels);
      text("roofUsed", `${Math.min(area, panels * space).toLocaleString()} sq ft`);

      const visual = $<HTMLElement>("#roofVisual");
      if (visual) {
        visual.innerHTML = Array.from(
          { length: Math.min(40, panels) },
          () => "<span></span>",
        ).join("");
      }
    };

    ["roofArea", "roofPanel", "roofSpace", "roofFactor"].forEach((id) => {
      const input = field(id);
      if (input) input.oninput = roof;
    });
    roof();

    // Quick connected-load calculator
    const load = () => {
      let running = 0;
      let count = 0;
      let extraSurge = 0;

      $$<HTMLInputElement>("[data-quick-load]").forEach((input) => {
        const quantity = Math.max(0, Number.parseInt(input.value || "0", 10) || 0);
        const watts = Number.parseFloat(input.dataset.w ?? "0") || 0;
        const surge = Number.parseFloat(input.dataset.s ?? "1") || 1;

        running += quantity * watts;
        count += quantity;
        if (quantity) {
          extraSurge = Math.max(extraSurge, watts * Math.max(0, surge - 1));
        }
      });

      running += Math.max(0, numberValue("otherLoad", 0));
      const peak = running + extraSurge;

      text("loadRun", `${(running / 1000).toFixed(2)} kW`);
      text("loadPeak", `${(peak / 1000).toFixed(2)} kW`);
      text("loadClass", `${nextClass((peak * 1.15) / 1000)} kW`);
      text("loadCount", count);
    };

    $$<HTMLInputElement>("[data-quick-load]").forEach((input) => {
      input.oninput = load;
    });
    const otherLoad = field("otherLoad");
    if (otherLoad) otherLoad.oninput = load;
    load();

    // Broad compatibility screening
    const compatibility = () => {
      const pv = field("compPV")?.value ?? "normal";
      const inverterType = field("compInv")?.value ?? "hybrid48";
      const batteryType = field("compBat")?.value ?? "lv48";
      let status = "Technical review required";
      const rows: Array<[string, string]> = [];

      if (
        pv === "portable" ||
        inverterType === "portable" ||
        batteryType === "portable"
      ) {
        const okay =
          pv === "portable" &&
          inverterType === "portable" &&
          (batteryType === "portable" || batteryType === "none");

        status = okay
          ? "Same portable architecture family"
          : "Architecture mismatch likely";
        rows.push([
          "PV ↔ inverter",
          okay ? "Portable family" : "Different architecture family",
        ]);
        rows.push([
          "Battery ↔ inverter",
          okay ? "Portable storage path" : "Dedicated input must be checked",
        ]);
      } else {
        const projectInverter = inverterType === "project3p";
        const projectBattery = batteryType === "project";

        if (projectInverter && projectBattery) {
          status = "Project-scale architecture family";
        } else if (
          inverterType === "hybrid48" &&
          (batteryType === "lv48" || batteryType === "none")
        ) {
          status = "Likely low-voltage hybrid family";
        }

        rows.push([
          "PV ↔ inverter",
          projectInverter && pv === "project"
            ? "Broad project direction"
            : "MPPT voltage/current must be checked",
        ]);
        rows.push([
          "Inverter ↔ battery",
          batteryType === "none"
            ? "No storage selected"
            : projectInverter === projectBattery
              ? "Broad voltage-family direction"
              : "Voltage/BMS family needs review",
        ]);
      }

      rows.push([
        "Final verification",
        "String voltage, current, MPPT, BMS and manufacturer approval",
      ]);

      text("compStatus", status);
      text("compSummary", "Architecture-only screening — not compatibility approval.");

      const output = $<HTMLElement>("#compatRows");
      if (output) {
        output.innerHTML = rows
          .map(([label, value]) => `<div><small>${label}</small><b>${value}</b></div>`)
          .join("");
      }
    };

    ["compPV", "compInv", "compBat"].forEach((id) => {
      const select = field(id);
      if (select) select.onchange = compatibility;
    });
    compatibility();

    // Interactive Solar Energy OS
    const energy: Record<string, EnergyInfo> = {
      sun: {
        kicker: "ENERGY SOURCE",
        title: "Sunlight starts the system.",
        description:
          "Solar resource, orientation, shading and usable area determine how much generation is possible.",
        checks: [
          ["Engineering question", "How much usable solar resource reaches the array?"],
          ["Verify", "Exposure, shading and installation area"],
        ],
        href: "/build-your-system",
        cta: "Open site planning →",
      },
      panel: {
        kicker: "GENERATION LAYER",
        title: "Panels convert sunlight into DC energy.",
        description:
          "Panel choice affects array voltage, current, physical layout and the inverter operating window.",
        checks: [
          ["Engineering question", "How many modules and what string arrangement?"],
          ["Verify", "Voltage, current, MPPT and physical layout"],
        ],
        href: "/products?category=panel",
        cta: "Explore panels →",
      },
      inverter: {
        kicker: "CONTROL + CONVERSION",
        title: "The inverter manages the energy paths.",
        description:
          "It coordinates PV input, AC output, storage and—depending on architecture—grid or backup operation.",
        checks: [
          ["Engineering question", "What load, surge and phase are required?"],
          ["Verify", "Output, MPPT, battery and protection"],
        ],
        href: "/products?category=inverter",
        cta: "Explore inverters →",
      },
      battery: {
        kicker: "STORAGE",
        title: "Battery capacity turns energy into time.",
        description:
          "Storage planning starts with actual backup load and hours, then voltage, current and BMS communication.",
        checks: [
          ["Engineering question", "How much energy must remain available?"],
          ["Verify", "Voltage, BMS, current and compatibility"],
        ],
        href: "/products?category=battery",
        cta: "Explore batteries →",
      },
      load: {
        kicker: "ENERGY DEMAND",
        title: "Build the system around the loads.",
        description:
          "Lights, ACs, pumps, motors and electronics behave differently. Running load and surge both matter.",
        checks: [
          ["Engineering question", "What must run and for how long?"],
          ["Best next step", "Build a property-based appliance profile"],
        ],
        href: "/build-your-system",
        cta: "Build from appliances →",
      },
    };

    const showEnergy = (key: string) => {
      const data = energy[key];
      if (!data) return;

      $$<HTMLButtonElement>(".energyNodeLab").forEach((button) =>
        button.classList.toggle("active", button.dataset.energy === key),
      );

      text("energyK", data.kicker);
      text("energyT", data.title);
      text("energyP", data.description);

      const checks = $<HTMLElement>("#energyChecks");
      if (checks) {
        checks.innerHTML = data.checks
          .map(([label, value]) => `<div><small>${label}</small><b>${value}</b></div>`)
          .join("");
      }

      const link = $<HTMLAnchorElement>("#energyA");
      if (link) {
        link.href = data.href;
        link.textContent = data.cta;
      }
    };

    $$<HTMLButtonElement>(".energyNodeLab").forEach((button) => {
      button.onclick = () => showEnergy(button.dataset.energy ?? "sun");
    });
    showEnergy("sun");

    // Day/night energy simulator
    const formatHour = (hour: number) =>
      `${hour % 12 || 12}:00 ${hour >= 12 ? "PM" : "AM"}`;

    const simulator = () => {
      const hour = Math.round(numberValue("timeSlider", 12));
      const pv = Math.max(0.1, numberValue("simPV", 6));
      const baseLoad = Math.max(0.1, numberValue("simLoad", 2.8));
      const batteryState = clamp(numberValue("simBattery", 72), 0, 100);

      let solarFactor = 0;
      if (hour >= 6 && hour <= 18) {
        solarFactor = Math.sin(((hour - 6) / 12) * Math.PI);
      }

      const solar = Math.max(0, pv * solarFactor * 0.88);
      const loadValue =
        baseLoad * (hour >= 18 && hour <= 22 ? 1.2 : hour < 6 ? 0.65 : 1);
      let grid = 0;
      let note = "";
      let flow = "";

      if (solar >= loadValue) {
        if (solar - loadValue > 0.15 && batteryState < 95) {
          note =
            "Solar is serving loads and surplus can charge storage, subject to inverter/battery limits.";
          flow = "Solar → Loads + Battery";
        } else {
          note = "Solar is covering the simulated load.";
          flow = "Solar → Loads";
        }
      } else if (batteryState > 20) {
        note = "Solar is below load, so storage can support the shortfall.";
        flow = "Solar + Battery → Loads";
      } else {
        grid = loadValue - solar;
        note =
          "Solar is below load and battery state is low, so grid import supplies the remainder.";
        flow = "Solar + Grid → Loads";
      }

      text("timeLabel", formatHour(hour));
      text("simSolar", `${solar.toFixed(1)} kW`);
      text("simLoadOut", `${loadValue.toFixed(1)} kW`);
      text("simBatOut", `${batteryState.toFixed(0)}%`);
      text("simGridOut", `${grid.toFixed(1)} kW`);
      text("simNote", note);
      text("flowState", flow);
      text("simMode", hour >= 6 && hour <= 18 ? "Hybrid • Day mode" : "Hybrid • Night mode");

      const maxValue = Math.max(pv, loadValue, 1);
      const solarBar = $<HTMLElement>("#solarBar");
      const loadBar = $<HTMLElement>("#loadBar");
      const batteryBar = $<HTMLElement>("#batBar");
      const gridBar = $<HTMLElement>("#gridBar");

      if (solarBar) solarBar.style.width = `${clamp((solar / maxValue) * 100, 0, 100)}%`;
      if (loadBar) loadBar.style.width = `${clamp((loadValue / maxValue) * 100, 0, 100)}%`;
      if (batteryBar) batteryBar.style.width = `${batteryState}%`;
      if (gridBar) gridBar.style.width = `${clamp((grid / maxValue) * 100, 0, 100)}%`;
    };

    ["timeSlider", "simPV", "simLoad", "simBattery"].forEach((id) => {
      const input = field(id);
      if (input) input.oninput = simulator;
    });
    simulator();

    // Technology explorer
    const topics: Record<string, TopicInfo> = {
      panel: {
        kicker: "SOLAR PANELS",
        title: "The generation layer.",
        description:
          "Panels define the physical generation surface. Engineers look beyond wattage to array voltage, current, temperature behaviour, mounting area and inverter operating limits.",
        image: "/assets/products-real/jinko590.jpg",
        alt: "Jinko Tiger Neo 590W Solar Panel",
        href: "/products/jinko590",
        checks: [
          ["Power class", "Wattage helps determine array count and DC capacity."],
          ["Electrical window", "String voltage/current must stay within inverter limits."],
          ["Site layout", "Module dimensions and roof geometry affect final count."],
          ["Technology", "Cell/module architecture changes performance characteristics."],
        ],
      },
      inverter: {
        kicker: "INVERTERS",
        title: "The system traffic controller.",
        description:
          "The inverter converts and controls energy. Selection depends on load, surge, phase, PV input, storage, grid behaviour and backup requirements.",
        image: "/assets/products-real/goodwe6.jpg",
        alt: "GoodWe 6kW Single Phase Off-Grid Hybrid Inverter",
        href: "/products/goodwe6",
        checks: [
          ["AC output", "Running load, surge and phase define the power requirement."],
          ["PV input", "MPPT voltage/current windows shape array design."],
          ["Battery path", "Voltage, current and communication must align."],
          ["Architecture", "On-grid, hybrid and off-grid systems behave differently."],
        ],
      },
      battery: {
        kicker: "LITHIUM BATTERIES",
        title: "The storage layer.",
        description:
          "Battery sizing starts with load × time, but real selection also depends on voltage class, charge/discharge current, BMS communication and operating reserve.",
        image: "/assets/products-real/hithium16.webp",
        alt: "HiTHIUM HEROEE 16 LiFePO4 Lithium Battery",
        href: "/products/hithium16",
        checks: [
          ["Capacity", "kWh describes stored energy."],
          ["Usable energy", "Reserve and operating limits reduce usable capacity."],
          ["Power limits", "Current limits affect how fast energy can move."],
          ["Communication", "BMS and inverter integration must be verified."],
        ],
      },
      protection: {
        kicker: "PROTECTION",
        title: "The engineering layer customers rarely see.",
        description:
          "A safe installation also needs suitable isolation, protection, cable sizing, earthing, connectors, distribution and mounting details.",
        image: "/assets/products-real/sys6-51.jpg",
        alt: "6kW 5.1kWh Single Phase Off-Grid Hybrid Solar System",
        href: "/customer-support",
        checks: [
          ["DC side", "Array isolation and protection require engineering."],
          ["AC side", "Distribution protection must match the installation."],
          ["Earthing", "Grounding and surge strategy depend on site conditions."],
          ["Execution", "Qualified technical installation is essential."],
        ],
      },
      monitoring: {
        kicker: "MONITORING",
        title: "Make energy flow visible.",
        description:
          "Monitoring can help users understand generation, consumption, battery state and grid interaction. Exact data depends on system hardware and communications.",
        image: "/assets/products-real/goodwe6.jpg",
        alt: "GoodWe 6kW Single Phase Off-Grid Hybrid Inverter",
        href: "#energy-simulator",
        checks: [
          ["Generation", "Track PV power and energy over time."],
          ["Consumption", "See when and how the site uses energy."],
          ["Storage", "Observe battery state and charge/discharge behaviour."],
          ["Diagnostics", "System status can support technical review."],
        ],
      },
    };

    const showTopic = (key: string) => {
      const data = topics[key];
      if (!data) return;

      $$<HTMLButtonElement>("[data-topic]").forEach((button) =>
        button.classList.toggle("active", button.dataset.topic === key),
      );

      const image = $<HTMLImageElement>("#topicImage");
      if (image) {
        image.src = data.image;
        image.alt = data.alt;
      }

      text("topicK", data.kicker);
      text("topicT", data.title);
      text("topicP", data.description);

      const checks = $<HTMLElement>("#topicChecks");
      if (checks) {
        checks.innerHTML = data.checks
          .map(
            ([label, value]) =>
              `<article><small>${label}</small><b>${label}</b><p>${value}</p></article>`,
          )
          .join("");
      }

      const link = $<HTMLAnchorElement>("#topicLink");
      if (link) {
        link.href = data.href;
        link.textContent =
          key === "monitoring" ? "Open Monitoring Demo →" : "Explore Related Product →";
      }
    };

    $$<HTMLButtonElement>("[data-topic]").forEach((button) => {
      button.onclick = () => showTopic(button.dataset.topic ?? "panel");
    });
    showTopic("panel");

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="engineeringLabRoot"
      dangerouslySetInnerHTML={{
        __html: `<div class="demoPage techLabPage">${PAGE_HTML}</div>`,
      }}
    />
  );
}
