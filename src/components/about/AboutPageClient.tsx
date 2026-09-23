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

type CapabilityData = {
  kicker: string;
  title: string;
  text: string;
  checks: [string, string][];
  href: string;
  label: string;
};

const capabilities: Record<CapabilityKey, CapabilityData> = {
  products: {
    kicker: "SOLAR EQUIPMENT",
    title: "Start with the right component family.",
    text: "Panels, inverters, batteries, portable power and complete-system packages form the product layer. The correct choice still depends on the intended system architecture.",
    checks: [
      ["Typical question", "Which product class fits the energy requirement?"],
      ["Best next page", "Browse the catalogue, compare products, then open Product Details."],
    ],
    href: "/products",
    label: "Explore Products →",
  },
  systems: {
    kicker: "COMPLETE SOLAR SYSTEMS",
    title: "Products become useful when they work as one system.",
    text: "A complete solar solution connects PV generation, inverter capacity, battery storage, protection and the real site loads.",
    checks: [
      ["Typical question", "How much PV, inverter and storage should work together?"],
      ["Best next page", "Use Build Your System for a preliminary system profile."],
    ],
    href: "/build-your-system",
    label: "Build a System →",
  },
  planning: {
    kicker: "SYSTEM PLANNING",
    title: "Start with the requirement—not the product model.",
    text: "Load, surge, backup hours, roof area, phase and electricity use shape the preliminary architecture before final product selection.",
    checks: [
      ["Typical question", "What does this property actually need?"],
      ["Best next page", "Use the Engineering Lab and Build Your System together."],
    ],
    href: "/tools-and-technology",
    label: "Open Engineering Lab →",
  },
  installation: {
    kicker: "INSTALLATION",
    title: "The site turns the design into a working system.",
    text: "Mounting, equipment placement, cable routes, protection, roof/site constraints and safe execution are part of the engineering result.",
    checks: [
      ["Typical question", "How does this design fit the real site?"],
      ["Best next page", "Explore project showcases for installation contexts."],
    ],
    href: "/projects",
    label: "Explore Projects →",
  },
  commissioning: {
    kicker: "COMMISSIONING",
    title: "A finished installation still needs verification.",
    text: "Commissioning confirms operating modes, system behaviour, protection and handover expectations before the system enters normal use.",
    checks: [
      ["Typical question", "Is the system operating as intended?"],
      ["Customer outcome", "A clear handover and support path."],
    ],
    href: "/customer-support",
    label: "See Support Path →",
  },
  support: {
    kicker: "TECHNICAL SUPPORT",
    title: "The customer journey continues after installation.",
    text: "Product, system, installation, warranty and troubleshooting needs should move into a structured support workflow rather than a generic contact form.",
    checks: [
      ["Typical question", "What product/system information should support receive?"],
      ["Best next page", "Use the guided Customer Support Center."],
    ],
    href: "/customer-support",
    label: "Open Customer Support →",
  },
};

const capabilityCards: Array<[CapabilityKey, string, string, string]> = [
  ["products", "01", "Solar Equipment", "Products and components"],
  ["systems", "02", "Complete Systems", "Integrated solar solutions"],
  ["planning", "03", "System Planning", "Load, backup and PV"],
  ["installation", "04", "Installation", "Site execution"],
  ["commissioning", "05", "Commissioning", "System verification"],
  ["support", "06", "Technical Support", "After-sales assistance"],
];

