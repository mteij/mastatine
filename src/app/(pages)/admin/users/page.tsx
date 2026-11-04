import sql from "@/lib/db";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { requireAdmin } from "@/lib/session";
import Link from "next/link";
import type { MemberStatus } from "@/lib/membership";
import MembershipEndForm from "@/components/admin/MembershipEndForm";
import SortHeader, { parseSort, SortLink } from "@/components/admin/SortHeader";
import { addCommitteeMember, approveMember, banUser, declineMember, removeCommitteeMember, removeUser, revokeMember, setUserRole, unbanUser } from "../actions";

const PAGE_SIZE = 100;

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean;
  member_status: MemberStatus;
  member_decided_at: Date | null;
  decided_by_name: string | null;
  member_decision_reason: string | null;
  /** Approved, but no sign-in for 5 years: no longer a member. */
  lapsed: boolean;
  createdAt: Date;
  committees: { id: string; name: string }[];
}

const SORT_COLUMNS = ["joined", "name", "email", "membership", "role"] as const;

const DECISION_LABEL: Record<MemberStatus, string> = { approved: "Approved", declined: "Declined", revoked: "Removed", none: "", pending: "" };

const date = (value: Date) => new Date(value).toLocaleDateString("en-GB");

export default async function AdminUsers(props: { searchParams: Promise<{ q?: string; filter?: string; sort?: string; dir?: string }> }) {
  const { user: me } = await requireAdmin();
  const params = await props.searchParams;
  const sort = parseSort(params, SORT_COLUMNS, { column: "joined", dir: "desc" });
  const direction = sort.dir === "asc" ? sql`ASC` : sql`DESC`;
  const sortExpression = {
    joined: sql`u."createdAt"`,
    name: sql`LOWER(NULLIF(u.name, ''))`,
    email: sql`LOWER(u.email)`,
    membership: sql`u.member_status`,
    role: sql`u.role`,
  }[sort.column];
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
      SELECT u.id, u.name, u.email, u.role, u.banned, u.member_status, u.member_decided_at, u.member_decision_reason, u."createdAt",
        d.name AS decided_by_name,
        (u.member_status = 'approved' AND u.last_active_at <= NOW() - INTERVAL '5 years') AS lapsed,
        COALESCE(json_agg(json_build_object('id', c.id, 'name', c.name) ORDER BY c.name) FILTER (WHERE c.id IS NOT NULL), '[]') AS committees
      FROM "user" u
      LEFT JOIN committee_members m ON m.user_id = u.id
      LEFT JOIN committees c ON c.id = m.committee_id
      LEFT JOIN "user" d ON d.id = u.member_decided_by
      ${where}
      GROUP BY u.id, d.name ORDER BY ${sortExpression} ${direction} NULLS LAST, u."createdAt" DESC LIMIT ${PAGE_SIZE}
    `,
    sql<{ id: string; name: string }[]>`SELECT id, name FROM committees ORDER BY name`,
    sql<{ id: string; name: string; email: string; requested_at: Date | null }[]>`
      SELECT id, name, email, member_requested_at AS requested_at FROM "user"
      WHERE member_status = 'pending' ORDER BY member_requested_at NULLS LAST, "createdAt" LIMIT 50
    `,
  ]);
  const pendingCount = pending.length;
  const sortProps = {
    active: sort,
    basePath: "/admin/users",
    keep: { ...(query && { q: query }), ...(requestsOnly && { filter: "requests" }) },
  };

  return (
    <>
      {pendingCount > 0 && !requestsOnly && !query && (
        <section aria-labelledby="requests-title" className="card mb-4 !p-3">
          <h2 id="requests-title" className="text-sm font-extrabold">
            Membership requests <span className="ml-1 rounded-full bg-navy px-2 py-0.5 text-xs text-white">{pendingCount}</span>
          </h2>
          <ul className="mt-1 divide-y divide-line">
            {pending.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-1.5 py-1.5">
                <p className="min-w-0 flex-1 basis-56 truncate text-sm font-bold">
                  {p.name || "No name"} <span className="font-normal text-muted">{p.email}{p.requested_at && ` · ${date(p.requested_at)}`}</span>
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <form action={approveMember}>
                    <input type="hidden" name="userId" value={p.id} />
                    <button className="btn btn-primary btn-sm" type="submit">Approve</button>
                  </form>
                  <MembershipEndForm action={declineMember} userId={p.id} label="Decline" confirm={`Decline the request from ${p.email}?`} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <nav aria-label="Filter users" className="tabs !mb-0">
          <Link href="/admin/users" aria-current={requestsOnly ? undefined : "true"} className="tab">All users</Link>
          <Link href="/admin/users?filter=requests" aria-current={requestsOnly ? "true" : undefined} className="tab">
            Requests{pendingCount > 0 && <span className="ml-1.5 rounded-full bg-navy px-2 py-0.5 text-xs text-white">{pendingCount}</span>}
          </Link>
        </nav>
        <form className="flex min-w-0 flex-1 gap-2 sm:max-w-sm" role="search">
          {requestsOnly && <input type="hidden" name="filter" value="requests" />}
          <input type="hidden" name="sort" value={sort.column} />
          <input type="hidden" name="dir" value={sort.dir} />
          <label className="sr-only" htmlFor="user-search">Search users</label>
          <input id="user-search" name="q" defaultValue={query} placeholder="Search name or email" className="input min-w-0 flex-1" />
          <button className="btn btn-secondary btn-sm" type="submit">Search</button>
        </form>
      </div>

      {/* On phones the table headers are hidden, so sorting lives here. */}
      <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted sm:hidden">
        <span>Sort</span>
        <SortLink label="Name" column="name" {...sortProps} />
        <SortLink label="Email" column="email" {...sortProps} />
        <SortLink label="Joined" column="joined" defaultDir="desc" {...sortProps} />
        <SortLink label="Membership" column="membership" {...sortProps} />
        <SortLink label="Role" column="role" {...sortProps} />
      </div>

      {/* Not .table-wrap: it clips overflow, and the row menu has to hang below its row. */}
      <div className="table-open">
        <table className="table table-stack">
          <thead>
            <tr>
              <SortHeader label="Name" column="name" {...sortProps} />
              <SortHeader label="Email" column="email" {...sortProps} />
              <SortHeader label="Status" column="membership" {...sortProps} />
              <th>Committees</th>
              <SortHeader label="Joined" column="joined" defaultDir="desc" {...sortProps} />
              <th className="text-right"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isMe = u.id === me.id;
              const open = committees.filter((c) => !u.committees.some((own) => own.id === c.id));
              return (
                <tr key={u.id}>
                  <td data-primary className="font-medium">
                    {u.name || "No name"}
                    {isMe && <span className="badge ml-2">You</span>}
                  </td>
                  <td data-label="Email" className="text-muted sm:max-w-[16rem] sm:truncate" title={u.email}>{u.email}</td>
                  <td data-label="Status">
                    <div className="flex flex-wrap justify-end gap-1 sm:justify-start">
                      {u.member_status === "approved" && !u.lapsed && <span className="badge">Member</span>}
                      {u.lapsed && <span className="badge !bg-soft !text-muted">Lapsed</span>}
                      {u.member_status === "pending" && <span className="badge !bg-navy !text-white">Requested</span>}
                      {u.member_status === "declined" && <span className="badge !bg-soft !text-muted">Declined</span>}
                      {u.member_status === "revoked" && <span className="badge !bg-soft !text-muted">Removed</span>}
                      {u.role === "admin" && <span className="badge !bg-navy !text-white">Admin</span>}
                      {u.banned && <span className="badge !bg-danger/10 !text-danger">Banned</span>}
                    </div>
                  </td>
                  <td data-label="Committees" className="text-xs text-muted">{u.committees.length > 0 ? u.committees.map((c) => c.name).join(", ") : "–"}</td>
                  <td data-label="Joined" className="whitespace-nowrap text-muted">{date(u.createdAt)}</td>
                  <td>
                    <div className="flex w-full flex-wrap items-start justify-end gap-1.5">
                      {u.member_status === "pending" && (
                        <form action={approveMember}>
                          <input type="hidden" name="userId" value={u.id} />
                          <button className="btn btn-primary btn-sm" type="submit">Approve</button>
                        </form>
                      )}
                      <details className="popover max-sm:w-full">
                        <summary className="btn btn-secondary btn-sm max-sm:w-full" aria-label={`Edit ${u.name || u.email}`} title="Edit"><span className="sm:hidden">Edit</span><span aria-hidden="true" className="max-sm:hidden text-base leading-none">⋯</span></summary>
                        <div className="popover__panel space-y-3 text-sm">
                          <section aria-label="Membership" className="space-y-1.5">
                            <h3 className="text-xs font-bold uppercase tracking-wide text-muted">Membership</h3>
                            {u.member_decided_at && (
                              <p className="text-muted">
                                {DECISION_LABEL[u.member_status]}
                                {u.decided_by_name ? ` by ${u.decided_by_name}` : ""} on {date(u.member_decided_at)}
                                {u.member_decision_reason && <> &ldquo;{u.member_decision_reason}&rdquo;</>}
                              </p>
                            )}
                            {u.lapsed && <p className="text-muted">No sign-in for 5 years.</p>}
                            <div className="flex flex-col items-start gap-2">
                              {(u.member_status !== "approved" || u.lapsed) && u.member_status !== "pending" && (
                                <form action={approveMember}>
                                  <input type="hidden" name="userId" value={u.id} />
                                  <button className="btn btn-primary btn-sm" type="submit">Approve</button>
                                </form>
                              )}
                              {u.member_status === "pending" && (
                                <MembershipEndForm action={declineMember} userId={u.id} label="Decline" confirm={`Decline the request from ${u.email}?`} />
                              )}
                              {u.member_status === "approved" && !isMe && (
                                <MembershipEndForm action={revokeMember} userId={u.id} label="Remove" confirm={`End ${u.email}'s membership?`} />
                              )}
                            </div>
                          </section>

                          <section aria-label="Committees" className="space-y-1.5">
                            <h3 className="text-xs font-bold uppercase tracking-wide text-muted">Committees</h3>
                            {u.committees.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {u.committees.map((c) => (
                                  <form key={c.id} action={removeCommitteeMember}>
                                    <input type="hidden" name="committeeId" value={c.id} />
                                    <input type="hidden" name="userId" value={u.id} />
                                    <button type="submit" className="badge cursor-pointer" title={`Remove from ${c.name}`}>{c.name} ×</button>
                                  </form>
                                ))}
                              </div>
                            )}
                            {open.length > 0 && (
                              <form action={addCommitteeMember} className="flex gap-1.5">
                                <input type="hidden" name="userId" value={u.id} />
                                <select name="committeeId" aria-label={`Add ${u.email} to a committee`} className="input min-w-0 flex-1" required defaultValue="">
                                  <option value="" disabled>Add to committee…</option>
                                  {open.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <button className="btn btn-secondary btn-sm" type="submit">Add</button>
                              </form>
                            )}
                          </section>

                          {!isMe && (
                            <section aria-label="Account" className="space-y-1.5">
                              <h3 className="text-xs font-bold uppercase tracking-wide text-muted">Account</h3>
                              <div className="flex flex-wrap gap-1.5">
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
                            </section>
                          )}
                        </div>
                      </details>
                    </div>
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr><td colSpan={6} className="py-10 text-center text-muted">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
