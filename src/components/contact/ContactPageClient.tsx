"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

type ContactRoute = "project" | "product" | "support" | "visit";
type PrepareKey = "residential" | "commercial" | "industrial" | "agriculture";

type LeadResponse = {
  success?: boolean;
  message?: string;
};

type RouteMeta = {
  number: string;
  title: string;
  caption: string;
  intro: string;
  summary: string;
  next: string;
};

const routeMeta: Record<ContactRoute, RouteMeta> = {
  project: {
    number: "01",
    title: "Plan a Solar System",
    caption: "Residential, commercial, industrial, agriculture or custom.",
    intro:
      "Share the property and energy requirement. We will use it as the starting point for a solar-system consultation.",
    summary: "Solar Project Consultation",
    next: "Add the core project details so the consultation can start with useful context.",
  },
  product: {
    number: "02",
    title: "Product Inquiry",
    caption: "Panel, inverter, battery, pump or complete system.",
    intro:
      "Tell us which product category or model you are considering and what you need to know about it.",
    summary: "Product Inquiry",
    next: "Add the product or model if known, then send the inquiry.",
  },
  support: {
    number: "03",
    title: "Existing System / Support",
    caption: "Warranty, technical, installation, order or delivery assistance.",
    intro:
      "Existing-customer issues should go through the guided Customer Support Center so the request reaches the correct support path.",
    summary: "Existing Customer Support",
    next: "Open Customer Support for product, system, installation, warranty or order assistance.",
  },
  visit: {
    number: "04",
    title: "Visit Desh Solar",
    caption: "Request a showroom or display-center consultation.",
    intro:
      "Choose a preferred date and consultation window. The visit remains a request until Desh Solar confirms it.",
    summary: "Showroom Consultation Request",
    next: "Add a preferred visit date and purpose, then send the request.",
  },
};

const prepareData: Record<PrepareKey, Array<[string, string]>> = {
  residential: [
    ["Monthly electricity bill", "Helps estimate the scale of daytime energy use."],
    ["Appliances / connected loads", "Fans, lights, AC, refrigerator, pump and electronics."],
    ["Backup target", "Which loads should remain on, and for how many hours?"],
    ["Usable roof area", "Approximate roof size, shading and available installation area."],
  ],
  commercial: [
    ["Daytime electricity profile", "Business hours and approximate monthly consumption."],
    ["Cooling + IT loads", "ACs, computers, servers, networking and office equipment."],
    ["Electrical phase", "Single-phase or three-phase supply if known."],
    ["Backup priorities", "Which business-critical loads need continuity?"],
  ],
  industrial: [
    ["Load / demand profile", "Production, machinery, HVAC, lighting and support loads."],
    ["Motor details", "Motor horsepower and startup behaviour matter."],
    ["Three-phase information", "Supply, distribution and major load groups."],
    ["Roof / site area", "Usable installation area and operating schedule."],
  ],
  agriculture: [
    ["Pump horsepower", "Motor or pump rating is the starting technical input."],
    ["Operating hours", "How many hours per day pumping is required."],
    ["Water requirement", "Daily or seasonal irrigation need if known."],
    ["Field conditions", "Array area, shading, cable route and equipment location."],
  ],
};

const projectTypes = [
  {
    name: "Residential",
    caption: "Home solar & backup",
    image: "/assets/projects-real/residential.webp",
  },
  {
    name: "Commercial",
    caption: "Business energy",
    image: "/assets/projects-real/commercial.webp",
  },
  {
    name: "Industrial",
    caption: "Factory & three-phase",
    image: "/assets/projects-real/industrial.webp",
  },
  {
    name: "Agriculture",
    caption: "Irrigation & farm energy",
    image: "/assets/projects-real/agriculture.webp",
  },
] as const;

