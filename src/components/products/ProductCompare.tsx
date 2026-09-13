"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import type { Product, ProductCategory } from "@/data/products";

type ProductCompareProps = {
  products: Product[];
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onRemove: (productId: string) => void;
  onClear: () => void;
};

type ComparisonRow = {
  label: string;
  values: string[];
  emphasize?: boolean;
};

function titleCase(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getText(product: Product) {
  return `${product.name} ${product.power} ${product.search}`;
}

function extractVoltage(product: Product) {
  const match = getText(product).match(/(\d+(?:\.\d+)?)\s*v\b/i);
  return match ? `${match[1]} V` : "Confirm exact model";
}

function extractAmpHours(product: Product) {
  const match = getText(product).match(/(\d+(?:\.\d+)?)\s*ah\b/i);
  return match ? `${match[1]} Ah` : "Confirm exact model";
}

function extractEnergy(product: Product) {
  const text = getText(product);

  const kwh = text.match(/(\d+(?:\.\d+)?)\s*kwh\b/i);
  if (kwh) {
    return `${kwh[1]} kWh`;
  }

  const wh = text.match(/(\d+(?:\.\d+)?)\s*wh\b/i);
  if (wh) {
    return `${wh[1]} Wh`;
  }

  const voltage = text.match(/(\d+(?:\.\d+)?)\s*v\b/i);
  const ampHours = text.match(/(\d+(?:\.\d+)?)\s*ah\b/i);

  if (voltage && ampHours) {
    const energy =
      (Number(voltage[1]) * Number(ampHours[1])) / 1000;

    return `~${energy.toFixed(2)} kWh nominal`;
  }

  return "Confirm exact model";
}

function extractChemistry(product: Product) {
  const text = getText(product);

  if (/lifepo4|lithium iron phosphate/i.test(text)) {
    return "LiFePO₄";
  }

  if (/lithium/i.test(text)) {
    return "Lithium";
  }

  return "Confirm exact model";
}

function extractPhase(product: Product) {
  const text = getText(product);

  if (/3[\s-]*phase|three[\s-]*phase/i.test(text)) {
    return "3-Phase";
  }

  if (/single[\s-]*phase|1[\s-]*phase/i.test(text)) {
    return "Single Phase";
  }

  return "Confirm exact model";
}

function getInverterType(product: Product) {
  const text = getText(product).toLowerCase();

  if (text.includes("on-grid")) return "On-Grid";
  if (text.includes("off-grid") && text.includes("hybrid")) {
    return "Off-Grid Hybrid";
  }
  if (text.includes("hybrid")) return "Hybrid";
  if (text.includes("off-grid")) return "Off-Grid";

  return "Solar Inverter";
}

function getSystemType(product: Product) {
  const text = getText(product).toLowerCase();

  if (text.includes("pump")) return "Solar Pump System";
  if (text.includes("on-grid")) return "On-Grid Solar System";
  if (text.includes("off-grid")) return "Off-Grid Solar System";
  if (text.includes("hybrid")) return "Hybrid Solar System";

  return "Complete Solar System";
}

function joinList(values: string[]) {
  return values.length
    ? values.map(titleCase).join(" · ")
    : "Confirm application";
}

function commonRows(products: Product[]): ComparisonRow[] {
  return [
    {
      label: "Current price",
      values: products.map((product) => product.priceText),
      emphasize: true,
    },
    {
      label: "Brand",
      values: products.map((product) => product.brandLabel),
    },
    {
      label: "Power / capacity",
      values: products.map((product) => product.power),
      emphasize: true,
    },
    {
      label: "Warranty reference",
      values: products.map((product) => product.warranty),
    },
    {
      label: "Best for",
      values: products.map((product) => joinList(product.bestFor)),
    },
    {
      label: "Application",
      values: products.map((product) => joinList(product.apps)),
    },
  ];
}

function categoryRows(
  category: ProductCategory,
  products: Product[]
): ComparisonRow[] {
  if (category === "panel") {
    return [
      ...commonRows(products),
      {
        label: "System role",
        values: products.map((product) => product.role || "Generation"),
      },
      {
        label: "Panel format",
        values: products.map((product) =>
          /portable/i.test(getText(product))
            ? "Portable Solar Panel"
            : "Fixed PV Module"
        ),
      },
    ];
  }

  if (category === "inverter") {
    return [
      ...commonRows(products),
      {
        label: "Inverter type",
        values: products.map(getInverterType),
        emphasize: true,
      },
      {
        label: "AC phase",
        values: products.map(extractPhase),
      },
      {
        label: "System role",
        values: products.map((product) => product.role),
      },
    ];
  }

  if (category === "battery") {
    return [
      ...commonRows(products),
      {
        label: "Chemistry",
        values: products.map(extractChemistry),
        emphasize: true,
      },
      {
        label: "Nominal voltage",
        values: products.map(extractVoltage),
      },
      {
        label: "Capacity (Ah)",
        values: products.map(extractAmpHours),
      },
      {
        label: "Energy",
        values: products.map(extractEnergy),
      },
      {
        label: "System role",
        values: products.map((product) => product.role),
      },
    ];
  }

  if (category === "portable") {
    return [
      ...commonRows(products),
      {
        label: "Stored energy",
        values: products.map(extractEnergy),
        emphasize: true,
      },
      {
        label: "Format",
        values: products.map(() => "Portable Power"),
      },
      {
        label: "System role",
        values: products.map((product) => product.role),
      },
    ];
  }

  return [
    ...commonRows(products),
    {
      label: "Package type",
      values: products.map(getSystemType),
      emphasize: true,
    },
    {
      label: "Energy path",
      values: products.map(
        () => "Generation → Conversion → Storage / Loads"
      ),
    },
    {
      label: "System role",
      values: products.map((product) => product.role),
    },
  ];
}

export default function ProductCompare({
  products,
  isOpen,
  onOpen,
  onClose,
  onRemove,
  onClear,
}: ProductCompareProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  const rows = useMemo(() => {
    if (!products.length) return [];
    return categoryRows(products[0].category, products);
  }, [products]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    const focusTimer = window.setTimeout(() => {
      closeRef.current?.focus();
    }, 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [isOpen, onClose]);

  if (!products.length) {
    return null;
  }

  const categoryLabel = products[0].categoryLabel;

  return (
    <>
      <aside className="pcTray" aria-label="Product comparison selection">
        <div className="pcTrayTitle">
          <small>COMPARE {categoryLabel.toUpperCase()}</small>
          <b>
            {products.length}/4 selected
          </b>
        </div>

        <div className="pcTrayProducts">
          {products.map((product) => (
            <div className="pcTrayProduct" key={product.id}>
              <Image
                src={product.image}
                alt=""
                width={62}
                height={48}
              />

              <span>{product.name}</span>

              <button
                type="button"
                onClick={() => onRemove(product.id)}
                aria-label={`Remove ${product.name} from comparison`}
              >
                ×
              </button>
            </div>
          ))}

          {Array.from({ length: Math.max(0, 4 - products.length) }).map(
            (_, index) => (
              <div className="pcTraySlot" key={`empty-${index}`}>
                <span>+</span>
              </div>
            )
          )}
        </div>

        <div className="pcTrayActions">
          <button
            type="button"
            className="pcTrayClear"
            onClick={onClear}
          >
            Clear
          </button>

          <button
            type="button"
            className="pcTrayCompare"
            onClick={onOpen}
            disabled={products.length < 2}
          >
            {products.length < 2
              ? "Select 1 more"
              : `Compare ${products.length} Products →`}
          </button>
        </div>
      </aside>

      {isOpen && (
        <>
          <button
            type="button"
            className="pcBackdrop"
            aria-label="Close product comparison"
            onClick={onClose}
          />

          <section
            className="pcDialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pc-title"
          >
            <header className="pcDialogHead">
              <div>
                <small>PRODUCT COMPARISON</small>
                <h2 id="pc-title">
                  Compare {categoryLabel.toLowerCase()}.
                </h2>
                <p>
                  Only catalogue-supported information is compared.
                  Missing model-specific values are marked for
                  confirmation instead of being guessed.
                </p>
              </div>

              <div className="pcDialogHeadActions">
                <button type="button" onClick={onClear}>
                  Clear all
                </button>

                <button
                  ref={closeRef}
                  type="button"
                  className="pcDialogClose"
                  onClick={onClose}
                  aria-label="Close comparison"
                >
                  ×
                </button>
              </div>
            </header>

            <div
              className="pcTableWrap"
              style={
                {
                  "--pc-columns": products.length,
                } as React.CSSProperties
              }
            >
              <div className="pcProductHead pcRowLabel">
                <small>SELECTED PRODUCTS</small>
              </div>

              {products.map((product) => (
                <article className="pcProductHead" key={product.id}>
                  <button
                    type="button"
                    className="pcRemove"
                    onClick={() => onRemove(product.id)}
                    aria-label={`Remove ${product.name}`}
                  >
                    ×
                  </button>

                  <Link
                    className="pcProductImage"
                    href={`/products/${product.id}`}
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={280}
                      height={210}
                    />
                  </Link>

                  <small>{product.brandLabel}</small>
                  <h3>{product.name}</h3>

                  <Link
                    className="pcProductLink"
                    href={`/products/${product.id}`}
                  >
                    Full details →
                  </Link>
                </article>
              ))}

              {rows.map((row) => (
                <div className="pcCompareRow" key={row.label}>
                  <div className="pcRowLabel">
                    <small>{row.label}</small>
                  </div>

                  {row.values.map((value, index) => (
                    <div
                      className={`pcValue${
                        row.emphasize ? " isEmphasized" : ""
                      }`}
                      key={`${row.label}-${products[index].id}`}
                    >
                      {value}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <footer className="pcDialogFoot">
              <p>
                Final selection should still be checked against the exact
                manufacturer datasheet and the real system requirement.
              </p>

              <button type="button" onClick={onClose}>
                Back to Products
              </button>
            </footer>
          </section>
        </>
      )}
    </>
  );
}
