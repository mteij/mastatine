import { NextRequest, NextResponse } from "next/server";
import { getShopUrl } from "@/lib/shop";

// The shop has no page of its own: old links to /shop go straight to the external shop (or home when none is set).
export const dynamic = "force-dynamic";

export function GET(req: NextRequest) {
  return NextResponse.redirect(getShopUrl() ?? new URL("/", req.url), 307);
}
