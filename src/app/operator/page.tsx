// src/app/operator/page.tsx
import { Route, Truck, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DriverRow {
  id: string;
  active: boolean;
  profiles: { full_name: string } | null;
}

export default async function OperatorHomePage() {
  const supabase = await createClient();

  const [{ data: routes }, { data: vehicles }, { data: drivers }] = await Promise.all([
    supabase
      .from("routes")
      .select("id, status, destination_address, total_load_kg")
      .in("status", ["offered", "confirmed", "in_progress"])
      .order("planned_departure", { ascending: true }),
    supabase.from("vehicles").select("id, plate_number, max_weight_kg, active"),
    supabase.from("drivers").select("id, active, profiles(full_name)").returns<DriverRow[]>(),
  ]);

  const activeVehicleCount = vehicles?.filter((v) => v.active).length ?? 0;
  const activeDriverCount = drivers?.filter((d) => d.active).length ?? 0;

  return (
    <AppShell subtitle="Here is your fleet activity today." searchPlaceholder="Search jobs, drivers, trucks, or locations...">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div><CardTitle>Assigned routes</CardTitle><CardDescription>{routes?.length ?? 0} active</CardDescription></div>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#dce6d5] bg-[#f1f5ed] text-[#50764e]"><Route size={18} /></span>
          </CardHeader>
          <CardContent className="space-y-2">
            {routes?.length ? (
              routes.slice(0, 3).map((r) => (
                <div key={r.id} className="flex items-baseline justify-between text-sm">
                  <span className="font-medium text-[#20312c]">{r.destination_address}</span>
                  <span className="text-[#66766f]">{Number(r.total_load_kg).toLocaleString()} kg</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#66766f]">No routes offered or accepted yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div><CardTitle>Trucks</CardTitle><CardDescription>{activeVehicleCount} active</CardDescription></div>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#dce6d5] bg-[#f1f5ed] text-[#50764e]"><Truck size={18} /></span>
          </CardHeader>
          <CardContent className="space-y-2">
            {vehicles?.length ? (
              vehicles.map((v) => (
                <div key={v.id} className="flex items-baseline justify-between text-sm">
                  <span className="font-medium text-[#20312c]">{v.plate_number}</span>
                  <span className="text-[#66766f]">{Number(v.max_weight_kg).toLocaleString()} kg cap.</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#66766f]">Add your first truck to accept routes.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div><CardTitle>Drivers</CardTitle><CardDescription>{activeDriverCount} active</CardDescription></div>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#dce6d5] bg-[#f1f5ed] text-[#50764e]"><Users size={18} /></span>
          </CardHeader>
          <CardContent className="space-y-2">
            {drivers?.length ? (
              drivers.map((d) => (
                <div key={d.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-[#20312c]">{d.profiles?.full_name ?? "Driver"}</span>
                  <Badge variant={d.active ? "success" : "outline"}>{d.active ? "Active" : "Inactive"}</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#66766f]">No drivers added yet.</p>
            )}
          </CardContent>
          <CardFooter><span className="text-xs text-[#66766f]">Earnings tracking not yet built</span></CardFooter>
        </Card>
      </div>
    </AppShell>
  );
}