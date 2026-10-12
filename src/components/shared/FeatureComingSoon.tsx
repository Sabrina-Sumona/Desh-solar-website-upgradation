import Link from "next/link";

type FeatureComingSoonProps = {
  eyebrow: string;
  title: string;
  highlight: string;
  description: string;
  icon: string;
  points: [string, string, string];
};

export default function FeatureComingSoon({
  eyebrow,
  title,
  highlight,
  description,
  icon,
  points,
}: FeatureComingSoonProps) {
  return (
    <main className="featureComingSoon">
      <div className="featureComingSoonAmbient featureComingSoonAmbientOne" />
      <div className="featureComingSoonAmbient featureComingSoonAmbientTwo" />

      <section className="featureComingSoonShell">
        <div className="featureComingSoonStatus">
          <span className="featureComingSoonStatusDot" />
          <span>UNDER DEVELOPMENT</span>
        </div>

        <div className="featureComingSoonIcon" aria-hidden="true">
          {icon}
        </div>

        <div className="featureComingSoonEyebrow">{eyebrow}</div>

        <h1>
          {title}
          <br />
          <span>{highlight}</span>
        </h1>

        <p className="featureComingSoonIntro">{description}</p>

        <div className="featureComingSoonProgress" aria-label="Development progress">
          <div className="featureComingSoonProgressTop">
            <span>Development in progress</span>
            <b>Coming Soon</b>
          </div>

          <div className="featureComingSoonProgressTrack">
            <span />
          </div>
        </div>

        <div className="featureComingSoonPoints">
          {points.map((point, index) => (
            <div key={point}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{point}</p>
            </div>
          ))}
        </div>

        <div className="featureComingSoonMessage">
          <small>DESH SOLAR DIGITAL EXPERIENCE</small>
          <strong>
            We&apos;re completing the final development and testing before release.
          </strong>
          <p>
            In the meantime, you can explore our products, projects and customer
            support services.
          </p>
        </div>

        <div className="featureComingSoonActions">
          <Link className="featureComingSoonPrimary" href="/products">
            Explore Products <span>→</span>
          </Link>

          <Link className="featureComingSoonSecondary" href="/customer-support">
            Customer Support <span>→</span>
          </Link>

          <Link className="featureComingSoonTextLink" href="/">
            ← Back to Home
          </Link>
        </div>
      </section>

      <section className="featureComingSoonFooter">
        <div className="featureComingSoonCountry">BD</div>
        <small>Desh Solar • Bangladesh</small>
        <h2>POWERING BANGLADESH FORWARD.</h2>
      </section>
    </main>
  );
}
