import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import { COMMITTEES } from "@/content/site";

export const metadata: Metadata = {
  title: "Committees",
  description: "The committees that keep S.A. Mastatine running.",
};

export default function CommitteesPage() {
  return (
    <>
      <PageHeader
        title="Committees"
        intro="Every great structure needs supports. These are ours."
      />
      <div className="container-page">
        <ul className="grid gap-5 sm:grid-cols-2">
          {COMMITTEES.map((committee) => (
            <li key={committee.name} className="card p-6">
              <p className="font-bold text-accent-text">{committee.tagline}</p>
              <h2 className="mt-2 text-xl font-bold">{committee.name}</h2>
              <p className="mt-3 text-base text-muted">{committee.description}</p>
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
