import Link from "next/link";

export default function HomeGateway() {
  return (
    <main className="homeGatewayPage">
      {/* ==================================================
          SECONDARY CINEMATIC GATEWAY HERO
          ================================================== */}

      <section
        className="homeHero"
        id="home-hero"
      >
        <video
          autoPlay
          className="homeHeroVideo"
          loop
          muted
          playsInline
          poster="/assets/projects-real/residential.webp"
        >
          <source
            src="/assets/desh-solar-energy-flow.mp4"
            type="video/mp4"
          />
        </video>

        <div className="homeHeroShade" />

        <div className="homeHeroContent">
          <div className="homeHeroEyebrow">
            DESH SOLAR • COMPLETE SOLAR ENERGY SOLUTIONS
          </div>

          <h1>
            Energy designed around{" "}
            <span>
              the way you live and work.
            </span>
          </h1>

          <p>
            Explore solar products,
            understand the technology,
            plan a system and move from
            energy requirement to
            complete solar solution.
          </p>

          <div className="homeHeroActions">
            <Link
              href="/build-your-system"
              className="homePrimaryBtn"
            >
              Build Your System →
            </Link>

            <Link
              href="/products"
              className="homeSecondaryBtn"
            >
              Explore Products →
            </Link>

            <Link
              href="/projects"
              className="homeSecondaryBtn"
            >
              View Projects →
            </Link>
          </div>

          <div className="homeHeroMeta">
            <div>
              <small>PRODUCTS</small>

              <b>
                Panels • Inverters •
                Batteries • Systems
              </b>
            </div>

            <div>
              <small>ENGINEERING</small>

              <b>
                Load • Backup • PV •
                Compatibility
              </b>
            </div>

            <div>
              <small>SUPPORT</small>

              <b>
                Products • Systems •
                Warranty • Installation
              </b>
            </div>
          </div>
        </div>

        <div className="homeScrollHint">
          <span />

          <b>
            EXPLORE THE ENERGY JOURNEY
          </b>
        </div>
      </section>

      {/* ==================================================
          WHAT ARE YOU LOOKING FOR?
          ================================================== */}

      <section
        className="homeRouteSection"
        id="home-routes"
      >
        <div className="homeSectionIntro compact">
          <div>
            <div className="homeEyebrow">
              What Are You Looking For?
            </div>

            <h2>
              Start from your goal.
            </h2>
          </div>
        </div>

        <div className="homeRouteGrid">
          <Link href="/products">
            <span>01</span>

            <b>
              Buy Solar Products
            </b>

            <small>
              Browse panels, inverters,
              batteries and systems.
            </small>
          </Link>

          <Link href="/build-your-system">
            <span>02</span>

            <b>
              Build a Solar System
            </b>

            <small>
              Start from property,
              appliances, backup and roof.
            </small>
          </Link>

          <Link href="/projects">
            <span>03</span>

            <b>
              Explore Projects
            </b>

            <small>
              See realistic residential,
              commercial and industrial
              applications.
            </small>
          </Link>

          <Link href="/tools-and-technology">
            <span>04</span>

            <b>
              Engineering Tools
            </b>

            <small>
              Generation, battery,
              inverter, roof and
              compatibility tools.
            </small>
          </Link>

          <Link href="/customer-support">
            <span>05</span>

            <b>
              Technical Support
            </b>

            <small>
              Structured product, system,
              warranty and installation
              assistance.
            </small>
          </Link>

          <Link href="/contact">
            <span>06</span>

            <b>
              Talk to Desh Solar
            </b>

            <small>
              Project consultation,
              product inquiry or showroom
              visit.
            </small>
          </Link>
        </div>
      </section>
    </main>
  );
}