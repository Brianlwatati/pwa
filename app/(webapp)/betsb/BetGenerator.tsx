"use client";

import { useState } from "react";
import {
  Odds,
  normalizeOdds,
  mostLikelyBase,
  sampleCombinations,
  scoreCombos,
  selectDiverseTop,
} from "./betUtils";

const CHOICES = ["H", "D", "A"] as const;

type MatchOddsRowProps = {
  index: number;
  odds: Odds;
  onChange: (key: keyof Odds, value: number) => void;
};

// Renders a single match row with inputs for H/D/A odds.
function MatchOddsRow({ index, odds, onChange }: MatchOddsRowProps) {
  return (
    <div className="flex gap-2 items-center">
      <span>Match {index + 1}</span>

      {CHOICES.map((k) => (
        <input
          key={k}
          type="number"
          step="0.01"
          value={odds[k]}
          onChange={(e) => onChange(k, parseFloat(e.target.value))}
          className="border p-1 w-20"
        />
      ))}
    </div>
  );
}

// Main generator component for betsb.
export default function BetGenerator() {
  const [oddsList, setOddsList] = useState<Odds[]>([
    { H: 2.0, D: 3.2, A: 3.5 },
  ]);
  const [samples, setSamples] = useState(20000);
  const [topN, setTopN] = useState(5);
  const [base, setBase] = useState("");
  const [results, setResults] = useState<string[]>([]);

  // Add a new default match to the input form.
  const addMatch = () => {
    setOddsList([...oddsList, { H: 2, D: 3, A: 4 }]);
  };

  // Update odds for a specific match and choice.
  const updateOdds = (index: number, key: keyof Odds, value: number) => {
    const updated = [...oddsList];
    updated[index] = { ...updated[index], [key]: value };
    setOddsList(updated);
  };

  // Run the generator pipeline: normalize, sample, score, and select.
  const handleRun = () => {
    try {
      const normalized = normalizeOdds(oddsList);
      const baseStr = mostLikelyBase(normalized);
      const combos = sampleCombinations(normalized, samples);
      const scored = scoreCombos(combos, normalized, baseStr);
      const top = selectDiverseTop(scored, topN, 2);

      setBase(baseStr);
      setResults(top);
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">
        Smart Betting Generator (Form Input)
      </h1>

      {oddsList.map((odds, i) => (
        <MatchOddsRow
          key={i}
          index={i}
          odds={odds}
          onChange={(k, value) => updateOdds(i, k, value)}
        />
      ))}

      <button
        onClick={addMatch}
        className="bg-blue-500 text-white px-3 py-1 rounded"
      >
        Add Match
      </button>

      <div className="flex gap-4">
        <div>
          <label>Samples:</label>
          <input
            type="number"
            value={samples}
            onChange={(e) => setSamples(parseInt(e.target.value))}
            className="border ml-2 p-1 w-28"
          />
        </div>

        <div>
          <label>Top N:</label>
          <input
            type="number"
            value={topN}
            onChange={(e) => setTopN(parseInt(e.target.value))}
            className="border ml-2 p-1 w-20"
          />
        </div>
      </div>

      <button
        onClick={handleRun}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Generate
      </button>

      {base && (
        <div>
          <p>
            <strong>Base:</strong> {base}
          </p>

          <h2 className="font-bold mt-4">Top Combinations</h2>
          <div className="grid grid-cols-3 gap-2">
            {results.map((r, i) => (
              <div key={i} className="border p-2 text-center">
                {r}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
