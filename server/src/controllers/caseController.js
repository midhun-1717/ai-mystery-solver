import mongoose from "mongoose";
import { z } from "zod";
import Case from "../models/Case.js";
import { DIFFICULTY } from "../config/difficulty.js";
import { AppError } from "../middleware/errors.js";
import { generateMystery } from "../services/gemini.js";
import { calculateScore } from "../services/scoring.js";

const createSchema = z.object({
  premise: z.string().trim().min(10).max(300),
  difficulty: z.enum(["easy", "medium", "hard"]),
});
const accuseSchema = z.object({ suspectId: z.string().min(1) });

async function findCase(id, withSolution = false) {
  if (!mongoose.isValidObjectId(id)) throw new AppError(400, "INVALID_ID", "Invalid case id.");
  const query = Case.findById(id);
  if (withSolution) query.select("+solution");
  const found = await query;
  if (!found) throw new AppError(404, "CASE_NOT_FOUND", "Case not found.");
  return found;
}

// The ONLY place a case is converted for the frontend. Secrets never pass through here.
function toPublicCase(doc) {
  const c = doc.toObject();
  const found = new Set(c.progress.discoveredClueIds);
  return {
    id: c._id,
    title: c.title,
    story: c.story,
    difficulty: c.difficulty,
    status: c.status,
    suspects: c.suspects.map((s) => ({ id: s.id, name: s.name, role: s.role, description: s.description, alibi: s.alibi })),
    clues: c.clues.map((cl) =>
      found.has(cl.id)
        ? { id: cl.id, title: cl.title, discovered: true, text: cl.text }
        : { id: cl.id, title: cl.title, discovered: false }
    ),
    hintsUsed: c.progress.hintsUsed,
    hintsAllowed: DIFFICULTY[c.difficulty].hints,
    revealedHints: c.hints.slice(0, c.progress.hintsUsed).map((h) => ({ id: h.id, text: h.text })),
  };
}

function buildResult(c) {
  const culprit = c.suspects.find((s) => s.id === c.solution.culpritId);
  return {
    correct: c.accusation.correct,
    accusedSuspectId: c.accusation.suspectId,
    culprit: { id: culprit.id, name: culprit.name },
    explanation: c.solution.explanation,
    score: {
      base: c.score.base,
      cluesFound: c.progress.discoveredClueIds.length,
      clueBonus: c.score.clueBonus,
      hintsUsed: c.progress.hintsUsed,
      hintPenalty: c.score.hintPenalty,
      total: c.score.total,
    },
  };
}

export async function createCase(req, res) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(400, "VALIDATION_ERROR", "Premise must be 10-300 characters and difficulty must be easy, medium or hard.");
  const { premise, difficulty } = parsed.data;

  const m = await generateMystery(premise, difficulty);
  const created = await Case.create({
    premise, difficulty,
    title: m.title, story: m.story,
    suspects: m.suspects, clues: m.clues, hints: m.hints,
    solution: m.solution,
  });
  res.status(201).json(toPublicCase(created));
}

export async function getCase(req, res) {
  res.json(toPublicCase(await findCase(req.params.id)));
}

export async function discoverClue(req, res) {
  const c = await findCase(req.params.id);
  if (c.status === "completed") throw new AppError(409, "CASE_COMPLETED", "This case is already closed.");
  const clue = c.clues.find((cl) => cl.id === req.params.clueId);
  if (!clue) throw new AppError(404, "CLUE_NOT_FOUND", "Clue not found.");
  if (!c.progress.discoveredClueIds.includes(clue.id)) {
    c.progress.discoveredClueIds.push(clue.id);
    await c.save();
  }
  res.json({
    clue: { id: clue.id, title: clue.title, text: clue.text },
    discoveredCount: c.progress.discoveredClueIds.length,
  });
}

export async function requestHint(req, res) {
  const c = await findCase(req.params.id);
  if (c.status === "completed") throw new AppError(409, "CASE_COMPLETED", "This case is already closed.");
  const allowed = DIFFICULTY[c.difficulty].hints;
  if (c.progress.hintsUsed >= allowed || c.progress.hintsUsed >= c.hints.length)
    throw new AppError(409, "NO_HINTS_LEFT", "No hints left.");
  const hint = c.hints[c.progress.hintsUsed];
  c.progress.hintsUsed += 1;
  await c.save();
  res.json({
    hint: { id: hint.id, text: hint.text },
    hintsUsed: c.progress.hintsUsed,
    hintsRemaining: allowed - c.progress.hintsUsed,
  });
}

export async function accuse(req, res) {
  const parsed = accuseSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(400, "VALIDATION_ERROR", "suspectId is required.");
  const c = await findCase(req.params.id, true);
  if (c.status === "completed") throw new AppError(409, "CASE_COMPLETED", "This case is already closed.");
  const { suspectId } = parsed.data;
  if (!c.suspects.some((s) => s.id === suspectId))
    throw new AppError(400, "VALIDATION_ERROR", "Unknown suspect.");

  const correct = suspectId === c.solution.culpritId;
  const score = calculateScore({
    correct,
    difficulty: c.difficulty,
    cluesFound: c.progress.discoveredClueIds.length,
    hintsUsed: c.progress.hintsUsed,
  });
  c.accusation = { suspectId, correct, accusedAt: new Date() };
  c.score = score;
  c.status = "completed";
  await c.save();
  res.json(buildResult(c));
}

export async function getResult(req, res) {
  const c = await findCase(req.params.id, true);
  if (c.status !== "completed") throw new AppError(403, "CASE_NOT_COMPLETED", "Finish the case first.");
  res.json(buildResult(c));
}