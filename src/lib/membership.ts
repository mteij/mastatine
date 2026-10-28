import { cache } from "react";
import sql from "@/lib/db";
import { getSession } from "@/lib/session";

export type MemberStatus = "none" | "pending" | "approved";

export interface Membership {
  signedIn: boolean;
  status: MemberStatus;
  /** Admins, approved members and committee members count as members. */
  isMember: boolean;
}

const VISITOR: Membership = { signedIn: false, status: "none", isMember: false };

/** Who the current visitor is, membership-wise. Deduplicated per request. */
export const getMembership = cache(async (): Promise<Membership> => {
  const session = await getSession();
  if (!session) return VISITOR;

  try {
    const [row] = await sql<{ member_status: MemberStatus; in_committee: boolean }[]>`
      SELECT member_status, EXISTS (SELECT 1 FROM committee_members WHERE user_id = ${session.user.id}) AS in_committee
      FROM "user" WHERE id = ${session.user.id}
    `;
    const status = row?.member_status ?? "none";
    return { signedIn: true, status, isMember: session.user.role === "admin" || status === "approved" || row?.in_committee === true };
  } catch (error) {
    // This runs in the site layout: never take every page down. Fail closed (treated as a non-member).
    console.error("Failed to read membership:", (error as Error).message);
    return { signedIn: true, status: "none", isMember: false };
  }
});
