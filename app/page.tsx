"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Applicant, STAGES } from "@/lib/supabase";
import { followupStatus, formatDate } from "@/lib/dates";

export default function DashboardPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState("all");

  useEffect(() => {
    fetch("/api/applicants")
      .then((r) => r.json())
      .then((data) => {
        setApplicants(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  const classYears = useMemo(() =>
    [...new Set(applicants.map((a) => a.class_year).filter(Boolean) as number[])].sort(),
    [applicants]
  );

  const filtered = useMemo(() =>
    yearFilter === "all" ? applicants : applicants.filter((a) => String(a.class_year) === yearFilter),
    [applicants, yearFilter]
  );

  const counts = STAGES.reduce((acc, s) => {
    acc[s.value] = filtered.filter((a) => a.stage === s.value).length;
    return acc;
  }, {} as Record<string, number>);

  const overdue = filtered.filter((a) => followupStatus(a.next_followup) === "overdue");
  const soon = filtered.filter((a) => followupStatus(a.next_followup) === "soon");

  return (
    <div>
      <div className="detail-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Your admissions pipeline at a glance.</p>
        </div>
        {classYears.length > 0 && (
          <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} style={{ width: "auto" }}>
            <option value="all">All class years</option>
            {classYears.map((y) => <option key={y} value={String(y)}>Class of {y}</option>)}
          </select>
        )}
      </div>

      {loading ? (
        <p style={{ color: "var(--text-dim)" }}>Loading...</p>
      ) : (
        <>
          <div className="stat-grid">
            {STAGES.map((s) => (
              <div className="stat-card" key={s.value}>
                <div className="num">{counts[s.value] || 0}</div>
                <div className="label">{s.label}</div>
              </div>
            ))}
            <div className="stat-card">
              <div className="num">{filtered.length}</div>
              <div className="label">Total</div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginTop: 0 }}>
              Follow-ups overdue{" "}
              {overdue.length > 0 && <span className="badge badge-overdue">{overdue.length}</span>}
            </h3>
            {overdue.length === 0 ? (
              <p style={{ color: "var(--text-dim)", fontSize: 14 }}>Nothing overdue. You're caught up.</p>
            ) : (
              <table>
                <thead><tr><th>Name</th><th>Stage</th><th>Was due</th><th></th></tr></thead>
                <tbody>
                  {overdue.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <div>{a.name}</div>
                        {a.school && <div className="row-sub">{a.school}</div>}
                      </td>
                      <td><span className={`badge badge-${a.stage}`}>{a.stage}</span></td>
                      <td>{formatDate(a.next_followup)}</td>
                      <td><Link href={`/applicant/${a.id}`} className="btn">Open</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0 }}>
              Due soon (next 2 days){" "}
              {soon.length > 0 && <span className="badge badge-soon">{soon.length}</span>}
            </h3>
            {soon.length === 0 ? (
              <p style={{ color: "var(--text-dim)", fontSize: 14 }}>Nothing coming up in the next 2 days.</p>
            ) : (
              <table>
                <thead><tr><th>Name</th><th>Stage</th><th>Due</th><th></th></tr></thead>
                <tbody>
                  {soon.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <div>{a.name}</div>
                        {a.school && <div className="row-sub">{a.school}</div>}
                      </td>
                      <td><span className={`badge badge-${a.stage}`}>{a.stage}</span></td>
                      <td>{formatDate(a.next_followup)}</td>
                      <td><Link href={`/applicant/${a.id}`} className="btn">Open</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
