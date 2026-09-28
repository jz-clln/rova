// src/app/admin/page.tsx
import { Route, ClipboardList, Truck, CircleCheckBig } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [
    { count: activeRoutes },
    { count: openRequirements },
    { count: delivered },
    { count: totalRoutesEver },
  ] = await Promise.all([
    supabase.from("routes").select("id", { count: "exact", head: true }).in("status", ["draft", "offered", "confirmed", "in_progress"]),
    supabase.from("buyer_requirements").select("id", { count: "exact", head: true }).in("status", ["open", "matching"]),
    supabase.from("routes").select("id", { count: "exact", head: true }).eq("status", "delivered"),
    supabase.from("routes").select("id", { count: "exact", head: true }).in("status", ["delivered", "cancelled"]),
  ]);

  const onTimeRate = totalRoutesEver ? Math.round(((delivered ?? 0) / totalRoutesEver) * 100) : null;

  const metrics = [
    { icon: Route, label: "Active routes", value: String(activeRoutes ?? 0), note: "Planned, offered, in transit" },
    { icon: ClipboardList, label: "Open buyer requirements", value: String(openRequirements ?? 0), note: "Awaiting matched supply" },
    { icon: Truck, label: "Routes delivered", value: String(delivered ?? 0), note: "All-time" },
    { icon: CircleCheckBig, label: "Completion rate", value: onTimeRate == null ? "—" : `${onTimeRate}%`, note: "Delivered vs. delivered+cancelled" },
  ];

  return (
    <AppShell subtitle="Full network visibility and manual oversight." searchPlaceholder="Search requirements, routes, or profiles...">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ icon: Icon, label, value, note }) => (
          <Card key={label}>
            <CardHeader className="flex-row items-start justify-between">
              <div>
                <CardDescription>{label}</CardDescription>
                <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
              </div>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#dce6d5] bg-[#f1f5ed] text-[#50764e]">
                <Icon size={18} strokeWidth={1.75} />
              </span>
            </CardHeader>
            <CardContent><p className="text-xs text-[#66766f]">{note}</p></CardContent>
          </Card>
        ))}
      </div>
      <Card className="mt-6">
        <CardHeader><CardTitle>Manual oversight</CardTitle><CardDescription>Foundation module</CardDescription></CardHeader>
        <CardContent><p className="max-w-2xl text-sm leading-6 text-[#66766f]">Early Rova is software-assisted logistics. Admins can intervene in matching, cancellations, route changes, and delivery issues.</p></CardContent>
      </Card>
    </AppShell>
  );
}