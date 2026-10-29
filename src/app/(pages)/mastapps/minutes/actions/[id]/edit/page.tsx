import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AppFrame from "@/components/ui/AppFrame";
import { displayName, getCommitteePeople } from "@/lib/committees";
import { getAction, getItems, itemLabels } from "@/lib/meetings";
import { requireUser } from "@/lib/session";
import { updateAction } from "../../../actions";

export const metadata: Metadata = { title: "Edit action point", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function EditActionPage(props: { params: Promise<{ id: string }> }) {
  const { user } = await requireUser();
  const { id } = await props.params;
  const action = /^[0-9a-f-]{36}$/i.test(id) ? await getAction(id, user) : null;
  if (!action) notFound();
  const meetingUrl = `/mastapps/minutes/meetings/${action.meeting_id}`;
  if (action.minutes_status === "locked") redirect(meetingUrl);

  const [people, items] = await Promise.all([getCommitteePeople(action.committee_id), getItems(action.meeting_id)]);
  const labels = itemLabels(items);

  return (
    <AppFrame title="Edit action point" tagline={action.committee_name}>
      <form action={updateAction} className="card max-w-xl space-y-4 p-6 sm:p-8">
        <input type="hidden" name="id" value={action.id} />
        <div>
          <label className="label" htmlFor="body">Action point</label>
          <textarea id="body" name="body" className="input" required maxLength={500} defaultValue={action.body} />
        </div>
        <div>
          <label className="label" htmlFor="assignee_id">Assigned to</label>
          <select id="assignee_id" name="assignee_id" className="input" defaultValue={action.assignee_id ?? ""}>
            <option value="">Unassigned</option>
            {people.map((p) => <option key={p.id} value={p.id}>{displayName(p)}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="deadline">Deadline (empty: next meeting)</label>
          <input id="deadline" name="deadline" type="date" className="input" defaultValue={action.deadline ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="item_id">Raised under</label>
          <select id="item_id" name="item_id" className="input" defaultValue={action.item_id ?? ""}>
            <option value="">No agenda item</option>
            {items.map((item, i) => <option key={item.id} value={item.id}>{labels[i]} {item.title}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="submit" className="btn btn-primary">Save</button>
          <Link href={meetingUrl} className="btn btn-secondary">Cancel</Link>
        </div>
      </form>
    </AppFrame>
  );
}
