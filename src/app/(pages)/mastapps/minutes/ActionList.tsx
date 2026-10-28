import Link from "next/link";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { formatDeadline, isOverdue, type ActionPoint } from "@/lib/meetings";
import { deleteAction, toggleAction } from "./actions";

interface ActionListProps {
  actions: ActionPoint[];
  /** Show who each point belongs to (lists that are not already "mine"). */
  showAssignee?: boolean;
  canDelete?: boolean;
}

/** Action points with a tick box that marks them done. */
export default function ActionList({ actions, showAssignee, canDelete }: ActionListProps) {
  if (actions.length === 0) return <p className="text-muted">No action points.</p>;
  return (
    <ul className="divide-y divide-line">
      {actions.map((a) => (
        <li key={a.id} className="flex items-start gap-3 py-3">
          <form action={toggleAction}>
            <input type="hidden" name="id" value={a.id} />
            <button type="submit" role="checkbox" aria-checked={a.is_done} aria-label={`${a.is_done ? "Reopen" : "Mark done"}: ${a.body}`} className={`mt-1 grid h-6 w-6 place-items-center rounded-md border-2 ${a.is_done ? "border-accent bg-accent text-white" : "border-line bg-surface"}`}>
              {a.is_done && "✓"}
            </button>
          </form>
          <div className="min-w-0 flex-1">
            <Link href={`/mastapps/minutes/meetings/${a.meeting_id}`} className={`block text-ink hover:text-accent-text ${a.is_done ? "line-through opacity-60" : ""}`}>{a.body}</Link>
            <p className={`text-xs ${!a.is_done && isOverdue(a.deadline) ? "font-bold text-danger" : "text-muted"}`}>
              Deadline: {formatDeadline(a.deadline)}
              {showAssignee && ` · ${a.assignee_name ?? "unassigned"}`}
            </p>
          </div>
          {canDelete && (
            <form action={deleteAction}>
              <input type="hidden" name="id" value={a.id} />
              <ConfirmButton message="Delete this action point?" className="text-sm font-bold text-muted hover:text-danger">Delete</ConfirmButton>
            </form>
          )}
        </li>
      ))}
    </ul>
  );
}
