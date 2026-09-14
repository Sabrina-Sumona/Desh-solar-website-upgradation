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

function normalizePhone(value: string) {
  return value.replace(/[^\d+]/g, "").trim();
}

function isValidPhone(value: string) {
  const normalized = normalizePhone(value);

  return /^(?:\+?8801|01)\d{9}$/.test(
    normalized
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
        "Please confirm the order-review notice.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!items.length) {
      return;
    }

    if (!validate()) {
      return;
    }

    const message = buildWhatsAppMessage(
      items,
      form,
      subtotal,
      hasQuoteItems
    );

    const url =
      `https://wa.me/${WHATSAPP_NUMBER}` +
      `?text=${encodeURIComponent(message)}`;

    setSubmitted(true);

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
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
                    placeholder="01XXXXXXXXX"
                    autoComplete="tel"
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
                  change, and Desh Solar will confirm the
                  final commercial and technical details
                  before the order is finalized.
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
              >
                Confirm Order →
              </button>

              <p>
                This opens WhatsApp with your checkout
                details prepared for Desh Solar. Your cart
                is not cleared automatically, so you can
                return and make changes.
              </p>

              {submitted && (
                <div className={styles.sentNotice}>
                  WhatsApp opened with your order request.
                  Review the message and tap Send to
                  contact Desh Solar.
                </div>
              )}
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
