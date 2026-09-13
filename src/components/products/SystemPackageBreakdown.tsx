import type { Product } from "@/data/products";
import { getCustomerSystemPackageProfile } from "@/lib/products/systemPackage";

import styles from "./SystemPackageBreakdown.module.css";

type SystemPackageBreakdownProps = {
  product: Product;
};

export default function SystemPackageBreakdown({
  product,
}: SystemPackageBreakdownProps) {
  const profile = getCustomerSystemPackageProfile(product);

  if (!profile) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.shell}>
        <div className={styles.heading}>
          <div>
            <span className={styles.eyebrow}>
              {profile.isPump
                ? "YOUR SOLAR PUMP PACKAGE"
                : "YOUR COMPLETE SOLAR SYSTEM"}
            </span>

            <h2>{profile.title}</h2>
          </div>

          <p>{profile.intro}</p>
        </div>

        <div className={styles.factGrid}>
          {profile.facts.map((fact) => (
            <article key={fact.label}>
              <small>{fact.label}</small>
              <b>{fact.value}</b>
            </article>
          ))}
        </div>

        <div className={styles.componentGrid}>
          {profile.components.map((component) => (
            <article
              className={styles.componentCard}
              key={component.key}
            >
              <span className={styles.componentNumber}>
                {component.number}
              </span>

              <h3>{component.title}</h3>
              <strong>{component.value}</strong>
              <p>{component.description}</p>
            </article>
          ))}
        </div>

        <div className={styles.beforePanel}>
          <div>
            <small>BEFORE INSTALLATION</small>
            <h3>We finalize the system for your actual site.</h3>
          </div>

          <div className={styles.beforeList}>
            {profile.beforeInstallation.map((item, index) => (
              <div key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.note}>
          Final component models and quantities may vary based on system
          design, site conditions and product availability.
        </div>
      </div>
    </section>
  );
}
