import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { unsubscribeSubscriber, verifyUnsubscribeToken } from "@/lib/newsletter";

export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false } };
export const dynamic = "force-dynamic";

async function unsubscribe(formData: FormData) {
  "use server";
  const id = verifyUnsubscribeToken(String(formData.get("token") ?? ""));
  if (id) await unsubscribeSubscriber(id);
  redirect(`/newsletter/unsubscribe?status=${id ? "done" : "invalid"}`);
}

export default async function UnsubscribePage(props: { searchParams: Promise<{ t?: string; status?: string }> }) {
  const { t, status } = await props.searchParams;

  if (status === "done") {
    return (
      <>
        <PageHeader title="You are unsubscribed" intro="We will not email you again. Sorry to see you go; the masts will still be here." />
        <div className="container-prose">
          <Link href="/" className="btn btn-primary">Back to the masts</Link>
        </div>
      </>
    );
  }

  if (status === "invalid" || !t || !verifyUnsubscribeToken(t)) {
    return (
      <>
        <PageHeader title="This link is not valid" intro="If you keep receiving emails you do not want, contact us and we will remove you right away." />
        <div className="container-prose">
          <Link href="/contact" className="btn btn-primary">Contact us</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Unsubscribe" intro="Press the button to stop receiving the S.A. Mastatine newsletter." />
      <div className="container-prose">
        <form action={unsubscribe}>
          <input type="hidden" name="token" value={t} />
          <button type="submit" className="btn btn-primary px-6 py-3 text-base">Unsubscribe me</button>
        </form>
      </div>
    </>
  );
}
