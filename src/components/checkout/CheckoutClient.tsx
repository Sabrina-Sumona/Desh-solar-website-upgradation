"use client";

import Image from "next/image";
import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import styles from "./CheckoutClient.module.css";

type CartItem = {
  id: string;
  name: string;
  price: number;
  priceText: string;
  image: string;
  category: string;
  quoteOnly: boolean;
  qty: number;
};

type CheckoutForm = {
  name: string;
  phone: string;
  email: string;
  district: string;
  address: string;
  service: "product-only" | "delivery" | "installation";
  notes: string;
  agree: boolean;
};

const CART_KEY = "deshSolarCartV1";
const WHATSAPP_NUMBER = "8801754477488";

const INITIAL_FORM: CheckoutForm = {
  name: "",
  phone: "",
  email: "",
  district: "",
  address: "",
  service: "product-only",
  notes: "",
  agree: false,
};

function money(value: number) {
  return `৳ ${Math.round(value).toLocaleString("en-US")}`;
}

function readCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(CART_KEY) || "[]"
    );

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => ({
        id: String(item?.id ?? ""),
        name: String(item?.name ?? "Product"),
        price: Number(item?.price ?? 0) || 0,
        priceText: String(
          item?.priceText ?? "Contact for price"
        ),
        image: String(item?.image ?? ""),
        category: String(
          item?.category ?? "Product"
        ),
        quoteOnly: Boolean(item?.quoteOnly),
        qty: Math.max(
          1,
          Math.floor(Number(item?.qty) || 1)
        ),
      }))
      .filter((item) => item.id);
  } catch {
    return [];
  }
}

function normalizeBangladeshPhone(
  value: string
) {
  const digits =
    value.replace(/\D/g, "");

  if (
    /^01[3-9]\d{8}$/.test(
      digits
    )
  ) {
    return `+88${digits}`;
  }

  if (
    /^8801[3-9]\d{8}$/.test(
      digits
    )
  ) {
    return `+${digits}`;
  }

  return null;
}

function isValidPhone(value: string) {
  return (
    normalizeBangladeshPhone(
      value
    ) !== null
  );
}

function isValidEmail(value: string) {
  if (!value.trim()) {
    return true;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value.trim()
  );
}

function serviceLabel(
  value: CheckoutForm["service"]
) {
  if (value === "delivery") {
    return "Product + Delivery";
  }

  if (value === "installation") {
    return "Product + Delivery + Installation";
  }

  return "Product Only";
}

function whatsappField(
  label: string,
  value: string
) {
  return `*${label}:* ${value}`;
}

function buildWhatsAppMessage(
  items: CartItem[],
  form: CheckoutForm,
  subtotal: number,
  hasQuoteItems: boolean
) {
  const totalQuantity = items.reduce(
    (total, item) => total + item.qty,
    0
  );

  const requestType = hasQuoteItems
    ? "Order + Quotation"
    : "Order";

  const itemLines = items.flatMap(
    (item, index) => {
      const unitPrice = item.quoteOnly
        ? "Quotation required"
        : money(item.price);

      const lineTotal = item.quoteOnly
        ? "Quotation required"
        : money(item.price * item.qty);

      return [
        `*${index + 1}. ${item.name}*`,
        whatsappField(
          "Quantity",
          String(item.qty)
        ),
        whatsappField(
          "Unit Price",
          unitPrice
        ),
        whatsappField(
          "Line Total",
          lineTotal
        ),
        "",
      ];
    }
  );

  return [
    "*DESH SOLAR*",
    hasQuoteItems
      ? "*ORDER + QUOTATION CONFIRMATION*"
      : "*ORDER CONFIRMATION*",
    "--------------------------------",
    "",
    "*CUSTOMER DETAILS*",
    whatsappField("Name", form.name),
    whatsappField("Phone", form.phone),
    ...(form.email.trim()
      ? [
          whatsappField(
            "Email",
            form.email.trim()
          ),
        ]
      : []),
    "",
    "*DELIVERY / INSTALLATION*",
    whatsappField(
      "District / Area",
      form.district
    ),
    ...(form.address.trim()
      ? [
          whatsappField(
            "Full Address",
            form.address.trim()
          ),
        ]
      : []),
    whatsappField(
      "Service",
      serviceLabel(form.service)
    ),
    "",
    "*ORDER ITEMS*",
    ...itemLines,
    "*ORDER SUMMARY*",
    whatsappField(
      "Request Type",
      requestType
    ),
    whatsappField(
      "Products",
      String(items.length)
    ),
    whatsappField(
      "Total Quantity",
      String(totalQuantity)
    ),
    whatsappField(
      hasQuoteItems
        ? "Priced Subtotal"
        : "Subtotal",
      money(subtotal)
    ),
    hasQuoteItems
      ? ""
      : null,
    hasQuoteItems
      ? "Note: One or more products require a final quotation."
      : null,
    "",
    form.notes.trim()
      ? "*CUSTOMER NOTES*"
      : null,
    form.notes.trim()
      ? form.notes.trim()
      : null,
    form.notes.trim()
      ? ""
      : null,
    "*DESH SOLAR TO CONFIRM*",
    "- Product availability",
    "- Final price / quotation",
    "- Delivery charge and schedule",
    "- Installation scope and cost, if applicable",
    "- Product and system compatibility",
    "",
    "Please review and confirm my order.",
    "",
    "Thank you,",
    `*${form.name}*`,
  ]
    .filter(
      (line): line is string =>
        line !== null
    )
    .join("\n");
}

