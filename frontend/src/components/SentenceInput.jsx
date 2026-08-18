function SentenceInput({ sentence, setSentence, onAnalyze }) {
  const examples = [
    "Flooding reported near Aurangabad after heavy rains in Maharashtra.",
    "Heavy rainfall was reported in Mumbai, Maharashtra.",
    "A landslide occurred near Shimla in Himachal Pradesh.",
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Natural Language Input
        </p>
        <h2 className="mt-1 text-xl font-semibold text-navy">
          Analyze a location-aware sentence
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Enter a sentence containing one or more place names for geospatial
          resolution.
        </p>
      </div>

      <textarea
        value={sentence}
        onChange={(event) => setSentence(event.target.value)}
        placeholder="Example: Flooding reported near Aurangabad after heavy rains..."
        rows={5}
        className="w-full resize-none rounded-xl border border-slate-300 bg-surface p-4 text-sm text-slate-900 outline-none transition focus:border-geo-blue focus:ring-2 focus:ring-geo-blue/20"
      />

      <div className="mt-2 flex justify-end">
        <span className="text-xs text-slate-400">
          {sentence.length} characters
        </span>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {examples.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setSentence(example)}
            className="rounded-full border border-slate-200 bg-surface px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-geo-blue/40 hover:bg-blue-50 hover:text-geo-blue"
          >
            {example}
          </button>
        ))}
      </div>

      <div className="mt-5 flex justify-end gap-3">
        {sentence && (
          <button
            type="button"
            onClick={() => setSentence("")}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-500 transition hover:bg-surface"
          >
            Clear
          </button>
        )}

        <button
          type="button"
          onClick={onAnalyze}
          disabled={!sentence.trim()}
          className="rounded-xl bg-navy px-5 py-3 text-sm font-semibold text-white transition hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-40"
        >
          Analyze Sentence →
        </button>
      </div>
    </section>
  );
}

export default SentenceInput;
