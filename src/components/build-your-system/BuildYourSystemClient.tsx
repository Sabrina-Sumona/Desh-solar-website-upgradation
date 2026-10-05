"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import { products, type Product } from "@/data/products";

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

type BuilderProductCategory = "panel" | "inverter" | "battery";

type SystemBuilderSelection = {
  panelId: string;
  inverterId: string;
  batteryId: string;
  panelQty: number;
  batteryQty: number;
};

type ProductCheck = {
  state: "good" | "warn" | "review";
  label: string;
  detail: string;
};

type StoredSystemBuildProduct = {
  id: string;
  category?: Product["category"];
  addedAt?: string;
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


const CART_KEY = "deshSolarCartV1";

const SYSTEM_BUILD_KEY =
  "deshSolarSystemBuildV1";

const readStoredSystemBuild = () => {
  if (typeof window === "undefined") {
    return [] as StoredSystemBuildProduct[];
  }

  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(
        SYSTEM_BUILD_KEY,
      ) || "[]",
    );

    return Array.isArray(parsed)
      ? parsed.filter(
          (
            item,
          ): item is StoredSystemBuildProduct =>
            Boolean(
              item &&
                typeof item.id ===
                  "string",
            ),
        )
      : [];
  } catch {
    return [];
  }
};

const resolveStoredSystemProducts = () =>
  readStoredSystemBuild()
    .map((stored) =>
      products.find(
        (product) =>
          product.id === stored.id,
      ),
    )
    .filter(
      (
        product,
      ): product is Product =>
        Boolean(product),
    );

const numericPower = (value: string) => {
  const match = value.match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : null;
};

const panelPowerKW = (product: Product | null) => {
  if (!product || product.category !== "panel") return null;

  const value = numericPower(product.power);
  if (!value) return null;

  return /\bkw\b/i.test(product.power) ? value : value / 1000;
};

const inverterPowerKW = (product: Product | null) => {
  if (!product || product.category !== "inverter") return null;

  const value = numericPower(product.power);
  return value && /\bkw\b/i.test(product.power) ? value : null;
};

const batteryCapacityKWh = (product: Product | null) => {
  if (!product || product.category !== "battery") return null;

  const direct = product.power.match(/(\d+(?:\.\d+)?)\s*kwh/i);
  if (direct) return Number(direct[1]);

  const voltage = product.power.match(/(\d+(?:\.\d+)?)\s*v/i);
  const ampHours = product.power.match(/(\d+(?:\.\d+)?)\s*ah/i);

  if (voltage && ampHours) {
    return (Number(voltage[1]) * Number(ampHours[1])) / 1000;
  }

  return null;
};

const productLooksThreePhase = (product: Product | null) => {
  if (!product) return false;
  const haystack = `${product.name} ${product.search}`.toLowerCase();
  return haystack.includes("three phase") || haystack.includes("3-phase");
};

const productLooksSinglePhase = (product: Product | null) => {
  if (!product) return false;
  const haystack = `${product.name} ${product.search}`.toLowerCase();
  return haystack.includes("single phase");
};

