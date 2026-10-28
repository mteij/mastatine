"use server";

import { unlink } from "node:fs/promises";
import path from "node:path";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import sql from "@/lib/db";
import { getAuth } from "@/lib/auth";
import { requireAdmin } from "@/lib/session";
import { UPLOAD_DIR, UPLOAD_FILENAME_RE } from "@/lib/uploads";
import { sendIssue, sendTestIssue } from "@/lib/newsletter";

// Server actions are public HTTP endpoints: every one re-checks the admin role itself.

const id = z.string().uuid();
const userId = z.string().min(1).max(64);

/* ─────────────────────────────── masts ─────────────────────────────── */

async function removeUploadIfUnused(imageUrl: string) {
  const filename = imageUrl.startsWith("/uploads/") ? imageUrl.slice("/uploads/".length) : "";
  if (!UPLOAD_FILENAME_RE.test(filename)) return;
  const [stillUsed] = await sql`SELECT 1 FROM towers WHERE image_url = ${imageUrl} LIMIT 1`;
  if (stillUsed) return;
  await unlink(path.join(UPLOAD_DIR, filename)).catch(() => {});
}

export async function deleteMast(formData: FormData) {
  await requireAdmin();
  const mastId = id.parse(formData.get("id"));
  const [row] = await sql<{ image_url: string }[]>`DELETE FROM towers WHERE id = ${mastId} RETURNING image_url`;
  if (row) await removeUploadIfUnused(row.image_url);
  revalidatePath("/admin/masts");
}

const mastSchema = z.object({
  id,
  title: z.string().trim().min(1).max(120),
  submitter_name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(1000),
  height: z.preprocess((v) => (v === "" || v == null ? null : Number(v)), z.number().min(0).max(2000).nullable()),
});

export async function updateMast(formData: FormData) {
  await requireAdmin();
  const data = mastSchema.parse(Object.fromEntries(formData));
  await sql`
    UPDATE towers SET title = ${data.title}, submitter_name = ${data.submitter_name},
      description = ${data.description || null}, height = ${data.height}
    WHERE id = ${data.id}
  `;
  revalidatePath("/admin/masts");
  redirect("/admin/masts");
}

/* ─────────────────────────────── users ─────────────────────────────── */

async function requireOtherUser(formData: FormData) {
  const session = await requireAdmin();
  const target = userId.parse(formData.get("userId"));
  if (target === session.user.id) throw new Error("You cannot change your own account here.");
  return target;
}

export async function setUserRole(formData: FormData) {
  const target = await requireOtherUser(formData);
  const role = z.enum(["admin", "user"]).parse(formData.get("role"));
  await getAuth().api.setRole({ body: { userId: target, role }, headers: await headers() });
  revalidatePath("/admin/users");
}

export async function banUser(formData: FormData) {
  const target = await requireOtherUser(formData);
  await getAuth().api.banUser({ body: { userId: target, banReason: "Banned by an administrator" }, headers: await headers() });
  revalidatePath("/admin/users");
}

export async function unbanUser(formData: FormData) {
  const target = await requireOtherUser(formData);
  await getAuth().api.unbanUser({ body: { userId: target }, headers: await headers() });
  revalidatePath("/admin/users");
}

export async function removeUser(formData: FormData) {
  const target = await requireOtherUser(formData);
  await getAuth().api.removeUser({ body: { userId: target }, headers: await headers() });
  revalidatePath("/admin/users");
}

/* ───────────────────────────── newsletter ───────────────────────────── */

const issueSchema = z.object({
  subject: z.string().trim().min(1).max(150),
  body: z.string().trim().min(1).max(20000),
});

export async function createIssue(formData: FormData) {
  const session = await requireAdmin();
  const data = issueSchema.parse(Object.fromEntries(formData));
  const [issue] = await sql<{ id: string }[]>`
    INSERT INTO newsletters (subject, body, created_by) VALUES (${data.subject}, ${data.body}, ${session.user.id}) RETURNING id
  `;
  redirect(`/admin/newsletter/${issue.id}`);
}

export async function saveIssue(formData: FormData) {
  await requireAdmin();
  const issueId = id.parse(formData.get("id"));
  const data = issueSchema.parse(Object.fromEntries(formData));
  await sql`UPDATE newsletters SET subject = ${data.subject}, body = ${data.body} WHERE id = ${issueId} AND status = 'draft'`;
  redirect(`/admin/newsletter/${issueId}?notice=saved`);
}

export async function deleteIssue(formData: FormData) {
  await requireAdmin();
  await sql`DELETE FROM newsletters WHERE id = ${id.parse(formData.get("id"))} AND status = 'draft'`;
  redirect("/admin/newsletter");
}

export async function sendTest(formData: FormData) {
  const session = await requireAdmin();
  const issueId = id.parse(formData.get("id"));
  try {
    await sendTestIssue(issueId, session.user.email);
  } catch (error) {
    console.error("Test send failed:", (error as Error).message);
    redirect(`/admin/newsletter/${issueId}?notice=test-failed`);
  }
  redirect(`/admin/newsletter/${issueId}?notice=test-sent`);
}

/** Starts sending (draft) or resumes an interrupted send. Delivery continues after the response is returned. */
export async function startSending(formData: FormData) {
  await requireAdmin();
  const issueId = id.parse(formData.get("id"));
  const [recipients] = await sql<{ n: number }[]>`SELECT COUNT(*)::int AS n FROM newsletter_subscribers WHERE status = 'confirmed'`;
  if (recipients.n === 0) redirect(`/admin/newsletter/${issueId}?notice=no-recipients`);
  after(() => sendIssue(issueId));
  redirect(`/admin/newsletter/${issueId}?notice=sending`);
}

export async function removeSubscriber(formData: FormData) {
  await requireAdmin();
  await sql`DELETE FROM newsletter_subscribers WHERE id = ${id.parse(formData.get("id"))}`;
  revalidatePath("/admin/newsletter");
}

/* ─────────────────────────────── committees ─────────────────────────────── */

const committeeSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(200),
});

function refreshCommittees() {
  revalidatePath("/admin/committees");
  revalidatePath("/admin/members");
}

export async function createCommittee(formData: FormData) {
  await requireAdmin();
  const data = committeeSchema.parse(Object.fromEntries(formData));
  await sql`INSERT INTO committees (name, description) VALUES (${data.name}, ${data.description || null}) ON CONFLICT DO NOTHING`;
  refreshCommittees();
}

export async function deleteCommittee(formData: FormData) {
  await requireAdmin();
  await sql`DELETE FROM committees WHERE id = ${id.parse(formData.get("id"))}`;
  refreshCommittees();
}

export async function addCommitteeMember(formData: FormData) {
  await requireAdmin();
  const committeeId = id.parse(formData.get("committeeId"));
  const member = userId.parse(formData.get("userId"));
  await sql`INSERT INTO committee_members (committee_id, user_id) VALUES (${committeeId}, ${member}) ON CONFLICT DO NOTHING`;
  refreshCommittees();
}

export async function removeCommitteeMember(formData: FormData) {
  await requireAdmin();
  await sql`DELETE FROM committee_members WHERE committee_id = ${id.parse(formData.get("committeeId"))} AND user_id = ${userId.parse(formData.get("userId"))}`;
  refreshCommittees();
}

export async function toggleCommitteeChair(formData: FormData) {
  await requireAdmin();
  await sql`
    UPDATE committee_members SET is_chair = NOT is_chair
    WHERE committee_id = ${id.parse(formData.get("committeeId"))} AND user_id = ${userId.parse(formData.get("userId"))}
  `;
  refreshCommittees();
}
