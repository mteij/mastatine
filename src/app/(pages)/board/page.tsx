import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import { BOARD } from "@/content/site";

export const metadata: Metadata = {
  title: "The Board",
  description: "The parody board of S.A. Mastatine: six roles, zero names.",
};

export default function BoardPage() {
  return (
    <>
      <PageHeader
        title="The Board"
        intro="Six roles keep this operation vertical. The board prefers to stay anonymous, and un-sued."
      />
      <div className="container-page">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BOARD.map((role) => (
            <li key={role.title} className="card flex flex-col p-6">
              <h2 className="text-xl font-extrabold">{role.title}</h2>
              <p className="mt-1 text-base font-bold text-accent-text">{role.motto}</p>
              <p className="mt-4 text-base text-muted">{role.duties}</p>
            </li>
          ))}
        </ul>
        <p className="mt-10 text-base text-muted">
          Want to help run a parody association?{" "}
          <Link href="/contact" className="font-semibold text-accent-text underline underline-offset-2">
            Get in touch
          </Link>
          .
        </p>
      </div>
    </>
  );
}
