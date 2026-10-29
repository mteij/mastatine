import sql from "@/lib/db";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { displayName } from "@/lib/committees";
import { addCommitteeMember, createCommittee, deleteCommittee, removeCommitteeMember, toggleCommitteeChair, updateCommittee } from "../actions";
import { requireAdmin } from "@/lib/session";

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
  const [committees, members, users] = await Promise.all([
    sql<CommitteeRow[]>`SELECT id, name, description FROM committees ORDER BY name`,
    sql<MemberRow[]>`
      SELECT m.committee_id, u.id AS user_id, u.name, u.email, m.is_chair
      FROM committee_members m JOIN "user" u ON u.id = m.user_id ORDER BY m.is_chair DESC, u.name, u.email
    `,
    sql<{ id: string; name: string; email: string }[]>`SELECT id, name, email FROM "user" WHERE NOT banned ORDER BY name, email LIMIT 1000`,
  ]);

  return (
    <div className="space-y-4">
      <form action={createCommittee} className="card flex flex-wrap items-end gap-3 p-3">
        <div>
          <label className="label" htmlFor="committee-name">New committee</label>
          <input id="committee-name" name="name" className="input" required maxLength={80} />
        </div>
        <div>
          <label className="label" htmlFor="committee-description">Description</label>
          <input id="committee-description" name="description" className="input" maxLength={200} />
        </div>
        <button className="btn btn-primary btn-sm" type="submit">Add committee</button>
        <p className="basis-full text-xs text-muted">Committee members also count as members: they get quotes and members-only activities without a membership request.</p>
      </form>

      <ul className="grid gap-3 @3xl:grid-cols-2">
        {committees.map((c) => {
          const own = members.filter((m) => m.committee_id === c.id);
          const candidates = users.filter((u) => !own.some((m) => m.user_id === u.id));
          return (
            <li key={c.id} className="card p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-extrabold leading-tight">{c.name}</h2>
                  {c.description && <p className="text-sm text-muted">{c.description}</p>}
                </div>
                <form action={deleteCommittee}>
                  <input type="hidden" name="id" value={c.id} />
                  <ConfirmButton message={`Delete ${c.name}? Its activities, meetings and action points are deleted too.`} className="btn btn-danger btn-sm">Delete</ConfirmButton>
                </form>
              </div>

              <details className="mt-1">
                <summary className="cursor-pointer text-xs font-bold text-accent-text">Edit name and description</summary>
                <form action={updateCommittee} className="mt-2 space-y-2">
                  <input type="hidden" name="id" value={c.id} />
                  <input name="name" aria-label="Name" className="input" required maxLength={80} defaultValue={c.name} />
                  <textarea name="description" aria-label="Description" className="input min-h-20" maxLength={200} defaultValue={c.description ?? ""} />
                  <button className="btn btn-primary btn-sm" type="submit">Save</button>
                </form>
              </details>

              <ul className="mt-2 divide-y divide-line text-sm">
                {own.map((m) => (
                  <li key={m.user_id} className="flex items-center justify-between gap-3 py-1">
                    <span>{displayName(m)}{m.is_chair && <span className="badge ml-2">chair</span>}</span>
                    <span className="flex gap-1">
                      <form action={toggleCommitteeChair}>
                        <input type="hidden" name="committeeId" value={c.id} />
                        <input type="hidden" name="userId" value={m.user_id} />
                        <button className="btn btn-secondary btn-sm" type="submit">{m.is_chair ? "Remove chair" : "Make chair"}</button>
                      </form>
                      <form action={removeCommitteeMember}>
                        <input type="hidden" name="committeeId" value={c.id} />
                        <input type="hidden" name="userId" value={m.user_id} />
                        <button className="btn btn-secondary btn-sm" type="submit">Remove</button>
                      </form>
                    </span>
                  </li>
                ))}
                {own.length === 0 && <li className="py-1 text-muted">No members yet.</li>}
              </ul>

              <form action={addCommitteeMember} className="mt-2 flex gap-1">
                <input type="hidden" name="committeeId" value={c.id} />
                <select name="userId" aria-label={`Add a member to ${c.name}`} className="input" required defaultValue="">
                  <option value="" disabled>Add a member…</option>
                  {candidates.map((u) => <option key={u.id} value={u.id}>{displayName(u)} ({u.email})</option>)}
                </select>
                <button className="btn btn-secondary btn-sm" type="submit">Add</button>
              </form>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
