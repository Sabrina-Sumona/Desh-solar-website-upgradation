import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      {/* =====================================================
          COLUMN 1 — BRAND
          ===================================================== */}

      <div className="footerBrand">
        <Link
          href="/"
          className="brand footerLogo"
          aria-label="Desh Solar Home"
        >
          <Image
            src="/assets/desh-solar-logo.png"
            alt="Desh Solar"
            width={260}
            height={64}
            className="brandLogoImage"
            sizes="260px"
          />
        </Link>

        <p>
          Desh Solar provides reliable renewable-energy
          products and complete solar power solutions for
          homes, businesses, industries, factories,
          irrigation projects and commercial facilities
          across Bangladesh.
        </p>
      </div>

      {/* =====================================================
          COLUMN 2 — QUICK LINKS + SOCIAL
          ===================================================== */}

      <div className="footerQuickLinks">
        <h4>Quick Links</h4>

        <Link href="/about">
          About Us
        </Link>

        <Link href="/contact">
          Contact Us
        </Link>

        <Link href="/faq">
          FAQ
        </Link>

        <h4 className="footerSocialHeading">
          Social Media
        </h4>

        <div
          className="socialLinks"
          aria-label="Desh Solar social media"
        >
          {/* FACEBOOK */}

          <a
            href="https://www.facebook.com/deshsolar71"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Desh Solar on Facebook"
            title="Facebook"
            className="socialFacebook"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M13.5 22v-9h3l.5-3h-3.5V8.1c0-.9.3-1.6 1.7-1.6H17V3.8c-.3 0-1.4-.1-2.6-.1-2.6 0-4.4 1.6-4.4 4.5V10H7v3h3v9h3.5z" />
            </svg>
          </a>

          {/* LINKEDIN */}

          <a
            href="https://www.linkedin.com/deshsolar71"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Desh Solar on LinkedIn"
            title="LinkedIn"
            className="socialLinkedin"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M5.3 7.8H2.2V22h3.1V7.8zM3.8 2A1.8 1.8 0 1 0 3.8 5.6 1.8 1.8 0 0 0 3.8 2zM22 13.8c0-4.3-2.3-6.3-5.4-6.3-2.5 0-3.6 1.4-4.2 2.3v-2H9.3V22h3.1v-7c0-1.8.3-3.6 2.6-3.6 2.2 0 2.3 2.1 2.3 3.7V22H22v-8.2z" />
            </svg>
          </a>

          {/* YOUTUBE */}

          <a
            href="https://www.youtube.com/@DeshSolar71"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Desh Solar on YouTube"
            title="YouTube"
            className="socialYoutube"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4L15.8 12l-6.2 3.6z" />
            </svg>
          </a>
        </div>
      </div>

      {/* =====================================================
          COLUMN 3 — HEAD OFFICE + MAP
          ===================================================== */}

      <div className="footerContact">
        <h4>Head Office</h4>

        <p>
          Navana Zohura Square, Ground Floor,
          Bangla Motor, Dhaka-1205, Bangladesh
        </p>

        <div className="footerMap">
          <iframe
            src="https://www.google.com/maps?q=Navana+Zohura+Square,+Ground+Floor,+Bangla+Motor,+Dhaka-1205,+Bangladesh&output=embed"
            title="Desh Solar Head Office"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      {/* =====================================================
          COPYRIGHT
          ===================================================== */}

      <div className="copyright">
        © 2026 Desh Solar. All rights reserved. Website by GAMEViZ.
      </div>
    </footer>
  );
}