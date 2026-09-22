import type { Metadata } from "next";

import AboutPageClient from "@/components/about/AboutPageClient";
import "@/styles/about.css";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn how Desh Solar connects solar products, system engineering, installation, commissioning and after-sales support into one complete energy journey.",
};

export default function AboutPage() {
  return <AboutPageClient />;
}
