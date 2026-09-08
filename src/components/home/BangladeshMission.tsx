import Link from "next/link";

type Region = {
  name: string;
  className: string;
};

const REGIONS: Region[] = [
  {
    name: "Panchbibi",
    className: "missionMarkerPanchbibi",
  },
  {
    name: "Joypurhat",
    className: "missionMarkerJoypurhat",
  },
  {
    name: "Sylhet",
    className: "missionMarkerSylhet",
  },
  {
    name: "Dhaka",
    className: "missionMarkerDhaka",
  },
  {
    name: "Chattogram",
    className: "missionMarkerChattogram",
  },
];

export default function BangladeshMission() {
  return (
    <section
      className="bangladeshMission"
      id="powering-bangladesh"
    >
      {/* BACKGROUND ATMOSPHERE */}

      <div className="bangladeshMissionAmbient bangladeshMissionAmbientOne" />
      <div className="bangladeshMissionAmbient bangladeshMissionAmbientTwo" />

      <div className="bangladeshMissionInner">
        {/* =================================================
            LEFT
            ================================================= */}

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
            Our clean-energy footprint reaches
            multiple parts of Bangladesh. The
            highlighted project regions include
            Panchbibi, Joypurhat, Sylhet, Dhaka
            and Chattogram.
          </p>

          <Link
            href="/projects"
            className="bangladeshMissionAction"
          >
            Explore Project Regions

            <span>
              →
            </span>
          </Link>
        </div>

        {/* =================================================
            RIGHT — MAP
            ================================================= */}

        <div className="bangladeshMissionVisual">
          <div className="bangladeshMissionMapHalo" />

          <div className="bangladeshMissionMapStage">
            {/* GLOW COPY */}

            <img
              src="/assets/maps/bangladesh.svg"
              alt=""
              aria-hidden="true"
              className="bangladeshMissionMapGlow"
            />

            {/* MAIN MAP */}

            <img
              src="/assets/maps/bangladesh.svg"
              alt="Bangladesh project regions map"
              className="bangladeshMissionMapImage"
            />

            {/* REGION MARKERS */}

            {REGIONS.map((region) => (
              <div
                key={region.name}
                className={`bangladeshMissionMarker ${region.className}`}
              >
                <span className="bangladeshMissionMarkerAura" />

                <span className="bangladeshMissionMarkerDot" />

                <span className="bangladeshMissionMarkerLabel">
                  {region.name}
                </span>
              </div>
            ))}
          </div>

          {/* MAP FOOTER */}

          <div className="bangladeshMissionRegionFooter">
            <span className="bangladeshMissionRegionLabel">
              Project Regions
            </span>

            <span className="bangladeshMissionRegionNames">
              Panchbibi
              <i>•</i>
              Joypurhat
              <i>•</i>
              Sylhet
              <i>•</i>
              Dhaka
              <i>•</i>
              Chattogram
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}