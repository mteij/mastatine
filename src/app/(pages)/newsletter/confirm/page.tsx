import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { confirmSubscription } from "@/lib/newsletter";

export const metadata: Metadata = { title: "Confirm subscription", robots: { index: false } };
export const dynamic = "force-dynamic";

// Confirming is a POST behind a button: email security scanners open links automatically,
// and they must not be able to subscribe someone on their behalf.
async function confirm(formData: FormData) {
  "use server";
  const ok = await confirmSubscription(String(formData.get("token") ?? ""));
  redirect(`/newsletter/confirm?status=${ok ? "done" : "invalid"}`);
}

export default async function ConfirmPage(props: { searchParams: Promise<{ token?: string; status?: string }> }) {
  const { token, status } = await props.searchParams;

  if (status === "done") {
    return (
      <>
        <PageHeader title="You are subscribed" intro="Thank you. The next issue will land in your inbox. Every email has a one-click unsubscribe link." />
        <div className="container-prose">
          <Link href="/" className="btn btn-primary">Back to the masts</Link>
        </div>
      </>
    );
  }

  if (status === "invalid" || !token) {
    return (
      <>
        <PageHeader title="This link did not work" intro="It may have expired or already been used. Request a new confirmation link and try again." />
        <div className="container-prose">
          <Link href="/newsletter" className="btn btn-primary">Subscribe again</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Confirm your subscription" intro="One last click to start receiving the S.A. Mastatine newsletter, about four times a year." />
      <div className="container-prose">
        <form action={confirm}>
          <input type="hidden" name="token" value={token} />
          <button type="submit" className="btn btn-primary px-6 py-3 text-base">Yes, subscribe me</button>
        </form>
        <p className="mt-4 text-sm text-muted">Did not ask for this? Close this page and nothing happens.</p>
      </div>
    </>
  );
}
