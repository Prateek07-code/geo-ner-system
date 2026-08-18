import ConfidenceBadge from "./ConfidenceBadge";

function ResolvedLocationsPanel({ entities }) {
  if (!entities || entities.length === 0) {
    return (
      <section className="rounded-2xl border border-geo-blue/15 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-geo-blue/65">
          Resolved Locations
        </p>

        <div className="mt-4 rounded-xl bg-geo-blue/5 p-4">
          <p className="text-sm text-geo-blue/70">
            No place names detected yet.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-geo-blue/15 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-geo-blue/65">
          Resolved Locations
        </p>

        <h2 className="mt-1 text-lg font-semibold text-navy">
          Geographic Results
        </h2>
      </div>

      <div className="space-y-4">
        {entities.map((entity, index) => (
          <div
            key={`${entity.text}-${index}`}
            className="rounded-xl border border-geo-blue/15 bg-geo-blue/5 p-4 transition hover:border-geo-orange/50"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 text-geo-orange">📍</span>
                <div>
                  <p className="text-base font-semibold uppercase tracking-wide text-navy">
                    {entity.text}
                  </p>
                  <p className="mt-1 text-sm text-geo-blue/70">
                    {entity.resolved.district}, {entity.resolved.state}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-geo-blue/65">
                Confidence
              </p>
              <ConfidenceBadge
                confidence={entity.resolved.confidence}
                showBar
              />
            </div>

            {entity.alternates && entity.alternates.length > 0 && (
              <div className="mt-4 border-t border-geo-blue/15 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-geo-blue/65">
                  Alternate Candidates
                </p>

                <div className="mt-2 space-y-2">
                  {entity.alternates.map((alternate, alternateIndex) => (
                    <div
                      key={`${alternate.state}-${alternateIndex}`}
                      className="flex items-center justify-between rounded-lg bg-geo-blue/5 px-3 py-2 text-sm"
                    >
                      <span className="text-geo-blue/80">
                        {alternate.state}
                      </span>
                      <span className="font-semibold text-geo-blue/90">
                        {Math.round(alternate.confidence * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center gap-1.5 border-t border-geo-blue/15 pt-3 text-xs font-medium text-geo-blue/65">
              <span>{entity.resolved.lat.toFixed(2)}° N</span>
              <span>·</span>
              <span>{entity.resolved.lon.toFixed(2)}° E</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ResolvedLocationsPanel;
