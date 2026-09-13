import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import ProductDetailsActions from "@/components/products/ProductDetailsActions";
import ProductImageGallery from "@/components/products/ProductImageGallery";
import ProductTechnicalDetails from "@/components/products/ProductTechnicalDetails";
import ProductPlanningPanel from "@/components/products/ProductPlanningPanel";
import SystemPackageBreakdown from "@/components/products/SystemPackageBreakdown";
import { products, type Product } from "@/data/products";

import "@/styles/product-details.css";

type ProductDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const categoryDescriptions: Record<Product["category"], string> = {
  panel:
    "A solar-generation component that converts sunlight into electrical energy for the rest of the system.",
  inverter:
    "A power-conversion component that manages how energy moves between the solar array, electrical loads and the wider system.",
  battery:
    "An energy-storage component used to keep electrical energy available for backup or later use.",
  portable:
    "A compact portable-power solution designed to keep useful electrical energy available away from a fixed installation.",
  system:
    "A packaged solar solution that combines multiple system components around a defined power or application requirement.",
};

const categoryRoleDescriptions: Record<Product["category"], string> = {
  panel:
    "This product sits at the generation stage. Its job is to produce solar electricity before conversion, storage or direct use.",
  inverter:
    "This product sits at the conversion and control stage. The exact energy path depends on whether the listed model is on-grid, off-grid or hybrid.",
  battery:
    "This product sits at the storage stage. It stores electrical energy so the system can use it when generation or grid supply is not available.",
  portable:
    "This product combines stored energy and usable output in a portable format, so storage and load delivery happen inside one compact product.",
  system:
    "This is a complete-system package rather than one isolated component, so it spans multiple stages of the energy path.",
};

const roleNodes = [
  { key: "panel", label: "Generation" },
  { key: "inverter", label: "Conversion" },
  { key: "battery", label: "Storage" },
  { key: "load", label: "Loads" },
] as const;

function isRoleActive(
  category: Product["category"],
  role: (typeof roleNodes)[number]["key"]
) {
  if (category === "system") {
    return true;
  }

  if (category === "portable") {
    return role === "battery" || role === "load";
  }

  return category === role;
}

function getOperationType(product: Product) {
  const name = product.name.toLowerCase();

  if (product.category === "inverter") {
    if (name.includes("on-grid")) return "On-Grid";
    if (name.includes("off-grid") && name.includes("hybrid")) {
      return "Off-Grid Hybrid";
    }
    if (name.includes("hybrid")) return "Hybrid";
    return "Solar Inverter";
  }

  if (product.category === "battery") {
    if (name.includes("lifepo4") || name.includes("lithium")) {
      return "Lithium Energy Storage";
    }
    return "Energy Storage";
  }

  if (product.category === "portable") {
    return "Portable Power";
  }

  if (product.category === "panel") {
    return "Solar Generation";
  }

  if (name.includes("pump")) {
    return "Solar Pump System";
  }

  if (name.includes("off-grid")) {
    return "Off-Grid Solar System";
  }

  if (name.includes("hybrid")) {
    return "Hybrid Solar System";
  }

  return "Complete Solar System";
}

function getPlanningNote(product: Product) {
  switch (product.category) {
    case "panel":
      return "Panel quantity should be selected from the target system size, available installation area, inverter limits and site conditions.";
    case "inverter":
      return "Inverter selection should be checked against connected load, surge requirement, system voltage, solar input and the intended grid / backup architecture.";
    case "battery":
      return "Battery selection should be checked against required backup energy, compatible system voltage, charge / discharge limits and the intended inverter.";
    case "portable":
      return "Portable-power selection should be checked against the devices you need to run, their combined wattage and the required runtime.";
    case "system":
      return "Complete-system suitability should be checked against actual connected load, energy use, backup target, installation conditions and final component configuration.";
  }
}

function getTechnicalReview(product: Product) {
  switch (product.category) {
    case "panel":
      return "Confirm the exact model datasheet, electrical ratings, physical dimensions, mounting method and compatibility with the selected inverter before installation.";
    case "inverter":
      return "Confirm the exact model datasheet, AC phase, PV input range, battery compatibility where applicable and protection requirements before installation.";
    case "battery":
      return "Confirm nominal voltage, usable energy, BMS compatibility, current limits, communication requirements and the applicable warranty before final selection.";
    case "portable":
      return "Confirm usable capacity, continuous output, surge capability, available ports, charging methods and runtime for your intended devices.";
    case "system":
      return "Confirm the final bill of materials, component models, installation scope, protection devices, cable sizing and commissioning requirements with Desh Solar.";
  }
}

