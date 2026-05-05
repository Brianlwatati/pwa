// Betting utility helpers used by the betsb page.
// This module is intentionally pure and contains no React-specific logic.

export type Odds = {
  H: number;
  D: number;
  A: number;
};

export type Choice = "H" | "D" | "A";

// Small epsilon to avoid log(0) when scoring combinations.
const EPSILON = 1e-12;

// Convert raw odds into normalized probability values.
// Supports both decimal odds (> 1) and already-normalized probabilities.
export function convertToProbabilities(odds: Odds): Odds {
  if (Object.values(odds).some((v) => v <= 0)) {
    throw new Error("All odds must be positive");
  }

  let probs: Odds;

  if (Object.values(odds).some((v) => v > 1)) {
    probs = {
      H: 1 / odds.H,
      D: 1 / odds.D,
      A: 1 / odds.A,
    };
  } else {
    probs = odds;
  }

  const total = probs.H + probs.D + probs.A;

  return {
    H: probs.H / total,
    D: probs.D / total,
    A: probs.A / total,
  };
}

// Normalize a list of match odds into probability values.
export function normalizeOdds(list: Odds[]): Odds[] {
  return list.map(convertToProbabilities);
}

// Determine the most likely result for each match using the highest probability.
export function mostLikelyBase(oddsList: Odds[]): string {
  return oddsList
    .map((o) =>
      (Object.keys(o) as Choice[]).reduce((a, b) => (o[a] > o[b] ? a : b)),
    )
    .join("");
}

// Choose a weighted outcome for a single match.
// The probability of H, D, or A is proportional to the normalized odds.
export function weightedChoice(odds: Odds): Choice {
  const r = Math.random();
  const c1 = odds.H;
  const c2 = odds.H + odds.D;

  if (r < c1) return "H";
  if (r < c2) return "D";
  return "A";
}

// Generate a single match combination string from the odds list.
export function generateCombo(oddsList: Odds[]): string {
  return oddsList.map((o) => weightedChoice(o)).join("");
}

// Score a combination using log probability.
// This favors combinations with higher probability across all matches.
export function logScore(combo: string, oddsList: Odds[]): number {
  let score = 0;

  for (let i = 0; i < combo.length; i++) {
    const c = combo[i] as Choice;
    score += Math.log(Math.max(oddsList[i][c], EPSILON));
  }

  return score;
}

// Reward combinations that match the most likely base outcome.
export function weightedSimilarity(
  combo: string,
  base: string,
  oddsList: Odds[],
): number {
  let score = 0;

  for (let i = 0; i < combo.length; i++) {
    if (combo[i] === base[i]) {
      score += Math.max(...Object.values(oddsList[i]));
    }
  }

  return score;
}

// Sample a number of random combinations using the weighted odds.
export function sampleCombinations(
  oddsList: Odds[],
  nSamples: number,
): string[] {
  const arr: string[] = [];

  for (let i = 0; i < nSamples; i++) {
    arr.push(generateCombo(oddsList));
  }

  return arr;
}

// Score and sort combinations by a composite metric.
// The metric blends log probability with weighted similarity to the base.
export function scoreCombos(
  combos: string[],
  oddsList: Odds[],
  base: string,
): { combo: string; score: number }[] {
  const scored = combos.map((combo) => {
    const l = logScore(combo, oddsList);
    const sim = weightedSimilarity(combo, base, oddsList);
    const final = 0.7 * l + 0.3 * sim;

    return { combo, score: final };
  });

  return scored.sort((a, b) => b.score - a.score);
}

// Compute the number of positions that differ between two strings.
export function hammingDistance(a: string, b: string): number {
  let count = 0;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) count++;
  }

  return count;
}

// Select a diverse set of top combinations, enforcing a minimum Hamming distance.
export function selectDiverseTop(
  scored: { combo: string; score: number }[],
  topN: number,
  minDistance: number,
): string[] {
  const selected: string[] = [];

  for (const item of scored) {
    if (selected.length === 0) {
      selected.push(item.combo);
      continue;
    }

    if (selected.every((s) => hammingDistance(item.combo, s) >= minDistance)) {
      selected.push(item.combo);
    }

    if (selected.length >= topN) break;
  }

  return selected;
}
