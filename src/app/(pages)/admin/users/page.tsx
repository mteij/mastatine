import sql from "@/lib/db";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { requireAdmin } from "@/lib/session";
import { addCommitteeMember, banUser, removeCommitteeMember, removeUser, setUserRole, unbanUser } from "../actions";

const PAGE_SIZE = 100;

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean;
  createdAt: Date;
  committees: { id: string; name: string }[];
}

export default async function AdminUsers(props: { searchParams: Promise<{ q?: string }> }) {
  const { user: me } = await requireAdmin();
  const query = ((await props.searchParams).q ?? "").trim().slice(0, 100);
  const pattern = `%${query.replace(/[\\%_]/g, "\\$&")}%`;
  const where = query ? sql`WHERE u.name ILIKE ${pattern} OR u.email ILIKE ${pattern}` : sql``;

  const [users, committees] = await Promise.all([
    sql<UserRow[]>`
      SELECT u.id, u.name, u.email, u.role, u.banned, u."createdAt",
        COALESCE(json_agg(json_build_object('id', c.id, 'name', c.name) ORDER BY c.name) FILTER (WHERE c.id IS NOT NULL), '[]') AS committees
      FROM "user" u
      LEFT JOIN committee_members m ON m.user_id = u.id
      LEFT JOIN committees c ON c.id = m.committee_id
      ${where}
      GROUP BY u.id ORDER BY u."createdAt" DESC LIMIT ${PAGE_SIZE}
    `,
    sql<{ id: string; name: string }[]>`SELECT id, name FROM committees ORDER BY name`,
  ]);

  return (
    <>
      <form className="mb-6 flex gap-3" role="search">
        <label className="sr-only" htmlFor="user-search">Search users</label>
        <input id="user-search" name="q" defaultValue={query} placeholder="Search name or email" className="input max-w-sm" />
        <button className="btn btn-secondary" type="submit">Search</button>
      </form>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>User</th><th>Committees</th><th>Role</th><th><span className="sr-only">Actions</span></th></tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isMe = u.id === me.id;
              const open = committees.filter((c) => !u.committees.some((own) => own.id === c.id));
              return (
                <tr key={u.id}>
                  <td>
                    <p className="font-medium">{u.name || "No name"}{isMe && <span className="badge ml-2">You</span>}</p>
                    <p className="text-sm text-muted">{u.email}</p>
                    <p className="text-xs text-muted">Joined {new Date(u.createdAt).toLocaleDateString("en-GB")}</p>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      {u.committees.map((c) => (
                        <form key={c.id} action={removeCommitteeMember}>
                          <input type="hidden" name="committeeId" value={c.id} />
                          <input type="hidden" name="userId" value={u.id} />
                          <button type="submit" className="badge cursor-pointer" title={`Remove from ${c.name}`}>{c.name} ×</button>
                        </form>
                      ))}
                    </div>
                    {open.length > 0 && (
                      <form action={addCommitteeMember} className="mt-2 flex gap-2">
                        <input type="hidden" name="userId" value={u.id} />
                        <select name="committeeId" aria-label={`Add ${u.email} to a committee`} className="input !py-1.5" required defaultValue="">
                          <option value="" disabled>Add to committee…</option>
                          {open.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <button className="btn btn-secondary btn-sm" type="submit">Add</button>
                      </form>
                    )}
                  </td>
                  <td>
                    <span className={u.role === "admin" ? "badge" : "text-muted"}>{u.role}</span>
                    {u.banned && <span className="ml-2 text-sm font-semibold text-danger">banned</span>}
                  </td>
                  <td>
                    {!isMe && (
                      <div className="flex flex-wrap justify-end gap-2">
                        <form action={setUserRole}>
                          <input type="hidden" name="userId" value={u.id} />
                          <input type="hidden" name="role" value={u.role === "admin" ? "user" : "admin"} />
                          <button className="btn btn-secondary btn-sm" type="submit">{u.role === "admin" ? "Remove admin" : "Make admin"}</button>
                        </form>
                        <form action={u.banned ? unbanUser : banUser}>
                          <input type="hidden" name="userId" value={u.id} />
                          <ConfirmButton message={u.banned ? "Lift this ban?" : `Ban ${u.email}? They will be signed out and unable to sign in.`} className="btn btn-secondary btn-sm">
                            {u.banned ? "Unban" : "Ban"}
                          </ConfirmButton>
                        </form>
                        <form action={removeUser}>
                          <input type="hidden" name="userId" value={u.id} />
                          <ConfirmButton message={`Permanently delete ${u.email}?`} className="btn btn-danger btn-sm">Delete</ConfirmButton>
                        </form>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && <tr><td colSpan={4} className="text-muted">No users found.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
