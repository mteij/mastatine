import Link from "next/link";
import { formatDateTime } from "@/lib/datetime";
import { STATUS_LABEL, type Meeting } from "@/lib/meetings";

/** One meeting in a list: title, time and place, minutes status and the three ways into it. */
export default function MeetingRow({ meeting }: { meeting: Meeting }) {
  const base = `/mastapps/minutes/meetings/${meeting.id}`;
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
      <div>
        <p className="font-bold">{meeting.title} <span className="badge ml-1">{meeting.committee_name}</span></p>
        <p className="text-sm text-muted">
          {formatDateTime(meeting.starts_at)}{meeting.location && ` @${meeting.location}`} · minutes {STATUS_LABEL[meeting.minutes_status]}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href={base} className="btn btn-secondary btn-sm">View</Link>
        <Link href={`${base}/agenda`} className="btn btn-secondary btn-sm">Edit agenda</Link>
        <Link href={`${base}/minutes`} className="btn btn-secondary btn-sm">Edit minutes</Link>
        <Link href={`${base}/edit`} className="btn btn-secondary btn-sm" aria-label={`Edit details of ${meeting.title}`}>Details</Link>
      </div>
    </li>
  );
}
