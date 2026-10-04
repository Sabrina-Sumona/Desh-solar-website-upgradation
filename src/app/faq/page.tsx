import type { Metadata } from "next";
import FAQPageClient from "@/components/faq/FAQPageClient";
import "@/styles/faq.css";

export const metadata: Metadata = {
  title: "FAQ | Desh Solar",
  description:
    "Frequently asked questions about Desh Solar products, solar-system planning, delivery, warranty, returns and customer support.",
};

export default function FAQPage() {
  return <FAQPageClient />;
}
