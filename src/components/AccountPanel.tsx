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
    <div className="space-y-8">
      <form onSubmit={saveName} className="card space-y-4 p-6">
        <h2 className="text-lg font-bold">Display name</h2>
        <div>
          <label htmlFor={`${id}-name`} className="label">Name</label>
          <input id={`${id}-name`} className="input" value={name} maxLength={80} onChange={(e) => { setName(e.target.value); setSaved(false); }} />
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" className="btn btn-primary" disabled={!name.trim() || name.trim() === initialName}>Save</button>
          {saved && <span role="status" className="text-sm text-success">Saved</span>}
        </div>
      </form>

      {error && <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>}

      <div className="card space-y-4 p-6">
        <h2 className="text-lg font-bold">Session</h2>
        <button type="button" className="btn btn-secondary" onClick={signOut}>Sign out</button>
      </div>

      <div className="card space-y-4 p-6">
        <h2 className="text-lg font-bold">Your data</h2>
        <p className="text-sm text-muted">Download everything linked to your account (profile, sessions, newsletter status, quotes and ratings) as a JSON file.</p>
        <a href="/api/account/export" download className="btn btn-secondary">Download my data</a>
      </div>

      <div className="card space-y-4 border-danger/30 p-6">
        <h2 className="text-lg font-bold">Delete account</h2>
        <p className="text-sm text-muted">
          Removes your account and your newsletter subscription. Masts you submitted stay in the gallery; ask us if you want them removed too.
        </p>
        {confirmingDelete ? (
          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn btn-danger" onClick={deleteAccount}>Yes, delete my account</button>
            <button type="button" className="btn btn-ghost" onClick={() => setConfirmingDelete(false)}>Cancel</button>
          </div>
        ) : (
          <button type="button" className="btn btn-danger" onClick={() => setConfirmingDelete(true)}>Delete my account</button>
        )}
      </div>
    </div>
  );
}
