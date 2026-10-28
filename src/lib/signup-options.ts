import { z } from "zod";

/** Pure helpers for activity signup options. No database access, so client components can import them too. */

export interface SignupChoice {
  id: string;
  label: string;
  /** Added to the activity's base cost; may be negative (a cheaper alcohol-free option). */
  price_cents: number;
}

export interface SignupGroup {
  id: string;
  label: string;
  required: boolean;
  choices: SignupChoice[];
}

/** What a member picked, stored with their subscription. Labels are copied so later edits to the options change nothing. */
// A type alias, not an interface: sql.json() only accepts shapes with an index signature.
export type SignupPick = {
  group: string;
  choice: string;
  price_cents: number;
};

export const MAX_GROUPS = 6;
export const MAX_CHOICES = 12;
const MAX_ADJUSTMENT_CENTS = 100_000;

const id = z.string().regex(/^[A-Za-z0-9_-]{1,24}$/);
const label = z.string().trim().min(1).max(60);

export const signupGroupsSchema = z
  .array(
    z.object({
      id,
      label,
      required: z.boolean(),
      choices: z
        .array(z.object({ id, label, price_cents: z.number().int().min(-MAX_ADJUSTMENT_CENTS).max(MAX_ADJUSTMENT_CENTS) }))
        .min(1)
        .max(MAX_CHOICES),
    }),
  )
  .max(MAX_GROUPS)
  .refine((groups) => new Set(groups.map((g) => g.id)).size === groups.length, "Duplicate group")
  .refine((groups) => groups.every((g) => new Set(g.choices.map((c) => c.id)).size === g.choices.length), "Duplicate option");

/** Reads options from the database defensively: anything malformed counts as "no options". */
export function parseSignupGroups(raw: unknown): SignupGroup[] {
  const parsed = signupGroupsSchema.safeParse(raw);
  return parsed.success ? parsed.data : [];
}

export function formatEuro(cents: number): string {
  return `€ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

/** "+ € 1,50" / "- € 1,00", or "" when the option does not change the price. */
export function formatAdjustment(cents: number): string {
  if (cents === 0) return "";
  return `${cents > 0 ? "+" : "-"} ${formatEuro(Math.abs(cents))}`;
}

/** Cheapest and most expensive total over every possible combination of choices. */
export function priceRange(baseCents: number | null, groups: SignupGroup[]): { min: number; max: number } {
  let min = baseCents ?? 0;
  let max = baseCents ?? 0;
  for (const group of groups) {
    const prices = group.choices.map((c) => c.price_cents);
    // An optional group can also be skipped, which adds nothing.
    if (!group.required) prices.push(0);
    min += Math.min(...prices);
    max += Math.max(...prices);
  }
  return { min, max };
}

/** "For free", "€ 5,00" or "€ 5,00 to € 7,50". */
export function priceLabel(baseCents: number | null, groups: SignupGroup[]): string {
  const { min, max } = priceRange(baseCents, groups);
  if (max <= 0) return "For free";
  return min === max ? formatEuro(min) : `${formatEuro(min)} to ${formatEuro(max)}`;
}

/** Validates a member's selection (group id -> choice id) and prices it. */
export function quoteSignup(
  baseCents: number | null,
  groups: SignupGroup[],
  selection: Record<string, string>,
): { price_cents: number; picks: SignupPick[] } | { error: string } {
  let total = baseCents ?? 0;
  const picks: SignupPick[] = [];
  for (const group of groups) {
    const chosen = selection[group.id];
    if (!chosen) {
      if (group.required) return { error: `Pick an option for "${group.label}".` };
      continue;
    }
    const choice = group.choices.find((c) => c.id === chosen);
    if (!choice) return { error: `That is not an option for "${group.label}".` };
    total += choice.price_cents;
    picks.push({ group: group.label, choice: choice.label, price_cents: choice.price_cents });
  }
  if (total < 0) return { error: "The total price cannot be negative." };
  return { price_cents: total, picks };
}

/** Rejects option sets whose cheapest combination would go below zero. */
export function lowestTotalIsValid(baseCents: number | null, groups: SignupGroup[]): boolean {
  return priceRange(baseCents, groups).min >= 0;
}

/** Counts picks per "Group: Choice", for the organisers' overview. */
export function tallyPicks(allPicks: SignupPick[][]): { key: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const picks of allPicks) {
    for (const p of picks) counts.set(`${p.group}: ${p.choice}`, (counts.get(`${p.group}: ${p.choice}`) ?? 0) + 1);
  }
  return [...counts].map(([key, count]) => ({ key, count })).sort((a, b) => a.key.localeCompare(b.key));
}
