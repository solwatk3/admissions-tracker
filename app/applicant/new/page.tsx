"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { STAGES } from "@/lib/supabase";
import { todayStr } from "@/lib/dates";

const currentYear = new Date().getFullYear();
const CLASS_YEARS = Array.from({ length: 6 }, (_, i) => currentYear + i - 1);

const blank = () => ({
  name: "",
  email: "",
  phone: "",
  program: "",
  school: "",
  class_year: "",
  stage: "inquiry",
  stage_date: todayStr(),
  next_followup: "",
  notes: "",
});

export default function NewApplicantPage() {
  const router = useRouter();
  const [schools, setSchools] = useState<string[]>([]);
  const [form, setForm] = useState(blank());
  const [addingSchool, setAddingSchool] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSchools();
  }, []);

  function loadSchools() {
    return fetch("/api/schools").then((r) => r.json()).then(setSchools);
  }

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSchoolSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    if (val === "__add__") {
      setAddingSchool(true);
    } else {
      set("school", val);
    }
  }

  async function saveNewSchool() {
    if (!newSchoolName.trim()) return;
    await fetch("/api/schools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newSchoolName.trim() }),
    });
    await loadSchools();
    set("school", newSchoolName.trim());
    setNewSchoolName("");
    setAddingSchool(false);
  }

  async function submit(andAnother: boolean) {
    if (!form.name.trim()) return;
    setSaving(true);
    const res = await fetch("/api/applicants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!data.id) return;

    if (andAnother) {
      // Keep school, reset everything else
      const school = form.school;
      setForm({ ...blank(), school });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      router.push(`/applicant/${data.id}`);
    }
  }

  return (
    <div>
      <Link href="/tracker" className="back-link">&larr; Back to tracker</Link>
      <h1 className="page-title">Add applicant</h1>
      <p className="page-sub">Log a new inquiry or applicant into the pipeline.</p>

      {saved && (
        <div className="save-toast">✓ Applicant saved — form ready for next entry</div>
      )}

      <div className="card form-card">
        <div className="form-row">
          <label>School</label>
          {addingSchool ? (
            <div style={{ display: "flex", gap: 8 }}>
              <input
                autoFocus
                placeholder="School name"
                value={newSchoolName}
                onChange={(e) => setNewSchoolName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), saveNewSchool())}
              />
              <button type="button" className="btn btn-primary" onClick={saveNewSchool} style={{ whiteSpace: "nowrap" }}>Save</button>
              <button type="button" className="btn" onClick={() => setAddingSchool(false)}>Cancel</button>
            </div>
          ) : (
            <select value={form.school} onChange={handleSchoolSelect}>
              <option value="">— Select a school —</option>
              {schools.map((s) => <option key={s} value={s}>{s}</option>)}
              <option value="__add__">+ Add new school</option>
            </select>
          )}
        </div>

        <div className="form-row">
          <label>Name *</label>
          <input value={form.name} onChange={(e) => set("name", e.target.value)} required />
        </div>

        <div className="form-grid">
          <div className="form-row">
            <label>Program / interest</label>
            <input value={form.program} onChange={(e) => set("program", e.target.value)} />
          </div>
          <div className="form-row">
            <label>Class year</label>
            <select value={form.class_year} onChange={(e) => set("class_year", e.target.value)}>
              <option value="">— Select year —</option>
              {CLASS_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
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
          <textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </div>

        <div className="form-actions">
          <button className="btn btn-primary btn-full" onClick={() => submit(false)} disabled={saving}>
            {saving ? "Saving..." : "Save & open"}
          </button>
          <button className="btn btn-full" onClick={() => submit(true)} disabled={saving}>
            {saving ? "Saving..." : "Save & add another"}
          </button>
        </div>
      </div>
    </div>
  );
}
