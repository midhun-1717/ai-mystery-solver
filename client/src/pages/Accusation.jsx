import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getCase, accuse, errMsg } from "../api";
import { Loader, ErrorBox } from "../components/ui";

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

  if (!data) return error ? <ErrorBox message={error} /> : <Loader text="Loading suspects…" />;

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="text-2xl font-bold">Who did it?</h2>
      <p className="mt-2 text-sm text-red-300">⚠ Your accusation is final. You only get one.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {data.suspects.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelected(s.id)}
            className={`rounded-lg border p-4 text-left ${
              selected === s.id
                ? "border-red-500 bg-red-500/10"
                : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"
            }`}
          >
            <p className="font-semibold">{s.name}</p>
            <p className="text-sm text-amber-400">{s.role}</p>
          </button>
        ))}
      </div>

      {error && <div className="mt-4"><ErrorBox message={error} /></div>}

      <div className="mt-8 flex gap-3">
        <Link to={`/case/${id}`} className="rounded-lg border border-zinc-700 px-5 py-3 hover:border-zinc-500">
          Back to investigation
        </Link>
        <button
          onClick={submit}
          disabled={!selected || busy}
          className="flex-1 rounded-lg bg-red-600 py-3 font-semibold hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "Submitting…" : "Confirm Accusation"}
        </button>
      </div>
    </div>
  );
}