function OverviewMetrics({ result }) {
  const hasResult = Boolean(result && result.entities);
  const entities = hasResult ? result.entities : [];

  const detected = entities.length;
  const resolved = entities.filter((entity) => entity.resolved).length;

  const avgConfidence =
    detected > 0
      ? Math.round(
          (entities.reduce(
            (sum, entity) => sum + (entity.resolved?.confidence || 0),
            0
          ) /
            detected) *
            100
        )
      : null;

  const metrics = [
    {
      label: "Detected Locations",
      value: hasResult ? detected : "—",
    },
    {
      label: "Resolved Locations",
      value: hasResult ? resolved : "—",
    },
    {
      label: "Average Confidence",
      value: hasResult && avgConfidence !== null ? `${avgConfidence}%` : "—",
    },
    {
      label: "Analysis Status",
      value: hasResult ? "Complete" : "Awaiting Input",
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {metric.label}
          </p>
          <p className="mt-1 text-2xl font-bold text-navy">
            {metric.value}
          </p>
        </div>
      ))}
    </section>
  );
}

export default OverviewMetrics;
