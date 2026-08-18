<<<<<<< HEAD
import { getConfidenceBand, CONFIDENCE_STYLES } from "../lib/confidence";

function ConfidenceBadge({ confidence, size = "md" }) {
  const pct = Math.round(confidence * 100);
  const band = getConfidenceBand(confidence);
  const styles = CONFIDENCE_STYLES[band];

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${sizeClasses} ${styles.badge}`}
    >
      {pct}% confidence
    </span>
=======
function ConfidenceBadge({ confidence, showBar = false }) {
  const pct = Math.round(confidence * 100);

  let label, textColor, bgColor, barColor;

  if (pct >= 85) {
    label = "HIGH CONFIDENCE";
    textColor = "text-geo-emerald";
    bgColor = "bg-emerald-50 ring-emerald-200";
    barColor = "bg-geo-emerald";
  } else if (pct >= 60) {
    label = "MEDIUM CONFIDENCE";
    textColor = "text-geo-amber";
    bgColor = "bg-amber-50 ring-amber-200";
    barColor = "bg-geo-amber";
  } else {
    label = "LOW CONFIDENCE";
    textColor = "text-red-600";
    bgColor = "bg-red-50 ring-red-200";
    barColor = "bg-red-500";
  }

  return (
    <div>
      <div
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${bgColor} ${textColor}`}
      >
        {pct}% · {label}
      </div>

      {showBar && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full ${barColor} transition-all duration-500`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
>>>>>>> c259c8aac17097beb0810664167c4fe13c2d1446
  );
}

export default ConfidenceBadge;
