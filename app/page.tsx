"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Applicant, STAGES } from "@/lib/supabase";
import { followupStatus, formatDate } from "@/lib/dates";

export default function DashboardPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/applicants")
      .then((r) => r.json())
      .then((data) => {
        setApplicants(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  const counts = STAGES.reduce((acc, s) => {
    acc[s.value] = applicants.filter((a) => a.stage === s.value).length;
    return acc;
  }, {} as Record<string, number>);

  const overdue = applicants.filter((a) => followupStatus(a.next_followup) === "overdue");
  const soon = applicants.filter((a) => followupStatus(a.next_followup) === "soon");

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">Your admissions pipeline at a glance.</p>

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
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Stage</th>
                    <th>Was due</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {overdue.map((a) => (
                    <tr key={a.id}>
                      <td>{a.name}</td>
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
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Stage</th>
                    <th>Due</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {soon.map((a) => (
                    <tr key={a.id}>
                      <td>{a.name}</td>
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
