import sql from "@/lib/db";

/** The voter id stored for a signed-in account (browser voters use a random UUID, so the two cannot collide). */
export const accountVoterId = (userId: string): string => `user:${userId}`;

/**
 * Moves the votes a browser cast before signing in onto the account. A mast the account already voted on keeps the
 * account's vote; the browser's older vote on that mast stays as it was and is no longer shown.
 */
export async function claimBrowserVotes(userId: string, browserVoterId: string): Promise<void> {
  const account = accountVoterId(userId);
  await sql`
    UPDATE votes SET voter_id = ${account}
    WHERE voter_id = ${browserVoterId}
      AND tower_id NOT IN (SELECT tower_id FROM votes WHERE voter_id = ${account})
  `;
}

/** Removes an account's votes and takes them off the mast scores. Used when the account is deleted. */
export async function deleteAccountVotes(userId: string): Promise<void> {
  const removed = await sql<{ tower_id: string; direction: string }[]>`
    DELETE FROM votes WHERE voter_id = ${accountVoterId(userId)} RETURNING tower_id, direction
  `;
  for (const { tower_id, direction } of removed) {
    await sql`UPDATE towers SET vote_count = vote_count - ${direction === "down" ? -1 : 1} WHERE id = ${tower_id}`;
  }
}
