"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";

type SupportType =
  | "System Support"
  | "Product Support"
  | "Warranty Assistance"
  | "Installation & Maintenance"
  | "Order & Delivery"
  | "Product Selection";

type Urgency = "Normal" | "Important" | "Critical";
type ContextKey = "battery" | "inverter" | "solar" | "order" | "general";

type FormState = {
  product: string;
  brand: string;
  model: string;
  serial: string;
  purchaseDate: string;
  invoice: string;
  location: string;
  systemSize: string;
  errorCode: string;
  started: string;
  description: string;
};

const supportTypeCards: Array<{
  type: SupportType;
  icon: string;
  title: string;
  text: string;
}> = [
  {
    type: "System Support",
    icon: "↯",
    title: "Solar System Support",
    text: "Complete system, inverter, battery, PV input or backup behavior.",
  },
  {
    type: "Product Support",
    icon: "▣",
    title: "Product Support",
    text: "Individual inverter, battery, panel, portable power or other equipment.",
  },
  {
    type: "Warranty Assistance",
    icon: "✓",
    title: "Warranty Assistance",
    text: "Prepare product identity, purchase details and issue evidence for review.",
  },
  {
    type: "Installation & Maintenance",
    icon: "⚙",
    title: "Installation & Maintenance",
    text: "Installation concern, maintenance request or site-performance question.",
  },
  {
    type: "Order & Delivery",
    icon: "□",
    title: "Order & Delivery",
    text: "Order status, delivery, return/refund direction or receipt issue.",
  },
  {
    type: "Product Selection",
    icon: "◇",
    title: "Product Selection",
    text: "Help choosing a panel, inverter, battery or complete system.",
  },
];

const issueMap: Record<SupportType, Array<[string, string]>> = {
  "System Support": [
    ["System completely off", "Complete solar/backup system appears unavailable."],
    ["No AC output", "System has power but loads are not receiving AC output."],
    ["Battery not charging", "Battery state is not increasing as expected."],
    ["Solar input not detected", "PV input appears absent or unexpectedly low."],
    ["Low solar generation", "System is generating but performance seems lower than expected."],
    ["Monitoring / app problem", "System operates but monitoring or communication is unavailable."],
  ],
  "Product Support": [
    ["Product will not power on", "The individual product appears completely off."],
    ["Unexpected error / alarm", "A display or app shows an error, alarm or warning."],
    ["Charging problem", "Product or battery is not charging as expected."],
    ["Output problem", "Product is on but not providing expected output."],
    ["Connectivity / monitoring", "Wi-Fi, Bluetooth, app or monitoring is not working."],
    ["Other product issue", "The issue does not match the common categories."],
  ],
  "Warranty Assistance": [
    ["Product stopped working", "Product is no longer operating as expected."],
    ["Performance concern", "Product works but performance appears abnormal."],
    ["Physical / manufacturing concern", "Visible product issue may require review."],
    ["Warranty document question", "Need guidance about warranty information or documentation."],
    ["Other warranty review", "Prepare product and purchase information for review."],
  ],
  "Installation & Maintenance": [
    ["Installation concern", "Concern with system installation or site work."],
    ["Maintenance request", "Need inspection or maintenance guidance."],
    ["Cable / structure concern", "Visible cable-routing, mounting or structure concern."],
    ["Performance after installation", "System works but performance differs from expectation."],
    ["Site change / expansion", "Want to modify or expand an installed system."],
  ],
  "Order & Delivery": [
    ["Order status", "Want an update about an order."],
    ["Delivery delay", "Delivery has not arrived within expected timeframe."],
    ["Received wrong / damaged item", "Delivered item appears incorrect or damaged."],
    ["Return / refund guidance", "Need current return/refund direction."],
    ["Invoice / order document", "Need help with purchase documentation."],
  ],
  "Product Selection": [
    ["Choose solar panel", "Need help selecting a panel."],
    ["Choose inverter", "Need help selecting an inverter."],
    ["Choose battery", "Need help selecting storage."],
    ["Choose complete system", "Want a complete-system recommendation."],
    ["Check compatibility", "Want to understand whether products should be evaluated together."],
  ],
};

