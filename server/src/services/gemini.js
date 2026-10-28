import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { DIFFICULTY } from "../config/difficulty.js";
import { AppError } from "../middleware/errors.js";

const text = z.string().trim().min(1);

const mysterySchema = z.object({
  title: text,
  story: text,
  suspects: z.array(z.object({ id: text, name: text, role: text, description: text, alibi: text })),
  clues: z.array(z.object({ id: text, title: text, text, pointsTo: z.string().nullable() })),
  hints: z.array(z.object({ id: text, text })),
  solution: z.object({ culpritId: text, explanation: text }),
});

function buildPrompt(premise, difficulty) {
  const d = DIFFICULTY[difficulty];
  return `You are a mystery writer. Create a fictional, non-graphic whodunit based on this premise: "${premise}".
Do not use real people.

Return ONLY valid JSON, no markdown, in exactly this shape:
{
  "title": "string",
  "story": "string (2-3 paragraphs setting the scene)",
  "suspects": [{"id":"s1","name":"","role":"","description":"","alibi":""}],
  "clues": [{"id":"c1","title":"short label, never names the culprit","text":"full clue","pointsTo":"suspect id or null"}],
  "hints": [{"id":"h1","text":""}],
  "solution": {"culpritId":"s1","explanation":"explain who did it, citing the clues"}
}

Rules:
- Exactly ${d.suspects} suspects (ids s1, s2...), ${d.clues} clues (ids c1, c2...), ${d.hints} hints (ids h1, h2...).
- Exactly one culprit. At least ${d.minCulpritClues} clues must have pointsTo equal to the culprit's id.
- Other clues are red herrings: pointsTo null or an innocent suspect's id, but the culprit must be the only logical answer.
- Hints go from vague to more specific and must NEVER name the culprit.
- Clue titles must NOT contain the culprit's name.
- The explanation must reference the clues that prove the culprit.`;
}

function checkMystery(data, difficulty) {
  const d = DIFFICULTY[difficulty];
  const problems = [];
  if (data.suspects.length !== d.suspects) problems.push("wrong suspect count");
  if (data.clues.length !== d.clues) problems.push("wrong clue count");
  if (data.hints.length !== d.hints) problems.push("wrong hint count");

  const unique = (arr) => new Set(arr.map((x) => x.id)).size === arr.length;
  if (!unique(data.suspects) || !unique(data.clues) || !unique(data.hints)) problems.push("duplicate ids");

  const suspectIds = new Set(data.suspects.map((s) => s.id));
  const culprit = data.suspects.find((s) => s.id === data.solution.culpritId);
  if (!culprit) problems.push("culprit is not a suspect");
  if (data.clues.some((c) => c.pointsTo !== null && !suspectIds.has(c.pointsTo))) problems.push("bad pointsTo");

  if (culprit) {
    const onCulprit = data.clues.filter((c) => c.pointsTo === culprit.id).length;
    if (onCulprit < d.minCulpritClues) problems.push("not enough clues pointing at culprit");
    const name = culprit.name.toLowerCase();
    if (data.hints.some((h) => h.text.toLowerCase().includes(name))) problems.push("hint names culprit");
    if (data.clues.some((c) => c.title.toLowerCase().includes(name))) problems.push("clue title names culprit");
  }
  return problems;
}

export async function generateMystery(premise, difficulty) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: buildPrompt(premise, difficulty),
        config: { responseMimeType: "application/json", temperature: 0.9 },
      });
      const raw = response.text.replace(/```json|```/g, "").trim();
      const data = mysterySchema.parse(JSON.parse(raw));
      const problems = checkMystery(data, difficulty);
      if (problems.length) throw new Error(problems.join(", "));
      return data;
    } catch (err) {
      console.error(`Generation attempt ${attempt} failed:`, err.message);
    }
  }
  throw new AppError(502, "AI_GENERATION_FAILED", "Could not generate a valid mystery. Please try again.");
}