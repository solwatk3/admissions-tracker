"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Applicant, ContactLogEntry, STAGES } from "@/lib/supabase";
import { formatDate, todayStr } from "@/lib/dates";


export default function ApplicantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [log, setLog] = useState<ContactLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newEntry, setNewEntry] = useState("");
  const [newFollowup, setNewFollowup] = useState("");
  const [schools, setSchools] = useState<string[]>([]);

  useEffect(() => {
    load();
    fetch("/api/schools").then((r) => r.json()).then((data) =>
      setSchools(data.map((s: any) => s.name || s))
    );
  }, [id]);

  function load() {
    setLoading(true);
    fetch(`/api/applicants/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setApplicant(data.applicant);
        setLog(data.log || []);
        setNewFollowup(data.applicant?.next_followup || "");
        setLoading(false);
      });
  }

  async function updateField(field: string, value: string) {
    if (!applicant) return;
    const updated = { ...applicant, [field]: value };
    setApplicant(updated);
    setSaving(true);
    await fetch(`/api/applicants/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value || null }),
    });
    setSaving(false);
  }

  async function logContact(e: React.FormEvent) {
    e.preventDefault();
    if (!newEntry.trim()) return;
    setSaving(true);
    await fetch(`/api/applicants/${id}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entry: newEntry,
        last_contact: todayStr(),
        next_followup: newFollowup || null,
      }),
    });
    setNewEntry("");
    setSaving(false);
    load();
  }

  async function handleDelete() {
    if (!confirm(`Delete ${applicant?.name}? This can't be undone.`)) return;
    await fetch(`/api/applicants/${id}`, { method: "DELETE" });
    router.push("/tracker");
  }

  if (loading) return <p style={{ color: "var(--text-dim)" }}>Loading...</p>;
  if (!applicant) return <p>Applicant not found.</p>;

  return (
    <div>
      <Link href="/tracker" className="back-link">&larr; Back to tracker</Link>

      <div className="detail-header">
        <div>
          <h1 className="page-title">{applicant.name}</h1>
          <p className="page-sub">
            <span className={`badge badge-${applicant.stage}`}>{applicant.stage}</span>
            {applicant.program ? ` · ${applicant.program}` : ""}
          </p>
        </div>
        <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Details</h3>
          <div className="form-row">
            <label>Name</label>
            <input defaultValue={applicant.name} onBlur={(e) => updateField("name", e.target.value)} />
          </div>
          <div className="form-grid">
            <div className="form-row">
              <label>Email</label>
              <input defaultValue={applicant.email || ""} onBlur={(e) => updateField("email", e.target.value)} />
            </div>
            <div className="form-row">
              <label>Phone</label>
              <input defaultValue={applicant.phone || ""} onBlur={(e) => updateField("phone", e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <label>School</label>
            <input
              list="school-list-detail"
              defaultValue={applicant.school || ""}
              onBlur={(e) => updateField("school", e.target.value)}
              placeholder="Type or pick a school"
              autoComplete="off"
            />
            <datalist id="school-list-detail">
              {schools.map((s) => <option key={s} value={s} />)}
            </datalist>
          </div>
          <div className="form-grid">
            <div className="form-row">
              <label>Program</label>
              <input defaultValue={applicant.program || ""} onBlur={(e) => updateField("program", e.target.value)} />
            </div>
            <div className="form-row">
              <label>Class year</label>
              <select defaultValue={applicant.class_year || ""} onChange={(e) => updateField("class_year", e.target.value)}>
                <option value="">— Select year —</option>
                {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() + i - 1).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-grid">
            <div className="form-row">
              <label>Stage</label>
              <select value={applicant.stage} onChange={(e) => updateField("stage", e.target.value)}>
                {STAGES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label>Decision</label>
              <select value={applicant.decision || ""} onChange={(e) => updateField("decision", e.target.value)}>
                <option value="">-</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="denied">Denied</option>
                <option value="waitlisted">Waitlisted</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <label>Next follow-up date</label>
            <input
              type="date"
              defaultValue={applicant.next_followup || ""}
              onBlur={(e) => updateField("next_followup", e.target.value)}
            />
          </div>
          <div className="form-row">
            <label>Notes</label>
            <textarea rows={5} defaultValue={applicant.notes || ""} onBlur={(e) => updateField("notes", e.target.value)} />
          </div>
          {saving && <p style={{ fontSize: 12, color: "var(--text-dim)" }}>Saving...</p>}
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Contact log</h3>
          <form onSubmit={logContact} style={{ marginBottom: 20 }}>
            <div className="form-row">
              <label>Log a new contact / update</label>
              <textarea
                rows={3}
                placeholder="e.g. Called to check in on essay, will resend transcript by Friday"
                value={newEntry}
                onChange={(e) => setNewEntry(e.target.value)}
              />
            </div>
            <div className="form-row">
              <label>Next follow-up (updates the date above too)</label>
              <input type="date" value={newFollowup} onChange={(e) => setNewFollowup(e.target.value)} />
            </div>
            <button className="btn btn-primary" type="submit">Log contact</button>
          </form>

          {log.length === 0 ? (
            <p style={{ color: "var(--text-dim)", fontSize: 14 }}>No contact logged yet.</p>
          ) : (
            <div className="contact-log">
              {log.map((entry) => (
                <div className="contact-entry" key={entry.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div className="date">{formatDate(entry.created_at.slice(0, 10))}</div>
                    <button
                      className="btn-x"
                      title="Delete entry"
                      onClick={async () => {
                        if (!confirm("Delete this contact log entry?")) return;
                        await fetch(`/api/contact-log/${entry.id}`, { method: "DELETE" });
                        load();
                      }}
                    >✕</button>
                  </div>
                  <div>{entry.entry}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
