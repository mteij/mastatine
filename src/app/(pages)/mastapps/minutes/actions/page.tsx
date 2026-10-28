import type { Metadata } from "next";
import Link from "next/link";
import AppFrame from "@/components/ui/AppFrame";
import { getCommitteeActions } from "@/lib/meetings";
import { requireUser } from "@/lib/session";
import ActionList from "../ActionList";

export const metadata: Metadata = { title: "Actions", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ActionsPage(props: { searchParams: Promise<{ done?: string }> }) {
  const { user } = await requireUser();
  const includeDone = (await props.searchParams).done === "1";
  const actions = await getCommitteeActions(user, includeDone);

  return (
    <AppFrame title="Actions" tagline="Action points of your committees.">
      <nav aria-label="Filter actions" className="tabs">
        <Link href="/mastapps/minutes/actions" aria-current={includeDone ? undefined : "true"} className="tab">Open</Link>
        <Link href="/mastapps/minutes/actions?done=1" aria-current={includeDone ? "true" : undefined} className="tab">All</Link>
      </nav>
      <section className="card p-5">
        <ActionList actions={actions} showAssignee canDelete />
      </section>
    </AppFrame>
  );
}
