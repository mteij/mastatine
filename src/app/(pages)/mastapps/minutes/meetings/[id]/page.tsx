import type { Metadata } from "next";
import Link from "next/link";
import AppFrame from "@/components/ui/AppFrame";
import Markdown from "@/components/Markdown";
import { displayName, getCommitteePeople } from "@/lib/committees";
import { formatDateTime } from "@/lib/datetime";
import { formatDeadline, getItems, getMeetingActions, itemLabels } from "@/lib/meetings";
import { addAction } from "../../actions";
import ActionList from "../../ActionList";
import LiveRefresh from "../../LiveRefresh";
import MeetingStatusBar from "../../MeetingStatusBar";
import { loadMeeting } from "./access";

export const metadata: Metadata = { title: "Meeting", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function MeetingPage(props: { params: Promise<{ id: string }> }) {
  const { user, meeting } = await loadMeeting(props.params);
  const locked = meeting.minutes_status === "locked";
  const [items, actions, people] = await Promise.all([getItems(meeting.id), getMeetingActions(meeting.id), getCommitteePeople(meeting.committee_id)]);
  const labels = itemLabels(items);
  const base = `/mastapps/minutes/meetings/${meeting.id}`;

  return (
    <AppFrame title={meeting.title} tagline={`${meeting.committee_name} · ${formatDateTime(meeting.starts_at)}${meeting.location ? ` @${meeting.location}` : ""}`}>
      <LiveRefresh />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        {!locked && (
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`${base}/agenda`} className="btn btn-secondary btn-sm">Edit agenda</Link>
            <Link href={`${base}/minutes`} className="btn btn-secondary btn-sm">Edit minutes</Link>
            <Link href={`${base}/edit`} className="btn btn-secondary btn-sm">Details</Link>
          </div>
        )}
        <MeetingStatusBar meetingId={meeting.id} status={meeting.minutes_status} isAdmin={user.role === "admin"} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_24rem]">
        <section className="card p-6 sm:p-8">
          <h2 className="mb-4 text-xl font-extrabold">Minutes</h2>
          {items.length === 0 && <p className="text-muted">The agenda is empty. <Link href={`${base}/agenda`} className="underline">Add agenda items</Link>.</p>}
          <ol className="space-y-4">
            {items.map((item, i) => (
              <li key={item.id} className={item.level === 1 ? "ml-8" : ""}>
                <h3 className={`font-bold text-accent-text ${item.level === 0 ? "text-lg" : "text-base"}`}>{labels[i]} {item.title}</h3>
                {item.notes && <Markdown className="mt-1">{item.notes}</Markdown>}
                {actions.filter((a) => a.item_id === item.id).map((a) => (
                  <p key={a.id} className={`mt-2 rounded-lg bg-soft px-3 py-2 text-sm ${a.is_done ? "line-through opacity-60" : ""}`}>
                    <strong>Action point · {a.assignee_name ?? "unassigned"}:</strong> {a.body} <span className="text-muted">({formatDeadline(a.deadline)})</span>
                  </p>
                ))}
              </li>
            ))}
          </ol>
        </section>

        <aside className="space-y-4">
          <section className="card p-5">
            <h2 className="mb-1 text-lg font-extrabold text-accent-text">Action points</h2>
            <ActionList actions={actions} showAssignee canDelete={!locked} canEdit={!locked} />
          </section>
          {!locked && <form action={addAction} className="card space-y-3 p-5">
            <h2 className="text-lg font-extrabold">Add action point</h2>
            <input type="hidden" name="id" value={meeting.id} />
            <select name="item_id" aria-label="Raised under" className="input" defaultValue="">
              <option value="">No agenda item</option>
              {items.map((item, i) => <option key={item.id} value={item.id}>{labels[i]} {item.title}</option>)}
            </select>
            <textarea name="body" aria-label="Action point" className="input" required maxLength={500} placeholder="What needs to happen?" />
            <select name="assignee_id" aria-label="Assigned to" className="input" defaultValue="">
              <option value="">Unassigned</option>
              {people.map((p) => <option key={p.id} value={p.id}>{displayName(p)}</option>)}
            </select>
            <div>
              <label className="label" htmlFor="deadline">Deadline (empty: next meeting)</label>
              <input id="deadline" name="deadline" type="date" className="input" />
            </div>
            <button type="submit" className="btn btn-primary">Add</button>
          </form>}
        </aside>
      </div>
    </AppFrame>
  );
}
