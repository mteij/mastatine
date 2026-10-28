import type { Metadata } from "next";
import Link from "next/link";
import AppFrame from "@/components/ui/AppFrame";
import { getMeetings } from "@/lib/meetings";
import { requireUser } from "@/lib/session";
import MeetingRow from "../MeetingRow";

export const metadata: Metadata = { title: "Meetings", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function MeetingsPage() {
  const { user } = await requireUser();
  const meetings = await getMeetings(user, 200);

  return (
    <AppFrame title="Meetings" tagline="Every meeting of your committees, newest first.">
      {meetings.length === 0 ? (
        <p className="text-muted">No meetings found.</p>
      ) : (
        <ul className="card divide-y divide-line">{meetings.map((m) => <MeetingRow key={m.id} meeting={m} />)}</ul>
      )}
      <Link href="/mastapps/minutes/meetings/new" className="btn btn-primary mt-6">New meeting</Link>
    </AppFrame>
  );
}
