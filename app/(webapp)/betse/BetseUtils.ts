// =============================
// TYPES
// =============================

export const CHOICES = ["H", "D", "A"] as const;
export type Choice = (typeof CHOICES)[number];

export type Odds = {
  H: number;
  D: number;
  A: number;
};

export type Prob = {
  H: number;
  D: number;
  A: number;
};

// =============================
// UTILS
// =============================

// Convert odds → normalized probabilities
export function oddsToProb(odds: Odds): Prob {
  const invH = 1 / odds.H;
  const invD = 1 / odds.D;
  const invA = 1 / odds.A;

  const sum = invH + invD + invA;

  return {
    H: invH / sum,
    D: invD / sum,
    A: invA / sum,
  };
}

// Generate all combinations (cartesian)
export function generateCombinations(n: number): string[] {
  const choices = ["H", "D", "A"];
  let results: string[] = [""];

  for (let i = 0; i < n; i++) {
    const temp: string[] = [];
    for (const prefix of results) {
      for (const c of choices) {
        temp.push(prefix + c);
      }
    }
    results = temp;
  }

  return results;
}

// Score combination
export function scoreCombo(combo: string, probs: Prob[]): number {
  let score = 1;
  combo.split("").forEach((c, i) => {
    score *= probs[i][c as keyof Prob];
  });
  return score;
}

// Rank combinations
export function rankCombinations(probs: Prob[], topN: number): string[] {
  const all = generateCombinations(probs.length);

  const scored = all.map((combo) => ({
    combo,
    score: scoreCombo(combo, probs),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, topN).map((s) => s.combo);
}

// Convert to HD / AD pairs
export function toDoubleChancePairs(combo: string, probs: Prob[]): string {
  return combo
    .split("")
    .map((c, i) => {
      const p = probs[i];

      // Smart handling for Draw
      if (c === "D") {
        return p.H >= p.A ? "HD" : "AD";
      }

      if (c === "H") return "HD";
      if (c === "A") return "AD";

      return c;
    })
    .join(" ");
}
