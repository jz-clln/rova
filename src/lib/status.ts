// src/lib/status.ts
import type { RequirementStatus, RouteStatus } from "@/types";

export type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "outline";
export interface StatusBadge { label: string; variant: BadgeVariant }

/** Percent of a requirement covered by allocations, capped at 100. */
export function requirementProgress(requiredKg: number, confirmedKg: number): number {
  if (!(requiredKg > 0)) return 0;
  return Math.min(100, Math.round((confirmedKg / requiredKg) * 100));
}

export function requirementStatusBadge(
  status: RequirementStatus,
  requiredKg: number,
  confirmedKg: number,
): StatusBadge {
  switch (status) {
    case "draft": return { label: "Draft", variant: "outline" };
    case "cancelled": return { label: "Cancelled", variant: "danger" };
    case "fulfilled": return { label: "Fully fulfilled", variant: "success" };
    default: // open or matching
      if (requiredKg > 0 && confirmedKg >= requiredKg) return { label: "Fully matched", variant: "success" };
      if (confirmedKg > 0) return { label: "Partially fulfilled", variant: "warning" };
      return { label: status === "matching" ? "Matching" : "Open", variant: "info" };
  }
}

export function routeStatusBadge(status: RouteStatus): StatusBadge {
  switch (status) {
    case "draft": return { label: "Planning", variant: "outline" };
    case "offered": return { label: "Finding a carrier", variant: "info" };
    case "confirmed": return { label: "Carrier confirmed", variant: "success" };
    case "in_progress": return { label: "On the way", variant: "info" };
    case "delivered": return { label: "Delivered", variant: "success" };
    case "cancelled": return { label: "Cancelled", variant: "danger" };
  }
}