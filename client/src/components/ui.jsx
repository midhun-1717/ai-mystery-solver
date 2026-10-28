import { Link } from "react-router-dom";

export function Loader({ text }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-zinc-400">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-700 border-t-amber-400" />
      <p>{text}</p>
    </div>
  );
}

export function ErrorBox({ message, onRetry }) {
  return (
    <div className="rounded-lg border border-red-900 bg-red-950/40 p-4 text-red-200">
      <p>{message}</p>
      <div className="mt-3 flex gap-3 text-sm">
        {onRetry && (
          <button onClick={onRetry} className="rounded bg-red-800 px-3 py-1 hover:bg-red-700">
            Try again
          </button>
        )}
        <Link to="/" className="rounded border border-red-800 px-3 py-1 hover:bg-red-900/40">
          Home
        </Link>
      </div>
    </div>
  );
}