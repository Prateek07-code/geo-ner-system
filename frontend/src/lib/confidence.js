// Single source of truth for confidence band thresholds.
// >85%, 60-85%, <60% bands; rendered with the ISRO blue/orange palette.

export function getConfidenceBand(confidence) {
  const pct = confidence <= 1 ? confidence * 100 : confidence;
  if (pct > 85) return "high";
  if (pct >= 60) return "medium";
  return "low";
}

export const CONFIDENCE_STYLES = {
  high: {
    badge: "bg-geo-blue/15 text-geo-blue",
    bar: "bg-geo-blue",
    dot: "bg-geo-blue",
  },
  medium: {
    badge: "bg-geo-orange/15 text-geo-orange",
    bar: "bg-geo-orange",
    dot: "bg-geo-orange",
  },
  low: {
    badge: "bg-geo-orange/30 text-geo-orange",
    bar: "bg-geo-orange",
    dot: "bg-geo-orange",
  },
};
