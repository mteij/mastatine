import AppFrame from "@/components/ui/AppFrame";
import MembershipRequest from "@/components/MembershipRequest";
import Link from "next/link";
import { getMembership } from "@/lib/membership";
import { hasDisplayName } from "@/lib/profile";
import { getSession } from "@/lib/session";

/**
 * Gate for members-only MastApp pages. Returns the "members only" page for everyone else, or null for members.
 * Call it before loading any data, so nothing private is fetched for a visitor.
 */
export async function membersOnlyGate(title: string, next: string) {
  const membership = await getMembership();
  const session = await getSession();
  const needsName = !!session && !hasDisplayName(session.user.name);
  if (membership.isMember && !needsName) return null;

  return (
    <AppFrame title={title}>
      <section className="card max-w-xl p-6">
        {needsName ? (
          <>
            <h2 className="text-xl font-extrabold">Choose a display name first</h2>
            <p className="mt-2 text-muted">Other members see your display name, never your email address. It takes a few seconds.</p>
            <Link href={`/account/name?next=${encodeURIComponent(next)}`} className="btn btn-primary mt-5">Choose a display name</Link>
          </>
        ) : (
        <>
        <h2 className="text-xl font-extrabold">Members only</h2>
        <p className="mt-2 text-muted">This part of Mastatine is private to members. Membership is free; an admin approves each request.</p>
        <div className="mt-5">
          <MembershipRequest membership={membership} next={next} />
        </div>
        </>
        )}
      </section>
    </AppFrame>
  );
}
