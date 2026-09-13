import type { Product } from "@/data/products";

export type CustomerPackageComponent = {
  key: string;
  number: string;
  title: string;
  value: string;
  description: string;
};

export type CustomerPackageFact = {
  label: string;
  value: string;
};

export type CustomerSystemPackageProfile = {
  isPump: boolean;
  title: string;
  intro: string;
  facts: CustomerPackageFact[];
  components: CustomerPackageComponent[];
  beforeInstallation: string[];
};

function cleanNumber(value: string) {
  return String(Number(value));
}

function firstMatch(
  source: string,
  expression: RegExp,
  suffix = ""
) {
  const match = source.match(expression);
  return match ? `${cleanNumber(match[1])}${suffix}` : null;
}

function getPackageType(source: string, isPump: boolean) {
  const lower = source.toLowerCase();

  if (isPump) return "Solar Pump System";
  if (lower.includes("off-grid") && lower.includes("hybrid")) {
    return "Off-Grid Hybrid";
  }
  if (lower.includes("on-grid")) return "On-Grid Solar System";
  if (lower.includes("off-grid")) return "Off-Grid Solar System";
  if (lower.includes("hybrid")) return "Hybrid Solar System";

  return "Complete Solar System";
}

function titleCase(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function joinBestFor(product: Product) {
  if (!product.bestFor.length) {
    return "Home / Business / Solar Applications";
  }

  return product.bestFor.map(titleCase).join(" / ");
}

export function getCustomerSystemPackageProfile(
  product: Product
): CustomerSystemPackageProfile | null {
  if (product.category !== "system") {
    return null;
  }

  const source = `${product.name} ${product.power} ${product.search}`;
  const isPump = /\bpump\b/i.test(source);
  const packageType = getPackageType(source, isPump);

  const systemPower =
    firstMatch(source, /(\d+(?:\.\d+)?)\s*kw\b/i, " kW") ??
    product.power;

  const storage =
    firstMatch(source, /(\d+(?:\.\d+)?)\s*kwh\b/i, " kWh") ??
    null;

  const pvArray =
    firstMatch(
      source,
      /(\d+(?:\.\d+)?)\s*kw\s*pv\b/i,
      " kW PV"
    ) ?? null;

  const facts: CustomerPackageFact[] = [
    {
      label: "SYSTEM TYPE",
      value: packageType,
    },
    {
      label: isPump ? "PUMP RATING" : "SYSTEM CAPACITY",
      value: product.power || systemPower,
    },
  ];

  if (!isPump && storage) {
    facts.push({
      label: "BATTERY STORAGE",
      value: storage,
    });
  } else if (pvArray) {
    facts.push({
      label: "SOLAR ARRAY",
      value: pvArray,
    });
  }

  facts.push({
    label: "BEST FOR",
    value: joinBestFor(product),
  });

  const components: CustomerPackageComponent[] = isPump
    ? [
        {
          key: "solar-panels",
          number: "01",
          title: "Solar Panels",
          value: pvArray ?? "Sized for the pump requirement",
          description:
            "Solar panels provide the energy needed to operate the pump. Final panel model and quantity will be selected during system design.",
        },
        {
          key: "pump",
          number: "02",
          title: "Pump & Motor",
          value: product.power,
          description:
            "The main pumping equipment for the selected package. Final pump model will be confirmed according to water requirement and site conditions.",
        },
        {
          key: "controller",
          number: "03",
          title: "Pump Controller",
          value: "Matched to the selected pump",
          description:
            "The controller manages power delivery to the pump. The final controller will be selected to match the pump and solar array.",
        },
        {
          key: "protection",
          number: "04",
          title: "Safety & Protection",
          value: "Required electrical protection",
          description:
            "Necessary breakers, isolators, earthing and electrical safety components will be included according to the final design.",
        },
        {
          key: "mounting",
          number: "05",
          title: "Mounting & Cabling",
          value: "Based on site conditions",
          description:
            "Solar mounting structure, cables, connectors and related accessories will be selected for the actual installation site.",
        },
        {
          key: "installation",
          number: "06",
          title: "Installation",
          value: "Professional setup & testing",
          description:
            "Installation, testing and system setup will be finalized after reviewing the site and project requirements.",
        },
      ]
    : [
        {
          key: "solar-panels",
          number: "01",
          title: "Solar Panels",
          value: pvArray ?? "Sized for the selected system",
          description:
            "Solar generation components for the system. Final panel model and quantity will be selected during system design.",
        },
        {
          key: "inverter",
          number: "02",
          title: "Inverter",
          value: `${systemPower} system class`,
          description:
            "The inverter converts and manages solar power for the system. Final inverter model will be selected according to the required system architecture.",
        },
        {
          key: "battery",
          number: "03",
          title: "Battery Storage",
          value:
            storage ??
            (/on-grid/i.test(packageType)
              ? "Battery option depends on final design"
              : "Sized according to backup requirement"),
          description:
            storage
              ? `${storage} storage is shown for this package. Final battery model and configuration will be confirmed during system design.`
              : "Battery configuration will be selected according to the required backup time and system design.",
        },
        {
          key: "protection",
          number: "04",
          title: "Safety & Protection",
          value: "Required electrical protection",
          description:
            "Necessary breakers, isolators, surge protection, earthing and electrical safety components will be included in the final design.",
        },
        {
          key: "mounting",
          number: "05",
          title: "Mounting & Cabling",
          value: "Based on site conditions",
          description:
            "Solar mounting structure, cables, connectors and related accessories will be selected according to the actual installation site.",
        },
        {
          key: "installation",
          number: "06",
          title: "Installation",
          value: "Professional setup & testing",
          description:
            "Installation, testing and system setup will be finalized after site assessment and confirmation of the final system design.",
        },
      ];

  return {
    isPump,
    title: isPump
      ? "What’s included in this pump solution?"
      : "What’s included in this system?",
    intro: isPump
      ? "A simple overview of the main parts that make up the solar pump package."
      : "A simple overview of the main parts that make up the complete solar solution.",
    facts,
    components,
    beforeInstallation: [
      "Final component models and quantities are selected during system design.",
      "Installation scope depends on the actual site, electrical condition and project requirement.",
      "The final quotation will confirm the exact equipment, accessories and services included.",
    ],
  };
}
