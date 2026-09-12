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
              aria-label="Desh Solar social media and messaging"
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

              <a
                href="https://wa.me/8801754477488"
                target="_blank"
                rel="noreferrer"
                aria-label="Chat with Desh Solar on WhatsApp"
                className="socialWhatsapp"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M20.52 3.48A11.82 11.82 0 0 0 12.08 0C5.5 0 .15 5.35.15 11.93c0 2.1.55 4.15 1.59 5.95L.05 24l6.28-1.65a11.9 11.9 0 0 0 5.74 1.46h.01c6.58 0 11.93-5.35 11.93-11.93 0-3.19-1.24-6.18-3.49-8.4ZM12.08 21.8h-.01a9.88 9.88 0 0 1-5.03-1.38l-.36-.21-3.73.98 1-3.64-.23-.37a9.88 9.88 0 0 1-1.52-5.25c0-5.46 4.44-9.9 9.9-9.9a9.82 9.82 0 0 1 7 2.9 9.83 9.83 0 0 1 2.9 7c-.01 5.45-4.45 9.87-9.92 9.87Zm5.43-7.41c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47a8.92 8.92 0 0 1-1.65-2.05c-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.21 5.09 4.5.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.08 1.76-.72 2.01-1.41.25-.69.25-1.28.17-1.41-.07-.12-.27-.2-.57-.35Z" />
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
