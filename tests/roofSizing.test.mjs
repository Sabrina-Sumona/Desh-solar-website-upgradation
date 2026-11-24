import assert from "node:assert/strict";
import { calculatePreliminaryRoof, suggestedUsableRoofPercent } from "../src/lib/deshsolar/roofSizing.ts";

// Reference screenshots: roof type, gross area, usable area and capacity.
const examples = [
  ["Flat concrete roof", 500, 350, 5.4],
  ["Flat concrete roof", 1000, 700, 10.8],
  ["Flat concrete roof", 1500, 1050, 16.2],
  ["Flat concrete roof", 2000, 1400, 21.5],
  ["Flat concrete roof", 3000, 2100, 32.3],
  ["Metal / industrial roof", 500, 400, 6.2],
  ["Metal / industrial roof", 1500, 1200, 18.5],
  ["Metal / industrial roof", 56 * 66, 2956.8, 45.5],
];

for (const [roofType, totalAreaSqFt, expectedUsable, expectedKWp] of examples) {
  const result = calculatePreliminaryRoof({
    totalAreaSqFt,
    usablePercent: suggestedUsableRoofPercent(roofType),
    requiredPVKWp: 1000,
    panelWatts: 590,
  });
  assert.ok(Math.abs(result.usableRoofArea - expectedUsable) < 0.01, `${roofType} ${totalAreaSqFt} usable`);
  assert.equal(Number(result.roofPotential.toFixed(1)), expectedKWp, `${roofType} ${totalAreaSqFt} kWp`);
  assert.ok(result.installedPV <= result.roofPotential + 1e-8, "physical cap respected");
}

// No usable installation area -> absolutely no recommended panels.
for (const area of [0, 1, 10, 20]) {
  const r = calculatePreliminaryRoof({ totalAreaSqFt: area, usablePercent: 70, panelWatts: 590, requiredPVKWp: 8 });
  assert.equal(r.panelCount, 0, `very small area ${area} does not fit one panel`);
  assert.equal(r.installedPV, 0);
}

// Capacity recommendation should follow customer energy need, not fill the roof automatically.
const sized = calculatePreliminaryRoof({ totalAreaSqFt: 3000, usablePercent: 70, panelWatts: 590, requiredPVKWp: 3.6 });
assert.equal(sized.panelCount, 7);
assert.ok(!sized.roofLimited);

const limited = calculatePreliminaryRoof({ totalAreaSqFt: 500, usablePercent: 70, panelWatts: 590, requiredPVKWp: 12 });
assert.equal(limited.panelCount, 9);
assert.ok(limited.roofLimited);

// User-editable usability overrides defaults.
const custom = calculatePreliminaryRoof({ totalAreaSqFt: 1000, usablePercent: 50, panelWatts: 590, requiredPVKWp: 100 });
assert.equal(custom.usableRoofArea, 500);
assert.ok(custom.installedPV <= custom.roofPotential);

// Invalid data must not yield NaN or fictitious capacities.
const invalid = calculatePreliminaryRoof({ totalAreaSqFt: Number.NaN, usablePercent: 150, panelWatts: 590, requiredPVKWp: -5 });
assert.equal(invalid.panelCount, 0);
assert.equal(invalid.roofPotential, 0);

// The primary ROOF CAPACITY DISPLAY must match all concrete and tin-shed
// screenshots. This is different from energy-sized/whole-panel recommendations.
const exactDisplayCases = [
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
for (const [roofType, area, expected] of exactDisplayCases) {
  const roof = calculatePreliminaryRoof({
    totalAreaSqFt: area,
    usablePercent: suggestedUsableRoofPercent(roofType),
    requiredPVKWp: 0, // Must not affect the roof's capacity.
    panelWatts: 590,
  });
  assert.equal((Math.round(roof.roofPotential * 10) / 10).toFixed(1), expected,
    `${roofType}: ${area} sq ft -> ${expected} kWp`);
}
console.log("PASS: all 10 exact reference roof-capacity displays");

console.log(`PASS: ${examples.length} reference roof scenarios + 8 sizing/safety checks`);
