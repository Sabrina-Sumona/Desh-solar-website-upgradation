import type { Product } from "@/data/products";

type ProductTechnicalDetailsProps = {
  product: Product;
  operationType: string;
};

type Fact = {
  label: string;
  value: string;
  note?: string;
};

type CategoryTechnicalContent = {
  eyebrow: string;
  title: string;
  intro: string;
  facts: Fact[];
  confirmTitle: string;
  confirmItems: string[];
};

function titleCase(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function compactList(values: string[]) {
  return values.length > 0
    ? values.map(titleCase).join(" · ")
    : "Confirm project application";
}

function findVoltage(text: string) {
  const match = text.match(/(\d+(?:\.\d+)?)\s*v\b/i);
  return match ? `${match[1]} V` : null;
}

function findAmpHours(text: string) {
  const match = text.match(/(\d+(?:\.\d+)?)\s*ah\b/i);
  return match ? `${match[1]} Ah` : null;
}

function findEnergy(text: string) {
  const match = text.match(/(\d+(?:\.\d+)?)\s*kwh\b/i);
  return match ? `${match[1]} kWh` : null;
}

function findPhase(text: string) {
  if (/3[\s-]*phase|three[\s-]*phase/i.test(text)) {
    return "3-Phase";
  }

  if (/single[\s-]*phase|1[\s-]*phase/i.test(text)) {
    return "Single Phase";
  }

  return null;
}

function getPanelContent(
  product: Product
): CategoryTechnicalContent {
  const portable = /portable/i.test(
    `${product.name} ${product.search}`
  );

  return {
    eyebrow: "SOLAR PANEL TECHNICAL VIEW",
    title: "Generation details that matter.",
    intro:
      "This view keeps verified catalogue facts separate from the model-specific electrical values that should be confirmed from the final datasheet.",
    facts: [
      {
        label: "RATED MODULE OUTPUT",
        value: product.power,
        note: "Catalogue rating",
      },
      {
        label: "PANEL FORMAT",
        value: portable ? "Portable Solar Panel" : "Fixed PV Module",
        note: "Derived from catalogue naming",
      },
      {
        label: "PRIMARY APPLICATION",
        value: compactList(product.bestFor),
      },
      {
        label: "SYSTEM ROLE",
        value: product.role,
      },
      {
        label: "BRAND",
        value: product.brandLabel,
      },
      {
        label: "WARRANTY REFERENCE",
        value: product.warranty,
      },
    ],
    confirmTitle: "Confirm from the exact panel datasheet",
    confirmItems: [
      "Module efficiency and cell technology",
      "Voc, Vmp, Isc and Imp electrical ratings",
      "Physical dimensions, weight and mounting limits",
      "Connector type and cable specification",
      "Temperature coefficients and operating limits",
      "Product and performance warranty terms",
    ],
  };
}

function getInverterContent(
  product: Product,
  operationType: string
): CategoryTechnicalContent {
  const phase = findPhase(`${product.name} ${product.search}`);

  return {
    eyebrow: "INVERTER TECHNICAL VIEW",
    title: "Conversion and compatibility first.",
    intro:
      "Inverter selection depends on much more than rated power. Use the catalogue facts below as the starting point, then verify PV, battery and AC compatibility for the exact model.",
    facts: [
      {
        label: "RATED POWER",
        value: product.power,
        note: "Catalogue rating",
      },
      {
        label: "SYSTEM ARCHITECTURE",
        value: operationType,
        note: "Derived from catalogue naming",
      },
      {
        label: "AC PHASE",
        value: phase ?? "Confirm exact model",
      },
      {
        label: "PRIMARY APPLICATION",
        value: compactList(product.bestFor),
      },
      {
        label: "SYSTEM ROLE",
        value: product.role,
      },
      {
        label: "WARRANTY REFERENCE",
        value: product.warranty,
      },
    ],
    confirmTitle: "Confirm before inverter selection",
    confirmItems: [
      "MPPT count, MPPT voltage range and maximum PV input",
      "Maximum DC current and recommended solar-array sizing",
      "AC output phase, voltage and grid requirements",
      "Battery voltage and BMS communication when applicable",
      "Surge capability, protection functions and IP rating",
      "Monitoring, communication and installation requirements",
    ],
  };
}

function getBatteryContent(
  product: Product
): CategoryTechnicalContent {
  const source = `${product.name} ${product.power} ${product.search}`;
  const voltage = findVoltage(source);
  const ampHours = findAmpHours(source);
  const energy = findEnergy(source);
  const chemistry = /lifepo4|lithium iron phosphate/i.test(source)
    ? "LiFePO₄"
    : /lithium/i.test(source)
      ? "Lithium"
      : "Confirm exact chemistry";

  return {
    eyebrow: "BATTERY TECHNICAL VIEW",
    title: "Storage capacity and compatibility.",
    intro:
      "Battery suitability depends on voltage, usable energy, BMS communication and current limits. Values shown here come only from the existing catalogue naming and fields.",
    facts: [
      {
        label: "CATALOGUE CAPACITY",
        value: product.power,
        note: "Catalogue rating",
      },
      {
        label: "CHEMISTRY",
        value: chemistry,
        note: "Only shown when stated in catalogue text",
      },
      {
        label: "NOMINAL VOLTAGE",
        value: voltage ?? "Confirm exact model",
      },
      {
        label: "CAPACITY (AH)",
        value: ampHours ?? "Confirm exact model",
      },
      {
        label: "ENERGY (KWH)",
        value: energy ?? "Confirm exact model",
      },
      {
        label: "WARRANTY REFERENCE",
        value: product.warranty,
      },
    ],
    confirmTitle: "Confirm before battery selection",
    confirmItems: [
      "Usable energy and recommended depth of discharge",
      "Continuous and peak charge / discharge current",
      "BMS type and inverter communication compatibility",
      "Cycle-life conditions and applicable warranty terms",
      "Installation orientation, temperature and ventilation limits",
      "Parallel / expansion limits for future storage growth",
    ],
  };
}

function getPortableContent(
  product: Product
): CategoryTechnicalContent {
  const source = `${product.name} ${product.power} ${product.search}`;
  const energy = findEnergy(source);

  return {
    eyebrow: "PORTABLE POWER TECHNICAL VIEW",
    title: "Output, runtime and charging.",
    intro:
      "Portable-power products should be matched to the combined wattage of the devices you need to run and the runtime you expect from the stored energy.",
    facts: [
      {
        label: "CATALOGUE RATING",
        value: product.power,
      },
      {
        label: "FORMAT",
        value: "Portable Power",
      },
      {
        label: "ENERGY VALUE",
        value: energy ?? "Confirm usable Wh / kWh",
      },
      {
        label: "BEST FOR",
        value: compactList(product.bestFor),
      },
      {
        label: "SYSTEM ROLE",
        value: product.role,
      },
      {
        label: "WARRANTY REFERENCE",
        value: product.warranty,
      },
    ],
    confirmTitle: "Confirm before portable-power selection",
    confirmItems: [
      "Usable battery capacity in Wh / kWh",
      "Continuous AC output and surge capability",
      "AC, DC, USB and specialty output ports",
      "Solar-input voltage / current and charging limits",
      "Recharge time from solar and grid power",
      "Weight, dimensions and expected runtime for your devices",
    ],
  };
}

function getSystemContent(
  product: Product,
  operationType: string
): CategoryTechnicalContent {
  return {
    eyebrow: "COMPLETE SYSTEM TECHNICAL VIEW",
    title: "Treat the package as one engineered system.",
    intro:
      "A complete solar package should be reviewed as a bill of materials, not as one isolated product. The exact component models and quantities must be confirmed before purchase and installation.",
    facts: [
      {
        label: "SYSTEM RATING",
        value: product.power,
        note: "Catalogue package rating",
      },
      {
        label: "PACKAGE TYPE",
        value: operationType,
      },
      {
        label: "PRIMARY APPLICATION",
        value: compactList(product.bestFor),
      },
      {
        label: "ENERGY PATH",
        value: "Generation → Conversion → Storage / Loads",
      },
      {
        label: "PACKAGE BRAND",
        value: product.brandLabel,
      },
      {
        label: "WARRANTY REFERENCE",
        value: product.warranty,
      },
    ],
    confirmTitle: "Confirm the final package bill of materials",
    confirmItems: [
      "Solar-panel model, wattage and total panel quantity",
      "Inverter model, rating and operating architecture",
      "Battery model, voltage, capacity and total storage",
      "Mounting structure, DC / AC protection and earthing",
      "Cable sizes, connectors and installation accessories",
      "Installation, commissioning and after-sales support scope",
    ],
  };
}

function getContent(
  product: Product,
  operationType: string
): CategoryTechnicalContent {
  switch (product.category) {
    case "panel":
      return getPanelContent(product);
    case "inverter":
      return getInverterContent(product, operationType);
    case "battery":
      return getBatteryContent(product);
    case "portable":
      return getPortableContent(product);
    case "system":
      return getSystemContent(product, operationType);
  }
}

export default function ProductTechnicalDetails({
  product,
  operationType,
}: ProductTechnicalDetailsProps) {
  const content = getContent(product, operationType);

  return (
    <section
      className="pdSection pdTechnicalSection"
      data-product-category={product.category}
    >
      <div className="pdShell">
        <div className="pdSectionHead pdTechnicalHead">
          <div>
            <div className="pdEyebrow">{content.eyebrow}</div>
            <h2>{content.title}</h2>
          </div>

          <p>{content.intro}</p>
        </div>

        <div className="pdTechnicalLayout">
          <div className="pdTechnicalFacts">
            {content.facts.map((fact) => (
              <article className="pdTechnicalFact" key={fact.label}>
                <small>{fact.label}</small>
                <b>{fact.value}</b>

                {fact.note && <span>{fact.note}</span>}
              </article>
            ))}
          </div>

          <aside className="pdConfirmPanel">
            <div className="pdConfirmPanelHeader">
              <span>VERIFY</span>
              <strong>{content.confirmTitle}</strong>
            </div>

            <div className="pdConfirmList">
              {content.confirmItems.map((item, index) => (
                <div key={item}>
                  <span>0{index + 1}</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>

            <p className="pdConfirmNote">
              These values are intentionally not guessed. Confirm them
              from the exact manufacturer datasheet, supplier listing or
              final Desh Solar quotation.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
