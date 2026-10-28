import type { Metadata } from "next";
import AppFrame from "@/components/ui/AppFrame";
import { getCommitteesFor } from "@/lib/committees";
import { requireUser } from "@/lib/session";
import { createMeeting } from "../../actions";
import MeetingFields from "../MeetingFields";

export const metadata: Metadata = { title: "New meeting", robots: { index: false } };
export const dynamic = "force-dynamic";

const DEFAULT_AGENDA = ["Opening", "- Announcements", "- Approval of Previous Minutes", "- Approval of Agenda", "- Old AP's", "Any other business", "Closing"].join("\n");

export default async function NewMeetingPage() {
  const { user } = await requireUser();
  const committees = await getCommitteesFor(user);

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
            <label className="label" htmlFor="agenda">Agenda</label>
            <textarea id="agenda" name="agenda" className="input min-h-48 font-mono" defaultValue={DEFAULT_AGENDA} />
            <p className="hint mt-1 text-muted">One item per line. Start a line with “-” to make it a sub-item.</p>
          </div>
          <button type="submit" className="btn btn-primary">Create meeting</button>
        </form>
      )}
    </AppFrame>
  );
}
