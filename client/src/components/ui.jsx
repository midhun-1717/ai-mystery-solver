import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertIcon } from "./icons";

export function Loader({ text, steps }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!steps?.length) return;
    const t = setInterval(() => setI((n) => (n + 1) % steps.length), 2600);
    return () => clearInterval(t);
  }, [steps]);

  const headline = steps?.length ? steps[i] : text;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-24 text-center" role="status">
      <div className="relative h-16 w-16">
        <span className="absolute inset-0 animate-ping rounded-full bg-violet-500/25" />
        <span className="absolute inset-2 animate-spin rounded-full border-2 border-white/10 border-t-violet-400" />
      </div>
      <p key={i} className="fade-swap mt-8 font-display text-xl font-semibold">
        {headline}
      </p>
      {steps?.length && text ? <p className="mt-2 text-sm text-mute">{text}</p> : null}
    </div>
  );
}

export function ErrorBox({ message, onRetry, showHome = true }) {
  return (
    <div role="alert" className="flex gap-3 rounded-xl border border-rose-400/25 bg-rose-500/10 p-4 text-rose-100">
      <AlertIcon className="mt-0.5 shrink-0 text-rose-300" />
      <div>
        <p className="text-sm leading-relaxed">{message}</p>
        {(onRetry || showHome) && (
          <div className="mt-3 flex gap-2">
            {onRetry && (
              <button onClick={onRetry} className="btn btn-ghost btn-sm">
                Try again
              </button>
            )}
            {showHome && (
              <Link to="/" className="btn btn-ghost btn-sm">
                Back to home
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function Avatar({ name, size = "md" }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const dims = size === "lg" ? "h-14 w-14 text-lg" : "h-10 w-10 text-sm";
  return (
    <span
      className={`${dims} grid shrink-0 place-items-center rounded-full font-display font-semibold text-violet-100 ring-1 ring-violet-300/25`}
      style={{ background: "linear-gradient(135deg, rgba(167,139,250,.35), rgba(109,40,217,.3))" }}
    >
      {initials}
    </span>
  );
}

export function ProgressBar({ value, max }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-white/10"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className="h-full rounded-full bg-violet-400 transition-all duration-700 ease-out"
        style={{ width: `${pct}%`, boxShadow: "0 0 12px rgba(167,139,250,.7)" }}
      />
    </div>
  );
}
