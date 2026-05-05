"use client";

import { useState } from "react";
import {
  Odds,
  normalizeOdds,
  optimizeCombos,
  simulateJackpot,
  calculateROI,
} from "./betsdUtils";

type MatchInputProps = {
  index: number;
  odds: Odds;
  onChange: (key: keyof Odds, value: number) => void;
};

// Component for a single match odds input row.
function MatchInput({ index, odds, onChange }: MatchInputProps) {
  return (
    <div className="flex gap-2">
      <span>Match {index + 1}</span>
      {(["H", "D", "A"] as (keyof Odds)[]).map((k) => (
        <input
          key={k}
          type="number"
          value={odds[k]}
          onChange={(e) => onChange(k, parseFloat(e.target.value))}
          className="border w-20"
        />
      ))}
    </div>
  );
}

// Main jackpot optimizer component.
export default function JackpotOptimizer() {
  const [odds, setOdds] = useState<Odds[]>([{ H: 2, D: 3.2, A: 3.5 }]);
  const [target, setTarget] = useState(12);
  const [topN, setTopN] = useState(5);
  const [results, setResults] = useState<string[]>([]);
  const [distribution, setDistribution] = useState<Record<number, number>>({});
  const [roi, setRoi] = useState<any>(null);

  // Add a new default match.
  const addMatch = () => {
    setOdds([...odds, { H: 2, D: 3, A: 4 }]);
  };

  // Update odds for a specific match.
  const update = (i: number, k: keyof Odds, v: number) => {
    const copy = [...odds];
    copy[i][k] = v;
    setOdds(copy);
  };

  // Run the optimization pipeline.
  const run = () => {
    const norm = normalizeOdds(odds);
    const best = optimizeCombos(norm, 200, topN, target);
    const dist = simulateJackpot(norm, best, 5000);
    const roiData = calculateROI(dist, 5000, 100, best.length);

    setResults(best);
    setDistribution(dist);
    setRoi(roiData);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">12+ Jackpot Optimizer</h1>

      {odds.map((o, i) => (
        <MatchInput
          key={i}
          index={i}
          odds={o}
          onChange={(k, v) => update(i, k, v)}
        />
      ))}

      <button onClick={addMatch} className="bg-blue-500 text-white px-2 py-1">
        Add Match
      </button>

      <div>
        Target Hits:
        <input
          type="number"
          value={target}
          onChange={(e) => setTarget(parseInt(e.target.value))}
          className="border ml-2 w-16"
        />
      </div>

      <div>
        Tickets:
        <input
          type="number"
          value={topN}
          onChange={(e) => setTopN(parseInt(e.target.value))}
          className="border ml-2 w-16"
        />
      </div>

      <button onClick={run} className="bg-green-600 text-white px-4 py-2">
        Run Optimizer
      </button>

      {results.length > 0 && (
        <div>
          <h2 className="font-bold mt-4">Selected Combos</h2>
          {results.map((r, i) => (
            <div key={i}>{r}</div>
          ))}
        </div>
      )}

      {Object.keys(distribution).length > 0 && (
        <div>
          <h2 className="font-bold mt-4">Hit Distribution</h2>
          {Object.entries(distribution).map(([k, v]) => (
            <div key={k}>
              {k} → {v}
            </div>
          ))}
        </div>
      )}

      {roi && (
        <div>
          <h2 className="font-bold mt-4">ROI</h2>
          <p>Expected: {roi.expected.toFixed(2)}</p>
          <p>Cost: {roi.cost}</p>
          <p>ROI: {(roi.roi * 100).toFixed(2)}%</p>
        </div>
      )}
    </div>
  );
}
