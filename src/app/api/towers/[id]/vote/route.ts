import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import sql from "@/lib/db";
import { createRateLimiter } from "@/lib/rate-limit";
import { clientIp, isSameOrigin } from "@/lib/request";
import { getSession } from "@/lib/session";
import { accountVoterId } from "@/lib/voter-account";

// Generous enough for a household behind one IP, tight enough to blunt scripted vote stuffing.
const voteLimiter = createRateLimiter(90, 60 * 1000);
// Votes carry no account, so the address is the only identity: cap what one address can change per day, however many voter ids it invents.
const dailyVoteLimiter = createRateLimiter(300, 24 * 60 * 60 * 1000);
const voterLimiter = createRateLimiter(60, 60 * 1000);

const bodySchema = z.object({
  voter_id: z.string().uuid(),
  direction: z.enum(["up", "down"]).default("up"),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!voteLimiter.allow(clientIp(req))) {
    return NextResponse.json({ error: "Slow down a little." }, { status: 429 });
  }

  const ip = clientIp(req);
  if (!dailyVoteLimiter.allow(ip)) {
    return NextResponse.json({ error: "Daily vote limit reached. Try again tomorrow." }, { status: 429 });
  }

  const { id } = await params;
  const parsedId = z.string().uuid().safeParse(id);
  const body = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsedId.success || !body.success) {
    return NextResponse.json({ error: "Invalid vote" }, { status: 400 });
  }
  // Signed-in people vote as their account, so their votes follow them to every device; everyone else votes as their browser.
  const session = await getSession();
  const voter_id = session ? accountVoterId(session.user.id) : body.data.voter_id;
  const { direction } = body.data;
  if (!voterLimiter.allow(voter_id)) return NextResponse.json({ error: "Slow down a little." }, { status: 429 });

  // One transaction, so a crash or double-click cannot leave vote_count out of step with the votes table.
  const result = await sql.begin(async (tx) => {
    const [tower] = await tx`SELECT id FROM towers WHERE id = ${id} FOR UPDATE`;
    if (!tower) return null;

    const [existing] = await tx<{ id: string; direction: string }[]>`
      SELECT id, direction FROM votes WHERE tower_id = ${id} AND voter_id = ${voter_id}
    `;

    if (!existing) {
      await tx`INSERT INTO votes (tower_id, voter_id, direction) VALUES (${id}, ${voter_id}, ${direction})`;
      await tx`UPDATE towers SET vote_count = vote_count + ${direction === "up" ? 1 : -1} WHERE id = ${id}`;
      return { success: true, action: "voted", direction };
    }
    if (existing.direction === direction) {
      await tx`DELETE FROM votes WHERE id = ${existing.id}`;
      await tx`UPDATE towers SET vote_count = vote_count + ${direction === "up" ? -1 : 1} WHERE id = ${id}`;
      return { success: true, action: "unvoted" };
    }
    await tx`UPDATE votes SET direction = ${direction} WHERE id = ${existing.id}`;
    await tx`UPDATE towers SET vote_count = vote_count + ${direction === "up" ? 2 : -2} WHERE id = ${id}`;
    return { success: true, action: "changed", direction };
  });

  if (!result) return NextResponse.json({ error: "Mast not found" }, { status: 404 });
  return NextResponse.json(result);
}
