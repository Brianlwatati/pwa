"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  CHOICES,
  Odds,
  normalizeOdds,
  randomPrediction,
  rankCombinations,
} from "./utils";
import { generateBetPDF } from "./pdfUtils";

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

function ActualOutcomesRow({
  index,
  outcome,
  onChange,
}: {
  index: number;
  outcome: string;
  onChange: (index: number, value: string) => void;
}) {
  return (
    <div className="flex gap-2 items-center">
      <span>Match {index + 1} Actual:</span>
      <select
        value={outcome}
        onChange={(e) => onChange(index, e.target.value)}
        className="border p-1"
      >
        <option value="">Select</option>
        {CHOICES.map((choice) => (
          <option key={choice} value={choice}>
            {choice}
          </option>
        ))}
      </select>
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
  const [jsonInput, setJsonInput] = useState("");
  const [actualOutcomes, setActualOutcomes] = useState<string[]>([]);

  // ---------------- Event Handlers ----------------
  const addMatch = () => {
    setOddsList([...oddsList, { H: 2, D: 3, A: 4 }]);
  };

  const updateOdds = (index: number, key: keyof Odds, value: number) => {
    const updated = [...oddsList];
    updated[index][key] = value;
    setOddsList(updated);
  };

  const updateActualOutcome = (index: number, value: string) => {
    const updated = [...actualOutcomes];
    updated[index] = value;
    setActualOutcomes(updated);
  };

  const saveAsPDF = () => {
    generateBetPDF({
      title: "Betting Combinations Report",
      oddsList,
      results,
      actualOutcomes,
    });
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
      setOddsList([...oddsList, ...parsed]);
      setJsonInput("");
    } catch (e: any) {
      alert("Invalid JSON: " + e.message);
    }
  };

  const exportAsJson = () => {
    const json = JSON.stringify(oddsList, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      alert("Odds copied to clipboard as JSON");
    });
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
      setActualOutcomes(new Array(oddsList.length).fill(""));
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

      {results.length > 0 && (
        <div>
          <p>
            <strong>Random Prediction:</strong> {randomPred}
          </p>
          <p>
            <strong>Base Pattern:</strong> {basePred}
          </p>
          <ResultsList results={results} />

          <div className="mt-4">
            <h2 className="font-bold">Actual Outcomes</h2>
            {actualOutcomes.map((outcome, index) => (
              <ActualOutcomesRow
                key={index}
                index={index}
                outcome={outcome}
                onChange={updateActualOutcome}
              />
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
