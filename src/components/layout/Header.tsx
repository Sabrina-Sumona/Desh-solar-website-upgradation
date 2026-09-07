"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Temporary until we build the global Zustand cart.
  const cartCount = 0;

  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;

    const handleResize = () => {
      if (window.innerWidth > 1050) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="siteHeader">
        <nav className="nav">
          <Link
            href="/"
            className="brand"
            aria-label="Desh Solar Home"
          >
            <Image
              src="/assets/desh-solar-logo.png"
              alt="Desh Solar"
              width={1195}
              height={236}
              priority
              className="brandLogoImage"
            />
          </Link>

          <div className="navLinks">
            <div className="navMegaWrap">
              <Link href="/products" className="navItem">
                Products
              </Link>

              <div className="navMegaPanel">
                <div className="megaGrid">
                  <div className="megaGroup">
                    <div className="megaLabel">
                      Product ecosystem
                    </div>

                    <div className="megaLinks">
                      <Link href="/products?category=panel">
                        <i>☀</i>
                        <span>Solar Panels</span>
                      </Link>

                      <Link href="/products?category=inverter">
                        <i>↯</i>
                        <span>Hybrid Inverters</span>
                      </Link>

                      <Link href="/products?category=battery">
                        <i>▣</i>
                        <span>Lithium Batteries</span>
                      </Link>

                      <Link href="/products">
                        <i>⌂</i>
                        <span>IPS / Backup</span>
                      </Link>

                      <Link href="/products">
                        <i>⌁</i>
                        <span>Controllers &amp; BOS</span>
                      </Link>

                      <Link href="/products#catalog">
                        <i>◇</i>
                        <span>All Products</span>
                      </Link>
                    </div>
                  </div>

                  <div className="megaFeature">
                    <small>Don&apos;t start with hardware</small>

                    <h4>
                      Build the system around your actual load.
                    </h4>

                    <p>
                      Select appliances, backup time and energy
                      goals before matching equipment.
                    </p>

                    <Link href="/build-your-system">
                      Open System Builder →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <Link href="/projects" className="navItem">
              Projects
            </Link>

            <Link
              href="/tools-and-technology"
              className="navItem"
            >
              Tools and Technology
            </Link>

            <Link href="/about" className="navItem">
              About Us
            </Link>

            <Link href="/contact" className="navItem">
              Contact Us
            </Link>

            <Link
              href="/customer-support"
              className="navItem"
            >
              Customer Support
            </Link>

            <Link
              href="/build-your-system"
              className="navCta"
            >
              Build Your System
            </Link>

            <Link href="/cart" className="navCart">
              <span className="navCartIcon">🛒</span>
              <span>Cart</span>

              <span className="cartCount">
                {cartCount}
              </span>
            </Link>
          </div>

          <button
            type="button"
            className={`navToggle ${
              mobileOpen ? "active" : ""
            }`}
            aria-label={
              mobileOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={mobileOpen}
            aria-controls="mobileMenu"
            onClick={() => setMobileOpen((current) => !current)}
          >
            <span />
            <span />
            <span />
          </button>
        </nav>
      </header>

      <div
        id="mobileMenu"
        className={`mobileMenu ${
          mobileOpen ? "open" : ""
        }`}
      >
        <Link href="/products">Products</Link>

        <Link href="/projects">Projects</Link>

        <Link href="/tools-and-technology">
          Tools and Technology
        </Link>

        <Link href="/about">About Us</Link>

        <Link href="/contact">Contact Us</Link>

        <Link href="/customer-support">
          Customer Support
        </Link>

        <Link href="/cart" className="mobileCartLink">
          Cart
          <span className="cartCount">
            {cartCount}
          </span>
        </Link>

        <Link
          href="/build-your-system"
          className="mobileCta"
        >
          Build Your System
        </Link>
      </div>
    </>
  );
}