import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getResult, errMsg } from "../api";
import { Loader, ErrorBox, Avatar } from "../components/ui";
import { CheckIcon, AlertIcon } from "../components/icons";

function useCountUp(target, ms = 1100) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - start) / ms);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return n;
}

function Row({ label, value, negative }) {
  return (
    <div className="flex justify-between py-3 text-sm">
      <dt className="text-mute">{label}</dt>
      <dd className={`font-semibold ${negative ? "text-rose-300" : ""}`}>{value}</dd>
    </div>
  );
}

export default function Results() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [r, setR] = useState(null);
  const [error, setError] = useState("");
  const shownScore = useCountUp(r?.score.total ?? 0);

  useEffect(() => {
    getResult(id)
      .then(setR)
      .catch((e) => {
        if (e.response?.status === 403) navigate(`/case/${id}`, { replace: true });
        else setError(errMsg(e));
      });
  }, [id, navigate]);

  if (!r) return error ? <ErrorBox message={error} /> : <Loader text="Reading the verdict" />;

  const s = r.score;
  const tone = r.correct
    ? "border-emerald-300/30 bg-emerald-400/[0.07]"
    : "border-rose-300/30 bg-rose-400/[0.07]";

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <section className={`glass reveal p-8 ${tone}`}>
          <span
            className={`grid h-12 w-12 place-items-center rounded-full ${
              r.correct ? "bg-emerald-400/15 text-emerald-300" : "bg-rose-400/15 text-rose-300"
            }`}
          >
            {r.correct ? <CheckIcon width={24} height={24} /> : <AlertIcon width={24} height={24} />}
          </span>
          <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight">
            {r.correct ? "Case solved" : "Wrong accusation"}
          </h1>
          <div className="mt-5 flex items-center gap-3">
            <Avatar name={r.culprit.name} size="lg" />
            <p className="text-ink/85">
              The culprit was <span className="font-semibold text-ink">{r.culprit.name}</span>.
            </p>
          </div>
        </section>

        <section className="glass p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold">How it was solved</h2>
          <p className="mt-4 max-w-prose whitespace-pre-line leading-relaxed text-ink/85">{r.explanation}</p>
        </section>
      </div>

      <aside className="glass p-6 lg:sticky lg:top-24">
        <p className="text-sm text-mute">Total score</p>
        <p className="mt-1 font-display text-6xl font-semibold tabular-nums tracking-tight">{shownScore}</p>

        <dl className="mt-6 divide-y divide-line border-t border-line">
          <Row label="Correct accusation" value={`+${s.base}`} />
          <Row label={`Clues found (${s.cluesFound} x 5)`} value={`+${s.clueBonus}`} />
          <Row label={`Hints used (${s.hintsUsed} x 10)`} value={s.hintPenalty > 0 ? `-${s.hintPenalty}` : "0"} negative={s.hintPenalty > 0} />
        </dl>

        <Link to="/create" className="btn btn-primary mt-6 w-full py-3.5">
          Start a new case
        </Link>
      </aside>
    </div>
  );
}
