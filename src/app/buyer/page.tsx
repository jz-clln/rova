// src/app/buyer/page.tsx
import { ClipboardList, Truck, CircleCheckBig } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function kg(value: number | null | undefined) {
  return value == null ? "—" : `${Number(value).toLocaleString()} kg`;
}

interface RequirementRow {
  id: string;
  required_quantity_kg: number;
  delivery_date: string;
  commodities: { name: string } | null;
}

interface ShipmentRow {
  id: string;
  quantity_kg: number;
  route: { status: string; planned_arrival: string | null } | null;
}

export default async function BuyerHomePage() {
  const supabase = await createClient();

  const { data: requirement } = await supabase
    .from("buyer_requirements")
    .select("id, required_quantity_kg, delivery_date, commodities(name)")
    .in("status", ["open", "matching"])
    .order("delivery_date", { ascending: true })
    .limit(1)
    .maybeSingle()
    .returns<RequirementRow | null>();

  const { data: allocations } = requirement
    ? await supabase.from("allocations").select("allocated_quantity_kg").eq("requirement_id", requirement.id)
    : { data: null };

  const confirmedKg = allocations?.reduce((sum, a) => sum + Number(a.allocated_quantity_kg), 0) ?? 0;
  const requiredKg = Number(requirement?.required_quantity_kg ?? 0);
  const remainingKg = Math.max(requiredKg - confirmedKg, 0);

  const { data: shipments } = requirement
    ? await supabase
        .from("shipments")
        .select("id, quantity_kg, route:routes(status, planned_arrival)")
        .order("created_at", { ascending: false })
        .returns<ShipmentRow[]>()
    : { data: null };

  const activeRoute = shipments?.find((s) => s.route)?.route;

  return (
    <AppShell subtitle="Here is your incoming supply activity today." searchPlaceholder="Search produce, suppliers, or requirements...">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle>Open requirement</CardTitle>
              <CardDescription>{requirement ? requirement.commodities?.name : "Nothing open"}</CardDescription>
            </div>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#dce6d5] bg-[#f1f5ed] text-[#50764e]"><ClipboardList size={18} /></span>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{kg(confirmedKg)}</p>
            <p className="mt-1 text-sm text-[#66766f]">
              {requirement ? `Confirmed of ${kg(requiredKg)} · ${kg(remainingKg)} still needed` : "Create a requirement to get started."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle>Incoming delivery</CardTitle>
              <CardDescription>{shipments?.length ? `${shipments.length} shipment${shipments.length > 1 ? "s" : ""}` : "None yet"}</CardDescription>
            </div>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#dce6d5] bg-[#f1f5ed] text-[#50764e]"><Truck size={18} /></span>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#66766f]">
              {activeRoute?.planned_arrival
                ? `ETA ${new Date(activeRoute.planned_arrival).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Manila" })}`
                : "Awaiting route confirmation."}
            </p>
          </CardContent>
          {activeRoute?.status ? <CardFooter><Badge>{activeRoute.status}</Badge></CardFooter> : null}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supplier breakdown</CardTitle>
            <CardDescription>By contribution, not identity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {shipments?.length ? (
              shipments.map((s, i) => (
                <div key={s.id} className="flex items-baseline justify-between text-sm">
                  <span className="font-medium text-[#20312c]">Farm {String.fromCharCode(65 + i)}</span>
                  <span className="text-[#66766f]">{kg(s.quantity_kg)}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#66766f]">Supplier names aren&apos;t shown before allocation.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div><CardTitle>Receive delivery</CardTitle><CardDescription>Confirm on arrival</CardDescription></div>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#dce6d5] bg-[#f1f5ed] text-[#50764e]"><CircleCheckBig size={18} /></span>
          </CardHeader>
          <CardContent><p className="text-sm text-[#66766f]">Quantity, condition, and time received.</p></CardContent>
          <CardFooter><Badge variant="outline">Available once a truck arrives</Badge></CardFooter>
        </Card>
      </div>
    </AppShell>
  );
}