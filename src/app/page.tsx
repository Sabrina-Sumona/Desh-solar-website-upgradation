import CinematicIntro from "@/components/home/CinematicIntro";
import HomeGateway from "@/components/home/HomeGateway";

import "@/styles/home-cinematic.css";
import "@/styles/home-gateway.css";

export default function HomePage() {
  return (
    <>
      <CinematicIntro />

      <HomeGateway />
    </>
  );
}