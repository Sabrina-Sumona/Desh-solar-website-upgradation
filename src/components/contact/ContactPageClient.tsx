"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

type ContactRoute = "project" | "product" | "support" | "visit";
type PrepareKey = "residential" | "commercial" | "industrial" | "agriculture";

type LeadResponse = {
  success?: boolean;
  message?: string;
};

type RouteMeta = {
  title: string;
  intro: string;
  summary: string;
  next: string;
  link: string;
  linkLabel: string;
};

const routeMeta: Record<ContactRoute, RouteMeta> = {
  project: {
    title: "Plan a Solar System",
    intro:
      "Share the basic property and energy requirement. You can provide more technical details later.",
    summary: "Solar Project Consultation",
    next: "Complete the project details and send the request.",
    link: "/build-your-system",
    linkLabel: "Need more planning first? Build Your System →",
  },
  product: {
    title: "Product Inquiry",
    intro: "Tell Desh Solar which product category or model you are considering.",
    summary: "Product Inquiry",
    next: "Add the product/model if known, then send the inquiry.",
    link: "/products",
    linkLabel: "Browse Products first →",
  },
  support: {
    title: "Existing System / Support",
    intro:
      "Existing-customer issues should use the guided Customer Support Center.",
    summary: "Existing Customer Support",
    next:
      "Use Customer Support for warranty, installation, product, order or system assistance.",
    link: "/customer-support",
    linkLabel: "Open Customer Support →",
  },
  visit: {
    title: "Visit Desh Solar",
    intro: "Request a preferred showroom consultation date and time window.",
    summary: "Showroom Consultation Request",
    next:
      "Choose a preferred visit window. This remains unconfirmed until Desh Solar responds.",
    link: "#showroom",
    linkLabel: "View Showroom Details →",
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
    ["Pump horsepower", "Motor/pump rating is the starting technical input."],
    ["Operating hours", "How many hours per day pumping is required."],
    ["Water requirement", "Daily/seasonal irrigation need if known."],
    ["Field conditions", "Array area, shading, cable route and equipment location."],
  ],
};


