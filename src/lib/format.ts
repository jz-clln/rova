// src/lib/format.ts
// Every Rova user is in the Philippines (UTC+8, no daylight saving). Server components
// render on the server, whose own timezone is usually UTC, so every date shown to a
// user must name the timezone explicitly.
const TZ = "Asia/Manila";

type DateInput = string | Date | null | undefined;

function toDate(value: DateInput): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function kg(value: number | string | null | undefined): string {
  if (value == null) return "—";
  const n = Number(value);
  return Number.isFinite(n) ? `${n.toLocaleString("en-US")} kg` : "—";
}

/** Today's date in Manila as YYYY-MM-DD. */
export function manilaToday(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function formatDate(value: DateInput): string {
  const date = toDate(value);
  return date
    ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: TZ }).format(date)
    : "—";
}

export function formatTime(value: DateInput): string {
  const date = toDate(value);
  return date
    ? new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: TZ }).format(date)
    : "—";
}

export function formatDateTime(value: DateInput): string {
  const date = toDate(value);
  return date ? `${formatDate(date)}, ${formatTime(date)}` : "—";
}