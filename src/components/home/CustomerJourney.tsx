import Link from "next/link";

type JourneyStep = {
  id: string;
  title: string;
  description: string;
};

const JOURNEY_STEPS: JourneyStep[] = [
  {
    id: "01",
    title: "Discover",
    description:
      "Explore solar options, products, projects and system possibilities.",
  },
  {
    id: "02",
    title: "Plan",
    description:
      "Define your property, energy goal and backup requirement.",
  },
  {
    id: "03",
    title: "Engineer",
    description:
      "Review loads, generation, storage and system requirements.",
  },
  {
    id: "04",
    title: "Select",
    description:
      "Choose the suitable products and system components.",
  },
  {
    id: "05",
    title: "Install",
    description:
      "Move from system planning toward professional implementation.",
  },
  {
    id: "06",
    title: "Support",
    description:
      "Continue with maintenance, assistance and customer support.",
  },
];

export default function CustomerJourney() {
  return (
    <section
      className="customerJourney"
      id="customer-journey"
    >
      <div className="customerJourneyInner">
        {/* ================================================
            HEADER
            ================================================ */}

        <div className="customerJourneyHeader">
          <div>
            <div className="customerJourneyEyebrow">
              Your Solar Journey
            </div>

            <h2>
              From first idea to
              <br />

              <span>
                long-term support.
              </span>
            </h2>
          </div>

          <p>
            A clear path from understanding your
            requirement to planning, implementation
            and ongoing support.
          </p>
        </div>

        {/* ================================================
            JOURNEY
            ================================================ */}

        <div className="customerJourneyTrack">
          {JOURNEY_STEPS.map(
            (step, index) => (
              <div
                className="customerJourneyItem"
                key={step.id}
              >
                <article className="customerJourneyCard">
                  <span className="customerJourneyNumber">
                    {step.id}
                  </span>

                  <h3>
                    {step.title}
                  </h3>

                  <p>
                    {step.description}
                  </p>
                </article>

                {index <
                  JOURNEY_STEPS.length -
                    1 && (
                  <div
                    className="customerJourneyConnector"
                    aria-hidden="true"
                  >
                    <span />

                    <b>
                      →
                    </b>
                  </div>
                )}
              </div>
            )
          )}
        </div>

        {/* ================================================
            FOOTER
            ================================================ */}

        <div className="customerJourneyFooter">
          <div>
            <small>
              START WHERE YOU ARE
            </small>

            <strong>
              Explore first, or begin planning
              your system now.
            </strong>
          </div>

          <div className="customerJourneyActions">
            <Link
              href="/products"
              className="customerJourneySecondary"
            >
              Explore Products

              <span aria-hidden="true">
                ↗
              </span>
            </Link>

            <Link
              href="/build-your-system"
              className="customerJourneyPrimary"
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