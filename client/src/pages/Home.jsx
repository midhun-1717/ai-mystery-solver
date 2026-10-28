import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-4xl font-extrabold text-amber-400 sm:text-5xl">AI Mystery Room</h1>
      <p className="mx-auto mt-5 max-w-xl text-zinc-400">
        Give us a premise. Gemini writes a brand-new whodunit with suspects, clues and hints.
        Investigate, find the culprit, and see how well you score.
      </p>
      <Link
        to="/create"
        className="mt-8 inline-block rounded-lg bg-amber-500 px-6 py-3 font-semibold text-zinc-950 hover:bg-amber-400"
      >
        Start Investigation
      </Link>
    </div>
  );
}