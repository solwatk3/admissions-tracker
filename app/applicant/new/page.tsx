"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { STAGES } from "@/lib/supabase";
import { todayStr } from "@/lib/dates";

const LAST_SCHOOL_KEY = "admissions_last_school";

export default function NewApplicantPage() {
  const router = useRouter();
  const [schools, setSchools] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    program: "",
    school: "",
    stage: "inquiry",
    stage_date: todayStr(),
    next_followup: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Pre-fill school from last session (fair mode)
    const last = localStorage.getItem(LAST_SCHOOL_KEY);
    if (last) setForm((f) => ({ ...f, school: last }));
    // Load school list for autocomplete
    fetch("/api/schools").then((r) => r.json()).then(setSchools);
  }, []);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    // Remember school for next entry
    if (form.school.trim()) localStorage.setItem(LAST_SCHOOL_KEY, form.school.trim());
    const res = await fetch("/api/applicants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (data.id) router.push(`/applicant/${data.id}`);
  }

  return (
    <div>
      <Link href="/tracker" className="back-link">&larr; Back to tracker</Link>
      <h1 className="page-title">Add applicant</h1>
      <p className="page-sub">Log a new inquiry or applicant into the pipeline.</p>

      <form className="card form-card" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Name *</label>
          <input value={form.name} onChange={(e) => set("name", e.target.value)} autoFocus required />
        </div>

        <div className="form-row">
          <label>School</label>
          <input
            list="school-list"
            value={form.school}
            onChange={(e) => set("school", e.target.value)}
            placeholder="Type or pick a school"
            autoComplete="off"
          />
          <datalist id="school-list">
            {schools.map((s) => <option key={s} value={s} />)}
          </datalist>
          {form.school && (
            <p className="field-hint">This school will be pre-filled next time you add an applicant.</p>
          )}
        </div>

        <div className="form-row">
          <label>Program / interest</label>
          <input value={form.program} onChange={(e) => set("program", e.target.value)} />
        </div>

        <div className="form-grid">
          <div className="form-row">
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </div>
          <div className="form-row">
            <label>Phone</label>
            <input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
        </div>

        <div className="form-grid">
          <div className="form-row">
            <label>Stage</label>
            <select value={form.stage} onChange={(e) => set("stage", e.target.value)}>
              {STAGES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label>Stage date</label>
            <input type="date" value={form.stage_date} onChange={(e) => set("stage_date", e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <label>Next follow-up date</label>
          <input type="date" value={form.next_followup} onChange={(e) => set("next_followup", e.target.value)} />
        </div>

        <div className="form-row">
          <label>Notes</label>
          <textarea rows={4} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </div>

        <button className="btn btn-primary btn-full" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Add applicant"}
        </button>
      </form>
    </div>
  );
}
