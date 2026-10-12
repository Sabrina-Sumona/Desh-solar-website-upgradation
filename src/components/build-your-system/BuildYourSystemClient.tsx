import type { Metadata } from "next";

import FeatureComingSoon from "@/components/shared/FeatureComingSoon";
import "@/styles/feature-coming-soon.css";

/*
 * ============================================================
 * TEMPORARILY DISABLED FOR THE FIRST PRODUCTION RELEASE
 * ============================================================
 *
 * Keep the completed Build Your System implementation in the project.
 * When the team approves the feature for release, restore:
 *
 * import BuildYourSystemClient from
 *   "@/components/build-your-system/BuildYourSystemClient";
 * import "@/styles/build-your-system.css";
 *
 * And replace the Coming Soon component below with:
 *
 * return <BuildYourSystemClient />;
 *
 * ============================================================
 */

export const metadata: Metadata = {
  title: "Build Your System | Coming Soon",
  description:
    "Desh Solar Build Your System is currently undergoing final development and testing.",
};

export default function BuildYourSystemPage() {
  return (
    <FeatureComingSoon
      eyebrow="Build Your System"
      title="Your guided solar planner"
      highlight="is coming soon."
      icon="✦"
      description="We are completing a guided planning experience that will help you turn your property, appliances, backup needs, roof space and electricity usage into a preliminary solar-system profile."
      points={[
        "Property-based load planning",
        "PV, inverter & storage guidance",
        "Catalogue-based system selection",
      ]}
    />
  );
}
