import CinematicIntro from "@/components/home/CinematicIntro";
import HomeGateway from "@/components/home/HomeGateway";
import EnergyJourney from "@/components/home/EnergyJourney";
import LiveEnergyStory from "@/components/home/LiveEnergyStory";

import "@/styles/home-cinematic.css";
import "@/styles/home-gateway.css";
import "@/styles/home-energy-journey.css";
import "@/styles/home-live-energy-story.css";

export default function HomePage() {
  return (
    <>
      <CinematicIntro />

      <HomeGateway />

      <EnergyJourney />

      <LiveEnergyStory />
    </>
  );
}