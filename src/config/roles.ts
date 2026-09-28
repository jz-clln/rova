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