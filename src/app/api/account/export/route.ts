import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

/** GDPR art. 15/20: everything we can link to the signed-in account, as a JSON download. */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in to export your data." }, { status: 401 });

  const { user } = session;
  const email = user.email.toLowerCase();

  const [account, sessions, newsletter, quotes, quoteVotes] = await Promise.all([
    sql`SELECT id, name, email, "emailVerified", role, "createdAt", "updatedAt" FROM "user" WHERE id = ${user.id}`,
    sql`SELECT "createdAt", "expiresAt", "ipAddress", "userAgent" FROM session WHERE "userId" = ${user.id} ORDER BY "createdAt" DESC`,
    sql`SELECT email, status, created_at, confirmed_at, unsubscribed_at FROM newsletter_subscribers WHERE lower(email) = ${email}`,
    sql`SELECT body, author, said_on, created_at FROM quotes WHERE created_by = ${user.id} ORDER BY created_at DESC`,
    sql`SELECT quote_id, score, created_at FROM quote_votes WHERE user_id = ${user.id} ORDER BY created_at DESC`,
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    note: "Masts you submitted and mast votes are not linked to your account, so they cannot appear here. Contact us if you want a mast removed.",
    account: account[0] ?? null,
    sessions,
    newsletterSubscription: newsletter[0] ?? null,
    quotesYouAdded: quotes,
    quoteRatings: quoteVotes,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="mastatine-my-data.json"',
      "Cache-Control": "no-store",
    },
  });
}
