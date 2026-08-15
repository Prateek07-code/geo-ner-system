function ResolvedLocationsPanel({ entities }) {
  if (!entities || entities.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Resolved Locations
        </p>

        <div className="mt-4 rounded-xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">
            No place names detected yet.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Resolved Locations
        </p>

        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Geographic Results
        </h2>
      </div>

      <div className="space-y-4">
        {entities.map((entity, index) => {
          const confidence = Math.round(
            entity.resolved.confidence * 100
          );

          return (
            <div
              key={`${entity.text}-${index}`}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-base font-semibold text-slate-900">
                    {entity.text}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {entity.resolved.district},{" "}
                    {entity.resolved.state}
                  </p>
                </div>

                <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {confidence}% confidence
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium text-slate-500">
                    Resolution confidence
                  </span>

                  <span className="font-semibold text-slate-700">
                    {confidence}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${confidence}%` }}
                  />
                </div>
              </div>

              {entity.alternates && entity.alternates.length > 0 && (
                <div className="mt-4 border-t border-slate-200 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Alternative possibilities
                  </p>

                  <div className="mt-2 space-y-2">
                    {entity.alternates.map((alternate, alternateIndex) => (
                      <div
                        key={`${alternate.state}-${alternateIndex}`}
                        className="flex items-center justify-between rounded-lg bg-white px-3 py-2"
                      >
                        <span className="text-sm text-slate-600">
                          {alternate.state}
                        </span>

                        <span className="text-sm font-semibold text-slate-700">
                          {Math.round(alternate.confidence * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default ResolvedLocationsPanel;