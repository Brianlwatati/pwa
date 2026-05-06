"use client";

import { useState } from "react";
import {
  CHOICES,
  Odds,
  oddsToProb,
  rankCombinations,
  toDoubleChancePairs,
} from "./BetseUtils";

// =============================
// COMPONENT
// =============================

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
      <ul className="grid grid-cols-3 gap-2">
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
  const [matches, setMatches] = useState<Odds[]>([
    { H: 2.1, D: 3.2, A: 3.5 },
    { H: 1.8, D: 3.5, A: 4.2 },
    { H: 2.5, D: 3.0, A: 2.8 },
    { H: 2.0, D: 3.3, A: 3.6 },
  ]);

  const [topN, setTopN] = useState(20);
  const [results, setResults] = useState<string[]>([]);
  const [jsonInput, setJsonInput] = useState("");

  // Handle input change
  const updateMatch = (index: number, field: keyof Odds, value: number) => {
    const updated = [...matches];
    updated[index][field] = value;
    setMatches(updated);
  };

  const addMatch = () => {
    setMatches([...matches, { H: 2, D: 3, A: 4 }]);
  };

  const addFromJson = () => {
    try {
      const parsed: Odds[] = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) {
        throw new Error("JSON must be an array of odds objects");
      }
      parsed.forEach((odds) => {
        if (typeof odds !== "object" || !odds.H || !odds.D || !odds.A) {
          throw new Error("Each odds object must have H, D, A properties");
        }
      });
      setMatches([...matches, ...parsed]);
      setJsonInput("");
    } catch (e: any) {
      alert("Invalid JSON: " + e.message);
    }
  };

  const exportAsJson = () => {
    const json = JSON.stringify(matches, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      alert("Odds copied to clipboard as JSON");
    });
  };

  // Generate results
  const generate = () => {
    const probs = matches.map(oddsToProb);

    const ranked = rankCombinations(probs, topN);

    const paired = ranked.map((combo) => toDoubleChancePairs(combo, probs));

    setResults(paired);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Double Chance Generator (HD / AD)</h1>

      {matches.map((odds, index) => (
        <OddsRow key={index} index={index} odds={odds} onChange={updateMatch} />
      ))}

      <button
        onClick={addMatch}
        className="bg-blue-500 text-white px-3 py-1 rounded"
      >
        Add Match
      </button>

      <div className="space-y-2">
        <label className="block font-semibold">Add Odds from JSON:</label>
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder='[{"H": 2.0, "D": 3.2, "A": 3.5}, {"H": 1.8, "D": 3.5, "A": 4.0}]'
          className="border p-2 w-full h-20"
        />
        <div className="flex gap-2">
          <button
            onClick={addFromJson}
            className="bg-purple-500 text-white px-3 py-1 rounded"
          >
            Add from JSON
          </button>
          <button
            onClick={exportAsJson}
            className="bg-orange-500 text-white px-3 py-1 rounded"
          >
            Export as JSON
          </button>
        </div>
      </div>

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

      {results.length > 0 && <ResultsList results={results} />}
    </div>
  );
}
