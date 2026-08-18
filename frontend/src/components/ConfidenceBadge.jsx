import { getConfidenceBand, CONFIDENCE_STYLES } from "../lib/confidence";

function ConfidenceBadge({ confidence, size = "md" }) {
  const pct = Math.round(confidence * 100);
  const band = getConfidenceBand(confidence);
  const styles = CONFIDENCE_STYLES[band];

  const sizeClasses =
    size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${sizeClasses} ${styles.badge}`}
    >
      {pct}% confidence
    </span>
  );
}

export default ConfidenceBadge;