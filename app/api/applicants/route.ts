import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("applicants")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { data, error } = await supabase
    .from("applicants")
    .insert({
      name: body.name,
      email: body.email || null,
      phone: body.phone || null,
      program: body.program || null,
      school: body.school || null,
      stage: body.stage || "inquiry",
      stage_date: body.stage_date || new Date().toISOString().slice(0, 10),
      next_followup: body.next_followup || null,
      notes: body.notes || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
