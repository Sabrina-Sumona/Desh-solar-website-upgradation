"use client";

import Link from "next/link";
import {
  useMemo,
  useState,
} from "react";

export default function EngineeringLabPreview() {
  const [systemSize, setSystemSize] =
    useState(5);

  const estimate = useMemo(() => {
    const peakSunHours = 4.5;
    const systemEfficiency = 0.82;

    const daily =
      systemSize *
      peakSunHours *
      systemEfficiency;

    const monthly =
      daily * 30;

    return {
      daily:
        Math.round(
          daily * 10
        ) / 10,

      monthly:
        Math.round(
          monthly
        ),
    };
  }, [systemSize]);

  return (
    <section
      className="engineeringLabPreview"
      id="engineering-lab-preview"
    >
      <div className="engineeringLabGlow" />

      <div className="engineeringLabInner">
        {/* ================================================
            HEADER
            ================================================ */}

        <div className="engineeringLabHeader">
          <div>
            <div className="engineeringLabEyebrow">
              Engineering Lab
            </div>

            <h2>
              Explore the numbers
              <br />

              <span>
                behind solar.
              </span>
            </h2>
          </div>

          <div className="engineeringLabHeaderCopy">
            <p>
              Try a quick solar generation
              preview, then continue to the
              full engineering tools for
              detailed planning.
            </p>

            <Link href="/tools-and-technology">
              Open Engineering Lab

              <span aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </div>

        {/* ================================================
            MAIN CARD
            ================================================ */}

        <div className="engineeringLabCard">
          {/* ==============================================
              CONTROL
              ============================================== */}

          <div className="engineeringLabControl">
            <div className="engineeringLabControlTop">
              <div>
                <small>
                  SOLAR SYSTEM SIZE
                </small>

                <strong>
                  {systemSize}

                  <span>
                    {" "}kW
                  </span>
                </strong>
              </div>

              <div
                className="engineeringLabSun"
                aria-hidden="true"
              >
                ☀
              </div>
            </div>

            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={systemSize}
              aria-label="Solar system size"
              onChange={(event) =>
                setSystemSize(
                  Number(
                    event.target.value
                  )
                )
              }
            />

            <div className="engineeringLabRangeLabels">
              <span>1 kW</span>
              <span>10 kW</span>
              <span>25 kW</span>
              <span>50 kW</span>
            </div>
          </div>

          {/* ==============================================
              RESULTS
              ============================================== */}

          <div className="engineeringLabResults">
            <div>
              <small>
                EST. DAILY GENERATION
              </small>

              <strong>
                {estimate.daily}

                <span>
                  {" "}kWh
                </span>
              </strong>
            </div>

            <div>
              <small>
                EST. MONTHLY GENERATION
              </small>

              <strong>
                {estimate.monthly}

                <span>
                  {" "}kWh
                </span>
              </strong>
            </div>
          </div>

          {/* ==============================================
              FORMULA
              ============================================== */}

          <div className="engineeringLabFlow">
            <span>
              {systemSize} kW
            </span>

            <b>×</b>

            <span>
              4.5 Sun Hours
            </span>

            <b>×</b>

            <span>
              82% Efficiency
            </span>

            <b>→</b>

            <span className="engineeringLabFlowResult">
              {estimate.daily} kWh/day
            </span>
          </div>

          {/* ==============================================
              FOOTER
              ============================================== */}

          <div className="engineeringLabFooter">
            <p>
              Simplified planning estimate
              only. Actual generation varies
              with location, shading,
              orientation, weather,
              equipment and system design.
            </p>

            <Link href="/tools-and-technology">
              Explore Engineering Tools

              <span aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}