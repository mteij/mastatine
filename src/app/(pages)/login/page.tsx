import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import { safeNextPath } from "@/lib/safe-redirect";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };
export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  INVALID_TOKEN: "That sign-in link has expired or was already used. Request a new one below.",
  EXPIRED_TOKEN: "That sign-in link has expired. Request a new one below.",
};

export default async function LoginPage(props: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await props.searchParams;
  const target = safeNextPath(next, "/account");
  if (await getSession()) redirect(target);

  return (
    <div className="container-prose flex justify-center py-16 sm:py-24">
      <div className="w-full max-w-md">
        <h1 className="mt-3 text-4xl font-extrabold">Welcome back</h1>
        <p className="mt-3 text-muted">We email you a single-use link. No password to remember, or to leak.</p>
        {error && (
          <p role="alert" className="mt-6 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
            {ERRORS[error] ?? "Something went wrong signing you in. Please request a new link."}
          </p>
        )}
        <div className="card mt-8 p-6 sm:p-8">
          <LoginForm next={target} />
        </div>
      </div>
    </div>
  );
}
