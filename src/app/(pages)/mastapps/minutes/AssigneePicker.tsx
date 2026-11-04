interface AssigneePickerProps {
  people: { id: string; label: string }[];
  /** Ids ticked from the start. */
  selected?: string[];
}

/** Tick any number of committee members; each ticked person is submitted as its own `assignee_id` field. */
export default function AssigneePicker({ people, selected = [] }: AssigneePickerProps) {
  return (
    <fieldset className="min-w-0">
      <legend className="label">Assigned to</legend>
      {people.length === 0 ? (
        <p className="text-sm text-muted">This committee has no members yet.</p>
      ) : (
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 rounded-xl border border-line p-2.5">
          {people.map((p) => (
            <label key={p.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="assignee_id" value={p.id} defaultChecked={selected.includes(p.id)} />
              {p.label}
            </label>
          ))}
        </div>
      )}
      <p className="mt-1 text-xs text-muted">Leave empty for unassigned.</p>
    </fieldset>
  );
}

/** "Anna, Bob" or "unassigned". */
export const assigneeNames = (assignees: { name: string }[]): string =>
  assignees.length > 0 ? assignees.map((a) => a.name).join(", ") : "unassigned";
