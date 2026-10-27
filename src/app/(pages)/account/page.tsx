import type { Metadata } from "next";
import Link from "next/link";
import AccountPanel from "@/components/AccountPanel";
import sql from "@/lib/db";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };
export const dynamic = "force-dynamic";

const STATUS_TEXT: Record<string, string> = {
  confirmed: "You are subscribed to the newsletter.",
  pending: "You started a subscription but have not confirmed it yet. Check your inbox for the link.",
  unsubscribed: "You are unsubscribed from the newsletter.",
};

export default async function AccountPage() {
  const { user } = await requireUser();
  const [subscriber] = await sql<{ status: string }[]>`
    SELECT status FROM newsletter_subscribers WHERE lower(email) = ${user.email.toLowerCase()}
  `;

  return (
    <div className="container-prose py-14 sm:py-20">
      <h1 className="mt-3 text-4xl font-extrabold">Hello{user.name ? `, ${user.name}` : ""}</h1>
      <dl className="card mt-8 divide-y divide-line">
        <div className="flex flex-wrap justify-between gap-2 p-5">
          <dt className="text-sm text-muted">Email</dt>
          <dd className="font-medium">{user.email}</dd>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 p-5">
          <dt className="text-sm text-muted">Newsletter</dt>
          <dd className="text-sm">
            {subscriber ? STATUS_TEXT[subscriber.status] : "You are not subscribed."}{" "}
            {(!subscriber || subscriber.status !== "confirmed") && (
              <Link href="/newsletter" className="font-semibold text-accent-text underline underline-offset-2">Subscribe</Link>
            )}
          </dd>
        </div>
        {user.role === "admin" && (
          <div className="flex flex-wrap items-center justify-between gap-2 p-5">
            <dt className="text-sm text-muted">Role</dt>
            <dd><Link href="/admin" className="badge">Admin · open dashboard</Link></dd>
          </div>
        )}
      </dl>
      <div className="mt-8">
        <AccountPanel initialName={user.name ?? ""} />
      </div>
    </div>
  );
}
