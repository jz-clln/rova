// src/config/navigation.ts
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard, ClipboardList, PackageOpen, Route, Truck,
  CircleCheckBig, Sprout, Wallet, Users, FileCheck2, UserCircle,
} from "lucide-react";
import type { UserRole } from "@/types";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

// Only the "Home" entry in each list resolves to a real page right now.
// The rest are the MVP-scope pages from the role spec, to be built next —
// they're listed here so the sidebar's shape doesn't change as each lands.
export const navigationByRole: Record<UserRole, NavItem[]> = {
  farmer: [
    { href: "/farmer", label: "Home", icon: LayoutDashboard },
    { href: "/farmer/requests", label: "Buyer requests", icon: ClipboardList },
    { href: "/farmer/supply", label: "My produce", icon: Sprout },
    { href: "/farmer/shipments", label: "Shipments", icon: PackageOpen },
    { href: "/farmer/pickups", label: "Pickups", icon: Route },
    { href: "/farmer/payments", label: "Payments", icon: Wallet },
    { href: "/profile", label: "Profile", icon: UserCircle },
  ],
  buyer: [
    { href: "/buyer", label: "Home", icon: LayoutDashboard },
    { href: "/buyer/requirements", label: "My requirements", icon: ClipboardList },
    { href: "/buyer/deliveries", label: "Incoming deliveries", icon: Truck },
    { href: "/buyer/receipts", label: "Receipts", icon: CircleCheckBig },
    { href: "/profile", label: "Profile", icon: UserCircle },
  ],
  driver: [
    { href: "/driver", label: "Today", icon: LayoutDashboard },
    { href: "/driver/pickups", label: "Pickups", icon: PackageOpen },
    { href: "/driver/history", label: "Trip history", icon: Route },
    { href: "/profile", label: "Profile", icon: UserCircle },
  ],
  truck_operator: [
    { href: "/operator", label: "Overview", icon: LayoutDashboard },
    { href: "/operator/routes", label: "Active routes", icon: Route },
    { href: "/operator/trucks", label: "Trucks", icon: Truck },
    { href: "/operator/drivers", label: "Drivers", icon: Users },
    { href: "/operator/earnings", label: "Earnings", icon: Wallet },
    { href: "/profile", label: "Profile", icon: UserCircle },
  ],
  admin: [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/requirements", label: "Buyer requirements", icon: ClipboardList },
    { href: "/admin/supply", label: "Supply", icon: PackageOpen },
    { href: "/admin/routes", label: "Routes", icon: Route },
    { href: "/admin/deliveries", label: "Deliveries", icon: CircleCheckBig },
    { href: "/admin/fleet", label: "Fleet", icon: Truck },
    { href: "/admin/verification", label: "Verification", icon: FileCheck2 },
    { href: "/profile", label: "Profile", icon: UserCircle },
  ],
};