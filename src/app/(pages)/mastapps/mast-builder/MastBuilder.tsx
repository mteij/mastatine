"use client";

import { useState } from "react";
import { useClientValue } from "@/lib/use-client-value";

interface Milestone {
  height: number;
  label: string;
}

const MILESTONES: Milestone[] = [
  { height: 15, label: "You have out-mastered a garden flagpole." },
  { height: 40, label: "That is a full-size GSM mast. Bars for days." },
  { height: 100, label: "Triple digits! Taller than most wind turbines." },
  { height: 185, label: "You matched Rotterdam's Euromast, minus the restaurant." },
  { height: 250, label: "Most high-voltage pylons wish they were this tall." },
  { height: 327, label: "You reached the height of the current Zendmast Smilde, rebuilt shorter after a 2012 storm snapped its top clean off." },
  { height: 367, label: "You topped the Gerbrandytoren near Lopik, the tallest structure in the Netherlands. Respect." },
];

const STORM_LINES = [
  "A storm gust snaps off the top of your mast, just like the real Zendmast Smilde in 2012.",
  "High winds buckle your upper segments. Structural engineering is hard.",
  "Ice load cracks a joint near the top. Down she comes.",
  "A passing goose misjudges the approach and takes out a segment.",
];

const STORAGE_KEY = "mastapp-best-height";
const GOAL_HEIGHT = 400;
const STORM_MIN_HEIGHT = 50;
const STORM_CHANCE = 0.08;

export default function MastBuilder() {
  const [height, setHeight] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [newBest, setNewBest] = useState(0);
  const [log, setLog] = useState<string[]>([]);

  const storedBest = useClientValue(() => Number(localStorage.getItem(STORAGE_KEY) ?? "0") || 0, 0);
  const best = Math.max(storedBest, newBest);

  function build() {
    let next = height + 0.4 + Math.random() * 0.6;
    const events: string[] = [];

    if (next > STORM_MIN_HEIGHT && Math.random() < STORM_CHANCE) {
      const loss = next * (0.15 + Math.random() * 0.25);
      next = Math.max(0, next - loss);
      events.push(`${STORM_LINES[Math.floor(Math.random() * STORM_LINES.length)]} You lose ${loss.toFixed(1)} m.`);
    }
    const reached = MILESTONES.find((m) => height < m.height && next >= m.height);
    if (reached) events.push(`Milestone: ${reached.label}`);

    setHeight(next);
    setClicks((c) => c + 1);
    if (events.length) setLog((l) => [...events, ...l].slice(0, 6));
    if (next > best) {
      setNewBest(next);
      try {
        localStorage.setItem(STORAGE_KEY, next.toFixed(1));
      } catch {
        /* storage unavailable (private mode): the best simply is not saved */
      }
    }
  }

  function reset() {
    setHeight(0);
    setClicks(0);
    setLog([]);
  }

  const progress = Math.min(100, (height / GOAL_HEIGHT) * 100);

  return (
    <div className="space-y-6">
      <div className="card p-6 sm:p-10">
        <div className="mx-auto flex h-64 w-full max-w-xs items-end justify-center rounded-2xl bg-soft px-6" aria-hidden>
          <div
            className="w-5 rounded-t-md bg-gradient-to-t from-ink to-accent transition-[height] duration-200"
            style={{ height: `${Math.max(2, progress)}%` }}
          />
        </div>

        <div className="mt-6 text-center" role="status" aria-live="polite">
          <p className="font-display text-5xl font-extrabold tabular-nums">{height.toFixed(1)} m</p>
          <p className="mt-1 text-sm text-muted">
            {clicks} segments · personal best {best.toFixed(1)} m
          </p>
        </div>

        <div className="mt-6 flex flex-col items-center gap-3">
          <button type="button" onClick={build} className="btn btn-primary px-10 py-3 text-base">
            Add a segment
          </button>
          <button type="button" onClick={reset} className="text-sm text-muted underline hover:text-ink">
            Reset mast
          </button>
        </div>
      </div>

      {log.length > 0 && (
        <section className="card p-6" aria-labelledby="log-title">
          <h2 id="log-title" className="text-lg font-bold">Build log</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {log.map((entry, i) => (
              <li key={`${i}-${entry}`}>{entry}</li>
            ))}
          </ul>
        </section>
      )}

      <p className="rounded-2xl bg-accent-soft p-5 text-sm text-accent-text">
        <strong>Disclaimer:</strong> No real masts are built or harmed by this app. The heights mentioned are real Dutch structures we admire
        from a safe, purely fictional distance.
      </p>
    </div>
  );
}
