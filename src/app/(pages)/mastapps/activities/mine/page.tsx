import type { Metadata } from "next";
import Link from "next/link";
import AppFrame from "@/components/ui/AppFrame";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { formatParticipants, getManagedActivities } from "@/lib/activities";
import { formatDateTime } from "@/lib/datetime";
import { requireUser } from "@/lib/session";
import { deleteActivity } from "../actions";

export const metadata: Metadata = { title: "Your activities", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function MyActivitiesPage() {
  const { user } = await requireUser();
  const activities = await getManagedActivities(user);

  return (
    <AppFrame
      title="Your activities"
      hideTitle
      actions={activities.length > 0 && <Link href="/mastapps/activities/stats" className="btn btn-secondary btn-sm">Statistics</Link>}
    >
      {activities.length === 0 ? (
        <p className="card p-8 text-center text-muted">Nothing here yet. <Link href="/mastapps/activities/new" className="font-bold text-accent-text underline">Create an activity</Link>.</p>
      ) : (
        <div className="table-wrap">
          <table className="table table-stack">
            <thead>
              <tr><th>Activity</th><th>Committee</th><th>Start</th><th>Participants</th><th><span className="sr-only">Actions</span></th></tr>
            </thead>
            <tbody>
              {activities.map((a) => (
                <tr key={a.id}>
                  <td data-primary>
                    <Link href={`/mastapps/activities/${a.id}`} className="font-medium">{a.name}</Link>
                    {!a.is_visible && <span className="badge ml-2">hidden</span>}
                  </td>
                  <td data-label="Committee">{a.committee_name}</td>
                  <td data-label="Start" className="whitespace-nowrap text-muted">{formatDateTime(a.starts_at)}</td>
                  <td data-label="Participants">{formatParticipants(a)}</td>
                  <td>
                    <div className="flex w-full flex-wrap justify-end gap-2">
                      <Link href={`/mastapps/activities/${a.id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                      <form action={deleteActivity}>
                        <input type="hidden" name="id" value={a.id} />
                        <ConfirmButton message={`Delete ${a.name}? All subscriptions are removed too.`} className="btn btn-danger btn-sm">Delete</ConfirmButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppFrame>
  );
}
