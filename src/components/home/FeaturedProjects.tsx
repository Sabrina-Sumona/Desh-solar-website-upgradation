"use client";

import Image from "next/image";
import Link from "next/link";

type ProjectItem = {
  id: string;
  title: string;
  category: string;
  image: string;
  text: string;
  href: string;
};

const FEATURED_PROJECTS: ProjectItem[] = [
  {
    id: "01",
    title: "Residential Solar",
    category: "Residential",
    image: "/assets/projects-real/residential.webp",
    text: "Solar solutions designed around household energy needs.",
    href: "/projects?type=residential",
  },
  {
    id: "02",
    title: "Commercial Solar",
    category: "Commercial",
    image: "/assets/projects-real/commercial.webp",
    text: "Solar energy solutions for offices, businesses and commercial spaces.",
    href: "/projects?type=commercial",
  },
  {
    id: "03",
    title: "Industrial Solar",
    category: "Industrial",
    image: "/assets/projects-real/industrial.webp",
    text: "Engineering-focused solar solutions for larger operational loads.",
    href: "/projects?type=industrial",
  },
  {
    id: "04",
    title: "Agriculture Solar",
    category: "Agriculture",
    image: "/assets/projects-real/agriculture.webp",
    text: "Solar applications planned around agricultural and field energy requirements.",
    href: "/projects?type=agriculture",
  },
  {
    id: "05",
    title: "Filling Station Solar",
    category: "Filling Station",
    image: "/assets/projects-real/filling.webp",
    text: "Solar solutions for filling-station and service-site energy requirements.",
    href: "/projects?type=filling-station",
  },
  {
    id: "06",
    title: "Off-Grid Solar",
    category: "Off-Grid",
    image: "/assets/projects-real/offgrid.webp",
    text: "Independent solar energy solutions for locations requiring off-grid operation.",
    href: "/projects?type=off-grid",
  },
];

function ProjectCard({
  project,
  duplicate = false,
}: {
  project: ProjectItem;
  duplicate?: boolean;
}) {
  return (
    <article className="featuredProjectCard">
      <Link
        href={project.href}
        className="featuredProjectImage"
        tabIndex={duplicate ? -1 : undefined}
        aria-hidden={duplicate ? "true" : undefined}
      >
        <Image
          src={project.image}
          alt={duplicate ? "" : project.title}
          fill
          className="featuredProjectImageAsset"
          sizes="(max-width: 720px) 82vw, (max-width: 1100px) 44vw, 31vw"
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
        <h3>{project.title}</h3>

        <p>{project.text}</p>

        <Link
          href={project.href}
          className="featuredProjectLink"
          tabIndex={duplicate ? -1 : undefined}
          aria-hidden={duplicate ? "true" : undefined}
        >
          View Project
          <span>→</span>
        </Link>
      </div>
    </article>
  );
}

export default function FeaturedProjects() {
  return (
    <section
      className="featuredProjects"
      id="featured-projects"
    >
      <div className="featuredProjectsGlow featuredProjectsGlowOne" />
      <div className="featuredProjectsGlow featuredProjectsGlowTwo" />

      <div className="featuredProjectsInner">
        {/* HEADER */}

        <div className="featuredProjectsHeader">
          <div>
            <div className="featuredProjectsEyebrow">
              Featured Projects
            </div>

            <h2>
              Solar in <span>action.</span>
            </h2>
          </div>

          <div className="featuredProjectsHeaderRight">
            <p>
              Explore solar applications across residential,
              commercial, industrial, agricultural, filling-station
              and off-grid environments.
            </p>

            <Link href="/projects">
              View All Projects →
            </Link>
          </div>
        </div>

        {/* AUTO-MOVING PROJECT STRIP */}

        <div
          className="featuredProjectsViewport"
          aria-label="Featured solar project categories"
        >
          <div className="featuredProjectsTrack">
            <div className="featuredProjectsGroup">
              {FEATURED_PROJECTS.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                />
              ))}
            </div>

            <div
              className="featuredProjectsGroup"
              aria-hidden="true"
            >
              {FEATURED_PROJECTS.map((project) => (
                <ProjectCard
                  key={`duplicate-${project.id}`}
                  project={project}
                  duplicate
                />
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER NOTE */}

        <div className="featuredProjectsFooter">
          <div className="featuredProjectsDataNote">
            <span />

            Project details will be updated with verified
            Desh Solar project information.
          </div>

          <div className="featuredProjectsMotionHint">
            <span className="featuredProjectsMotionDot" />
            Auto-moving project showcase
          </div>
        </div>
      </div>
    </section>
  );
}