const checks: Record<ContextKey, Array<[string, string]>> = {
  battery: [
    ["Record battery/BMS display status", "Note status text/code without opening the enclosure."],
    ["Confirm whether normal battery indicators are powered", "Observation only."],
    ["Record inverter battery status", "If visible in the normal display/app."],
    ["Take a clear product-label photo", "Model and serial help identify the product."],
  ],
  inverter: [
    ["Record exact inverter error/status code", "Use the normal display/app only."],
    ["Note whether the display is powered", "Helps separate monitoring/output from shutdown issues."],
    ["Record PV, battery and AC status shown normally", "Observation only."],
    ["Take a photo of the inverter label", "Useful for model/serial identification."],
  ],
  solar: [
    ["Note approximate time and weather", "Solar output naturally changes with irradiance."],
    ["Record PV power shown by the normal interface", "Do not access PV wiring."],
    ["Observe visible shading from a safe location", "Trees/buildings can affect generation."],
    ["Take a monitoring screenshot", "Time-stamped performance context can help."],
  ],
  order: [
    ["Prepare order/invoice number", "Helps locate the transaction."],
    ["Confirm delivery phone and district", "Useful for delivery questions."],
    ["Photograph packaging if visibly damaged", "Preserve evidence before unpacking."],
    ["Keep original packaging/documents", "Can matter for return/warranty review."],
  ],
  general: [
    ["Record the exact symptom", "What changed and when?"],
    ["Record any error/status code", "Exact codes are useful."],
    ["Prepare model and serial if available", "Helps identify the correct path."],
    ["Take a clear display/product-label photo", "Do not open equipment."],
  ],
};

const faqs: Record<ContextKey, Array<[string, string, string]>> = {
  battery: [
    ["Battery Support", "Why is model/BMS information useful?", "Battery support depends on chemistry, BMS limits, inverter compatibility and configuration."],
    ["Warranty", "What should I prepare for warranty review?", "Model, serial, purchase information and clear evidence are useful."],
    ["Safety", "Should I open the battery enclosure?", "No. Do not open energized or sealed battery/inverter equipment."],
  ],
  inverter: [
    ["Inverter Support", "Why record the exact error code?", "An exact code can help identify the relevant fault category faster."],
    ["Monitoring", "What if only Wi-Fi/app is not working?", "Record whether the inverter itself is operating normally and whether the problem is limited to monitoring."],
    ["Safety", "Should I open the inverter?", "No. Use normal user controls and qualified technical support."],
  ],
  solar: [
    ["Generation", "Why can generation change?", "Time of day, cloud cover, shading, temperature and site conditions can change output."],
    ["Monitoring", "What helps with low-generation support?", "A screenshot showing date/time, PV power and production can help."],
    ["Site", "Can new shading matter?", "Yes. Trees, buildings and other obstructions can reduce irradiance."],
  ],
  order: [
    ["Delivery", "How long does standard delivery take?", "Desh Solar’s published FAQ states 2–5 business days, depending on location and order conditions."],
    ["Nationwide Delivery", "Do you deliver outside Dhaka?", "The published FAQ states delivery is available nationwide."],
    ["Return", "What is the published return window?", "The current FAQ states unused products in original packaging can be returned within 7 days, subject to conditions."],
  ],
  general: [
    ["Customer Service", "When is support available?", "Published customer-service hours are 10:00 AM–11:00 PM, seven days a week."],
    ["Warranty", "Do products include warranty?", "The published FAQ states manufacturer warranty varies by brand/product."],
    ["Authenticity", "Are products genuine?", "Desh Solar states products are sourced through authorized distributors/manufacturers."],
  ],
};

const productOptions = [
  "Complete Solar System",
  "Hybrid Inverter",
  "Lithium Battery",
  "Solar Panel",
  "Portable Power Station",
  "IPS / UPS",
  "Charge Controller",
  "Other",
];

