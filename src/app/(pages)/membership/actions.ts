"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import sql from "@/lib/db";
import { membershipRequestedEmail } from "@/lib/email-templates";
import { sendMail } from "@/lib/mailer";
import { REREQUEST_COOLDOWN_DAYS } from "@/lib/membership";
import { requireUser } from "@/lib/session";

/**
 * Asks for membership and tells the admins. Asking again while pending, or while already a member, changes nothing.
 * After a decline or an ended membership the person waits out a cooldown; a lapsed member can ask straight away.
 */
export async function requestMembership(): Promise<void> {
  const { user } = await requireUser();
  const [asked] = await sql<{ name: string; email: string }[]>`
    UPDATE "user" SET member_status = 'pending', member_requested_at = NOW()
    WHERE id = ${user.id} AND NOT is_member(id) AND member_status <> 'pending'
      AND (member_status NOT IN ('declined', 'revoked') OR member_decided_at IS NULL
           OR member_decided_at < NOW() - make_interval(days => ${REREQUEST_COOLDOWN_DAYS}))
    RETURNING name, email
  `;
  if (asked) after(() => notifyAdmins(asked));
  revalidatePath("/account");
  revalidatePath("/membership");
  revalidatePath("/admin/users");
}

async function notifyAdmins(person: { name: string; email: string }): Promise<void> {
  const admins = await sql<{ email: string }[]>`SELECT email FROM "user" WHERE role = 'admin' AND NOT banned`;
  const message = membershipRequestedEmail({ name: person.name.trim() || null, email: person.email });
  // One mail per admin so nobody sees the other addresses.
  const results = await Promise.allSettled(admins.map((admin) => sendMail({ to: admin.email, ...message })));
  for (const result of results) {
    if (result.status === "rejected") console.error("Failed to send the membership request email:", (result.reason as Error).message);
  }
}
