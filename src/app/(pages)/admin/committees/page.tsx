import sql from "@/lib/db";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { displayName } from "@/lib/committees";
import { addCommitteeMember, createCommittee, deleteCommittee, removeCommitteeMember, toggleCommitteeChair } from "../actions";

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
  const [committees, members, users] = await Promise.all([
    sql<CommitteeRow[]>`SELECT id, name, description FROM committees ORDER BY name`,
    sql<MemberRow[]>`
      SELECT m.committee_id, u.id AS user_id, u.name, u.email, m.is_chair
      FROM committee_members m JOIN "user" u ON u.id = m.user_id ORDER BY m.is_chair DESC, u.name, u.email
    `,
    sql<{ id: string; name: string; email: string }[]>`SELECT id, name, email FROM "user" WHERE NOT banned ORDER BY name, email LIMIT 1000`,
  ]);

  return (
    <div className="space-y-6">
      <form action={createCommittee} className="card flex flex-wrap items-end gap-3 p-5">
        <div>
          <label className="label" htmlFor="committee-name">New committee</label>
          <input id="committee-name" name="name" className="input" required maxLength={80} />
        </div>
        <div>
          <label className="label" htmlFor="committee-description">Description</label>
          <input id="committee-description" name="description" className="input" maxLength={200} />
        </div>
        <button className="btn btn-primary" type="submit">Add committee</button>
      </form>

      <ul className="grid gap-5 lg:grid-cols-2">
        {committees.map((c) => {
          const own = members.filter((m) => m.committee_id === c.id);
          const candidates = users.filter((u) => !own.some((m) => m.user_id === u.id));
          return (
            <li key={c.id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold">{c.name}</h2>
                  {c.description && <p className="text-sm text-muted">{c.description}</p>}
                </div>
                <form action={deleteCommittee}>
                  <input type="hidden" name="id" value={c.id} />
                  <ConfirmButton message={`Delete ${c.name}? Its activities, meetings and action points are deleted too.`} className="btn btn-danger btn-sm">Delete</ConfirmButton>
                </form>
              </div>

              <ul className="mt-4 divide-y divide-line">
                {own.map((m) => (
                  <li key={m.user_id} className="flex items-center justify-between gap-3 py-2">
                    <span>{displayName(m)}{m.is_chair && <span className="badge ml-2">chair</span>}</span>
                    <span className="flex gap-2">
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
                {own.length === 0 && <li className="py-2 text-muted">No members yet.</li>}
              </ul>

              <form action={addCommitteeMember} className="mt-4 flex gap-2">
                <input type="hidden" name="committeeId" value={c.id} />
                <select name="userId" aria-label={`Add a member to ${c.name}`} className="input" required defaultValue="">
                  <option value="" disabled>Add a member…</option>
                  {candidates.map((u) => <option key={u.id} value={u.id}>{displayName(u)} ({u.email})</option>)}
                </select>
                <button className="btn btn-secondary" type="submit">Add</button>
              </form>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
