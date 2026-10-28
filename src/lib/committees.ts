import sql from "@/lib/db";

export interface Committee {
  id: string;
  name: string;
}

export interface Person {
  id: string;
  name: string;
  email: string;
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
    SELECT u.id, u.name, u.email FROM "user" u JOIN committee_members m ON m.user_id = u.id
    WHERE m.committee_id = ${committeeId} ORDER BY u.name, u.email
  `;
}

export const displayName = (u: { name: string | null; email: string }): string => u.name?.trim() || u.email;
