import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import { BOARD } from "@/content/site";

export const metadata: Metadata = {
  title: "The Board",
  description: "The 22nd board of S.A. Mastatine. Four people. Files classified.",
};

/** Widths of the blacked-out lines, varied per file so no two dossiers look copied. */
const REDACTIONS = [
  ["w-11/12", "w-2/3", "w-5/6"],
  ["w-3/4", "w-11/12", "w-1/2"],
  ["w-5/6", "w-3/5", "w-4/5"],
  ["w-2/3", "w-5/6", "w-11/12"],
];
const TILTS = ["-rotate-1", "rotate-1", "rotate-[0.5deg]", "-rotate-[0.5deg]"];

function Silhouette() {
  return (
    <svg viewBox="0 0 120 140" aria-hidden="true" className="h-full w-full">
      <circle cx="60" cy="48" r="26" fill="currentColor" />
      <path d="M8 140c0-34 22-54 52-54s52 20 52 54z" fill="currentColor" />
      <text x="60" y="58" textAnchor="middle" fontSize="30" fontWeight="800" fill="#0a0a0a">
        ?
      </text>
    </svg>
  );
}

export default function BoardPage() {
  return (
    <>
      <PageHeader title="The Board" intro="The 22nd board of S.A. Mastatine. Four files. All classified. We cannot confirm they exist." />
      <div className="container-page">
        <ul className="grid gap-8 pt-4 sm:grid-cols-2 lg:grid-cols-4">
          {BOARD.map((role, i) => (
            <li
              key={role.title}
              className={`card group relative flex flex-col p-5 pt-8 transition duration-300 hover:rotate-0 hover:-translate-y-1 ${TILTS[i % TILTS.length]}`}
            >
              <span
                aria-hidden="true"
                className="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 rotate-2 bg-accent/30"
              />
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.2em] text-muted">
                <span>File {String(i + 1).padStart(2, "0")}</span>
                <span className="rounded border-2 border-accent-text px-1.5 py-0.5 text-accent-text -rotate-6">
                  Classified
                </span>
              </div>

              <div className="relative mt-4 flex h-44 items-end justify-center overflow-hidden rounded-lg bg-ink px-6 pt-4 text-white/55">
                <div className="h-36 w-32 blur-[1px] transition duration-500 group-hover:blur-[5px] group-hover:opacity-50">
                  <Silhouette />
                </div>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0_3px,rgba(255,255,255,0.05)_3px_4px)]"
                />
                <span className="absolute inset-x-0 bottom-3 text-center text-[0.65rem] font-bold uppercase tracking-[0.3em] text-white/0 transition duration-500 group-hover:text-white/80">
                  No photo on file
                </span>
              </div>

              <h2 className="mt-5 text-xl font-extrabold">{role.title}</h2>
              <p className="text-base font-bold text-accent-text">{role.portfolio ?? " "}</p>

              <div className="mt-4 space-y-2" aria-label="Name and details withheld" role="img">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">Name</p>
                <span className="block h-4 w-3/4 rounded-sm bg-ink" />
                {REDACTIONS[i % REDACTIONS.length].map((w, j) => (
                  <span key={j} className={`block h-2.5 rounded-sm bg-ink/80 ${w}`} />
                ))}
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-12 text-center text-base text-muted">
          Clearance required.{" "}
          <Link href="/contact" className="font-semibold text-accent-text underline underline-offset-2">
            Request access
          </Link>{" "}
          (it will be denied).
        </p>
      </div>
    </>
  );
}
