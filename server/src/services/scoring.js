import { DIFFICULTY } from "../config/difficulty.js";

// Time bonus: starts at 50 and loses 1 point every 12 seconds (gone after 10 minutes).
export const TIME_BONUS_MAX = 50;
export const SECONDS_PER_POINT = 12;
// Flat bonus for solving without opening every clue.
export const CLUE_BONUS = 5;

export function timeBonusFor(elapsedSeconds) {
  return Math.max(0, TIME_BONUS_MAX - Math.floor(elapsedSeconds / SECONDS_PER_POINT));
}

// Opening clues never earns or costs points by itself.
// Only one flat +5 exists: it is kept if the player did NOT open every clue.
// Hints cost 10 points each. Bonuses only count for a correct accusation.
export function calculateScore({ correct, difficulty, elapsedSeconds, hintsUsed, cluesOpened, totalClues }) {
  const base = correct ? DIFFICULTY[difficulty].base : 0;
  const timeBonus = correct ? timeBonusFor(elapsedSeconds) : 0;
  const clueBonus = correct && cluesOpened < totalClues ? CLUE_BONUS : 0;
  const hintPenalty = hintsUsed * 10;
  return {
    base,
    timeBonus,
    clueBonus,
    hintPenalty,
    elapsedSeconds,
    total: Math.max(0, base + timeBonus + clueBonus - hintPenalty),
  };
}
