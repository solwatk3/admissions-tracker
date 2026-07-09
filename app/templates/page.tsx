"use client";

import { useEffect, useMemo, useState } from "react";
import { Template } from "@/lib/supabase";

function preview(body: string) {
  const words = body.trim().split(/\s+/).slice(0, 10).join(" ");
  return words + (body.trim().split(/\s+/).length > 10 ? "…" : "");
}

export default function SnippetsPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ title: "", body: "", category: "" });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newTpl, setNewTpl] = useState({ category: "", title: "", body: "" });
  const [addingCatFor, setAddingCatFor] = useState<"new" | "edit" | null>(null);
  const [newCatName, setNewCatName] = useState("");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [view, setView] = useState<"list" | "grid">("list");

  useEffect(() => { load(); loadCategories(); }, []);

  function load() {
    setLoading(true);
    fetch("/api/templates")
      .then((r) => r.json())
      .then((data) => { setTemplates(Array.isArray(data) ? data : []); setLoading(false); });
  }

  function loadCategories() {
    return fetch("/api/snippet-categories").then((r) => r.json()).then(setCategories);
  }

  async function saveNewCategory(target: "new" | "edit") {
    if (!newCatName.trim()) return;
    await fetch("/api/snippet-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCatName.trim() }),
    });
    await loadCategories();
    if (target === "new") setNewTpl((f) => ({ ...f, category: newCatName.trim() }));
    if (target === "edit") setDraft((f) => ({ ...f, category: newCatName.trim() }));
    setNewCatName("");
    setAddingCatFor(null);
  }

  function startEdit(t: Template) {
    setEditingId(t.id);
    setDraft({ title: t.title, body: t.body, category: t.category || "" });
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
      body: JSON.stringify({ ...newTpl, stage: "inquiry" }),
    });
    setNewTpl({ category: "", title: "", body: "" });
    setShowNew(false);
    load();
  }

  const filtered = useMemo(() => {
    let list = templates;
    if (catFilter !== "all") list = list.filter((t) => t.category === catFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) => t.title.toLowerCase().includes(q) || t.body.toLowerCase().includes(q) || (t.category || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [templates, search, catFilter]);

  // Group by category for list view
  const grouped = useMemo(() => {
    const cats = [...new Set(filtered.map((t) => t.category || "Uncategorized"))].sort();
    return cats.map((cat) => ({ cat, items: filtered.filter((t) => (t.category || "Uncategorized") === cat) }));
  }, [filtered]);

  function CategorySelect({ value, onChange, target }: { value: string; onChange: (v: string) => void; target: "new" | "edit" }) {
    if (addingCatFor === target) {
      return (
        <div style={{ display: "flex", gap: 8 }}>
          <input autoFocus placeholder="Category name" value={newCatName} onChange={(e) => setNewCatName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), saveNewCategory(target))} />
          <button type="button" className="btn btn-primary" onClick={() => saveNewCategory(target)} style={{ whiteSpace: "nowrap" }}>Save</button>
          <button type="button" className="btn" onClick={() => setAddingCatFor(null)}>Cancel</button>
        </div>
      );
    }
    return (
      <select value={value} onChange={(e) => e.target.value === "__add__" ? setAddingCatFor(target) : onChange(e.target.value)}>
        <option value="">— Select category —</option>
        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        <option value="__add__">+ Add new category</option>
      </select>
    );
  }

  return (
    <div>
      <div className="detail-header">
        <div>
          <h1 className="page-title">Snippets</h1>
          <p className="page-sub">Reusable outreach copy. Click Copy, then paste into your email.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNew((s) => !s)}>
          {showNew ? "Cancel" : "+ New snippet"}
        </button>
      </div>

      {showNew && (
        <form className="card" onSubmit={createTemplate} style={{ marginBottom: 24, maxWidth: 640 }}>
          <div className="form-grid">
            <div className="form-row">
              <label>Category</label>
              <CategorySelect value={newTpl.category} onChange={(v) => setNewTpl((f) => ({ ...f, category: v }))} target="new" />
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

      <div className="toolbar" style={{ marginBottom: 20 }}>
        <input className="toolbar-search" placeholder="Search snippets..." value={search} onChange={(e) => setSearch(e.target.value)} />
        {categories.length > 0 && (
          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
            <option value="all">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
        <div className="view-toggle">
          <button className={`view-btn${view === "list" ? " active" : ""}`} onClick={() => setView("list")} title="List view">☰</button>
          <button className={`view-btn${view === "grid" ? " active" : ""}`} onClick={() => setView("grid")} title="Grid view">⊞</button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: "var(--text-dim)" }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="card empty-state">No snippets match. Try clearing your search or adding a new one.</div>
      ) : view === "grid" ? (
        <div className="snippet-grid">
          {filtered.map((t) => (
            <div className="snippet-grid-card" key={t.id}>
              <div className="snippet-grid-top">
                {t.category && <span className="snippet-cat-tag">{t.category}</span>}
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
                    <label>Category</label>
                    <CategorySelect value={draft.category} onChange={(v) => setDraft((f) => ({ ...f, category: v }))} target="edit" />
                  </div>
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
        grouped.map(({ cat, items }) => (
          <div key={cat} style={{ marginBottom: 28 }}>
            <h3 style={{ marginBottom: 10 }}>
              <span className="snippet-cat-tag snippet-cat-tag-lg">{cat}</span>
            </h3>
            {items.map((t) => (
              <div className="template-card" key={t.id}>
                {editingId === t.id ? (
                  <>
                    <div className="form-row">
                      <label>Category</label>
                      <CategorySelect value={draft.category} onChange={(v) => setDraft((f) => ({ ...f, category: v }))} target="edit" />
                    </div>
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
                  <div className="snippet-list-row">
                    <div className="snippet-list-text">
                      <div className="snippet-list-title">{t.title}</div>
                      <div className="snippet-list-preview">{preview(t.body)}</div>
                    </div>
                    <div className="snippet-list-actions">
                      <button className="btn" onClick={() => copy(t)}>{copiedId === t.id ? "Copied!" : "Copy"}</button>
                      <button className="btn" onClick={() => startEdit(t)}>Edit</button>
                      <button className="btn-x" onClick={() => deleteTemplate(t.id)} title="Delete">✕</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