function cleanText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export default function ContactPageClient() {
  const router = useRouter();
  const [route, setRoute] = useState<ContactRoute>("project");
  const [prepareKey, setPrepareKey] = useState<PrepareKey>("residential");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);
  const [fileNames, setFileNames] = useState<string[]>([]);

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
  const [reference, setReference] = useState("");
  const [serviceOpen, setServiceOpen] = useState<boolean | null>(null);

  const activeMeta = routeMeta[route];

  useEffect(() => {
    const updateServiceStatus = () => {
      try {
        const parts = new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Dhaka",
          hour: "2-digit",
          minute: "2-digit",
          hourCycle: "h23",
        }).formatToParts(new Date());
        const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
        const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");
        const totalMinutes = hour * 60 + minute;
        setServiceOpen(totalMinutes >= 600 && totalMinutes < 1380);
      } catch {
        setServiceOpen(null);
      }
    };

    const initialTimer = window.setTimeout(updateServiceStatus, 0);
    const interval = window.setInterval(updateServiceStatus, 60_000);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
    };
  }, []);

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

    return visitDate ? `${visitPurpose} • ${visitDate}` : visitPurpose;
  }, [
    productCategory,
    productModel,
    projectGoal,
    projectProperty,
    route,
    visitDate,
    visitPurpose,
  ]);

  const selectRoute = (nextRoute: ContactRoute, scroll = false) => {
    setRoute(nextRoute);
    setStatus("idle");
    setStatusMessage("");
    setReference("");

    if (scroll) {
      window.setTimeout(() => {
        document
          .getElementById("consultation")
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

    if (fileNames.length) {
      parts.push(`Selected local files: ${fileNames.join(", ")} (not uploaded)`);
    }

    return parts.join(" | ");
  };

  const createReference = () => {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const code = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `DS-CONTACT-${yy}${mm}${dd}-${code}`;
  };

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    setFileNames(Array.from(event.target.files ?? []).map((file) => file.name));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (route === "support") {
      router.push("/customer-support");
      return;
    }

    if (!cleanText(name) || !cleanText(phone)) {
      setStatus("error");
      setStatusMessage("Please add your name and phone number.");
      return;
    }

    if (!consent) {
      setStatus("error");
      setStatusMessage("Please confirm that Desh Solar may use these details to follow up.");
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

      const nextReference = createReference();
      setReference(nextReference);
      setStatus("success");
      setStatusMessage("Your request has been sent successfully.");

      window.setTimeout(() => {
        document
          .getElementById("contactResultPanel")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 30);
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
    <>
      <div className="demoPage contactHubPage">
        <section className="contactCompactHero">
          <div>
            <div className="demoEyebrow">Contact Desh Solar</div>
            <h1>
              Tell us what you need. <span>We’ll route you to the right path.</span>
            </h1>
            <p>
              Product inquiry, complete solar project, existing-system support or showroom visit — start with the reason you’re contacting Desh Solar.
            </p>
          </div>
          <div className="contactHeroActions">
            <a className="demoBtn" href="#contact-routes">
              Choose Contact Route →
            </a>
            <a className="demoBtn secondary" href="tel:01754477488">
              Call 01754-477488 →
            </a>
          </div>
        </section>

        <section className="contactRouteSection" id="contact-routes">
          <div className="contactRouteGrid">
            <button
              className={`contactRouteCard ${route === "project" ? "active" : ""}`}
              type="button"
              onClick={() => selectRoute("project", true)}
            >
              <span>01</span>
              <b>Plan a Solar System</b>
              <small>Residential, commercial, industrial, agriculture or custom.</small>
            </button>
            <button
              className={`contactRouteCard ${route === "product" ? "active" : ""}`}
              type="button"
              onClick={() => selectRoute("product", true)}
            >
              <span>02</span>
              <b>Product Inquiry</b>
              <small>Ask about a panel, inverter, battery or complete system.</small>
            </button>
            <button
              className={`contactRouteCard ${route === "support" ? "active" : ""}`}
              type="button"
              onClick={() => selectRoute("support", true)}
            >
              <span>03</span>
              <b>Existing System / Support</b>
              <small>Warranty, technical, installation or order assistance.</small>
            </button>
            <button
              className={`contactRouteCard ${route === "visit" ? "active" : ""}`}
              type="button"
              onClick={() => selectRoute("visit", true)}
            >
              <span>04</span>
              <b>Visit Desh Solar</b>
              <small>Showroom / display-center consultation.</small>
            </button>
          </div>
        </section>

        <section className="contactConsultationSection" id="consultation">
          <div className="contactFormCard">
            <div className="contactFormHead">
              <div>
                <div className="demoEyebrow">Contact &amp; Consultation Request</div>
                <h2>{activeMeta.title}</h2>
                <p>{activeMeta.intro}</p>
              </div>
              <span className="contactDemoBadge">Website Request • Secure submission</span>
            </div>

            <form id="advancedContactForm" noValidate onSubmit={handleSubmit}>
              <div className="contactFormGrid">
                <label>
                  Full Name
                  <input
                    name="name"
                    placeholder="Your name"
                    required
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </label>
                <label>
                  Phone
                  <input
                    name="phone"
                    placeholder="01XXXXXXXXX"
                    required
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                  />
                </label>
                <label>
                  Email
                  <input
                    name="email"
                    placeholder="Optional"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </label>
                <label>
                  District / City
                  <input
                    name="location"
                    placeholder="Dhaka, Chattogram, etc."
                    type="text"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                  />
                </label>
              </div>

              <div className={`contactDynamicBlock ${route === "project" ? "active" : ""}`}>
                <div className="contactBlockTitle">
                  <span>PROJECT DETAILS</span>
                  <b>What are you planning?</b>
                </div>
                <div className="contactFormGrid">
                  <label>
                    Property Type
                    <select value={projectProperty} onChange={(event) => setProjectProperty(event.target.value)}>
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial / Office</option>
                      <option value="Industrial">Factory / Industrial</option>
                      <option value="Agriculture">Agriculture / Irrigation</option>
                      <option value="Filling Station">Filling Station</option>
                      <option value="Other">Other / Off-Grid</option>
                    </select>
                  </label>
                  <label>
                    Primary Goal
                    <select value={projectGoal} onChange={(event) => setProjectGoal(event.target.value)}>
                      <option value="Solar + Backup">Solar + Backup</option>
                      <option value="Reduce Electricity Bill">Reduce Electricity Bill</option>
                      <option value="Backup Only">Backup Only</option>
                      <option value="Solar Pumping">Solar Pumping</option>
                      <option value="Complete Solar System">Complete Solar System</option>
                      <option value="Technical Consultation">Technical Consultation</option>
                    </select>
                  </label>
                  <label>
                    Approx. Monthly Electricity Bill (৳)
                    <input min="0" placeholder="Optional" type="number" value={projectBill} onChange={(event) => setProjectBill(event.target.value)} />
                  </label>
                  <label>
                    Desired Backup (hours)
                    <input min="0" placeholder="Optional" step=".5" type="number" value={projectBackup} onChange={(event) => setProjectBackup(event.target.value)} />
                  </label>
                  <label>
                    Electrical Phase
                    <select value={projectPhase} onChange={(event) => setProjectPhase(event.target.value)}>
                      <option value="Not sure">Not sure</option>
                      <option value="Single phase">Single phase</option>
                      <option value="Three phase">Three phase</option>
                    </select>
                  </label>
                  <label>
                    Preferred Consultation
                    <select value={projectConsultType} onChange={(event) => setProjectConsultType(event.target.value)}>
                      <option value="Phone consultation">Phone consultation</option>
                      <option value="Showroom consultation">Showroom consultation</option>
                      <option value="Site discussion">Site discussion</option>
                    </select>
                  </label>
                </div>
                <div className="builderBridge">
                  <div>
                    <small>NOT SURE WHAT SYSTEM YOU NEED?</small>
                    <b>Build a preliminary load + backup + roof profile first.</b>
                  </div>
                  <Link href="/build-your-system">Open Build Your System →</Link>
                </div>
              </div>

              <div className={`contactDynamicBlock ${route === "product" ? "active" : ""}`}>
                <div className="contactBlockTitle">
                  <span>PRODUCT INQUIRY</span>
                  <b>Which product are you asking about?</b>
                </div>
                <div className="contactFormGrid">
                  <label>
                    Product Category
                    <select value={productCategory} onChange={(event) => setProductCategory(event.target.value)}>
                      <option value="Solar Panel">Solar Panel</option>
                      <option value="Inverter">Inverter</option>
                      <option value="Lithium Battery">Lithium Battery</option>
                      <option value="Complete Solar System">Complete Solar System</option>
                      <option value="Solar Pump / Controller">Solar Pump / Controller</option>
                      <option value="Accessories / Other">Accessories / Other</option>
                    </select>
                  </label>
                  <label>
                    Product / Model
                    <input placeholder="Model name if known" type="text" value={productModel} onChange={(event) => setProductModel(event.target.value)} />
                  </label>
                  <label>
                    Quantity
                    <input min="1" type="number" value={productQty} onChange={(event) => setProductQty(event.target.value)} />
                  </label>
                  <label>
                    Inquiry Type
                    <select value={productInquiryType} onChange={(event) => setProductInquiryType(event.target.value)}>
                      <option value="Price / availability">Price / availability</option>
                      <option value="Compatibility">Compatibility</option>
                      <option value="Technical specification">Technical specification</option>
                      <option value="Bulk / project quantity">Bulk / project quantity</option>
                    </select>
                  </label>
                </div>
                <Link className="contactInlineLink" href="/products">
                  Browse Products before sending an inquiry →
                </Link>
              </div>

              <div className={`contactDynamicBlock supportRedirectBlock ${route === "support" ? "active" : ""}`}>
                <div className="supportRouteMessage">
                  <span>?</span>
                  <div>
                    <small>EXISTING CUSTOMER / SYSTEM SUPPORT</small>
                    <h3>Use the guided Customer Support Center.</h3>
                    <p>
                      Warranty, installation, order/delivery, product support and system issues already have a dedicated support workflow.
                    </p>
                    <Link className="demoBtn" href="/customer-support">
                      Open Customer Support →
                    </Link>
                  </div>
                </div>
              </div>

              <div className={`contactDynamicBlock ${route === "visit" ? "active" : ""}`}>
                <div className="contactBlockTitle">
                  <span>SHOWROOM VISIT</span>
                  <b>Request a consultation window.</b>
                </div>
                <div className="contactFormGrid">
                  <label>
                    Preferred Date
                    <input type="date" value={visitDate} onChange={(event) => setVisitDate(event.target.value)} />
                  </label>
                  <label>
                    Preferred Time Window
                    <select value={visitTime} onChange={(event) => setVisitTime(event.target.value)}>
                      <option value="10:00 AM – 1:00 PM">10:00 AM – 1:00 PM</option>
                      <option value="1:00 PM – 4:00 PM">1:00 PM – 4:00 PM</option>
                      <option value="4:00 PM – 7:00 PM">4:00 PM – 7:00 PM</option>
                      <option value="7:00 PM – 10:00 PM">7:00 PM – 10:00 PM</option>
                    </select>
                  </label>
                  <label>
                    Visit Purpose
                    <select value={visitPurpose} onChange={(event) => setVisitPurpose(event.target.value)}>
                      <option value="Product consultation">Product consultation</option>
                      <option value="Complete system discussion">Complete system discussion</option>
                      <option value="Technical consultation">Technical consultation</option>
                      <option value="Customer support">Customer support</option>
                    </select>
                  </label>
                </div>
                <div className="visitNote">
                  This is a consultation request only. It is not a confirmed appointment until Desh Solar confirms it.
                </div>
              </div>

              <div className="contactUploadArea">
                <div>
                  <small>OPTIONAL PROJECT FILES / PHOTOS</small>
                  <b>Roof photo, electricity bill, existing equipment photo or project note.</b>
                  <span>Files stay on your device in this version and are not uploaded.</span>
                </div>
                <label className="contactUploadButton">
                  Choose Files
                  <input accept="image/*,.pdf" multiple type="file" onChange={handleFiles} />
                </label>
                <div className="contactFileNames">
                  {fileNames.length ? fileNames.join(", ") : "No files selected."}
                </div>
              </div>

              <label className="contactNotesLabel">
                Project / Product / Visit Notes
                <textarea
                  placeholder="Tell Desh Solar anything else that would help understand the request."
                  rows={5}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </label>

              <div className="contactConsentRow">
                <label>
                  <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
                  I agree that Desh Solar may use these details to respond to this request.
                </label>
              </div>

              <div className="contactSubmitRow">
                {route !== "support" && (
                  <button className="demoBtn" type="submit" disabled={status === "submitting"}>
                    {status === "submitting" ? "Sending Request…" : "Send Contact Request →"}
                  </button>
                )}
                <span className={status === "success" ? "success" : ""}>{statusMessage}</span>
              </div>
            </form>
          </div>

          <aside className="contactSummaryCard">
            <div className="contactSummarySticky">
              <small>LIVE REQUEST SUMMARY</small>
              <h3>{activeMeta.summary}</h3>
              <div className="summaryRows">
                <div><span>Name</span><b>{cleanText(name) || "Not provided"}</b></div>
                <div><span>Phone</span><b>{cleanText(phone) || "Not provided"}</b></div>
                <div><span>Location</span><b>{cleanText(location) || "Not provided"}</b></div>
                <div><span>Route</span><b>{activeMeta.title}</b></div>
                <div><span>Project / Product</span><b>{detail}</b></div>
                <div><span>Status</span><b>{status === "success" ? "Sent" : "Draft"}</b></div>
              </div>
              <div className="summaryNextStep">
                <small>NEXT BEST STEP</small>
                <b>{activeMeta.next}</b>
              </div>
              {activeMeta.link.startsWith("#") ? (
                <a href={activeMeta.link}>{activeMeta.linkLabel}</a>
              ) : (
                <Link href={activeMeta.link}>{activeMeta.linkLabel}</Link>
              )}
            </div>
          </aside>
        </section>

        {status === "success" && (
          <section className="contactResultPanel" id="contactResultPanel">
            <div>
              <div className="demoEyebrow">Request Sent</div>
              <h2>Your contact request has been sent successfully.</h2>
              <p>Desh Solar can follow up using the contact details you provided.</p>
            </div>
            <div className="contactResultRef">
              <small>REQUEST REFERENCE</small>
              <b>{reference}</b>
              <span>{activeMeta.title} • {detail}</span>
            </div>
          </section>
        )}

        <section className="directContactSection">
          <div className="directContactCard phoneCard">
            <div>
              <div className="demoEyebrow">Direct Contact</div>
              <h2>Need to speak with someone?</h2>
              <p>Call the published Desh Solar customer-support line during service hours.</p>
            </div>
            <div className="directPhone">
              <small>CUSTOMER SUPPORT</small>
              <a href="tel:01754477488">01754-477488</a>
              <span>10:00 AM – 11:00 PM • 7 days/week</span>
              <b className={serviceOpen === false ? "closed" : ""}>
                <i />
                <em>
                  {serviceOpen === true
                    ? "Open now • Dhaka time"
                    : serviceOpen === false
                      ? "Closed now • Opens at 10:00 AM Dhaka time"
                      : "10:00 AM – 11:00 PM • Dhaka time"}
                </em>
              </b>
            </div>
          </div>
          <div className="directContactCard routeCard">
            <small>NOT SURE WHO TO CONTACT?</small>
            <h3>Use the department router.</h3>
            <p>Sales, project planning, technical support and warranty needs should not all follow the same path.</p>
            <a href="#department-router">Choose Department →</a>
          </div>
        </section>

        <section className="showroomSection" id="showroom">
          <div className="showroomMap">
            <iframe
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps?q=Navana+Zohura+Square,+Ground+Floor,+Bangla+Motor,+Dhaka-1205,+Bangladesh&output=embed"
              title="Desh Solar showroom location"
            />
          </div>
          <div className="showroomCopy">
            <div className="demoEyebrow">Visit Desh Solar</div>
            <h2>Showroom / Display Center</h2>
            <p>Visit for product consultation, product viewing, complete-system discussion or customer-support needs.</p>
            <div className="showroomDetails">
              <div><small>ADDRESS</small><b>Navana Zohura Square, Ground Floor</b><span>Bangla Motor, Dhaka-1205, Bangladesh</span></div>
              <div><small>PHONE</small><b>01754-477488</b><span>Customer support line</span></div>
              <div><small>SERVICE HOURS</small><b>10:00 AM – 11:00 PM</b><span>7 days/week</span></div>
            </div>
            <div className="demoActions">
              <a className="demoBtn" href="tel:01754477488">Call Before Visiting →</a>
              <button className="demoBtn secondary" type="button" onClick={() => selectRoute("visit", true)}>
                Request Visit Consultation →
              </button>
            </div>
          </div>
        </section>

        <section className="departmentRouter" id="department-router">
          <div className="contactSectionHead">
            <div>
              <div className="demoEyebrow">Choose the Right Department</div>
              <h2>Get to the right workflow faster.</h2>
            </div>
          </div>
          <div className="departmentGrid">
            <Link href="/products"><span>01</span><b>Sales &amp; Products</b><small>Browse products, product details and cart.</small></Link>
            <button type="button" onClick={() => selectRoute("project", true)}><span>02</span><b>Solar Project Consultation</b><small>Residential, commercial, industrial or custom.</small></button>
            <Link href="/engineering-lab#engineering-tools"><span>03</span><b>Technical Planning</b><small>Generation, battery, inverter, roof and compatibility tools.</small></Link>
            <Link href="/customer-support"><span>04</span><b>Existing Customer Support</b><small>Product, system, installation, order or delivery.</small></Link>
            <Link href="/customer-support"><span>05</span><b>Warranty Assistance</b><small>Dedicated warranty-support workflow.</small></Link>
            <Link href="/customer-support"><span>06</span><b>Order &amp; Delivery</b><small>Delivery or order assistance.</small></Link>
          </div>
        </section>

        <section className="prepareSection">
          <div className="contactSectionHead">
            <div>
              <div className="demoEyebrow">Before You Contact Us</div>
              <h2>A little preparation makes the consultation more useful.</h2>
              <p>Select a project type to see the information that will help Desh Solar understand the requirement faster.</p>
            </div>
          </div>
          <div className="prepareTabs">
            {(["residential", "commercial", "industrial", "agriculture"] as PrepareKey[]).map((key) => (
              <button
                className={prepareKey === key ? "active" : ""}
                key={key}
                type="button"
                onClick={() => setPrepareKey(key)}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
          <div className="prepareContent">
            <div className="prepareChecklist">
              {prepareData[prepareKey].map(([title, body], index) => (
                <article key={title}>
                  <span>0{index + 1}</span>
                  <div><b>{title}</b><p>{body}</p></div>
                </article>
              ))}
            </div>
            <div className="prepareAction">
              <small>OPTIONAL</small>
              <h3>Prepare the technical numbers first.</h3>
              <p>Use the Engineering Lab or Build Your System to calculate a better preliminary profile before contacting Desh Solar.</p>
              <div className="demoActions">
                <Link className="demoBtn" href="/tools-and-technology">Engineering Lab →</Link>
                <Link className="demoBtn secondary" href="/build-your-system">Build Your System →</Link>
              </div>
            </div>
          </div>
        </section>


      </div>

      <section className="contactFutureBand">
        <div className="countryMark">BD</div>
        <small>Desh Solar • Bangladesh</small>
        <h2>POWERING BANGLADESH FORWARD.</h2>
      </section>
    </>
  );
}
