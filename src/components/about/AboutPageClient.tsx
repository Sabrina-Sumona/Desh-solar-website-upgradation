"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type CapabilityKey =
  | "products"
  | "systems"
  | "planning"
  | "installation"
  | "commissioning"
  | "support";

type Capability = {
  number: string;
  label: string;
  caption: string;
  kicker: string;
  title: string;
  text: string;
  checks: Array<[string, string]>;
  href: string;
  linkLabel: string;
};

const capabilities: Record<CapabilityKey, Capability> = {
  products: {
    number: "01",
    label: "Solar Equipment",
    caption: "Products and components",
    kicker: "SOLAR EQUIPMENT",
    title: "Start with the right component family.",
    text: "Panels, inverters, batteries, portable power and complete-system packages form the product layer. The correct choice still depends on the intended system architecture.",
    checks: [
      ["Typical question", "Which product class fits the energy requirement?"],
      ["Best next step", "Browse the catalogue, compare products, then open Product Details."],
    ],
    href: "/products",
    linkLabel: "Explore Products",
  },
  systems: {
    number: "02",
    label: "Complete Systems",
    caption: "Integrated solar solutions",
    kicker: "COMPLETE SOLAR SYSTEMS",
    title: "Products become useful when they work as one system.",
    text: "A complete solar solution connects PV generation, inverter capacity, battery storage, protection and the real site loads.",
    checks: [
      ["Typical question", "How much PV, inverter and storage should work together?"],
      ["Best next step", "Use Build Your System for a preliminary system profile."],
    ],
    href: "/build-your-system",
    linkLabel: "Build a System",
  },
  planning: {
    number: "03",
    label: "System Planning",
    caption: "Load, backup and PV",
    kicker: "SYSTEM PLANNING",
    title: "Start with the requirement—not the product model.",
    text: "Load, surge, backup hours, roof area, phase and electricity use shape the preliminary architecture before final product selection.",
    checks: [
      ["Typical question", "What does this property actually need?"],
      ["Best next step", "Use the Engineering Lab and Build Your System together."],
    ],
    href: "/engineering-lab",
    linkLabel: "Open Engineering Lab",
  },
  installation: {
    number: "04",
    label: "Installation",
    caption: "Site execution",
    kicker: "INSTALLATION",
    title: "The site turns the design into a working system.",
    text: "Mounting, equipment placement, cable routes, protection, roof or site constraints and safe execution are part of the engineering result.",
    checks: [
      ["Typical question", "How does this design fit the real site?"],
      ["Best next step", "Explore project showcases for installation contexts."],
    ],
    href: "/projects",
    linkLabel: "Explore Projects",
  },
  commissioning: {
    number: "05",
    label: "Commissioning",
    caption: "System verification",
    kicker: "COMMISSIONING",
    title: "A finished installation still needs verification.",
    text: "Commissioning confirms operating modes, system behaviour, protection and handover expectations before the system enters normal use.",
    checks: [
      ["Typical question", "Is the system operating as intended?"],
      ["Customer outcome", "A clear handover and support path."],
    ],
    href: "/customer-support",
    linkLabel: "See Support Path",
  },
  support: {
    number: "06",
    label: "Technical Support",
    caption: "After-sales assistance",
    kicker: "TECHNICAL SUPPORT",
    title: "The customer journey continues after installation.",
    text: "Product, system, installation, warranty and troubleshooting needs should move into a structured support workflow rather than a generic contact form.",
    checks: [
      ["Typical question", "What product or system information should support receive?"],
      ["Best next step", "Use the guided Customer Support Center."],
    ],
    href: "/customer-support",
    linkLabel: "Open Customer Support",
  },
};

const capabilityOrder: CapabilityKey[] = [
  "products",
  "systems",
  "planning",
  "installation",
  "commissioning",
  "support",
];

const pillars = [
  {
    number: "01",
    title: "Solar Products",
    text: "Panels, inverters, batteries and complete systems.",
    href: "/products",
  },
  {
    number: "02",
    title: "System Engineering",
    text: "Load, backup, roof and architecture planning.",
    href: "/engineering-lab",
  },
  {
    number: "03",
    title: "Installation & Commissioning",
    text: "Project thinking from site study to handover.",
    href: "/projects",
  },
  {
    number: "04",
    title: "After-Sales Support",
    text: "Product, system and warranty assistance.",
    href: "/customer-support",
  },
];

