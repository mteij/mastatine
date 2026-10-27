import { NextRequest, NextResponse } from "next/server";
import { Filter } from "bad-words";
import { z } from "zod";
import sql from "@/lib/db";
import { MAX_PAGE_SIZE, PAGE_SIZE, listTowers, parseQuery, parseSort } from "@/lib/towers";
import { createRateLimiter } from "@/lib/rate-limit";
import { clientIp, isSameOrigin } from "@/lib/request";

const submitLimiter = createRateLimiter(10, 60 * 60 * 1000);

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const limit = Math.min(Math.max(Number(params.get("limit")) || PAGE_SIZE, 1), MAX_PAGE_SIZE);
  const offset = Math.min(Math.max(Number(params.get("offset")) || 0, 0), 100_000);

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
  if (!submitLimiter.allow(clientIp(req))) {
    return NextResponse.json({ error: "Too many submissions. Please try again later." }, { status: 429 });
  }

  const parsed = submissionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please fill in your name, the mast's name and add a photo." }, { status: 400 });
  }
  const { title, submitter_name, description, image_url, height, website } = parsed.data;
  if (website) return NextResponse.json({ ok: true }, { status: 201 }); // honeypot: pretend it worked

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
