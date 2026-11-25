import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getCase, accuse, errMsg } from "../api";
import { Loader, ErrorBox, Avatar } from "../components/ui";
import { AlertIcon, CheckIcon } from "../components/icons";

export default function Accusation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getCase(id)
      .then((c) => {
        if (c.status === "completed") navigate(`/case/${id}/result`, { replace: true });
        else setData(c);
      })
      .catch((e) => setError(errMsg(e)));
  }, [id, navigate]);

  async function submit() {
    if (!selected || busy) return;
    setBusy(true);
    setError("");
    try {
      await accuse(id, selected);
      navigate(`/case/${id}/result`);
    } catch (e) {
      setError(errMsg(e));
      setBusy(false);
    }
  }

  if (!data) return error ? <ErrorBox message={error} /> : <Loader text="Loading suspects" />;

  const chosen = data.suspects.find((s) => s.id === selected);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Who did it?</h1>
      <p className="mt-2 text-mute">Choose the suspect you believe is the culprit.</p>

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-300/20 bg-amber-400/[0.07] p-4 text-sm text-amber-100">
        <AlertIcon className="mt-0.5 shrink-0 text-amber-300" width={18} height={18} />
        <p className="leading-relaxed">Your accusation is final. You only get one, so review your clues first.</p>
      </div>

      <div role="radiogroup" aria-label="Suspects" className="mt-8 grid gap-4 sm:grid-cols-2">
        {data.suspects.map((s) => {
          const active = selected === s.id;
          return (
            <button
              key={s.id}
              role="radio"
              aria-checked={active}
              onClick={() => setSelected(s.id)}
              className={`glass relative p-5 text-left transition duration-300 ${
                active ? "glow-selected border-violet-300/60 bg-violet-500/10" : "hover:-translate-y-0.5 hover:border-violet-300/30"
              }`}
            >
              <span
                className={`absolute right-4 top-4 grid h-6 w-6 place-items-center rounded-full bg-violet-500 text-white transition duration-300 ${
                  active ? "scale-100 opacity-100" : "scale-75 opacity-0"
                }`}
              >
                <CheckIcon width={14} height={14} strokeWidth={2.4} />
              </span>
              <div className="flex items-center gap-3 pr-8">
                <Avatar name={s.name} size="lg" />
                <div className="min-w-0">
                  <h2 className="font-display text-lg font-semibold leading-tight">{s.name}</h2>
                  <p className="text-sm text-violet-300">{s.role}</p>
                </div>
              </div>
              <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-mute">{s.alibi}</p>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mt-6">
          <ErrorBox message={error} showHome={false} />
        </div>
      )}

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
        <Link to={`/case/${id}`} className="btn btn-ghost">
          Back to investigation
        </Link>
        <button onClick={submit} disabled={!selected || busy} className="btn btn-primary flex-1 py-3.5">
          {busy ? "Submitting" : chosen ? `Accuse ${chosen.name}` : "Select a suspect"}
        </button>
      </div>
    </div>
  );
}
