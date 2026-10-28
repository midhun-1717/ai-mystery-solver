import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import CreateMystery from "./pages/CreateMystery";
import InvestigationRoom from "./pages/InvestigationRoom";
import Accusation from "./pages/Accusation";
import Results from "./pages/Results";

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <Link to="/" className="text-lg font-bold tracking-wide text-amber-400">
            🕵️ AI Mystery Room
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateMystery />} />
          <Route path="/case/:id" element={<InvestigationRoom />} />
          <Route path="/case/:id/accuse" element={<Accusation />} />
          <Route path="/case/:id/result" element={<Results />} />
          <Route
            path="*"
            element={
              <p className="py-16 text-center text-zinc-400">
                Page not found. <Link to="/" className="text-amber-400 underline">Go home</Link>
              </p>
            }
          />
        </Routes>
      </main>
    </div>
  );
}