const audiences = [
  ["⌂", "Residential", "Homes & Backup", "Rooftop solar, home loads and essential backup."],
  ["▦", "Commercial", "Business Energy", "Daytime consumption, cooling, IT and continuity."],
  ["⚙", "Industrial", "Factories & Industry", "Three-phase loads, motors and project-scale systems."],
  ["☀", "Agriculture", "Irrigation & Farm Energy", "Pump horsepower and daytime solar operation."],
  ["⛽", "Filling Stations", "Operational Energy", "Forecourt, office, security and critical backup."],
  ["◇", "Custom Projects", "Off-Grid Energy", "Storage autonomy and remote-site energy planning."],
] as const;

const whyItems = [
  ["01", "Complete solution approach", "Products, planning, installation, commissioning and support are presented as one connected journey."],
  ["02", "Engineering-led selection", "Load, backup, phase, PV potential and compatibility are considered before final equipment decisions."],
  ["03", "Product authenticity focus", "Product selection is supported by applicable manufacturer specifications and documentation."],
  ["04", "Nationwide customer reach", "The customer journey is designed to support enquiries and delivery needs across Bangladesh."],
  ["05", "Technical guidance", "Engineering tools and system-planning flows help customers make better early-stage decisions."],
  ["06", "After-sales pathway", "Customer Support provides dedicated product, system, installation and warranty-assistance routes."],
] as const;

const journey = [
  ["01", "DISCOVER", "Products + projects", "/products"],
  ["02", "PLAN", "Loads + backup + roof", "/build-your-system"],
  ["03", "VERIFY", "Engineering checks", "/engineering-lab"],
  ["04", "SELECT", "Equipment path", "/products"],
  ["05", "INSTALL", "Project execution", "/projects"],
  ["06", "SUPPORT", "After-sales", "/customer-support"],
] as const;

