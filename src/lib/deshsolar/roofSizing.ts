// Desh Solar preliminary roof-capacity model.
// The 65 sq ft / kWp and 70%/80% defaults reproduce user-observed
// reference examples; they are NOT validated site-specific design limits.
// Final roof feasibility requires actual panel dimensions, setbacks,
// racking, wind loading, fire access, waterproofing and structural review.

export const ROOF_SQ_FT_PER_KWP = 65;

export type PreliminaryRoofInput = {
  totalAreaSqFt: number;
  usablePercent: number;
  panelWatts: number;
  requiredPVKWp: number;
};

const finiteNonnegative = (value: number): number =>
  Number.isFinite(value) ? Math.max(0, value) : 0;

export function suggestedUsableRoofPercent(roofType: string): number {
  if (roofType === "Flat concrete roof") return 70;
  if (roofType === "Metal / industrial roof") return 80;
  // Conservative provisional default for ground mount/unknown geometry.
  // The customer can override this and engineering must validate it.
  return 70;
}

export function calculatePreliminaryRoof(input: PreliminaryRoofInput) {
  const totalAreaSqFt = finiteNonnegative(input.totalAreaSqFt);
  const usablePercent = Math.min(100, finiteNonnegative(input.usablePercent));
  const panelWatts = finiteNonnegative(input.panelWatts);
  const requiredPVKWp = finiteNonnegative(input.requiredPVKWp);
  const usableRoofArea = totalAreaSqFt * usablePercent / 100;
  const roofPotential = usableRoofArea / ROOF_SQ_FT_PER_KWP;

  // Use actual whole-module counts. Never round up beyond physical capacity.
  const maxPanelCount = panelWatts > 0
    ? Math.floor((roofPotential * 1000 / panelWatts) + 1e-9)
    : 0;
  const requestedPanelCount = panelWatts > 0 && requiredPVKWp > 0
    ? Math.ceil((requiredPVKWp * 1000 / panelWatts) - 1e-9)
    : 0;
  const panelCount = Math.min(maxPanelCount, requestedPanelCount);
  const installedPV = panelCount * panelWatts / 1000;
  const roofLimited = requestedPanelCount > maxPanelCount;

  return {
    totalAreaSqFt,
    usablePercent,
    usableRoofArea,
    roofPotential, // theoretical roof-limited DC capacity, before module rounding
    maxPanelCount,
    requestedPanelCount,
    panelCount,
    installedPV,
    roofLimited,
  };
}
