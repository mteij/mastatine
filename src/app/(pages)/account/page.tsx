import type { Metadata } from "next";
import Link from "next/link";
import AccountPanel from "@/components/AccountPanel";
import MembershipRequest from "@/components/MembershipRequest";
import SignOutButton from "@/components/SignOutButton";
import { getMembership } from "@/lib/membership";
import { getNewsletterStatus, type NewsletterStatus } from "@/lib/newsletter";
import { requireUser } from "@/lib/session";
import { setNewsletter } from "./actions";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };
export const dynamic = "force-dynamic";

const STATUS_TEXT: Record<NewsletterStatus, string> = {
  confirmed: "You receive the newsletter, about four times a year.",
  pending: "Your subscription is not confirmed yet. Subscribing here confirms it right away.",
  unsubscribed: "You do not receive the newsletter.",
  none: "You do not receive the newsletter.",
};

export default async function AccountPage(props: { searchParams: Promise<{ email?: string; error?: string }> }) {
  const { user } = await requireUser();
  const { email: emailResult, error: linkError } = await props.searchParams;
  const [newsletter, membership] = await Promise.all([getNewsletterStatus(user.email), getMembership()]);

  return (
    <div className="container-prose pb-10 pt-20 sm:py-16">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h1 className="text-4xl font-extrabold sm:text-5xl">Hello{user.name ? `, ${user.name}` : ""}</h1>
        <SignOutButton />
      </div>
      {emailResult === "changed" && !linkError && <p role="status" className="mt-3 rounded-xl bg-success/10 px-4 py-3 text-sm text-success">Your email address is now {user.email}. Use it to sign in from now on.</p>}
      {linkError && <p role="alert" className="mt-3 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">That confirmation link did not work. It may have expired or been used already; ask for a new one below.</p>}

      {!membership.isMember && (
        <section id="membership" aria-labelledby="membership-title" className="card mt-6 p-4">
          <h2 id="membership-title" className="font-extrabold">Become a member</h2>
          <p className="mb-3 mt-1 text-sm text-muted">Members get access to the Quotes app and to members-only activities. It is free; an admin approves each request.</p>
          <MembershipRequest membership={membership} next="/account" />
        </section>
      )}

      <Link href="/mastapps" className="card mt-6 flex items-center justify-between p-4 font-extrabold text-ink hover:border-accent hover:text-accent-text">
        <span>Open MastApps</span>
        <span aria-hidden>&rarr;</span>
      </Link>

      <section aria-labelledby="newsletter-title" className="card mt-6 flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <h2 id="newsletter-title" className="font-extrabold">Newsletter</h2>
          <p className="mt-1 text-sm text-muted">{STATUS_TEXT[newsletter]}</p>
        </div>
        <form action={setNewsletter}>
          <input type="hidden" name="subscribe" value={newsletter === "confirmed" ? "no" : "yes"} />
          <button type="submit" className={`btn btn-sm ${newsletter === "confirmed" ? "btn-secondary" : "btn-primary"}`}>
            {newsletter === "confirmed" ? "Unsubscribe" : "Subscribe"}
          </button>
        </form>
      </section>

      <div className="mt-6">
        <AccountPanel initialName={user.name ?? ""} email={user.email} />
      </div>
    </div>
  );
}