export default function AboutPageClient() {
  const [activeCapability, setActiveCapability] =
    useState<CapabilityKey>("products");
  const active = capabilities[activeCapability];

  return (
    <div className="aboutPrototype">
      <main className="demoPage aboutAdvancedPage">
        <section className="aboutCompactHero">
          <div className="aboutHeroCopy">
            <div className="demoEyebrow">About Desh Solar</div>
            <h1>
              Powering better <span>energy decisions.</span>
            </h1>
            <p>
              Desh Solar connects solar products, system planning, installation,
              commissioning and customer support into one complete solar-energy
              journey.
            </p>
            <div className="demoActions">
              <a className="demoBtn" href="#who-we-are">
                Discover Desh Solar →
              </a>
              <Link className="demoBtn secondary" href="/build-your-system">
                Build Your System →
              </Link>
            </div>
          </div>

          <div className="aboutHeroMark">
            <Image
              alt="Desh Solar"
              src="/assets/desh-solar-logo.png"
              width={520}
              height={180}
              priority
            />
            <small>PRODUCTS → ENGINEERING → SYSTEMS → SUPPORT</small>
          </div>
        </section>

        <section
          aria-label="Desh Solar capability pillars"
          className="aboutPillars"
        >
          <Link href="/products">
            <span>01</span>
            <b>Solar Products</b>
            <small>Panels, inverters, batteries and complete systems.</small>
          </Link>
          <Link href="/tools-and-technology">
            <span>02</span>
            <b>System Engineering</b>
            <small>Load, backup, roof and architecture planning.</small>
          </Link>
          <Link href="/projects">
            <span>03</span>
            <b>Installation &amp; Commissioning</b>
            <small>Project thinking from site study to handover.</small>
          </Link>
          <Link href="/customer-support">
            <span>04</span>
            <b>After-Sales Support</b>
            <small>Product, system and warranty assistance.</small>
          </Link>
        </section>

        <section className="aboutSection whoWeAre" id="who-we-are">
          <div className="whoVisual">
            <div className="whoVisualScene">
              <div className="whoSystemCard panel">
                <Image
                  alt="Solar panel"
                  src="/assets/products-real/jinko590.jpg"
                  width={500}
                  height={420}
                />
                <span>Generation</span>
              </div>
              <div className="whoSystemCard inverter">
                <Image
                  alt="Solar inverter"
                  src="/assets/products-real/goodwe6.jpg"
                  width={500}
                  height={420}
                />
                <span>Control</span>
              </div>
              <div className="whoSystemCard battery">
                <Image
                  alt="Lithium battery"
                  src="/assets/products-real/hithium16.webp"
                  width={500}
                  height={420}
                />
                <span>Storage</span>
              </div>
              <div className="whoEnergyLine" />
            </div>
          </div>

          <div className="whoCopy">
            <div className="demoEyebrow">Who We Are</div>
            <h2>More than a solar equipment seller.</h2>
            <p>
              Desh Solar’s public positioning covers solar products and complete
              solar-power solutions—from design and supply through installation
              and commissioning. The upgraded website reflects that full-system
              approach instead of treating every product as an isolated purchase.
            </p>
            <div className="whoFlow">
              <span>SELECT</span><i>→</i><span>DESIGN</span><i>→</i>
              <span>SUPPLY</span><i>→</i><span>INSTALL</span><i>→</i>
              <span>COMMISSION</span><i>→</i><span>SUPPORT</span>
            </div>
            <Link className="aboutInlineLink" href="/projects">
              See solar systems in real-world contexts →
            </Link>
          </div>
        </section>

        <section className="aboutSection aboutCapabilities" id="what-we-do">
          <div className="aboutSectionHead">
            <div>
              <div className="demoEyebrow">What We Do</div>
              <h2>One company. Six connected capabilities.</h2>
              <p>Choose a capability to see where it fits in the customer journey.</p>
            </div>
          </div>

          <div className="capabilityWorkspace">
            <div
              aria-label="Desh Solar capabilities"
              className="capabilityGrid"
              role="tablist"
            >
              {capabilityCards.map(([key, number, title, caption]) => (
                <button
                  key={key}
                  className={`capabilityCard${activeCapability === key ? " active" : ""}`}
                  onClick={() => setActiveCapability(key)}
                  role="tab"
                  aria-selected={activeCapability === key}
                  type="button"
                >
                  <span>{number}</span>
                  <b>{title}</b>
                  <small>{caption}</small>
                </button>
              ))}
            </div>

            <aside className="capabilityInspector" aria-live="polite">
              <small>{active.kicker}</small>
              <h3>{active.title}</h3>
              <p>{active.text}</p>
              <div className="capChecks">
                {active.checks.map(([label, value]) => (
                  <div key={`${activeCapability}-${label}`}>
                    <small>{label}</small>
                    <b>{value}</b>
                  </div>
                ))}
              </div>
              <Link href={active.href}>{active.label}</Link>
            </aside>
          </div>
        </section>

        <section className="aboutSection productToSystem">
          <div className="aboutSectionHead">
            <div>
              <div className="demoEyebrow">From Product to Energy System</div>
              <h2>We don&apos;t look at products in isolation.</h2>
              <p>
                Solar performance depends on how generation, conversion, storage,
                protection and site loads work together.
              </p>
            </div>
          </div>

          <div className="productSystemFlow">
            <Link className="systemFlowNode" href="/products">
              <span>▤</span><b>Solar Panel</b><small>Generation</small>
            </Link>
            <i>→</i>
            <Link className="systemFlowNode" href="/products">
              <span>↯</span><b>Inverter</b><small>Control</small>
            </Link>
            <i>↔</i>
            <Link className="systemFlowNode" href="/products">
              <span>▣</span><b>Battery</b><small>Storage</small>
            </Link>
            <i>→</i>
            <div className="systemFlowNode">
              <span>⛨</span><b>Protection</b><small>Safety layer</small>
            </div>
            <i>→</i>
            <Link className="systemFlowNode" href="/projects">
              <span>⌂</span><b>Installation</b><small>Site integration</small>
            </Link>
            <i>→</i>
            <Link className="systemFlowNode final" href="/build-your-system">
              <span>●</span><b>Energy System</b><small>Complete architecture</small>
            </Link>
          </div>

          <div className="systemPrinciples">
            <article><small>LOAD</small><b>What needs to run?</b><p>Running load and surge define the power requirement.</p></article>
            <article><small>BACKUP</small><b>For how long?</b><p>Load × time drives the storage requirement.</p></article>
            <article><small>PV</small><b>How much can the site generate?</b><p>Roof, shading and energy goals shape the solar array.</p></article>
            <article><small>COMPATIBILITY</small><b>Will the components work together?</b><p>Voltage, current, MPPT, BMS and phase need technical review.</p></article>
          </div>
        </section>

        <section className="aboutSection whoWeServe" id="who-we-serve">
          <div className="aboutSectionHead">
            <div>
              <div className="demoEyebrow">Who We Serve</div>
              <h2>Different sites need different energy strategies.</h2>
              <p>
                Move directly from the company story into the project type closest
                to your requirement.
              </p>
            </div>
          </div>

          <div className="serveGrid">
            <Link href="/projects"><span>⌂</span><small>Residential</small><b>Homes &amp; Backup</b><p>Rooftop solar, home loads and essential backup.</p></Link>
            <Link href="/projects"><span>▦</span><small>Commercial</small><b>Business Energy</b><p>Daytime consumption, cooling, IT and continuity.</p></Link>
            <Link href="/projects"><span>⚙</span><small>Industrial</small><b>Factories &amp; Industry</b><p>Three-phase loads, motors and project-scale systems.</p></Link>
            <Link href="/projects"><span>☀</span><small>Agriculture</small><b>Irrigation &amp; Farm Energy</b><p>Pump horsepower and daytime solar operation.</p></Link>
            <Link href="/projects"><span>⛽</span><small>Filling Stations</small><b>Operational Energy</b><p>Forecourt, office, security and critical backup.</p></Link>
            <Link href="/projects"><span>◇</span><small>Custom Projects</small><b>Off-Grid Energy</b><p>Storage autonomy and remote-site energy planning.</p></Link>
          </div>
        </section>

        <section className="aboutSection philosophySection">
          <div className="philosophyCopy">
            <div className="demoEyebrow">Our Engineering Philosophy</div>
            <h2>Start with the requirement. Then choose the technology.</h2>
            <p>
              A good solar decision begins with the site, loads, operating hours,
              backup target and energy goal—not with a product model.
            </p>
            <Link className="demoBtn" href="/tools-and-technology">
              Open Engineering Lab →
            </Link>
          </div>

          <div className="philosophyFlow">
            <div><span>01</span><b>UNDERSTAND</b><small>Property + energy need</small></div><i>→</i>
            <div><span>02</span><b>CALCULATE</b><small>Load + backup + PV</small></div><i>→</i>
            <div><span>03</span><b>ENGINEER</b><small>Architecture + protection</small></div><i>→</i>
            <div><span>04</span><b>SELECT</b><small>Suitable equipment</small></div><i>→</i>
            <div><span>05</span><b>INSTALL</b><small>Site execution</small></div><i>→</i>
            <div><span>06</span><b>SUPPORT</b><small>After-sales path</small></div>
          </div>
        </section>

        <section className="aboutSection ecosystemSection">
          <div className="aboutSectionHead centered">
            <div>
              <div className="demoEyebrow">Desh Solar Ecosystem</div>
              <h2>One connected customer experience.</h2>
              <p>
                The redesigned website reflects how products, engineering, projects
                and support connect around the customer.
              </p>
            </div>
          </div>

          <div className="ecosystem">
            <div className="ecoCore">
              <Image
                alt="Desh Solar"
                src="/assets/desh-solar-logo.png"
                width={360}
                height={120}
              />
              <b>DESH SOLAR</b>
              <small>Complete solar-energy journey</small>
            </div>
            <Link className="ecoNode n1" href="/products"><span>▤</span><b>Products</b><small>Equipment</small></Link>
            <Link className="ecoNode n2" href="/projects"><span>⌂</span><b>Projects</b><small>Applications</small></Link>
            <Link className="ecoNode n3" href="/tools-and-technology"><span>↯</span><b>Engineering</b><small>Tools + tech</small></Link>
            <Link className="ecoNode n4" href="/build-your-system"><span>◇</span><b>Planning</b><small>System builder</small></Link>
            <Link className="ecoNode n5" href="/customer-support"><span>?</span><b>Support</b><small>After-sales</small></Link>
            <Link className="ecoNode n6" href="/contact"><span>☎</span><b>Consultation</b><small>Customer contact</small></Link>
            <div className="ecoRing r1" />
            <div className="ecoRing r2" />
          </div>
        </section>

        <section className="aboutSection whySection">
          <div className="aboutSectionHead">
            <div>
              <div className="demoEyebrow">Why Desh Solar</div>
              <h2>Trust should come from capability—not invented counters.</h2>
              <p>
                The page deliberately avoids unverified claims such as installed
                megawatts, project counts or customer totals.
              </p>
            </div>
          </div>

          <div className="whyGrid">
            <article><span>01</span><b>Complete solution approach</b><p>Products, planning, installation, commissioning and support are presented as one connected journey.</p></article>
            <article><span>02</span><b>Engineering-led selection</b><p>Load, backup, phase, PV potential and compatibility are considered before final equipment decisions.</p></article>
            <article><span>03</span><b>Product authenticity focus</b><p>The published company FAQ positions products as genuine/authentic and backed by applicable manufacturer documentation.</p></article>
            <article><span>04</span><b>Nationwide customer reach</b><p>The published delivery information states service across Bangladesh.</p></article>
            <article><span>05</span><b>Technical guidance</b><p>The redesigned Engineering Lab and Build Your System tools support better early-stage decisions.</p></article>
            <article><span>06</span><b>After-sales pathway</b><p>Customer Support provides dedicated product, system, installation and warranty-assistance routes.</p></article>
          </div>
        </section>

        <section className="aboutSection brandTechSection">
          <div className="aboutSectionHead">
            <div>
              <div className="demoEyebrow">Technologies in the Catalogue</div>
              <h2>Real equipment families already represented in the store.</h2>
              <p>
                This section shows brands/product families carried in the catalogue.
                It does not claim partnership status unless separately verified.
              </p>
            </div>
          </div>

          <div className="brandTechGrid">
            <Link href="/products/jinko590">
              <Image alt="Jinko solar panel" src="/assets/products-real/jinko590.jpg" width={520} height={420}/>
              <span>Solar Panels</span><b>Jinko</b>
            </Link>
            <Link href="/products/goodwe6">
              <Image alt="GoodWe inverter" src="/assets/products-real/goodwe6.jpg" width={520} height={420}/>
              <span>Inverters</span><b>GoodWe</b>
            </Link>
            <Link href="/products/hithium16">
              <Image alt="HiTHIUM battery" src="/assets/products-real/hithium16.webp" width={520} height={420}/>
              <span>Lithium Storage</span><b>HiTHIUM</b>
            </Link>
            <Link href="/products/lvt-g3-314">
              <Image alt="LVTOPSUN battery" src="/assets/products-real/lvt-g3-314.jpg" width={520} height={420}/>
              <span>Battery Systems</span><b>LVTOPSUN</b>
            </Link>
          </div>
        </section>

        <section className="aboutSection customerJourney">
          <div className="aboutSectionHead">
            <div>
              <div className="demoEyebrow">How Customers Move Through Desh Solar</div>
              <h2>From discovery to ongoing support.</h2>
            </div>
          </div>

          <div className="journeyTrack">
            <Link href="/products"><span>01</span><b>DISCOVER</b><small>Products + projects</small></Link><i>→</i>
            <Link href="/build-your-system"><span>02</span><b>PLAN</b><small>Loads + backup + roof</small></Link><i>→</i>
            <Link href="/tools-and-technology"><span>03</span><b>VERIFY</b><small>Engineering checks</small></Link><i>→</i>
            <Link href="/products"><span>04</span><b>SELECT</b><small>Equipment path</small></Link><i>→</i>
            <Link href="/projects"><span>05</span><b>INSTALL</b><small>Project execution</small></Link><i>→</i>
            <Link href="/customer-support"><span>06</span><b>SUPPORT</b><small>After-sales</small></Link>
          </div>
        </section>

        <section className="aboutSection trustContactSection">
          <div className="trustCopy">
            <div className="demoEyebrow">Customer Access</div>
            <h2>Real support details, clearly visible.</h2>
            <p>
              Instead of decorative statistics, this section surfaces useful
              customer-facing information already used across the website.
            </p>
          </div>

          <div className="trustFacts">
            <div><small>Customer Service</small><b>10:00 AM – 11:00 PM</b><span>7 days a week</span></div>
            <div>
              <small>Phone</small>
              <b><a href="tel:0255168220">0255-168220</a></b>
              <span>Mobile: <a href="tel:01754477488">01754-477488</a></span>
            </div>
            <div>
              <small>Head Office</small>
              <b>28, Kazi Nazrul Islam Avenue</b>
              <span>Navana Zohura Square, Abasik Gate, Ground Floor, Bangla Motor, Dhaka-1205</span>
            </div>
            <div><small>Delivery</small><b>Across Bangladesh</b><span>Nationwide delivery information is published by Desh Solar</span></div>
          </div>

          <div className="trustActions">
            <Link className="demoBtn" href="/customer-support">Open Customer Support →</Link>
            <Link className="demoBtn secondary" href="/contact">Contact Desh Solar →</Link>
          </div>
        </section>

        <section className="aboutSection projectTeaser">
          <div className="aboutSectionHead">
            <div>
              <div className="demoEyebrow">Systems in Context</div>
              <h2>See how different project types change the solution.</h2>
            </div>
            <Link className="aboutInlineLink" href="/projects">Explore All Projects →</Link>
          </div>

          <div className="aboutProjectGrid">
            <Link href="/projects">
              <Image alt="Residential rooftop solar project showcase" src="/assets/projects-real/residential.webp" width={900} height={620}/>
              <div><small>RESIDENTIAL</small><b>Residential Rooftop Hybrid</b><span>View Project →</span></div>
            </Link>
            <Link href="/projects">
              <Image alt="Industrial rooftop solar project showcase" src="/assets/projects-real/industrial.webp" width={900} height={620}/>
              <div><small>INDUSTRIAL</small><b>Industrial Factory Rooftop Solar</b><span>View Project →</span></div>
            </Link>
            <Link href="/projects">
              <Image alt="Agriculture solar project showcase" src="/assets/projects-real/agriculture.webp" width={900} height={620}/>
              <div><small>AGRICULTURE</small><b>Solar Irrigation &amp; Farm Energy</b><span>View Project →</span></div>
            </Link>
          </div>
        </section>

        <section className="aboutSection engineeringTeaser">
          <div className="engineeringTeaserCopy">
            <div className="demoEyebrow">Engineering Lab</div>
            <h2>Understand the technology behind the system.</h2>
            <p>
              Use generation, battery, inverter, roof, load and compatibility tools
              before moving into full system planning.
            </p>
            <Link className="demoBtn" href="/engineering-lab">Open Engineering Lab →</Link>
          </div>
          <div className="engineeringMiniTools">
            <Link href="/engineering-lab#generation"><span>☀</span><b>Generation</b><small>PV energy estimate</small></Link>
            <Link href="/engineering-lab#battery"><span>▣</span><b>Battery</b><small>Runtime planning</small></Link>
            <Link href="/engineering-lab#inverter"><span>↯</span><b>Inverter</b><small>Load + surge sizing</small></Link>
            <Link href="/engineering-lab#energy-simulator"><span>◇</span><b>Energy Flow</b><small>Day / night simulator</small></Link>
          </div>
        </section>

        <div className="ctaBand aboutFinalCta">
          <div>
            <h3>From a solar product to a complete energy system.</h3>
            <p>
              Explore the catalogue, build a preliminary system or talk directly
              with Desh Solar.
            </p>
          </div>
          <div className="demoActions">
            <Link className="demoBtn" href="/products">Explore Products →</Link>
            <Link className="demoBtn secondary" href="/build-your-system">Build Your System →</Link>
            <Link className="demoBtn secondary" href="/contact">Contact Us →</Link>
          </div>
        </div>
      </main>

      <section className="futureBand demoReveal">
        <div className="countryMark">BD</div>
        <small>Desh Solar • Bangladesh</small>
        <h2>POWERING BANGLADESH FORWARD.</h2>
      </section>
    </div>
  );
}
