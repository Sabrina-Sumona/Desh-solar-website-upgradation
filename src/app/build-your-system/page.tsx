import type { Metadata } from "next";

import BuildYourSystemClient from "@/components/build-your-system/BuildYourSystemClient";
import "@/styles/build-your-system.css";

export const metadata: Metadata = {
  title: "Build Your System",
  description:
    "Build a preliminary Desh Solar system profile from property type, electricity use, appliances, backup hours and roof area.",
};

export default function BuildYourSystemPage() {
  return <BuildYourSystemClient />;
}
