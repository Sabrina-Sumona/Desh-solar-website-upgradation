import CinematicIntro from "@/components/home/CinematicIntro";
import HomeGateway from "@/components/home/HomeGateway";
import EnergyJourney from "@/components/home/EnergyJourney";
import LiveEnergyStory from "@/components/home/LiveEnergyStory";
import SolutionCategories from "@/components/home/SolutionCategories";
import MiniSystemBuilder from "@/components/home/MiniSystemBuilder";

import "@/styles/home-cinematic.css";
import "@/styles/home-gateway.css";
import "@/styles/home-energy-journey.css";
import "@/styles/home-live-energy-story.css";
import "@/styles/home-solution-categories.css";
import "@/styles/home-mini-system-builder.css";
import FeaturedProjects from "@/components/home/FeaturedProjects";
import "@/styles/home-featured-projects.css";

export default function HomePage() {
  return (
    <>
      <CinematicIntro />

      <HomeGateway />

      <EnergyJourney />

      <LiveEnergyStory />

      <SolutionCategories />

      <MiniSystemBuilder />

      <FeaturedProjects />
    </>
  );
}