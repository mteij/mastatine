import AppFrame from "@/components/ui/AppFrame";
import MembershipRequest from "@/components/MembershipRequest";
import { getMembership } from "@/lib/membership";

/**
 * Gate for members-only MastApp pages. Returns the "members only" page for everyone else, or null for members.
 * Call it before loading any data, so nothing private is fetched for a visitor.
 */
export async function membersOnlyGate(title: string, next: string) {
  const membership = await getMembership();
  if (membership.isMember) return null;

  return (
    <AppFrame title={title}>
      <section className="card max-w-xl p-6">
        <h2 className="text-xl font-extrabold">Members only</h2>
        <p className="mt-2 text-muted">This part of Mastatine is private to members. Membership is free; an admin approves each request.</p>
        <div className="mt-5">
          <MembershipRequest membership={membership} next={next} />
        </div>
      </section>
    </AppFrame>
  );
}
