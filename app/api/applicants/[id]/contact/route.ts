import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();

  const { data, error } = await supabase
    .from("contact_log")
    .insert({ applicant_id: params.id, entry: body.entry })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Also bump last_contact / next_followup on the applicant if provided.
  if (body.last_contact || body.next_followup) {
    await supabase
      .from("applicants")
      .update({
        ...(body.last_contact ? { last_contact: body.last_contact } : {}),
        ...(body.next_followup !== undefined ? { next_followup: body.next_followup || null } : {}),
      })
      .eq("id", params.id);
  }

  return NextResponse.json(data);
}
