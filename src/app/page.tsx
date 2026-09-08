import CinematicIntro from "@/components/home/CinematicIntro";
import HomeGateway from "@/components/home/HomeGateway";
import EnergyJourney from "@/components/home/EnergyJourney";
import LiveEnergyStory from "@/components/home/LiveEnergyStory";
import MiniSystemBuilder from "@/components/home/MiniSystemBuilder";

import "@/styles/home-cinematic.css";
import "@/styles/home-gateway.css";
import "@/styles/home-energy-journey.css";
import "@/styles/home-live-energy-story.css";
import "@/styles/home-mini-system-builder.css";
import FeaturedProjects from "@/components/home/FeaturedProjects";
import "@/styles/home-featured-projects.css";
import TechnologyStack from "@/components/home/TechnologyStack";
import "@/styles/home-technology-stack.css";
import EngineeringLabPreview from "@/components/home/EngineeringLabPreview";
import "@/styles/home-engineering-lab.css";
import WhyDeshSolar from "@/components/home/WhyDeshSolar";
import "@/styles/home-why-desh-solar.css";
import CustomerJourney from "@/components/home/CustomerJourney";
import "@/styles/home-customer-journey.css";
import BangladeshMission from "@/components/home/BangladeshMission";
import "@/styles/home-bangladesh-mission.css";

export default function HomePage() {
  return (
    <>
      <CinematicIntro />

      <HomeGateway />

      <EnergyJourney />

      <LiveEnergyStory />

      <MiniSystemBuilder />

      <FeaturedProjects />

      <TechnologyStack />

      <EngineeringLabPreview />

      <WhyDeshSolar />

      <CustomerJourney />

      <BangladeshMission />
    </>
  );
}