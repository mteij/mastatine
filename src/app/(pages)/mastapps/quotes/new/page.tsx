import type { Metadata } from "next";
import AppFrame from "@/components/ui/AppFrame";
import QuoteForm from "../QuoteForm";

export const metadata: Metadata = { title: "New quote", robots: { index: false } };
export const dynamic = "force-dynamic";

export default function NewQuotePage() {
  return (
    <AppFrame title="New quote" tagline="Something worth remembering, or worth regretting.">
      <QuoteForm today={new Date().toISOString().slice(0, 10)} />
    </AppFrame>
  );
}
