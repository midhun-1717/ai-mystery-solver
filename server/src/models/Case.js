import mongoose from "mongoose";

const suspectSchema = new mongoose.Schema(
  { id: String, name: String, role: String, description: String, alibi: String },
  { _id: false }
);
const clueSchema = new mongoose.Schema(
  { id: String, title: String, text: String, pointsTo: { type: String, default: null } },
  { _id: false }
);
const hintSchema = new mongoose.Schema({ id: String, text: String }, { _id: false });
const solutionSchema = new mongoose.Schema(
  { culpritId: String, explanation: String },
  { _id: false }
);

const caseSchema = new mongoose.Schema(
  {
    premise: String,
    title: String,
    story: String,
    difficulty: { type: String, enum: ["easy", "medium", "hard"] },
    suspects: [suspectSchema],
    clues: [clueSchema],
    hints: [hintSchema],
    solution: { type: solutionSchema, select: false },
    progress: {
      discoveredClueIds: { type: [String], default: [] },
      hintsUsed: { type: Number, default: 0 },
    },
    accusation: { suspectId: String, correct: Boolean, accusedAt: Date },
    score: { base: Number, clueBonus: Number, hintPenalty: Number, total: Number },
    status: { type: String, enum: ["active", "completed"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.model("Case", caseSchema);