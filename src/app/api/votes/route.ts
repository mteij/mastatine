import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const voter_id = req.nextUrl.searchParams.get("voter_id");

  if (!voter_id) {
    return NextResponse.json({ tower_ids: [] });
  }

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("votes")
    .select("tower_id")
    .eq("voter_id", voter_id);

  return NextResponse.json({
    tower_ids: data?.map((v) => v.tower_id) ?? [],
  });
}