const buildCartItem = (product: Product, qty: number) => ({
  id: product.id,
  name: product.name,
  price: product.price ?? 0,
  priceText: product.priceText,
  image: product.image,
  category: product.categoryLabel,
  quoteOnly: product.price === null,
  qty: Math.max(1, Math.min(99, Math.round(qty))),
});

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
  const systemBuilderRef = useRef<HTMLElement | null>(null);

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

  const [
    catalogSystemProducts,
    setCatalogSystemProducts,
  ] = useState<Product[]>([]);

  const [systemBuilderOpen, setSystemBuilderOpen] = useState(false);
  const [builderMounted, setBuilderMounted] = useState(false);
  const [builderPicker, setBuilderPicker] = useState<BuilderProductCategory | null>(null);
  const [builderMessage, setBuilderMessage] = useState("");
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [builderCustomer, setBuilderCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    location: "",
  });
  const [builderContactError, setBuilderContactError] = useState("");
  const [builderContactSubmitting, setBuilderContactSubmitting] = useState(false);
  const [builderSelection, setBuilderSelection] = useState<SystemBuilderSelection>({
    panelId: "",
    inverterId: "",
    batteryId: "",
    panelQty: 1,
    batteryQty: 1,
  });

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
    const params =
      new URLSearchParams(
        window.location.search,
      );

    const propertyMap:
      Record<string, PropertyType> = {
        home: "Home",
        business: "Business",
        factory: "Factory",
        agriculture: "Agriculture",
        filling: "Filling Station",
        other: "Other",
      };

    const goalMap:
      Record<string, GoalType> = {
        backup: "Backup",
        saving: "Reduce Grid Use",
        both: "Solar + Backup",
        project: "Expert Advice",
        independence: "Maximum Independence",
      };

    const propertyParam =
      params.get("property");

    const initialProperty =
      propertyParam &&
      propertyMap[propertyParam]
        ? propertyMap[propertyParam]
        : null;

    const goalParam =
      params.get("goal");

    const initialGoal =
      goalParam &&
      goalMap[goalParam]
        ? goalMap[goalParam]
        : null;

    const billParam =
      Number(params.get("bill"));

    const hoursParam =
      Number(params.get("hours"));

    const selectedName =
      params.get("selectedName");

    const selectedType =
      params.get("productType") ||
      "product";

    const selectedRatingText =
      params.get("selectedRating") ||
      "";

    const selectedRating =
      numericPower(
        selectedRatingText,
      );

    const syncCatalogueSelections =
      () => {
        const resolved =
          resolveStoredSystemProducts();

        setCatalogSystemProducts(
          resolved,
        );

        /*
         * When the page was opened from a product card,
         * show the most recently saved catalogue product
         * in the existing "Selected from Products" banner.
         * URL-based selection is still supported and wins.
         */
        if (
          !selectedName &&
          resolved.length > 0
        ) {
          const latest =
            resolved[
              resolved.length - 1
            ];

          setSelectedProduct({
            name: latest.name,
            type: latest.category,
            rating:
              latest.category ===
              "inverter"
                ? inverterPowerKW(
                    latest,
                  )
                : null,
          });
        }

        if (
          !selectedName &&
          resolved.length === 0
        ) {
          setSelectedProduct(null);
        }
      };

    syncCatalogueSelections();

    const timer =
      window.setTimeout(() => {
        if (initialProperty) {
          setProperty(
            initialProperty,
          );
        }

        if (initialGoal) {
          setGoal(initialGoal);
        }

        if (billParam > 0) {
          setBill(billParam);
        }

        if (hoursParam > 0) {
          setBackupHours(
            hoursParam,
          );

          setCustomBackup(
            String(hoursParam),
          );
        }

        if (selectedName) {
          setSelectedProduct({
            name: selectedName,
            type: selectedType,
            rating:
              selectedRating &&
              selectedRating > 0
                ? selectedRating
                : null,
          });
        }
      }, 0);

    const handleSystemBuildChange =
      () => {
        syncCatalogueSelections();
      };

    const handleStorage = (
      event: StorageEvent,
    ) => {
      if (
        !event.key ||
        event.key ===
          SYSTEM_BUILD_KEY
      ) {
        syncCatalogueSelections();
      }
    };

    window.addEventListener(
      "deshsolar:systembuildchange",
      handleSystemBuildChange,
    );

    window.addEventListener(
      "storage",
      handleStorage,
    );

    return () => {
      window.clearTimeout(timer);

      window.removeEventListener(
        "deshsolar:systembuildchange",
        handleSystemBuildChange,
      );

      window.removeEventListener(
        "storage",
        handleStorage,
      );
    };
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

  const builderPanel = useMemo(
    () => products.find((product) => product.id === builderSelection.panelId) ?? null,
    [builderSelection.panelId],
  );

  const builderInverter = useMemo(
    () => products.find((product) => product.id === builderSelection.inverterId) ?? null,
    [builderSelection.inverterId],
  );

  const builderBattery = useMemo(
    () => products.find((product) => product.id === builderSelection.batteryId) ?? null,
    [builderSelection.batteryId],
  );

  const builderPanelKW = panelPowerKW(builderPanel);
  const builderInverterKW = inverterPowerKW(builderInverter);
  const builderBatteryKWh = batteryCapacityKWh(builderBattery);

  const builderPVTotal =
    builderPanelKW && builderSelection.panelQty
      ? builderPanelKW * builderSelection.panelQty
      : 0;

  const builderBatteryTotal =
    builderBatteryKWh && builderSelection.batteryQty
      ? builderBatteryKWh * builderSelection.batteryQty
      : 0;

  const panelCheck: ProductCheck = useMemo(() => {
    if (!builderPanel || !builderPanelKW) {
      return {
        state: "review",
        label: "Panel selection needed",
        detail: "Choose a catalogue solar panel to build the PV array.",
      };
    }

    if (builderPanelKW < 0.3) {
      return {
        state: "warn",
        label: "Small / portable panel",
        detail:
          "This product is below the typical primary-array size used by this planner. Review before using it as the main PV module.",
      };
    }

    if (calc.actualPV <= 0) {
      return {
        state: "review",
        label: "PV target not established",
        detail: "Complete the planning inputs to compare array size.",
      };
    }

    if (builderPVTotal + 0.01 >= calc.actualPV) {
      return {
        state: "good",
        label: "PV capacity covered",
        detail: `${round1(builderPVTotal)} kWp selected vs ${round1(calc.actualPV)} kWp planning target.`,
      };
    }

    return {
      state: "warn",
      label: "PV array below target",
      detail: `${round1(builderPVTotal)} kWp selected vs ${round1(calc.actualPV)} kWp planning target.`,
    };
  }, [builderPanel, builderPanelKW, builderPVTotal, calc.actualPV]);

  const inverterCheck: ProductCheck = useMemo(() => {
    if (!builderInverter || !builderInverterKW) {
      return {
        state: "review",
        label: "Inverter selection needed",
        detail: "Choose a catalogue inverter for the planned system.",
      };
    }

    const needsThreePhase =
      state.phase === "Three phase" || state.property === "Factory";

    const phaseMismatch =
      (needsThreePhase && productLooksSinglePhase(builderInverter)) ||
      (!needsThreePhase &&
        state.phase === "Single phase" &&
        productLooksThreePhase(builderInverter));

    if (phaseMismatch) {
      return {
        state: "warn",
        label: "Electrical phase needs review",
        detail: `${builderInverter.power} product selected for a ${state.phase.toLowerCase()} planning profile.`,
      };
    }

    if (builderInverterKW + 0.01 >= calc.inverterClass) {
      return {
        state: "good",
        label: "Inverter class covered",
        detail: `${builderInverterKW} kW selected vs ${calc.inverterClass} kW planning class.`,
      };
    }

    return {
      state: "warn",
      label: "Inverter below planning class",
      detail: `${builderInverterKW} kW selected vs ${calc.inverterClass} kW planning class.`,
    };
  }, [
    builderInverter,
    builderInverterKW,
    calc.inverterClass,
    state.phase,
    state.property,
  ]);

  const batteryCheck: ProductCheck = useMemo(() => {
    if (!builderBattery) {
      return {
        state: "review",
        label: "Battery selection needed",
        detail: "Choose a catalogue battery to build the storage system.",
      };
    }

    if (!builderBatteryKWh) {
      return {
        state: "review",
        label: "Capacity needs technical review",
        detail:
          "The catalogue headline does not provide enough information for an automatic kWh check.",
      };
    }

    if (calc.batteryKWh <= 0) {
      return {
        state: "review",
        label: "Storage target not established",
        detail: "Add loads and backup hours to calculate the storage target.",
      };
    }

    if (builderBatteryTotal + 0.01 >= calc.batteryKWh) {
      return {
        state: "good",
        label: "Storage target covered",
        detail: `${round1(builderBatteryTotal)} kWh selected vs ${round1(calc.batteryKWh)} kWh planning target.`,
      };
    }

    return {
      state: "warn",
      label: "Storage below target",
      detail: `${round1(builderBatteryTotal)} kWh selected vs ${round1(calc.batteryKWh)} kWh planning target.`,
    };
  }, [
    builderBattery,
    builderBatteryKWh,
    builderBatteryTotal,
    calc.batteryKWh,
  ]);

  const builderChecks = [panelCheck, inverterCheck, batteryCheck];
  const builderWarningCount = builderChecks.filter(
    (check) => check.state === "warn",
  ).length;
  const builderGoodCount = builderChecks.filter(
    (check) => check.state === "good",
  ).length;

  const builderSubtotal = useMemo(() => {
    const panelTotal =
      (builderPanel?.price ?? 0) * builderSelection.panelQty;
    const inverterTotal = builderInverter?.price ?? 0;
    const batteryTotal =
      (builderBattery?.price ?? 0) * builderSelection.batteryQty;

    return panelTotal + inverterTotal + batteryTotal;
  }, [
    builderBattery,
    builderInverter,
    builderPanel,
    builderSelection.batteryQty,
    builderSelection.panelQty,
  ]);

  const builderHasQuoteOnly =
    Boolean(builderPanel && builderPanel.price === null) ||
    Boolean(builderInverter && builderInverter.price === null) ||
    Boolean(builderBattery && builderBattery.price === null);

  const pickerProducts = useMemo(() => {
    if (!builderPicker) return [];

    const list = products.filter(
      (product) => product.category === builderPicker,
    );

    if (builderPicker === "panel") {
      return [...list].sort((a, b) => {
        const aPower = panelPowerKW(a) ?? 0;
        const bPower = panelPowerKW(b) ?? 0;

        return (
          Math.abs(aPower - 0.59) -
            Math.abs(bPower - 0.59) ||
          a.featuredOrder - b.featuredOrder
        );
      });
    }

    if (builderPicker === "inverter") {
      return [...list].sort((a, b) => {
        const aPower = inverterPowerKW(a) ?? 0;
        const bPower = inverterPowerKW(b) ?? 0;

        const aUnder =
          aPower < calc.inverterClass ? 1 : 0;
        const bUnder =
          bPower < calc.inverterClass ? 1 : 0;

        const aPhasePenalty =
          state.phase === "Three phase" &&
          productLooksSinglePhase(a)
            ? 1
            : 0;

        const bPhasePenalty =
          state.phase === "Three phase" &&
          productLooksSinglePhase(b)
            ? 1
            : 0;

        return (
          aUnder - bUnder ||
          aPhasePenalty - bPhasePenalty ||
          Math.abs(aPower - calc.inverterClass) -
            Math.abs(bPower - calc.inverterClass) ||
          a.featuredOrder - b.featuredOrder
        );
      });
    }

    return [...list].sort((a, b) => {
      const aCapacity = batteryCapacityKWh(a);
      const bCapacity = batteryCapacityKWh(b);

      if (!aCapacity && bCapacity) return 1;
      if (aCapacity && !bCapacity) return -1;

      if (!aCapacity || !bCapacity) {
        return a.featuredOrder - b.featuredOrder;
      }

      const aQty = Math.max(
        1,
        Math.ceil(calc.batteryKWh / aCapacity),
      );
      const bQty = Math.max(
        1,
        Math.ceil(calc.batteryKWh / bCapacity),
      );

      const aScore =
        Math.abs(aCapacity * aQty - calc.batteryKWh) +
        Math.max(0, aQty - 1) * 0.8;

      const bScore =
        Math.abs(bCapacity * bQty - calc.batteryKWh) +
        Math.max(0, bQty - 1) * 0.8;

      return aScore - bScore || a.featuredOrder - b.featuredOrder;
    });
  }, [
    builderPicker,
    calc.batteryKWh,
    calc.inverterClass,
    state.phase,
  ]);

  useEffect(() => {
    setBuilderMounted(true);
  }, []);

  useEffect(() => {
    if (!contactModalOpen) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleEscape = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        closeBuilderContactModal();
      }
    };

    window.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [contactModalOpen]);

  useEffect(() => {
    if (!builderPicker) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setBuilderPicker(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [builderPicker]);

  const recommendedPanelProduct = () =>
    products.find((product) => product.id === "jinko590") ??
    products
      .filter((product) => product.category === "panel")
      .sort(
        (a, b) =>
          Math.abs((panelPowerKW(a) ?? 0) - 0.59) -
          Math.abs((panelPowerKW(b) ?? 0) - 0.59),
      )[0] ??
    null;

  const recommendedInverterProduct = () => {
    const needsThreePhase =
      state.phase === "Three phase" ||
      state.property === "Factory";

    const candidates = products
      .filter((product) => product.category === "inverter")
      .map((product) => ({
        product,
        rating: inverterPowerKW(product) ?? 0,
      }))
      .filter(({ rating }) => rating > 0)
      .sort((a, b) => {
        const aUnder =
          a.rating < calc.inverterClass ? 1 : 0;
        const bUnder =
          b.rating < calc.inverterClass ? 1 : 0;

        const aPhasePenalty =
          needsThreePhase &&
          productLooksSinglePhase(a.product)
            ? 1
            : 0;

        const bPhasePenalty =
          needsThreePhase &&
          productLooksSinglePhase(b.product)
            ? 1
            : 0;

        return (
          aUnder - bUnder ||
          aPhasePenalty - bPhasePenalty ||
          Math.abs(a.rating - calc.inverterClass) -
            Math.abs(b.rating - calc.inverterClass) ||
          a.product.featuredOrder - b.product.featuredOrder
        );
      });

    return candidates[0]?.product ?? null;
  };

  const recommendedBatteryProduct = () => {
    const candidates = products
      .filter((product) => product.category === "battery")
      .map((product) => ({
        product,
        capacity: batteryCapacityKWh(product),
      }))
      .filter(
        (
          item,
        ): item is {
          product: Product;
          capacity: number;
        } => item.capacity !== null && item.capacity > 0,
      )
      .map((item) => {
        const qtyNeeded = Math.max(
          1,
          Math.ceil(calc.batteryKWh / item.capacity),
        );

        const total = item.capacity * qtyNeeded;

        return {
          ...item,
          qtyNeeded,
          score:
            Math.abs(total - calc.batteryKWh) +
            Math.max(0, qtyNeeded - 1) * 0.8,
        };
      })
      .sort(
        (a, b) =>
          a.score - b.score ||
          a.product.featuredOrder - b.product.featuredOrder,
      );

    return candidates[0] ?? null;
  };

  const openSystemBuilder = () => {
    /*
     * Prefer catalogue products explicitly chosen through
     * "Use in My System". Any missing category still receives
     * the normal automatic recommendation.
     */
    const savedPanel =
      [...catalogSystemProducts]
        .reverse()
        .find(
          (product) =>
            product.category ===
            "panel",
        ) ?? null;

    const savedInverter =
      [...catalogSystemProducts]
        .reverse()
        .find(
          (product) =>
            product.category ===
            "inverter",
        ) ?? null;

    const savedBattery =
      [...catalogSystemProducts]
        .reverse()
        .find(
          (product) =>
            product.category ===
            "battery",
        ) ?? null;

    const panel =
      savedPanel ??
      recommendedPanelProduct();

    const inverter =
      savedInverter ??
      recommendedInverterProduct();

    const recommendedBattery =
      recommendedBatteryProduct();

    const batteryProduct =
      savedBattery ??
      recommendedBattery?.product ??
      null;

    const panelKW =
      panelPowerKW(panel);

    const panelQty =
      panelKW &&
      calc.actualPV > 0
        ? Math.max(
            1,
            Math.ceil(
              calc.actualPV /
                panelKW,
            ),
          )
        : 1;

    const savedBatteryCapacity =
      batteryCapacityKWh(
        batteryProduct,
      );

    const batteryQty =
      savedBattery &&
      savedBatteryCapacity &&
      calc.batteryKWh > 0
        ? Math.max(
            1,
            Math.ceil(
              calc.batteryKWh /
                savedBatteryCapacity,
            ),
          )
        : savedBattery
          ? 1
          : recommendedBattery
              ?.qtyNeeded ?? 1;

    setBuilderSelection({
      panelId: panel?.id ?? "",
      inverterId:
        inverter?.id ?? "",
      batteryId:
        batteryProduct?.id ?? "",
      panelQty,
      batteryQty,
    });

    const importedProducts = [
      savedPanel,
      savedInverter,
      savedBattery,
    ].filter(
      (
        product,
      ): product is Product =>
        Boolean(product),
    );

    setBuilderMessage(
      importedProducts.length
        ? `${importedProducts.length} catalogue selection${
            importedProducts.length ===
            1
              ? ""
              : "s"
          } loaded from My System. Missing component categories were filled with planning recommendations.`
        : "",
    );

    setSystemBuilderOpen(true);

    window.requestAnimationFrame(
      () => {
        systemBuilderRef.current
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      },
    );
  };

  const openBuilderPicker = (
    category: BuilderProductCategory,
  ) => {
    setBuilderMessage("");
    setBuilderPicker(category);
  };

  const selectBuilderProduct = (product: Product) => {
    const nextSelection: SystemBuilderSelection = {
      ...builderSelection,
    };

    if (product.category === "panel") {
      const rating = panelPowerKW(product);

      nextSelection.panelId = product.id;
      nextSelection.panelQty =
        rating && calc.actualPV > 0
          ? Math.max(1, Math.ceil(calc.actualPV / rating))
          : Math.max(1, builderSelection.panelQty);
    } else if (product.category === "inverter") {
      nextSelection.inverterId = product.id;
    } else if (product.category === "battery") {
      const capacity = batteryCapacityKWh(product);

      nextSelection.batteryId = product.id;
      nextSelection.batteryQty =
        capacity && calc.batteryKWh > 0
          ? Math.max(1, Math.ceil(calc.batteryKWh / capacity))
          : Math.max(1, builderSelection.batteryQty);
    } else {
      return;
    }

    flushSync(() => {
      setBuilderSelection(nextSelection);
      setBuilderMessage(
        `${product.name} selected for the system design.`,
      );
    });

    setBuilderPicker(null);
  };

  const addBuiltSystemToCart = () => {
    const selected = [
      builderPanel
        ? buildCartItem(
            builderPanel,
            builderSelection.panelQty,
          )
        : null,
      builderInverter
        ? buildCartItem(builderInverter, 1)
        : null,
      builderBattery
        ? buildCartItem(
            builderBattery,
            builderSelection.batteryQty,
          )
        : null,
    ].filter(
      (
        item,
      ): item is ReturnType<typeof buildCartItem> =>
        item !== null,
    );

    if (!selected.length) {
      setBuilderMessage(
        "Choose at least one catalogue product first.",
      );
      return;
    }

    try {
      const stored = JSON.parse(
        window.localStorage.getItem(CART_KEY) || "[]",
      );

      const next = Array.isArray(stored)
        ? [...stored]
        : [];

      selected.forEach((item) => {
        const existingIndex = next.findIndex(
          (cartItem) =>
            String(cartItem?.id) === item.id,
        );

        if (existingIndex >= 0) {
          next[existingIndex] = {
            ...next[existingIndex],
            ...item,
            qty: Math.min(
              99,
              Math.max(
                1,
                Number(next[existingIndex]?.qty) || 0,
              ) + item.qty,
            ),
          };
        } else {
          next.push(item);
        }
      });

      window.localStorage.setItem(
        CART_KEY,
        JSON.stringify(next),
      );

      window.dispatchEvent(
        new CustomEvent("deshsolar:cartchange"),
      );

      setBuilderMessage(
        `${selected.length} selected product type${
          selected.length === 1 ? "" : "s"
        } added to cart. Installation, protection and other site-specific items still require a project quotation.`,
      );
    } catch {
      setBuilderMessage(
        "The system could not be added to the cart in this browser.",
      );
    }
  };

  const makeSystemBuilderText = () => {
    const productLine = (
      label: string,
      product: Product | null,
      qtyValue: number,
      technicalValue: string,
    ) =>
      `${label}: ${
        product
          ? `${qtyValue} × ${product.name} (${technicalValue}) — ${product.priceText}`
          : "Not selected"
      }`;

    return [
      makeProfileText(),
      "",
      "",
      "DESH SOLAR — SELECTED CATALOGUE SYSTEM",
      "======================================",
      productLine(
        "Solar panels",
        builderPanel,
        builderSelection.panelQty,
        builderPVTotal
          ? `${round1(builderPVTotal)} kWp array`
          : builderPanel?.power ?? "",
      ),
      productLine(
        "Inverter",
        builderInverter,
        builderInverter ? 1 : 0,
        builderInverter?.power ?? "",
      ),
      productLine(
        "Battery",
        builderBattery,
        builderSelection.batteryQty,
        builderBatteryTotal
          ? `${round1(builderBatteryTotal)} kWh nominal headline capacity`
          : builderBattery?.power ?? "",
      ),
      "",
      `Priced equipment subtotal: ৳ ${fmt(
        builderSubtotal,
      )}`,
      builderHasQuoteOnly
        ? "Some selected products require quotation and are not included in the priced subtotal."
        : "",
      "",
      `PV check: ${panelCheck.label} — ${panelCheck.detail}`,
      `Inverter check: ${inverterCheck.label} — ${inverterCheck.detail}`,
      `Battery check: ${batteryCheck.label} — ${batteryCheck.detail}`,
      "",
      "NOT INCLUDED IN AUTOMATIC PRODUCT SUBTOTAL:",
      "Mounting structure, DC/AC protection, isolators, cables, earthing, installation, commissioning and other site-specific balance-of-system items.",
      "",
      "IMPORTANT: Catalogue matching is a planning aid, not a final compatibility approval. Desh Solar technical review is required before purchase/installation.",
    ]
      .filter(Boolean)
      .join("\n");
  };

  const downloadBuiltSystem = () => {
    const blob = new Blob(
      [makeSystemBuilderText()],
      {
        type: "text/plain;charset=utf-8",
      },
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download =
      "desh-solar-selected-system-design.txt";
    anchor.click();

    window.setTimeout(
      () => URL.revokeObjectURL(url),
      500,
    );
  };

  const openBuilderContactModal = () => {
    setBuilderContactError("");
    setContactModalOpen(true);
  };

  const closeBuilderContactModal = () => {
    setBuilderContactError("");
    setContactModalOpen(false);
  };

  const continueBuiltSystemToWhatsApp = async () => {
    const name = builderCustomer.name.trim();
    const phone = builderCustomer.phone.trim();
    const email = builderCustomer.email.trim();
    const location = builderCustomer.location.trim();

    if (!name || !phone) {
      setBuilderContactError(
        "Full Name and Phone are required.",
      );
      return;
    }

    const customerText = [
      "CUSTOMER DETAILS",
      "================",
      `Name: ${name}`,
      `Phone: ${phone}`,
      email ? `Email: ${email}` : "",
      location
        ? `District / City: ${location}`
        : "",
      "",
    ]
      .filter(Boolean)
      .join("\n");

    const message =
      `${customerText}\n${makeSystemBuilderText()}`;

    const whatsappUrl =
      `https://wa.me/8801754477488?text=` +
      encodeURIComponent(message);

    setBuilderContactSubmitting(true);
    setBuilderContactError("");

    // Open immediately from the click gesture so browsers are less
    // likely to block WhatsApp while the lead is being saved.
    const whatsappWindow =
      window.open("", "_blank");

    if (whatsappWindow) {
      whatsappWindow.opener = null;
    }

    try {
      const response = await fetch(
        "/api/customer-leads",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            recordType:
              "contact_request",
            contactRoute: "builder",
            name,
            phone,
            email,
            districtCity: location,
            website: "",
          }),
        },
      );

      const result = (await response
        .json()
        .catch(() => ({}))) as {
        success?: boolean;
        message?: string;
        source?: string;
      };

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Could not save your contact details.",
        );
      }

      setBuilderMessage(
        "Customer details saved to Desh Solar. WhatsApp is ready with your selected system design.",
      );

      setContactModalOpen(false);
      setBuilderContactError("");

      if (whatsappWindow) {
        whatsappWindow.location.href =
          whatsappUrl;
      } else {
        // Fallback when the browser blocks the new tab.
        window.location.href =
          whatsappUrl;
      }
    } catch (error) {
      if (whatsappWindow) {
        whatsappWindow.close();
      }

      setBuilderContactError(
        error instanceof Error
          ? error.message
          : "Could not save your contact details. Please try again.",
      );
    } finally {
      setBuilderContactSubmitting(false);
    }
  };

  const printBuiltSystem = () => {
    const printClass = "printSystemBuilder";

    document.body.classList.add(printClass);

    const cleanup = () => {
      document.body.classList.remove(printClass);
    };

    window.addEventListener(
      "afterprint",
      cleanup,
      { once: true },
    );

    window.print();

    window.setTimeout(
      cleanup,
      1200,
    );
  };

  const pickerCheck = (
    product: Product,
  ): ProductCheck => {
    if (product.category === "panel") {
      const rating = panelPowerKW(product);

      if (!rating || rating < 0.3) {
        return {
          state: "review",
          label: "Review",
          detail: "Small / portable panel class.",
        };
      }

      const quantity =
        calc.actualPV > 0
          ? Math.max(
              1,
              Math.ceil(calc.actualPV / rating),
            )
          : 1;

      return {
        state: "good",
        label: "Array option",
        detail: `${quantity} panel${
          quantity === 1 ? "" : "s"
        } ≈ ${round1(rating * quantity)} kWp.`,
      };
    }

    if (product.category === "inverter") {
      const rating = inverterPowerKW(product);

      if (!rating) {
        return {
          state: "review",
          label: "Review",
          detail: "Inverter rating unavailable.",
        };
      }

      const needsThreePhase =
        state.phase === "Three phase" ||
        state.property === "Factory";

      if (
        needsThreePhase &&
        productLooksSinglePhase(product)
      ) {
        return {
          state: "warn",
          label: "Phase review",
          detail:
            "Single-phase product for a three-phase planning profile.",
        };
      }

      if (rating >= calc.inverterClass) {
        return {
          state: "good",
          label: "Fits planning class",
          detail: `${rating} kW vs ${calc.inverterClass} kW required class.`,
        };
      }

      return {
        state: "warn",
        label: "Below planning class",
        detail: `${rating} kW vs ${calc.inverterClass} kW required class.`,
      };
    }

    const capacity = batteryCapacityKWh(product);

    if (!capacity) {
      return {
        state: "review",
        label: "Technical review",
        detail:
          "Automatic kWh calculation unavailable from headline data.",
      };
    }

    const quantity =
      calc.batteryKWh > 0
        ? Math.max(
            1,
            Math.ceil(calc.batteryKWh / capacity),
          )
        : 1;

    return {
      state:
        capacity * quantity + 0.01 >=
        calc.batteryKWh
          ? "good"
          : "warn",
      label: "Storage option",
      detail: `${quantity} unit${
        quantity === 1 ? "" : "s"
      } ≈ ${round1(
        capacity * quantity,
      )} kWh.`,
    };
  };

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

  const visibleLoadKeys = loadProfile.groups.flatMap(
    (group) => group.items,
  );

  const isPresetActive = (preset: LoadPreset) =>
    visibleLoadKeys.every(
      (key) =>
        (qty[key] ?? 0) ===
        (preset.qty[key] ?? 0),
    );

  const visibleLoadsCleared =
    visibleLoadKeys.every(
      (key) => (qty[key] ?? 0) === 0,
    );

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
    setSystemBuilderOpen(false);
    setBuilderPicker(null);
    setBuilderMessage("");
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
                    {loadProfile.presets.map((preset) => {
                      const active =
                        isPresetActive(preset);

                      return (
                        <button
                          key={preset.name}
                          className={`bysPresetBtn${
                            active
                              ? " active"
                              : ""
                          }`}
                          type="button"
                          aria-pressed={active}
                          onClick={() =>
                            applyPreset(preset)
                          }
                        >
                          <span>{preset.name}</span>
                          {active && (
                            <b
                              className="bysPresetSelected"
                              aria-hidden="true"
                            >
                              ✓
                            </b>
                          )}
                        </button>
                      );
                    })}

                    <button
                      className={`bysPresetBtn clear${
                        visibleLoadsCleared
                          ? " active"
                          : ""
                      }`}
                      type="button"
                      aria-pressed={
                        visibleLoadsCleared
                      }
                      onClick={clearVisibleLoads}
                    >
                      <span>Clear all</span>
                      {visibleLoadsCleared && (
                        <b
                          className="bysPresetSelected"
                          aria-hidden="true"
                        >
                          ✓
                        </b>
                      )}
                    </button>
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
                  <button className="builder" type="button" onClick={openSystemBuilder}>Build This System →</button>
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

        {systemBuilderOpen && (
          <section
            className="bysBuilderStage"
            id="bysSystemBuilder"
            ref={systemBuilderRef}
          >
            <div className="bysBuilderHead">
              <div>
                <div className="bysEyebrow">
                  Part 02 • Interactive System Builder
                </div>
                <h2>
                  Turn the planning result into an actual
                  product system.
                </h2>
                <p>
                  The 7-step planner established the target scale.
                  Now choose real Desh Solar catalogue products,
                  adjust quantities and review the compatibility
                  signals before final engineering approval.
                </p>
              </div>

              <div className="bysBuilderScore">
                <small>Compatibility snapshot</small>
                <strong>{builderGoodCount} / 3</strong>
                <span>
                  {builderWarningCount
                    ? `${builderWarningCount} item${
                        builderWarningCount === 1
                          ? ""
                          : "s"
                      } need review`
                    : "No automatic warnings"}
                </span>
              </div>
            </div>

            <div className="bysBuilderWorkspace">
              <div className="bysBuilderLeftCompact">
                <div className="bysBuilderRequirement">
                  <div>
                    <small>Planning PV</small>
                    <b>{round1(calc.actualPV)} kWp</b>
                  </div>
                  <div>
                    <small>Inverter Class</small>
                    <b>{calc.inverterClass} kW</b>
                  </div>
                  <div>
                    <small>Storage Target</small>
                    <b>{round1(calc.batteryKWh)} kWh</b>
                  </div>
                  <div>
                    <small>Electrical Phase</small>
                    <b>{phase}</b>
                  </div>
                  <div>
                    <small>Backup Target</small>
                    <b>{round1(backupHours)} h</b>
                  </div>
                </div>

                <div className="bysBuilderProducts">
                <article className="bysBuilderProductCard">
                  <div className="bysBuilderProductTop">
                    <div>
                      <span className="bysBuilderSlot">
                        01 • PV ARRAY
                      </span>
                      <h3>Solar Panels</h3>
                    </div>
                    <span
                      className={`bysBuilderCheck ${panelCheck.state}`}
                    >
                      {panelCheck.state === "good"
                        ? "✓"
                        : panelCheck.state === "warn"
                          ? "!"
                          : "?"}
                    </span>
                  </div>

                  {builderPanel ? (
                    <div className="bysBuilderSelectedProduct">
                      <div className="bysBuilderProductImage">
                        <Image
                          alt={builderPanel.name}
                          src={builderPanel.image}
                          width={220}
                          height={180}
                        />
                      </div>
                      <div className="bysBuilderProductInfo">
                        <small>
                          {builderPanel.brandLabel} •{" "}
                          {builderPanel.categoryLabel}
                        </small>
                        <b>{builderPanel.name}</b>
                        <span>
                          {builderPanel.power} •{" "}
                          {builderPanel.priceText}
                        </span>
                        <Link
                          href={`/products/${builderPanel.id}`}
                        >
                          View product →
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="bysBuilderEmptyProduct">
                      No panel selected.
                    </div>
                  )}

                  <div className="bysBuilderQtyRow">
                    <label htmlFor="builderPanelQty">
                      Panel quantity
                    </label>
                    <input
                      id="builderPanelQty"
                      min={1}
                      max={99}
                      type="number"
                      value={builderSelection.panelQty}
                      onChange={(event) =>
                        setBuilderSelection(
                          (current) => ({
                            ...current,
                            panelQty: clamp(
                              Number(
                                event.target.value,
                              ) || 1,
                              1,
                              99,
                            ),
                          }),
                        )
                      }
                    />
                    <b>
                      {builderPVTotal
                        ? `${round1(
                            builderPVTotal,
                          )} kWp`
                        : "—"}
                    </b>
                  </div>

                  <div
                    className={`bysBuilderStatus ${panelCheck.state}`}
                  >
                    <b>{panelCheck.label}</b>
                    <p>{panelCheck.detail}</p>
                  </div>

                  <button
                    className="bysBuilderChange"
                    type="button"
                    onClick={() =>
                      openBuilderPicker("panel")
                    }
                  >
                    Change Solar Panel →
                  </button>
                </article>

                <article className="bysBuilderProductCard">
                  <div className="bysBuilderProductTop">
                    <div>
                      <span className="bysBuilderSlot">
                        02 • CONTROL + CONVERSION
                      </span>
                      <h3>Inverter</h3>
                    </div>
                    <span
                      className={`bysBuilderCheck ${inverterCheck.state}`}
                    >
                      {inverterCheck.state === "good"
                        ? "✓"
                        : inverterCheck.state === "warn"
                          ? "!"
                          : "?"}
                    </span>
                  </div>

                  {builderInverter ? (
                    <div className="bysBuilderSelectedProduct">
                      <div className="bysBuilderProductImage">
                        <Image
                          alt={builderInverter.name}
                          src={builderInverter.image}
                          width={220}
                          height={180}
                        />
                      </div>
                      <div className="bysBuilderProductInfo">
                        <small>
                          {builderInverter.brandLabel} •{" "}
                          {builderInverter.categoryLabel}
                        </small>
                        <b>{builderInverter.name}</b>
                        <span>
                          {builderInverter.power} •{" "}
                          {builderInverter.priceText}
                        </span>
                        <Link
                          href={`/products/${builderInverter.id}`}
                        >
                          View product →
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="bysBuilderEmptyProduct">
                      No inverter selected.
                    </div>
                  )}

                  <div className="bysBuilderQtyRow fixed">
                    <span>System quantity</span>
                    <b>1 inverter</b>
                  </div>

                  <div
                    className={`bysBuilderStatus ${inverterCheck.state}`}
                  >
                    <b>{inverterCheck.label}</b>
                    <p>{inverterCheck.detail}</p>
                  </div>

                  <button
                    className="bysBuilderChange"
                    type="button"
                    onClick={() =>
                      openBuilderPicker("inverter")
                    }
                  >
                    Change Inverter →
                  </button>
                </article>

                <article className="bysBuilderProductCard">
                  <div className="bysBuilderProductTop">
                    <div>
                      <span className="bysBuilderSlot">
                        03 • STORAGE
                      </span>
                      <h3>Battery</h3>
                    </div>
                    <span
                      className={`bysBuilderCheck ${batteryCheck.state}`}
                    >
                      {batteryCheck.state === "good"
                        ? "✓"
                        : batteryCheck.state === "warn"
                          ? "!"
                          : "?"}
                    </span>
                  </div>

                  {builderBattery ? (
                    <div className="bysBuilderSelectedProduct">
                      <div className="bysBuilderProductImage">
                        <Image
                          alt={builderBattery.name}
                          src={builderBattery.image}
                          width={220}
                          height={180}
                        />
                      </div>
                      <div className="bysBuilderProductInfo">
                        <small>
                          {builderBattery.brandLabel} •{" "}
                          {builderBattery.categoryLabel}
                        </small>
                        <b>{builderBattery.name}</b>
                        <span>
                          {builderBattery.power} •{" "}
                          {builderBattery.priceText}
                        </span>
                        <Link
                          href={`/products/${builderBattery.id}`}
                        >
                          View product →
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="bysBuilderEmptyProduct">
                      No battery selected.
                    </div>
                  )}

                  <div className="bysBuilderQtyRow">
                    <label htmlFor="builderBatteryQty">
                      Battery quantity
                    </label>
                    <input
                      id="builderBatteryQty"
                      min={1}
                      max={20}
                      type="number"
                      value={
                        builderSelection.batteryQty
                      }
                      onChange={(event) =>
                        setBuilderSelection(
                          (current) => ({
                            ...current,
                            batteryQty: clamp(
                              Number(
                                event.target.value,
                              ) || 1,
                              1,
                              20,
                            ),
                          }),
                        )
                      }
                    />
                    <b>
                      {builderBatteryTotal
                        ? `${round1(
                            builderBatteryTotal,
                          )} kWh`
                        : builderBattery?.power ??
                          "—"}
                    </b>
                  </div>

                  <div
                    className={`bysBuilderStatus ${batteryCheck.state}`}
                  >
                    <b>{batteryCheck.label}</b>
                    <p>{batteryCheck.detail}</p>
                  </div>

                  <button
                    className="bysBuilderChange"
                    type="button"
                    onClick={() =>
                      openBuilderPicker("battery")
                    }
                  >
                    Change Battery →
                  </button>
                </article>
                </div>
              </div>

              <aside className="bysBuilderSummary">
                <div className="bysBuilderSummaryHead">
                  <small>Selected System</small>
                  <h3>{calc.profile}</h3>
                </div>

                <div className="bysBuilderSummaryFlow">
                  <div>
                    <span>☀</span>
                    <b>PV</b>
                    <small>
                      {builderPVTotal
                        ? `${round1(
                            builderPVTotal,
                          )} kWp`
                        : "—"}
                    </small>
                  </div>
                  <i>→</i>
                  <div>
                    <span>↯</span>
                    <b>Inverter</b>
                    <small>
                      {builderInverter?.power ?? "—"}
                    </small>
                  </div>
                  <i>→</i>
                  <div>
                    <span>▣</span>
                    <b>Battery</b>
                    <small>
                      {builderBatteryTotal
                        ? `${round1(
                            builderBatteryTotal,
                          )} kWh`
                        : "—"}
                    </small>
                  </div>
                  <i>→</i>
                  <div>
                    <span>⌂</span>
                    <b>Loads</b>
                    <small>
                      {fmt(calc.running)} W
                    </small>
                  </div>
                </div>

                <div className="bysBuilderPrice">
                  <span>
                    {builderHasQuoteOnly
                      ? "Priced equipment subtotal"
                      : "Equipment subtotal"}
                  </span>
                  <b>
                    ৳ {fmt(builderSubtotal)}
                  </b>
                  <small>
                    Based only on the selected
                    catalogue products above.
                  </small>
                </div>

                <div className="bysBuilderActions">
                  <button
                    type="button"
                    onClick={addBuiltSystemToCart}
                  >
                    Add Selected Products to Cart →
                  </button>

                  <button
                    className="secondary"
                    type="button"
                    onClick={openBuilderContactModal}
                  >
                    Send System to WhatsApp
                  </button>

                  <button
                    className="secondary"
                    type="button"
                    onClick={downloadBuiltSystem}
                  >
                    Download System Design
                  </button>

                  <button
                    className="secondary"
                    type="button"
                    onClick={printBuiltSystem}
                  >
                    Print System Design
                  </button>

                  <Link href="/contact?source=builder">
                    Request Engineering Review →
                  </Link>
                </div>

                {builderMessage && (
                  <div className="bysBuilderMessage">
                    {builderMessage}
                  </div>
                )}

              </aside>
            </div>
          </section>
        )}

        {builderMounted &&
          contactModalOpen &&
          createPortal(
            <div
              className="bysContactBackdrop"
              role="presentation"
              onMouseDown={(event) => {
                if (
                  event.target ===
                  event.currentTarget
                ) {
                  closeBuilderContactModal();
                }
              }}
            >
              <section
                aria-labelledby="bysContactTitle"
                aria-modal="true"
                className="bysContactModal"
                role="dialog"
                onMouseDown={(event) =>
                  event.stopPropagation()
                }
              >
                <div className="bysContactHead">
                  <div>
                    <small>
                      Desh Solar • System Design
                    </small>
                    <h2 id="bysContactTitle">
                      How to contact you
                    </h2>
                    <p>
                      Add your contact details before
                      continuing to WhatsApp with the
                      selected system design.
                    </p>
                  </div>

                  <button
                    aria-label="Close contact form"
                    type="button"
                    onClick={
                      closeBuilderContactModal
                    }
                  >
                    ×
                  </button>
                </div>

                <div className="bysContactBody">
                  <div className="bysContactGrid">
                    <label>
                      <span>Full Name *</span>
                      <input
                        autoComplete="name"
                        placeholder="Your full name"
                        value={
                          builderCustomer.name
                        }
                        onChange={(event) =>
                          setBuilderCustomer(
                            (current) => ({
                              ...current,
                              name: event.target.value,
                            }),
                          )
                        }
                      />
                    </label>

                    <label>
                      <span>Phone *</span>
                      <input
                        autoComplete="tel"
                        inputMode="tel"
                        placeholder="01XXXXXXXXX"
                        value={
                          builderCustomer.phone
                        }
                        onChange={(event) =>
                          setBuilderCustomer(
                            (current) => ({
                              ...current,
                              phone:
                                event.target.value,
                            }),
                          )
                        }
                      />
                    </label>

                    <label>
                      <span>Email</span>
                      <input
                        autoComplete="email"
                        placeholder="Optional"
                        type="email"
                        value={
                          builderCustomer.email
                        }
                        onChange={(event) =>
                          setBuilderCustomer(
                            (current) => ({
                              ...current,
                              email:
                                event.target.value,
                            }),
                          )
                        }
                      />
                    </label>

                    <label>
                      <span>District / City</span>
                      <input
                        autoComplete="address-level2"
                        placeholder="Dhaka, Chattogram..."
                        value={
                          builderCustomer.location
                        }
                        onChange={(event) =>
                          setBuilderCustomer(
                            (current) => ({
                              ...current,
                              location:
                                event.target.value,
                            }),
                          )
                        }
                      />
                    </label>
                  </div>

                  {builderContactError && (
                    <div className="bysContactError">
                      {builderContactError}
                    </div>
                  )}

                  <div className="bysContactActions">
                    <button
                      className="secondary"
                      type="button"
                      onClick={
                        closeBuilderContactModal
                      }
                    >
                      Cancel
                    </button>

                    <button
                      disabled={
                        builderContactSubmitting
                      }
                      type="button"
                      onClick={
                        continueBuiltSystemToWhatsApp
                      }
                    >
                      {builderContactSubmitting
                        ? "Saving customer details…"
                        : "Continue to WhatsApp →"}
                    </button>
                  </div>

                  <p className="bysContactNote">
                    Your details are saved to the
                    Desh Solar customer table and
                    added to the WhatsApp message
                    for this system design.
                  </p>
                </div>
              </section>
            </div>,
            document.body,
          )}

        {builderMounted && builderPicker && createPortal(
          <div
            className="bysPickerBackdrop"
            role="presentation"
            onClick={() => {
              setBuilderPicker(null);
            }}
          >
            <section
              aria-label={`Choose ${builderPicker}`}
              aria-modal="true"
              className="bysPickerModal"
              role="dialog"
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              <div className="bysPickerHead">
                <div>
                  <small>
                    Desh Solar Catalogue
                  </small>
                  <h2>
                    Choose{" "}
                    {builderPicker === "panel"
                      ? "a solar panel"
                      : builderPicker ===
                          "inverter"
                        ? "an inverter"
                        : "a battery"}
                  </h2>
                  <p>
                    Recommended and
                    compatible-looking options are
                    shown first. Final technical
                    compatibility still requires
                    engineering review.
                  </p>
                </div>

                <button
                  aria-label="Close product selector"
                  type="button"
                  onClick={() =>
                    setBuilderPicker(null)
                  }
                >
                  ×
                </button>
              </div>

              <div className="bysPickerRequirement">
                {builderPicker === "panel" && (
                  <>
                    <span>Planning target</span>
                    <b>
                      {round1(calc.actualPV)} kWp PV
                    </b>
                  </>
                )}

                {builderPicker === "inverter" && (
                  <>
                    <span>Planning target</span>
                    <b>
                      {calc.inverterClass} kW •{" "}
                      {phase}
                    </b>
                  </>
                )}

                {builderPicker === "battery" && (
                  <>
                    <span>Planning target</span>
                    <b>
                      {round1(
                        calc.batteryKWh,
                      )}{" "}
                      kWh storage
                    </b>
                  </>
                )}
              </div>

              <div className="bysPickerGrid">
                {pickerProducts.map((product) => {
                  const check =
                    pickerCheck(product);

                  const isSelected =
                    product.id ===
                      builderSelection.panelId ||
                    product.id ===
                      builderSelection.inverterId ||
                    product.id ===
                      builderSelection.batteryId;

                  return (
                    <article
                      className={`bysPickerProduct${
                        isSelected
                          ? " selected"
                          : ""
                      }`}
                      key={product.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        selectBuilderProduct(product);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          selectBuilderProduct(product);
                        }
                      }}
                    >
                      <div className="bysPickerImage">
                        <Image
                          alt={product.name}
                          src={product.image}
                          width={260}
                          height={210}
                        />
                      </div>

                      <div className="bysPickerProductBody">
                        <small>
                          {product.brandLabel} •{" "}
                          {product.categoryLabel}
                        </small>

                        <h3>{product.name}</h3>

                        <div className="bysPickerProductMeta">
                          <b>{product.power}</b>
                          <span>
                            {product.priceText}
                          </span>
                        </div>

                        <div
                          className={`bysPickerCheck ${check.state}`}
                        >
                          <b>{check.label}</b>
                          <span>
                            {check.detail}
                          </span>
                        </div>

                        <div className="bysPickerActions">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              selectBuilderProduct(product);
                            }}
                          >
                            {isSelected
                              ? "Selected"
                              : "Use This Product →"}
                          </button>

                          <Link
                            href={`/products/${product.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(event) => {
                              event.stopPropagation();
                            }}
                          >
                            Details
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </div>
          ,
          document.body,
        )}
      </div>

      <section className="futureBand">
        <div className="countryMark">BD</div>
        <small>Desh Solar • Bangladesh</small>
        <h2>POWERING BANGLADESH FORWARD.</h2>
      </section>
    </div>
  );
}
