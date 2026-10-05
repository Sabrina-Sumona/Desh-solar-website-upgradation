"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ProjectCategory =
  | "all"
  | "residential"
  | "commercial"
  | "industrial"
  | "agriculture"
  | "filling-station"
  | "off-grid";

type ProjectShowcase = {
  id: string;
  category: Exclude<ProjectCategory, "all">;
  categoryLabel: string;
  title: string;
  subtitle: string;
  image: string;
  alt: string;
  focus: string;
  architecture: string;
  engineering: string;
};

const FILTERS: Array<{ key: ProjectCategory; label: string }> = [
  { key: "all", label: "All Projects" },
  { key: "residential", label: "Residential" },
  { key: "commercial", label: "Commercial" },
  { key: "industrial", label: "Industrial" },
  { key: "agriculture", label: "Agriculture" },
  { key: "filling-station", label: "Filling Station" },
  { key: "off-grid", label: "Custom / Off-Grid" },
];

const SHOWCASES: ProjectShowcase[] = [
  {
    id: "residential-rooftop-hybrid",
    category: "residential",
    categoryLabel: "RESIDENTIAL",
    title: "Residential Rooftop Hybrid",
    subtitle: "Home solar, essential loads and backup planning.",
    image: "/assets/projects-real/residential.webp",
    alt: "Representative residential rooftop solar installation",
    focus: "Household energy use, essential-load backup and rooftop utilization.",
    architecture: "Hybrid solar + battery + grid direction.",
    engineering:
      "Roof area, shading, appliance load, surge demand, backup hours and safe equipment placement.",
  },
  {
    id: "commercial-rooftop",
    category: "commercial",
    categoryLabel: "COMMERCIAL",
    title: "Commercial Rooftop Solar",
    subtitle: "Daytime business consumption and rooftop generation.",
    image: "/assets/projects-real/residential.webp",
    alt: "Representative commercial rooftop solar installation",
    focus: "Reduce daytime grid consumption while supporting business continuity.",
    architecture: "On-grid or hybrid commercial architecture.",
    engineering:
      "Operating hours, daytime load profile, roof layout, phase, protection and monitoring.",
  },
  {
    id: "industrial-factory-rooftop",
    category: "industrial",
    categoryLabel: "INDUSTRIAL",
    title: "Industrial Factory Rooftop Solar",
    subtitle: "Three-phase loads, motors and project-scale PV planning.",
    image: "/assets/projects-real/industrial.webp",
    alt: "Representative industrial factory rooftop solar installation",
    focus: "High daytime demand and large usable roof areas.",
    architecture: "Three-phase on-grid or hybrid project architecture.",
    engineering:
      "Demand profile, motor loads, phase, distribution, protection, roof structure and commissioning.",
  },
  {
    id: "solar-irrigation",
    category: "agriculture",
    categoryLabel: "AGRICULTURE",
    title: "Solar Irrigation & Farm Energy",
    subtitle: "Solar pumping and daytime agricultural energy use.",
    image: "/assets/projects-real/agriculture.webp",
    alt: "Representative solar irrigation and agriculture installation",
    focus: "Pump operation, irrigation schedule and direct daytime solar use.",
    architecture: "Solar pumping or hybrid agriculture system.",
    engineering:
      "Pump horsepower, water demand, operating hours, solar resource and controller compatibility.",
  },
  {
    id: "filling-station-energy",
    category: "filling-station",
    categoryLabel: "FILLING STATION",
    title: "Filling Station Solar & Backup",
    subtitle: "Forecourt, office, lighting and critical-load continuity.",
    image: "/assets/projects-real/industrial.webp",
    alt: "Representative commercial solar installation for a filling station",
    focus: "Operational loads, lighting, office systems and critical backup.",
    architecture: "Commercial hybrid system direction.",
    engineering:
      "Load separation, backup priority, operating hours, protection and safe equipment zones.",
  },
  {
    id: "custom-off-grid",
    category: "off-grid",
    categoryLabel: "CUSTOM / OFF-GRID",
    title: "Remote & Custom Off-Grid Energy",
    subtitle: "Storage-led energy planning for sites with limited grid access.",
    image: "/assets/projects-real/agriculture.webp",
    alt: "Representative off-grid solar energy installation",
    focus: "Energy autonomy, storage reserve and reliable daily energy supply.",
    architecture: "Off-grid solar + battery architecture.",
    engineering:
      "Daily energy budget, seasonal solar resource, autonomy target, battery reserve and system redundancy.",
  },
];


