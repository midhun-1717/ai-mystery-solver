import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getCase, discoverClue, requestHint, errMsg } from "../api";
import { Loader, ErrorBox, Avatar, ProgressBar } from "../components/ui";
import { LockIcon, CheckIcon, BulbIcon } from "../components/icons";

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
        clues: d.clues.map((c) => (c.id === clue.id ? { ...c, discovered: true, text: r.clue.text } : c)),
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
  if (!data) return <Loader text="Opening the case file" />;

  const found = data.clues.filter((c) => c.discovered).length;
  const hintsLeft = data.hintsAllowed - data.hintsUsed;

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_320px]">
      <div className="min-w-0 space-y-12">
        <section>
          <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs font-medium capitalize text-violet-200 ring-1 ring-violet-300/20">
            {data.difficulty} case
          </span>
          <h1 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            {data.title}
          </h1>
          <p className="mt-5 max-w-prose whitespace-pre-line text-[1.05rem] leading-relaxed text-ink/85">{data.story}</p>
        </section>

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold">
            Suspects <span className="ml-1 text-base font-normal text-mute">{data.suspects.length}</span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {data.suspects.map((s) => (
              <article key={s.id} className="glass p-5">
                <div className="flex items-center gap-3">
                  <Avatar name={s.name} />
                  <div className="min-w-0">
                    <h3 className="font-display font-semibold leading-tight">{s.name}</h3>
                    <p className="text-sm text-violet-300">{s.role}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-ink/80">{s.description}</p>
                <div className="mt-4 border-t border-line pt-4">
                  <p className="text-xs font-semibold text-mute">Alibi</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink/80">{s.alibi}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold">
            Clues{" "}
            <span className="ml-1 text-base font-normal text-mute">
              {found} of {data.clues.length} found
            </span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {data.clues.map((c) =>
              c.discovered ? (
                <article key={c.id} className="reveal glass border-violet-300/30 bg-violet-500/[0.07] p-5">
                  <h3 className="flex items-center gap-2 font-display font-semibold text-violet-200">
                    <CheckIcon width={18} height={18} />
                    {c.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink/85">{c.text}</p>
                </article>
              ) : (
                <button
                  key={c.id}
                  onClick={() => openClue(c)}
                  disabled={busy}
                  className="glass group p-5 text-left transition duration-300 hover:-translate-y-0.5 hover:border-violet-300/40 disabled:opacity-50"
                >
                  <h3 className="flex items-center gap-2 font-display font-semibold">
                    <LockIcon width={18} height={18} className="text-mute transition-colors group-hover:text-violet-300" />
                    {c.title}
                  </h3>
                  <p className="mt-3 text-sm text-mute">Select to investigate</p>
                </button>
              )
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold">Hints</h2>
          {data.revealedHints.length === 0 ? (
            <p className="text-sm text-mute">No hints used yet. Each hint costs 10 points.</p>
          ) : (
            <ul className="space-y-3">
              {data.revealedHints.map((h, i) => (
                <li key={h.id} className="reveal glass flex gap-3 p-4">
                  <BulbIcon className="mt-0.5 shrink-0 text-violet-300" />
                  <p className="text-sm leading-relaxed text-ink/85">
                    <span className="font-semibold text-violet-200">Hint {i + 1}.</span> {h.text}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24">
        <div className="glass space-y-6 p-5">
          <h2 className="font-display text-lg font-semibold">Progress</h2>

          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-mute">Clues found</span>
              <span className="font-semibold">
                {found} of {data.clues.length}
              </span>
            </div>
            <ProgressBar value={found} max={data.clues.length} />
          </div>

          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-mute">Hints used</span>
              <span className="font-semibold">
                {data.hintsUsed} of {data.hintsAllowed}
              </span>
            </div>
            <ProgressBar value={data.hintsUsed} max={data.hintsAllowed} />
          </div>

          <div className="space-y-3 border-t border-line pt-5">
            <button onClick={getHint} disabled={busy || hintsLeft <= 0} className="btn btn-ghost w-full">
              <BulbIcon width={18} height={18} />
              Request a hint
            </button>
            <p className="text-center text-xs text-mute">
              {hintsLeft > 0 ? `Costs 10 points. ${hintsLeft} left.` : "No hints left."}
            </p>
            <Link to={`/case/${id}/accuse`} className="btn btn-primary w-full">
              Make an accusation
            </Link>
          </div>
        </div>

        {notice && <ErrorBox message={notice} showHome={false} />}
      </aside>
    </div>
  );
}
