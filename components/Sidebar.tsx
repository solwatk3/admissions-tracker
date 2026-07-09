"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/tracker", label: "Applicant Tracker" },
  { href: "/templates", label: "Templates" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="sidebar">
      <h1>Admissions Tracker</h1>
      {links.map((l) => {
        const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
        return (
          <Link key={l.href} href={l.href} className={`nav-link${active ? " active" : ""}`}>
            {l.label}
          </Link>
        );
      })}
      <div style={{ marginTop: 24, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
        <button onClick={handleLogout} className="nav-link" style={{ background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left" }}>
          Log out
        </button>
      </div>
    </div>
  );
}
