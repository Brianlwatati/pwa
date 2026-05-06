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

  // Handle input change
  const updateMatch = (index: number, field: keyof Odds, value: number) => {
    const updated = [...matches];
    updated[index][field] = value;
    setMatches(updated);
  };

  // Generate results
  const generate = () => {
    const probs = matches.map(oddsToProb);

    const ranked = rankCombinations(probs, topN);

    const paired = ranked.map((combo) => toDoubleChancePairs(combo, probs));

    setResults(paired);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Double Chance Generator (HD / AD)</h1>

      {/* INPUTS */}
      {matches.map((m, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <strong>Match {i + 1}:</strong>{" "}
          <input
            type="number"
            step="0.01"
            value={m.H}
            onChange={(e) => updateMatch(i, "H", Number(e.target.value))}
          />
          {" H "}
          <input
            type="number"
            step="0.01"
            value={m.D}
            onChange={(e) => updateMatch(i, "D", Number(e.target.value))}
          />
          {" D "}
          <input
            type="number"
            step="0.01"
            value={m.A}
            onChange={(e) => updateMatch(i, "A", Number(e.target.value))}
          />
          {" A"}
        </div>
      ))}

      {/* SETTINGS */}
      <div style={{ marginTop: 20 }}>
        Top N:
        <input
          type="number"
          value={topN}
          onChange={(e) => setTopN(Number(e.target.value))}
        />
      </div>

      {/* BUTTON */}
      <button onClick={generate} style={{ marginTop: 20 }}>
        Generate
      </button>

      {/* OUTPUT */}
      <div style={{ marginTop: 20 }}>
        <h3>Results:</h3>
        {results.map((r, i) => (
          <div key={i}>{r}</div>
        ))}
      </div>
    </div>
  );
}