function getSimilarSystemHref(
  project: ProjectShowcase,
) {
  const presets: Record<
    ProjectShowcase["category"],
    {
      property: string;
      goal: string;
    }
  > = {
    residential: {
      property: "home",
      goal: "both",
    },
    commercial: {
      property: "business",
      goal: "project",
    },
    industrial: {
      property: "factory",
      goal: "project",
    },
    agriculture: {
      property: "agriculture",
      goal: "project",
    },
    "filling-station": {
      property: "filling",
      goal: "both",
    },
    "off-grid": {
      property: "other",
      goal: "independence",
    },
  };

  const preset =
    presets[project.category];

  const params =
    new URLSearchParams({
      property: preset.property,
      goal: preset.goal,
      source: "project",
      project: project.id,
    });

  return `/build-your-system?${params.toString()}`;
}

export default function ProjectsPageClient() {
  const [filter, setFilter] = useState<ProjectCategory>("all");
  const [modalProjectId, setModalProjectId] = useState<string | null>(null);

  const visibleProjects = useMemo(
    () =>
      filter === "all"
        ? SHOWCASES
        : SHOWCASES.filter((project) => project.category === filter),
    [filter],
  );

  const modalProject =
    modalProjectId === null
      ? null
      : SHOWCASES.find((project) => project.id === modalProjectId) ?? null;

  const updateProjectUrl = (projectId: string | null) => {
    const url = new URL(window.location.href);

    if (projectId) {
      url.searchParams.set("project", projectId);
    } else {
      url.searchParams.delete("project");
    }

    window.history.replaceState(
      window.history.state,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  };

  const openProjectModal = (projectId: string) => {
    const exists = SHOWCASES.some(
      (project) => project.id === projectId,
    );

    if (!exists) return;

    setModalProjectId(projectId);
    updateProjectUrl(projectId);
  };

  const closeProjectModal = () => {
    setModalProjectId(null);
    updateProjectUrl(null);
  };

  const chooseFilter = (key: ProjectCategory) => {
    setFilter(key);
    closeProjectModal();
  };

  useEffect(() => {
    const syncProjectFromUrl = () => {
      const projectId =
        new URLSearchParams(
          window.location.search,
        ).get("project");

      const project =
        projectId
          ? SHOWCASES.find(
              (item) => item.id === projectId,
            ) ?? null
          : null;

      window.setTimeout(() => {
        setModalProjectId(
          project?.id ?? null,
        );
      }, 0);
    };

    syncProjectFromUrl();

    window.addEventListener(
      "popstate",
      syncProjectFromUrl,
    );

    return () => {
      window.removeEventListener(
        "popstate",
        syncProjectFromUrl,
      );
    };
  }, []);

  useEffect(() => {
    if (!modalProject) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeProjectModal();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [modalProject]);

  return (
    <div className="projectsPrototype">
      <main className="projectsPage">
        <section className="projectsHero">
          <div className="projectsHeroCopy">
            <div className="projectsEyebrow">Our Projects</div>
            <h1>
              Powering a greener <span>Bangladesh.</span>
            </h1>
            <p>
              Explore the solar project types Desh Solar is built to support—from
              residential rooftops and commercial facilities to industrial,
              agricultural and off-grid energy systems.
            </p>
          </div>

          <div className="projectsHeroStatus">
            <span>REFERENCE SHOWCASE</span>
            <b>Real Desh Solar projects will be added here.</b>
            <p>
              The current cards demonstrate the approved project-page structure
              without publishing unverified client, capacity or performance claims.
            </p>
          </div>
        </section>

        <section className="projectsFilterSection" aria-label="Project categories">
          <div className="projectsFilterIntro">
            <div className="projectsEyebrow">Project Types</div>
            <h2>Solar systems in real-world contexts.</h2>
          </div>

          <div className="projectsFilters" role="tablist" aria-label="Filter projects">
            {FILTERS.map((item) => (
              <button
                key={item.key}
                className={filter === item.key ? "active" : ""}
                onClick={() => chooseFilter(item.key)}
                type="button"
                role="tab"
                aria-selected={filter === item.key}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        <section className="projectsGrid" aria-live="polite">
          {visibleProjects.map((project) => (
            <article
              key={project.id}
              className={`projectCard${
                modalProject?.id === project.id ? " active" : ""
              }`}
            >
              <button
                className="projectCardSelect"
                type="button"
                onClick={() => openProjectModal(project.id)}
                aria-label={`View ${project.title} showcase details`}
              >
                <div className="projectCardImage">
                  <Image
                    src={project.image}
                    alt={project.alt}
                    fill
                    sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw"
                  />
                  <span className="projectReferenceBadge">
                    Reference Project / Showcase
                  </span>
                </div>

                <div className="projectCardBody">
                  <small>{project.categoryLabel}</small>
                  <h3>{project.title}</h3>
                  <p>{project.subtitle}</p>
                  <div className="projectCardBottom">
                    <span>Bangladesh • Representative context</span>
                    <b>View Showcase →</b>
                  </div>
                </div>
              </button>
            </article>
          ))}
        </section>

        <section className="projectProcess">
          <div className="projectProcessCopy">
            <div className="projectsEyebrow">Project Journey</div>
            <h2>From site requirement to handover.</h2>
            <p>
              The final project case studies can use this same structure when
              verified Desh Solar project data, photos and specifications are added.
            </p>
          </div>

          <div className="projectProcessFlow">
            <div><span>01</span><b>UNDERSTAND</b><small>Site + energy need</small></div>
            <i>→</i>
            <div><span>02</span><b>CALCULATE</b><small>Load + generation</small></div>
            <i>→</i>
            <div><span>03</span><b>ENGINEER</b><small>System architecture</small></div>
            <i>→</i>
            <div><span>04</span><b>SELECT</b><small>Equipment path</small></div>
            <i>→</i>
            <div><span>05</span><b>INSTALL</b><small>Site execution</small></div>
            <i>→</i>
            <div><span>06</span><b>SUPPORT</b><small>Handover + after-sales</small></div>
          </div>
        </section>

        <section className="projectsCta">
          <div>
            <div className="projectsEyebrow">Plan Your Project</div>
            <h2>Have a site that needs a solar solution?</h2>
            <p>
              Start with your property, energy requirement and backup goal. Desh
              Solar can then continue the conversation from a clearer project brief.
            </p>
          </div>
          <div className="projectsCtaActions">
            <Link className="projectsBtn" href="/build-your-system">
              Build Your System →
            </Link>
            <Link className="projectsBtn secondary" href="/contact">
              Contact Desh Solar →
            </Link>
          </div>
        </section>
      </main>

      <section className="projectsFutureBand">
        <div className="countryMark">BD</div>
        <small>Desh Solar • Bangladesh</small>
        <h2>POWERING BANGLADESH FORWARD.</h2>
      </section>

      {modalProject && (
        <div
          className="projectModalBackdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeProjectModal();
            }
          }}
        >
          <section
            className="projectModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
          >
            <button
              className="projectModalClose"
              type="button"
              onClick={closeProjectModal}
              aria-label="Close project details"
            >
              ×
            </button>

            <div className="projectModalVisual">
              <Image
                src={modalProject.image}
                alt={modalProject.alt}
                fill
                sizes="(max-width: 820px) 100vw, 48vw"
                priority
              />
              <span className="projectReferenceBadge">
                Reference Project / Showcase
              </span>
            </div>

            <div className="projectModalContent">
              <div className="projectModalTopline">
                <div className="projectsEyebrow">Project Context</div>
                <span>{modalProject.categoryLabel}</span>
              </div>

              <h2 id="project-modal-title">{modalProject.title}</h2>
              <p className="projectModalSubtitle">{modalProject.subtitle}</p>

              <div className="projectModalNotice">
                This is a planning reference—not a published claim about a specific
                Desh Solar client installation. Verified Desh Solar projects will
                replace these reference showcases later.
              </div>

              <div className="projectModalDetails">
                <article>
                  <small>PROJECT FOCUS</small>
                  <b>{modalProject.focus}</b>
                </article>
                <article>
                  <small>SYSTEM DIRECTION</small>
                  <b>{modalProject.architecture}</b>
                </article>
                <article>
                  <small>ENGINEERING PRIORITIES</small>
                  <b>{modalProject.engineering}</b>
                </article>
              </div>

              <div className="projectModalActions">
                <Link
                  className="projectsBtn"
                  href={getSimilarSystemHref(modalProject)}
                >
                  Build a Similar System →
                </Link>
                <Link className="projectsBtn secondary" href="/engineering-lab">
                  Open Engineering Lab →
                </Link>
                <Link className="projectsBtn secondary" href="/contact">
                  Discuss a Project →
                </Link>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
