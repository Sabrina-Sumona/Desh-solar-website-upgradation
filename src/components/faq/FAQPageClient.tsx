"use client";

import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";

type FaqCategory =
  | "All"
  | "Products"
  | "Solar Planning"
  | "Orders & Delivery"
  | "Warranty & Returns"
  | "Customer Support";

type FaqItem = {
  category: Exclude<FaqCategory, "All">;
  question: string;
  answer: string;
  link?: {
    href: string;
    label: string;
  };
};

const categories: FaqCategory[] = [
  "All",
  "Products",
  "Solar Planning",
  "Orders & Delivery",
  "Warranty & Returns",
  "Customer Support",
];

const faqItems: FaqItem[] = [
  {
    category: "Products",
    question: "Are Desh Solar products genuine?",
    answer:
      "Desh Solar states that products are sourced through authorized distributors and manufacturers. Product documentation and applicable manufacturer warranty information should be checked for the specific model you are considering.",
    link: { href: "/products", label: "Browse Products →" },
  },
  {
    category: "Products",
    question: "Do all products have the same warranty?",
    answer:
      "No. Manufacturer warranty varies by brand and product. Check the individual product information and purchase documents for the warranty that applies to your item.",
    link: { href: "/products", label: "View Product Catalogue →" },
  },
  {
    category: "Products",
    question: "How do I choose the right solar panel, inverter or battery?",
    answer:
      "Start with the energy requirement rather than only the product model. Load, backup target, electrical phase, available solar input and system compatibility should be considered before final equipment selection.",
    link: { href: "/build-your-system", label: "Build Your System →" },
  },
  {
    category: "Products",
    question: "Can I ask Desh Solar to check product compatibility?",
    answer:
      "Yes. Inverters, batteries, panels and other system components should be evaluated as part of the same system. Use Product Inquiry or Customer Support when you need compatibility guidance.",
    link: { href: "/contact", label: "Start a Product Inquiry →" },
  },
  {
    category: "Solar Planning",
    question: "What information is useful before planning a solar system?",
    answer:
      "Useful starting information includes your monthly electricity use, connected appliances or major loads, desired backup time, usable roof or site area and electrical phase if known.",
    link: { href: "/build-your-system", label: "Start System Planning →" },
  },
  {
    category: "Solar Planning",
    question: "Can I estimate my system before contacting Desh Solar?",
    answer:
      "Yes. Build Your System can help create a preliminary system profile, while the Engineering Lab provides tools for generation, battery, inverter, roof, load and compatibility checks.",
    link: { href: "/engineering-lab", label: "Open Engineering Lab →" },
  },
  {
    category: "Solar Planning",
    question: "Does the same solar system work for every home or business?",
    answer:
      "No. System requirements change with load profile, backup needs, roof or site conditions, electrical phase and the intended operating pattern. Product selection should follow the actual requirement.",
    link: { href: "/build-your-system", label: "Build Your System →" },
  },
  {
    category: "Solar Planning",
    question: "Can Desh Solar help with residential, commercial, industrial and agricultural projects?",
    answer:
      "The website provides planning paths for residential, commercial, industrial, agriculture and custom solar requirements. You can start with the planning tools or send a consultation request.",
    link: { href: "/contact", label: "Plan a Solar System →" },
  },
  {
    category: "Orders & Delivery",
    question: "Do you deliver outside Dhaka?",
    answer:
      "Yes. Desh Solar's published delivery information states that delivery is available nationwide across Bangladesh.",
  },
  {
    category: "Orders & Delivery",
    question: "How long does standard delivery take?",
    answer:
      "The published FAQ states approximately 2–5 business days, depending on location and order conditions.",
  },
  {
    category: "Orders & Delivery",
    question: "What should I prepare for an order or delivery question?",
    answer:
      "Keep your order or invoice number available. The delivery phone number and district are also useful when Desh Solar needs to identify the order and delivery context.",
    link: { href: "/customer-support", label: "Open Customer Support →" },
  },
  {
    category: "Orders & Delivery",
    question: "What should I do if an item arrives damaged or incorrect?",
    answer:
      "Keep the original packaging and purchase documents, take clear photos of any visible damage or incorrect item, and contact Customer Support with the order details.",
    link: { href: "/customer-support", label: "Start Support Request →" },
  },
  {
    category: "Warranty & Returns",
    question: "What is the published return window?",
    answer:
      "The current published FAQ states that unused products in original packaging can be returned within 7 days, subject to applicable conditions.",
  },
  {
    category: "Warranty & Returns",
    question: "What should I prepare for warranty review?",
    answer:
      "Prepare the product model, serial number, purchase information and clear evidence of the issue. These details help Desh Solar identify the correct warranty-support path.",
    link: { href: "/customer-support", label: "Start Warranty Assistance →" },
  },
  {
    category: "Warranty & Returns",
    question: "Does a warranty request mean an automatic replacement?",
    answer:
      "A warranty request is a review process. The applicable manufacturer warranty, product condition, purchase information and issue evidence need to be checked before the appropriate next step is determined.",
  },
  {
    category: "Customer Support",
    question: "When is Desh Solar customer support available?",
    answer:
      "Published customer-service hours are 10:00 AM–11:00 PM, seven days a week.",
  },
  {
    category: "Customer Support",
    question: "What are the Desh Solar hotline numbers?",
    answer:
      "You can call 0255-168220 or 01754-477488 during the published customer-service hours.",
  },
  {
    category: "Customer Support",
    question: "What types of issues can Customer Support handle?",
    answer:
      "The guided support flow covers complete solar-system issues, individual product support, warranty assistance, installation and maintenance concerns, order and delivery questions, and product-selection help.",
    link: { href: "/customer-support", label: "Open Customer Support →" },
  },
  {
    category: "Customer Support",
    question: "What information should I prepare for technical support?",
    answer:
      "Record the exact symptom, any visible error or status code, the product model and serial number if available, and clear photos of the product label, display or installation where useful.",
    link: { href: "/customer-support", label: "Start Guided Support →" },
  },
  {
    category: "Customer Support",
    question: "Should I open an inverter or battery to troubleshoot it?",
    answer:
      "No. Do not open energized or sealed inverter or battery equipment. Use normal user controls and displays only, and use qualified technical support for electrical or internal-equipment work.",
    link: { href: "/customer-support", label: "Get Support →" },
  },
];

