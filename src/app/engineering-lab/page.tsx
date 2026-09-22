import type { Metadata } from "next";

import EngineeringLabClient from "@/components/engineering-lab/EngineeringLabClient";
import "@/styles/engineering-lab.css";

export const metadata: Metadata = {
  title: "Engineering Lab",
  description:
    "Calculate, compare and understand the technical building blocks behind Desh Solar energy systems.",
};

export default function EngineeringLabPage() {
  return <EngineeringLabClient />;
}
