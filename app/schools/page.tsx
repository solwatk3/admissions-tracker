"use client";

import { useEffect, useMemo, useState } from "react";
import { School, Counselor } from "@/lib/supabase";

const blankSchool = () => ({ name: "", county: "", address: "", phone: "", website: "", notes: "" });
const blankCounselor = (school_id = "") => ({ school_id, name: "", title: "", email: "", phone: "", notes: "" });

export default function SchoolsPage() {
  const [tab, setTab] = useState<"schools" | "counselors">("schools");
  const [schools, setSchools] = useState<School[]>([]);
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [countyFilter, setCountyFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddSchool, setShowAddSchool] = useState(false);
  const [newSchool, setNewSchool] = useState(blankSchool());
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [addCounselorFor, setAddCounselorFor] = useState<string | null>(null);
  const [newCounselor, setNewCounselor] = useState(blankCounselor());
  const [editingCounselor, setEditingCounselor] = useState<Counselor | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  function load() {
    setLoading(true);
    Promise.all([
      fetch("/api/schools").then((r) => r.json()),
      fetch("/api/counselors").then((r) => r.json()),
    ]).then(([s, c]) => {
      setSchools(Array.isArray(s) ? s : []);
      setCounselors(Array.isArray(c) ? c : []);
      setLoading(false);
    });
  }

  const counties = useMemo(() =>
    [...new Set(schools.map((s) => s.county).filter(Boolean) as string[])].sort(),
    [schools]
  );

  const filteredSchools = useMemo(() => {
    let list = schools;
    if (countyFilter !== "all") list = list.filter((s) => s.county === countyFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) =>
        s.name.toLowerCase().includes(q) ||
        (s.county || "").toLowerCase().includes(q) ||
        (s.address || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [schools, search, countyFilter]);

  const filteredCounselors = useMemo(() => {
    let list = counselors;
    if (countyFilter !== "all") list = list.filter((c) => c.school_county === countyFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        (c.school_name || "").toLowerCase().includes(q) ||
        (c.school_county || "").toLowerCase().includes(q) ||
        (c.email || "").toLowerCase().includes(q) ||
        (c.title || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [counselors, search, countyFilter]);

  async function saveSchool(e: React.FormEvent) {
    e.preventDefault();
    if (!newSchool.name.trim()) return;
    setSaving(true);
    await fetch("/api/schools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSchool),
    });
    setNewSchool(blankSchool());
    setShowAddSchool(false);
    setSaving(false);
    load();
  }

  async function updateSchool(e: React.FormEvent) {
    e.preventDefault();
    if (!editingSchool) return;
    setSaving(true);
    await fetch(`/api/schools/${editingSchool.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingSchool),
    });
    setEditingSchool(null);
    setSaving(false);
    load();
  }

  async function deleteSchool(id: string, name: string) {
    if (!confirm(`Delete ${name}? This will also remove all its counselors.`)) return;
    await fetch(`/api/schools/${id}`, { method: "DELETE" });
    load();
  }

  async function saveCounselor(e: React.FormEvent) {
    e.preventDefault();
    if (!newCounselor.name.trim()) return;
    setSaving(true);
    await fetch("/api/counselors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCounselor),
    });
    setNewCounselor(blankCounselor());
    setAddCounselorFor(null);
    setSaving(false);
    load();
  }

  async function updateCounselor(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCounselor) return;
    setSaving(true);
    await fetch(`/api/counselors/${editingCounselor.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingCounselor),
    });
    setEditingCounselor(null);
    setSaving(false);
    load();
  }

  async function deleteCounselor(id: string, name: string) {
    if (!confirm(`Delete ${name}?`)) return;
    await fetch(`/api/counselors/${id}`, { method: "DELETE" });
    load();
  }

  const schoolCounselors = (schoolId: string) => counselors.filter((c) => c.school_id === schoolId);

  return (
    <div>
      <div className="detail-header">
        <div>
          <h1 className="page-title">Schools & Counselors</h1>
          <p className="page-sub">{schools.length} school{schools.length !== 1 ? "s" : ""} · {counselors.length} counselor{counselors.length !== 1 ? "s" : ""}</p>
        </div>
        {tab === "schools" && (
          <button className="btn btn-primary" onClick={() => setShowAddSchool((s) => !s)}>
            {showAddSchool ? "Cancel" : "+ Add school"}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="sc-tabs">
        <button className={`sc-tab${tab === "schools" ? " active" : ""}`} onClick={() => setTab("schools")}>Schools</button>
        <button className={`sc-tab${tab === "counselors" ? " active" : ""}`} onClick={() => setTab("counselors")}>Counselors</button>
      </div>

      {/* Add school form */}
      {tab === "schools" && showAddSchool && (
        <form className="card" onSubmit={saveSchool} style={{ marginBottom: 20, maxWidth: 640 }}>
          <div className="form-grid">
            <div className="form-row">
              <label>School name *</label>
              <input value={newSchool.name} onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })} required autoFocus />
            </div>
            <div className="form-row">
              <label>County</label>
              <input value={newSchool.county} onChange={(e) => setNewSchool({ ...newSchool, county: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <label>Address</label>
            <input value={newSchool.address} onChange={(e) => setNewSchool({ ...newSchool, address: e.target.value })} />
          </div>
          <div className="form-grid">
            <div className="form-row">
              <label>Phone</label>
              <input value={newSchool.phone} onChange={(e) => setNewSchool({ ...newSchool, phone: e.target.value })} />
            </div>
            <div className="form-row">
              <label>Website</label>
              <input value={newSchool.website} onChange={(e) => setNewSchool({ ...newSchool, website: e.target.value })} placeholder="https://" />
            </div>
          </div>
          <div className="form-row">
            <label>Notes</label>
            <textarea rows={2} value={newSchool.notes} onChange={(e) => setNewSchool({ ...newSchool, notes: e.target.value })} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={saving}>Save school</button>
        </form>
      )}

      {/* Toolbar */}
      <div className="toolbar" style={{ marginBottom: 16 }}>
        <input
          className="toolbar-search"
          placeholder={tab === "schools" ? "Search schools..." : "Search counselors..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {counties.length > 0 && (
          <select value={countyFilter} onChange={(e) => setCountyFilter(e.target.value)}>
            <option value="all">All counties</option>
            {counties.map((c) => <option key={c} value={c}>{c} County</option>)}
          </select>
        )}
      </div>

      {loading ? (
        <p style={{ color: "var(--text-dim)" }}>Loading...</p>
      ) : tab === "schools" ? (
        filteredSchools.length === 0 ? (
          <div className="card empty-state">No schools found. Add one above.</div>
        ) : (
          <div>
            {filteredSchools.map((s) => {
              const sc = schoolCounselors(s.id);
              const isOpen = expandedId === s.id;
              const isEditing = editingSchool?.id === s.id;
              return (
                <div className="sc-card" key={s.id}>
                  {isEditing ? (
                    <form onSubmit={updateSchool}>
                      <div className="form-grid">
                        <div className="form-row">
                          <label>School name *</label>
                          <input value={editingSchool.name} onChange={(e) => setEditingSchool({ ...editingSchool, name: e.target.value })} required />
                        </div>
                        <div className="form-row">
                          <label>County</label>
                          <input value={editingSchool.county || ""} onChange={(e) => setEditingSchool({ ...editingSchool, county: e.target.value })} />
                        </div>
                      </div>
                      <div className="form-row">
                        <label>Address</label>
                        <input value={editingSchool.address || ""} onChange={(e) => setEditingSchool({ ...editingSchool, address: e.target.value })} />
                      </div>
                      <div className="form-grid">
                        <div className="form-row">
                          <label>Phone</label>
                          <input value={editingSchool.phone || ""} onChange={(e) => setEditingSchool({ ...editingSchool, phone: e.target.value })} />
                        </div>
                        <div className="form-row">
                          <label>Website</label>
                          <input value={editingSchool.website || ""} onChange={(e) => setEditingSchool({ ...editingSchool, website: e.target.value })} />
                        </div>
                      </div>
                      <div className="form-row">
                        <label>Notes</label>
                        <textarea rows={2} value={editingSchool.notes || ""} onChange={(e) => setEditingSchool({ ...editingSchool, notes: e.target.value })} />
                      </div>
                      <button className="btn btn-primary" type="submit" disabled={saving}>Save</button>{" "}
                      <button className="btn" type="button" onClick={() => setEditingSchool(null)}>Cancel</button>
                    </form>
                  ) : (
                    <>
                      <div className="sc-card-header" onClick={() => setExpandedId(isOpen ? null : s.id)}>
                        <div>
                          <div className="sc-card-name">{s.name}</div>
                          <div className="sc-card-meta">
                            {s.county && <span>{s.county} County</span>}
                            {s.county && s.phone && <span> · </span>}
                            {s.phone && <span>{s.phone}</span>}
                            {sc.length > 0 && <span className="sc-counselor-count">{sc.length} counselor{sc.length !== 1 ? "s" : ""}</span>}
                          </div>
                        </div>
                        <div className="sc-card-actions" onClick={(e) => e.stopPropagation()}>
                          <button className="btn" onClick={() => { setEditingSchool(s); setExpandedId(s.id); }}>Edit</button>
                          <button className="btn-x" onClick={() => deleteSchool(s.id, s.name)}>✕</button>
                          <span className="sc-chevron">{isOpen ? "▲" : "▼"}</span>
                        </div>
                      </div>

                      {isOpen && (
                        <div className="sc-card-body">
                          {s.address && <p className="sc-detail"><strong>Address:</strong> {s.address}</p>}
                          {s.website && <p className="sc-detail"><strong>Website:</strong> <a href={s.website} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>{s.website}</a></p>}
                          {s.notes && <p className="sc-detail"><strong>Notes:</strong> {s.notes}</p>}

                          <div className="sc-counselors-header">
                            <strong>Counselors</strong>
                            <button className="btn" onClick={() => { setAddCounselorFor(s.id); setNewCounselor(blankCounselor(s.id)); }}>+ Add counselor</button>
                          </div>

                          {addCounselorFor === s.id && (
                            <form className="sc-inline-form" onSubmit={saveCounselor}>
                              <div className="form-grid">
                                <div className="form-row">
                                  <label>Name *</label>
                                  <input value={newCounselor.name} onChange={(e) => setNewCounselor({ ...newCounselor, name: e.target.value })} required autoFocus />
                                </div>
                                <div className="form-row">
                                  <label>Title</label>
                                  <input value={newCounselor.title} onChange={(e) => setNewCounselor({ ...newCounselor, title: e.target.value })} placeholder="Guidance Counselor" />
                                </div>
                              </div>
                              <div className="form-grid">
                                <div className="form-row">
                                  <label>Email</label>
                                  <input type="email" value={newCounselor.email} onChange={(e) => setNewCounselor({ ...newCounselor, email: e.target.value })} />
                                </div>
                                <div className="form-row">
                                  <label>Phone</label>
                                  <input value={newCounselor.phone} onChange={(e) => setNewCounselor({ ...newCounselor, phone: e.target.value })} />
                                </div>
                              </div>
                              <div className="form-row">
                                <label>Notes</label>
                                <input value={newCounselor.notes} onChange={(e) => setNewCounselor({ ...newCounselor, notes: e.target.value })} />
                              </div>
                              <button className="btn btn-primary" type="submit" disabled={saving}>Save counselor</button>{" "}
                              <button className="btn" type="button" onClick={() => setAddCounselorFor(null)}>Cancel</button>
                            </form>
                          )}

                          {sc.length === 0 && addCounselorFor !== s.id && (
                            <p style={{ fontSize: 14, color: "var(--text-dim)" }}>No counselors added yet.</p>
                          )}

                          {sc.map((c) => (
                            <div key={c.id} className="sc-counselor-row">
                              {editingCounselor?.id === c.id ? (
                                <form style={{ width: "100%" }} onSubmit={updateCounselor}>
                                  <div className="form-grid">
                                    <div className="form-row">
                                      <label>Name *</label>
                                      <input value={editingCounselor.name} onChange={(e) => setEditingCounselor({ ...editingCounselor, name: e.target.value })} required />
                                    </div>
                                    <div className="form-row">
                                      <label>Title</label>
                                      <input value={editingCounselor.title || ""} onChange={(e) => setEditingCounselor({ ...editingCounselor, title: e.target.value })} />
                                    </div>
                                  </div>
                                  <div className="form-grid">
                                    <div className="form-row">
                                      <label>Email</label>
                                      <input value={editingCounselor.email || ""} onChange={(e) => setEditingCounselor({ ...editingCounselor, email: e.target.value })} />
                                    </div>
                                    <div className="form-row">
                                      <label>Phone</label>
                                      <input value={editingCounselor.phone || ""} onChange={(e) => setEditingCounselor({ ...editingCounselor, phone: e.target.value })} />
                                    </div>
                                  </div>
                                  <div className="form-row">
                                    <label>Notes</label>
                                    <input value={editingCounselor.notes || ""} onChange={(e) => setEditingCounselor({ ...editingCounselor, notes: e.target.value })} />
                                  </div>
                                  <button className="btn btn-primary" type="submit" disabled={saving}>Save</button>{" "}
                                  <button className="btn" type="button" onClick={() => setEditingCounselor(null)}>Cancel</button>
                                </form>
                              ) : (
                                <>
                                  <div className="sc-counselor-info">
                                    <div className="sc-counselor-name">{c.name}</div>
                                    {c.title && <div className="sc-counselor-sub">{c.title}</div>}
                                    <div className="sc-counselor-sub">
                                      {c.email && <span><a href={`mailto:${c.email}`} style={{ color: "var(--accent)" }}>{c.email}</a></span>}
                                      {c.email && c.phone && <span> · </span>}
                                      {c.phone && <span>{c.phone}</span>}
                                    </div>
                                    {c.notes && <div className="sc-counselor-sub">{c.notes}</div>}
                                  </div>
                                  <div style={{ display: "flex", gap: 6 }}>
                                    <button className="btn" onClick={() => setEditingCounselor(c)}>Edit</button>
                                    <button className="btn-x" onClick={() => deleteCounselor(c.id, c.name)}>✕</button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : (
        // Counselors tab
        filteredCounselors.length === 0 ? (
          <div className="card empty-state">No counselors found. Add them from a school's record.</div>
        ) : (
          <div className="card table-card">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>School</th>
                  <th className="col-hide-sm">County</th>
                  <th className="col-hide-sm">Email</th>
                  <th className="col-hide-sm">Phone</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredCounselors.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div>{c.name}</div>
                      {c.title && <div className="row-sub">{c.title}</div>}
                    </td>
                    <td>{c.school_name || "-"}</td>
                    <td className="col-hide-sm">{c.school_county ? `${c.school_county} County` : "-"}</td>
                    <td className="col-hide-sm">{c.email ? <a href={`mailto:${c.email}`} style={{ color: "var(--accent)" }}>{c.email}</a> : "-"}</td>
                    <td className="col-hide-sm">{c.phone || "-"}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn" onClick={() => { setTab("schools"); setExpandedId(c.school_id || null); setEditingCounselor(c); }}>Edit</button>
                        <button className="btn-x" onClick={() => deleteCounselor(c.id, c.name)}>✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
