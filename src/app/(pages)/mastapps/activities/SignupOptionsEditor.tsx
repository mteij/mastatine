"use client";

import { useState } from "react";
import { MAX_CHOICES, MAX_GROUPS, type SignupGroup } from "@/lib/signup-options";

/** Editable copy of a group: prices are text while typing ("2,50"), and become cents when serialised. */
interface DraftChoice { id: string; label: string; price: string }
interface DraftGroup { id: string; label: string; required: boolean; choices: DraftChoice[] }

const newId = () => Math.random().toString(36).slice(2, 10);
const toCents = (price: string) => (price.trim() === "" ? 0 : Math.round(Number(price.replace(",", ".")) * 100));
const toPrice = (cents: number) => (cents === 0 ? "" : (cents / 100).toFixed(2));

const PRESETS: { name: string; group: () => DraftGroup }[] = [
  {
    name: "Drinks",
    group: () => ({
      id: newId(), label: "Drinks", required: true,
      choices: [{ id: newId(), label: "Alcohol", price: "" }, { id: newId(), label: "Alcohol-free (0.0)", price: "" }],
    }),
  },
  {
    name: "Meal",
    group: () => ({
      id: newId(), label: "Meal", required: true,
      choices: [{ id: newId(), label: "Meat", price: "" }, { id: newId(), label: "Vegetarian", price: "" }, { id: newId(), label: "Vegan", price: "" }],
    }),
  },
];

function toDraft(groups: SignupGroup[]): DraftGroup[] {
  return groups.map((g) => ({ ...g, choices: g.choices.map((c) => ({ id: c.id, label: c.label, price: toPrice(c.price_cents) })) }));
}

function serialise(groups: DraftGroup[]): string {
  return JSON.stringify(
    groups.map((g) => ({ id: g.id, label: g.label, required: g.required, choices: g.choices.map((c) => ({ id: c.id, label: c.label, price_cents: toCents(c.price) })) })),
  );
}

/** Lets organisers add choices members pick when subscribing (drinks, meal, ...), each with its own price adjustment. */
export default function SignupOptionsEditor({ initial }: { initial: SignupGroup[] }) {
  const [groups, setGroups] = useState<DraftGroup[]>(() => toDraft(initial));

  const updateGroup = (groupId: string, patch: Partial<DraftGroup>) =>
    setGroups((all) => all.map((g) => (g.id === groupId ? { ...g, ...patch } : g)));
  const updateChoice = (groupId: string, choiceId: string, patch: Partial<DraftChoice>) =>
    setGroups((all) => all.map((g) => (g.id === groupId ? { ...g, choices: g.choices.map((c) => (c.id === choiceId ? { ...c, ...patch } : c)) } : g)));

  return (
    <fieldset className="space-y-4">
      <legend className="label">Signup options</legend>
      <p className="text-sm text-muted">
        Let people choose when they subscribe, for example alcohol or alcohol-free, or meat, vegetarian and vegan.
        Each option can change the price: leave it empty for no change, or enter an amount to add (use a minus to subtract).
        The activity then shows the range from cheapest to most expensive.
      </p>
      <input type="hidden" name="signup_options" value={serialise(groups)} />

      {groups.map((group) => (
        <div key={group.id} className="space-y-3 rounded-xl border border-line bg-soft p-4">
          <div className="flex flex-wrap items-center gap-3">
            <input
              aria-label="Name of this choice, such as Drinks"
              className="input min-w-0 flex-1"
              maxLength={60}
              placeholder="Name, such as Drinks"
              value={group.label}
              onChange={(e) => updateGroup(group.id, { label: e.target.value })}
            />
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={group.required} onChange={(e) => updateGroup(group.id, { required: e.target.checked })} />
              Required
            </label>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setGroups((all) => all.filter((g) => g.id !== group.id))}>
              Remove
            </button>
          </div>

          <ul className="space-y-2">
            {group.choices.map((choice) => (
              <li key={choice.id} className="flex flex-wrap items-center gap-2">
                <input
                  aria-label="Option name"
                  className="input min-w-0 flex-1"
                  maxLength={60}
                  placeholder="Option, such as Vegetarian"
                  value={choice.label}
                  onChange={(e) => updateChoice(group.id, choice.id, { label: e.target.value })}
                />
                <label className="inline-flex items-center gap-1 text-sm">
                  <span aria-hidden>€</span>
                  <input
                    aria-label={`Price change for ${choice.label || "this option"} in euros`}
                    className="input w-24"
                    inputMode="decimal"
                    pattern="-?[0-9]+([.,][0-9]{1,2})?"
                    placeholder="+ 0,00"
                    value={choice.price}
                    onChange={(e) => updateChoice(group.id, choice.id, { price: e.target.value })}
                  />
                </label>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={group.choices.length <= 1}
                  onClick={() => updateGroup(group.id, { choices: group.choices.filter((c) => c.id !== choice.id) })}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={group.choices.length >= MAX_CHOICES}
            onClick={() => updateGroup(group.id, { choices: [...group.choices, { id: newId(), label: "", price: "" }] })}
          >
            Add option
          </button>
        </div>
      ))}

      {groups.length < MAX_GROUPS && (
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setGroups((all) => [...all, { id: newId(), label: "", required: true, choices: [{ id: newId(), label: "", price: "" }] }])}>
            Add a choice
          </button>
          {PRESETS.map((preset) => (
            <button key={preset.name} type="button" className="btn btn-secondary btn-sm" onClick={() => setGroups((all) => [...all, preset.group()])}>
              Add {preset.name.toLowerCase()}
            </button>
          ))}
        </div>
      )}
    </fieldset>
  );
}
