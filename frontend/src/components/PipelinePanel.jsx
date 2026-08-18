function PipelinePanel() {
  const steps = [
    { label: "Input Text", detail: "Natural language sentence" },
    { label: "Place Name Extraction", detail: "NER-based span detection" },
    { label: "Entity Disambiguation", detail: "Context + population scoring" },
    { label: "Geospatial Resolution", detail: "Coordinates + confidence" },
    { label: "Map Visualization", detail: "Resolved locations plotted" },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        System Pipeline
      </p>
      <h2 className="mt-1 text-lg font-semibold text-navy">
        How GeoNER Resolves a Sentence
      </h2>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-0">
        {steps.map((step, index) => (
          <div key={step.label} className="flex flex-1 items-center">
            <div className="flex-1 rounded-xl border border-slate-200 bg-surface px-4 py-3">
              <p className="text-sm font-semibold text-navy">
                {step.label}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {step.detail}
              </p>
            </div>

            {index < steps.length - 1 && (
              <div className="hidden shrink-0 px-2 text-slate-300 sm:block">
                →
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default PipelinePanel;
