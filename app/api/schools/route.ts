import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("schools")
    .select("name")
    .order("name");

  if (error) return NextResponse.json([], { status: 500 });
  return NextResponse.json((data as { name: string }[]).map((r) => r.name));
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const { data, error } = await supabase
    .from("schools")
    .insert({ name: name.trim() })
    .select()
    .single();

  if (error) {
    // Already exists — not a real error
    if (error.code === "23505") return NextResponse.json({ ok: true });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
