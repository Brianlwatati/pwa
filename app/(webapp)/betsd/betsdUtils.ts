// Utility functions for the jackpot optimizer.
// Handles odds normalization, sampling, evaluation, and ROI calculations.

export type Odds = { H: number; D: number; A: number };
export type Choice = "H" | "D" | "A";

const EPSILON = 1e-12;

// Normalize raw odds into probability values.
// Supports both decimal odds (> 1) and normalized probabilities.
export function normalizeOdds(odds: Odds[]): Odds[] {
  return odds.map((o) => {
    let probs =
      o.H > 1 || o.D > 1 || o.A > 1
        ? { H: 1 / o.H, D: 1 / o.D, A: 1 / o.A }
        : o;

    const total = probs.H + probs.D + probs.A;
    return {
      H: probs.H / total,
      D: probs.D / total,
      A: probs.A / total,
    };
  });
}

// Choose a weighted outcome for a single match based on normalized odds.
export function weightedChoice(o: Odds): Choice {
  const r = Math.random();
  if (r < o.H) return "H";
  if (r < o.H + o.D) return "D";
  return "A";
}

// Generate a single combination string by sampling all matches.
export function generateCombo(odds: Odds[]): string {
  return odds.map((o) => weightedChoice(o)).join("");
}

// Count how many positions match between two combination strings.
export function countMatches(a: string, b: string): number {
  let c = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] === b[i]) c++;
  }
  return c;
}

// Evaluate a combination by simulating and checking if it meets the target hit count.
export function evaluateCombo(
  combo: string,
  odds: Odds[],
  simulations = 2000,
  target = 12,
): number {
  let success = 0;

  for (let i = 0; i < simulations; i++) {
    const result = generateCombo(odds);
    const matches = countMatches(combo, result);

    if (matches >= target) success++;
  }

  return success / simulations;
}

// Compute the Hamming distance (number of differing positions) between two strings.
export function hamming(a: string, b: string): number {
  let d = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) d++;
  }
  return d;
}

// Optimize combinations using Monte Carlo sampling and diversity constraints.
// Generates candidates, scores them, and selects diverse top results.
export function optimizeCombos(
  odds: Odds[],
  nCandidates: number,
  topN: number,
  target: number,
): string[] {
  const candidates: { combo: string; score: number }[] = [];

  // Generate candidates
  for (let i = 0; i < nCandidates; i++) {
    const combo = generateCombo(odds);
    const score = evaluateCombo(combo, odds, 1000, target);
    candidates.push({ combo, score });
  }

  // Sort by best probability
  candidates.sort((a, b) => b.score - a.score);

  // Select diverse combos using Hamming distance constraint
  const selected: string[] = [];

  for (const c of candidates) {
    if (selected.length === 0) {
      selected.push(c.combo);
      continue;
    }

    const minDistance = Math.floor(odds.length * 0.3);

    if (selected.every((s) => hamming(s, c.combo) >= minDistance)) {
      selected.push(c.combo);
    }

    if (selected.length >= topN) break;
  }

  return selected;
}

// Simulate jackpot results across many iterations.
// Returns distribution of hit counts achieved by the combo set.
export function simulateJackpot(
  odds: Odds[],
  combos: string[],
  simulations = 10000,
): Record<number, number> {
  const dist: Record<number, number> = {};

  for (let i = 0; i < simulations; i++) {
    const result = generateCombo(odds);

    let best = 0;
    for (const c of combos) {
      const m = countMatches(c, result);
      if (m > best) best = m;
    }

    dist[best] = (dist[best] || 0) + 1;
  }

  return dist;
}

// Calculate ROI based on hit distribution and payout structure.
export interface ROIResult {
  expected: number;
  cost: number;
  roi: number;
}

export function calculateROI(
  dist: Record<number, number>,
  simulations: number,
  ticketCost: number,
  numTickets: number,
): ROIResult {
  const payouts: Record<number, number> = {
    12: 50,
    13: 200,
    14: 1000,
    15: 5000,
    16: 50000,
    17: 500000,
  };

  let expected = 0;

  for (const [k, v] of Object.entries(dist)) {
    const hits = Number(k);
    const prob = v / simulations;
    expected += prob * (payouts[hits] || 0);
  }

  const cost = ticketCost * numTickets;

  return {
    expected,
    cost,
    roi: (expected - cost) / cost,
  };
}
