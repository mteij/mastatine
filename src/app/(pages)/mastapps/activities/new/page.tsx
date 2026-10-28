import type { Metadata } from "next";
import Link from "next/link";
import AppFrame from "@/components/ui/AppFrame";
import { getCommitteesFor } from "@/lib/committees";
import { requireUser } from "@/lib/session";
import ActivityForm from "../ActivityForm";
import { emptyActivityValues } from "../formValues";

export const metadata: Metadata = { title: "Create activity", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function NewActivityPage() {
  const { user } = await requireUser();
  const committees = await getCommitteesFor(user);

  return (
    <AppFrame title="Add a new activity" tagline="Plan something for the members.">
      {committees.length === 0 ? (
        <p className="card p-6">
          Only committee members can create activities. Ask an admin to add you to your committee, or <Link href="/contact" className="underline">get in touch</Link>.
        </p>
      ) : (
        <ActivityForm values={emptyActivityValues(committees.length === 1 ? committees[0].id : undefined)} committees={committees} />
      )}
    </AppFrame>
  );
}
