import Image from "next/image";
import Link from "next/link";
import FloatingActions from "./FloatingActions";

export default function Footer() {
  return (
    <>
      <footer className="footer">
      {/* ================================================
          BRAND
          ================================================ */}

      <div className="footerBrand">
        <div className="footerBrandFrame">
          <Link
            href="/"
            className="footerLogo"
            aria-label="Desh Solar home"
          >
            <Image
              src="/assets/desh-solar-logo.png"
              alt="Desh Solar"
              width={1195}
              height={236}
              className="brandLogoImage"
              sizes="(max-width: 420px) 205px, (max-width: 720px) 220px, 260px"
            />
          </Link>

          <p>
            Reliable solar products and complete energy
            solutions for homes, businesses, industries and
            projects across Bangladesh.
          </p>

          <div className="footerServicePromise">
            <span aria-hidden="true" />

            <strong>
              For us, reliable service comes before business.
            </strong>
          </div>
        </div>
      </div>

      {/* ================================================
          QUICK LINKS
          ================================================ */}

      <div className="footerQuickLinks">
        <h4>Quick Links</h4>

        <div className="footerQuickLinksList">
          <Link href="/about">
            About Us
          </Link>

          <Link href="/contact">
            Contact Us
          </Link>

          <Link href="/faq">
            FAQ
          </Link>

          <Link href="/customer-support">
            Customer Support
          </Link>
        </div>
      </div>

      {/* ================================================
          HEAD OFFICE
          ================================================ */}

      <div className="footerContact">
        <h4>Head Office</h4>

        <p>
          Navana Zohura Square, Ground Floor, Bangla Motor,
          Dhaka-1205, Bangladesh
        </p>

        <div className="footerMap">
          <iframe
            title="Desh Solar Head Office map"
            src="https://www.google.com/maps?q=Navana%20Zohura%20Square%2C%20Ground%20Floor%2C%20Bangla%20Motor%2C%20Dhaka-1205%2C%20Bangladesh&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>

        <div className="footerContactMeta">
          <a
            href="tel:01754477488"
            className="footerPhone"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M6.62 10.79a15.46 15.46 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.49a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.19 2.2Z" />
            </svg>

            <span>
              01754-477488
            </span>
          </a>

          <div
            className="socialLinks footerContactSocials"
            aria-label="Desh Solar social media"
          >
            <a
              href="https://www.facebook.com/deshsolar71"
              target="_blank"
              rel="noreferrer"
              aria-label="Desh Solar on Facebook"
              className="socialFacebook"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M13.5 22v-9h3l.5-3.5h-3.5V7.25c0-1 .28-1.75 1.8-1.75H17V2.38c-.3-.04-1.35-.13-2.58-.13-2.55 0-4.3 1.55-4.3 4.42V9.5H7.25V13h2.87v9h3.38Z" />
              </svg>
            </a>

            <a
              href="https://www.linkedin.com/deshsolar71"
              target="_blank"
              rel="noreferrer"
              aria-label="Desh Solar on LinkedIn"
              className="socialLinkedin"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M5.34 7.31A2.31 2.31 0 1 0 5.34 2.7a2.31 2.31 0 0 0 0 4.62ZM3.35 21h3.98V9H3.35v12Zm6.46 0h3.98v-6.69c0-1.76.33-3.47 2.52-3.47 2.16 0 2.19 2.02 2.19 3.58V21h3.98v-7.42c0-3.65-.79-6.46-5.05-6.46-2.05 0-3.42 1.12-3.98 2.18h-.05V9H9.81v12Z" />
              </svg>
            </a>

            <a
              href="https://www.youtube.com/@DeshSolar71"
              target="_blank"
              rel="noreferrer"
              aria-label="Desh Solar on YouTube"
              className="socialYoutube"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M23.5 6.19a3.02 3.02 0 0 0-2.13-2.14C19.49 3.54 12 3.54 12 3.54s-7.49 0-9.37.51A3.02 3.02 0 0 0 .5 6.19 31.46 31.46 0 0 0 0 12a31.46 31.46 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.13 2.14c1.88.51 9.37.51 9.37.51s7.49 0 9.37-.51a3.02 3.02 0 0 0 2.13-2.14A31.46 31.46 0 0 0 24 12a31.46 31.46 0 0 0-.5-5.81ZM9.6 15.62V8.38L15.82 12 9.6 15.62Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* ================================================
          COPYRIGHT
          ================================================ */}

        <div className="copyright">
          © 2026 Desh Solar. All rights reserved. Website by
          GAMEViZ.
        </div>
      </footer>

      <FloatingActions />
    </>
  );
}
