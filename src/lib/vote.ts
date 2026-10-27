import { getOrCreateVoterId } from "@/lib/voter-id";

export type VoteDirection = "up" | "down";

export interface VoteResult {
  /** Change to apply to the tower's vote_count. */
  delta: number;
  /** The voter's direction afterwards (null when the vote was withdrawn). */
  direction: VoteDirection | null;
}

/** Casts, changes or withdraws the current voter's vote. Returns null when the request failed. */
export async function submitVote(towerId: string, direction: VoteDirection): Promise<VoteResult | null> {
  const res = await fetch(`/api/towers/${towerId}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ voter_id: getOrCreateVoterId(), direction }),
  });
  if (!res.ok) return null;

  const { action } = (await res.json()) as { action: "voted" | "unvoted" | "changed" };
  const sign = direction === "up" ? 1 : -1;
  if (action === "unvoted") return { delta: -sign, direction: null };
  if (action === "changed") return { delta: 2 * sign, direction };
  return { delta: sign, direction };
}