export default function AboutPageClient() {
  const [activeCapability, setActiveCapability] =
    useState<CapabilityKey>("products");

  const active = capabilities[activeCapability];

  return (
    <div className="aboutPage">
      <section className="aboutHero" aria-labelledby="about-title">
        <div className="aboutHeroGlow aboutHeroGlowOne" aria-hidden="true" />
        <div className="aboutHeroGlow aboutHeroGlowTwo" aria-hidden="true" />

        <div className="aboutHeroCopy">
          <div className="aboutEyebrow">About Desh Solar</div>
          <h1 id="about-title">
            Powering better <span>energy decisions.</span>
          </h1>
          <p>
            Desh Solar connects solar products, system planning, installation,
            commissioning and customer support into one complete solar-energy
            journey.
          </p>

          <div className="aboutActions">
            <a className="aboutButton aboutButtonPrimary" href="#who-we-are">
              Discover Desh Solar <span aria-hidden="true">→</span>
            </a>
            <Link className="aboutButton aboutButtonSecondary" href="/build-your-system">
              Build Your System <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="aboutHeroMark" aria-label="Desh Solar energy journey">
          <div className="aboutHeroMarkInner">
            <Image
              src="/assets/desh-solar-logo.png"
              alt="Desh Solar"
              width={420}
              height={140}
              priority
            />
            <div className="aboutHeroSignal" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <small>PRODUCTS → ENGINEERING → SYSTEMS → SUPPORT</small>
          </div>
        </div>
      </section>

      <section className="aboutPillars" aria-label="Desh Solar capability pillars">
        {pillars.map((pillar) => (
          <Link key={pillar.number} href={pillar.href} className="aboutPillarCard">
            <span>{pillar.number}</span>
            <b>{pillar.title}</b>
            <small>{pillar.text}</small>
            <i aria-hidden="true">↗</i>
          </Link>
        ))}
      </section>

      <section className="aboutSection aboutWho" id="who-we-are">
        <div className="aboutWhoVisual" aria-label="Solar energy system components">
          <div className="aboutWhoGrid" aria-hidden="true" />
          <div className="aboutEnergyPath" aria-hidden="true" />

          <div className="aboutSystemCard aboutSystemPanel">
            <div className="aboutSystemImage">
              <Image
                src="/assets/products-real/jinko590.jpg"
                alt="Solar panel"
                fill
                sizes="(max-width: 720px) 38vw, 180px"
              />
            </div>
            <small>01</small>
            <b>Generation</b>
          </div>

          <div className="aboutSystemCard aboutSystemInverter">
            <div className="aboutSystemImage">
              <Image
                src="/assets/products-real/goodwe6.jpg"
                alt="Solar inverter"
                fill
                sizes="(max-width: 720px) 38vw, 180px"
              />
            </div>
            <small>02</small>
            <b>Control</b>
          </div>

          <div className="aboutSystemCard aboutSystemBattery">
            <div className="aboutSystemImage">
              <Image
                src="/assets/products-real/hithium16.webp"
                alt="Lithium battery"
                fill
                sizes="(max-width: 720px) 38vw, 180px"
              />
            </div>
            <small>03</small>
            <b>Storage</b>
          </div>
        </div>

        <div className="aboutWhoCopy">
          <div className="aboutEyebrow">Who We Are</div>
          <h2>More than a solar equipment seller.</h2>
          <p>
            Desh Solar brings products and complete solar-power solutions into
            one experience—from early planning and supply through installation,
            commissioning and ongoing support. The goal is to help customers
            think in complete energy systems rather than isolated components.
          </p>

          <div className="aboutWhoFlow" aria-label="Desh Solar service process">
            {[
              "SELECT",
              "DESIGN",
              "SUPPLY",
              "INSTALL",
              "COMMISSION",
              "SUPPORT",
            ].map((item, index) => (
              <div key={item}>
                <span>{item}</span>
                {index < 5 && <i aria-hidden="true">→</i>}
              </div>
            ))}
          </div>

          <Link className="aboutInlineLink" href="/projects">
            See solar systems in real-world contexts <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section className="aboutSection aboutCapabilities" id="what-we-do">
        <div className="aboutSectionHead">
          <div>
            <div className="aboutEyebrow">What We Do</div>
            <h2>One company. Six connected capabilities.</h2>
            <p>Choose a capability to see where it fits in the customer journey.</p>
          </div>
        </div>

        <div className="aboutCapabilityWorkspace">
          <div className="aboutCapabilityGrid" role="tablist" aria-label="Desh Solar capabilities">
            {capabilityOrder.map((key) => {
              const item = capabilities[key];
              const selected = key === activeCapability;

              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={`aboutCapabilityCard${selected ? " isActive" : ""}`}
                  onClick={() => setActiveCapability(key)}
                >
                  <span>{item.number}</span>
                  <b>{item.label}</b>
                  <small>{item.caption}</small>
                </button>
              );
            })}
          </div>

          <aside className="aboutCapabilityInspector" aria-live="polite">
            <small>{active.kicker}</small>
            <h3>{active.title}</h3>
            <p>{active.text}</p>

            <div className="aboutCapabilityChecks">
              {active.checks.map(([label, value]) => (
                <div key={`${activeCapability}-${label}`}>
                  <small>{label}</small>
                  <b>{value}</b>
                </div>
              ))}
            </div>

            <Link href={active.href}>
              {active.linkLabel} <span aria-hidden="true">→</span>
            </Link>
          </aside>
        </div>
      </section>

      <section className="aboutSection aboutProductSystem">
        <div className="aboutSectionHead">
          <div>
            <div className="aboutEyebrow">From Product to Energy System</div>
            <h2>We don&apos;t look at products in isolation.</h2>
            <p>
              Solar performance depends on how generation, conversion, storage,
              protection and site loads work together.
            </p>
          </div>
        </div>

        <div className="aboutSystemFlow" aria-label="Solar system architecture">
          <Link href="/products?category=panel" className="aboutFlowNode">
            <span>☀</span><b>Solar Panel</b><small>Generation</small>
          </Link>
          <i aria-hidden="true">→</i>
          <Link href="/products?category=inverter" className="aboutFlowNode">
            <span>↯</span><b>Inverter</b><small>Control</small>
          </Link>
          <i aria-hidden="true">↔</i>
          <Link href="/products?category=battery" className="aboutFlowNode">
            <span>▣</span><b>Battery</b><small>Storage</small>
          </Link>
          <i aria-hidden="true">→</i>
          <div className="aboutFlowNode">
            <span>⛨</span><b>Protection</b><small>Safety layer</small>
          </div>
          <i aria-hidden="true">→</i>
          <Link href="/projects" className="aboutFlowNode">
            <span>⌂</span><b>Installation</b><small>Site integration</small>
          </Link>
          <i aria-hidden="true">→</i>
          <Link href="/build-your-system" className="aboutFlowNode aboutFlowNodeFinal">
            <span>●</span><b>Energy System</b><small>Complete architecture</small>
          </Link>
        </div>

        <div className="aboutPrinciples">
          <article><small>LOAD</small><b>What needs to run?</b><p>Running load and surge define the power requirement.</p></article>
          <article><small>BACKUP</small><b>For how long?</b><p>Load × time drives the storage requirement.</p></article>
          <article><small>PV</small><b>How much can the site generate?</b><p>Roof, shading and energy goals shape the solar array.</p></article>
          <article><small>COMPATIBILITY</small><b>Will the components work together?</b><p>Voltage, current, MPPT, BMS and phase need technical review.</p></article>
        </div>
      </section>

      <section className="aboutSection aboutServe" id="who-we-serve">
        <div className="aboutSectionHead">
          <div>
            <div className="aboutEyebrow">Who We Serve</div>
            <h2>Different sites need different energy strategies.</h2>
            <p>Move from the company story into the project type closest to your requirement.</p>
          </div>
          <Link href="/projects" className="aboutInlineLink">
            Explore projects <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="aboutServeGrid">
          {audiences.map(([icon, category, title, text]) => (
            <Link href="/projects" key={category}>
              <span>{icon}</span>
              <small>{category}</small>
              <b>{title}</b>
              <p>{text}</p>
              <i aria-hidden="true">↗</i>
            </Link>
          ))}
        </div>
      </section>

      <section className="aboutSection aboutPhilosophy">
        <div className="aboutPhilosophyCopy">
          <div className="aboutEyebrow">Our Engineering Philosophy</div>
          <h2>Start with the requirement. Then choose the technology.</h2>
          <p>
            A good solar decision begins with the site, loads, operating hours,
            backup target and energy goal—not with a product model.
          </p>
          <Link className="aboutButton aboutButtonPrimary" href="/engineering-lab">
            Open Engineering Lab <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="aboutPhilosophyFlow">
          {[
            ["01", "UNDERSTAND", "Property + energy need"],
            ["02", "CALCULATE", "Load + backup + PV"],
            ["03", "ENGINEER", "Architecture + protection"],
            ["04", "SELECT", "Suitable equipment"],
            ["05", "INSTALL", "Site execution"],
            ["06", "SUPPORT", "After-sales path"],
          ].map(([number, title, text], index) => (
            <div className="aboutPhilosophyStep" key={number}>
              <div>
                <span>{number}</span>
                <b>{title}</b>
                <small>{text}</small>
              </div>
              {index < 5 && <i aria-hidden="true">→</i>}
            </div>
          ))}
        </div>
      </section>

      <section className="aboutSection aboutEcosystemSection">
        <div className="aboutSectionHead aboutSectionHeadCentered">
          <div>
            <div className="aboutEyebrow">Desh Solar Ecosystem</div>
            <h2>One connected customer experience.</h2>
            <p>Products, engineering, projects and support connect around the customer.</p>
          </div>
        </div>

        <div className="aboutEcosystem">
          <div className="aboutEcoRing aboutEcoRingOne" aria-hidden="true" />
          <div className="aboutEcoRing aboutEcoRingTwo" aria-hidden="true" />

          <div className="aboutEcoCore">
            <Image
              src="/assets/desh-solar-logo.png"
              alt="Desh Solar"
              width={240}
              height={80}
            />
            <b>DESH SOLAR</b>
            <small>Complete solar-energy journey</small>
          </div>

          <Link className="aboutEcoNode aboutEcoNode1" href="/products"><span>▤</span><b>Products</b><small>Equipment</small></Link>
          <Link className="aboutEcoNode aboutEcoNode2" href="/projects"><span>⌂</span><b>Projects</b><small>Applications</small></Link>
          <Link className="aboutEcoNode aboutEcoNode3" href="/engineering-lab"><span>↯</span><b>Engineering</b><small>Tools + tech</small></Link>
          <Link className="aboutEcoNode aboutEcoNode4" href="/build-your-system"><span>◇</span><b>Planning</b><small>System builder</small></Link>
          <Link className="aboutEcoNode aboutEcoNode5" href="/customer-support"><span>?</span><b>Support</b><small>After-sales</small></Link>
          <Link className="aboutEcoNode aboutEcoNode6" href="/contact"><span>☎</span><b>Consultation</b><small>Customer contact</small></Link>
        </div>
      </section>

      <section className="aboutSection aboutWhy">
        <div className="aboutSectionHead">
          <div>
            <div className="aboutEyebrow">Why Desh Solar</div>
            <h2>Trust should come from capability.</h2>
            <p>
              The page focuses on the actual customer journey and engineering
              process rather than decorative or unverified statistics.
            </p>
          </div>
        </div>

        <div className="aboutWhyGrid">
          {whyItems.map(([number, title, text]) => (
            <article key={number}>
              <span>{number}</span>
              <b>{title}</b>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="aboutSection aboutTechnology">
        <div className="aboutSectionHead">
          <div>
            <div className="aboutEyebrow">Technologies in the Catalogue</div>
            <h2>Real equipment families already represented in the store.</h2>
            <p>
              These cards show product families available in the catalogue and
              do not imply any separate partnership status.
            </p>
          </div>
          <Link href="/products" className="aboutInlineLink">
            Browse catalogue <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="aboutTechnologyGrid">
          <Link href="/products/jinko590">
            <div><Image src="/assets/products-real/jinko590.jpg" alt="Jinko solar panel" fill sizes="(max-width: 720px) 92vw, 25vw" /></div>
            <small>Solar Panels</small><b>Jinko</b><span>View product →</span>
          </Link>
          <Link href="/products/goodwe6">
            <div><Image src="/assets/products-real/goodwe6.jpg" alt="GoodWe inverter" fill sizes="(max-width: 720px) 92vw, 25vw" /></div>
            <small>Inverters</small><b>GoodWe</b><span>View product →</span>
          </Link>
          <Link href="/products/hithium16">
            <div><Image src="/assets/products-real/hithium16.webp" alt="HiTHIUM battery" fill sizes="(max-width: 720px) 92vw, 25vw" /></div>
            <small>Lithium Storage</small><b>HiTHIUM</b><span>View product →</span>
          </Link>
          <Link href="/products/lvt-g3-314">
            <div><Image src="/assets/products-real/lvt-g3-314.jpg" alt="LVTOPSUN battery" fill sizes="(max-width: 720px) 92vw, 25vw" /></div>
            <small>Battery Systems</small><b>LVTOPSUN</b><span>View product →</span>
          </Link>
        </div>
      </section>

      <section className="aboutSection aboutJourney">
        <div className="aboutSectionHead">
          <div>
            <div className="aboutEyebrow">How Customers Move Through Desh Solar</div>
            <h2>From discovery to ongoing support.</h2>
          </div>
        </div>

        <div className="aboutJourneyTrack">
          {journey.map(([number, title, text, href], index) => (
            <div className="aboutJourneyStep" key={number}>
              <Link href={href}>
                <span>{number}</span>
                <b>{title}</b>
                <small>{text}</small>
              </Link>
              {index < journey.length - 1 && <i aria-hidden="true">→</i>}
            </div>
          ))}
        </div>
      </section>

      <section className="aboutSection aboutAccess">
        <div className="aboutAccessCopy">
          <div className="aboutEyebrow">Customer Access</div>
          <h2>Useful support details, clearly visible.</h2>
          <p>
            The company story should make it easy to move from understanding
            Desh Solar to reaching the right team.
          </p>

          <div className="aboutAccessFacts">
            <div><small>Customer Service</small><b>10:00 AM – 11:00 PM</b><span>7 days a week</span></div>
            <div><small>Phone</small><b>01754-477488</b><span>Customer support line</span></div>
            <div><small>Display Center</small><b>Bangla Motor, Dhaka</b><span>Navana Zohura Square, Ground Floor</span></div>
            <div><small>Coverage</small><b>Across Bangladesh</b><span>Customer enquiries and delivery support</span></div>
          </div>
        </div>

        <div className="aboutAccessActions">
          <Link className="aboutButton aboutButtonPrimary" href="/customer-support">Open Customer Support <span aria-hidden="true">→</span></Link>
          <Link className="aboutButton aboutButtonSecondary" href="/contact">Contact Desh Solar <span aria-hidden="true">→</span></Link>
        </div>
      </section>

      <section className="aboutSection aboutProjects">
        <div className="aboutSectionHead">
          <div>
            <div className="aboutEyebrow">Systems in Context</div>
            <h2>See how different project types change the solution.</h2>
          </div>
          <Link href="/projects" className="aboutInlineLink">Explore all projects <span aria-hidden="true">→</span></Link>
        </div>

        <div className="aboutProjectGrid">
          <Link href="/projects">
            <Image src="/assets/projects-real/residential.webp" alt="Residential rooftop solar project" fill sizes="(max-width: 720px) 92vw, 33vw" />
            <div><small>RESIDENTIAL</small><b>Residential Rooftop Hybrid</b><span>View Project →</span></div>
          </Link>
          <Link href="/projects">
            <Image src="/assets/projects-real/industrial.webp" alt="Industrial rooftop solar project" fill sizes="(max-width: 720px) 92vw, 33vw" />
            <div><small>INDUSTRIAL</small><b>Industrial Factory Rooftop Solar</b><span>View Project →</span></div>
          </Link>
          <Link href="/projects">
            <Image src="/assets/projects-real/agriculture.webp" alt="Agriculture solar project" fill sizes="(max-width: 720px) 92vw, 33vw" />
            <div><small>AGRICULTURE</small><b>Solar Irrigation & Farm Energy</b><span>View Project →</span></div>
          </Link>
        </div>
      </section>

      <section className="aboutSection aboutEngineeringTeaser">
        <div className="aboutEngineeringCopy">
          <div className="aboutEyebrow">Engineering Lab</div>
          <h2>Understand the technology behind the system.</h2>
          <p>
            Use generation, battery, inverter, roof, load and compatibility tools
            before moving into full system planning.
          </p>
          <Link className="aboutButton aboutButtonPrimary" href="/engineering-lab">
            Open Engineering Lab <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="aboutEngineeringTools">
          <Link href="/engineering-lab"><span>☀</span><b>Generation</b><small>PV energy estimate</small></Link>
          <Link href="/engineering-lab"><span>▣</span><b>Battery</b><small>Runtime planning</small></Link>
          <Link href="/engineering-lab"><span>↯</span><b>Inverter</b><small>Load + surge sizing</small></Link>
          <Link href="/engineering-lab"><span>◇</span><b>Energy Flow</b><small>Day / night simulator</small></Link>
        </div>
      </section>

      <section className="aboutFinalCta">
        <div>
          <div className="aboutEyebrow">Your Next Step</div>
          <h2>From a solar product to a complete energy system.</h2>
          <p>Explore the catalogue, build a preliminary system or talk directly with Desh Solar.</p>
        </div>
        <div className="aboutActions">
          <Link className="aboutButton aboutButtonPrimary" href="/products">Explore Products <span aria-hidden="true">→</span></Link>
          <Link className="aboutButton aboutButtonSecondary" href="/build-your-system">Build Your System <span aria-hidden="true">→</span></Link>
          <Link className="aboutButton aboutButtonSecondary" href="/contact">Contact Us <span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </div>
  );
}
