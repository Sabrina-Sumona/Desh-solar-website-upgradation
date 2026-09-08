import Image from "next/image";
import Link from "next/link";

const FEATURED_PROJECTS = [
  {
    id: "01",
    title: "Residential Solar",
    category: "Residential",
    image:
      "/assets/projects-real/residential.webp",
    text:
      "Solar solutions designed around household energy needs.",
    href:
      "/projects?type=residential",
  },

  {
    id: "02",
    title: "Commercial Solar",
    category: "Commercial",
    image:
      "/assets/projects-real/commercial.webp",
    text:
      "Solar energy solutions for offices, businesses and commercial spaces.",
    href:
      "/projects?type=commercial",
  },

  {
    id: "03",
    title: "Industrial Solar",
    category: "Industrial",
    image:
      "/assets/projects-real/industrial.webp",
    text:
      "Engineering-focused solar solutions for larger operational loads.",
    href:
      "/projects?type=industrial",
  },
];

export default function FeaturedProjects() {
  return (
    <section
      className="featuredProjects"
      id="featured-projects"
    >
      <div className="featuredProjectsInner">
        {/* HEADER */}

        <div className="featuredProjectsHeader">
          <div>
            <div className="featuredProjectsEyebrow">
              Featured Projects
            </div>

            <h2>
              Solar in{" "}
              <span>
                action.
              </span>
            </h2>
          </div>

          <div className="featuredProjectsHeaderRight">
            <p>
              Explore selected solar
              applications across different
              property types.
            </p>

            <Link href="/projects">
              View All Projects →
            </Link>
          </div>
        </div>

        {/* PROJECTS */}

        <div className="featuredProjectsGrid">
          {FEATURED_PROJECTS.map(
            (project) => (
              <article
                key={project.id}
                className="featuredProjectCard"
              >
                <Link
                  href={project.href}
                  className="featuredProjectImage"
                >
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    sizes="
                      (max-width: 720px) 100vw,
                      (max-width: 1000px) 50vw,
                      33vw
                    "
                  />

                  <div className="featuredProjectOverlay" />

                  <span className="featuredProjectNumber">
                    {project.id}
                  </span>

                  <span className="featuredProjectCategory">
                    {project.category}
                  </span>
                </Link>

                <div className="featuredProjectContent">
                  <h3>
                    {project.title}
                  </h3>

                  <p>
                    {project.text}
                  </p>

                  <Link
                    href={project.href}
                    className="featuredProjectLink"
                  >
                    View Project

                    <span>
                      →
                    </span>
                  </Link>
                </div>
              </article>
            )
          )}
        </div>

        {/* TEMPORARY DATA NOTE */}

        <div className="featuredProjectsDataNote">
          <span />

          Project details will be updated
          with verified Desh Solar project
          information.
        </div>
      </div>
    </section>
  );
}