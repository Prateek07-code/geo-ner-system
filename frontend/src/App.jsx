import { useState } from "react";

import SentenceInput from "./components/SentenceInput";
import HighlightedText from "./components/HighlightedText";
import ResolvedLocationsPanel from "./components/ResolvedLocationsPanel";
import MapView from "./components/MapView";

import sampleResponse from "./data/sampleResponse.json";

function App() {
  const [sentence, setSentence] = useState("");
  const [result, setResult] = useState(null);

  const handleAnalyze = () => {
    setResult(sampleResponse);
    setSentence(sampleResponse.sentence);
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            ISRO Bhuvan • GeoNER
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Place Name Identification & Disambiguation
          </h1>

          <p className="mt-2 max-w-3xl text-slate-600">
            Identify place names from natural language text and visualize
            their resolved geographic locations.
          </p>
        </header>

        <SentenceInput
          sentence={sentence}
          setSentence={setSentence}
          onAnalyze={handleAnalyze}
        />

        {result && (
          <div className="mt-6 space-y-6">
            <HighlightedText
              sentence={result.sentence}
              entities={result.entities}
            />

            <ResolvedLocationsPanel
              entities={result.entities}
            />

            <MapView
              entities={result.entities}
            />
          </div>
        )}
      </div>
    </main>
  );
}

export default App;