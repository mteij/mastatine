import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { hasDisplayName } from "@/lib/profile";
import { safeNextPath } from "@/lib/safe-redirect";
import { requireUser } from "@/lib/session";
import DisplayNameForm from "./DisplayNameForm";

export const metadata: Metadata = { title: "Choose a display name", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function DisplayNamePage(props: { searchParams: Promise<{ next?: string; change?: string }> }) {
  const { user } = await requireUser({ allowUnnamed: true });
  const { next, change } = await props.searchParams;
  const target = safeNextPath(next, "/account");
  // Already named: nothing to do here, unless they came to change it on purpose.
  if (hasDisplayName(user.name) && !change) redirect(target);

  return (
    <div className="container-prose flex justify-center pb-10 pt-20 sm:py-24">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Choose a display name</h1>
        <p className="mt-3 text-muted">
          This is how other members see you, for example next to your quotes and in the list of who is going to an activity.
          Your email address stays private.
        </p>
        <div className="card mt-8 p-6 sm:p-8">
          <DisplayNameForm initialName={hasDisplayName(user.name) ? user.name : ""} next={target} />
        </div>
      </div>
    </div>
  );
}
