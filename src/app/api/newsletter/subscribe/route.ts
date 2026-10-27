import { NextResponse } from "next/server";
import { z } from "zod";
import { requestSubscription } from "@/lib/newsletter";
import { createRateLimiter } from "@/lib/rate-limit";
import { clientIp, isSameOrigin } from "@/lib/request";

const limiter = createRateLimiter(5, 60 * 60 * 1000);

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  website: z.string().optional(),
});

// Identical for new, known and already-confirmed addresses, so the endpoint cannot be used to probe who subscribes.
const NEUTRAL_MESSAGE = "Almost done: if that address is valid, we have sent a confirmation link to it. Open it to start receiving the newsletter.";

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!limiter.allow(clientIp(req))) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  // Honeypot: bots fill the hidden field. Pretend it worked.
  if (parsed.data.website) return NextResponse.json({ message: NEUTRAL_MESSAGE });

  try {
    await requestSubscription(parsed.data.email);
  } catch (error) {
    console.error("Newsletter subscription failed:", (error as Error).message);
    return NextResponse.json({ error: "We could not process that right now. Please try again later." }, { status: 500 });
  }
  return NextResponse.json({ message: NEUTRAL_MESSAGE });
}
