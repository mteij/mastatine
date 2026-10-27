"use client";

import { useState } from "react";
import { useClientValue } from "@/lib/use-client-value";

interface Milestone {
  height: number;
  label: string;
}

const MILESTONES: Milestone[] = [
  { height: 15, label: "You've out-mastered a garden flagpole." },
  { height: 40, label: "That's a full-size GSM mast. Bars for days." },
  { height: 100, label: "Triple digits! Taller than most wind turbines." },
  { height: 185, label: "You've matched Rotterdam's Euromast — minus the restaurant." },
  { height: 250, label: "Most high-voltage pylons wish they were this tall." },
  {
    height: 327,
    label:
      "You've reached the height of the current Zendmast Smilde, rebuilt shorter after a 2012 storm snapped its top clean off.",
  },
  {
    height: 367,
    label: "You've topped the Gerbrandytoren near Lopik — the tallest structure in the Netherlands. Respect.",
  },
];

const STORM_LINES = [
  "A storm gust snaps off the top of your mast — just like the real Zendmast Smilde in 2012.",
  "High winds buckle your upper segments. Structural engineering is hard.",
  "Ice load cracks a joint near the top. Down she comes.",
  "A passing goose misjudges the approach and takes out a segment.",
];

const STORAGE_KEY = "mastapp-best-height";

export default function MastBuilderPage() {
  const [height, setHeight] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [newBest, setNewBest] = useState(0);
  const storedBest = useClientValue(() => Number(localStorage.getItem(STORAGE_KEY) ?? "0") || 0, 0);
  const best = Math.max(storedBest, newBest);
  const [log, setLog] = useState<string[]>([]);

  const handleBuild = () => {
    const prev = height;
    let next = prev + (0.4 + Math.random() * 0.6);
    const events: string[] = [];

    if (next > 50 && Math.random() < 0.08) {
      const loss = next * (0.15 + Math.random() * 0.25);
      next = Math.max(0, next - loss);
      const line = STORM_LINES[Math.floor(Math.random() * STORM_LINES.length)];
      events.push(`⚡ ${line} You lose ${loss.toFixed(1)}m.`);
    }

    const hit = MILESTONES.find((m) => prev < m.height && next >= m.height);
    if (hit) events.push(`🏆 ${hit.label}`);

    setHeight(next);
    setClicks((c) => c + 1);
    if (events.length) setLog((l) => [...events, ...l].slice(0, 6));
    if (next > best) {
      setNewBest(next);
      localStorage.setItem(STORAGE_KEY, next.toFixed(1));
    }
  };

  const handleReset = () => {
    setHeight(0);
    setClicks(0);
    setLog([]);
  };

  const barPct = Math.min(100, (height / 400) * 100);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <a href="/mastapps" className="text-sm text-slate-400 hover:text-[#f57f20] mb-4 inline-block">
        &larr; Back to MastApps
      </a>
      <h1 className="text-3xl font-black text-[#1a2332] mb-2">
        Mast <span className="text-[#f57f20]">Builder</span>
      </h1>
      <p className="text-slate-600 mb-8">
        Build your mast one segment at a time. Watch out for storms.
      </p>

      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col items-center gap-6">
        <div className="flex items-end justify-center w-full" style={{ height: "220px" }}>
          <div
            className="w-6 rounded-t-sm transition-all duration-200"
            style={{
              height: `${Math.max(4, barPct * 2)}px`,
              background: "linear-gradient(to top, var(--navy), var(--orange))",
            }}
          />
        </div>

        <div className="text-center">
          <div className="text-4xl font-black text-[#1a2332]">{height.toFixed(1)}m</div>
          <div className="text-sm text-slate-500 mt-1">
            {clicks} segments added &middot; personal best {best.toFixed(1)}m
          </div>
        </div>

        <button
          onClick={handleBuild}
          className="px-8 py-3 rounded-full font-bold text-white bg-[#f57f20] hover:bg-[#d96c15] transition-colors shadow-md active:scale-95"
        >
          🔧 Add Segment
        </button>

        <button
          onClick={handleReset}
          className="text-sm text-slate-400 hover:text-slate-600 underline"
        >
          Reset mast
        </button>
      </div>

      {log.length > 0 && (
        <div className="mt-6 bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-black text-[#1a2332] mb-3">Build log</h2>
          <ul className="space-y-2 text-sm text-slate-600">
            {log.map((entry, i) => (
              <li key={i}>{entry}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 bg-[#FFF3E8] rounded-xl p-6 border border-[#f57f20]/30">
        <p className="text-[#c05e00] text-sm">
          <strong>Disclaimer:</strong> No real masts are built or harmed by this app. Heights
          referenced (Euromast, Zendmast Smilde, Gerbrandytoren) are real Dutch structures we
          admire from a safe, purely fictional distance. 📡
        </p>
      </div>
    </div>
  );
}
