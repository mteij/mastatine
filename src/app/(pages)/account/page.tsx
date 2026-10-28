import type { Metadata } from "next";
import Link from "next/link";
import AccountPanel from "@/components/AccountPanel";
import { getApps } from "@/content/apps";
import sql from "@/lib/db";
import { requireUser } from "@/lib/session";
import { getShopUrl } from "@/lib/shop";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };
export const dynamic = "force-dynamic";

const STATUS_TEXT: Record<string, string> = {
  confirmed: "Subscribed to the newsletter.",
  pending: "Subscription not confirmed yet. Check your inbox.",
  unsubscribed: "Unsubscribed from the newsletter.",
};

export default async function AccountPage() {
  const { user } = await requireUser();
  const [subscriber] = await sql<{ status: string }[]>`
    SELECT status FROM newsletter_subscribers WHERE lower(email) = ${user.email.toLowerCase()}
  `;
  const apps = getApps(getShopUrl());

  return (
    <div className="container-prose py-10 sm:py-16">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Hello{user.name ? `, ${user.name}` : ""}</h1>
        {user.role === "admin" && (
          <Link href="/admin" className="badge">Admin dashboard</Link>
        )}
      </div>
      <p className="mt-1 break-all text-muted">{user.email}</p>

      <section aria-labelledby="quick-links" className="mt-6">
        <h2 id="quick-links" className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">MastApps</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {apps.map((app) => (
            <li key={app.slug}>
              <Link
                href={app.href}
                {...(app.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="card flex h-full items-center gap-3 p-3 font-bold text-ink hover:border-accent hover:text-accent-text"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-text">{app.icon}</span>
                <span className="min-w-0 truncate">{app.name}</span>
              </Link>
            </li>
          ))}
          <li>
            <Link href="/mastapps" className="card flex h-full items-center justify-center p-3 text-sm font-bold text-accent-text hover:border-accent">
              All MastApps &rarr;
            </Link>
          </li>
        </ul>
      </section>

      <p className="mt-6 text-sm text-muted">
        {subscriber ? STATUS_TEXT[subscriber.status] : "Not subscribed to the newsletter."}{" "}
        {(!subscriber || subscriber.status !== "confirmed") && (
          <Link href="/newsletter" className="font-semibold text-accent-text underline underline-offset-2">Subscribe</Link>
        )}
      </p>

      <div className="mt-6">
        <AccountPanel initialName={user.name ?? ""} />
      </div>
    </div>
  );
}
