import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCase, errMsg } from "../api";
import { Loader, ErrorBox } from "../components/ui";

const LEVELS = [
  { key: "easy", label: "Easy", info: "3 suspects · 5 clues · 2 hints" },
  { key: "medium", label: "Medium", info: "4 suspects · 7 clues · 3 hints" },
  { key: "hard", label: "Hard", info: "5 suspects · 9 clues · 3 hints" },
];

export default function CreateMystery() {
  const navigate = useNavigate();
  const [premise, setPremise] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const valid = premise.trim().length >= 10 && premise.trim().length <= 300;

  async function submit(e) {
    e.preventDefault();
    if (!valid || loading) return;
    setLoading(true);
    setError("");
    try {
      const c = await createCase(premise.trim(), difficulty);
      navigate(`/case/${c.id}`);
    } catch (err) {
      setError(errMsg(err));
      setLoading(false);
    }
  }

  if (loading) return <Loader text="Gathering evidence… this can take up to 20 seconds." />;

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="text-2xl font-bold">Create a Mystery</h2>
      <form onSubmit={submit} className="mt-6 space-y-6">
        <div>
          <label className="mb-2 block text-sm text-zinc-400">Premise</label>
          <textarea
            value={premise}
            onChange={(e) => setPremise(e.target.value)}
            rows={4}
            maxLength={300}
            placeholder="e.g. A theft during a college fest"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3 outline-none focus:border-amber-500"
          />
          <p className="mt-1 text-right text-xs text-zinc-500">{premise.trim().length}/300 (min 10)</p>
        </div>

        <div>
          <label className="mb-2 block text-sm text-zinc-400">Difficulty</label>
          <div className="grid gap-3 sm:grid-cols-3">
            {LEVELS.map((l) => (
              <button
                type="button"
                key={l.key}
                onClick={() => setDifficulty(l.key)}
                className={`rounded-lg border p-3 text-left ${
                  difficulty === l.key
                    ? "border-amber-500 bg-amber-500/10"
                    : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"
                }`}
              >
                <p className="font-semibold">{l.label}</p>
                <p className="text-xs text-zinc-400">{l.info}</p>
              </button>
            ))}
          </div>
        </div>

        {error && <ErrorBox message={error} />}

        <button
          type="submit"
          disabled={!valid}
          className="w-full rounded-lg bg-amber-500 py-3 font-semibold text-zinc-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Generate Mystery
        </button>
      </form>
    </div>
  );
}