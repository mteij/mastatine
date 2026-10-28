import type { Metadata } from "next";
import AppFrame from "@/components/ui/AppFrame";
import { membersOnlyGate } from "@/components/MembersOnly";
import QuoteForm from "../QuoteForm";

export const metadata: Metadata = { title: "New quote", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function NewQuotePage() {
  const gate = await membersOnlyGate("New quote", "/mastapps/quotes/new");
  if (gate) return gate;
  return (
    <AppFrame title="New quote" tagline="Something worth remembering, or worth regretting.">
      <QuoteForm today={new Date().toISOString().slice(0, 10)} />
    </AppFrame>
  );
}
