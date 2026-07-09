import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Single shared client used by both server components and API routes.
// This app has no per-user auth (it's gated by one shared password), so
// we always use the public anon key + Supabase's row-level security off,
// or permissive policies. See README for setup notes.
export const supabase = createClient(url, key, {
  auth: { persistSession: false },
});

export type Stage = "inquiry" | "application" | "outreach" | "decision" | "enrolled";

export type Applicant = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  program: string | null;
  school: string | null;
  class_year: number | null;
  stage: Stage;
  stage_date: string;
  last_contact: string | null;
  next_followup: string | null;
  decision: "pending" | "accepted" | "denied" | "waitlisted" | null;
  notes: string | null;
  created_at: string;
};

export type School = {
  id: string;
  name: string;
  county: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  notes: string | null;
  created_at: string;
};

export type Counselor = {
  id: string;
  school_id: string | null;
  school_name?: string | null;
  school_county?: string | null;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
};

export type ContactLogEntry = {
  id: string;
  applicant_id: string;
  entry: string;
  created_at: string;
};

export type Template = {
  id: string;
  stage: Stage;
  category: string | null;
  title: string;
  body: string;
  created_at: string;
};

export const STAGES: { value: Stage; label: string }[] = [
  { value: "inquiry", label: "Inquiry" },
  { value: "application", label: "Application" },
  { value: "outreach", label: "Outreach" },
  { value: "decision", label: "Decision" },
  { value: "enrolled", label: "Enrolled" },
];
