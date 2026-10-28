import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getCase, discoverClue, requestHint, errMsg } from "../api";
import { Loader, ErrorBox } from "../components/ui";

export default function InvestigationRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    getCase(id)
      .then((c) => {
        if (c.status === "completed") navigate(`/case/${id}/result`, { replace: true });
        else setData(c);
      })
      .catch((e) => setError(errMsg(e)));
  }, [id, navigate]);

  async function openClue(clue) {
    if (clue.discovered || busy) return;
    setBusy(true);
    setNotice("");
    try {
      const r = await discoverClue(id, clue.id);
      setData((d) => ({
        ...d,
        clues: d.clues.map((c) =>
          c.id === clue.id ? { ...c, discovered: true, text: r.clue.text } : c
        ),
      }));
    } catch (e) {
      setNotice(errMsg(e));
    } finally {
      setBusy(false);
    }
  }

  async function getHint() {
    if (busy) return;
    setBusy(true);
    setNotice("");
    try {
      const r = await requestHint(id);
      setData((d) => ({
        ...d,
        hintsUsed: r.hintsUsed,
        revealedHints: [...d.revealedHints, r.hint],
      }));
    } catch (e) {
      setNotice(errMsg(e));
    } finally {
      setBusy(false);
    }
  }

  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loader text="Opening the case file…" />;

  const found = data.clues.filter((c) => c.discovered).length;

  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs uppercase tracking-widest text-amber-400">{data.difficulty} case</p>
        <h2 className="mt-1 text-3xl font-bold">{data.title}</h2>
        <p className="mt-4 whitespace-pre-line text-zinc-300">{data.story}</p>
      </section>

      <section className="flex flex-wrap gap-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-sm">
        <span>🔎 Clues found: <b>{found}/{data.clues.length}</b></span>
        <span>💡 Hints used: <b>{data.hintsUsed}/{data.hintsAllowed}</b></span>
      </section>

      {notice && <ErrorBox message={notice} />}

      <section>
        <h3 className="mb-3 text-xl font-semibold">Suspects</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.suspects.map((s) => (
            <div key={s.id} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
              <p className="font-semibold">{s.name}</p>
              <p className="text-sm text-amber-400">{s.role}</p>
              <p className="mt-2 text-sm text-zinc-300">{s.description}</p>
              <p className="mt-2 text-sm text-zinc-400"><b>Alibi:</b> {s.alibi}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-xl font-semibold">Clues</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {data.clues.map((c) =>
            c.discovered ? (
              <div key={c.id} className="rounded-lg border border-amber-700 bg-amber-500/5 p-4">
                <p className="font-semibold text-amber-400">{c.title}</p>
                <p className="mt-2 text-sm text-zinc-300">{c.text}</p>
              </div>
            ) : (
              <button
                key={c.id}
                onClick={() => openClue(c)}
                disabled={busy}
                className="rounded-lg border border-dashed border-zinc-700 bg-zinc-900 p-4 text-left hover:border-amber-500 disabled:opacity-50"
              >
                <p className="font-semibold">🔒 {c.title}</p>
                <p className="mt-1 text-xs text-zinc-500">Click to investigate</p>
              </button>
            )
          )}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xl font-semibold">Hints</h3>
          <button
            onClick={getHint}
            disabled={busy || data.hintsUsed >= data.hintsAllowed}
            className="rounded border border-zinc-600 px-3 py-1 text-sm hover:border-amber-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Request hint (−10 pts)
          </button>
        </div>
        {data.revealedHints.length === 0 ? (
          <p className="text-sm text-zinc-500">No hints used yet.</p>
        ) : (
          <ul className="space-y-2">
            {data.revealedHints.map((h, i) => (
              <li key={h.id} className="rounded-lg bg-zinc-900 p-3 text-sm text-zinc-300">
                <b className="text-amber-400">Hint {i + 1}:</b> {h.text}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="pb-8 text-center">
        <Link
          to={`/case/${id}/accuse`}
          className="inline-block rounded-lg bg-red-600 px-6 py-3 font-semibold hover:bg-red-500"
        >
          Make Accusation
        </Link>
      </div>
    </div>
  );
}