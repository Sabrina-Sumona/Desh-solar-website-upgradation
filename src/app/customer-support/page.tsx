import type { Metadata } from "next";

import CustomerSupportClient from "@/components/customer-support/CustomerSupportClient";
import "@/styles/customer-support.css";

export const metadata: Metadata = {
  title: "Customer Support",
  description:
    "Desh Solar customer support for solar systems, products, warranty, installation, maintenance, orders and product selection.",
};

export default function CustomerSupportPage() {
  return <CustomerSupportClient />;
}
