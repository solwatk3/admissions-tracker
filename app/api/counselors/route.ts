import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("counselors")
    .select("*, schools(name, county)")
    .order("name");

  if (error) return NextResponse.json([], { status: 500 });

  const flat = (data as any[]).map((c) => ({
    ...c,
    school_name: c.schools?.name || null,
    school_county: c.schools?.county || null,
    schools: undefined,
  }));

  return NextResponse.json(flat);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const { data, error } = await supabase
    .from("counselors")
    .insert({
      school_id: body.school_id || null,
      name: body.name.trim(),
      title: body.title || null,
      email: body.email || null,
      phone: body.phone || null,
      notes: body.notes || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
