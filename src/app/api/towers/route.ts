import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("towers")
    .select("*")
    .order("vote_count", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, description, submitter_name, image_url } = body;

  if (!title?.trim() || !submitter_name?.trim() || !image_url?.trim()) {
    return NextResponse.json(
      { error: "title, submitter_name and image_url are required" },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("towers")
    .insert({ title: title.trim(), description: description?.trim() || null, submitter_name: submitter_name.trim(), image_url })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
