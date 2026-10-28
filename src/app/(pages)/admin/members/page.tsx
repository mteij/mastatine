import sql from "@/lib/db";
import { addCommitteeMember, removeCommitteeMember } from "../actions";

const PAGE_SIZE = 50;

interface MemberRow {
  id: string;
  name: string;
  email: string;
  committees: { id: string; name: string }[];
}

export default async function AdminMembers(props: { searchParams: Promise<{ q?: string }> }) {
  const query = ((await props.searchParams).q ?? "").trim().slice(0, 100);
  const pattern = `%${query.replace(/[\\%_]/g, "\\$&")}%`;
  const where = query ? sql`WHERE u.name ILIKE ${pattern} OR u.email ILIKE ${pattern}` : sql``;

  const [members, committees] = await Promise.all([
    sql<MemberRow[]>`
      SELECT u.id, u.name, u.email,
        COALESCE(json_agg(json_build_object('id', c.id, 'name', c.name) ORDER BY c.name) FILTER (WHERE c.id IS NOT NULL), '[]') AS committees
      FROM "user" u
      LEFT JOIN committee_members m ON m.user_id = u.id
      LEFT JOIN committees c ON c.id = m.committee_id
      ${where}
      GROUP BY u.id ORDER BY u.name, u.email LIMIT ${PAGE_SIZE}
    `,
    sql<{ id: string; name: string }[]>`SELECT id, name FROM committees ORDER BY name`,
  ]);

  return (
    <>
      <form className="mb-6 flex gap-3" role="search">
        <label className="sr-only" htmlFor="member-search">Search members</label>
        <input id="member-search" name="q" defaultValue={query} placeholder="Search name or email" className="input max-w-sm" />
        <button className="btn btn-secondary" type="submit">Search</button>
      </form>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>Member</th><th>Committees</th><th>Add to committee</th></tr>
          </thead>
          <tbody>
            {members.map((m) => {
              const open = committees.filter((c) => !m.committees.some((own) => own.id === c.id));
              return (
                <tr key={m.id}>
                  <td>
                    <p className="font-medium">{m.name || "—"}</p>
                    <p className="text-sm text-muted">{m.email}</p>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      {m.committees.map((c) => (
                        <form key={c.id} action={removeCommitteeMember}>
                          <input type="hidden" name="committeeId" value={c.id} />
                          <input type="hidden" name="userId" value={m.id} />
                          <button type="submit" className="badge cursor-pointer" title={`Remove from ${c.name}`}>{c.name} ×</button>
                        </form>
                      ))}
                      {m.committees.length === 0 && <span className="text-muted">None</span>}
                    </div>
                  </td>
                  <td>
                    {open.length > 0 && (
                      <form action={addCommitteeMember} className="flex gap-2">
                        <input type="hidden" name="userId" value={m.id} />
                        <select name="committeeId" aria-label={`Add ${m.email} to a committee`} className="input" required defaultValue="">
                          <option value="" disabled>Choose…</option>
                          {open.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <button className="btn btn-secondary btn-sm" type="submit">Add</button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
            {members.length === 0 && <tr><td colSpan={3} className="text-muted">No members found.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
