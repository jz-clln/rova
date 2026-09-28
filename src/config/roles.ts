// src/config/roles.ts
import type { UserRole } from "@/types";

// Where each role lands after sign-in, and the base path that "belongs" to them.
export const ROLE_HOME: Record<UserRole, string> = {
  farmer: "/farmer",
  buyer: "/buyer",
  driver: "/driver",
  truck_operator: "/operator",
  admin: "/admin",
};

export const ROLE_BASE_PATHS = Object.values(ROLE_HOME);

export function roleBaseOf(pathname: string): string | undefined {
  return ROLE_BASE_PATHS.find((base) => pathname === base || pathname.startsWith(base + "/"));
}

// Roles a person may choose for themselves at sign-up. "admin" is deliberately
// absent: admins are only ever assigned directly in the database.
export const SELF_SERVICE_ROLES = ["farmer", "buyer", "truck_operator", "driver"] as const;
export type SelfServiceRole = (typeof SELF_SERVICE_ROLES)[number];