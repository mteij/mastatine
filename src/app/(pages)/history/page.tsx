import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import { HISTORY } from "@/content/site";

export const metadata: Metadata = {
  title: "History",
  description: "A short and slightly embellished history of S.A. Mastatine.",
};

export default function HistoryPage() {
  return (
    <>
      <PageHeader
        title="History"
        intro="A short, slightly embellished account of how we got here. Historians are welcome to correct us."
      />
      <div className="container-prose">
        <ol className="relative space-y-10 border-l border-line pl-8">
          {HISTORY.map((m) => (
            <li key={m.year} className="relative">
              <span className="absolute -left-[2.45rem] top-1.5 size-3 rounded-full bg-accent ring-4 ring-bg" aria-hidden />
              <p className="text-lg font-bold text-accent-text">{m.year}</p>
              <h2 className="mt-1 text-xl font-bold">{m.title}</h2>
              <p className="mt-2 text-muted">{m.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
