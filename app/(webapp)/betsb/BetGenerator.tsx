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
import { generateBetPDF } from "../bets/pdfUtils";

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
  const [jsonText, setJsonText] = useState("");

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

  // Load odds from JSON text.
  const loadFromJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (
        Array.isArray(parsed) &&
        parsed.every(
          (item) =>
            typeof item === "object" &&
            "H" in item &&
            "D" in item &&
            "A" in item,
        )
      ) {
        setOddsList(parsed);
      } else {
        alert(
          "Invalid JSON format. Expected array of objects with H, D, A keys.",
        );
      }
    } catch (e) {
      alert(
        "Invalid JSON: " + (e instanceof Error ? e.message : "Unknown error"),
      );
    }
  };

  // Export current odds to JSON text.
  const exportToJson = () => {
    setJsonText(JSON.stringify(oddsList, null, 2));
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

  const saveAsPDF = () => {
    generateBetPDF({
      title: "Smart Betting Generator Report",
      oddsList,
      results,
      base,
    });
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

      <div className="flex gap-4 items-start">
        <div className="flex flex-col">
          <label className="font-semibold">Odds JSON:</label>
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder='[{"H": 2.0, "D": 3.2, "A": 3.5}]'
            className="border p-2 w-80 h-32 resize-none"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={loadFromJson}
              className="bg-purple-500 text-white px-3 py-1 rounded text-sm"
            >
              Load from JSON
            </button>
            <button
              onClick={exportToJson}
              className="bg-orange-500 text-white px-3 py-1 rounded text-sm"
            >
              Export to JSON
            </button>
          </div>
        </div>
      </div>

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

          <button
            onClick={saveAsPDF}
            className="bg-red-500 text-white px-4 py-2 rounded mt-4"
          >
            Save as PDF
          </button>
        </div>
      )}
    </div>
  );
}
