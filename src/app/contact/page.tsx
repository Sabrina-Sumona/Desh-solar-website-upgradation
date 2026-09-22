import type { Metadata } from "next";

import ContactPageClient from "@/components/contact/ContactPageClient";
import "@/styles/contact.css";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact Desh Solar for solar project planning, product enquiries, showroom consultation and customer support in Bangladesh.",
};

export default function ContactPage() {
  return <ContactPageClient />;
}
