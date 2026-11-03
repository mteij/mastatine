"use client";

import { useActionState } from "react";
import type { SignupGroup } from "@/lib/signup-options";
import { saveActivity, type ActivityFormState } from "./actions";
import SignupOptionsEditor from "./SignupOptionsEditor";

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
  members_only: boolean;
  signup_options: SignupGroup[];
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
      <div className="flex gap-2">
        <label className="choice-row"><input type="radio" name={name} value="yes" defaultChecked={value} /> Yes</label>
        <label className="choice-row"><input type="radio" name={name} value="no" defaultChecked={!value} /> No</label>
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-5">
      <h2 className="border-b border-line pb-2 text-lg font-extrabold">{title}</h2>
      {children}
    </section>
  );
}

/** Rarely needed options stay folded; their inputs are still part of the form when closed. */
function Fold({ title, open, children }: { title: string; open?: boolean; children: React.ReactNode }) {
  return (
    <details className="fold" open={open}>
      <summary>{title}</summary>
      <div className="fold__body">{children}</div>
    </details>
  );
}

export default function ActivityForm({ values: v, committees }: ActivityFormProps) {
  const [state, action, pending] = useActionState<ActivityFormState, FormData>(saveActivity, {});

  return (
    <form action={action} className="card space-y-8 p-4 sm:p-8">
      {v.id && <input type="hidden" name="id" value={v.id} />}

      <Section title="The basics">
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
          <textarea id="description" name="description" className="input min-h-32" maxLength={5000} defaultValue={v.description} />
        </Field>
        <Field id="poster" label="Poster">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {v.poster_url && <img src={v.poster_url} alt="Current poster" className="mb-3 max-h-48 rounded-xl" />}
          <input id="poster" name="poster" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="input" />
        </Field>
      </Section>

      <Section title="When and where">
        <Field id="location" label="Location">
          <input id="location" name="location" className="input" maxLength={200} defaultValue={v.location} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="starts_at" label="Start date and time">
            <input id="starts_at" name="starts_at" type="datetime-local" className="input" required defaultValue={v.starts_at} />
          </Field>
          <Field id="ends_at" label="Estimated end date and time">
            <input id="ends_at" name="ends_at" type="datetime-local" className="input" defaultValue={v.ends_at} />
          </Field>
        </div>
      </Section>

      <Section title="Price and subscribing">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="cost" label="Base cost (€, empty is free)">
            <input id="cost" name="cost" className="input" inputMode="decimal" pattern="[0-9]+([.,][0-9]{1,2})?" defaultValue={v.cost} />
          </Field>
          <Field id="subscription_limit" label="Subscription limit">
            <input id="subscription_limit" name="subscription_limit" type="number" min={1} className="input" defaultValue={v.subscription_limit} placeholder="No limit" />
          </Field>
          <Field id="subscription_opens_at" label="Subscription opens">
            <input id="subscription_opens_at" name="subscription_opens_at" type="datetime-local" className="input" defaultValue={v.subscription_opens_at} />
          </Field>
          <Field id="subscription_closes_at" label="Subscription closes (empty: at the start)">
            <input id="subscription_closes_at" name="subscription_closes_at" type="datetime-local" className="input" defaultValue={v.subscription_closes_at} />
          </Field>
        </div>
        <label className="choice-row"><input type="checkbox" name="allow_unsubscribe" defaultChecked={v.allow_unsubscribe} /> Allow unsubscribe</label>
        <SignupOptionsEditor initial={v.signup_options} />
      </Section>

      <Section title="Visibility">
        <div>
          <label className="choice-row font-bold"><input type="checkbox" name="is_visible" defaultChecked={v.is_visible} /> Show activity</label>
          <label className="choice-row font-bold"><input type="checkbox" name="members_only" defaultChecked={v.members_only} /> Members only</label>
          <p className="mt-1 px-2 text-sm text-muted">Members-only activities are hidden from everyone who is not a member, and left out of the public calendar.</p>
        </div>
      </Section>

      <Section title="Organisation">
        <Fold title="Attendance, EROs and budget">
          <Field id="estimated_attendees" label="Estimated number of attendees">
            <input id="estimated_attendees" name="estimated_attendees" type="number" min={0} className="input" defaultValue={v.estimated_attendees} />
          </Field>
          <YesNo name="needs_ero" label="Does this activity need EROs/BHV'ers?" value={v.needs_ero} />
          <YesNo name="uses_budget" label="Does this activity use the association budget?" value={v.uses_budget} />
        </Fold>

        <Fold title="Invite the BarCie" open={v.invite_boss}>
          <label className="choice-row font-bold"><input type="checkbox" name="invite_boss" defaultChecked={v.invite_boss} /> Invite the BarCie</label>
          <p className="text-sm text-muted">
            The BarCie can serve drinks for your activity. 30 minutes before the start of the event, they start their preparations at the bar.
            They take care of everything behind the bar, but they will <em>not</em> provide snacks for you. If you have a special request, describe it here.
            Also tell us in advance if you are going to hand out free drink coupons.
          </p>
          <textarea name="boss_note" aria-label="Notes for the BarCie" className="input min-h-24" maxLength={2000} defaultValue={v.boss_note} />
        </Fold>

        <Fold title="Invite the PhotoCie" open={v.invite_flitcie}>
          <label className="choice-row font-bold"><input type="checkbox" name="invite_flitcie" defaultChecked={v.invite_flitcie} /> Invite the PhotoCie</label>
          <p className="text-sm text-muted">The PhotoCie can take pictures of your activity and upload them afterwards. If you have special requests, describe them here.</p>
          <textarea name="flitcie_note" aria-label="Notes for the PhotoCie" className="input min-h-24" maxLength={2000} defaultValue={v.flitcie_note} />
        </Fold>
      </Section>

      {v.id && (
        <Section title="Tell the participants">
          <label className="choice-row font-bold"><input type="checkbox" name="notify_changes" /> Email the participants about this change</label>
          <p className="px-2 text-sm text-muted">Only if the name, time, place or price changed (or you add a note). Leave it off for small edits such as typos.</p>
          <textarea name="change_note" aria-label="Note for the participants" className="input min-h-20" maxLength={1000} placeholder="Optional note, e.g. why it moved" />
        </Section>
      )}

      {state.error && <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{state.error}</p>}
      <div className="savebar">
        <button type="submit" className="btn btn-primary" disabled={pending}>{pending ? "Saving…" : v.id ? "Save changes" : "Save activity"}</button>
        <p className="min-w-0 flex-1 text-sm text-muted">{pending ? "Saving can take a few seconds. Please wait." : "Saving can take a few seconds."}</p>
      </div>
    </form>
  );
}
