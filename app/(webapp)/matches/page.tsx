"use client";

import { useState } from "react";

type ResultsMap = Record<number, number>;

// ---------------- Logic ----------------

function genRandomChoice(length: number): string {
  const choices = ["H", "D", "A"];
  let result = "";

  for (let i = 0; i < length; i++) {
    result += choices[Math.floor(Math.random() * 3)];
  }

  return result;
}

function countMatches(a: string, b: string): number {
  let count = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] === b[i]) count++;
  }
  return count;
}

function simulate(jackpot: string, numTrials: number, minMatches: number) {
  const results: ResultsMap = {};
  const seen = new Set<string>();
  const list: string[] = [];

  for (let i = 0; i < numTrials; i++) {
    const combo = genRandomChoice(jackpot.length);
    const matches = countMatches(combo, jackpot);

    if (matches >= minMatches) {
      results[matches] = (results[matches] || 0) + 1;
    }

    if (!seen.has(combo)) {
      seen.add(combo);
      list.push(combo);
    }
  }

  return { results, list };
}

// ---------------- UI ----------------

export default function Page() {
  const [jackpot, setJackpot] = useState("AAHHHH");
  const [numTrials, setNumTrials] = useState(30);
  const [minMatches, setMinMatches] = useState(2);

  const [results, setResults] = useState<ResultsMap>({});
  const [combinations, setCombinations] = useState<string[]>([]);

  const handleRun = () => {
    if (!/^[HDA]+$/.test(jackpot)) {
      alert("Jackpot must only contain H, D, A");
      return;
    }

    const { results, list } = simulate(jackpot, numTrials, minMatches);

    setResults(results);
    setCombinations(list);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Jackpot Simulation Tool</h1>

      {/* Inputs */}
      <div className="space-y-3">
        <div>
          <label>Jackpot Pattern:</label>
          <input
            value={jackpot}
            onChange={(e) => setJackpot(e.target.value.toUpperCase())}
            className="border p-1 ml-2"
          />
        </div>

        <div>
          <label>Number of Trials:</label>
          <input
            type="number"
            value={numTrials}
            onChange={(e) => setNumTrials(parseInt(e.target.value))}
            className="border p-1 ml-2 w-24"
          />
        </div>

        <div>
          <label>Minimum Matches:</label>
          <input
            type="number"
            value={minMatches}
            onChange={(e) => setMinMatches(parseInt(e.target.value))}
            className="border p-1 ml-2 w-24"
          />
        </div>
      </div>

      <button
        onClick={handleRun}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Run Simulation
      </button>

      {/* Results */}
      <div>
        <h2 className="font-bold mt-4">Match Frequencies</h2>
        <ul>
          {Object.entries(results)
            .sort((a, b) => Number(b[0]) - Number(a[0]))
            .map(([matches, count]) => (
              <li key={matches}>
                {matches} matches → {count}
              </li>
            ))}
        </ul>
      </div>

      {/* Combinations */}
      <div>
        <h2 className="font-bold mt-4">Generated Combinations</h2>
        <div className="grid grid-cols-4 gap-2">
          {combinations.map((c, i) => (
            <div key={i} className="border p-1 text-center">
              {c}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
