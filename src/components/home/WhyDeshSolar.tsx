import Link from "next/link";

type Reason = {
  icon: string;
  title: string;
  description: string;
};

const REASONS: Reason[] = [
  {
    icon: "◎",
    title: "System-Led Planning",
    description:
      "Start with the energy requirement, then work toward the right system architecture and equipment.",
  },
  {
    icon: "⌁",
    title: "Engineering Tools",
    description:
      "Use practical planning tools to explore generation, backup, inverter sizing and other system considerations.",
  },
  {
    icon: "↯",
    title: "Complete Solar Ecosystem",
    description:
      "Explore solar panels, inverters, batteries and supporting system components in one connected experience.",
  },
  {
    icon: "◉",
    title: "Support Beyond Selection",
    description:
      "Move from product exploration and system planning toward consultation, installation and customer support.",
  },
];

export default function WhyDeshSolar() {
  return (
    <section
      className="whyDeshSolar"
      id="why-desh-solar"
    >
      <div className="whyDeshSolarGlow whyDeshSolarGlowOne" />
      <div className="whyDeshSolarGlow whyDeshSolarGlowTwo" />

      <div className="whyDeshSolarInner">
        {/* ================================================
            HEADER
            ================================================ */}

        <div className="whyDeshSolarHeader">
          <div>
            <div className="whyDeshSolarEyebrow">
              Why Desh Solar
            </div>

            <h2>
              More than choosing
              <br />

              <span>
                solar equipment.
              </span>
            </h2>
          </div>

          <div className="whyDeshSolarHeaderCopy">
            <p>
              A solar system works best when
              products, energy requirements and
              system planning are considered
              together.
            </p>

            <div className="whyDeshSolarTrustLine">
              <span aria-hidden="true" />

              <strong>
                For us, reliable service comes before business.
              </strong>
            </div>
          </div>
        </div>

        {/* ================================================
            REASONS
            ================================================ */}

        <div className="whyDeshSolarGrid">
          {REASONS.map((reason) => (
            <article
              className="whyDeshSolarCard"
              key={reason.title}
            >
              <span
                className="whyDeshSolarIcon"
                aria-hidden="true"
              >
                {reason.icon}
              </span>

              <h3>
                {reason.title}
              </h3>

              <p>
                {reason.description}
              </p>
            </article>
          ))}
        </div>

        {/* ================================================
            CTA
            ================================================ */}

        <div className="whyDeshSolarFooter">
          <div>
            <small>
              READY TO CONTINUE?
            </small>

            <strong>
              Explore Desh Solar or start
              planning your system.
            </strong>
          </div>

          <div className="whyDeshSolarActions">
            <Link
              href="/about"
              className="whyDeshSolarSecondary"
            >
              About Desh Solar

              <span aria-hidden="true">
                ↗
              </span>
            </Link>

            <Link
              href="/build-your-system"
              className="whyDeshSolarPrimary"
            >
              Build Your System

              <span aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}