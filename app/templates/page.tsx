"use client";

import { useEffect, useState } from "react";
import { STAGES, Template } from "@/lib/supabase";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ title: "", body: "" });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newTpl, setNewTpl] = useState({ stage: "inquiry", title: "", body: "" });

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    fetch("/api/templates")
      .then((r) => r.json())
      .then((data) => {
        setTemplates(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }

  function startEdit(t: Template) {
    setEditingId(t.id);
    setDraft({ title: t.title, body: t.body });
  }

  async function saveEdit(id: string) {
    await fetch(`/api/templates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    setEditingId(null);
    load();
  }

  async function deleteTemplate(id: string) {
    if (!confirm("Delete this template?")) return;
    await fetch(`/api/templates/${id}`, { method: "DELETE" });
    load();
  }

  async function copy(t: Template) {
    await navigator.clipboard.writeText(t.body);
    setCopiedId(t.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  async function createTemplate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTpl.title.trim() || !newTpl.body.trim()) return;
    await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTpl),
    });
    setNewTpl({ stage: "inquiry", title: "", body: "" });
    setShowNew(false);
    load();
  }

  return (
    <div>
      <div className="detail-header">
        <div>
          <h1 className="page-title">Message Templates</h1>
          <p className="page-sub">Reusable outreach copy for each stage. Click Copy, then paste into your email.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNew((s) => !s)}>
          {showNew ? "Cancel" : "+ New template"}
        </button>
      </div>

      {showNew && (
        <form className="card" onSubmit={createTemplate} style={{ marginBottom: 24 }}>
          <div className="form-grid">
            <div className="form-row">
              <label>Stage</label>
              <select value={newTpl.stage} onChange={(e) => setNewTpl({ ...newTpl, stage: e.target.value })}>
                {STAGES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label>Title</label>
              <input value={newTpl.title} onChange={(e) => setNewTpl({ ...newTpl, title: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <label>Body</label>
            <textarea rows={6} value={newTpl.body} onChange={(e) => setNewTpl({ ...newTpl, body: e.target.value })} />
          </div>
          <button className="btn btn-primary" type="submit">Save template</button>
        </form>
      )}

      {loading ? (
        <p style={{ color: "var(--text-dim)" }}>Loading...</p>
      ) : (
        STAGES.map((stage) => {
          const stageTemplates = templates.filter((t) => t.stage === stage.value);
          if (stageTemplates.length === 0) return null;
          return (
            <div key={stage.value} style={{ marginBottom: 28 }}>
              <h3 style={{ marginBottom: 10 }}>
                <span className={`badge badge-${stage.value}`}>{stage.label}</span>
              </h3>
              {stageTemplates.map((t) => (
                <div className="template-card" key={t.id}>
                  {editingId === t.id ? (
                    <>
                      <div className="form-row">
                        <label>Title</label>
                        <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
                      </div>
                      <div className="form-row">
                        <label>Body</label>
                        <textarea rows={6} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
                      </div>
                      <button className="btn btn-primary" onClick={() => saveEdit(t.id)}>Save</button>{" "}
                      <button className="btn" onClick={() => setEditingId(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <h3>{t.title}</h3>
                      <pre>{t.body}</pre>
                      <button className="btn" onClick={() => copy(t)}>{copiedId === t.id ? "Copied!" : "Copy"}</button>{" "}
                      <button className="btn" onClick={() => startEdit(t)}>Edit</button>{" "}
                      <button className="btn btn-danger" onClick={() => deleteTemplate(t.id)}>Delete</button>
                    </>
                  )}
                </div>
              ))}
            </div>
          );
        })
      )}
    </div>
  );
}
