import type { Metadata } from "next";
import Link from "next/link";
import AppFrame from "@/components/ui/AppFrame";
import { displayName, getCommitteePeople } from "@/lib/committees";
import { getLiveItems } from "@/lib/meetings";
import MinutesEditor from "../../../MinutesEditor";
import { loadEditableMeeting } from "../access";

export const metadata: Metadata = { title: "Edit minutes", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function EditMinutesPage(props: { params: Promise<{ id: string }> }) {
  const { user, meeting } = await loadEditableMeeting(props.params);
  const [items, people] = await Promise.all([getLiveItems(meeting.id, user.id), getCommitteePeople(meeting.committee_id)]);

  return (
    <AppFrame title="Edit minutes" tagline={`${meeting.title} · saved automatically; colleagues see your changes live`}>
      {items.length === 0 ? (
        <p className="card p-6">Add agenda items first. <Link className="underline" href={`/mastapps/minutes/meetings/${meeting.id}/agenda`}>Edit agenda</Link></p>
      ) : (
        <MinutesEditor meetingId={meeting.id} initialItems={items} initialStatus={meeting.minutes_status} isAdmin={user.role === "admin"} people={people.map((p) => ({ id: p.id, name: displayName(p) }))} />
      )}
    </AppFrame>
  );
}
