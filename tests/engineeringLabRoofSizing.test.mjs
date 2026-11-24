import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { calculatePreliminaryRoof, suggestedUsableRoofPercent } from "../src/lib/deshsolar/roofSizing.ts";

// Screenshot-derived exact outputs: common module shared with Build Your System.
const examples = [
  ["Flat concrete roof", 500, "5.4"],
  ["Flat concrete roof", 1000, "10.8"],
  ["Flat concrete roof", 1500, "16.2"],
  ["Flat concrete roof", 2000, "21.5"],
  ["Flat concrete roof", 3000, "32.3"],
  ["Metal / industrial roof", 500, "6.2"],
  ["Metal / industrial roof", 1000, "12.3"],
  ["Metal / industrial roof", 1500, "18.5"],
  ["Metal / industrial roof", 2000, "24.6"],
  ["Metal / industrial roof", 3000, "36.9"],
];
for (const [type, totalAreaSqFt, expected] of examples) {
  const result = calculatePreliminaryRoof({
    totalAreaSqFt,
    usablePercent: suggestedUsableRoofPercent(type),
    panelWatts: 590,
    requiredPVKWp: 0,
  });
  assert.equal(result.roofPotential.toFixed(1), expected, `${type} ${totalAreaSqFt} sq ft`);
  assert.ok(result.maxPanelCount * 590 / 1000 <= result.roofPotential + 1e-8);
}

// Length × width entry must give the same result as equivalent entered area.
const dimensions = calculatePreliminaryRoof({
  totalAreaSqFt: 56 * 66,
  usablePercent: 80,
  panelWatts: 590,
  requiredPVKWp: 0,
});
assert.equal(dimensions.roofPotential.toFixed(1), "45.5");

// Zero area must never produce imaginary panel capacity.
for (const area of [0, 1, 10]) {
  const r = calculatePreliminaryRoof({ totalAreaSqFt: area, usablePercent: 70, panelWatts: 590, requiredPVKWp: 0 });
  assert.equal(r.maxPanelCount, 0);
}

// PV roof capacity must not vary with module wattage; whole-module counts can.
const roof590 = calculatePreliminaryRoof({ totalAreaSqFt: 1500, usablePercent: 70, panelWatts: 590, requiredPVKWp: 0 });
const roof715 = calculatePreliminaryRoof({ totalAreaSqFt: 1500, usablePercent: 70, panelWatts: 715, requiredPVKWp: 0 });
assert.equal(roof590.roofPotential, roof715.roofPotential);
assert.notEqual(roof590.maxPanelCount, roof715.maxPanelCount);

// Guard against replacing the new UI with the former 30-sq-ft-per-panel model.
const lab = readFileSync(new URL("../src/components/engineering-lab/EngineeringLabClient.tsx", import.meta.url), "utf8");
assert.match(lab, /import \{ calculatePreliminaryRoof, suggestedUsableRoofPercent \}/);
assert.match(lab, /id="roofType"/);
assert.match(lab, /id="roofMode"/);
assert.match(lab, /id="roofUsablePercent"/);
assert.match(lab, /requiredPVKWp: 0/);
assert.match(lab, /estimate\.roofPotential\.toFixed\(1\)/);
assert.doesNotMatch(lab, /id="roofSpace"/);
console.log("PASS: Engineering Lab roof calculator uses the shared sizing model and matches all 10 examples");