export default function CheckoutClient() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [form, setForm] =
    useState<CheckoutForm>(INITIAL_FORM);
  const [hydrated, setHydrated] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [whatsAppFallbackUrl, setWhatsAppFallbackUrl] =
    useState("");
  const [savingLead, setSavingLead] = useState(false);
  const [leadSaveError, setLeadSaveError] =
    useState("");
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<
    Partial<Record<keyof CheckoutForm, string>>
  >({});

  useEffect(() => {
    const syncCart = () => {
      setItems(readCart());
    };

    syncCart();
    setHydrated(true);

    window.addEventListener(
      "deshsolar:cartchange",
      syncCart
    );
    window.addEventListener("storage", syncCart);

    return () => {
      window.removeEventListener(
        "deshsolar:cartchange",
        syncCart
      );
      window.removeEventListener(
        "storage",
        syncCart
      );
    };
  }, []);

  const itemCount = useMemo(
    () =>
      items.reduce(
        (total, item) => total + item.qty,
        0
      ),
    [items]
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total +
          (item.quoteOnly
            ? 0
            : item.price * item.qty),
        0
      ),
    [items]
  );

  const hasQuoteItems = useMemo(
    () =>
      items.some((item) => item.quoteOnly),
    [items]
  );

  const updateField = <K extends keyof CheckoutForm>(
    key: K,
    value: CheckoutForm[K]
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    if (errors[key]) {
      setErrors((current) => ({
        ...current,
        [key]: undefined,
      }));
    }

    setSubmitted(false);
    setWhatsAppFallbackUrl("");
  };

  const validate = () => {
    const nextErrors: Partial<
      Record<keyof CheckoutForm, string>
    > = {};

    if (!form.name.trim()) {
      nextErrors.name =
        "Please enter your full name.";
    }

    if (!form.phone.trim()) {
      nextErrors.phone =
        "Please enter your phone number.";
    } else if (!isValidPhone(form.phone)) {
      nextErrors.phone =
        "Enter a valid Bangladesh mobile number.";
    }

    if (!isValidEmail(form.email)) {
      nextErrors.email =
        "Enter a valid email address.";
    }

    if (!form.district.trim()) {
      nextErrors.district =
        "Please enter your district or area.";
    }

    if (!form.agree) {
      nextErrors.agree =
        "Please confirm the order and contact-details notice.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!items.length || savingLead) {
      return;
    }

    if (!validate()) {
      return;
    }

    setLeadSaveError("");
    setSubmitted(false);
    setWhatsAppFallbackUrl("");
    setSavingLead(true);

    const normalizedPhone =
      normalizeBangladeshPhone(
        form.phone
      );

    if (!normalizedPhone) {
      setErrors((current) => ({
        ...current,
        phone:
          "Enter a valid Bangladesh mobile number.",
      }));

      return;
    }

    const normalizedForm = {
      ...form,
      phone: normalizedPhone,
    };

    const message = buildWhatsAppMessage(
      items,
      normalizedForm,
      subtotal,
      hasQuoteItems
    );

    const url =
      `https://wa.me/${WHATSAPP_NUMBER}` +
      `?text=${encodeURIComponent(message)}`;

    const whatsappWindow = window.open(
      "",
      "_blank"
    );

    if (whatsappWindow) {
      whatsappWindow.opener = null;
    }

    try {
      const response = await fetch(
        "/api/customer-leads",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name.trim(),
            phone: normalizedPhone,
            email: form.email.trim(),
            address: form.district.trim(),
            fullAddress: form.address.trim(),
            additionalNotes: form.notes.trim(),
            website,
          }),
        }
      );

      if (!response.ok) {
        let message =
          "Could not save your contact information. Please try again.";

        try {
          const errorData =
            await response.json();

          if (
            errorData?.code ===
            "RATE_LIMITED"
          ) {
            message =
              "Too many order requests were sent from this connection. Please wait a few minutes and try again.";
          } else if (
            typeof errorData?.message ===
            "string" &&
            errorData.message.trim()
          ) {
            message =
              errorData.message.trim();
          }
        } catch {
          // Keep the safe fallback message.
        }

        throw new Error(message);
      }

      setSubmitted(true);

      if (whatsappWindow) {
        whatsappWindow.location.href = url;
      } else {
        setWhatsAppFallbackUrl(url);
      }
    } catch (error) {
      if (whatsappWindow) {
        whatsappWindow.close();
      }

      setWhatsAppFallbackUrl("");

      setLeadSaveError(
        error instanceof Error
          ? error.message
          : "Could not save your contact information. Please try again."
      );
    } finally {
      setSavingLead(false);
    }
  };

  if (!hydrated) {
    return (
      <main className={styles.page}>
        <div className={styles.loading}>
          Loading checkout…
        </div>
      </main>
    );
  }

  if (!items.length) {
    return (
      <main className={styles.page}>
        <section className={styles.empty}>
          <span>CHECKOUT</span>
          <h1>Your cart is empty.</h1>
          <p>
            Add products or a complete solar system
            before continuing to checkout.
          </p>
          <Link href="/products">
            Browse Products →
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.shell}>
          <span className={styles.eyebrow}>
            CHECKOUT
          </span>

          <h1>Review your solar request.</h1>

          <p>
            Confirm your contact details, delivery or
            installation location, and selected products.
            Final stock, technical compatibility, delivery,
            installation scope and quotation are confirmed
            by Desh Solar before the order is finalized.
          </p>
        </div>
      </section>

      <section className={styles.checkoutSection}>
        <div
          className={`${styles.shell} ${styles.layout}`}
        >
          <form
            id="checkoutForm"
            className={styles.form}
            onSubmit={handleSubmit}
            noValidate
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                left: "-10000px",
                top: "auto",
                width: "1px",
                height: "1px",
                overflow: "hidden",
              }}
            >
              <label>
                Website
                <input
                  type="text"
                  name="website"
                  value={website}
                  onChange={(event) =>
                    setWebsite(
                      event.target.value
                    )
                  }
                  autoComplete="off"
                  tabIndex={-1}
                />
              </label>
            </div>

            <section className={styles.panel}>
              <header className={styles.panelHeader}>
                <span>01</span>
                <div>
                  <small>CONTACT DETAILS</small>
                  <h2>Who should we contact?</h2>
                </div>
              </header>

              <div className={styles.fields}>
                <label>
                  <span>
                    Full Name <b>*</b>
                  </span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      updateField(
                        "name",
                        event.target.value
                      )
                    }
                    placeholder="Your full name"
                    autoComplete="name"
                  />
                  {errors.name && (
                    <small className={styles.error}>
                      {errors.name}
                    </small>
                  )}
                </label>

                <label>
                  <span>
                    Phone Number <b>*</b>
                  </span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(event) =>
                      updateField(
                        "phone",
                        event.target.value
                      )
                    }
                    placeholder="01XXXXXXXXX or +8801XXXXXXXXX"
                    autoComplete="tel"
                    inputMode="tel"
                  />
                  {errors.phone && (
                    <small className={styles.error}>
                      {errors.phone}
                    </small>
                  )}
                </label>

                <label className={styles.fullField}>
                  <span>Email Address</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      updateField(
                        "email",
                        event.target.value
                      )
                    }
                    placeholder="Optional"
                    autoComplete="email"
                  />
                  {errors.email && (
                    <small className={styles.error}>
                      {errors.email}
                    </small>
                  )}
                </label>
              </div>
            </section>

            <section className={styles.panel}>
              <header className={styles.panelHeader}>
                <span>02</span>
                <div>
                  <small>LOCATION</small>
                  <h2>
                    Where will the system be delivered?
                  </h2>
                </div>
              </header>

              <div className={styles.fields}>
                <label>
                  <span>
                    District / Area <b>*</b>
                  </span>
                  <input
                    type="text"
                    value={form.district}
                    onChange={(event) =>
                      updateField(
                        "district",
                        event.target.value
                      )
                    }
                    placeholder="e.g. Dhaka"
                    autoComplete="address-level2"
                  />
                  {errors.district && (
                    <small className={styles.error}>
                      {errors.district}
                    </small>
                  )}
                </label>

                <label className={styles.fullField}>
                  <span>
                    Full Address <small>(Optional)</small>
                  </span>
                  <textarea
                    value={form.address}
                    onChange={(event) =>
                      updateField(
                        "address",
                        event.target.value
                      )
                    }
                    placeholder="House, road, area"
                    rows={3}
                    autoComplete="street-address"
                  />
                </label>
              </div>
            </section>

            <section className={styles.panel}>
              <header className={styles.panelHeader}>
                <span>03</span>
                <div>
                  <small>SERVICE PREFERENCE</small>
                  <h2>How can Desh Solar help?</h2>
                </div>
              </header>

              <div className={styles.serviceGrid}>
                {(
                  [
                    {
                      value: "product-only",
                      title: "Product Only",
                      text: "I only need the selected products.",
                    },
                    {
                      value: "delivery",
                      title: "Product + Delivery",
                      text: "I need delivery to my location.",
                    },
                    {
                      value: "installation",
                      title:
                        "Delivery + Installation",
                      text: "I want delivery and professional installation support.",
                    },
                  ] as const
                ).map((option) => (
                  <label
                    className={`${styles.serviceCard} ${
                      form.service === option.value
                        ? styles.serviceActive
                        : ""
                    }`}
                    key={option.value}
                  >
                    <input
                      type="radio"
                      name="service"
                      value={option.value}
                      checked={
                        form.service === option.value
                      }
                      onChange={() =>
                        updateField(
                          "service",
                          option.value
                        )
                      }
                    />
                    <strong>{option.title}</strong>
                    <span>{option.text}</span>
                  </label>
                ))}
              </div>

              <label className={styles.notes}>
                <span>Additional Notes</span>
                <textarea
                  value={form.notes}
                  onChange={(event) =>
                    updateField(
                      "notes",
                      event.target.value
                    )
                  }
                  placeholder="Backup requirement, preferred installation time, site condition, or anything else we should know."
                  rows={4}
                />
              </label>
            </section>

          </form>

          <div className={styles.sideColumn}>
            <aside className={styles.summary}>
            <header>
              <small>ORDER SUMMARY</small>
              <h2>
                {itemCount}{" "}
                {itemCount === 1 ? "item" : "items"}
              </h2>
              <Link href="/cart">
                Edit Cart →
              </Link>
            </header>

            <div className={styles.productList}>
              {items.map((item) => (
                <article
                  className={styles.product}
                  key={item.id}
                >
                  <Link
                    className={styles.productImage}
                    href={`/products/${item.id}`}
                  >
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={120}
                        height={90}
                      />
                    )}
                  </Link>

                  <div>
                    <small>{item.category}</small>
                    <h3>{item.name}</h3>
                    <span>
                      Qty {item.qty}
                    </span>
                  </div>

                  <strong>
                    {item.quoteOnly
                      ? "Quote"
                      : money(
                          item.price * item.qty
                        )}
                  </strong>
                </article>
              ))}
            </div>

            <div className={styles.totalArea}>
              <div>
                <span>Products</span>
                <strong>{itemCount}</strong>
              </div>

              <div>
                <span>
                  {hasQuoteItems
                    ? "Fixed-price subtotal"
                    : "Subtotal"}
                </span>
                <strong>{money(subtotal)}</strong>
              </div>
            </div>

            {hasQuoteItems && (
              <div className={styles.quoteNotice}>
                One or more products require a final
                quotation. Those prices are not included
                in the subtotal shown above.
              </div>
            )}

            <div className={styles.finalNotice}>
              <b>No payment is taken on this page.</b>
              <p>
                Final price, stock, transport,
                installation and system compatibility
                will be confirmed with you before order
                processing.
              </p>
            </div>
          </aside>

            <section className={styles.confirmPanel}>
              <label className={styles.confirm}>
                <input
                  type="checkbox"
                  checked={form.agree}
                  onChange={(event) =>
                    updateField(
                      "agree",
                      event.target.checked
                    )
                  }
                />
                <span>
                  I understand that online catalogue
                  prices and product availability may
                  change. I also agree that Desh Solar may
                  store and use the contact details I
                  provide to follow up about this order
                  request and confirm the final commercial
                  and technical details.
                </span>
              </label>

              {errors.agree && (
                <small className={styles.error}>
                  {errors.agree}
                </small>
              )}

              <button
                className={styles.submitButton}
                type="submit"
                form="checkoutForm"
                disabled={savingLead}
              >
                {savingLead
                  ? "Saving Contact..."
                  : "Confirm Order →"}
              </button>

              {leadSaveError && (
                <small className={styles.error}>
                  {leadSaveError}
                </small>
              )}

              <p>
                Your submitted contact details are used
                for this order follow-up. Confirming then
                opens WhatsApp with your checkout details
                prepared for Desh Solar. Your cart is not
                cleared automatically.
              </p>

              {submitted && (
                <div
                  className={styles.sentNotice}
                  role="status"
                  aria-live="polite"
                >
                  <strong>
                    Contact information saved.
                  </strong>

                  {whatsAppFallbackUrl ? (
                    <>
                      <span>
                        Your browser did not open WhatsApp
                        automatically. Use the button below
                        to continue with your prepared order
                        message.
                      </span>

                      <a
                        className={styles.whatsappFallback}
                        href={whatsAppFallbackUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open WhatsApp →
                      </a>
                    </>
                  ) : (
                    <span>
                      WhatsApp opened with your prepared
                      order request. Review the message and
                      tap Send to contact Desh Solar.
                    </span>
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