function getRelatedProducts(product: Product) {
  return products
    .filter(
      (candidate) =>
        candidate.id !== product.id &&
        candidate.category === product.category
    )
    .sort((a, b) => {
      const brandMatchA = a.brand === product.brand ? 0 : 1;
      const brandMatchB = b.brand === product.brand ? 0 : 1;

      if (brandMatchA !== brandMatchB) {
        return brandMatchA - brandMatchB;
      }

      return a.featuredOrder - b.featuredOrder;
    })
    .slice(0, 4);
}

export function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }));
}

export async function generateMetadata({
  params,
}: ProductDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = products.find((item) => item.id === id);

  if (!product) {
    return {
      title: "Product Not Found | Desh Solar",
    };
  }

  return {
    title: `${product.name} | Desh Solar`,
    description: `${product.brandLabel} ${product.categoryLabel}. ${product.power}. Explore product information, system role and planning guidance from Desh Solar.`,
  };
}

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const { id } = await params;
  const product = products.find((item) => item.id === id);

  if (!product) {
    notFound();
  }

  const relatedProducts = getRelatedProducts(product);
  const operationType = getOperationType(product);
  const whatsappText = encodeURIComponent(
    `Assalamu Alaikum. I want to know more about ${product.name} (${product.id}).`
  );

  const buildSystemHref =
    `/build-your-system?selectedProduct=${encodeURIComponent(product.id)}` +
    `&productType=${encodeURIComponent(product.category)}` +
    `&selectedName=${encodeURIComponent(product.name)}` +
    `&selectedRating=${encodeURIComponent(product.power)}`;

  return (
    <main className="pdPage">
      <section className="pdHero">
        <div className="pdShell">
          <nav className="pdBreadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span>→</span>
            <Link href="/products">Products</Link>
            <span>→</span>
            <b>{product.name}</b>
          </nav>

          <div className="pdHeroGrid">
            <div className="pdMediaPanel">
              <ProductImageGallery product={product} />
            </div>

            <div className="pdHeroContent">
              <div className="pdEyebrow">
                {product.brandLabel} · {product.categoryLabel}
              </div>

              <h1>{product.name}</h1>

              <p className="pdWhy">
                {categoryDescriptions[product.category]}
              </p>

              <div className="pdBestFor">
                <small>BEST FOR</small>

                <div>
                  {product.bestFor.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </div>

              <div className="pdPriceBlock">
                <div>
                  <small>CURRENT CATALOGUE PRICE</small>

                  <div className="pdPriceLine">
                    <strong>{product.priceText}</strong>

                    {product.oldPriceText && (
                      <del>{product.oldPriceText}</del>
                    )}
                  </div>
                </div>

                <div className="pdAvailability">
                  <small>AVAILABILITY</small>
                  <b>Check current stock</b>
                </div>
              </div>

              <ProductDetailsActions product={product} />

              <div className="pdContactRow">
                <a
                  className="pdSecondaryAction"
                  href={`https://wa.me/8801754477488?text=${whatsappText}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp About Product
                </a>

                <a
                  className="pdSecondaryAction"
                  href="tel:01754477488"
                >
                  Call 01754-477488
                </a>
              </div>

              <p className="pdSnapshotNote">
                Price, stock, warranty and specifications can change.
                Confirm final commercial and technical details before
                purchase or installation.
              </p>
            </div>
          </div>
        </div>
      </section>

      <ProductTechnicalDetails
        product={product}
        operationType={operationType}
      />

      <SystemPackageBreakdown product={product} />

      <section className="pdSection pdAlt">
        <div className="pdShell">
          <div className="pdSectionHead">
            <div>
              <div className="pdEyebrow">SYSTEM ROLE</div>
              <h2>Where does this product belong?</h2>
            </div>

            <p>
              Solar equipment should be evaluated as part of the whole
              energy path rather than as an isolated product.
            </p>
          </div>

          <div className="pdRoleLayout">
            <div
              className="pdRoleFlow"
              aria-label="Solar energy system flow"
            >
              {roleNodes.map((node, index) => (
                <div className="pdRoleFlowItem" key={node.key}>
                  <div
                    className={`pdRoleNode${
                      isRoleActive(product.category, node.key)
                        ? " active"
                        : ""
                    }`}
                  >
                    <span>0{index + 1}</span>
                    <b>{node.label}</b>
                  </div>

                  {index < roleNodes.length - 1 && (
                    <i className="pdRoleArrow" aria-hidden="true">
                      →
                    </i>
                  )}
                </div>
              ))}
            </div>

            <article className="pdRoleInfo">
              <small>PRODUCT ROLE</small>
              <h3>{product.role}</h3>
              <p>{categoryRoleDescriptions[product.category]}</p>

              <div className="pdRoleTags">
                {product.apps.map((app) => (
                  <span key={app}>{app}</span>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>

      <ProductPlanningPanel
        product={product}
        variant="details"
      />

      <section className="pdSection">
        <div className="pdShell">
          <div className="pdSectionHead">
            <div>
              <div className="pdEyebrow">PLANNING GUIDANCE</div>
              <h2>Check it against your requirement.</h2>
            </div>

            <p>
              Product selection should start from the actual load,
              installation conditions and required energy outcome.
            </p>
          </div>

          <div className="pdGuidanceGrid">
            <article>
              <small>WHY CONSIDER IT?</small>
              <h3>{product.bestFor.join(" · ")}</h3>
              <p>
                The catalogue positions this product for the use cases
                above. Match those use cases with your actual project
                requirement before final selection.
              </p>
            </article>

            <article>
              <small>PLANNING CHECK</small>
              <h3>Size the system, not just the product.</h3>
              <p>{getPlanningNote(product)}</p>
            </article>

            <article>
              <small>TECHNICAL REVIEW</small>
              <h3>Confirm the exact model before installation.</h3>
              <p>{getTechnicalReview(product)}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="pdBuilderBand">
        <div className="pdShell pdBuilderBandInner">
          <div>
            <small>DESIGN AROUND YOUR LOAD</small>
            <h2>Use this product as a starting point.</h2>
            <p>
              Continue into Build Your System with this product already
              identified, then size the rest of the solution around your
              real appliances, load and backup target.
            </p>
          </div>

          <Link className="pdBuilderButton" href={buildSystemHref}>
            Use in My System →
          </Link>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="pdSection pdRelatedSection">
          <div className="pdShell">
            <div className="pdSectionHead">
              <div>
                <div className="pdEyebrow">RELATED PRODUCTS</div>
                <h2>More from this category.</h2>
              </div>

              <Link className="pdViewAll" href="/products">
                Browse all products →
              </Link>
            </div>

            <div className="pdRelatedGrid">
              {relatedProducts.map((related) => (
                <article className="pdRelatedCard" key={related.id}>
                  <Link
                    className="pdRelatedImage"
                    href={`/products/${related.id}`}
                  >
                    <Image
                      src={related.image}
                      alt={related.name}
                      width={620}
                      height={460}
                      sizes="(max-width: 700px) 92vw, (max-width: 1100px) 45vw, 23vw"
                    />
                    <span>{related.categoryLabel}</span>
                  </Link>

                  <div className="pdRelatedBody">
                    <small>{related.brandLabel}</small>

                    <h3>
                      <Link href={`/products/${related.id}`}>
                        {related.name}
                      </Link>
                    </h3>

                    <div className="pdRelatedMeta">
                      <b>{related.priceText}</b>
                      <span>{related.power}</span>
                    </div>

                    <Link
                      className="pdRelatedLink"
                      href={`/products/${related.id}`}
                    >
                      View Product Details →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="pdFinalCta">
        <div>
          <small>NEED HELP BEFORE YOU BUY?</small>
          <h2>Confirm fit, stock and final configuration.</h2>
          <p>
            Desh Solar can review the product against your load, backup
            requirement and installation conditions before you finalize the
            system.
          </p>
        </div>

        <div>
          <a href="tel:01754477488">Call Desh Solar →</a>
          <a
            href={`https://wa.me/8801754477488?text=${whatsappText}`}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp →
          </a>
        </div>
      </section>
    </main>
  );
}
