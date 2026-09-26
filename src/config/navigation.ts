import { LayoutDashboard, ClipboardList, PackageOpen, Route, Truck, CircleCheckBig, Shield } from "lucide-react";

export const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/requirements", label: "Buyer requirements", icon: ClipboardList },
  { href: "/shipments", label: "Farm supply", icon: PackageOpen },
  { href: "/routes", label: "Routes", icon: Route },
  { href: "/deliveries", label: "Deliveries", icon: CircleCheckBig },
  { href: "/fleet", label: "Fleet", icon: Truck },
  { href: "/admin", label: "Admin", icon: Shield },
] as const;
