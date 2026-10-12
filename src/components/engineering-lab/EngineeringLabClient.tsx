import type { Metadata } from "next";

import FeatureComingSoon from "@/components/shared/FeatureComingSoon";
import "@/styles/feature-coming-soon.css";

/*
 * ============================================================
 * TEMPORARILY DISABLED FOR THE FIRST PRODUCTION RELEASE
 * ============================================================
 *
 * Keep the completed Engineering Lab implementation in the project.
 * When the team approves the feature for release, restore:
 *
 * import EngineeringLabClient from
 *   "@/components/engineering-lab/EngineeringLabClient";
 * import "@/styles/engineering-lab.css";
 *
 * And replace the Coming Soon component below with:
 *
 * return <EngineeringLabClient />;
 *
 * ============================================================
 */

export const metadata: Metadata = {
  title: "Engineering Lab | Coming Soon",
  description:
    "Desh Solar Engineering Lab is currently undergoing final development and testing.",
};

export default function EngineeringLabPage() {
  return (
    <FeatureComingSoon
      eyebrow="Engineering Lab"
      title="Smarter solar engineering"
      highlight="is on the way."
      icon="⌁"
      description="We are completing the next generation of Desh Solar engineering tools for generation, battery backup, inverter sizing, roof planning, load analysis and system compatibility."
      points={[
        "Solar generation & roof planning",
        "Load, inverter & battery analysis",
        "System compatibility guidance",
      ]}
    />
  );
}
