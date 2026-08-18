function HighlightedText({ sentence, entities }) {
  if (!sentence) {
    return (
      <div className="rounded-2xl border border-geo-blue/15 bg-white p-6 shadow-sm">
        <p className="text-sm text-geo-blue/65">
          Your analyzed sentence will appear here.
        </p>
      </div>
    );
  }

  const sortedEntities = [...entities].sort((a, b) => a.start - b.start);

  const parts = [];
  let currentPosition = 0;

  sortedEntities.forEach((entity, index) => {
    const start = entity.start;
    const end = entity.end;

    if (start > currentPosition) {
      parts.push(
        <span key={`text-${index}`}>
          {sentence.slice(currentPosition, start)}
        </span>
      );
    }

    const confidencePct = entity.resolved
      ? Math.round(entity.resolved.confidence * 100)
      : null;

    parts.push(
      <span
        key={`entity-${index}`}
        className="group relative inline-block cursor-help rounded-md bg-geo-orange/15 px-1.5 py-0.5 font-semibold text-geo-orange ring-1 ring-geo-orange/45 transition hover:bg-geo-orange/25"
      >
        {sentence.slice(start, end)}

        {entity.resolved && (
          <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-max -translate-x-1/2 scale-95 rounded-lg border border-geo-blue/15 bg-navy px-3 py-2 text-xs font-normal text-white opacity-0 shadow-lg transition group-hover:scale-100 group-hover:opacity-100">
            <span className="block font-semibold">{entity.text}</span>
            <span className="block text-white/70">
              {entity.resolved.state}
            </span>
            <span className="block text-geo-orange">
              {confidencePct}% confidence
            </span>
          </span>
        )}
      </span>
    );

    currentPosition = Math.max(currentPosition, end);
  });

  if (currentPosition < sentence.length) {
    parts.push(
      <span key="remaining-text">{sentence.slice(currentPosition)}</span>
    );
  }

  return (
    <section className="rounded-2xl border border-geo-blue/15 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-geo-blue/65">
          Detected Places
        </p>
        <h2 className="mt-1 text-lg font-semibold text-navy">
          Highlighted Text
        </h2>
      </div>

      <p className="text-base leading-8 text-slate-700">{parts}</p>
    </section>
  );
}

export default HighlightedText;
