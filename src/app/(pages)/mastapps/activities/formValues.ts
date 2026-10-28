import type { Activity } from "@/lib/activities";
import { toLocalInput } from "@/lib/datetime";
import type { ActivityFormValues } from "./ActivityForm";

export function emptyActivityValues(committeeId?: string): ActivityFormValues {
  return {
    committee_id: committeeId,
    name: "",
    description: "",
    location: "",
    cost: "",
    subscription_limit: "",
    estimated_attendees: "",
    starts_at: "",
    ends_at: "",
    subscription_opens_at: toLocalInput(new Date()),
    subscription_closes_at: "",
    allow_unsubscribe: true,
    needs_ero: false,
    uses_budget: false,
    invite_boss: false,
    boss_note: "",
    invite_flitcie: false,
    flitcie_note: "",
    is_visible: true,
    poster_url: null,
  };
}

export function activityToValues(a: Activity): ActivityFormValues {
  return {
    id: a.id,
    committee_id: a.committee_id,
    name: a.name,
    description: a.description,
    location: a.location,
    cost: a.cost_cents ? (a.cost_cents / 100).toFixed(2) : "",
    subscription_limit: a.subscription_limit?.toString() ?? "",
    estimated_attendees: a.estimated_attendees?.toString() ?? "",
    starts_at: toLocalInput(a.starts_at),
    ends_at: toLocalInput(a.ends_at),
    subscription_opens_at: toLocalInput(a.subscription_opens_at),
    subscription_closes_at: toLocalInput(a.subscription_closes_at),
    allow_unsubscribe: a.allow_unsubscribe,
    needs_ero: a.needs_ero,
    uses_budget: a.uses_budget,
    invite_boss: a.invite_boss,
    boss_note: a.boss_note,
    invite_flitcie: a.invite_flitcie,
    flitcie_note: a.flitcie_note,
    is_visible: a.is_visible,
    poster_url: a.poster_url,
  };
}
