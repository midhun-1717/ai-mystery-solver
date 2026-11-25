import { Routes, Route, Link, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import CreateMystery from "./pages/CreateMystery";
import InvestigationRoom from "./pages/InvestigationRoom";
import Accusation from "./pages/Accusation";
import Results from "./pages/Results";
import { SearchIcon } from "./components/icons";

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-line bg-base/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <Link to="/" className="flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-violet-500/15 text-violet-300 ring-1 ring-violet-300/25">
              <SearchIcon width={18} height={18} />
            </span>
            AI Mystery Room
          </Link>
          <Link to="/create" className="btn btn-ghost btn-sm">
            New case
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
        <div key={location.pathname} className="page-in">
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateMystery />} />
            <Route path="/case/:id" element={<InvestigationRoom />} />
            <Route path="/case/:id/accuse" element={<Accusation />} />
            <Route path="/case/:id/result" element={<Results />} />
            <Route
              path="*"
              element={
                <div className="py-24 text-center">
                  <h1 className="font-display text-3xl font-semibold">Page not found</h1>
                  <p className="mt-2 text-mute">That page does not exist.</p>
                  <Link to="/" className="btn btn-primary mt-6">
                    Back to home
                  </Link>
                </div>
              }
            />
          </Routes>
        </div>
      </main>
    </div>
  );
}
