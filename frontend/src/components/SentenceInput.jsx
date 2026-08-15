function SentenceInput({ sentence, setSentence, onAnalyze }) {
  const examples = [
    "Flooding reported near Aurangabad after heavy rains in Maharashtra.",
    "Heavy rainfall was reported in Mumbai, Maharashtra.",
    "A landslide occurred near Shimla in Himachal Pradesh."
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-slate-900">
          Analyze a location-aware sentence
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Enter a sentence containing one or more Indian place names.
        </p>
      </div>

      <textarea
        value={sentence}
        onChange={(event) => setSentence(event.target.value)}
        placeholder="Example: Flooding reported near Aurangabad after heavy rains..."
        rows={5}
        className="w-full resize-none rounded-xl border border-slate-300 bg-slate-50 p-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />

      <div className="mt-4 flex flex-wrap gap-2">
        {examples.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setSentence(example)}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          >
            {example}
          </button>
        ))}
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={!sentence.trim()}
          className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Analyze Sentence →
        </button>
      </div>
    </section>
  );
}

export default SentenceInput;