function cleanText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export default function ContactPageClient() {
  const [route, setRoute] = useState<ContactRoute>("project");
  const [prepareKey, setPrepareKey] = useState<PrepareKey>("residential");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const [projectProperty, setProjectProperty] = useState("Residential");
  const [projectGoal, setProjectGoal] = useState("Solar + Backup");
  const [projectBill, setProjectBill] = useState("");
  const [projectBackup, setProjectBackup] = useState("");
  const [projectPhase, setProjectPhase] = useState("Not sure");
  const [projectConsultType, setProjectConsultType] = useState("Phone consultation");

  const [productCategory, setProductCategory] = useState("Solar Panel");
  const [productModel, setProductModel] = useState("");
  const [productQty, setProductQty] = useState("1");
  const [productInquiryType, setProductInquiryType] = useState("Price / availability");

  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("10:00 AM – 1:00 PM");
  const [visitPurpose, setVisitPurpose] = useState("Product consultation");

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const activeMeta = routeMeta[route];

  const detail = useMemo(() => {
    if (route === "project") {
      return `${projectProperty} • ${projectGoal}`;
    }

    if (route === "product") {
      return productModel
        ? `${productCategory} • ${productModel}`
        : productCategory;
    }

    if (route === "support") {
      return "Customer Support Center";
    }

    return visitDate
      ? `${visitPurpose} • ${visitDate}`
      : visitPurpose;
  }, [
    productCategory,
    productModel,
    projectGoal,
    projectProperty,
    route,
    visitDate,
    visitPurpose,
  ]);

  const selectRoute = (nextRoute: ContactRoute, scroll = true) => {
    setRoute(nextRoute);
    setStatus("idle");
    setStatusMessage("");

    if (scroll) {
      window.setTimeout(() => {
        document
          .getElementById("contact-consultation")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 30);
    }
  };

  const buildAdditionalNotes = () => {
    const parts = [`Contact route: ${activeMeta.title}`];

    if (route === "project") {
      parts.push(`Property: ${projectProperty}`);
      parts.push(`Primary goal: ${projectGoal}`);
      if (projectBill) parts.push(`Monthly electricity bill: BDT ${projectBill}`);
      if (projectBackup) parts.push(`Desired backup: ${projectBackup} hours`);
      parts.push(`Electrical phase: ${projectPhase}`);
      parts.push(`Preferred consultation: ${projectConsultType}`);
    }

    if (route === "product") {
      parts.push(`Product category: ${productCategory}`);
      if (productModel) parts.push(`Product / model: ${productModel}`);
      parts.push(`Quantity: ${productQty || "1"}`);
      parts.push(`Inquiry type: ${productInquiryType}`);
    }

    if (route === "visit") {
      if (visitDate) parts.push(`Preferred visit date: ${visitDate}`);
      parts.push(`Preferred time: ${visitTime}`);
      parts.push(`Visit purpose: ${visitPurpose}`);
    }

    if (cleanText(notes)) {
      parts.push(`Customer notes: ${cleanText(notes)}`);
    }

    return parts.join(" | ");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (route === "support") {
      return;
    }

    if (!cleanText(name) || !cleanText(phone) || !cleanText(location)) {
      setStatus("error");
      setStatusMessage("Please add your name, phone number and district / city.");
      return;
    }

    setStatus("submitting");
    setStatusMessage("Sending your request…");

    try {
      const response = await fetch("/api/customer-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanText(name),
          phone: cleanText(phone),
          email: cleanText(email),
          address: cleanText(location),
          fullAddress: cleanText(location),
          additionalNotes: buildAdditionalNotes(),
          website: "",
        }),
      });

      const result = (await response.json().catch(() => ({}))) as LeadResponse;

      if (!response.ok || !result.success) {
        throw new Error(result.message || "We could not send the request right now.");
      }

      setStatus("success");
      setStatusMessage(
        "Request sent successfully. Desh Solar can now follow up using the contact details you provided.",
      );
    } catch (error) {
      setStatus("error");
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "We could not send the request right now. Please try again or call Desh Solar.",
      );
    }
  };

  return (
    <div className="contactPage">
      <section className="contactHero" aria-labelledby="contact-page-title">
        <div className="contactHeroGlow contactHeroGlowOne" aria-hidden="true" />
        <div className="contactHeroGlow contactHeroGlowTwo" aria-hidden="true" />

        <div className="contactHeroCopy">
          <div className="contactEyebrow">Contact Desh Solar</div>
          <h1 id="contact-page-title">
            Tell us what you need. <span>We’ll route you to the right path.</span>
          </h1>
          <p>
            Product inquiry, complete solar project, existing-system support or
            showroom visit — start with the reason you are contacting Desh Solar.
          </p>

          <div className="contactHeroActions">
            <a className="contactButton contactButtonPrimary" href="#contact-routes">
              Choose Contact Route <span aria-hidden="true">→</span>
            </a>
            <a className="contactButton contactButtonSecondary" href="tel:01754477488">
              Call 01754-477488 <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        <div className="contactHeroPanel" aria-label="Desh Solar contact paths">
          <div className="contactHeroLogo">
            <Image
              src="/assets/desh-solar-logo.png"
              alt="Desh Solar"
              width={360}
              height={120}
              priority
            />
          </div>
          <div className="contactHeroPath">
            <span>PROJECTS</span>
            <i aria-hidden="true" />
            <span>PRODUCTS</span>
            <i aria-hidden="true" />
            <span>SUPPORT</span>
            <i aria-hidden="true" />
            <span>VISITS</span>
          </div>
          <small>ONE CONTACT HUB • FOUR CLEAR STARTING POINTS</small>
        </div>
      </section>

      <section className="contactRouteSection" id="contact-routes" aria-label="Choose a contact route">
        <div className="contactRouteGrid">
          {(Object.keys(routeMeta) as ContactRoute[]).map((key) => {
            const item = routeMeta[key];
            const active = key === route;

            return (
              <button
                key={key}
                type="button"
                className={`contactRouteCard${active ? " isActive" : ""}`}
                onClick={() => selectRoute(key)}
                aria-pressed={active}
              >
                <span>{item.number}</span>
                <b>{item.title}</b>
                <small>{item.caption}</small>
                <i aria-hidden="true">↗</i>
              </button>
            );
          })}
        </div>
      </section>

      <section className="contactConsultationSection" id="contact-consultation">
        <div className="contactFormCard">
          <div className="contactFormHead">
            <div>
              <div className="contactEyebrow">Contact & Consultation Request</div>
              <h2>{activeMeta.title}</h2>
              <p>{activeMeta.intro}</p>
            </div>
            <span className="contactSecureBadge">DESH SOLAR CONTACT</span>
          </div>

          {route === "support" ? (
            <div className="contactSupportRedirect">
              <span aria-hidden="true">?</span>
              <div>
                <small>EXISTING CUSTOMER / SYSTEM SUPPORT</small>
                <h3>Use the guided Customer Support Center.</h3>
                <p>
                  Warranty, installation, order or delivery, product support and
                  system issues already have a dedicated support workflow.
                </p>
                <Link className="contactButton contactButtonPrimary" href="/customer-support">
                  Open Customer Support <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="contactFormGrid">
                <label>
                  Full Name <em>*</em>
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                  />
                </label>
                <label>
                  Phone <em>*</em>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="01XXXXXXXXX"
                    autoComplete="tel"
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Optional"
                    autoComplete="email"
                  />
                </label>
                <label>
                  District / City <em>*</em>
                  <input
                    type="text"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="Dhaka, Chattogram, etc."
                    autoComplete="address-level2"
                  />
                </label>
              </div>

              {route === "project" && (
                <div className="contactDynamicBlock">
                  <div className="contactBlockTitle">
                    <span>PROJECT DETAILS</span>
                    <b>What are you planning?</b>
                  </div>
                  <div className="contactFormGrid">
                    <label>
                      Property Type
                      <select value={projectProperty} onChange={(event) => setProjectProperty(event.target.value)}>
                        <option>Residential</option>
                        <option>Commercial / Office</option>
                        <option>Factory / Industrial</option>
                        <option>Agriculture / Irrigation</option>
                        <option>Filling Station</option>
                        <option>Other / Off-Grid</option>
                      </select>
                    </label>
                    <label>
                      Primary Goal
                      <select value={projectGoal} onChange={(event) => setProjectGoal(event.target.value)}>
                        <option>Solar + Backup</option>
                        <option>Reduce Electricity Bill</option>
                        <option>Backup Only</option>
                        <option>Solar Pumping</option>
                        <option>Complete Solar System</option>
                        <option>Technical Consultation</option>
                      </select>
                    </label>
                    <label>
                      Approx. Monthly Electricity Bill (৳)
                      <input
                        type="number"
                        min="0"
                        value={projectBill}
                        onChange={(event) => setProjectBill(event.target.value)}
                        placeholder="Optional"
                      />
                    </label>
                    <label>
                      Desired Backup (hours)
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={projectBackup}
                        onChange={(event) => setProjectBackup(event.target.value)}
                        placeholder="Optional"
                      />
                    </label>
                    <label>
                      Electrical Phase
                      <select value={projectPhase} onChange={(event) => setProjectPhase(event.target.value)}>
                        <option>Not sure</option>
                        <option>Single phase</option>
                        <option>Three phase</option>
                      </select>
                    </label>
                    <label>
                      Preferred Consultation
                      <select
                        value={projectConsultType}
                        onChange={(event) => setProjectConsultType(event.target.value)}
                      >
                        <option>Phone consultation</option>
                        <option>Showroom consultation</option>
                        <option>Site discussion</option>
                      </select>
                    </label>
                  </div>
                  <div className="contactBuilderBridge">
                    <div>
                      <small>NOT SURE WHAT SYSTEM YOU NEED?</small>
                      <b>Build a preliminary load + backup + roof profile first.</b>
                    </div>
                    <Link href="/build-your-system">Open Build Your System →</Link>
                  </div>
                </div>
              )}

              {route === "product" && (
                <div className="contactDynamicBlock">
                  <div className="contactBlockTitle">
                    <span>PRODUCT INQUIRY</span>
                    <b>Which product are you asking about?</b>
                  </div>
                  <div className="contactFormGrid">
                    <label>
                      Product Category
                      <select
                        value={productCategory}
                        onChange={(event) => setProductCategory(event.target.value)}
                      >
                        <option>Solar Panel</option>
                        <option>Inverter</option>
                        <option>Lithium Battery</option>
                        <option>Complete Solar System</option>
                        <option>Solar Pump / Controller</option>
                        <option>Accessories / Other</option>
                      </select>
                    </label>
                    <label>
                      Product / Model
                      <input
                        type="text"
                        value={productModel}
                        onChange={(event) => setProductModel(event.target.value)}
                        placeholder="Model name if known"
                      />
                    </label>
                    <label>
                      Quantity
                      <input
                        type="number"
                        min="1"
                        value={productQty}
                        onChange={(event) => setProductQty(event.target.value)}
                      />
                    </label>
                    <label>
                      Inquiry Type
                      <select
                        value={productInquiryType}
                        onChange={(event) => setProductInquiryType(event.target.value)}
                      >
                        <option>Price / availability</option>
                        <option>Compatibility</option>
                        <option>Technical specification</option>
                        <option>Bulk / project quantity</option>
                      </select>
                    </label>
                  </div>
                  <Link className="contactInlineLink" href="/products">
                    Browse Products before sending an inquiry →
                  </Link>
                </div>
              )}

              {route === "visit" && (
                <div className="contactDynamicBlock">
                  <div className="contactBlockTitle">
                    <span>SHOWROOM VISIT</span>
                    <b>Request a consultation window.</b>
                  </div>
                  <div className="contactFormGrid contactVisitGrid">
                    <label>
                      Preferred Date
                      <input
                        type="date"
                        value={visitDate}
                        onChange={(event) => setVisitDate(event.target.value)}
                      />
                    </label>
                    <label>
                      Preferred Time Window
                      <select value={visitTime} onChange={(event) => setVisitTime(event.target.value)}>
                        <option>10:00 AM – 1:00 PM</option>
                        <option>1:00 PM – 4:00 PM</option>
                        <option>4:00 PM – 7:00 PM</option>
                        <option>7:00 PM – 10:00 PM</option>
                      </select>
                    </label>
                    <label>
                      Visit Purpose
                      <select
                        value={visitPurpose}
                        onChange={(event) => setVisitPurpose(event.target.value)}
                      >
                        <option>Product consultation</option>
                        <option>Complete system discussion</option>
                        <option>Technical consultation</option>
                        <option>Customer support</option>
                      </select>
                    </label>
                  </div>
                  <div className="contactVisitNote">
                    This is a consultation request only. It is not a confirmed appointment until Desh Solar confirms it.
                  </div>
                </div>
              )}

              <label className="contactNotesLabel">
                Project / Product / Visit Notes
                <textarea
                  rows={5}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Tell Desh Solar anything else that would help us understand the request."
                />
              </label>

              <div className="contactSubmitRow">
                <button
                  className="contactButton contactButtonPrimary contactSubmitButton"
                  type="submit"
                  disabled={status === "submitting"}
                >
                  {status === "submitting" ? "Sending…" : "Send Contact Request →"}
                </button>
                <span
                  className={`contactStatus${status === "success" ? " isSuccess" : ""}${
                    status === "error" ? " isError" : ""
                  }`}
                  role="status"
                >
                  {statusMessage}
                </span>
              </div>
            </form>
          )}
        </div>

        <aside className="contactSummaryCard">
          <div className="contactSummarySticky">
            <small>LIVE REQUEST SUMMARY</small>
            <h3>{activeMeta.summary}</h3>

            <div className="contactSummaryRows">
              <div>
                <span>Name</span>
                <b>{cleanText(name) || "Not provided"}</b>
              </div>
              <div>
                <span>Phone</span>
                <b>{cleanText(phone) || "Not provided"}</b>
              </div>
              <div>
                <span>Location</span>
                <b>{cleanText(location) || "Not provided"}</b>
              </div>
              <div>
                <span>Route</span>
                <b>{activeMeta.title}</b>
              </div>
              <div>
                <span>Project / Product</span>
                <b>{detail}</b>
              </div>
            </div>

            <div className="contactSummaryNext">
              <small>NEXT BEST STEP</small>
              <b>{activeMeta.next}</b>
            </div>

            {route === "support" ? (
              <Link href="/customer-support">Open Customer Support →</Link>
            ) : route === "product" ? (
              <Link href="/products">Browse Products first →</Link>
            ) : route === "visit" ? (
              <a href="#showroom">View Showroom Details →</a>
            ) : (
              <Link href="/build-your-system">Need more planning first? Build Your System →</Link>
            )}
          </div>
        </aside>
      </section>

      <section className="contactDirectSection">
        <div className="contactDirectCard contactPhoneCard">
          <div>
            <div className="contactEyebrow">Direct Contact</div>
            <h2>Need to speak with someone?</h2>
            <p>Call the Desh Solar customer contact line for direct assistance.</p>
          </div>
          <a href="tel:01754477488">01754-477488 <span aria-hidden="true">↗</span></a>
        </div>

        <div className="contactDirectCard">
          <div className="contactEyebrow">Right Department</div>
          <h3>Use the route that matches the request.</h3>
          <p>
            Sales, project planning, technical support and warranty needs do not all require the same information.
          </p>
          <a href="#contact-routes">Choose a contact route →</a>
        </div>
      </section>

      <section className="contactShowroomSection" id="showroom">
        <div className="contactShowroomMap">
          <iframe
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=Navana+Zohura+Square,+Ground+Floor,+Bangla+Motor,+Dhaka-1205,+Bangladesh&output=embed"
            title="Desh Solar showroom location"
          />
        </div>

        <div className="contactShowroomCopy">
          <div className="contactEyebrow">Visit Desh Solar</div>
          <h2>Showroom / Display Center</h2>
          <p>
            Visit for product consultation, product viewing, complete-system discussion or customer-support needs.
          </p>

          <div className="contactShowroomFacts">
            <div>
              <small>ADDRESS</small>
              <b>Navana Zohura Square, Ground Floor</b>
              <span>Bangla Motor, Dhaka-1205, Bangladesh</span>
            </div>
            <div>
              <small>PHONE</small>
              <b>01754-477488</b>
              <span>Customer contact line</span>
            </div>
          </div>

          <div className="contactShowroomActions">
            <button
              className="contactButton contactButtonPrimary"
              type="button"
              onClick={() => selectRoute("visit")}
            >
              Request Visit Consultation →
            </button>
            <a className="contactButton contactButtonSecondary" href="tel:01754477488">
              Call Desh Solar →
            </a>
          </div>
        </div>
      </section>

      <section className="contactPrepareSection">
        <div className="contactSectionHead">
          <div className="contactEyebrow">Prepare Before You Contact</div>
          <h2>A little preparation makes the consultation more useful.</h2>
          <p>
            You do not need perfect technical data. A few practical numbers help Desh Solar understand the requirement much faster.
          </p>
        </div>

        <div className="contactPrepareTabs" role="tablist" aria-label="Project preparation type">
          {(["residential", "commercial", "industrial", "agriculture"] as PrepareKey[]).map((key) => (
            <button
              key={key}
              type="button"
              className={prepareKey === key ? "isActive" : ""}
              onClick={() => setPrepareKey(key)}
              role="tab"
              aria-selected={prepareKey === key}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>

        <div className="contactPrepareGrid">
          {prepareData[prepareKey].map(([title, text], index) => (
            <article key={title}>
              <span>0{index + 1}</span>
              <div>
                <b>{title}</b>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="contactProjectTypes">
        <div className="contactSectionHead">
          <div className="contactEyebrow">Common Applications</div>
          <h2>See the type of project you are planning.</h2>
          <p>Choose a familiar application context before starting your inquiry.</p>
        </div>

        <div className="contactProjectGrid">
          {projectTypes.map((project) => (
            <Link key={project.name} href="/projects" className="contactProjectCard">
              <Image
                src={project.image}
                alt={`${project.name} solar application`}
                fill
                sizes="(max-width: 720px) 92vw, (max-width: 1100px) 46vw, 23vw"
              />
              <div className="contactProjectShade" />
              <div>
                <small>{project.caption}</small>
                <b>{project.name}</b>
                <span>Explore Projects →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="contactToolsBridge">
        <div className="contactToolsCopy">
          <div className="contactEyebrow">Prepare a Better Inquiry</div>
          <h2>Use the tools first if you want a stronger consultation.</h2>
          <p>
            A preliminary load profile, backup target or engineering check can make your contact request much more specific.
          </p>
        </div>

        <div className="contactToolCards">
          <Link href="/build-your-system">
            <span aria-hidden="true">⌁</span>
            <b>Build Your System</b>
            <small>Load + backup + preliminary system profile</small>
          </Link>
          <Link href="/engineering-lab">
            <span aria-hidden="true">⚙</span>
            <b>Engineering Lab</b>
            <small>Technical planning and system checks</small>
          </Link>
          <Link href="/products">
            <span aria-hidden="true">▦</span>
            <b>Product Catalogue</b>
            <small>Panels, inverters, batteries and systems</small>
          </Link>
          <Link href="/customer-support">
            <span aria-hidden="true">?</span>
            <b>Customer Support</b>
            <small>Existing product, system and warranty help</small>
          </Link>
        </div>
      </section>

      <section className="contactFinalCta">
        <div>
          <div className="contactEyebrow">Ready to Start?</div>
          <h2>Choose the path that matches what you need.</h2>
          <p>Start a project request, ask about a product, visit the showroom or move directly to customer support.</p>
        </div>
        <div className="contactFinalActions">
          <a className="contactButton contactButtonPrimary" href="#contact-routes">
            Contact Desh Solar →
          </a>
          <Link className="contactButton contactButtonSecondary" href="/customer-support">
            Customer Support →
          </Link>
        </div>
      </section>
    </div>
  );
}