export default function FAQPageClient() {
  const [activeCategory, setActiveCategory] = useState<FaqCategory>("All");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [openQuestion, setOpenQuestion] = useState<string>(
    faqItems[0]?.question ?? "",
  );

  const filteredFaqs = useMemo(() => {
    const term = search.trim().toLowerCase();

    return faqItems.filter((item) => {
      const matchesCategory =
        activeCategory === "All" || item.category === activeCategory;

      const matchesSearch =
        !term ||
        item.question.toLowerCase().includes(term) ||
        item.answer.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  const submitFaqSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearch(searchInput.trim());
    setOpenQuestion("");
  };

  const removeLastSearchCharacter = () => {
    setSearchInput((current) => {
      const next = current.slice(0, -1);
      setSearch(next.trim());
      setOpenQuestion("");
      return next;
    });
  };

  const categoryCount = (category: FaqCategory) =>
    category === "All"
      ? faqItems.length
      : faqItems.filter((item) => item.category === category).length;

  const chooseCategory = (category: FaqCategory) => {
    setActiveCategory(category);
    setOpenQuestion("");
  };

  return (
    <div className="faqPage">
      <main className="faqMain">
        <section className="faqHero">
          <div className="faqHeroCopy">
            <div className="faqEyebrow">Desh Solar FAQ</div>

            <h1>
              Answers before you <span>need to ask.</span>
            </h1>

            <p>
              Find clear answers about products, solar planning, delivery,
              warranty, returns and customer support.
            </p>

            <div className="faqHeroActions">
              <Link className="faqPrimaryBtn" href="/customer-support">
                Customer Support →
              </Link>
              <Link className="faqSecondaryBtn" href="/contact">
                Contact Desh Solar →
              </Link>
            </div>
          </div>

          <div className="faqHeroPanel">
            <div className="faqHeroPanelHead">
              <small>Quick Information</small>
              <b>Useful details at a glance.</b>
            </div>

            <div className="faqQuickFacts">
              <article>
                <span>01</span>
                <small>Customer Service</small>
                <b>10:00 AM – 11:00 PM</b>
                <p>7 days a week</p>
              </article>

              <article>
                <span>02</span>
                <small>Delivery</small>
                <b>Across Bangladesh</b>
                <p>Published estimate: 2–5 business days</p>
              </article>

              <article>
                <span>03</span>
                <small>Hotlines</small>
                <b>0255-168220</b>
                <p>01754-477488</p>
              </article>
            </div>
          </div>
        </section>

        <section className="faqBrowser">
          <div className="faqSectionIntro">
            <div>
              <div className="faqEyebrow">Browse Questions</div>
              <h2>Find the information you need.</h2>
            </div>

            <p>
              Choose a topic or search across all questions. Open only the
              answer you need.
            </p>
          </div>

          <div className="faqSearchArea">
            <form
              className="faqSearchWrap"
              onSubmit={submitFaqSearch}
              role="search"
            >
              <input
                aria-label="Search frequently asked questions"
                autoComplete="off"
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search delivery, warranty, inverter, support..."
                type="search"
                value={searchInput}
              />

              {searchInput && (
                <button
                  aria-label="Remove last search character"
                  className="faqSearchClear"
                  onClick={removeLastSearchCharacter}
                  type="button"
                >
                  ×
                </button>
              )}

              <button
                aria-label="Search FAQs"
                className="faqSearchSubmit"
                type="submit"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="6.5" />
                  <path d="m16 16 4 4" />
                </svg>
              </button>
            </form>

            {search && (
              <div className="faqSearchFeedback">
                <small>Search results</small>
                <b>
                  {filteredFaqs.length} match{filteredFaqs.length === 1 ? "" : "es"} for
                  “{search}”
                </b>
              </div>
            )}
          </div>

          <div className="faqCategoryTabs" aria-label="FAQ categories">
            {categories.map((category) => (
              <button
                className={activeCategory === category ? "active" : ""}
                key={category}
                onClick={() => chooseCategory(category)}
                type="button"
              >
                <span>{category}</span>
                <small>{categoryCount(category)}</small>
              </button>
            ))}
          </div>

          <div className="faqContentShell">
            <aside className="faqCategoryRail">
              <small>FAQ Topics</small>

              {categories.map((category, index) => (
                <button
                  className={activeCategory === category ? "active" : ""}
                  key={category}
                  onClick={() => chooseCategory(category)}
                  type="button"
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <b>{category}</b>
                  <small>{categoryCount(category)}</small>
                </button>
              ))}

              <div className="faqRailHelp">
                <span>?</span>
                <b>Still need help?</b>
                <p>
                  Use the guided Customer Support Center for product, system,
                  warranty, installation or order assistance.
                </p>
                <Link href="/customer-support">Open Support →</Link>
              </div>
            </aside>

            <div className="faqListColumn">
              <div className="faqResultsBar">
                <div>
                  <small>Showing</small>
                  <b>
                    {filteredFaqs.length} question
                    {filteredFaqs.length === 1 ? "" : "s"}
                  </b>
                </div>

                {(activeCategory !== "All" || search) && (
                  <button
                    onClick={() => {
                      setActiveCategory("All");
                      setSearchInput("");
                      setSearch("");
                      setOpenQuestion("");
                    }}
                    type="button"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              {filteredFaqs.length ? (
                <div className="faqAccordion">
                  {filteredFaqs.map((item, index) => {
                    const isOpen = openQuestion === item.question;

                    return (
                      <article
                        className={`faqItem ${isOpen ? "open" : ""}`}
                        key={item.question}
                      >
                        <button
                          aria-expanded={isOpen}
                          className="faqQuestion"
                          onClick={() =>
                            setOpenQuestion(isOpen ? "" : item.question)
                          }
                          type="button"
                        >
                          <span className="faqQuestionNumber">
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          <span className="faqQuestionText">
                            <small>{item.category}</small>
                            <b>{item.question}</b>
                          </span>

                          <span className="faqToggle" aria-hidden="true">
                            {isOpen ? "−" : "+"}
                          </span>
                        </button>

                        <div className="faqAnswer">
                          <div>
                            <p>{item.answer}</p>

                            {item.link && (
                              <Link href={item.link.href}>
                                {item.link.label}
                              </Link>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="faqEmptyState">
                  <span>⌕</span>
                  <h3>No matching questions found.</h3>
                  <p>
                    Try a different keyword or clear the current category
                    filter.
                  </p>
                  <button
                    onClick={() => {
                      setActiveCategory("All");
                      setSearch("");
                    }}
                    type="button"
                  >
                    Show All FAQs →
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="faqHelpSection">
          <div>
            <div className="faqEyebrow">Need More Help?</div>
            <h2>Move from an answer to the right next step.</h2>
            <p>
              For a product question, project consultation or an existing
              system issue, use the dedicated path instead of starting from
              scratch.
            </p>
          </div>

          <div className="faqHelpGrid">
            <Link href="/products">
              <span>01</span>
              <b>Browse Products</b>
              <small>Panels, inverters, batteries and systems.</small>
              <i>→</i>
            </Link>

            <Link href="/build-your-system">
              <span>02</span>
              <b>Build Your System</b>
              <small>Create a preliminary solar-system profile.</small>
              <i>→</i>
            </Link>

            <Link href="/customer-support">
              <span>03</span>
              <b>Customer Support</b>
              <small>Product, system, warranty and order assistance.</small>
              <i>→</i>
            </Link>

            <Link href="/contact">
              <span>04</span>
              <b>Contact Desh Solar</b>
              <small>Product inquiry, project planning or office visit.</small>
              <i>→</i>
            </Link>
          </div>
        </section>
      </main>

      <section className="faqFutureBand">
        <div className="countryMark">BD</div>
        <small>Desh Solar • Bangladesh</small>
        <h2>POWERING BANGLADESH FORWARD.</h2>
      </section>
    </div>
  );
}
