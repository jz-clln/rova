// src/app/driver/page.tsx
import { Route, PackageOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DriverHomePage() {
  const supabase = await createClient();

  const { data: route } = await supabase
    .from("routes")
    .select("id, status, destination_address, planned_departure, planned_arrival, total_load_kg")
    .in("status", ["confirmed", "in_progress"])
    .order("planned_departure", { ascending: true })
    .limit(1)
    .maybeSingle();

  const { data: stops } = route
    ? await supabase
        .from("route_stops")
        .select("id, address, planned_at, status, stop_type")
        .eq("route_id", route.id)
        .order("sequence_no", { ascending: true })
    : { data: null };

  const pickupCount = stops?.filter((s) => s.stop_type !== "dropoff").length ?? 0;
  const nextStop = stops?.find((s) => s.status === "pending");

  return (
    <AppShell subtitle="Here's your route activity for today." searchPlaceholder="Search stops, farms, buyers, or route codes...">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle>Today&apos;s route</CardTitle>
              <CardDescription>{route ? `${pickupCount} pickups · 1 destination` : "No route assigned"}</CardDescription>
            </div>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#dce6d5] bg-[#f1f5ed] text-[#50764e]"><Route size={18} /></span>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{route ? `${Number(route.total_load_kg).toLocaleString()} kg` : "—"}</p>
            <p className="mt-1 text-sm text-[#66766f]">
              {route?.planned_arrival ? `Delivery deadline: ${new Date(route.planned_arrival).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Check back once you're assigned a route."}
            </p>
          </CardContent>
          <CardFooter><Button disabled={!route}>Start route</Button></CardFooter>
        </Card>

        {nextStop ? (
          <Card>
            <CardHeader className="flex-row items-start justify-between">
              <div><CardTitle>Next stop</CardTitle><CardDescription>{nextStop.address}</CardDescription></div>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#dce6d5] bg-[#f1f5ed] text-[#50764e]"><PackageOpen size={18} /></span>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#66766f]">
                {nextStop.planned_at ? new Date(nextStop.planned_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Time to be confirmed"}
              </p>
            </CardContent>
            <CardFooter><Button variant="secondary">Navigate</Button></CardFooter>
          </Card>
        ) : null}
      </div>
    </AppShell>
  );
}