const brandOptions = [
  "Not sure / Complete System",
  "GoodWe",
  "Jinko",
  "LONGI",
  "HiTHIUM",
  "LVTOPSUN",
  "SAKO",
  "Other",
];

const navSteps = [
  ["Issue", "What is happening?"],
  ["Product", "Identify equipment"],
  ["Details", "Error + urgency"],
  ["Quick Checks", "Safe observations"],
  ["Evidence", "Photo / file context"],
  ["Review", "Support summary"],
] as const;

const initialForm: FormState = {
  product: "Complete Solar System",
  brand: "Not sure / Complete System",
  model: "",
  serial: "",
  purchaseDate: "",
  invoice: "",
  location: "",
  systemSize: "",
  errorCode: "",
  started: "",
  description: "",
};

export default function CustomerSupportClient() {
  const wizardRef = useRef<HTMLElement | null>(null);
  const [step, setStep] = useState(0);
  const [supportType, setSupportType] = useState<SupportType>("System Support");
  const [issue, setIssue] = useState("");
  const [urgency, setUrgency] = useState<Urgency>("Normal");
  const [form, setForm] = useState<FormState>(initialForm);
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [evidence, setEvidence] = useState<Record<string, string>>({});
  const [ticketRef, setTicketRef] = useState("");

  const contextKey = useMemo<ContextKey>(() => {
    const issueText = issue.toLowerCase();
    const productText = form.product.toLowerCase();
    if (issueText.includes("battery") || productText.includes("battery")) return "battery";
    if (issueText.includes("inverter") || productText.includes("inverter")) return "inverter";
    if (
      issueText.includes("solar") ||
      issueText.includes("generation") ||
      productText.includes("solar panel")
    ) {
      return "solar";
    }
    if (supportType === "Order & Delivery") return "order";
    return "general";
  }, [form.product, issue, supportType]);

  const activeChecks = checks[contextKey];
  const activeFaqs = faqs[contextKey];
  const evidenceCount = Object.keys(evidence).length;
  const progress = ((step + 1) / 6) * 100;

  const nextAction = useMemo(() => {
    if (!issue) return "Choose the problem so we can prepare the right context.";
    if (supportType === "Warranty Assistance") {
      return "Prepare serial number, purchase information and clear evidence.";
    }
    if (supportType === "Order & Delivery") {
      return "Prepare order/invoice details and delivery information.";
    }
    if (urgency === "Critical") {
      return "Contact Desh Solar promptly; if there is an electrical hazard, prioritize safety and qualified assistance.";
    }
    return "Complete product details, safe quick checks and evidence before contacting support.";
  }, [issue, supportType, urgency]);

  const updateField = (key: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (key === "product") setCheckedItems([]);
  };

  const chooseSupportType = (type: SupportType) => {
    setSupportType(type);
    setIssue("");
    setCheckedItems([]);
    setTicketRef("");
    window.setTimeout(() => {
      wizardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const chooseIssue = (value: string) => {
    setIssue(value);
    setCheckedItems([]);
    setTicketRef("");
  };

  const goToStep = (value: number) => {
    setStep(Math.max(0, Math.min(5, value)));
  };

  const continueStep = () => {
    if (step === 0 && !issue) return;
    goToStep(step + 1);
  };

  const toggleCheck = (index: number) => {
    setCheckedItems((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index],
    );
  };

  const handleEvidence = (
    key: "Product label" | "Error / display" | "Site / installation",
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    setEvidence((current) => {
      const next = { ...current };
      if (file) next[key] = file.name;
      else delete next[key];
      return next;
    });
  };

  const createDemoTicket = () => {
    setTicketRef(`DS-SUP-DEMO-${String(Date.now()).slice(-6)}`);
  };

  const modelDisplay = form.model.trim() || "—";
  const errorDisplay = form.errorCode.trim() || "—";
  const descriptionDisplay = form.description.trim() || "No description yet.";

  return (
    <div className="customerSupportPrototype">
      <div className="supportCenterPage">
        <section className="supportHero">
          <div>
            <div className="supportEyebrow">Desh Solar Customer Care</div>
            <h1>
              How can we <em>help?</em>
            </h1>
            <p>
              Product support, solar-system troubleshooting, warranty guidance,
              installation help and order assistance—all routed through one structured
              support experience.
            </p>
            <div className="supportHeroActions">
              <a className="supportPrimary" href="#support-types">
                Start Support Request →
              </a>
              <a className="supportSecondary" href="tel:01754477488">
                Call 01754-477488
              </a>
            </div>
            <div className="supportHours">
              <div className="supportHourCard">
                <small>Customer Service</small>
                <b>01754-477488</b>
              </div>
              <div className="supportHourCard">
                <small>Published Hours</small>
                <b>10:00 AM – 11:00 PM</b>
              </div>
              <div className="supportHourCard">
                <small>Availability</small>
                <b>7 days a week</b>
              </div>
            </div>
          </div>

          <div className="supportHeroVisual">
            <div className="supportFlow">
              <div className="supportFlowNode">
                <i>!</i>
                <b>Issue</b>
                <small>What happened?</small>
              </div>
              <span className="supportFlowArrow">→</span>
              <div className="supportFlowNode">
                <i>⌕</i>
                <b>Identify</b>
                <small>Product</small>
              </div>
              <span className="supportFlowArrow">→</span>
              <div className="supportFlowNode">
                <i>✓</i>
                <b>Check</b>
                <small>Safe basics</small>
              </div>
              <span className="supportFlowArrow">→</span>
              <div className="supportFlowNode">
                <i>▣</i>
                <b>Evidence</b>
                <small>Photo/code</small>
              </div>
              <span className="supportFlowArrow">→</span>
              <div className="supportFlowNode">
                <i>⚙</i>
                <b>Support</b>
                <small>Review path</small>
              </div>
            </div>
            <div className="supportHeroStatus">
              <span>Guided support flow</span>
              <b>Faster context • Better support</b>
            </div>
          </div>
        </section>

        <section className="supportTypesSection" id="support-types">
          <div className="supportSectionHead">
            <div className="supportEyebrow">Choose Support Type</div>
            <h2>Start with what you actually need.</h2>
            <p>
              Technical issues, warranty requests, installation questions and delivery
              problems need different information. Choose the closest path and the support
              flow adapts automatically.
            </p>
          </div>
          <div className="supportTypeGrid">
            {supportTypeCards.map((card) => (
              <button
                className={`supportTypeCard ${supportType === card.type ? "selected" : ""}`}
                key={card.type}
                onClick={() => chooseSupportType(card.type)}
                type="button"
              >
                <span className="supportTypeIcon">{card.icon}</span>
                <b>{card.title}</b>
                <small>{card.text}</small>
              </button>
            ))}
          </div>
        </section>

        <div className="supportMobileProgress">
          <div className="supportMobileProgressTop">
            <span>Customer Care</span>
            <b>Step {step + 1} of 6</b>
          </div>
          <div className="supportMobileBar">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>

        <section className="supportWizardShell" ref={wizardRef}>
          <aside className="supportStepNav">
            <div className="supportNavHead">
              <small>Guided Support</small>
              <b>6-step support flow</b>
            </div>
            {navSteps.map(([title, text], index) => (
              <button
                className={`supportNavBtn ${step === index ? "active" : ""} ${
                  index < step ? "complete" : ""
                }`}
                key={title}
                onClick={() => goToStep(index)}
                type="button"
              >
                <span className="supportNavNum">{String(index + 1).padStart(2, "0")}</span>
                <span>
                  <b>{title}</b>
                  <small>{text}</small>
                </span>
              </button>
            ))}
          </aside>

          <div className="supportWizard">
            <div className="supportProgress">
              <span style={{ width: `${progress}%` }} />
            </div>

            <section className={`supportStep ${step === 0 ? "active" : ""}`}>
              <div className="supportStepHead">
                <small>Step 01 • Issue</small>
                <h2>What is happening?</h2>
                <p>The options change automatically based on the support type selected above.</p>
              </div>
              <div className="issueGrid">
                {issueMap[supportType].map(([title, text]) => (
                  <button
                    className={`issueCard ${issue === title ? "selected" : ""}`}
                    key={title}
                    onClick={() => chooseIssue(title)}
                    type="button"
                  >
                    <b>{title}</b>
                    <small>{text}</small>
                  </button>
                ))}
              </div>
            </section>

            <section className={`supportStep ${step === 1 ? "active" : ""}`}>
              <div className="supportStepHead">
                <small>Step 02 • Product / System</small>
                <h2>Identify the equipment.</h2>
                <p>
                  Model and serial information can reduce repeated questions for technical and
                  warranty support.
                </p>
              </div>
              <div className="supportFormGrid">
                <div className="supportField">
                  <label htmlFor="supportProductType">Product Type</label>
                  <select
                    className="supportSelect"
                    id="supportProductType"
                    onChange={(event) => updateField("product", event.target.value)}
                    value={form.product}
                  >
                    {productOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div className="supportField">
                  <label htmlFor="supportBrand">Brand</label>
                  <select
                    className="supportSelect"
                    id="supportBrand"
                    onChange={(event) => updateField("brand", event.target.value)}
                    value={form.brand}
                  >
                    {brandOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div className="supportField">
                  <label htmlFor="supportModel">Model</label>
                  <input
                    className="supportInput"
                    id="supportModel"
                    onChange={(event) => updateField("model", event.target.value)}
                    placeholder="Example: GW6K-EO-G20"
                    value={form.model}
                  />
                </div>
                <div className="supportField">
                  <label htmlFor="supportSerial">Serial Number</label>
                  <input
                    className="supportInput"
                    id="supportSerial"
                    onChange={(event) => updateField("serial", event.target.value)}
                    placeholder="If available"
                    value={form.serial}
                  />
                </div>
                {supportType === "Warranty Assistance" && (
                  <>
                    <div className="supportField warrantyOnly">
                      <label htmlFor="supportPurchaseDate">Purchase Date</label>
                      <input
                        className="supportInput"
                        id="supportPurchaseDate"
                        onChange={(event) => updateField("purchaseDate", event.target.value)}
                        type="date"
                        value={form.purchaseDate}
                      />
                    </div>
                    <div className="supportField warrantyOnly">
                      <label htmlFor="supportInvoice">Invoice / Order Number</label>
                      <input
                        className="supportInput"
                        id="supportInvoice"
                        onChange={(event) => updateField("invoice", event.target.value)}
                        placeholder="If available"
                        value={form.invoice}
                      />
                    </div>
                  </>
                )}
                {supportType === "Installation & Maintenance" && (
                  <>
                    <div className="supportField installationOnly">
                      <label htmlFor="supportLocation">Installation Location</label>
                      <input
                        className="supportInput"
                        id="supportLocation"
                        onChange={(event) => updateField("location", event.target.value)}
                        placeholder="City / district / site"
                        value={form.location}
                      />
                    </div>
                    <div className="supportField installationOnly">
                      <label htmlFor="supportSystemSize">System Size</label>
                      <input
                        className="supportInput"
                        id="supportSystemSize"
                        onChange={(event) => updateField("systemSize", event.target.value)}
                        placeholder="Example: 8 kW"
                        value={form.systemSize}
                      />
                    </div>
                  </>
                )}
              </div>
            </section>

            <section className={`supportStep ${step === 2 ? "active" : ""}`}>
              <div className="supportStepHead">
                <small>Step 03 • Details</small>
                <h2>Describe the problem clearly.</h2>
                <p>
                  Exact error/status codes and when the issue started are often more useful than
                  a long general explanation.
                </p>
              </div>
              <div className="supportFormGrid">
                <div className="supportField">
                  <label htmlFor="supportErrorCode">Error / Status Code</label>
                  <input
                    className="supportInput"
                    id="supportErrorCode"
                    onChange={(event) => updateField("errorCode", event.target.value)}
                    placeholder="If shown"
                    value={form.errorCode}
                  />
                </div>
                <div className="supportField">
                  <label htmlFor="supportStarted">When did it start?</label>
                  <input
                    className="supportInput"
                    id="supportStarted"
                    onChange={(event) => updateField("started", event.target.value)}
                    placeholder="Today / yesterday / date"
                    value={form.started}
                  />
                </div>
                <div className="supportField full">
                  <label htmlFor="supportDescription">What exactly is happening?</label>
                  <textarea
                    className="supportTextarea"
                    id="supportDescription"
                    onChange={(event) => updateField("description", event.target.value)}
                    placeholder="Describe what you see, hear, or cannot do."
                    value={form.description}
                  />
                </div>
              </div>
              <div className="urgencyGrid">
                {(["Normal", "Important", "Critical"] as Urgency[]).map((value) => (
                  <button
                    className={`urgencyBtn ${urgency === value ? "selected" : ""}`}
                    data-urgency={value}
                    key={value}
                    onClick={() => setUrgency(value)}
                    type="button"
                  >
                    <b>{value}</b>
                    <small>
                      {value === "Normal" && "System is usable but something is wrong."}
                      {value === "Important" && "Part of the system is unavailable."}
                      {value === "Critical" && "Complete shutdown or essential power unavailable."}
                    </small>
                  </button>
                ))}
              </div>
              <div className="safetyAlert">
                <b>Electrical safety:</b> If there is smoke, burning smell, unusual heat,
                exposed conductors, arcing, fire, flooding around electrical equipment, or
                another immediate hazard, do not continue routine troubleshooting. Keep people
                away and contact qualified technical/emergency support as appropriate. Do not
                open inverter, battery, or energized electrical enclosures.
              </div>
            </section>

            <section className={`supportStep ${step === 3 ? "active" : ""}`}>
              <div className="supportStepHead">
                <small>Step 04 • Quick Checks</small>
                <h2>Prepare safe troubleshooting context.</h2>
                <p>Observation-only checks. No opening equipment or working on energized wiring.</p>
              </div>
              <div className="quickCheckList">
                {activeChecks.map(([title, text], index) => (
                  <label className="quickCheck" key={title}>
                    <input
                      checked={checkedItems.includes(index)}
                      onChange={() => toggleCheck(index)}
                      type="checkbox"
                    />
                    <span>
                      <b>{title}</b>
                      <small>{text}</small>
                    </span>
                  </label>
                ))}
              </div>
            </section>

            <section className={`supportStep ${step === 4 ? "active" : ""}`}>
              <div className="supportStepHead">
                <small>Step 05 • Evidence</small>
                <h2>Add useful visual context.</h2>
                <p>This demo keeps selected files in your browser only; nothing is uploaded.</p>
              </div>
              <div className="evidenceGrid">
                <label className={`evidenceBox ${evidence["Product label"] ? "hasFile" : ""}`}>
                  <input
                    accept="image/*"
                    onChange={(event) => handleEvidence("Product label", event)}
                    type="file"
                  />
                  <i>▣</i>
                  <b>Product Label</b>
                  <small>Model / serial photo</small>
                </label>
                <label className={`evidenceBox ${evidence["Error / display"] ? "hasFile" : ""}`}>
                  <input
                    accept="image/*"
                    onChange={(event) => handleEvidence("Error / display", event)}
                    type="file"
                  />
                  <i>!</i>
                  <b>Error / Display</b>
                  <small>Screen or status photo</small>
                </label>
                <label className={`evidenceBox ${evidence["Site / installation"] ? "hasFile" : ""}`}>
                  <input
                    accept="image/*,video/*"
                    onChange={(event) => handleEvidence("Site / installation", event)}
                    type="file"
                  />
                  <i>⌂</i>
                  <b>Site / Installation</b>
                  <small>Photo or short video</small>
                </label>
              </div>
              <div className="evidenceList">
                {evidenceCount ? (
                  Object.entries(evidence).map(([label, name]) => (
                    <div className="evidenceItem" key={label}>
                      {label}: {name}
                    </div>
                  ))
                ) : (
                  <div className="evidenceItem">No files selected yet.</div>
                )}
              </div>
            </section>

            <section className={`supportStep ${step === 5 ? "active" : ""}`}>
              <div className="supportStepHead">
                <small>Step 06 • Review</small>
                <h2>Review the support case.</h2>
                <p>
                  This is the structured summary a production support system could submit to
                  Desh Solar.
                </p>
              </div>
              <div className="reviewGrid">
                <div className="reviewCard"><small>Support Type</small><b>{supportType}</b></div>
                <div className="reviewCard"><small>Issue</small><b>{issue || "Not selected"}</b></div>
                <div className="reviewCard"><small>Product</small><b>{form.product}</b></div>
                <div className="reviewCard"><small>Brand / Model</small><b>{form.brand} • {modelDisplay}</b></div>
                <div className="reviewCard"><small>Error Code</small><b>{errorDisplay}</b></div>
                <div className="reviewCard"><small>Urgency</small><b>{urgency}</b></div>
                <div className="reviewCard"><small>Evidence</small><b>{evidenceCount} file{evidenceCount === 1 ? "" : "s"}</b></div>
                <div className="reviewCard"><small>Quick Checks</small><b>{checkedItems.length} completed</b></div>
              </div>
              <div className="reviewDescription">
                <small>Description</small>
                <p>{descriptionDisplay}</p>
              </div>
              <button className="submitDemoBtn" onClick={createDemoTicket} type="button">
                Create Demo Support Request →
              </button>
              <div className={`ticketCreated ${ticketRef ? "show" : ""}`}>
                <small>Demo support request created</small>
                <h3>{ticketRef || "DS-SUP-DEMO-0001"}</h3>
                <p>Front-end simulation only. No ticket has been transmitted to Desh Solar.</p>
                <div className="ticketTimeline">
                  <div className="ticketStage active">Received</div>
                  <div className="ticketStage">Under Review</div>
                  <div className="ticketStage">Technician Assigned</div>
                  <div className="ticketStage">Resolved</div>
                </div>
              </div>
            </section>

            <div className="supportWizardFooter">
              <button disabled={step === 0} onClick={() => goToStep(step - 1)} type="button">
                ← Back
              </button>
              <span className="supportStepCount">Step {step + 1} of 6</span>
              {step < 5 && (
                <button className="primary" onClick={continueStep} type="button">
                  Continue →
                </button>
              )}
            </div>
          </div>

          <aside className="supportLiveSummary">
            <div className="summaryHead">
              <small>Live Support Summary</small>
              <h3>{supportType}</h3>
            </div>
            <div className="summaryStatus">
              <small>Current issue</small>
              <b>{issue || "Choose an issue"}</b>
            </div>
            <div className="summaryMetrics">
              <div className="summaryMetric"><span>Product</span><b>{form.product}</b></div>
              <div className="summaryMetric"><span>Brand</span><b>{form.brand}</b></div>
              <div className="summaryMetric"><span>Model</span><b>{modelDisplay}</b></div>
              <div className="summaryMetric"><span>Error</span><b>{errorDisplay}</b></div>
              <div className="summaryMetric"><span>Urgency</span><b>{urgency}</b></div>
              <div className="summaryMetric"><span>Evidence</span><b>{evidenceCount} file{evidenceCount === 1 ? "" : "s"}</b></div>
            </div>
            <div className="summaryHelp">
              <small>Best next action</small>
              <b>{nextAction}</b>
            </div>
          </aside>
        </section>

        <section className="supportFaq">
          <div className="supportSectionHead">
            <div className="supportEyebrow">Relevant Help</div>
            <h2>Maybe we can answer part of this immediately.</h2>
            <p>The suggestions below change with the selected issue.</p>
          </div>
          <div className="supportFaqGrid">
            {activeFaqs.map(([category, title, text]) => (
              <article className="supportFaqCard" key={title}>
                <small>{category}</small>
                <b>{title}</b>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="supportFutureBand">
        <div className="countryMark">BD</div>
        <small>Desh Solar • Bangladesh</small>
        <h2>POWERING BANGLADESH FORWARD.</h2>
      </section>
    </div>
  );
}
