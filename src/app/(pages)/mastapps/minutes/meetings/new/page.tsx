import type { Metadata } from "next";
import AppFrame from "@/components/ui/AppFrame";
import { getCommitteesFor } from "@/lib/committees";
import { requireUser } from "@/lib/session";
import { createMeeting } from "../../actions";
import type { AgendaDraftItem } from "../../AgendaEditor";
import ImportableAgenda from "../../ImportableAgenda";
import { formatDayMonth } from "@/lib/datetime";
import { getPreviousAgendas } from "@/lib/meetings";
import MeetingFields from "../MeetingFields";

export const metadata: Metadata = { title: "New meeting", robots: { index: false } };
export const dynamic = "force-dynamic";

const DEFAULT_AGENDA: AgendaDraftItem[] = [
  { level: 0, title: "Opening" },
  { level: 1, title: "Announcements" },
  { level: 1, title: "Approval of Previous Minutes" },
  { level: 1, title: "Approval of Agenda" },
  { level: 1, title: "Old AP's" },
  { level: 0, title: "Any other business" },
  { level: 0, title: "Closing" },
];

export default async function NewMeetingPage() {
  const { user } = await requireUser();
  const committees = await getCommitteesFor(user);
  const previous = Object.fromEntries(
    Object.entries(await getPreviousAgendas(committees.map((c) => c.id))).map(([committeeId, a]) => [
      committeeId,
      { label: `${a.title} (${formatDayMonth(a.starts_at)})`, items: a.items },
    ]),
  );

  return (
    <AppFrame title="New meeting" tagline="Set the time and start with a standard agenda.">
      {committees.length === 0 ? (
        <p className="card p-6">Only committee members can add meetings. Ask an admin to add you to your committee.</p>
      ) : (
        <form action={createMeeting} className="card space-y-5 p-6 sm:p-8">
          <div>
            <label className="label" htmlFor="committee_id">Committee</label>
            <select id="committee_id" name="committee_id" className="input sm:max-w-xs" required defaultValue={committees.length === 1 ? committees[0].id : ""}>
              <option value="" disabled>Choose a committee</option>
              {committees.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <MeetingFields />
          <div>
            <p className="label">Agenda</p>
            <ImportableAgenda initialItems={DEFAULT_AGENDA} previous={previous} />
            <p className="hint mt-3 text-muted">Press Enter to add the next item. Pick a committee to import its previous agenda. You can change the agenda again later.</p>
          </div>
          <button type="submit" className="btn btn-primary">Create meeting</button>
        </form>
      )}
    </AppFrame>
  );
}
