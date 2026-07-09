import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("applicants")
    .select("school")
    .not("school", "is", null)
    .neq("school", "");

  if (error) return NextResponse.json([], { status: 500 });

  const schools = [...new Set((data as { school: string }[]).map((r) => r.school))]
    .filter(Boolean)
    .sort();
  return NextResponse.json(schools);
}
