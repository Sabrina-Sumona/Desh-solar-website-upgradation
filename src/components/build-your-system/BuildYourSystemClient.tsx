"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type PropertyType =
  | "Home"
  | "Business"
  | "Factory"
  | "Agriculture"
  | "Filling Station"
  | "Other";

type GoalType =
  | "Reduce Grid Use"
  | "Backup"
  | "Solar + Backup"
  | "Maximum Independence"
  | "Expert Advice";

type Appliance = {
  name: string;
  watts: number;
  surge: number;
  max: number;
};

type ApplianceKey = keyof typeof applianceLibrary;

type LoadGroup = {
  icon: string;
  title: string;
  note: string;
  items: ApplianceKey[];
};

type LoadPreset = {
  name: string;
  qty: Partial<Record<ApplianceKey, number>>;
};

type LoadProfile = {
  title: string;
  text: string;
  groups: LoadGroup[];
  presets: LoadPreset[];
};

type BuilderState = {
  property: PropertyType;
  goal: GoalType;
  bill: number;
  units: number;
  tariff: number;
  phase: string;
  dayUse: number;
  backupHours: number;
  roofArea: number;
  roofType: string;
  shade: number;
  solarOffset: number;
  qty: Record<string, number>;
};

const stdInverters = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 18, 20, 25, 30, 40, 50];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthFactors = [0.78, 0.84, 0.94, 1.04, 1.08, 0.94, 0.79, 0.82, 0.89, 0.98, 1, 0.85];
const stepNames = ["Property", "Goal", "Appliances", "Backup", "Roof", "Electricity", "Your System"];

const applianceLibrary = {
  fan: { name: "Ceiling Fan", watts: 75, surge: 1.3, max: 100 },
  ac1: { name: "1 Ton AC", watts: 1200, surge: 2.3, max: 50 },
  ac15: { name: "1.5 Ton AC", watts: 1700, surge: 2.3, max: 50 },
  ac2: { name: "2 Ton AC", watts: 2300, surge: 2.3, max: 40 },
  light: { name: "LED Light", watts: 12, surge: 1, max: 300 },
  highbay: { name: "LED High-Bay Light", watts: 100, surge: 1.05, max: 200 },
  canopy: { name: "Canopy / Forecourt Light", watts: 100, surge: 1.05, max: 200 },
  fridge: { name: "Refrigerator", watts: 180, surge: 3, max: 50 },
  microwave: { name: "Microwave", watts: 1200, surge: 1.15, max: 20 },
  geyser: { name: "Geyser", watts: 2000, surge: 1, max: 20 },
  purifier: { name: "Water Purifier", watts: 40, surge: 1.2, max: 30 },
  washing: { name: "Washing Machine", watts: 500, surge: 1.8, max: 20 },
  tv: { name: "Television", watts: 120, surge: 1.1, max: 100 },
  router: { name: "Router / ONU", watts: 20, surge: 1, max: 100 },
  laptop: { name: "Laptop", watts: 90, surge: 1.05, max: 200 },
  desktop: { name: "Desktop PC", watts: 250, surge: 1.2, max: 300 },
  monitor: { name: "Monitor", watts: 40, surge: 1, max: 300 },
  printer: { name: "Printer / Copier", watts: 500, surge: 1.5, max: 40 },
  server: { name: "Small Server / NAS", watts: 600, surge: 1.35, max: 40 },
  cctv: { name: "CCTV / NVR System", watts: 120, surge: 1.1, max: 50 },
  dispenser: { name: "Water Dispenser", watts: 500, surge: 1.4, max: 30 },
  signage: { name: "Illuminated Signage", watts: 300, surge: 1.05, max: 30 },
  pos: { name: "POS / Control Terminal", watts: 100, surge: 1.05, max: 50 },
  pump: { name: "Water Pump", watts: 750, surge: 3, max: 30 },
  pump15: { name: "1.5 HP Pump", watts: 1100, surge: 3, max: 20 },
  pump3: { name: "3 HP Pump", watts: 2200, surge: 3, max: 20 },
  pump55: { name: "5.5 HP Pump", watts: 4100, surge: 3, max: 20 },
  motor2: { name: "2 HP Motor", watts: 1500, surge: 3, max: 40 },
  motor5: { name: "5 HP Motor", watts: 3700, surge: 3, max: 40 },
  motor10: { name: "10 HP Motor", watts: 7500, surge: 3, max: 30 },
  ventFan: { name: "Industrial Ventilation Fan", watts: 250, surge: 2, max: 100 },
  compressor: { name: "Air Compressor", watts: 3000, surge: 3, max: 20 },
  welder: { name: "Welding Machine", watts: 5000, surge: 1.8, max: 20 },
  machine5kw: { name: "Machinery Load Block", watts: 5000, surge: 1.8, max: 50 },
  coldRoom: { name: "Small Cold Room / Freezer", watts: 1500, surge: 3, max: 20 },
  farmFan: { name: "Farm / Shed Ventilation Fan", watts: 250, surge: 2, max: 100 },
  fuelDispenser: { name: "Fuel Dispenser", watts: 1000, surge: 1.6, max: 20 },
  custom500: { name: "Other Load Block — 500W", watts: 500, surge: 1.3, max: 100 },
  custom1000: { name: "Other Load Block — 1kW", watts: 1000, surge: 1.4, max: 100 },
  custom5000: { name: "Other Load Block — 5kW", watts: 5000, surge: 1.7, max: 50 },
} satisfies Record<string, Appliance>;

