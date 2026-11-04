import sql from "@/lib/db";
import ConfirmButton from "@/components/admin/ConfirmButton";
import MemberSearch from "@/components/admin/MemberSearch";
import { displayName } from "@/lib/committees";
import { addCommitteeMember, createCommittee, deleteCommittee, removeCommitteeMember, toggleCommitteeChair, updateCommittee } from "../actions";
import { requireAdmin } from "@/lib/session";

/** Members named in the table row; the rest are one click away in the edit menu. */
const SHOWN = 4;

interface CommitteeRow {
  id: string;
  name: string;
  description: string | null;
}

interface MemberRow {
  committee_id: string;
  user_id: string;
  name: string;
  email: string;
  is_chair: boolean;
}

export default async function AdminCommittees() {
  // Layouts do not re-run on client navigation, so each admin page checks the role itself.
  await requireAdmin();
  const [committees, members] = await Promise.all([
    sql<CommitteeRow[]>`SELECT id, name, description FROM committees ORDER BY name`,
    sql<MemberRow[]>`
      SELECT m.committee_id, u.id AS user_id, u.name, u.email, m.is_chair
      FROM committee_members m JOIN "user" u ON u.id = m.user_id ORDER BY m.is_chair DESC, u.name, u.email
    `,
  ]);

  return (
    <div className="space-y-3">
      <form action={createCommittee} className="flex flex-wrap items-end gap-2">
        <div className="min-w-0 flex-1 basis-40">
          <label className="label" htmlFor="committee-name">New committee</label>
          <input id="committee-name" name="name" className="input" required maxLength={80} />
        </div>
        <div className="min-w-0 flex-[2] basis-56">
          <label className="label" htmlFor="committee-description">Description</label>
          <input id="committee-description" name="description" className="input" maxLength={200} />
        </div>
        <button className="btn btn-primary btn-sm" type="submit">Add committee</button>
      </form>

      {/* Not .table-wrap: it clips overflow, and the row menu has to hang below its row. */}
      <div className="table-open">
        <table className="table table-stack">
          <thead>
            <tr>
              <th>Committee</th>
              <th>Members</th>
              <th className="text-right"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {committees.map((c) => {
              const own = members.filter((m) => m.committee_id === c.id);
              return (
                <tr key={c.id}>
                  <td data-primary>
                    <span className="font-medium">{c.name}</span>
                    {c.description && <span className="block text-xs font-normal text-muted">{c.description}</span>}
                  </td>
                  <td data-label="Members" className="sm:max-w-md">
                    {own.length === 0 ? (
                      <span className="text-muted">No members yet</span>
                    ) : (
                      <span>
                        <span className="tabular-nums text-muted">{own.length} · </span>
                        {own.slice(0, SHOWN).map((m, i) => (
                          <span key={m.user_id}>
                            {i > 0 && ", "}
                            <span className={m.is_chair ? "font-bold" : ""} title={m.is_chair ? "Chair" : undefined}>{displayName(m)}{m.is_chair && " ★"}</span>
                          </span>
                        ))}
                        {own.length > SHOWN && <span className="text-muted"> +{own.length - SHOWN} more</span>}
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="flex w-full justify-end">
                      <details className="popover max-sm:w-full">
                        <summary className="btn btn-secondary btn-sm max-sm:w-full" aria-label={`Edit ${c.name}`} title="Edit"><span className="sm:hidden">Edit</span><span aria-hidden="true" className="max-sm:hidden text-base leading-none">⋯</span></summary>
                        <div className="popover__panel space-y-4 text-sm">
                          <section aria-label="Members" className="space-y-1.5">
                            <h3 className="text-xs font-bold uppercase tracking-wide text-muted">Members ({own.length})</h3>
                            {own.length > 0 && (
                              <ul className="max-h-56 divide-y divide-line overflow-y-auto">
                                {own.map((m) => (
                                  <li key={m.user_id} className="flex items-center justify-between gap-2 py-1">
                                    <span className="min-w-0 truncate">{displayName(m)}{m.is_chair && <span className="badge ml-1.5">chair</span>}</span>
                                    <span className="flex shrink-0 gap-1">
                                      <form action={toggleCommitteeChair}>
                                        <input type="hidden" name="committeeId" value={c.id} />
                                        <input type="hidden" name="userId" value={m.user_id} />
                                        <button className="btn btn-secondary btn-sm" type="submit">{m.is_chair ? "Unchair" : "Chair"}</button>
                                      </form>
                                      <form action={removeCommitteeMember}>
                                        <input type="hidden" name="committeeId" value={c.id} />
                                        <input type="hidden" name="userId" value={m.user_id} />
                                        <button className="btn btn-secondary btn-sm" type="submit" aria-label={`Remove ${displayName(m)}`}>Remove</button>
                                      </form>
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}
                            <MemberSearch committeeId={c.id} committeeName={c.name} action={addCommitteeMember} />
                          </section>

                          <form action={updateCommittee} aria-label="Details" className="space-y-2 border-t border-line pt-3">
                            <h3 className="text-xs font-bold uppercase tracking-wide text-muted">Details</h3>
                            <input type="hidden" name="id" value={c.id} />
                            <div>
                              <label className="label" htmlFor={`committee-name-${c.id}`}>Name</label>
                              <input id={`committee-name-${c.id}`} name="name" className="input" required maxLength={80} defaultValue={c.name} />
                            </div>
                            <div>
                              <label className="label" htmlFor={`committee-desc-${c.id}`}>Description</label>
                              <textarea id={`committee-desc-${c.id}`} name="description" className="input min-h-16" maxLength={200} defaultValue={c.description ?? ""} />
                            </div>
                            <button className="btn btn-primary btn-sm" type="submit">Save details</button>
                          </form>

                          <form action={deleteCommittee} className="border-t border-line pt-3">
                            <input type="hidden" name="id" value={c.id} />
                            <ConfirmButton message={`Delete ${c.name}? Its activities, meetings and action points are deleted too.`} className="btn btn-danger btn-sm">Delete committee</ConfirmButton>
                          </form>
                        </div>
                      </details>
                    </div>
                  </td>
                </tr>
              );
            })}
            {committees.length === 0 && <tr><td colSpan={3} className="py-6 text-center text-muted">No committees yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
