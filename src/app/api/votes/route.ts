import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import sql from "@/lib/db";
import { createRateLimiter } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";
import { getSession } from "@/lib/session";
import { accountVoterId, claimBrowserVotes } from "@/lib/voter-account";

const readLimiter = createRateLimiter(120, 60 * 1000);

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!readLimiter.allow(clientIp(req))) return NextResponse.json({ error: "Slow down a little." }, { status: 429 });

  const browserId = z.string().uuid().safeParse(req.nextUrl.searchParams.get("voter_id"));
  const session = await getSession();

  let voter_id: string;
  if (session) {
    // Votes cast before signing in become the account's, so nothing is lost on the way.
    if (browserId.success) await claimBrowserVotes(session.user.id, browserId.data);
    voter_id = accountVoterId(session.user.id);
  } else if (browserId.success) {
    voter_id = browserId.data;
  } else {
    return NextResponse.json({ tower_votes: [] });
  }

  const votes = await sql`
    SELECT tower_id, direction FROM votes WHERE voter_id = ${voter_id}
  `;

  return NextResponse.json(
    { tower_votes: votes.map((v) => ({ tower_id: v.tower_id, direction: v.direction ?? "up" })) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
