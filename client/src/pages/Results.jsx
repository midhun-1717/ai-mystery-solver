import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getResult, errMsg } from "../api";
import { Loader, ErrorBox } from "../components/ui";

export default function Results() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [r, setR] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getResult(id)
      .then(setR)
      .catch((e) => {
        if (e.response?.status === 403) navigate(`/case/${id}`, { replace: true });
        else setError(errMsg(e));
      });
  }, [id, navigate]);

  if (!r) return error ? <ErrorBox message={error} /> : <Loader text="Reading the verdict…" />;

  const s = r.score;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div
        className={`rounded-lg border p-6 text-center ${
          r.correct ? "border-green-700 bg-green-500/10" : "border-red-800 bg-red-500/10"
        }`}
      >
        <p className="text-3xl font-extrabold">{r.correct ? "🎉 Case Solved!" : "❌ Wrong Accusation"}</p>
        <p className="mt-2 text-zinc-300">
          The culprit was <b className="text-amber-400">{r.culprit.name}</b>.
        </p>
      </div>

      <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
        <h3 className="mb-2 text-lg font-semibold">How it was solved</h3>
        <p className="whitespace-pre-line text-zinc-300">{r.explanation}</p>
      </section>

      <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
        <h3 className="mb-3 text-lg font-semibold">Score</h3>
        <div className="space-y-1 text-sm">
          <Row label="Correct accusation" value={`+${s.base}`} />
          <Row label={`Clues found (${s.cluesFound} × 5)`} value={`+${s.clueBonus}`} />
          <Row label={`Hints used (${s.hintsUsed} × 10)`} value={`−${s.hintPenalty}`} />
          <div className="mt-2 flex justify-between border-t border-zinc-700 pt-2 text-lg font-bold text-amber-400">
            <span>Total</span>
            <span>{s.total}</span>
          </div>
        </div>
      </section>

      <div className="text-center">
        <Link to="/create" className="inline-block rounded-lg bg-amber-500 px-6 py-3 font-semibold text-zinc-950 hover:bg-amber-400">
          New Mystery
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-zinc-300">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}