import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const voter_id = body.voter_id?.trim();

  if (!voter_id) {
    return NextResponse.json({ error: "voter_id is required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Insert vote (unique constraint prevents double voting)
  const { error: voteError } = await supabase
    .from("votes")
    .insert({ tower_id: id, voter_id });

  if (voteError) {
    if (voteError.code === "23505") {
      // Unique constraint: already voted
      return NextResponse.json({ error: "Already voted" }, { status: 409 });
    }
    return NextResponse.json({ error: voteError.message }, { status: 500 });
  }

  // Increment vote_count on the tower
  const { error: updateError } = await supabase.rpc("increment_vote_count", {
    tower_id: id,
  });

  if (updateError) {
    // Fallback: manual increment
    const { data: tower } = await supabase
      .from("towers")
      .select("vote_count")
      .eq("id", id)
      .single();

    await supabase
      .from("towers")
      .update({ vote_count: (tower?.vote_count ?? 0) + 1 })
      .eq("id", id);
  }

  return NextResponse.json({ success: true });
}
