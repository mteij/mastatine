import Link from "next/link";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { formatDeadline, isOverdue } from "@/lib/minutes-format";
import type { ActionPoint } from "@/lib/meetings";
import { deleteAction, toggleAction } from "./actions";

interface ActionListProps {
  actions: ActionPoint[];
  /** Show who each point belongs to (lists that are not already "mine"). */
  showAssignee?: boolean;
  canDelete?: boolean;
  /** Offer the edit page (committee members of an unlocked meeting). */
  canEdit?: boolean;
}

/** Action points with a tick box that marks them done. */
export default function ActionList({ actions, showAssignee, canDelete, canEdit }: ActionListProps) {
  if (actions.length === 0) return <p className="text-muted">No action points.</p>;
  return (
    <ul className="divide-y divide-line">
      {actions.map((a) => (
        <li key={a.id} className="flex items-start gap-3 py-3">
          <form action={toggleAction} className="shrink-0">
            <input type="hidden" name="id" value={a.id} />
            <button type="submit" role="checkbox" aria-checked={a.is_done} aria-label={`${a.is_done ? "Reopen" : "Mark done"}: ${a.body}`} className="check mt-1">
              {a.is_done && "✓"}
            </button>
          </form>
          <div className="min-w-0 flex-1">
            <Link href={`/mastapps/minutes/meetings/${a.meeting_id}`} className={`block text-ink hover:text-accent-text ${a.is_done ? "line-through opacity-60" : ""}`}>{a.body}</Link>
            <p className={`text-xs ${!a.is_done && isOverdue(a.deadline) ? "font-bold text-danger" : "text-muted"}`}>
              Deadline: {formatDeadline(a.deadline)}
              {showAssignee && ` · ${a.assignee_name ?? "unassigned"}`}
            </p>
            {a.item_title && <p className="text-xs text-muted">Raised under: {a.item_title}</p>}
          </div>
          {canEdit && (
            <Link href={`/mastapps/minutes/actions/${a.id}/edit`} className="text-sm font-bold text-muted hover:text-accent-text">Edit</Link>
          )}
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
