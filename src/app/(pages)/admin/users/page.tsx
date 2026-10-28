import sql from "@/lib/db";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { requireAdmin } from "@/lib/session";
import Link from "next/link";
import { addCommitteeMember, approveMember, banUser, removeCommitteeMember, removeUser, revokeMember, setUserRole, unbanUser } from "../actions";

const PAGE_SIZE = 100;

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean;
  member_status: "none" | "pending" | "approved";
  createdAt: Date;
  committees: { id: string; name: string }[];
}

export default async function AdminUsers(props: { searchParams: Promise<{ q?: string; filter?: string }> }) {
  const { user: me } = await requireAdmin();
  const params = await props.searchParams;
  const query = (params.q ?? "").trim().slice(0, 100);
  const requestsOnly = params.filter === "requests";
  const pattern = `%${query.replace(/[\\%_]/g, "\\$&")}%`;
  const conditions = [
    ...(query ? [sql`(u.name ILIKE ${pattern} OR u.email ILIKE ${pattern})`] : []),
    ...(requestsOnly ? [sql`u.member_status = 'pending'`] : []),
  ];
  const where = conditions.length > 0 ? sql`WHERE ${conditions.reduce((all, c) => sql`${all} AND ${c}`)}` : sql``;

  const [users, committees, pending] = await Promise.all([
    sql<UserRow[]>`
      SELECT u.id, u.name, u.email, u.role, u.banned, u.member_status, u."createdAt",
        COALESCE(json_agg(json_build_object('id', c.id, 'name', c.name) ORDER BY c.name) FILTER (WHERE c.id IS NOT NULL), '[]') AS committees
      FROM "user" u
      LEFT JOIN committee_members m ON m.user_id = u.id
      LEFT JOIN committees c ON c.id = m.committee_id
      ${where}
      GROUP BY u.id ORDER BY u."createdAt" DESC LIMIT ${PAGE_SIZE}
    `,
    sql<{ id: string; name: string }[]>`SELECT id, name FROM committees ORDER BY name`,
    sql<{ id: string; name: string; email: string; requested_at: Date | null }[]>`
      SELECT id, name, email, member_requested_at AS requested_at FROM "user"
      WHERE member_status = 'pending' ORDER BY member_requested_at NULLS LAST, "createdAt" LIMIT 50
    `,
  ]);
  const pendingCount = pending.length;

  return (
    <>
      {pendingCount > 0 && !requestsOnly && !query && (
        <section aria-labelledby="requests-title" className="card mb-6 border-accent p-5">
          <h2 id="requests-title" className="text-lg font-extrabold">
            Membership requests <span className="ml-1 rounded-full bg-navy px-2 py-0.5 text-sm text-white">{pendingCount}</span>
          </h2>
          <ul className="mt-3 divide-y divide-line">
            {pending.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate font-bold">{p.name || "No name"}</p>
                  <p className="truncate text-sm text-muted">
                    {p.email}{p.requested_at && ` · asked ${new Date(p.requested_at).toLocaleDateString("en-GB")}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <form action={approveMember}>
                    <input type="hidden" name="userId" value={p.id} />
                    <button className="btn btn-primary btn-sm" type="submit">Approve</button>
                  </form>
                  <form action={revokeMember}>
                    <input type="hidden" name="userId" value={p.id} />
                    <ConfirmButton message={`Decline the request from ${p.email}?`} className="btn btn-secondary btn-sm">Decline</ConfirmButton>
                  </form>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">Approving emails the person that they are now a member. Declining sends nothing, and they can ask again.</p>
        </section>
      )}

      <nav aria-label="Filter users" className="mb-4 flex gap-2">
        <Link href="/admin/users" aria-current={requestsOnly ? undefined : "page"} className={`rounded-full px-4 py-1.5 text-sm font-bold ${requestsOnly ? "text-muted hover:bg-soft" : "bg-accent text-accent-fg"}`}>All users</Link>
        <Link href="/admin/users?filter=requests" aria-current={requestsOnly ? "page" : undefined} className={`rounded-full px-4 py-1.5 text-sm font-bold ${requestsOnly ? "bg-accent text-accent-fg" : "text-muted hover:bg-soft"}`}>
          Membership requests{pendingCount > 0 && <span className="ml-1.5 rounded-full bg-navy px-2 py-0.5 text-xs text-white">{pendingCount}</span>}
        </Link>
      </nav>

      <form className="mb-6 flex gap-3" role="search">
        {requestsOnly && <input type="hidden" name="filter" value="requests" />}
        <label className="sr-only" htmlFor="user-search">Search users</label>
        <input id="user-search" name="q" defaultValue={query} placeholder="Search name or email" className="input max-w-sm" />
        <button className="btn btn-secondary" type="submit">Search</button>
      </form>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>User</th><th>Membership</th><th>Committees</th><th>Role</th><th><span className="sr-only">Actions</span></th></tr>
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
                    {u.member_status === "approved" && <span className="badge">Member</span>}
                    {u.member_status === "pending" && <span className="badge !bg-navy !text-white">Requested</span>}
                    {u.member_status === "none" && <span className="text-sm text-muted">Not a member</span>}
                    <div className="mt-2 flex gap-2">
                      {u.member_status !== "approved" && (
                        <form action={approveMember}>
                          <input type="hidden" name="userId" value={u.id} />
                          <button className="btn btn-primary btn-sm" type="submit">Approve</button>
                        </form>
                      )}
                      {u.member_status !== "none" && !isMe && (
                        <form action={revokeMember}>
                          <input type="hidden" name="userId" value={u.id} />
                          <ConfirmButton message={u.member_status === "pending" ? "Decline this request?" : `End ${u.email}'s membership?`} className="btn btn-secondary btn-sm">
                            {u.member_status === "pending" ? "Decline" : "Remove"}
                          </ConfirmButton>
                        </form>
                      )}
                    </div>
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
            {users.length === 0 && <tr><td colSpan={5} className="text-muted">No users found.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
