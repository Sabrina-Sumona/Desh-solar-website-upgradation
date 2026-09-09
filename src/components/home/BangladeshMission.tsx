import Image from "next/image";
import Link from "next/link";

type ProjectSpot = {
  id: string;
  className: string;
};

/*
 * Project-region visualization.
 *
 * These points are intentionally presented as
 * unlabeled project-region highlights.
 *
 * The distribution follows the approved visual
 * reference rather than displaying city labels.
 */
const PROJECT_SPOTS: ProjectSpot[] = [
  {
    id: "spot-01",
    className: "missionSpot01",
  },
  {
    id: "spot-02",
    className: "missionSpot02",
  },
  {
    id: "spot-03",
    className: "missionSpot03",
  },
  {
    id: "spot-04",
    className: "missionSpot04",
  },
  {
    id: "spot-05",
    className: "missionSpot05",
  },
  {
    id: "spot-06",
    className: "missionSpot06",
  },
  {
    id: "spot-07",
    className: "missionSpot07",
  },
  {
    id: "spot-08",
    className: "missionSpot08",
  },
  {
    id: "spot-09",
    className: "missionSpot09",
  },
  {
    id: "spot-10",
    className: "missionSpot10",
  },
  {
    id: "spot-11",
    className: "missionSpot11",
  },
  {
    id: "spot-12",
    className: "missionSpot12",
  },
  {
    id: "spot-13",
    className: "missionSpot13",
  },
  {
    id: "spot-14",
    className: "missionSpot14",
  },
  {
    id: "spot-15",
    className: "missionSpot15",
  },
  {
    id: "spot-16",
    className: "missionSpot16",
  },
  {
    id: "spot-17",
    className: "missionSpot17",
  },
  {
    id: "spot-18",
    className: "missionSpot18",
  },
];

export default function BangladeshMission() {
  return (
    <section
      className="bangladeshMission"
      id="powering-bangladesh"
    >
      {/* ================================================
          BACKGROUND ATMOSPHERE
          ================================================ */}

      <div className="bangladeshMissionAmbient bangladeshMissionAmbientOne" />

      <div className="bangladeshMissionAmbient bangladeshMissionAmbientTwo" />

      <div className="bangladeshMissionInner">
        {/* ================================================
            LEFT CONTENT
            ================================================ */}

        <div className="bangladeshMissionContent">
          <div className="bangladeshMissionEyebrow">
            The Bigger Picture
          </div>

          <h2 className="bangladeshMissionTitle">
            <span className="bangladeshMissionTitleWhite">
              POWERING
            </span>

            <span className="bangladeshMissionTitleGreen">
              BANGLADESH
            </span>

            <span className="bangladeshMissionTitleWhite">
              FORWARD.
            </span>
          </h2>

          <p className="bangladeshMissionDescription">
            Our clean-energy footprint reaches all
            over Bangladesh. The highlighted spots
            are our project regions.
          </p>

          <Link
            href="/projects"
            className="bangladeshMissionAction"
          >
            Explore Project Regions

            <span aria-hidden="true">
              →
            </span>
          </Link>
        </div>

        {/* ================================================
            RIGHT — MAP
            ================================================ */}

        <div className="bangladeshMissionVisual">
          <div className="bangladeshMissionMapHalo" />

          <div className="bangladeshMissionMapStage">
            {/* Decorative glow copy */}

            <Image
              src="/assets/maps/bangladesh.svg"
              alt=""
              aria-hidden="true"
              fill
              unoptimized
              className="bangladeshMissionMapGlow"
              sizes="(max-width: 720px) 88vw, (max-width: 950px) 78vw, (max-width: 1200px) 480px, 570px"
            />

            {/* Main map */}

            <Image
              src="/assets/maps/bangladesh.svg"
              alt="Bangladesh map with highlighted Desh Solar project regions"
              fill
              unoptimized
              className="bangladeshMissionMapImage"
              sizes="(max-width: 720px) 88vw, (max-width: 950px) 78vw, (max-width: 1200px) 480px, 570px"
            />

            {/* Project-region dots */}

            {PROJECT_SPOTS.map(
              (spot, index) => (
                <div
                  key={spot.id}
                  className={`bangladeshMissionMarker ${spot.className}`}
                  style={
                    {
                      "--mission-delay": `${(
                        index * 0.17
                      ).toFixed(2)}s`,
                    } as React.CSSProperties
                  }
                  aria-hidden="true"
                >
                  <span className="bangladeshMissionMarkerPulse" />

                  <span className="bangladeshMissionMarkerAura" />

                  <span className="bangladeshMissionMarkerDot" />
                </div>
              )
            )}
          </div>

          {/* ================================================
              MAP FOOTER
              ================================================ */}

          <div className="bangladeshMissionRegionFooter">
            <span className="bangladeshMissionRegionLine" />

            <span className="bangladeshMissionRegionLabel">
              Project Regions
            </span>

            <span className="bangladeshMissionRegionText">
              Highlighted across Bangladesh
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}