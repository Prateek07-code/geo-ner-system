function HighlightedText({ sentence, entities }) {
  if (!sentence) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-400">
          Your analyzed sentence will appear here.
        </p>
      </div>
    );
  }

  const sortedEntities = [...entities].sort(
    (a, b) => a.start - b.start
  );

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

    parts.push(
      <span
        key={`entity-${index}`}
        className="rounded-md bg-amber-100 px-1.5 py-0.5 font-semibold text-amber-900 ring-1 ring-amber-200"
        title={`Detected place: ${entity.text}`}
      >
        {sentence.slice(start, end)}
      </span>
    );

    currentPosition = Math.max(currentPosition, end);
  });

  if (currentPosition < sentence.length) {
    parts.push(
      <span key="remaining-text">
        {sentence.slice(currentPosition)}
      </span>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Detected places
        </p>

        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Highlighted Text
        </h2>
      </div>

      <p className="text-base leading-8 text-slate-700">
        {parts}
      </p>
    </section>
  );
}

export default HighlightedText;