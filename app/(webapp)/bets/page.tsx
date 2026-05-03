"use client";

import { useState } from "react";
import {
  CHOICES,
  Odds,
  normalizeOdds,
  randomPrediction,
  rankCombinations,
} from "./utils";

function OddsRow({
  index,
  odds,
  onChange,
}: {
  index: number;
  odds: Odds;
  onChange: (index: number, key: keyof Odds, value: number) => void;
}) {
  return (
    <div className="flex gap-2">
      <span>Match {index + 1}</span>
      {CHOICES.map((k: keyof Odds) => (
        <input
          key={k}
          type="number"
          step="0.01"
          value={odds[k]}
          onChange={(e) => onChange(index, k, parseFloat(e.target.value))}
          className="border p-1 w-20"
        />
      ))}
    </div>
  );
}

function ResultsList({ results }: { results: string[] }) {
  return (
    <div>
      <h2 className="mt-4 font-bold">Top Combinations</h2>
      <ul className="grid grid-cols-3 gap-2 mt-2">
        {results.map((result, index) => (
          <li key={index} className="border p-1 text-center">
            {result}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Page() {
  // ---------------- State ----------------
  const [oddsList, setOddsList] = useState<Odds[]>([
    { H: 2.0, D: 3.2, A: 3.5 },
  ]);
  const [topN, setTopN] = useState(30);
  const [results, setResults] = useState<string[]>([]);
  const [randomPred, setRandomPred] = useState("");
  const [basePred, setBasePred] = useState("");

  // ---------------- Event Handlers ----------------
  const addMatch = () => {
    setOddsList([...oddsList, { H: 2, D: 3, A: 4 }]);
  };

  const updateOdds = (index: number, key: keyof Odds, value: number) => {
    const updated = [...oddsList];
    updated[index][key] = value;
    setOddsList(updated);
  };

  const generate = () => {
    try {
      const normalized = normalizeOdds(oddsList);
      const randomP = randomPrediction(normalized);
      const base = randomPrediction(normalized);
      const ranked = rankCombinations(normalized, base, topN);

      setRandomPred(randomP);
      setBasePred(base);
      setResults(ranked);
    } catch (e: any) {
      alert(e.message);
    }
  };

  // ---------------- Render -------------
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Betting Combination Generator</h1>

      {oddsList.map((odds, index) => (
        <OddsRow key={index} index={index} odds={odds} onChange={updateOdds} />
      ))}

      <button
        onClick={addMatch}
        className="bg-blue-500 text-white px-3 py-1 rounded"
      >
        Add Match
      </button>

      <div>
        <label>Number of combinations: </label>
        <input
          type="number"
          value={topN}
          onChange={(e) => setTopN(parseInt(e.target.value))}
          className="border p-1 w-20"
        />
      </div>

      <button
        onClick={generate}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Generate
      </button>

      {results.length > 0 && (
        <div>
          <p>
            <strong>Random Prediction:</strong> {randomPred}
          </p>
          <p>
            <strong>Base Pattern:</strong> {basePred}
          </p>
          <ResultsList results={results} />
        </div>
      )}
    </div>
  );
}
