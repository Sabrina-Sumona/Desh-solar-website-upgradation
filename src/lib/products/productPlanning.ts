import type { Product, ProductCategory } from "@/data/products";

export type FlowKey = "panel" | "inverter" | "battery" | "load";

export type ProductPlanningProfile = {
  role: string;
  why: string;
  tool:
    | "panel"
    | "inverter"
    | "battery"
    | "portable"
    | "system";
};

export const PRODUCT_FLOW_ITEMS: Array<{
  key: FlowKey;
  icon: string;
  label: string;
}> = [
  { key: "panel", icon: "▦", label: "Generation" },
  { key: "inverter", icon: "↯", label: "Conversion" },
  { key: "battery", icon: "▣", label: "Storage" },
  { key: "load", icon: "⌂", label: "Loads" },
];

export function getProductPlanningProfile(
  product: Product
): ProductPlanningProfile {
  const source = `${product.name} ${product.search}`.toLowerCase();

  if (product.category === "panel") {
    return {
      role: product.role || "Generation",
      why:
        source.includes("jinko tiger neo 590")
          ? "Use panel wattage as one part of array design. Roof geometry, string voltage and inverter MPPT limits still determine the final layout."
          : source.includes("jinko tiger neo 625")
            ? "High-output N-Type panels can reduce module count, but final array design still depends on roof area, string voltage and inverter limits."
            : "Use panel wattage as one part of array design; roof geometry, string voltage and inverter MPPT limits still determine the final layout.",
      tool: "panel",
    };
  }

  if (product.category === "inverter") {
    return {
      role: product.role || "Control + Conversion",
      why:
        "Inverter choice should follow the real load profile. Rated output, startup surge, electrical phase, PV input and battery architecture all need to work together.",
      tool: "inverter",
    };
  }

  if (product.category === "battery") {
    return {
      role: product.role || "Storage",
      why:
        "Battery selection should start with required backup energy, then confirm voltage, BMS/current limits and inverter compatibility.",
      tool: "battery",
    };
  }

  if (product.category === "portable") {
    return {
      role: product.role || "Portable Storage",
      why:
        "Portable power should be compared using both output wattage and stored energy because they answer different questions: what can run, and for how long.",
      tool: "portable",
    };
  }

  return {
    role: product.role || "Complete Solar System",
    why:
      source.includes("pump")
        ? "A solar pump package is a planning path, not a universal fit. Match it to pump duty, water requirement, solar resource, phase and site conditions."
        : "A complete package is a planning path, not a universal fit. Match it to actual connected load, backup hours, phase and site conditions.",
    tool: "system",
  };
}

export function getActiveFlowKeys(
  category: ProductCategory
): FlowKey[] {
  if (category === "system") {
    return ["panel", "inverter", "battery", "load"];
  }

  if (category === "portable") {
    return ["battery", "load"];
  }

  if (
    category === "panel" ||
    category === "inverter" ||
    category === "battery"
  ) {
    return [category];
  }

  return [];
}

export function parseRatedKw(product: Product) {
  const source = `${product.power} ${product.name}`;

  const kw = source.match(/(\d+(?:\.\d+)?)\s*kw\b/i);
  if (kw) {
    return Number(kw[1]);
  }

  const watts = source.match(/(\d+(?:\.\d+)?)\s*w\b/i);
  if (watts) {
    return Number(watts[1]) / 1000;
  }

  return null;
}

export function parsePanelWatts(product: Product) {
  const source = `${product.power} ${product.name}`;
  const watts = source.match(/(\d+(?:\.\d+)?)\s*w\b/i);

  return watts ? Number(watts[1]) : null;
}

export function parseEnergyKwh(product: Product) {
  const source = `${product.power} ${product.name} ${product.search}`;

  const kwh = source.match(/(\d+(?:\.\d+)?)\s*kwh\b/i);
  if (kwh) {
    return Number(kwh[1]);
  }

  const wh = source.match(/(\d+(?:\.\d+)?)\s*wh\b/i);
  if (wh) {
    return Number(wh[1]) / 1000;
  }

  const voltage = source.match(/(\d+(?:\.\d+)?)\s*v\b/i);
  const ampHours = source.match(/(\d+(?:\.\d+)?)\s*ah\b/i);

  if (voltage && ampHours) {
    return (Number(voltage[1]) * Number(ampHours[1])) / 1000;
  }

  return null;
}

export function getProductFaceAreaSqFt(
  product: Product
) {
  const dimensions = product.physical?.dimensionsMm;

  if (
    !dimensions ||
    dimensions.length <= 0 ||
    dimensions.width <= 0
  ) {
    return null;
  }

  const squareMillimeters =
    dimensions.length * dimensions.width;

  return squareMillimeters / 92903.04;
}

export function isPortablePanelProduct(
  product: Product
) {
  return Boolean(
    product.physical?.foldedDimensionsMm
  ) || /portable/i.test(
    `${product.name} ${product.search}`
  );
}

