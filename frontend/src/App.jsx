import { useState } from "react";
import SentenceInput from "./components/SentenceInput";
import HighlightedText from "./components/HighlightedText";
import ResolvedLocationsPanel from "./components/ResolvedLocationsPanel";
import MapView from "./components/MapView";
import OverviewMetrics from "./components/OverviewMetrics";
import PipelinePanel from "./components/PipelinePanel";
import sampleResponse from "./data/sampleResponse.json";

function App() {
  const [sentence, setSentence] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = () => {
    setLoading(true);
    setResult(null);

    // Short cosmetic delay only — this is still mock data, not a real API call.
    setTimeout(() => {
      setResult(sampleResponse);
      setSentence(sampleResponse.sentence);
      setLoading(false);
    }, 400);
  };

  return (
    <main className="min-h-screen bg-surface">
      <header className="bg-grid-pattern border-b border-geo-blue/30 bg-geo-blue px-4 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-geo-orange">
                ISRO Bhuvan • GeoNER
              </p>
              <h1 className="mt-2 text-3xl font-bold text-white">
                Place Name Identification & Disambiguation
              </h1>
              <p className="mt-2 max-w-2xl text-slate-300">
                Identify place names from natural language text and resolve
                them to their correct geographic location.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-white/25 bg-geo-blue/80 px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-geo-orange" />
              <span className="text-xs font-semibold text-white">
                SYSTEM READY
              </span>
              <span className="text-xs text-white/70">
                · Mock Data Mode
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        <OverviewMetrics result={result} />

        <SentenceInput
          sentence={sentence}
          setSentence={setSentence}
          onAnalyze={handleAnalyze}
        />

        {!result && !loading && (
          <section className="rounded-2xl border border-dashed border-geo-blue/30 bg-white p-10 text-center">
            <p className="text-sm font-semibold text-navy">
              Ready for Analysis
            </p>
            <p className="mt-1 text-sm text-geo-blue/70">
              Enter a sentence above to identify and resolve place names.
            </p>
          </section>
        )}

        {loading && (
          <section className="rounded-2xl border border-geo-blue/15 bg-white p-10 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-geo-blue/20 border-t-geo-orange" />
            <p className="mt-3 text-sm font-medium text-geo-blue/70">
              Preparing results…
            </p>
          </section>
        )}

        {result && !loading && (
          <>
            <HighlightedText
              sentence={result.sentence}
              entities={result.entities}
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ResolvedLocationsPanel entities={result.entities} />
              <MapView entities={result.entities} />
            </div>
          </>
        )}

        <PipelinePanel />
      </div>
    </main>
  );
}

export default App;