const propertyLoadProfiles: Record<PropertyType, LoadProfile> = {
  Home: {
    title: "Home appliance profile",
    text: "Residential loads with comfort, kitchen, electronics and utility equipment. Add only the appliances that need solar or backup.",
    groups: [
      { icon: "❄", title: "Cooling & Comfort", note: "Common residential comfort loads.", items: ["fan", "ac1", "ac15", "ac2"] },
      { icon: "⌂", title: "Home & Kitchen", note: "Kitchen and household utility loads.", items: ["light", "fridge", "microwave", "geyser", "purifier", "washing"] },
      { icon: "◉", title: "Electronics", note: "Entertainment, internet and personal computing.", items: ["tv", "router", "laptop", "desktop"] },
      { icon: "⚙", title: "Utilities", note: "Water and other occasional household loads.", items: ["pump", "custom500"] },
    ],
    presets: [
      { name: "Essential Backup", qty: { light: 6, fan: 4, fridge: 1, router: 1, tv: 1 } },
      { name: "Family Home", qty: { light: 10, fan: 6, fridge: 1, tv: 2, router: 1, laptop: 2, pump: 1 } },
      { name: "Home + AC", qty: { light: 10, fan: 5, fridge: 1, tv: 1, router: 1, laptop: 2, ac15: 1, pump: 1 } },
    ],
  },
  Business: {
    title: "Office / business load profile",
    text: "Commercial loads focus on daytime cooling, lighting, workstations, networking and essential facility services.",
    groups: [
      { icon: "❄", title: "Climate & Lighting", note: "Daytime cooling and customer/workspace lighting.", items: ["ac1", "ac15", "ac2", "fan", "light"] },
      { icon: "▤", title: "Office & IT", note: "Workstations, printing, networking and security.", items: ["desktop", "laptop", "monitor", "router", "printer", "server", "cctv"] },
      { icon: "⌂", title: "Facility Loads", note: "Common support equipment in offices and retail spaces.", items: ["fridge", "dispenser", "pump", "signage", "custom1000"] },
    ],
    presets: [
      { name: "Small Office", qty: { light: 12, ac15: 2, desktop: 8, laptop: 2, router: 2, printer: 1, cctv: 1 } },
      { name: "Retail Shop", qty: { light: 16, ac15: 2, fan: 4, desktop: 2, router: 1, cctv: 1, fridge: 1, signage: 1 } },
      { name: "IT Office", qty: { light: 16, ac2: 3, desktop: 15, monitor: 15, router: 3, server: 1, cctv: 1 } },
    ],
  },
  Factory: {
    title: "Factory / industrial load profile",
    text: "Industrial planning emphasizes motors, machinery, compressor loads, production lighting and three-phase electrical review.",
    groups: [
      { icon: "⚙", title: "Production & Motors", note: "High-surge industrial loads that strongly affect inverter architecture.", items: ["motor2", "motor5", "motor10", "machine5kw", "compressor", "welder"] },
      { icon: "▥", title: "Facility Loads", note: "Lighting, ventilation, cooling and utility support.", items: ["highbay", "ventFan", "ac2", "pump"] },
      { icon: "◉", title: "Control & Office", note: "Control-room, networking and monitoring loads.", items: ["desktop", "router", "cctv", "server"] },
      { icon: "◇", title: "Other Process Loads", note: "Use load blocks for equipment not listed individually.", items: ["custom1000", "custom5000"] },
    ],
    presets: [
      { name: "Light Workshop", qty: { highbay: 12, ventFan: 4, motor2: 2, motor5: 1, compressor: 1, desktop: 2, router: 1 } },
      { name: "Motor Plant", qty: { highbay: 16, motor5: 3, motor10: 1, compressor: 1, machine5kw: 2 } },
      { name: "Shift Support", qty: { highbay: 20, ventFan: 8, ac2: 2, desktop: 4, router: 2, cctv: 2 } },
    ],
  },
  Agriculture: {
    title: "Agriculture / irrigation load profile",
    text: "Agriculture planning starts with pump horsepower, operating loads and daytime solar use before considering storage.",
    groups: [
      { icon: "♒", title: "Pumps & Motors", note: "Irrigation and water-lifting loads with strong motor startup surge.", items: ["pump15", "pump3", "pump55", "motor2"] },
      { icon: "☀", title: "Farm Operations", note: "Ventilation, cold storage, lighting and auxiliary water loads.", items: ["farmFan", "coldRoom", "light", "pump"] },
      { icon: "◉", title: "Monitoring & Support", note: "Remote connectivity and basic site security.", items: ["router", "cctv", "custom1000"] },
    ],
    presets: [
      { name: "1.5 HP Pump", qty: { pump15: 1 } },
      { name: "3 HP Pump", qty: { pump3: 1 } },
      { name: "5.5 HP Pump", qty: { pump55: 1 } },
      { name: "Farm + Cold Room", qty: { pump3: 1, farmFan: 6, coldRoom: 1, light: 8, cctv: 1, router: 1 } },
    ],
  },
  "Filling Station": {
    title: "Filling station load profile",
    text: "A filling-station profile combines forecourt equipment, lighting, office loads, security and support machinery.",
    groups: [
      { icon: "⛽", title: "Forecourt & Operations", note: "Operational loads around dispensing and service areas.", items: ["fuelDispenser", "compressor", "pump", "signage"] },
      { icon: "☀", title: "Lighting & Security", note: "Canopy, site lighting and security systems.", items: ["canopy", "light", "cctv"] },
      { icon: "▤", title: "Office & Comfort", note: "Office, networking and staff/customer comfort loads.", items: ["ac15", "fan", "desktop", "router", "printer", "fridge", "pos"] },
      { icon: "◇", title: "Other Loads", note: "Add a general block for miscellaneous station equipment.", items: ["custom1000"] },
    ],
    presets: [
      { name: "Essential Station", qty: { canopy: 12, fuelDispenser: 2, cctv: 1, router: 1, desktop: 1, signage: 1, pos: 1 } },
      { name: "Full Operations", qty: { fuelDispenser: 4, canopy: 16, compressor: 1, pump: 1, ac15: 2, desktop: 2, router: 1, cctv: 1, fridge: 1, signage: 2, pos: 2 } },
      { name: "Critical Backup", qty: { fuelDispenser: 2, canopy: 8, desktop: 1, router: 1, cctv: 1, signage: 1, pos: 1 } },
    ],
  },
  Other: {
    title: "Custom / mixed project load profile",
    text: "Use a broad set of common and heavy loads as a starting point, then refine the project with Desh Solar technical review.",
    groups: [
      { icon: "⌂", title: "Common Loads", note: "Basic comfort and facility loads.", items: ["light", "fan", "ac15", "fridge"] },
      { icon: "◉", title: "IT & Security", note: "Computing, networking and monitoring.", items: ["desktop", "laptop", "router", "cctv"] },
      { icon: "⚙", title: "Heavy Loads", note: "Pumps, motors and compressor-class equipment.", items: ["pump", "motor2", "motor5", "compressor"] },
      { icon: "◇", title: "Custom Load Blocks", note: "Flexible placeholders for unlisted equipment.", items: ["custom500", "custom1000", "custom5000"] },
    ],
    presets: [
      { name: "Basic Mixed", qty: { light: 10, fan: 4, router: 1, desktop: 2 } },
      { name: "Mixed Commercial", qty: { light: 16, ac15: 2, desktop: 6, router: 1, pump: 1, cctv: 1 } },
      { name: "Heavy Mixed", qty: { light: 12, motor2: 2, motor5: 1, compressor: 1, custom1000: 2 } },
    ],
  },
};

