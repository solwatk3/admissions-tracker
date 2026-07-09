"use client";

import { useEffect, useMemo, useState } from "react";
import { STAGES, Template } from "@/lib/supabase";

export default function SnippetsPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ title: "", body: "" });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newTpl, setNewTpl] = useState({ stage: "inquiry", title: "", body: "" });
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "grid">("list");

  useEffect(() => { load(); }, []);

  function load() {
    setLoading(true);
    fetch("/api/templates")
      .then((r) => r.json())
      .then((data) => { setTemplates(Array.isArray(data) ? data : []); setLoading(false); });
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
    if (!confirm("Delete this snippet?")) return;
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

  const filtered = useMemo(() => {
    if (!search.trim()) return templates;
    const q = search.toLowerCase();
    return templates.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.body.toLowerCase().includes(q) ||
        t.stage.toLowerCase().includes(q)
    );
  }, [templates, search]);

  return (
    <div>
      <div className="detail-header">
        <div>
          <h1 className="page-title">Snippets</h1>
          <p className="page-sub">Reusable outreach copy for each stage. Click Copy, then paste into your email.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNew((s) => !s)}>
          {showNew ? "Cancel" : "+ New snippet"}
        </button>
      </div>

      {showNew && (
        <form className="card" onSubmit={createTemplate} style={{ marginBottom: 24 }}>
          <div className="form-grid">
            <div className="form-row">
              <label>Stage</label>
              <select value={newTpl.stage} onChange={(e) => setNewTpl({ ...newTpl, stage: e.target.value })}>
                {STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
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
          <button className="btn btn-primary" type="submit">Save snippet</button>
        </form>
      )}

      {/* Toolbar */}
      <div className="toolbar" style={{ marginBottom: 20 }}>
        <input
          className="toolbar-search"
          placeholder="Search snippets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="view-toggle">
          <button
            className={`view-btn${view === "list" ? " active" : ""}`}
            onClick={() => setView("list")}
            title="List view"
          >
            ☰
          </button>
          <button
            className={`view-btn${view === "grid" ? " active" : ""}`}
            onClick={() => setView("grid")}
            title="Grid view"
          >
            ⊞
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: "var(--text-dim)" }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="card empty-state">No snippets match your search.</div>
      ) : view === "grid" ? (
        <div className="snippet-grid">
          {filtered.map((t) => (
            <div className="snippet-grid-card" key={t.id}>
              <div className="snippet-grid-top">
                <span className={`badge badge-${t.stage}`}>{t.stage}</span>
                <button className="btn-x" onClick={() => deleteTemplate(t.id)} title="Delete">✕</button>
              </div>
              <h3 className="snippet-grid-title">{t.title}</h3>
              <p className="snippet-grid-preview">{t.body.slice(0, 120)}{t.body.length > 120 ? "…" : ""}</p>
              <div className="snippet-grid-actions">
                <button className="btn" onClick={() => copy(t)}>{copiedId === t.id ? "Copied!" : "Copy"}</button>
                <button className="btn" onClick={() => startEdit(t)}>Edit</button>
              </div>
              {editingId === t.id && (
                <div style={{ marginTop: 12 }}>
                  <div className="form-row">
                    <label>Title</label>
                    <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
                  </div>
                  <div className="form-row">
                    <label>Body</label>
                    <textarea rows={5} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
                  </div>
                  <button className="btn btn-primary" onClick={() => saveEdit(t.id)}>Save</button>{" "}
                  <button className="btn" onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        STAGES.map((stage) => {
          const stageSnippets = filtered.filter((t) => t.stage === stage.value);
          if (stageSnippets.length === 0) return null;
          return (
            <div key={stage.value} style={{ marginBottom: 28 }}>
              <h3 style={{ marginBottom: 10 }}>
                <span className={`badge badge-${stage.value}`}>{stage.label}</span>
              </h3>
              {stageSnippets.map((t) => (
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
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <h3>{t.title}</h3>
                        <button className="btn-x" onClick={() => deleteTemplate(t.id)} title="Delete">✕</button>
                      </div>
                      <pre>{t.body}</pre>
                      <button className="btn" onClick={() => copy(t)}>{copiedId === t.id ? "Copied!" : "Copy"}</button>{" "}
                      <button className="btn" onClick={() => startEdit(t)}>Edit</button>
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
