import { NextResponse } from "next/server";
import { unsubscribeSubscriber, verifyUnsubscribeToken } from "@/lib/newsletter";

/**
 * RFC 8058 one-click unsubscribe: mail clients POST here (no body needed) when the user presses
 * "Unsubscribe" in their inbox. The signed token in the URL is the only credential.
 * GET is intentionally not supported, so link scanners that prefetch URLs cannot unsubscribe anyone.
 */
export async function POST(req: Request) {
  const token = new URL(req.url).searchParams.get("t") ?? "";
  const subscriberId = verifyUnsubscribeToken(token);
  if (!subscriberId) return NextResponse.json({ error: "Invalid link" }, { status: 400 });

  await unsubscribeSubscriber(subscriberId);
  return NextResponse.json({ message: "You have been unsubscribed." });
}
