import type { Metadata } from "next";
import ProjectsPageClient from "@/components/projects/ProjectsPageClient";
import "@/styles/projects.css";

export const metadata: Metadata = {
  title: "Projects | Desh Solar",
  description:
    "Explore Desh Solar project types across residential, commercial, industrial, agricultural and off-grid solar applications.",
};

export default function ProjectsPage() {
  return <ProjectsPageClient />;
}
