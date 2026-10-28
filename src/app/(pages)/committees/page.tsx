import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import { getPublicCommittees, type PublicCommittee } from "@/lib/committees";

export const metadata: Metadata = {
  title: "Committees",
  description: "The committees that keep S.A. Mastatine running.",
};

// Committees and their members are managed in the admin, so this page is rendered per request.
export const dynamic = "force-dynamic";

async function loadCommittees(): Promise<PublicCommittee[]> {
  try {
    return await getPublicCommittees();
  } catch (error) {
    console.error("Failed to load committees:", (error as Error).message);
    return [];
  }
}

export default async function CommitteesPage() {
  const committees = await loadCommittees();

  return (
    <>
      <PageHeader
        title="Committees"
        intro="Every great structure needs supports. These are ours."
      />
      <div className="container-page">
        <ul className="grid gap-5 sm:grid-cols-2">
          {committees.map((committee) => (
            <li key={committee.id} className="card p-6">
              <h2 className="text-xl font-bold">{committee.name}</h2>
              {committee.description && <p className="mt-3 text-base text-muted">{committee.description}</p>}
              <h3 className="mt-5 text-sm font-bold uppercase tracking-wide text-accent-text">Members</h3>
              {committee.members.length === 0 ? (
                <p className="mt-2 text-base text-muted">No members yet.</p>
              ) : (
                <ul className="mt-2 flex flex-wrap gap-2">
                  {committee.members.map((member, i) => (
                    <li key={i} className="rounded-full border border-line bg-soft px-3 py-1 text-sm font-medium">
                      {member.name}
                      {member.is_chair && <span className="ml-1.5 font-bold text-accent-text">· chair</span>}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
          <li className="card flex flex-col justify-between border-dashed p-6">
            <div>
              <h2 className="mt-2 text-xl font-bold">Start a committee</h2>
              <p className="mt-3 text-base text-muted">Got an idea that involves tall things? Tell us and we will probably say yes.</p>
            </div>
            <Link href="/contact" className="btn btn-secondary mt-5 self-start">
              Pitch it to us
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}
