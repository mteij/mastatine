import type { Metadata } from "next";
import Link from "next/link";
import AppFrame from "@/components/ui/AppFrame";
import { zonedDay } from "@/lib/datetime";
import { getMeetings, getMyActions, type ActionPoint, type Meeting } from "@/lib/meetings";
import { requireUser } from "@/lib/session";
import ActionList from "./ActionList";
import MeetingRow from "./MeetingRow";

export const metadata: Metadata = { title: "Minutes", description: "Agendas, minutes and action points.", robots: { index: false } };
export const dynamic = "force-dynamic";

function Section({ title, meetings, empty }: { title: string; meetings: Meeting[]; empty?: string }) {
  return (
    <section className="mt-8 first:mt-0">
      <h2 className="mb-3 text-xl font-extrabold text-accent-text">{title}</h2>
      {meetings.length === 0 ? (
        <p className="text-muted">{empty ?? "No meetings found."}</p>
      ) : (
        <ul className="card divide-y divide-line">{meetings.map((m) => <MeetingRow key={m.id} meeting={m} />)}</ul>
      )}
    </section>
  );
}

function groupByCommittee(actions: ActionPoint[]): [string, ActionPoint[]][] {
  const groups = new Map<string, ActionPoint[]>();
  for (const a of actions) groups.set(a.committee_name, [...(groups.get(a.committee_name) ?? []), a]);
  return [...groups];
}

export default async function MinutesDashboard() {
  const { user } = await requireUser();
  const [meetings, actions] = await Promise.all([getMeetings(user, 60), getMyActions(user.id)]);

  const today = zonedDay(new Date());
  const day = (m: Meeting) => zonedDay(m.starts_at);
  const todays = meetings.filter((m) => day(m) === today);
  const upcoming = meetings.filter((m) => day(m) > today).reverse();
  const recent = meetings.filter((m) => day(m) < today).slice(0, 6);

  return (
    <AppFrame title="Minutes" tagline="Agendas, minutes and action points for your committees.">
      <div className="grid gap-8 lg:grid-cols-[1fr_24rem]">
        <div>
          <Section title="Today" meetings={todays} empty="No meetings today." />
          <Section title="Upcoming" meetings={upcoming} />
          <Section title="Recent" meetings={recent} />
          <Link href="/mastapps/minutes/meetings/new" className="btn btn-primary mt-6">New meeting</Link>
        </div>
        <aside>
          <h2 className="mb-3 text-xl font-extrabold text-accent-text">Your active action points</h2>
          {actions.length === 0 && <p className="text-muted">Nothing on your plate.</p>}
          <div className="space-y-5">
            {groupByCommittee(actions).map(([committee, list]) => (
              <section key={committee} className="card p-5">
                <h3 className="mb-1 text-base font-extrabold text-accent-text">{committee}</h3>
                <ActionList actions={list} />
              </section>
            ))}
          </div>
        </aside>
      </div>
    </AppFrame>
  );
}
