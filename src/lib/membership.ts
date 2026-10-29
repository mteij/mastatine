import { cache } from "react";
import sql from "@/lib/db";
import { getSession } from "@/lib/session";

/** What is stored for a person. "approved" can still be an expired membership; see `lapsed` below. */
export type MemberStatus = "none" | "pending" | "approved" | "declined" | "revoked";

/** After a decline or an ended membership, the person waits this long before asking again. */
export const REREQUEST_COOLDOWN_DAYS = 30;

export interface Membership {
  signedIn: boolean;
  status: MemberStatus;
  /** Admins, approved members and committee members count as members. */
  isMember: boolean;
  /** Approved once, but inactive for too long: they can ask again. */
  lapsed: boolean;
  /** When someone who was declined or removed may ask again; null when they may ask now. */
  retryAfter: Date | null;
}

const VISITOR: Membership = { signedIn: false, status: "none", isMember: false, lapsed: false, retryAfter: null };

/** Who the current visitor is, membership-wise. Deduplicated per request. */
export const getMembership = cache(async (): Promise<Membership> => {
  const session = await getSession();
  if (!session) return VISITOR;

  try {
    // The rule itself lives in the is_member() SQL function, shared with the newsletter audience.
    const [row] = await sql<{ member_status: MemberStatus; member_decided_at: Date | null; is_member: boolean }[]>`
      SELECT member_status, member_decided_at, is_member(id) AS is_member FROM "user" WHERE id = ${session.user.id}
    `;
    const status = row?.member_status ?? "none";
    const isMember = row?.is_member === true;
    const decidedAt = row?.member_decided_at;
    const retryAfter =
      decidedAt && (status === "declined" || status === "revoked") ? new Date(decidedAt.getTime() + REREQUEST_COOLDOWN_DAYS * 86_400_000) : null;
    return {
      signedIn: true,
      status,
      isMember,
      lapsed: status === "approved" && !isMember,
      retryAfter: retryAfter && retryAfter > new Date() ? retryAfter : null,
    };
  } catch (error) {
    // This runs in the site layout: never take every page down. Fail closed (treated as a non-member).
    console.error("Failed to read membership:", (error as Error).message);
    return { signedIn: true, status: "none", isMember: false, lapsed: false, retryAfter: null };
  }
});
