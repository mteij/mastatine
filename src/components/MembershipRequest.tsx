import Link from "next/link";
import { requestMembership } from "@/app/(pages)/membership/actions";
import type { Membership } from "@/lib/membership";

interface MembershipRequestProps {
  membership: Membership;
  /** Where to come back to after signing in. */
  next: string;
}

/** The right next step for someone who is not a member yet: sign in, ask, or wait. */
export default function MembershipRequest({ membership, next }: MembershipRequestProps) {
  if (membership.isMember) return <p className="font-bold text-success">You are a member.</p>;

  if (!membership.signedIn) {
    return (
      <Link href={`/login?next=${encodeURIComponent(next)}`} className="btn btn-primary">
        Sign in to request membership
      </Link>
    );
  }

  if (membership.status === "pending") {
    return <p className="rounded-xl bg-soft px-4 py-3 text-sm">Your request is waiting for an admin to approve it. You will have access as soon as they do.</p>;
  }

  const waitFor = membership.retryAfter?.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const explanation = membership.lapsed
    ? "Your membership lapsed after five years without signing in. You can ask again."
    : membership.status === "declined"
      ? "Your request was declined."
      : membership.status === "revoked"
        ? "Your membership was ended by an admin."
        : null;

  if (waitFor) {
    return <p className="rounded-xl bg-soft px-4 py-3 text-sm">{explanation} You can ask again after {waitFor}.</p>;
  }

  return (
    <div className="space-y-3">
      {explanation && <p className="rounded-xl bg-soft px-4 py-3 text-sm">{explanation}</p>}
      <form action={requestMembership}>
        <button type="submit" className="btn btn-primary">Request membership</button>
      </form>
    </div>
  );
}
