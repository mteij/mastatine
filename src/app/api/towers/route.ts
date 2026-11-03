import { NextRequest, NextResponse } from "next/server";
import { Filter } from "bad-words";
import { stat } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import sql from "@/lib/db";
import { MAX_PAGE_SIZE, PAGE_SIZE, listTowers, parseQuery, parseSort } from "@/lib/towers";
import { UPLOAD_DIR } from "@/lib/uploads";
import { createRateLimiter } from "@/lib/rate-limit";
import { clientIp, isSameOrigin } from "@/lib/request";

const submitLimiter = createRateLimiter(5, 60 * 60 * 1000);
const dailySubmitLimiter = createRateLimiter(10, 24 * 60 * 60 * 1000);
// Last line of defence against a flood from many addresses: submissions are public the moment they are stored.
const globalSubmitLimiter = createRateLimiter(100, 24 * 60 * 60 * 1000);
const listLimiter = createRateLimiter(120, 60 * 1000);
const MAX_OFFSET = 5000;

export async function GET(req: NextRequest) {
  if (!listLimiter.allow(clientIp(req))) return NextResponse.json({ error: "Slow down a little." }, { status: 429 });
  const params = req.nextUrl.searchParams;
  const limit = Math.min(Math.max(Number(params.get("limit")) || PAGE_SIZE, 1), MAX_PAGE_SIZE);
  const offset = Math.min(Math.max(Number(params.get("offset")) || 0, 0), MAX_OFFSET);

  const page = await listTowers({
    sort: parseSort(params.get("sort")),
    q: parseQuery(params.get("q")),
    offset,
    limit,
  });
  return NextResponse.json(page);
}

const submissionSchema = z.object({
  title: z.string().trim().min(1).max(120),
  submitter_name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(1000).nullish(),
  image_url: z.string().regex(/^\/uploads\/[a-z0-9-]+\.(jpg|png|webp|gif)$/),
  height: z.number().finite().min(0).max(2000).nullish(),
  website: z.string().optional(), // honeypot
});

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const ip = clientIp(req);
  if (!submitLimiter.allow(ip) || !dailySubmitLimiter.allow(ip) || !globalSubmitLimiter.allow("all")) {
    return NextResponse.json({ error: "Too many submissions. Please try again later." }, { status: 429 });
  }

  const parsed = submissionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please fill in your name, the mast's name and add a photo." }, { status: 400 });
  }
  const { title, submitter_name, description, image_url, height, website } = parsed.data;
  if (website) return NextResponse.json({ ok: true }, { status: 201 }); // honeypot: pretend it worked

  // The photo must be one we stored ourselves, not just a well-formed path.
  const stored = await stat(path.join(UPLOAD_DIR, image_url.slice("/uploads/".length))).catch(() => null);
  if (!stored?.isFile()) return NextResponse.json({ error: "Please upload the photo again." }, { status: 400 });

  const filter = new Filter();
  const [tower] = await sql`
    INSERT INTO towers (title, description, submitter_name, image_url, height)
    VALUES (
      ${filter.clean(title)},
      ${description ? filter.clean(description) : null},
      ${filter.clean(submitter_name)},
      ${image_url},
      ${height ?? null}
    )
    RETURNING *
  `;
  return NextResponse.json(tower, { status: 201 });
}
