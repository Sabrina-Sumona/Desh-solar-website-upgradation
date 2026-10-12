import { notFound } from "next/navigation";

/*
 * ============================================================
 * PHASE 2 FEATURE — TEMPORARILY DISABLED
 * ============================================================
 *
 * Engineering Lab is intentionally unavailable in the
 * initial production release.
 *
 * The completed implementation is preserved at:
 *
 * "@/components/engineering-lab/EngineeringLabClient"
 *
 * To re-enable this feature later, restore the original imports:
 *
 * import type { Metadata } from "next";
 * import EngineeringLabClient from
 *   "@/components/engineering-lab/EngineeringLabClient";
 * import "@/styles/engineering-lab.css";
 *
 * export const metadata: Metadata = {
 *   title: "Engineering Lab",
 *   description:
 *     "Calculate, compare and understand the technical building blocks behind Desh Solar energy systems.",
 * };
 *
 * Then replace:
 *
 *   notFound();
 *
 * with:
 *
 *   return <EngineeringLabClient />;
 *
 * ============================================================
 */

export default function EngineeringLabPage() {
  notFound();
}
