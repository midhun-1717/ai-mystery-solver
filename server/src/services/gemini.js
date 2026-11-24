const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function generateMystery(premise, difficulty) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const models = [
    process.env.GEMINI_MODEL || "gemini-2.5-flash",
    process.env.GEMINI_FALLBACK_MODEL,
  ].filter(Boolean);

  for (let attempt = 1; attempt <= 3; attempt++) {
    const model = models[(attempt - 1) % models.length];
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
      console.error(`Generation attempt ${attempt} (${model}) failed:`, err.message);
      await sleep(attempt * 1500);
    }
  }
  throw new AppError(502, "AI_GENERATION_FAILED", "Could not generate a valid mystery. Please try again.");
}