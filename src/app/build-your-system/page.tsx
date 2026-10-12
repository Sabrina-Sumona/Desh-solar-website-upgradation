import { notFound } from "next/navigation";

/*
 * ============================================================
 * PHASE 2 FEATURE — TEMPORARILY DISABLED
 * ============================================================
 *
 * Build Your System is intentionally unavailable in the
 * initial production release.
 *
 * The completed implementation is preserved at:
 *
 * "@/components/build-your-system/BuildYourSystemClient"
 *
 * To re-enable this feature later, restore the original imports:
 *
 * import type { Metadata } from "next";
 * import BuildYourSystemClient from
 *   "@/components/build-your-system/BuildYourSystemClient";
 * import "@/styles/build-your-system.css";
 *
 * export const metadata: Metadata = {
 *   title: "Build Your System",
 *   description:
 *     "Build a preliminary Desh Solar system profile from property type, electricity use, appliances, backup hours and roof area.",
 * };
 *
 * Then replace:
 *
 *   notFound();
 *
 * with:
 *
 *   return <BuildYourSystemClient />;
 *
 * ============================================================
 */

export default function BuildYourSystemPage() {
  notFound();
}
