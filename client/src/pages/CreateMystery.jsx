import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCase, errMsg } from "../api";
import { Loader, ErrorBox } from "../components/ui";

const LEVELS = {
  easy: { label: "Easy", blurb: "A short case. Good for a first run.", suspects: 3, clues: 5, hints: 2, base: 100 },
  medium: { label: "Medium", blurb: "A fuller cast and a few red herrings.", suspects: 4, clues: 7, hints: 3, base: 150 },
  hard: { label: "Hard", blurb: "A big cast and more to untangle.", suspects: 5, clues: 9, hints: 3, base: 200 },
};

const STEPS = [
  "Writing the story",
  "Casting the suspects",
  "Hiding the clues",
  "Checking the case holds together",
];

function Row({ label, value }) {
  return (
    <div className="flex justify-between py-3">
      <dt className="text-mute">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}

export default function CreateMystery() {
  const navigate = useNavigate();
  const [premise, setPremise] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const len = premise.trim().length;
  const valid = len >= 10 && len <= 300;

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

  if (loading) return <Loader steps={STEPS} text="This usually takes 10 to 20 seconds." />;

  const level = LEVELS[difficulty];

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_340px]">
      <form onSubmit={submit} className="glass space-y-8 p-6 sm:p-8">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Create a mystery</h1>
          <p className="mt-2 text-mute">
            Describe the setting or the event. The more specific you are, the better the case.
          </p>
        </div>

        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <label htmlFor="premise" className="text-sm font-medium">
              Premise
            </label>
            <span className={`text-xs transition-colors ${len >= 10 ? "text-violet-300" : "text-mute"}`}>{len}/300</span>
          </div>
          <textarea
            id="premise"
            className="field"
            rows={5}
            maxLength={300}
            value={premise}
            onChange={(e) => setPremise(e.target.value)}
            placeholder="A theft during a college fest"
          />
          {len > 0 && len < 10 && <p className="mt-2 text-xs text-mute">Write at least 10 characters.</p>}
        </div>

        <fieldset>
          <legend className="mb-3 text-sm font-medium">Difficulty</legend>
          <div role="radiogroup" className="grid gap-3 sm:grid-cols-3">
            {Object.entries(LEVELS).map(([key, l]) => {
              const active = key === difficulty;
              return (
                <button
                  type="button"
                  role="radio"
                  aria-checked={active}
                  key={key}
                  onClick={() => setDifficulty(key)}
                  className={`rounded-xl border p-4 text-left transition duration-300 ${
                    active
                      ? "glow-selected border-violet-300/60 bg-violet-500/10"
                      : "border-line bg-white/[0.02] hover:border-violet-300/30 hover:bg-white/[0.05]"
                  }`}
                >
                  <p className="font-display font-semibold">{l.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-mute">{l.blurb}</p>
                </button>
              );
            })}
          </div>
        </fieldset>

        {error && <ErrorBox message={error} showHome={false} />}

        <button type="submit" disabled={!valid} className="btn btn-primary w-full py-3.5">
          Generate mystery
        </button>
      </form>

      <aside className="glass p-6 lg:sticky lg:top-24">
        <h2 className="font-display text-lg font-semibold">Your case file</h2>
        <p className="mt-1 text-sm text-mute">What you will get on {level.label.toLowerCase()}.</p>
        <dl key={difficulty} className="reveal mt-5 divide-y divide-line text-sm">
          <Row label="Suspects" value={level.suspects} />
          <Row label="Clues" value={level.clues} />
          <Row label="Hints available" value={level.hints} />
          <Row label="Points for solving" value={level.base} />
        </dl>
        <p className="mt-5 rounded-xl bg-white/[0.04] p-4 text-sm leading-relaxed text-mute">
          Each clue you open adds 5 points. Each hint takes away 10. A wrong accusation earns no solving points.
        </p>
      </aside>
    </div>
  );
}
