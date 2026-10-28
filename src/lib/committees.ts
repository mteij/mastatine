import sql from "@/lib/db";

export interface Committee {
  id: string;
  name: string;
}

export interface Person {
  id: string;
  name: string;
}

type Viewer = { id: string; role?: string | null };

/** Committees a user belongs to; admins count as members of every committee. */
export function getCommitteesFor(user: Viewer): Promise<Committee[]> {
  if (user.role === "admin") return sql<Committee[]>`SELECT id, name FROM committees ORDER BY name`;
  return sql<Committee[]>`
    SELECT c.id, c.name FROM committees c JOIN committee_members m ON m.committee_id = c.id
    WHERE m.user_id = ${user.id} ORDER BY c.name
  `;
}

export async function isCommitteeMember(user: Viewer, committeeId: string): Promise<boolean> {
  if (user.role === "admin") return true;
  const [row] = await sql`SELECT 1 FROM committee_members WHERE user_id = ${user.id} AND committee_id = ${committeeId}`;
  return !!row;
}

/** Members of one committee, for handing out action points. */
export function getCommitteePeople(committeeId: string) {
  return sql<Person[]>`
    SELECT u.id, u.name FROM "user" u JOIN committee_members m ON m.user_id = u.id
    WHERE m.committee_id = ${committeeId} ORDER BY u.name
  `;
}

export interface PublicCommittee {
  id: string;
  name: string;
  description: string | null;
  /** Display names only (never email addresses), chairs first. */
  members: { name: string; is_chair: boolean }[];
}

/** Every committee with its members, for the public committees page. */
export async function getPublicCommittees(): Promise<PublicCommittee[]> {
  const [committees, members] = await Promise.all([
    sql<{ id: string; name: string; description: string | null }[]>`SELECT id, name, description FROM committees ORDER BY name`,
    sql<{ committee_id: string; name: string; is_chair: boolean }[]>`
      SELECT m.committee_id, COALESCE(NULLIF(trim(u.name), ''), 'Member') AS name, m.is_chair
      FROM committee_members m JOIN "user" u ON u.id = m.user_id
      WHERE NOT u.banned
      ORDER BY m.is_chair DESC, lower(u.name)
    `,
  ]);
  return committees.map((c) => ({
    ...c,
    members: members.filter((m) => m.committee_id === c.id).map(({ name, is_chair }) => ({ name, is_chair })),
  }));
}

/** What other people see for a person. Never falls back to an email address. */
export const displayName = (u: { name: string | null }): string => u.name?.trim() || "Unnamed member";
