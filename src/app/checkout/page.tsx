import type { Metadata } from "next";

import CheckoutClient from "@/components/checkout/CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout | Desh Solar",
  description:
    "Review your Desh Solar order, provide contact and installation details, and send your order or quotation request.",
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
