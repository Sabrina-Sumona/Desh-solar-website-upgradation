import Image from "next/image";
import Link from "next/link";

type SolutionCategory = {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  projectHref: string;
  builderHref: string;
  highlights: string[];
};

const SOLUTIONS: SolutionCategory[] = [
  {
    number: "01",
    title: "Residential",
    subtitle: "Solar for everyday living",
    description:
      "Plan solar generation, backup and energy storage around household appliances, roof space and everyday electricity use.",
    image:
      "/assets/projects-real/residential.webp",
    projectHref:
      "/projects?type=residential",
    builderHref:
      "/build-your-system?property=home",
    highlights: [
      "Home backup",
      "Rooftop solar",
      "Hybrid systems",
    ],
  },

  {
    number: "02",
    title: "Commercial",
    subtitle: "Energy for business operations",
    description:
      "Solar systems for offices, retail spaces, commercial properties and business facilities with daytime electrical demand.",
    image:
      "/assets/projects-real/commercial.webp",
    projectHref:
      "/projects?type=commercial",
    builderHref:
      "/build-your-system?property=business",
    highlights: [
      "Office loads",
      "Retail energy",
      "Cost reduction",
    ],
  },

  {
    number: "03",
    title: "Industrial",
    subtitle: "Power for demanding facilities",
    description:
      "Engineering-focused solar solutions for factories, workshops and facilities with larger electrical loads and operational requirements.",
    image:
      "/assets/projects-real/industrial.webp",
    projectHref:
      "/projects?type=industrial",
    builderHref:
      "/build-your-system?property=factory",
    highlights: [
      "Three-phase loads",
      "Factory support",
      "Large PV systems",
    ],
  },

  {
    number: "04",
    title: "Agriculture",
    subtitle: "Solar energy for productive land",
    description:
      "Solar solutions for irrigation, pumps, farm operations, cold storage support and agricultural energy requirements.",
    image:
      "/assets/projects-real/agriculture.webp",
    projectHref:
      "/projects?type=agriculture",
    builderHref:
      "/build-your-system?property=agriculture",
    highlights: [
      "Solar pumping",
      "Irrigation",
      "Farm energy",
    ],
  },

  {
    number: "05",
    title: "Filling Station",
    subtitle: "Reliable energy for station operations",
    description:
      "Solar planning for fuel stations, forecourt lighting, dispensers, offices, cooling, surveillance and supporting electrical loads.",
    image:
      "/assets/projects-real/filling.webp",
    projectHref:
      "/projects?type=filling-station",
    builderHref:
      "/build-your-system?property=filling-station",
    highlights: [
      "Forecourt loads",
      "Station backup",
      "Commercial solar",
    ],
  },

  {
    number: "06",
    title: "Off-Grid",
    subtitle: "Energy beyond the grid",
    description:
      "Independent solar generation and storage for locations where grid electricity is unavailable, unreliable or intentionally avoided.",
    image:
      "/assets/projects-real/offgrid.webp",
    projectHref:
      "/projects?type=off-grid",
    builderHref:
      "/build-your-system?property=other",
    highlights: [
      "Independent power",
      "Battery storage",
      "Remote locations",
    ],
  },
];

export default function SolutionCategories() {
  return (
    <section
      className="solutionCategories"
      id="solutions"
    >
      <div className="solutionCategoriesInner">
        {/* HEADER */}

        <div className="solutionCategoriesHeader">
          <div>
            <div className="solutionCategoriesEyebrow">
              Solar Applications
            </div>

            <h2>
              One energy ecosystem.
              <br />
              <span>
                Different requirements.
              </span>
            </h2>
          </div>

          <div className="solutionCategoriesIntro">
            <p>
              Solar systems should be designed
              around how a property actually uses
              energy. Explore the application that
              best matches your requirement.
            </p>

            <Link href="/projects">
              Explore All Projects →
            </Link>
          </div>
        </div>

        {/* CARDS */}

        <div className="solutionCategoriesGrid">
          {SOLUTIONS.map((solution) => (
            <article
              className="solutionCategoryCard"
              key={solution.title}
            >
              <div className="solutionCategoryMedia">
                <Image
                  src={solution.image}
                  alt={`${solution.title} solar solution`}
                  fill
                  sizes="
                    (max-width: 720px) 100vw,
                    (max-width: 1050px) 50vw,
                    33vw
                  "
                />

                <div className="solutionCategoryShade" />

                <span className="solutionCategoryNumber">
                  {solution.number}
                </span>

                <div className="solutionCategoryMediaTitle">
                  <small>
                    {solution.subtitle}
                  </small>

                  <h3>
                    {solution.title}
                  </h3>
                </div>
              </div>

              <div className="solutionCategoryContent">
                <p>
                  {solution.description}
                </p>

                <div className="solutionCategoryTags">
                  {solution.highlights.map(
                    (highlight) => (
                      <span key={highlight}>
                        {highlight}
                      </span>
                    )
                  )}
                </div>

                <div className="solutionCategoryActions">
                  <Link
                    href={solution.projectHref}
                    className="solutionCategoryProjectLink"
                  >
                    View Applications →
                  </Link>

                  <Link
                    href={solution.builderHref}
                    className="solutionCategoryBuilderLink"
                  >
                    Plan This System
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* BOTTOM BRIDGE */}

        <div className="solutionCategoriesFooter">
          <div>
            <small>
              NOT SURE WHICH CATEGORY FITS?
            </small>

            <strong>
              Start with your appliances and energy
              requirement instead.
            </strong>
          </div>

          <Link href="/build-your-system">
            Open Build Your System →
          </Link>
        </div>
      </div>
    </section>
  );
}