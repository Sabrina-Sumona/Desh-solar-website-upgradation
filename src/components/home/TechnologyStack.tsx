import Image from "next/image";
import Link from "next/link";

type TechnologyItem = {
  title: string;
  icon: string;
  role: string;
  description: string;
  image: string;
  alt: string;
};

const TECHNOLOGY_ITEMS: TechnologyItem[] = [
  {
    title: "Solar Panel",
    icon: "☀",
    role: "Generation",
    description:
      "Captures sunlight and converts it into DC electrical energy.",
    image:
      "/assets/technology/solar-panel.jpg",
    alt:
      "Solar panel",
  },

  {
    title: "Inverter",
    icon: "↯",
    role:
      "Conversion + Management",
    description:
      "Converts solar DC power into usable AC electricity and manages system energy.",
    image:
      "/assets/technology/inverter.jpg",
    alt:
      "Solar inverter",
  },

  {
    title: "Battery",
    icon: "▣",
    role: "Storage",
    description:
      "Stores available energy so it can be used later when required.",
    image:
      "/assets/technology/battery.jpg",
    alt:
      "Solar battery",
  },

  {
    title:
      "Protection & Distribution",
    icon: "◎",
    role:
      "Safety + Delivery",
    description:
      "Protects, connects and distributes electrical power throughout the system.",
    image:
      "/assets/technology/protection-distribution.jpg",
    alt:
      "Protection and distribution equipment",
  },
];

export default function TechnologyStack() {
  return (
    <section
      className="technologyStack"
      id="technology-stack"
    >
      <div className="technologyStackGlow technologyStackGlowOne" />
      <div className="technologyStackGlow technologyStackGlowTwo" />

      <div className="technologyStackInner">
        {/* ================================================
            HEADER
            ================================================ */}

        <div className="technologyStackHeader">
          <div>
            <div className="technologyStackEyebrow">
              System Technology
            </div>

            <h2>
              The technology behind
              <br />

              <span>
                your solar system.
              </span>
            </h2>
          </div>

          <div className="technologyStackHeaderCopy">
            <p>
              A complete solar energy
              system works through several
              technologies working
              together from generation to
              safe electricity delivery.
            </p>
          </div>
        </div>

        {/* ================================================
            TECHNOLOGY CARDS
            ================================================ */}

        <div className="technologyStackFlow">
          {TECHNOLOGY_ITEMS.map(
            (item, index) => (
              <div
                className="technologyStackFlowItem"
                key={item.title}
              >
                <article className="technologyCard">
                  {/* IMAGE */}

                  <div className="technologyCardMedia">
                    <Image
                      src={item.image}
                      alt={item.alt}
                      fill
                      className="technologyCardImage"
                      sizes="
                        (max-width: 720px) 100vw,
                        (max-width: 1100px) 50vw,
                        25vw
                      "
                    />

                    <div className="technologyCardMediaOverlay" />

                    <span
                      className="technologyIcon"
                      aria-hidden="true"
                    >
                      {item.icon}
                    </span>
                  </div>

                  {/* CONTENT */}

                  <div className="technologyCardBody">
                    <small>
                      {item.role}
                    </small>

                    <h3>
                      {item.title}
                    </h3>

                    <p>
                      {item.description}
                    </p>
                  </div>
                </article>

                {/* CONNECTOR */}

                {index <
                  TECHNOLOGY_ITEMS.length -
                    1 && (
                  <div
                    className="technologyConnector"
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
            SYSTEM PATH
            ================================================ */}

        <div className="technologySystemPath">
          <small>
            COMPLETE SYSTEM PATH
          </small>

          <div>
            <span>
              Sunlight
            </span>

            <b>
              →
            </b>

            <span>
              Generation
            </span>

            <b>
              →
            </b>

            <span>
              Conversion
            </span>

            <b>
              ↕
            </b>

            <span>
              Storage
            </span>

            <b>
              →
            </b>

            <span>
              Distribution
            </span>

            <b>
              →
            </b>

            <span>
              Loads
            </span>
          </div>
        </div>

        {/* ================================================
            FOOTER / CTA
            ================================================ */}

        <div className="technologyStackFooter">
          <div>
            <small>
              WANT TO GO DEEPER?
            </small>

            <strong>
              Explore products or use
              Desh Solar&apos;s
              engineering tools.
            </strong>
          </div>

          <div className="technologyStackActions">
            <Link
              href="/products"
              className="technologyPrimaryAction"
            >
              Explore Products

              <span aria-hidden="true">
                →
              </span>
            </Link>

            <Link
              href="/tools-and-technology"
              className="technologySecondaryAction"
            >
              Engineering Tools

              <span aria-hidden="true">
                ↗
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}