import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AppFrame from "@/components/ui/AppFrame";
import { formatCost, formatParticipants, getActivity, getParticipants, subscribeState } from "@/lib/activities";
import { isCommitteeMember } from "@/lib/committees";
import { displayName } from "@/lib/committees";
import { formatDateTime } from "@/lib/datetime";
import { requireUser } from "@/lib/session";
import { subscribe, unsubscribe } from "../actions";

export const metadata: Metadata = { title: "Activity", robots: { index: false } };
export const dynamic = "force-dynamic";

const NOT_SUBSCRIBABLE: Record<string, string> = {
  full: "This activity is full",
  "not-yet": "Subscription has not opened yet",
  closed: "Subscription is closed",
};

export default async function ActivityPage(props: { params: Promise<{ id: string }> }) {
  const { user } = await requireUser();
  const { id } = await props.params;
  const activity = /^[0-9a-f-]{36}$/i.test(id) ? await getActivity(id, user.id) : null;
  const canManage = activity ? await isCommitteeMember(user, activity.committee_id) : false;
  if (!activity || (!activity.is_visible && !canManage)) notFound();

  const state = subscribeState(activity);
  const participants = await getParticipants(activity.id);
  const canUnsubscribe = activity.allow_unsubscribe && activity.starts_at > new Date();

  const rows: [string, React.ReactNode][] = [
    ["Committee", activity.committee_name],
    ["Date", formatDateTime(activity.starts_at)],
    ...(activity.ends_at ? ([["Ends", formatDateTime(activity.ends_at)]] as [string, string][]) : []),
    ...(activity.location ? ([["Location", activity.location]] as [string, string][]) : []),
    ["Cost", formatCost(activity.cost_cents)],
    ["Subscribing", `${activity.subscription_opens_at ? formatDateTime(activity.subscription_opens_at) : "now"} to ${formatDateTime(activity.subscription_closes_at ?? activity.starts_at)}`],
    ["Unsubscribe allowed", activity.allow_unsubscribe ? "Yes" : "No"],
    ["Participants", formatParticipants(activity)],
  ];

  return (
    <AppFrame title={activity.name}>
      {!activity.is_visible && <p className="mb-4 rounded-xl bg-soft px-4 py-3 text-sm">This activity is hidden from the activity list.</p>}
      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <dl className="card grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 p-6">
            {rows.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-right font-bold">{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          {activity.description && <p className="card whitespace-pre-line p-6">{activity.description}</p>}

          <details className="card p-4">
            <summary className="cursor-pointer font-bold">Show subscribed members ({participants.length})</summary>
            <ul className="mt-3 space-y-1">
              {participants.map((p) => <li key={p.id}>{displayName(p)}</li>)}
              {participants.length === 0 && <li className="text-muted">Nobody yet.</li>}
            </ul>
          </details>

          <div className="space-y-3">
            {activity.subscribed ? (
              canUnsubscribe ? (
                <form action={unsubscribe}>
                  <input type="hidden" name="id" value={activity.id} />
                  <button className="btn btn-secondary w-full" type="submit">You are subscribed. Unsubscribe</button>
                </form>
              ) : (
                <button className="btn btn-secondary w-full" type="button" disabled>You are subscribed, and not able to unsubscribe</button>
              )
            ) : state === "open" ? (
              <form action={subscribe}>
                <input type="hidden" name="id" value={activity.id} />
                <button className="btn btn-primary w-full" type="submit">Subscribe</button>
              </form>
            ) : (
              <button className="btn btn-secondary w-full" type="button" disabled>{NOT_SUBSCRIBABLE[state]}</button>
            )}
            <p className="text-xs text-muted">
              By subscribing you are expected at the activity. If you are unable to join, please contact the organising committee or the board.
              If you do not cancel in time, you may still be invoiced the participants&apos; fee or a fine.
            </p>
            <div className="flex gap-3">
              <Link href="/mastapps/activities" className="btn btn-secondary">Go back</Link>
              {canManage && <Link href={`/mastapps/activities/${activity.id}/edit`} className="btn btn-secondary">Edit</Link>}
            </div>
          </div>
        </div>

        {activity.poster_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={activity.poster_url} alt={`Poster for ${activity.name}`} className="w-full rounded-xl" />
        )}
      </div>
    </AppFrame>
  );
}
