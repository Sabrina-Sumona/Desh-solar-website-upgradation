import CinematicIntro from "@/components/home/CinematicIntro";
import HomeGateway from "@/components/home/HomeGateway";
import EnergyJourney from "@/components/home/EnergyJourney";
import LiveEnergyStory from "@/components/home/LiveEnergyStory";
import MiniSystemBuilder from "@/components/home/MiniSystemBuilder";
import FeaturedProjects from "@/components/home/FeaturedProjects";
import TechnologyStack from "@/components/home/TechnologyStack";
import EngineeringLabPreview from "@/components/home/EngineeringLabPreview";
import WhyDeshSolar from "@/components/home/WhyDeshSolar";
import CustomerJourney from "@/components/home/CustomerJourney";
import BangladeshMission from "@/components/home/BangladeshMission";
import FinalHomeCTA from "@/components/home/FinalHomeCTA";
import BrandMarquee from "@/components/home/BrandMarquee";

import "@/styles/home-cinematic.css";
import "@/styles/home-gateway.css";
import "@/styles/home-energy-journey.css";
import "@/styles/home-live-energy-story.css";
import "@/styles/home-mini-system-builder.css";
import "@/styles/home-featured-projects.css";
import "@/styles/home-technology-stack.css";
import "@/styles/home-engineering-lab.css";
import "@/styles/home-why-desh-solar.css";
import "@/styles/home-customer-journey.css";
import "@/styles/home-bangladesh-mission.css";
import "@/styles/home-final-cta.css";
import "@/styles/home-brand-marquee.css";

export default function Home() {
  return (
    <main>
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
      <BrandMarquee />
      <FinalHomeCTA />
    </main>
  );
}
