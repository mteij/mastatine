"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function AccountPanel({ initialName }: { initialName: string }) {
  const id = useId();
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function saveName(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaved(false);
    const { error: updateError } = await authClient.updateUser({ name: name.trim() });
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
          <input id={`${id}-name`} className="input min-w-0 flex-1" value={name} maxLength={80} onChange={(e) => { setName(e.target.value); setSaved(false); }} />
          <button type="submit" className="btn btn-primary" disabled={!name.trim() || name.trim() === initialName}>Save</button>
        </div>
        {saved && <p role="status" className="mt-2 text-sm text-success">Saved</p>}
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
