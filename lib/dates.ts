export function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function followupStatus(dateStr: string | null): "overdue" | "soon" | "ok" | "none" {
  if (!dateStr) return "none";
  const d = daysUntil(dateStr);
  if (d === null) return "none";
  if (d < 0) return "overdue";
  if (d <= 2) return "soon";
  return "ok";
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}