const emptyQty = () =>
  Object.keys(applianceLibrary).reduce<Record<string, number>>((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {});

const fmt = (n: number) => Math.round(n).toLocaleString();
const round1 = (n: number) => (Math.round(n * 10) / 10).toFixed(1);
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const formatWatts = (w: number) => (w >= 1000 ? `${(w / 1000).toFixed(w % 1000 ? 1 : 0)} kW` : `${w} W`);

function nextLowerInverter(v: number) {
  const idx = stdInverters.indexOf(v);
  return idx > 0 ? stdInverters[idx - 1] : v;
}

function nextHigherInverter(v: number) {
  const idx = stdInverters.indexOf(v);
  return idx >= 0 && idx < stdInverters.length - 1 ? stdInverters[idx + 1] : v;
}

export default function BuildYourSystemClient() {
  const wizardRef = useRef<HTMLElement | null>(null);
  const mobileProgressRef = useRef<HTMLDivElement | null>(null);

  const [step, setStep] = useState(0);
  const [property, setProperty] = useState<PropertyType>("Home");
  const [goal, setGoal] = useState<GoalType>("Solar + Backup");
  const [bill, setBill] = useState(6000);
  const [units, setUnits] = useState(500);
  const [tariff, setTariff] = useState(12);
  const [phase, setPhase] = useState("Single phase");
  const [dayUse, setDayUse] = useState(60);
  const [backupHours, setBackupHours] = useState(4);
  const [customBackup, setCustomBackup] = useState("");
  const [roofArea, setRoofArea] = useState(800);
  const [roofType, setRoofType] = useState("Flat concrete roof");
  const [shade, setShade] = useState(1);
  const [solarOffset, setSolarOffset] = useState(70);
  const [qty, setQty] = useState<Record<string, number>>(emptyQty);
  const [selectedProduct, setSelectedProduct] = useState<{ name: string; type: string; rating: number | null } | null>(null);

  const loadProfile = propertyLoadProfiles[property];

  const state: BuilderState = useMemo(
    () => ({ property, goal, bill, units, tariff, phase, dayUse, backupHours, roofArea, roofType, shade, solarOffset, qty }),
    [property, goal, bill, units, tariff, phase, dayUse, backupHours, roofArea, roofType, shade, solarOffset, qty],
  );

  const calc = useMemo(() => {
    const visibleKeys = new Set(loadProfile.groups.flatMap((group) => group.items));
    let running = 0;
    let largestSurgeExtra = 0;
    let applianceCount = 0;

    visibleKeys.forEach((key) => {
      const item = applianceLibrary[key];
      const q = state.qty[key] || 0;
      running += q * item.watts;
      applianceCount += q;
      if (q > 0) largestSurgeExtra = Math.max(largestSurgeExtra, item.watts * (item.surge - 1));
    });

    const peak = running + largestSurgeExtra;
    const inverterNeed = Math.max(0.8, (peak * 1.15) / 1000);
    let inverterClass = stdInverters.find((v) => v >= inverterNeed) || Math.ceil(inverterNeed / 5) * 5;
    if ((state.phase === "Three phase" || state.property === "Factory") && inverterClass < 10) inverterClass = 10;
    if (state.property === "Agriculture" && inverterClass < 3 && running > 0) inverterClass = 3;

    const batteryKWh = running > 0 ? (running * state.backupHours) / 1000 / (0.9 * 0.85) : 0;
    const effectiveUnits = state.units > 0 ? state.units : state.bill / Math.max(1, state.tariff);
    const dailyUseCalc = effectiveUnits / 30;
    const desiredEnergy = dailyUseCalc * (state.solarOffset / 100);
    const targetPV = desiredEnergy / (4.5 * 0.82);
    const roofPotential = (state.roofArea / 65) * state.shade;
    const pvPlanning = state.roofArea > 0 ? Math.max(0, Math.min(targetPV, roofPotential)) : targetPV;
    const panelCount = pvPlanning > 0 ? Math.max(1, Math.ceil((pvPlanning * 1000) / 590)) : 0;
    const actualPV = panelCount * 0.59;
    const dailyGen = actualPV * 4.5 * 0.82;
    const monthlyGen = dailyGen * 30;
    const annualGen = dailyGen * 365;
    const coveredUnits = Math.min(effectiveUnits, monthlyGen);
    const coveredPct = effectiveUnits > 0 ? (coveredUnits / effectiveUnits) * 100 : 0;
    const billBefore = effectiveUnits * state.tariff;
    const billAfter = Math.max(0, (effectiveUnits - coveredUnits) * state.tariff);

    let profile = "Residential Hybrid System";
    if (state.property === "Business") profile = "Commercial Hybrid Solar System";
    if (state.property === "Factory") profile = "Industrial Solar Engineering Profile";
    if (state.property === "Agriculture") profile = "Agriculture / Irrigation Solar Profile";
    if (state.property === "Filling Station") profile = "Filling Station Hybrid Energy Profile";
    if (state.property === "Other") profile = "Custom Solar Project Profile";
    if (state.goal === "Reduce Grid Use") profile = `${profile.replace("Hybrid ", "").replace("Hybrid Energy ", "")} — Solar Offset Focus`;
    if (state.goal === "Backup") profile += " — Backup Focus";
    if (state.goal === "Maximum Independence") profile += " — High Independence Focus";
    if (state.goal === "Expert Advice") profile = "Technical Consultation Profile";

    let path = "Define property loads → backup hours → roof potential → electricity context → verify inverter, battery and PV compatibility.";
    if (state.goal === "Reduce Grid Use") path = "Monthly energy → solar offset target → installation area → PV/inverter architecture.";
    if (state.goal === "Backup") path = "Essential loads → startup surge → backup hours → inverter + storage architecture.";
    if (state.property === "Factory") path = "Electrical data → phase + motor surge → roof/site survey → engineered project proposal.";
    if (state.property === "Agriculture") path = "Pump rating → operating hours → solar window → irrigation system architecture.";
    if (state.goal === "Expert Advice") path = "Collect site data → technical consultation → engineered recommendation.";

    let pkgTitle = "Custom technical design";
    let pkgText = "Your profile does not closely match a small published package path. A Desh Solar technical review is the appropriate next step.";
    if (inverterClass <= 6 && batteryKWh <= 7) {
      pkgTitle = "Closest listed path: 6 kW / 5.1 kWh class";
      pkgText = "A current Desh Solar listing includes a 6 kW single-phase off-grid hybrid system with roughly 5.1 kWh storage. Your final load, backup and compatibility still require verification.";
    } else if (inverterClass <= 8 && batteryKWh <= 18) {
      pkgTitle = "Closest listed path: 8 kW / 16 kWh class";
      pkgText = "A current Desh Solar listing includes an 8 kW single-phase off-grid hybrid system with roughly 16 kWh storage. Treat this as a comparison point, not an automatic match.";
    } else if (inverterClass <= 18 && batteryKWh <= 18) {
      pkgTitle = "Closest listed path: 18 kW / 15 kWh class";
      pkgText = "Desh Solar currently lists an 18 kW / 15 kWh-class off-grid hybrid package. A technical review should determine whether this architecture is appropriate.";
    } else if (inverterClass <= 18 && batteryKWh <= 35) {
      pkgTitle = "Closest listed path: 18 kW / 30 kWh class";
      pkgText = "Desh Solar currently lists an 18 kW / 30 kWh-class off-grid hybrid package. The final design should verify load, phase and battery/inverter compatibility.";
    } else if (inverterClass <= 18 && batteryKWh <= 52) {
      pkgTitle = "Closest listed path: 18 kW / 48 kWh class";
      pkgText = "Desh Solar currently lists an 18 kW / 48 kWh-class off-grid hybrid package for larger storage needs. Final engineering verification is required.";
    }

    return {
      running,
      peak,
      inverterNeed,
      inverterClass,
      batteryKWh,
      effectiveUnits,
      dailyUse: dailyUseCalc,
      targetPV,
      roofPotential,
      pvPlanning,
      panelCount,
      actualPV,
      dailyGen,
      monthlyGen,
      annualGen,
      coveredUnits,
      coveredPct,
      billBefore,
      billAfter,
      profile,
      path,
      pkgTitle,
      pkgText,
      applianceCount,
    };
  }, [loadProfile.groups, state]);

  const makeProfileText = useCallback(() => {
    return [
      "DESH SOLAR — PRELIMINARY SOLAR SYSTEM PROFILE",
      "==============================================",
      `Property: ${state.property}`,
      `Primary goal: ${state.goal}`,
      `Electrical phase: ${state.phase}`,
      `Monthly energy: ~${fmt(calc.effectiveUnits)} kWh`,
      `Monthly bill input: ৳ ${fmt(state.bill)}`,
      `Connected planning load: ${fmt(calc.running)} W`,
      `Planning peak / surge: ${fmt(calc.peak)} W`,
      `Backup target: ${round1(state.backupHours)} hours`,
      `Suggested inverter class: ${calc.inverterClass} kW`,
      `Planning battery energy: ${round1(calc.batteryKWh)} kWh`,
      `Usable roof / installation area: ${fmt(state.roofArea)} sq ft`,
      `Roof type: ${state.roofType}`,
      `Target solar offset: ${state.solarOffset}%`,
      `Planning PV: ${round1(calc.actualPV)} kWp`,
      `Panel estimate: ${calc.panelCount} × 590W equivalent`,
      `Estimated daily generation: ${round1(calc.dailyGen)} kWh/day`,
      `Estimated monthly generation: ${fmt(calc.monthlyGen)} kWh/month`,
      `Estimated annual generation: ${fmt(calc.annualGen)} kWh/year`,
      `Illustrative bill before solar: ৳ ${fmt(calc.billBefore)}/month`,
      `Illustrative grid cost after solar: ৳ ${fmt(calc.billAfter)}/month`,
      `Closest listed package path: ${calc.pkgTitle}`,
      "",
      `Planning path: ${calc.path}`,
      "",
      "IMPORTANT: This is a preliminary planning estimate only. Final system design, product compatibility, protection, generation, savings and backup runtime require Desh Solar technical verification.",
    ].join("\n");
  }, [calc, state]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const propertyMap: Record<string, PropertyType> = {
      home: "Home",
      business: "Business",
      factory: "Factory",
      agriculture: "Agriculture",
      filling: "Filling Station",
      other: "Other",
    };
    const goalMap: Record<string, GoalType> = {
      backup: "Backup",
      saving: "Reduce Grid Use",
      both: "Solar + Backup",
      project: "Expert Advice",
    };

    const propertyParam = params.get("property");
    const initialProperty =
      propertyParam && propertyMap[propertyParam]
        ? propertyMap[propertyParam]
        : null;

    const goalParam = params.get("goal");
    const initialGoal =
      goalParam && goalMap[goalParam]
        ? goalMap[goalParam]
        : null;

    const billParam = Number(params.get("bill"));
    const hoursParam = Number(params.get("hours"));
    const selectedName = params.get("selectedName");
    const rating = Number(params.get("selectedRating"));

    const timer = window.setTimeout(() => {
      if (initialProperty) setProperty(initialProperty);
      if (initialGoal) setGoal(initialGoal);
      if (billParam > 0) setBill(billParam);

      if (hoursParam > 0) {
        setBackupHours(hoursParam);
        setCustomBackup(String(hoursParam));
      }

      if (selectedName) {
        setSelectedProduct({
          name: selectedName,
          type: params.get("productType") || "product",
          rating: Number.isFinite(rating) && rating > 0 ? rating : null,
        });
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("deshSolarPreliminaryProfile", makeProfileText());
    } catch {
      // Local storage is optional; page remains fully usable without it.
    }
  }, [makeProfileText]);

  const selectedProductStatus = useMemo(() => {
    if (!selectedProduct) return "";
    if (selectedProduct.type === "inverter" && selectedProduct.rating) {
      return calc.inverterClass <= selectedProduct.rating
        ? `Planning check: current recommendation is ${calc.inverterClass} kW class, within the selected ${selectedProduct.rating} kW headline rating. Final compatibility still requires technical verification.`
        : `Planning alert: current recommendation is ${calc.inverterClass} kW class, above the selected ${selectedProduct.rating} kW headline rating. Review a larger inverter class.`;
    }
    return `Selected ${selectedProduct.type} • complete the wizard to review it against your planning profile.`;
  }, [calc.inverterClass, selectedProduct]);

  const chooseProperty = (value: PropertyType) => {
    setProperty(value);
    setQty(emptyQty());
    if (value === "Factory") setPhase("Three phase");
    if (value === "Home" && phase === "Three phase") setPhase("Single phase");
  };

  const applyPreset = (preset: LoadPreset) => {
    const next = { ...qty };
    loadProfile.groups.flatMap((group) => group.items).forEach((key) => {
      next[key] = 0;
    });
    Object.entries(preset.qty).forEach(([key, value]) => {
      next[key] = Number(value) || 0;
    });
    setQty(next);
  };

  const clearVisibleLoads = () => {
    const next = { ...qty };
    loadProfile.groups.flatMap((group) => group.items).forEach((key) => {
      next[key] = 0;
    });
    setQty(next);
  };

  const showStep = (nextStep: number, scroll = true) => {
    const next = clamp(nextStep, 0, 6);
    setStep(next);
    if (scroll && window.innerWidth <= 860) {
      window.requestAnimationFrame(() => {
        mobileProgressRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  const downloadProfile = () => {
    const blob = new Blob([makeProfileText()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "desh-solar-preliminary-system-profile.txt";
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const restart = () => {
    setStep(0);
    wizardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const pct = ((step + 1) / 7) * 100;
  const batteryFill = calc.batteryKWh ? clamp(25 + calc.batteryKWh * 2.2, 25, 100) : 10;
  const visibleRoofPanels = Math.min(Math.max(calc.panelCount, 0), 30);
  const roofColumns = visibleRoofPanels <= 8 ? 4 : visibleRoofPanels <= 18 ? 5 : 6;
  const chartValues = monthFactors.map((factor) => calc.monthlyGen * factor);
  const chartMax = Math.max(...chartValues, 1);
  const valueInv = Math.max(nextLowerInverter(calc.inverterClass), Math.ceil((calc.running * 1.15) / 1000));
  const maxInv = nextHigherInverter(calc.inverterClass);

  return (
    <div className="buildSystemPrototype">
      <div className="bysPage">
        <section className="bysIntro">
          <div className="bysIntroCopy">
            <div className="bysEyebrow">Desh Solar Smart System Builder</div>
            <h1>
              Design around your <em>real energy life.</em>
            </h1>
            <p>
              Tell us what you power, how long you need backup and how much roof you have. The builder turns that into a clear preliminary solar profile and matching Desh Solar product paths.
            </p>
            <div className="bysIntroActions">
              <a className="bysPrimary" href="#bysWizard">Start My Solar Design →</a>
              <Link className="bysSecondary" href="/products">Explore Products</Link>
            </div>
            <div className="bysIntroNote">
              Planning estimates only. Final sizing, protection, phase, surge, compatibility and installation must be verified by Desh Solar technical personnel.
            </div>
          </div>

          <div className="bysIntroVisual">
            <div className="bysSystemPreview">
              <div className="grid" />
              <div className="bysFlow">
                <div className="bysFlowInner">
                  <div className="bysFlowNode"><i>☀</i><b>Sun</b><small>Energy</small></div>
                  <span className="bysFlowLine" />
                  <div className="bysFlowNode"><i>▦</i><b>Panels</b><small>{calc.panelCount ? `${calc.panelCount} × 590W` : "— panels"}</small></div>
                  <span className="bysFlowLine" />
                  <div className="bysFlowNode"><i>↯</i><b>Inverter</b><small>{calc.running ? `${calc.inverterClass} kW` : "— kW"}</small></div>
                  <span className="bysFlowLine" />
                  <div className="bysFlowNode"><i>▣</i><b>Battery</b><small>{calc.batteryKWh ? `${round1(calc.batteryKWh)} kWh` : "— kWh"}</small></div>
                  <span className="bysFlowLine" />
                  <div className="bysFlowNode"><i>⌂</i><b>Loads</b><small>{calc.running ? `${fmt(calc.running)} W` : "— W"}</small></div>
                </div>
              </div>
              <div className="bysPreviewStats">
                <div className="bysPreviewStat"><small>Planning PV</small><b>{calc.actualPV ? `${round1(calc.actualPV)} kWp` : "Waiting for inputs"}</b></div>
                <div className="bysPreviewStat"><small>Backup target</small><b>{round1(backupHours)} hours</b></div>
                <div className="bysPreviewStat"><small>Current step</small><b>{stepNames[step]}</b></div>
              </div>
            </div>
          </div>
        </section>

        <div className="bysMobileProgress" ref={mobileProgressRef}>
          <div className="bysMobileProgressTop"><span>Build Your System</span><b>Step {step + 1} of 7</b></div>
          <div className="bysMobileProgressBar"><span style={{ width: `${pct}%` }} /></div>
        </div>

        {selectedProduct && (
          <div className="bysSelectedProductBanner show">
            <div><small>Selected from Products</small><b>{selectedProduct.name}</b></div>
            <div className="bysSelectedProductStatus">{selectedProductStatus}</div>
          </div>
        )}

        <section className="bysWizardShell" id="bysWizard" ref={wizardRef}>
          <aside className="bysStepsNav">
            <div className="bysNavHead"><small>Guided solar design</small><b>7-step planning flow</b></div>
            {[
              ["Property", "What are we powering?"],
              ["Goal", "What matters most?"],
              ["Appliances", "Property-based load profile"],
              ["Backup", "How many hours?"],
              ["Roof", "PV installation potential"],
              ["Electricity", "Bill, units & phase"],
              ["Your System", "Profile & product paths"],
            ].map(([title, sub], index) => (
              <button key={title} className={`bysStepNav${step === index ? " active" : ""}${index < step ? " complete" : ""}`} onClick={() => showStep(index, false)} type="button">
                <span className="bysStepNumber">{String(index + 1).padStart(2, "0")}</span>
                <span><b>{title}</b><small>{sub}</small></span>
              </button>
            ))}
          </aside>

          <div className="bysWizardMain">
            <div className="bysProgressTop"><span style={{ width: `${pct}%` }} /></div>

            <section className={`bysStep${step === 0 ? " active" : ""}`}>
              <div className="bysStepHeader">
                <div className="bysStepKicker">Step 01 • Property</div>
                <h2>What are you powering?</h2>
                <p>Choose the environment first. The same solar hardware behaves very differently in a home, business, factory or irrigation project.</p>
              </div>
              <div className="bysChoiceGrid">
                {[
                  ["Home", "⌂", "Home", "Residential rooftop, family loads, backup and hybrid solar."],
                  ["Business", "▦", "Office / Business", "Commercial daytime use, backup continuity and electricity-cost reduction."],
                  ["Factory", "▥", "Factory / Industry", "Large three-phase loads, motors, machinery and project engineering."],
                  ["Agriculture", "♒", "Agriculture / Irrigation", "Pumps, daytime operation, rural sites and agricultural energy use."],
                  ["Filling Station", "⛽", "Filling Station", "Commercial facility backup, lighting, pumps and integrated solar power."],
                  ["Other", "◇", "Other Project", "Start with a general profile and move into technical consultation."],
                ].map(([value, icon, title, text]) => (
                  <button type="button" key={value} className={`bysChoiceCard${property === value ? " selected" : ""}`} onClick={() => chooseProperty(value as PropertyType)}>
                    <span className="bysChoiceIcon">{icon}</span><b>{title}</b><small>{text}</small>
                  </button>
                ))}
              </div>
            </section>

            <section className={`bysStep${step === 1 ? " active" : ""}`}>
              <div className="bysStepHeader">
                <div className="bysStepKicker">Step 02 • Goal</div>
                <h2>What do you want solar to do?</h2>
                <p>The builder changes its planning emphasis depending on whether your main priority is savings, backup or maximum continuity.</p>
              </div>
              <div className="bysChoiceGrid">
                {[
                  ["Reduce Grid Use", "↓", "Reduce Electricity Bill", "Prioritize solar generation and daytime grid offset."],
                  ["Backup", "▣", "Backup During Outages", "Prioritize inverter headroom, essential loads and storage."],
                  ["Solar + Backup", "↯", "Solar + Backup", "Balance generation, battery storage and outage continuity."],
                  ["Maximum Independence", "∞", "Maximum Energy Independence", "Plan for higher solar contribution and stronger storage coverage."],
                  ["Expert Advice", "?", "I Need Expert Advice", "Collect the basics and let Desh Solar engineers determine the right architecture."],
                ].map(([value, icon, title, text]) => (
                  <button type="button" key={value} className={`bysChoiceCard${goal === value ? " selected" : ""}`} onClick={() => setGoal(value as GoalType)}>
                    <span className="bysChoiceIcon">{icon}</span><b>{title}</b><small>{text}</small>
                  </button>
                ))}
              </div>
            </section>

            <section className={`bysStep${step === 2 ? " active" : ""}`}>
              <div className="bysStepHeader">
                <div className="bysStepKicker">Step 03 • Appliances</div>
                <h2>What needs to stay powered?</h2>
                <p>Your appliance list now adapts to the property selected in Step 1. Add only the loads that matter; motors and compressors include higher startup multipliers.</p>
              </div>
              <div className="bysPropertyLoadHeader">
                <div>
                  <small>{property.toUpperCase()} LOAD PROFILE</small>
                  <h3>{loadProfile.title}</h3>
                  <p>{loadProfile.text}</p>
                </div>
                <div className="bysPresetPanel">
                  <span>Quick presets</span>
                  <div className="bysPresetButtons">
                    {loadProfile.presets.map((preset) => (
                      <button key={preset.name} className="bysPresetBtn" type="button" onClick={() => applyPreset(preset)}>{preset.name}</button>
                    ))}
                    <button className="bysPresetBtn clear" type="button" onClick={clearVisibleLoads}>Clear all</button>
                  </div>
                </div>
              </div>

              <div className="bysApplianceGroups">
                {loadProfile.groups.map((group) => (
                  <section className="bysApplianceGroup" key={group.title}>
                    <h3><span>{group.icon}</span>{group.title}</h3>
                    <p>{group.note}</p>
                    <div className="bysApplianceGrid">
                      {group.items.map((key) => {
                        const item = applianceLibrary[key];
                        return (
                          <div className="bysAppliance" key={key}>
                            <div className="bysApplianceTop"><b>{item.name}</b><small>{formatWatts(item.watts)}{item.surge > 1.6 ? " • surge" : ""}</small></div>
                            <div className="bysQtyInputWrap">
                              <label htmlFor={`qty-${key}`}>Quantity</label>
                              <input
                                className="bysQtyInput"
                                id={`qty-${key}`}
                                type="number"
                                min={0}
                                max={item.max}
                                step={1}
                                inputMode="numeric"
                                value={qty[key] || 0}
                                onChange={(event) => {
                                  const value = clamp(Number.parseInt(event.target.value || "0", 10) || 0, 0, item.max);
                                  setQty((current) => ({ ...current, [key]: value }));
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
              <div className="bysLoadBar"><span>Current planning connected load</span><b>{fmt(calc.running)} W</b></div>
            </section>

            <section className={`bysStep${step === 3 ? " active" : ""}`}>
              <div className="bysStepHeader">
                <div className="bysStepKicker">Step 04 • Backup</div>
                <h2>How long should the selected loads run?</h2>
                <p>Battery capacity is estimated from the selected load, backup duration and simplified efficiency/reserve assumptions.</p>
              </div>
              <div className="bysBackupOptions">
                {[2, 4, 6, 8, 12].map((hours) => (
                  <button key={hours} type="button" className={`bysBackupBtn${!customBackup && backupHours === hours ? " selected" : ""}`} onClick={() => { setBackupHours(hours); setCustomBackup(""); }}>
                    <b>{hours}h</b><small>{hours === 2 ? "Short backup" : hours === 4 ? "Balanced" : hours === 6 ? "Extended" : hours === 8 ? "Long backup" : "Maximum demo"}</small>
                  </button>
                ))}
              </div>
              <div className="bysField bysCustomBackupField">
                <label>Custom backup duration (hours)</label>
                <input className="bysInput" max={24} min={0.5} placeholder="Optional custom value" step={0.5} type="number" value={customBackup} onChange={(event) => { setCustomBackup(event.target.value); const value = Number(event.target.value); if (value > 0) setBackupHours(value); }} />
              </div>
              <div className="bysBatteryViz">
                <div className="bysBattery"><div className="bysBatteryFill" style={{ width: `${batteryFill}%` }} /></div>
                <div className="bysBatteryInfo"><small>Planning storage requirement</small><strong>{round1(calc.batteryKWh)} kWh</strong><p>{calc.running ? `Based on ${fmt(calc.running)} W connected planning load for ${round1(backupHours)} hours, with simplified efficiency and reserve factors.` : "Add appliances to calculate battery capacity."}</p></div>
              </div>
            </section>

            <section className={`bysStep${step === 4 ? " active" : ""}`}>
              <div className="bysStepHeader">
                <div className="bysStepKicker">Step 05 • Roof</div>
                <h2>How much usable installation area is available?</h2>
                <p>The roof visualization uses a simplified space allowance per 590 W panel, including a planning margin for access and spacing. Final placement still requires a site survey.</p>
              </div>
              <div className="bysRoofLayout">
                <div className="bysRoofControls">
                  <div className="bysField"><label>Usable rooftop / installation area (sq ft)</label><input className="bysInput" min={0} type="number" value={roofArea} onChange={(e) => setRoofArea(Math.max(0, Number(e.target.value) || 0))} /></div>
                  <div className="bysField"><label>Roof / installation type</label><select className="bysSelect" value={roofType} onChange={(e) => setRoofType(e.target.value)}><option>Flat concrete roof</option><option>Metal / industrial roof</option><option>Ground mount</option><option>Other / not sure</option></select></div>
                  <div className="bysField"><label>Approximate shading condition</label><select className="bysSelect" value={shade} onChange={(e) => setShade(Number(e.target.value))}><option value="1">Low shading</option><option value=".9">Some shading / obstruction</option><option value=".75">Significant shading</option><option value=".85">Not sure</option></select></div>
                  <div className="bysRangeWrap"><label className="bysRangeLabel">Target solar offset</label><input className="bysRange" max={100} min={30} step={5} type="range" value={solarOffset} onChange={(e) => setSolarOffset(Number(e.target.value))} /><div className="bysRangeLabels"><span>30%</span><b>{solarOffset}%</b><span>100%</span></div></div>
                </div>
                <div className="bysRoofViz">
                  <div className="bysPanelField" style={{ gridTemplateColumns: `repeat(${roofColumns}, 1fr)` }}>
                    {Array.from({ length: visibleRoofPanels }).map((_, index) => <span className="bysRoofPanel" key={index} />)}
                  </div>
                  <div className="bysRoofLabel"><div><span>Approx. panel count</span><b>{calc.panelCount ? `${calc.panelCount} panels` : "—"}</b></div><div><span>Roof-limited PV potential</span><b>{calc.roofPotential ? `${round1(calc.roofPotential)} kWp potential` : "—"}</b></div></div>
                </div>
              </div>
            </section>

            <section className={`bysStep${step === 5 ? " active" : ""}`}>
              <div className="bysStepHeader">
                <div className="bysStepKicker">Step 06 • Electricity</div>
                <h2>Give the system some energy context.</h2>
                <p>Monthly units are more useful than a bill, but either one can provide a rough starting scale. The tariff here is only an illustrative planning input.</p>
              </div>
              <div className="bysFormGrid">
                <div className="bysField"><label>Monthly electricity bill (৳)</label><input className="bysInput" min={0} placeholder="Example: 6000" type="number" value={bill} onChange={(e) => setBill(Math.max(0, Number(e.target.value) || 0))} /><div className="bysFieldHelp">Used only for an illustrative bill-offset view.</div></div>
                <div className="bysField"><label>Monthly electricity use / units (kWh)</label><input className="bysInput" min={0} placeholder="Example: 500" type="number" value={units} onChange={(e) => setUnits(Math.max(0, Number(e.target.value) || 0))} /><div className="bysFieldHelp">If known, this becomes the main energy-sizing input.</div></div>
                <div className="bysField"><label>Electrical phase</label><select className="bysSelect" value={phase} onChange={(e) => setPhase(e.target.value)}><option>Single phase</option><option>Three phase</option><option>Not sure</option></select></div>
                <div className="bysField"><label>Illustrative tariff (৳ / unit)</label><input className="bysInput" min={1} step={0.1} type="number" value={tariff} onChange={(e) => setTariff(Math.max(1, Number(e.target.value) || 12))} /><div className="bysFieldHelp">Not a utility tariff quote. Change it if you want to test a different assumption.</div></div>
                <div className="bysField full"><label>How much of your electricity is typically used during daylight?</label><div className="bysRangeWrap"><input className="bysRange" max={90} min={20} step={5} type="range" value={dayUse} onChange={(e) => setDayUse(Number(e.target.value))} /><div className="bysRangeLabels"><span>Mostly night</span><b>{dayUse}% daytime</b><span>Mostly day</span></div></div></div>
              </div>
            </section>

            <section className={`bysStep${step === 6 ? " active" : ""}`} id="bysResultsStep">
              <div className="bysStepHeader">
                <div className="bysStepKicker">Step 07 • Your Solar System</div>
                <h2>Your preliminary solar profile.</h2>
                <p>This is a planning recommendation, not a final engineering design. Use it to understand system scale and start a more informed Desh Solar consultation.</p>
              </div>
              <div className="bysResults">
                <div className="bysResultHero">
                  <div className="bysResultPrimary">
                    <small>Planning recommendation</small><h3>{calc.profile}</h3>
                    <div className="bysResultMetrics">
                      <div className="bysResultMetric"><span>Connected Load</span><b>{fmt(calc.running)} W</b></div>
                      <div className="bysResultMetric"><span>Planning Surge</span><b>{fmt(calc.peak)} W</b></div>
                      <div className="bysResultMetric"><span>Inverter Class</span><b>{calc.inverterClass} kW class</b></div>
                      <div className="bysResultMetric"><span>Battery Planning</span><b>{round1(calc.batteryKWh)} kWh</b></div>
                      <div className="bysResultMetric"><span>PV Planning</span><b>{round1(calc.actualPV)} kWp</b></div>
                      <div className="bysResultMetric"><span>590W Panel Count</span><b>{calc.panelCount ? `${calc.panelCount} × 590W` : "—"}</b></div>
                    </div>
                  </div>
                  <div className="bysResultDiagram">
                    <div className="bysFinalFlow">
                      <div className="bysFinalNode"><i>☀</i><b>Sun</b></div><span className="bysFinalArrow">→</span>
                      <div className="bysFinalNode"><i>▦</i><b>{calc.panelCount ? `${calc.panelCount} panels` : "Panels"}</b></div><span className="bysFinalArrow">→</span>
                      <div className="bysFinalNode"><i>↯</i><b>{calc.inverterClass} kW</b></div><span className="bysFinalArrow">→</span>
                      <div className="bysFinalNode"><i>▣</i><b>{round1(calc.batteryKWh)} kWh</b></div><span className="bysFinalArrow">→</span>
                      <div className="bysFinalNode"><i>⌂</i><b>Loads</b></div>
                    </div>
                  </div>
                </div>

                <section className="bysResultSection">
                  <div className="bysResultSectionHead"><h3>Estimated energy & bill view</h3><p>Illustrative planning only</p></div>
                  <div className="bysEnergyGrid">
                    <div className="bysEnergyNumbers">
                      <div className="bysEnergyNumber"><small>Estimated daily solar generation</small><b>{round1(calc.dailyGen)} kWh/day</b></div>
                      <div className="bysEnergyNumber"><small>Estimated monthly generation</small><b>{fmt(calc.monthlyGen)} kWh/month</b></div>
                      <div className="bysEnergyNumber"><small>Estimated annual generation</small><b>{fmt(calc.annualGen)} kWh/year</b></div>
                      <div className="bysBillSplit"><div className="bysBillCard"><small>Illustrative bill before solar</small><b>৳ {fmt(calc.billBefore)}/mo</b></div><div className="bysBillCard solar"><small>Illustrative grid cost after solar</small><b>৳ {fmt(calc.billAfter)}/mo</b></div></div>
                    </div>
                    <div><div className="bysBarChart">{chartValues.map((value, index) => <div className="bysBar" key={months[index]} style={{ height: `${clamp((value / chartMax) * 100, 10, 100)}%` }} title={`${months[index]}: ${fmt(value)} kWh`}><span>{months[index].slice(0, 1)}</span></div>)}</div></div>
                  </div>
                </section>

                <section className="bysResultSection">
                  <div className="bysResultSectionHead"><h3>Matching Desh Solar product paths</h3><p>Compatibility must be technically confirmed</p></div>
                  <div className="bysProductMatches">
                    <article className="bysProductMatch"><span className="matchType">Solar Panel</span><h4>Jinko Tiger Neo 590W</h4><p>{calc.panelCount ? `Planning result uses ${calc.panelCount} × 590W-equivalent panels (~${round1(calc.actualPV)} kWp). The Jinko Tiger Neo 590W listing is a current Desh Solar catalogue example to review.` : "Add energy and roof inputs to calculate a panel planning count."}</p><Link href="/products/jinko590">View Product Details →</Link></article>
                    <article className="bysProductMatch"><span className="matchType">Hybrid Inverter</span><h4>{calc.inverterClass <= 6 ? "GoodWe GW6K-EO-G20" : `${calc.inverterClass} kW project-class inverter selection`}</h4><p>{calc.inverterClass <= 6 ? `The current GoodWe 6 kW Desh Solar listing is a relevant catalogue example for a ${calc.inverterClass} kW planning class, subject to load, surge, battery and phase verification.` : "Your calculated planning class is above the featured 6 kW GoodWe example. Use Desh Solar technical review to select a suitable inverter architecture and model."}</p>{calc.inverterClass <= 6 && <Link href="/products/goodwe6">View Product Details →</Link>}</article>
                    <article className="bysProductMatch"><span className="matchType">Storage</span><h4>{calc.batteryKWh <= 17 ? "HiTHIUM HEROEE 16 / LVTOPSUN G3 class" : "Scalable / multi-battery storage design"}</h4><p>{calc.batteryKWh <= 17 ? `Your storage planning result is around ${round1(calc.batteryKWh)} kWh. Current Desh Solar LiFePO4 catalogue options around the 15–16 kWh class are useful comparison points, but electrical/BMS compatibility must be verified.` : `Your planning storage requirement is around ${round1(calc.batteryKWh)} kWh, so a scalable or multi-battery architecture should be technically reviewed.`}</p><Link href="/products?category=battery">Browse batteries →</Link></article>
                  </div>
                </section>

                <section className="bysResultSection">
                  <div className="bysResultSectionHead"><h3>Three planning directions</h3><p>Understand the trade-off instead of seeing one answer</p></div>
                  <div className="bysAlternatives">
                    <article className="bysAlternative"><small>Best Value</small><h4>Lean planning</h4><div className="bysAltLine"><span>Inverter</span><b>{valueInv} kW class</b></div><div className="bysAltLine"><span>Battery</span><b>{round1(calc.batteryKWh * 0.75)} kWh</b></div><div className="bysAltLine"><span>PV</span><b>{round1(calc.actualPV * 0.85)} kWp</b></div></article>
                    <article className="bysAlternative recommended"><small>Recommended</small><h4>Balanced planning</h4><div className="bysAltLine"><span>Inverter</span><b>{calc.inverterClass} kW class</b></div><div className="bysAltLine"><span>Battery</span><b>{round1(calc.batteryKWh)} kWh</b></div><div className="bysAltLine"><span>PV</span><b>{round1(calc.actualPV)} kWp</b></div></article>
                    <article className="bysAlternative"><small>Maximum Backup</small><h4>More storage headroom</h4><div className="bysAltLine"><span>Inverter</span><b>{maxInv} kW class</b></div><div className="bysAltLine"><span>Battery</span><b>{round1(calc.batteryKWh * 1.5)} kWh</b></div><div className="bysAltLine"><span>PV</span><b>{round1(calc.actualPV * 1.1)} kWp</b></div></article>
                  </div>
                </section>

                <section className="bysResultSection">
                  <div className="bysResultSectionHead"><h3>Why this system?</h3><p>Plain-language engineering logic</p></div>
                  <div className="bysWhyList">
                    <div className="bysWhy"><b>Why this inverter class?</b><p>{calc.running ? `Your selected appliances total about ${fmt(calc.running)} W. The planner adds the largest startup-surge event and 15% headroom, producing a peak planning figure of about ${fmt(calc.peak)} W and routing you to the next practical inverter class.` : "Add appliances so the builder can estimate continuous load, startup surge and inverter headroom."}</p></div>
                    <div className="bysWhy"><b>Why this battery capacity?</b><p>{calc.running ? `The storage estimate uses the selected ${round1(backupHours)}-hour target with simplified inverter efficiency and reserve factors. Real battery sizing must also consider C-rate, BMS current limits, temperature and allowable depth of discharge.` : "Battery capacity will be based on the selected planning load and desired backup duration."}</p></div>
                    <div className="bysWhy"><b>Why this PV size?</b><p>The PV calculation targets {solarOffset}% of roughly {fmt(calc.effectiveUnits)} monthly units, then checks the result against about {fmt(roofArea)} sq ft of usable area and the selected shading condition. The final panel layout needs a site survey.</p></div>
                  </div>
                </section>

                <section className="bysResultSection">
                  <div className="bysResultSectionHead"><h3>Closest listed Desh Solar system path</h3><p>Not a compatibility guarantee</p></div>
                  <div className="bysWhy"><b>{calc.pkgTitle}</b><p>{calc.pkgText}</p></div>
                </section>

                <div className="bysResultActions">
                  <button type="button" onClick={() => window.print()}>Save / Print PDF</button>
                  <button className="secondary" type="button" onClick={downloadProfile}>Download Profile</button>
                  <Link href="/contact?source=builder">Request Engineering Review →</Link>
                  <button className="secondary" type="button" onClick={restart}>Start Again</button>
                </div>
                <div className="bysDisclaimer">This tool is an educational/preliminary planner. Actual solar generation, savings, battery runtime and equipment selection depend on site survey, weather, shading, duty cycle, surge, phase, cable/protection design, battery limits, inverter compatibility and approved engineering. Verify current products, prices, stock, specifications and warranty terms with Desh Solar.</div>
              </div>
            </section>

            <div className="bysFooterNav">
              <button type="button" disabled={step === 0} onClick={() => showStep(step - 1)}>← Back</button>
              <span className="bysStepCounter">Step {step + 1} of 7</span>
              {step !== 6 && <button className="primary" type="button" onClick={() => showStep(step + 1)}>Continue →</button>}
            </div>
          </div>

          <aside className="bysLivePanel">
            <div className="bysLiveHead"><small>Live system preview</small><h3>{calc.profile}</h3></div>
            <div className="bysMiniSystem"><div className="bysMiniFlow"><div className="bysMiniNode">☀</div><span className="bysMiniArrow">→</span><div className="bysMiniNode">▦</div><span className="bysMiniArrow">→</span><div className="bysMiniNode">↯</div><span className="bysMiniArrow">→</span><div className="bysMiniNode">▣</div><span className="bysMiniArrow">→</span><div className="bysMiniNode">⌂</div></div></div>
            <div className="bysLiveMetrics">
              <div className="bysLiveMetric"><span>Property</span><b>{property}</b></div>
              <div className="bysLiveMetric"><span>Goal</span><b>{goal}</b></div>
              <div className="bysLiveMetric"><span>Connected load</span><b>{fmt(calc.running)} W</b></div>
              <div className="bysLiveMetric"><span>Planning surge</span><b>{fmt(calc.peak)} W</b></div>
              <div className="bysLiveMetric"><span>Inverter class</span><b>{calc.inverterClass} kW class</b></div>
              <div className="bysLiveMetric"><span>Battery</span><b>{round1(calc.batteryKWh)} kWh</b></div>
              <div className="bysLiveMetric"><span>PV</span><b>{calc.actualPV > 0 ? `${round1(calc.actualPV)} kWp` : "—"}</b></div>
              <div className="bysLiveMetric"><span>Panel count</span><b>{calc.panelCount ? `${calc.panelCount} × 590W` : "—"}</b></div>
            </div>
            <div className="bysLiveProfile"><small>Current planning path</small><b>{calc.path}</b></div>
          </aside>
        </section>
      </div>

      <section className="futureBand">
        <div className="countryMark">BD</div>
        <small>Desh Solar • Bangladesh</small>
        <h2>POWERING BANGLADESH FORWARD.</h2>
      </section>
    </div>
  );
}
