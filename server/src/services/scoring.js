import { DIFFICULTY } from "../config/difficulty.js";

export function calculateScore({ correct, difficulty, cluesFound, hintsUsed }) {
  const base = correct ? DIFFICULTY[difficulty].base : 0;
  const clueBonus = cluesFound * 5;
  const hintPenalty = hintsUsed * 10;
  return { base, clueBonus, hintPenalty, total: Math.max(0, base + clueBonus - hintPenalty) };
}