import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AppFrame from "@/components/ui/AppFrame";
import { getActivity } from "@/lib/activities";
import { getCommitteesFor } from "@/lib/committees";
import { requireUser } from "@/lib/session";
import ActivityForm from "../../ActivityForm";
import { activityToValues } from "../../formValues";

export const metadata: Metadata = { title: "Edit activity", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function EditActivityPage(props: { params: Promise<{ id: string }> }) {
  const { user } = await requireUser();
  const { id } = await props.params;
  const activity = /^[0-9a-f-]{36}$/i.test(id) ? await getActivity(id, user.id) : null;
  const committees = await getCommitteesFor(user);
  if (!activity || !committees.some((c) => c.id === activity.committee_id)) notFound();

  return (
    <AppFrame title={`Edit ${activity.name}`}>
      <ActivityForm values={activityToValues(activity)} committees={committees} />
    </AppFrame>
  );
}
