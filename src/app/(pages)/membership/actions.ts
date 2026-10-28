"use server";

import { revalidatePath } from "next/cache";
import sql from "@/lib/db";
import { requireUser } from "@/lib/session";

/** Asks for membership. An admin approves it; asking again while pending, or once approved, changes nothing. */
export async function requestMembership(): Promise<void> {
  const { user } = await requireUser();
  await sql`
    UPDATE "user" SET member_status = 'pending', member_requested_at = NOW()
    WHERE id = ${user.id} AND member_status = 'none'
  `;
  revalidatePath("/account");
  revalidatePath("/admin/users");
}
