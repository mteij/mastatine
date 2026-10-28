import ConfirmButton from "@/components/admin/ConfirmButton";
import { STATUS_LABEL, type MeetingStatus } from "@/lib/meetings";
import { setMeetingStatus } from "./actions";

const BADGE: Record<MeetingStatus, string> = {
  open: "bg-accent-soft text-accent-text",
  done: "bg-success/10 text-success",
  locked: "bg-navy text-white",
};

const LOCK_WARNING = "Lock this meeting? Nobody can change its agenda, minutes or details afterwards, and only an admin can reopen it.";

interface MeetingStatusBarProps {
  meetingId: string;
  status: MeetingStatus;
  isAdmin: boolean;
}

/** Shows whether a meeting is open, done or locked, with the buttons that are allowed to change it. */
export default function MeetingStatusBar({ meetingId, status, isAdmin }: MeetingStatusBarProps) {
  const to = (next: MeetingStatus) => setMeetingStatus.bind(null, meetingId, next);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${BADGE[status]}`}>
        {status === "locked" && (
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
        )}
        {STATUS_LABEL[status][0].toUpperCase() + STATUS_LABEL[status].slice(1)}
      </span>

      {status === "open" && (
        <form action={to("done")}><button type="submit" className="btn btn-secondary btn-sm">Mark as done</button></form>
      )}
      {status === "done" && (
        <form action={to("open")}><button type="submit" className="btn btn-secondary btn-sm">Reopen</button></form>
      )}
      {status !== "locked" && (
        <form action={to("locked")}><ConfirmButton message={LOCK_WARNING} className="btn btn-secondary btn-sm">Lock</ConfirmButton></form>
      )}
      {status === "locked" &&
        (isAdmin ? (
          <form action={to("open")}><button type="submit" className="btn btn-secondary btn-sm">Reopen (admin)</button></form>
        ) : (
          <span className="text-sm text-muted">Read-only. Only an admin can reopen it.</span>
        ))}
    </div>
  );
}
