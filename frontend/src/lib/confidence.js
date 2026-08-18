// Single source of truth for confidence band thresholds.
// green > 85%, amber 60-85%, red < 60% (per Phase 2 spec).

export function getConfidenceBand(confidence) {
  const pct = confidence <= 1 ? confidence * 100 : confidence;
  if (pct > 85) return "high";
  if (pct >= 60) return "medium";
  return "low";
}

export const CONFIDENCE_STYLES = {
  high: {
    badge: "bg-emerald-100 text-emerald-700",
    bar: "bg-emerald-500",
    dot: "bg-emerald-500",
  },
  medium: {
    badge: "bg-amber-100 text-amber-700",
    bar: "bg-amber-500",
    dot: "bg-amber-500",
  },
  low: {
    badge: "bg-red-100 text-red-700",
    bar: "bg-red-500",
    dot: "bg-red-500",
  },
};
