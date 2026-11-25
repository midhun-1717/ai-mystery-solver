import { Link } from "react-router-dom";
import { FileIcon, SearchIcon, TargetIcon, LockIcon, CheckIcon } from "../components/icons";
import { Avatar } from "../components/ui";

const STEPS = [
  {
    icon: FileIcon,
    title: "Describe the premise",
    text: "Pick a setting and a difficulty. The case is written for you in about 20 seconds.",
  },
  {
    icon: SearchIcon,
    title: "Investigate",
    text: "Open clues one at a time. Hints are there when you are stuck, at a small cost to your score.",
  },
  {
    icon: TargetIcon,
    title: "Make your accusation",
    text: "You get one. The verdict, the full explanation and your score follow right away.",
  },
];

function SampleCase() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-violet-600/20 blur-3xl" />
      <div className="glass relative p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-mute">
            <FileIcon width={18} height={18} />
            Sample case
          </div>
          <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs font-medium text-violet-200 ring-1 ring-violet-300/20">
            Open
          </span>
        </div>

        <h2 className="mt-5 font-display text-2xl font-semibold leading-snug">The Case of the Vanished Cup</h2>
        <p className="mt-2 text-sm leading-relaxed text-mute">
          The trophy disappeared minutes before the awards. Everyone has an alibi. Not everyone is telling the truth.
        </p>

        <div className="mt-6 flex items-center gap-3">
          <div className="flex -space-x-2">
            <Avatar name="Marcus Thorne" />
            <Avatar name="Eliza Vance" />
            <Avatar name="Silas Finch" />
          </div>
          <span className="text-sm text-mute">3 suspects</span>
        </div>

        <div className="mt-6 space-y-3">
          <div className="rounded-xl border border-violet-300/25 bg-violet-500/10 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-violet-200">
              <CheckIcon width={16} height={16} />
              Unusual tread marks
            </p>
            <p className="mt-1.5 text-sm text-ink/80">Muddy prints lead from the stage to the storage shed.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-dashed border-line p-4 text-sm text-mute">
            <LockIcon width={16} height={16} />
            A peculiar glint
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="space-y-24">
      <section className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            A new mystery every time you play.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-mute">
            Describe a setting and the AI writes the whole case: a story, a cast of suspects, clues to uncover and hints
            for when you get stuck. Find the culprit using as few hints as you can.
          </p>
          <div className="mt-9">
            <Link to="/create" className="btn btn-primary px-7 py-3.5 text-base">
              Start investigating
            </Link>
          </div>
        </div>
        <SampleCase />
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold tracking-tight">How a case plays out</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="glass p-6 transition duration-300 hover:-translate-y-0.5 hover:border-violet-300/30"
            >
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-violet-500/15 text-violet-300 ring-1 ring-violet-300/20">
                <Icon />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mute">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
