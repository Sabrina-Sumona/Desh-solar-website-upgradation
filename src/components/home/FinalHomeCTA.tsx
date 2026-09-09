import Link from "next/link";

export default function FinalHomeCTA() {
  return (
    <section
      className="finalHomeCTA"
      id="final-home-cta"
    >
      <div className="finalHomeCTAGlow finalHomeCTAGlowOne" />
      <div className="finalHomeCTAGlow finalHomeCTAGlowTwo" />

      <div className="finalHomeCTAInner">
        <div className="finalHomeCTAEyebrow">
          Ready To Start?
        </div>

        <h2>
          <span>
            PLAN YOUR
          </span>

          <span className="finalHomeCTAGreen">
            SOLAR SYSTEM.
          </span>
        </h2>

        <p>
          Start with a few simple choices,
          explore your requirements and
          continue toward a complete solar
          energy solution.
        </p>

        <div className="finalHomeCTAActions">
          <Link
            href="/build-your-system"
            className="finalHomeCTAPrimary"
          >
            Build Your System

            <span aria-hidden="true">
              →
            </span>
          </Link>

          <Link
            href="/contact"
            className="finalHomeCTASecondary"
          >
            Talk to Desh Solar

            <span aria-hidden="true">
              ↗
            </span>
          </Link>
        </div>
      </div>

      <div className="finalHomeCTABottomLine">
        <span>
          DESH SOLAR
        </span>

        <i aria-hidden="true" />

        <span>
          Complete Solar Energy Solutions
        </span>
      </div>
    </section>
  );
}