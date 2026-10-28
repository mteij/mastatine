import type { Metadata } from "next";
import AppFrame from "@/components/ui/AppFrame";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { toLocalInput } from "@/lib/datetime";
import { deleteMeeting, updateMeeting } from "../../../actions";
import MeetingFields from "../../MeetingFields";
import { loadEditableMeeting } from "../access";

export const metadata: Metadata = { title: "Meeting details", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function EditMeetingPage(props: { params: Promise<{ id: string }> }) {
  const { meeting } = await loadEditableMeeting(props.params);

  return (
    <AppFrame title="Meeting details" tagline={meeting.committee_name}>
      <form action={updateMeeting} className="card space-y-5 p-6 sm:p-8">
        <input type="hidden" name="id" value={meeting.id} />
        <MeetingFields defaults={{ title: meeting.title, location: meeting.location, starts_at: toLocalInput(meeting.starts_at) }} />
        <button type="submit" className="btn btn-primary">Save</button>
      </form>
      <form action={deleteMeeting} className="mt-6">
        <input type="hidden" name="id" value={meeting.id} />
        <ConfirmButton message="Delete this meeting with its agenda, minutes and action points?" className="btn btn-danger">Delete meeting</ConfirmButton>
      </form>
    </AppFrame>
  );
}
