"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Applicant, STAGES } from "@/lib/supabase";
import { followupStatus, formatDate } from "@/lib/dates";

export default function TrackerPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [sortKey, setSortKey] = useState<"next_followup" | "name" | "stage_date">("next_followup");

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    fetch("/api/applicants")
      .then((r) => r.json())
      .then((data) => {
        setApplicants(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }

  const filtered = useMemo(() => {
    let list = applicants;
    if (stageFilter !== "all") list = list.filter((a) => a.stage === stageFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          (a.email || "").toLowerCase().includes(q) ||
          (a.program || "").toLowerCase().includes(q)
      );
    }
    list = [...list].sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name);
      if (sortKey === "stage_date") return (b.stage_date || "").localeCompare(a.stage_date || "");
      // next_followup: nulls last, earliest first
      if (!a.next_followup && !b.next_followup) return 0;
      if (!a.next_followup) return 1;
      if (!b.next_followup) return -1;
      return a.next_followup.localeCompare(b.next_followup);
    });
    return list;
  }, [applicants, search, stageFilter, sortKey]);

  return (
    <div>
      <div className="detail-header">
        <div>
          <h1 className="page-title">Applicant Tracker</h1>
          <p className="page-sub">{applicants.length} total applicant{applicants.length === 1 ? "" : "s"}</p>
        </div>
        <Link href="/applicant/new" className="btn btn-primary">+ Add applicant</Link>
      </div>

      <div className="toolbar">
        <input
          placeholder="Search name, email, program..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
          <option value="all">All stages</option>
          {STAGES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select value={sortKey} onChange={(e) => setSortKey(e.target.value as any)}>
          <option value="next_followup">Sort: Follow-up date</option>
          <option value="name">Sort: Name</option>
          <option value="stage_date">Sort: Stage date</option>
        </select>
      </div>

      {loading ? (
        <p style={{ color: "var(--text-dim)" }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="card empty-state">No applicants match. Try clearing filters or add a new applicant.</div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Program</th>
                <th>Stage</th>
                <th>Stage date</th>
                <th>Next follow-up</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const fs = followupStatus(a.next_followup);
                return (
                  <tr key={a.id}>
                    <td>{a.name}</td>
                    <td>{a.program || "-"}</td>
                    <td><span className={`badge badge-${a.stage}`}>{a.stage}</span></td>
                    <td>{formatDate(a.stage_date)}</td>
                    <td>
                      {a.next_followup ? (
                        <span className={`badge badge-${fs === "overdue" ? "overdue" : fs === "soon" ? "soon" : "ok"}`}>
                          {formatDate(a.next_followup)}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td><Link href={`/applicant/${a.id}`} className="btn">Open</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
