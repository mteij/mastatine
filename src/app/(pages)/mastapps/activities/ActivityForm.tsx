"use client";

import { useActionState } from "react";
import { saveActivity, type ActivityFormState } from "./actions";

export interface ActivityFormValues {
  id?: string;
  committee_id?: string;
  name: string;
  description: string;
  location: string;
  cost: string;
  subscription_limit: string;
  estimated_attendees: string;
  starts_at: string;
  ends_at: string;
  subscription_opens_at: string;
  subscription_closes_at: string;
  allow_unsubscribe: boolean;
  needs_ero: boolean;
  uses_budget: boolean;
  invite_boss: boolean;
  boss_note: string;
  invite_flitcie: boolean;
  flitcie_note: string;
  is_visible: boolean;
  poster_url: string | null;
}

interface ActivityFormProps {
  values: ActivityFormValues;
  committees: { id: string; name: string }[];
}

function YesNo({ name, label, value }: { name: string; label: string; value: boolean }) {
  return (
    <fieldset>
      <legend className="label">{label}</legend>
      <div className="flex gap-6">
        <label className="inline-flex items-center gap-2"><input type="radio" name={name} value="yes" defaultChecked={value} /> Yes</label>
        <label className="inline-flex items-center gap-2"><input type="radio" name={name} value="no" defaultChecked={!value} /> No</label>
      </div>
    </fieldset>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      {children}
    </div>
  );
}

export default function ActivityForm({ values: v, committees }: ActivityFormProps) {
  const [state, action, pending] = useActionState<ActivityFormState, FormData>(saveActivity, {});

  return (
    <form action={action} className="card space-y-5 p-6 sm:p-8">
      {v.id && <input type="hidden" name="id" value={v.id} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Name">
          <input id="name" name="name" className="input" required maxLength={120} defaultValue={v.name} />
        </Field>
        <Field id="committee_id" label="Committee">
          <select id="committee_id" name="committee_id" className="input" required defaultValue={v.committee_id ?? ""}>
            <option value="" disabled>Choose a committee</option>
            {committees.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
      </div>

      <Field id="description" label="Description">
        <textarea id="description" name="description" className="input min-h-40" maxLength={5000} defaultValue={v.description} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field id="location" label="Location">
          <input id="location" name="location" className="input" maxLength={200} defaultValue={v.location} />
        </Field>
        <Field id="cost" label="Cost (€, empty is free)">
          <input id="cost" name="cost" className="input" inputMode="decimal" pattern="[0-9]+([.,][0-9]{1,2})?" defaultValue={v.cost} />
        </Field>
        <Field id="subscription_limit" label="Subscription limit">
          <input id="subscription_limit" name="subscription_limit" type="number" min={1} className="input" defaultValue={v.subscription_limit} placeholder="No limit" />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field id="estimated_attendees" label="Estimated number of attendees">
          <input id="estimated_attendees" name="estimated_attendees" type="number" min={0} className="input" defaultValue={v.estimated_attendees} />
        </Field>
        <Field id="starts_at" label="Start date and time">
          <input id="starts_at" name="starts_at" type="datetime-local" className="input" required defaultValue={v.starts_at} />
        </Field>
        <Field id="ends_at" label="Estimated end date and time">
          <input id="ends_at" name="ends_at" type="datetime-local" className="input" defaultValue={v.ends_at} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="subscription_opens_at" label="Subscription open">
          <input id="subscription_opens_at" name="subscription_opens_at" type="datetime-local" className="input" defaultValue={v.subscription_opens_at} />
        </Field>
        <Field id="subscription_closes_at" label="Subscription closed (empty: at the start)">
          <input id="subscription_closes_at" name="subscription_closes_at" type="datetime-local" className="input" defaultValue={v.subscription_closes_at} />
        </Field>
      </div>

      <label className="flex items-center gap-2"><input type="checkbox" name="allow_unsubscribe" defaultChecked={v.allow_unsubscribe} /> Allow unsubscribe</label>

      <div className="grid gap-5 sm:grid-cols-2">
        <YesNo name="needs_ero" label="Does this activity need EROs/BHV'ers?" value={v.needs_ero} />
        <YesNo name="uses_budget" label="Does this activity use Astatine budget?" value={v.uses_budget} />
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 font-bold"><input type="checkbox" name="invite_boss" defaultChecked={v.invite_boss} /> Invite BOSS</label>
        <p className="text-sm text-muted">
          The BOSS can serve drinks for your activity. 30 minutes before the start of the event, the BOSS starts their preparations in the TAP.
          They take care of everything behind the bar, but they will <em>not</em> provide snacks for you. If you have a special request, describe it here.
          Also tell us in advance if you are going to hand out free drink coupons.
        </p>
        <textarea name="boss_note" aria-label="Notes for the BOSS" className="input min-h-24" maxLength={2000} defaultValue={v.boss_note} />
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 font-bold"><input type="checkbox" name="invite_flitcie" defaultChecked={v.invite_flitcie} /> Invite FlitCie</label>
        <p className="text-sm text-muted">The FlitCie can take pictures of your activity and upload them afterwards. If you have special requests, describe them here.</p>
        <textarea name="flitcie_note" aria-label="Notes for the FlitCie" className="input min-h-24" maxLength={2000} defaultValue={v.flitcie_note} />
      </div>

      <label className="flex items-center gap-2 font-bold"><input type="checkbox" name="is_visible" defaultChecked={v.is_visible} /> Show activity</label>

      <Field id="poster" label="Poster">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {v.poster_url && <img src={v.poster_url} alt="Current poster" className="mb-3 max-h-48 rounded-xl" />}
        <input id="poster" name="poster" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="input" />
      </Field>

      {state.error && <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{state.error}</p>}
      <p className="text-sm text-muted">Saving an activity might take a few seconds. Please wait and do not press the button multiple times.</p>
      <button type="submit" className="btn btn-primary" disabled={pending}>{pending ? "Saving…" : v.id ? "Save changes" : "Save activity"}</button>
    </form>
  );
}
