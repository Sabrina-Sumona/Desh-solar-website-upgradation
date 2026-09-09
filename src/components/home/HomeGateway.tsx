import Link from "next/link";

export default function HomeGateway() {
  return (
    <section
      className="homeGateway"
      aria-labelledby="home-gateway-title"
    >
      {/* =====================================================
          BACKGROUND
          ===================================================== */}

      <div
        className="homeGatewayBackground"
        aria-hidden="true"
      >
        <video
          className="homeGatewayVideo"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          tabIndex={-1}
        >
          <source
            src="/assets/desh-solar-energy-flow.mp4"
            type="video/mp4"
          />
        </video>

        <div className="homeGatewayVideoShade" />
        <div className="homeGatewayAmbientGlow homeGatewayAmbientGlowLeft" />
        <div className="homeGatewayAmbientGlow homeGatewayAmbientGlowRight" />
        <div className="homeGatewayNoise" />
      </div>

      {/* =====================================================
          CONTENT
          ===================================================== */}

      <div className="homeGatewayInner">
        <div className="homeGatewayContent">
          {/* -------------------------------------------------
              TOP LABEL
              ------------------------------------------------- */}

          <div className="homeGatewayEyebrow">
            DESH SOLAR
            <span aria-hidden="true">•</span>
            COMPLETE SOLAR ENERGY SOLUTIONS
          </div>

          {/* -------------------------------------------------
              MAIN TITLE
              ------------------------------------------------- */}

          <h1
            id="home-gateway-title"
            className="homeGatewayTitle"
          >
            <span className="homeGatewayTitleWhite">
              Energy designed
            </span>

            <br />

            <span className="homeGatewayTitleWhite">
              around{" "}
            </span>

            <span className="homeGatewayTitleGreen">
              the way
            </span>

            <br />

            <span className="homeGatewayTitleGreen">
              you live and work.
            </span>
          </h1>

          {/* -------------------------------------------------
              DESCRIPTION
              ------------------------------------------------- */}

          <p className="homeGatewayDescription">
            Explore solar products, understand the technology,
            plan a system and move from energy requirement to
            complete solar solution.
          </p>

          {/* -------------------------------------------------
              PRIMARY ACTIONS
              ------------------------------------------------- */}

          <div
            className="homeGatewayActions"
            aria-label="Solar planning actions"
          >
            <Link
              href="/build-your-system"
              className="homeGatewayButton homeGatewayButtonPrimary"
            >
              <span>Build Your System</span>

              <span
                className="homeGatewayButtonArrow"
                aria-hidden="true"
              >
                →
              </span>
            </Link>

            <Link
              href="/products"
              className="homeGatewayButton"
            >
              <span>Explore Products</span>

              <span
                className="homeGatewayButtonArrow"
                aria-hidden="true"
              >
                →
              </span>
            </Link>

            <Link
              href="/projects"
              className="homeGatewayButton"
            >
              <span>View Projects</span>

              <span
                className="homeGatewayButtonArrow"
                aria-hidden="true"
              >
                →
              </span>
            </Link>
          </div>

          {/* =================================================
              SOLAR CAPABILITY STRIP
              ================================================= */}

          <div
            className="homeGatewayCapabilityGrid"
            aria-label="Desh Solar capabilities"
          >
            {/* PRODUCTS */}

            <Link
              href="/products"
              className="homeGatewayCapability"
            >
              <div className="homeGatewayCapabilityLabel">
                PRODUCTS
              </div>

              <div className="homeGatewayCapabilityValue">
                Panels
                <span aria-hidden="true"> • </span>
                Inverters
                <span aria-hidden="true"> • </span>
                Batteries
                <span aria-hidden="true"> • </span>
                Systems
              </div>
            </Link>

            {/* ENGINEERING */}

            <Link
              href="/engineering-lab"
              className="homeGatewayCapability"
            >
              <div className="homeGatewayCapabilityLabel">
                ENGINEERING
              </div>

              <div className="homeGatewayCapabilityValue">
                Load
                <span aria-hidden="true"> • </span>
                Backup
                <span aria-hidden="true"> • </span>
                PV
                <span aria-hidden="true"> • </span>
                Compatibility
              </div>
            </Link>

            {/* SUPPORT */}

            <Link
              href="/customer-support"
              className="homeGatewayCapability"
            >
              <div className="homeGatewayCapabilityLabel">
                SUPPORT
              </div>

              <div className="homeGatewayCapabilityValue">
                Products
                <span aria-hidden="true"> • </span>
                Systems
                <span aria-hidden="true"> • </span>
                Warranty
                <span aria-hidden="true"> • </span>
                Installation
              </div>
            </Link>
          </div>
        </div>

        {/* ===================================================
            ENERGY JOURNEY INDICATOR
            =================================================== */}

        <div className="homeGatewayJourney">
          <span
            className="homeGatewayJourneyLine"
            aria-hidden="true"
          />

          <span className="homeGatewayJourneyText">
            EXPLORE THE ENERGY JOURNEY
          </span>

          <span
            className="homeGatewayJourneyArrow"
            aria-hidden="true"
          >
            ↓
          </span>
        </div>
      </div>
    </section>
  );
}