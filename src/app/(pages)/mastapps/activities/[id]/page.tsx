import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import AppFrame from "@/components/ui/AppFrame";
import { formatParticipants, getActivity, getParticipants, subscribeState } from "@/lib/activities";
import { isCommitteeMember } from "@/lib/committees";
import { displayName } from "@/lib/committees";
import { formatDateTime, formatDayMonth, formatTime, zonedDay } from "@/lib/datetime";
import { getMembership } from "@/lib/membership";
import { hasDisplayName } from "@/lib/profile";
import { getSession } from "@/lib/session";
import { formatAdjustment, formatEuro, parseSignupGroups, priceLabel, tallyByGroup } from "@/lib/signup-options";
import { subscribe, unsubscribe } from "../actions";

export const metadata: Metadata = { title: "Activity" };
export const dynamic = "force-dynamic";

const NOT_SUBSCRIBABLE: Record<string, string> = {
  full: "This activity is full",
  "not-yet": "Subscription has not opened yet",
  closed: "Subscription is closed",
};

const CHIP = "rounded-full bg-soft px-3 py-1 text-sm font-bold";

export default async function ActivityPage(props: { params: Promise<{ id: string }> }) {
  // Public: anyone can read an activity, only subscribing (and the member list) needs an account.
  const session = await getSession();
  const user = session?.user ?? null;
  const { id } = await props.params;
  const activity = /^[0-9a-f-]{36}$/i.test(id) ? await getActivity(id, user?.id ?? null) : null;
  const canManage = activity && user ? await isCommitteeMember(user, activity.committee_id) : false;
  const { isMember } = await getMembership();
  if (!activity || (!activity.is_visible && !canManage) || (activity.members_only && !isMember)) notFound();

  const needsName = !!user && !hasDisplayName(user.name);
  const groups = parseSignupGroups(activity.signup_options);
  const state = subscribeState(activity);
  const participants = user ? await getParticipants(activity.id) : [];
  const tally = tallyByGroup(participants.map((p) => p.choices));
  const columns = tally.map((t) => t.group);
  const canUnsubscribe = activity.allow_unsubscribe && activity.starts_at > new Date();

  const spotsLeft = activity.subscription_limit === null ? null : Math.max(0, activity.subscription_limit - activity.participants);
  const endsSameDay = activity.ends_at !== null && zonedDay(activity.ends_at) === zonedDay(activity.starts_at);
  const when =
    `${formatDayMonth(activity.starts_at)} · ${formatTime(activity.starts_at)}` +
    (activity.ends_at ? ` to ${endsSameDay ? formatTime(activity.ends_at) : formatDateTime(activity.ends_at)}` : "");

  // The facts that matter at a glance are in the summary card; the rest is secondary.
  const details: [string, string][] = [
    ["Subscribing", `${activity.subscription_opens_at ? formatDateTime(activity.subscription_opens_at) : "now"} to ${formatDateTime(activity.subscription_closes_at ?? activity.starts_at)}`],
    ["Unsubscribe allowed", activity.allow_unsubscribe ? "Yes" : "No"],
  ];

  const poster = activity.poster_url && (
    <Image
      src={activity.poster_url}
      alt={`Poster for ${activity.name}`}
      width={800}
      height={1000}
      sizes="(max-width: 1024px) 100vw, 352px"
      className="h-auto w-full rounded-xl"
    />
  );

  return (
    <AppFrame title={activity.name}>
      {!activity.is_visible && <p className="mb-4 rounded-xl bg-soft px-4 py-3 text-sm">This activity is hidden from the activity list.</p>}
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:gap-8">
        <div className="space-y-5">
          {/* 1. What and when */}
          <section className="card p-5 sm:p-6">
            <p className="text-sm font-extrabold uppercase tracking-wide text-accent-text">{activity.committee_name}</p>
            <p className="mt-1 text-2xl font-extrabold leading-tight sm:text-3xl">{when}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {activity.members_only && <li className={`${CHIP} !bg-navy !text-white`}>Members only</li>}
              {activity.location && <li className={CHIP}>{activity.location}</li>}
              <li className={CHIP}>{priceLabel(activity.cost_cents, groups)}</li>
              <li className={CHIP}>
                {formatParticipants(activity)} going{spotsLeft !== null && spotsLeft > 0 && spotsLeft <= 5 ? ` · ${spotsLeft} left` : ""}
              </li>
            </ul>
          </section>

          {/* 2. Join: straight after the facts, so nobody has to scroll to find it */}
          <section id="join" aria-label="Join this activity" className="scroll-mt-4 space-y-3">
            {activity.subscribed && activity.my_price_cents !== null && (
              <p className="rounded-xl bg-soft px-4 py-3 text-sm">
                {(activity.my_choices ?? []).length > 0 && <>Your choices: <strong>{(activity.my_choices ?? []).map((c) => c.choice).join(", ")}</strong>. </>}
                Your price: <strong>{activity.my_price_cents === 0 ? "For free" : formatEuro(activity.my_price_cents)}</strong>.
              </p>
            )}
            {activity.subscribed ? (
              canUnsubscribe ? (
                <form action={unsubscribe}>
                  <input type="hidden" name="id" value={activity.id} />
                  <button className="btn btn-secondary w-full" type="submit">You are going. Unsubscribe</button>
                </form>
              ) : (
                <button className="btn btn-secondary w-full" type="button" disabled>You are going, and not able to unsubscribe</button>
              )
            ) : state === "open" && !user ? (
              <>
              {groups.length > 0 && (
                <div className="card space-y-2 p-4 text-sm">
                  <p className="font-bold">When you subscribe you choose</p>
                  <ul className="space-y-1">
                    {groups.map((g) => (
                      <li key={g.id}>
                        <strong>{g.label}:</strong>{" "}
                        {g.choices.map((c) => `${c.label}${c.price_cents !== 0 ? ` (${formatAdjustment(c.price_cents)})` : ""}`).join(", ")}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <Link href={`/login?next=${encodeURIComponent(`/mastapps/activities/${activity.id}`)}`} className="btn btn-primary w-full py-3 text-base">
                Sign in to join
              </Link>
              </>
            ) : state === "open" && needsName ? (
              <Link href={`/account/name?next=${encodeURIComponent(`/mastapps/activities/${activity.id}`)}`} className="btn btn-primary w-full py-3 text-base">
                Choose a display name to join
              </Link>
            ) : state === "open" ? (
              <form action={subscribe} className="space-y-4">
                <input type="hidden" name="id" value={activity.id} />
                {groups.map((group) => (
                  <fieldset key={group.id} className="card space-y-2 p-4">
                    <legend className="label px-1">{group.label}{group.required ? "" : " (optional)"}</legend>
                    {!group.required && (
                      <label className="flex items-center gap-2"><input type="radio" name={`opt_${group.id}`} value="" defaultChecked /> None</label>
                    )}
                    {group.choices.map((choice) => (
                      <label key={choice.id} className="flex items-center gap-2">
                        <input type="radio" name={`opt_${group.id}`} value={choice.id} required={group.required} />
                        <span>{choice.label}</span>
                        {choice.price_cents !== 0 && <span className="text-sm text-muted">{formatAdjustment(choice.price_cents)}</span>}
                      </label>
                    ))}
                  </fieldset>
                ))}
                <button className="btn btn-primary w-full py-3 text-base" type="submit">Join this activity</button>
              </form>
            ) : (
              <button className="btn btn-secondary w-full" type="button" disabled>{NOT_SUBSCRIBABLE[state]}</button>
            )}
            <p className="text-xs text-muted">
              By subscribing you are expected at the activity. If you are unable to join, please contact the organising committee or the board.
              If you do not cancel in time, you may still be invoiced the participants&apos; fee or a fine.
            </p>
          </section>

          {/* 3. About it */}
          {activity.description && <p className="card whitespace-pre-line p-5 sm:p-6">{activity.description}</p>}

          {/* The poster sits in the side column on large screens, and inline here on phones */}
          {poster && <div className="lg:hidden">{poster}</div>}

          {/* 4. The small print */}
          <dl className="card grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 p-5 text-sm sm:p-6">
            {details.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="font-bold text-muted">{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>

          {user && (
            <details className="card p-4">
              <summary className="cursor-pointer font-bold">Who is going ({participants.length})</summary>
              {canManage && tally.length > 0 && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {tally.map((t) => (
                    <section key={t.group} className="rounded-xl bg-soft p-3">
                      <h3 className="text-sm font-bold text-muted">{t.group}</h3>
                      <ul className="mt-1.5 space-y-1 text-sm">
                        {t.choices.map((c) => (
                          <li key={c.choice} className="flex items-baseline justify-between gap-3">
                            <span>{c.choice}</span>
                            <span className="font-extrabold tabular-nums">{c.count}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              )}
              {participants.length === 0 ? (
                <p className="mt-3 text-muted">Nobody yet.</p>
              ) : canManage && columns.length > 0 ? (
                <div className="table-wrap mt-4">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        {columns.map((group) => <th key={group}>{group}</th>)}
                        <th className="text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participants.map((p) => (
                        <tr key={p.id}>
                          <td className="font-medium">{displayName(p)}</td>
                          {columns.map((group) => <td key={group}>{p.choices.find((c) => c.group === group)?.choice ?? "–"}</td>)}
                          <td className="text-right tabular-nums">{p.price_cents !== null ? formatEuro(p.price_cents) : "–"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <ul className="mt-3 columns-2 gap-6 sm:columns-3">
                  {participants.map((p) => <li key={p.id} className="break-inside-avoid py-0.5">{displayName(p)}</li>)}
                </ul>
              )}
            </details>
          )}

          <div className="flex flex-wrap gap-3">
            <Link href="/mastapps/activities" className="btn btn-secondary">All activities</Link>
            {activity.is_visible && (
              <a href={`/mastapps/activities/${activity.id}/event.ics`} download className="btn btn-secondary">Add to calendar</a>
            )}
            {canManage && <Link href={`/mastapps/activities/${activity.id}/edit`} className="btn btn-secondary">Edit</Link>}
          </div>
        </div>

        {poster && <div className="hidden lg:block">{poster}</div>}
      </div>
    </AppFrame>
  );
}
