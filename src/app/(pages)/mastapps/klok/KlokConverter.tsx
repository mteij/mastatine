"use client";

import { useId, useState } from "react";
import { toKlok } from "@/lib/klok";

const REFERENCE = [
  { name: "Garden flagpole", metres: 15 },
  { name: "Euromast, Rotterdam", metres: 185 },
  { name: "Zendmast Smilde", metres: 327 },
  { name: "Gerbrandytoren, Lopik", metres: 367 },
];

const format = (n: number, digits = 0) => n.toLocaleString("en-US", { maximumFractionDigits: digits });

export default function KlokConverter() {
  const id = useId();
  const [metres, setMetres] = useState("100");
  const value = Number(metres);
  const valid = metres.trim() !== "" && Number.isFinite(value) && value >= 0 && value <= 100_000;

  return (
    <div className="space-y-8">
      <div className="card p-6 sm:p-8">
        <label htmlFor={`${id}-m`} className="label">Height in metres</label>
        <input
          id={`${id}-m`}
          className="input !text-lg"
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          value={metres}
          onChange={(e) => setMetres(e.target.value)}
        />
        <div className="mt-6 rounded-2xl bg-accent-soft p-6 text-center" role="status" aria-live="polite">
          {valid ? (
            <>
              <p className="font-display text-5xl font-extrabold tabular-nums text-accent-text">{format(toKlok(value))}</p>
              <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-accent-text">KLOK</p>
            </>
          ) : (
            <p className="text-muted">Enter a height between 0 and 100,000 metres.</p>
          )}
        </div>
      </div>

      <section aria-labelledby="ref-title">
        <h2 id="ref-title" className="text-lg font-bold">Famous structures, in KLOK</h2>
        <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-surface">
          {REFERENCE.map((item) => (
            <li key={item.name} className="flex items-center justify-between gap-4 px-5 py-3.5">
              <span className="font-medium">{item.name}</span>
              <span className="text-right text-sm text-muted">
                <strong className="text-ink tabular-nums">{format(toKlok(item.metres))} KLOK</strong> · {item.metres} m
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted">Heights are approximate.</p>
      </section>
    </div>
  );
}
