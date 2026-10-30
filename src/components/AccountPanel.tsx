"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { NAME_MAX, validateDisplayName } from "@/lib/profile";

export default function AccountPanel({ initialName, email }: { initialName: string; email: string }) {
  const id = useId();
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);

  async function changeEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setEmailSent(false);
    const address = newEmail.trim().toLowerCase();
    if (address === email.toLowerCase()) return setError("That is already your email address.");
    setChangingEmail(true);
    const { error: changeError } = await authClient.changeEmail({ newEmail: address, callbackURL: "/account?email=changed" });
    setChangingEmail(false);
    if (changeError) {
      return setError(changeError.status === 429 ? "Too many attempts. Please try again later." : "Could not start the email change. Check the address and try again.");
    }
    setEmailSent(true);
    setNewEmail("");
  }

  async function saveName(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaved(false);
    const checked = validateDisplayName(name);
    if ("error" in checked) return setError(checked.error);
    const { error: updateError } = await authClient.updateUser({ name: checked.name });
    if (updateError) return setError("Could not save your name. Please try again.");
    setSaved(true);
    router.refresh();
  }

  async function signOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  async function deleteAccount() {
    setError("");
    const { error: deleteError } = await authClient.deleteUser();
    if (deleteError) {
      setConfirmingDelete(false);
      return setError(
        deleteError.status === 400 || deleteError.status === 403
          ? "For your security, please sign out, sign in again with a fresh link, and then delete your account."
          : "Could not delete your account. Please try again or contact us.",
      );
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={saveName} className="card p-4">
        <label htmlFor={`${id}-name`} className="label">Display name</label>
        <div className="flex gap-2">
          <input id={`${id}-name`} className="input min-w-0 flex-1" value={name} maxLength={NAME_MAX} onChange={(e) => { setName(e.target.value); setSaved(false); }} />
          <button type="submit" className="btn btn-primary" disabled={!name.trim() || name.trim() === initialName}>Save</button>
        </div>
        {saved && <p role="status" className="mt-2 text-sm text-success">Saved</p>}
      </form>

      <form onSubmit={changeEmail} className="card p-4">
        <label htmlFor={`${id}-email`} className="label">Email address</label>
        <p className="mb-2 break-all text-sm text-muted">Now: {email}</p>
        <div className="flex gap-2">
          <input
            id={`${id}-email`}
            type="email"
            className="input min-w-0 flex-1"
            placeholder="New email address"
            autoComplete="email"
            maxLength={254}
            value={newEmail}
            onChange={(e) => { setNewEmail(e.target.value); setEmailSent(false); }}
          />
          <button type="submit" className="btn btn-secondary" disabled={!newEmail.trim() || changingEmail}>{changingEmail ? "Sending…" : "Change"}</button>
        </div>
        {emailSent && (
          <p role="status" className="mt-2 text-sm text-success">
            If that address can be used, we sent it a confirmation link. Your email changes once you open it.
          </p>
        )}
      </form>

      {error && <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>}

      <div className="card flex flex-wrap gap-2 p-4">
        <button type="button" className="btn btn-secondary btn-sm" onClick={signOut}>Sign out</button>
        <a href="/api/account/export" download className="btn btn-secondary btn-sm">Download my data</a>
      </div>

      <details className="card border-danger/30 p-4">
        <summary className="cursor-pointer text-sm font-bold text-danger">Delete account</summary>
        <p className="mt-3 text-sm text-muted">
          Removes your account and your newsletter subscription. Masts you submitted stay in the gallery; ask us if you want them removed too.
        </p>
        <div className="mt-3">
          {confirmingDelete ? (
            <div className="flex flex-wrap gap-3">
              <button type="button" className="btn btn-danger btn-sm" onClick={deleteAccount}>Yes, delete my account</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmingDelete(false)}>Cancel</button>
            </div>
          ) : (
            <button type="button" className="btn btn-danger btn-sm" onClick={() => setConfirmingDelete(true)}>Delete my account</button>
          )}
        </div>
      </details>
    </div>
  );
}
