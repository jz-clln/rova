// src/app/farmer/page.tsx
import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function kg(value: number | null | undefined) {
  return value == null ? "—" : `${Number(value).toLocaleString()} kg`;
}

function PhotoPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-dashed border-[#cad9ce] bg-[#f1f5ed] text-[#7c9083]">
      <div className="flex flex-col items-center gap-1 text-xs">
        <ImageIcon size={20} aria-hidden="true" />
        {label}
      </div>
    </div>
  );
}

const STEPS = [
  { key: "picked_up", label: "Picked up" },
  { key: "in_transit", label: "In transit" },
  { key: "delivered", label: "Out for delivery" },
] as const;

function ShipmentProgress({ status }: { status: string | null | undefined }) {
  const index = status === "delivered" ? 2 : status === "in_progress" ? 1 : status ? 0 : -1;
  return (
    <div className="flex items-center">
      {STEPS.map((step, i) => (
        <div key={step.key} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <span
              className={`h-2.5 w-2.5 rounded-full ${i <= index ? "bg-[#1f5a4d]" : "bg-[#dce6df]"}`}
              aria-hidden="true"
            />
            <span className="text-[10px] text-[#66766f]">{step.label}</span>
          </div>
          {i < STEPS.length - 1 ? (
            <span className={`mx-1 h-px flex-1 ${i < index ? "bg-[#1f5a4d]" : "bg-[#dce6df]"}`} aria-hidden="true" />
          ) : null}
        </div>
      ))}
    </div>
  );
}

interface SupplyRow {
  id: string;
  confirmed_quantity_kg: number | null;
  expected_quantity_kg: number | null;
  harvest_date: string;
  status: string;
  commodities: { name: string } | null;
}

interface ShipmentRow {
  id: string;
  quantity_kg: number;
  created_at: string;
  route: { status: string; planned_arrival: string | null; destination_address: string } | null;
}

export default async function FarmerHomePage() {
  const supabase = await createClient();

  const [{ data: supply }, { data: matches }, { data: pickups }, { data: shipments }, { data: payments }, { data: notifications }] =
    await Promise.all([
      supabase
        .from("farmer_supply")
        .select("id, confirmed_quantity_kg, expected_quantity_kg, harvest_date, status, commodities(name)")
        .order("harvest_date", { ascending: true })
        .limit(6)
        .returns<SupplyRow[]>(),
      supabase
        .from("open_requirement_summary")
        .select("id, commodity_name, required_quantity_kg, delivery_date")
        .order("delivery_date", { ascending: true })
        .limit(1),
      supabase
        .from("route_stops")
        .select("id, address, planned_at, status")
        .in("stop_type", ["pickup", "collection_point"])
        .order("planned_at", { ascending: true })
        .limit(1),
      supabase
        .from("shipments")
        .select("id, quantity_kg, created_at, route:routes(status, planned_arrival, destination_address)")
        .order("created_at", { ascending: false })
        .limit(5)
        .returns<ShipmentRow[]>(),
      supabase
        .from("payments")
        .select("id, amount_php, created_at")
        .order("created_at", { ascending: false })
        .limit(1),
      supabase
        .from("notifications")
        .select("id, title, body, created_at, read_at")
        .order("created_at", { ascending: false })
        .limit(4),
    ]);

  const topMatch = matches?.[0];
  const nextPickup = pickups?.[0];
  const currentShipment = shipments?.[0];
  const payment = payments?.[0];

  return (
    <AppShell subtitle="Here is your farm activity today." searchPlaceholder="Search buyer requests, shipments, or produce...">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Available produce</CardTitle>
            <Link href="/farmer/supply" className="text-xs font-semibold text-[#1f5a4d] hover:underline">View all</Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {supply?.length ? (
              supply.slice(0, 3).map((row) => (
                <div key={row.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#20312c]">{row.commodities?.name ?? "Commodity"}</p>
                    <p className="text-xs text-[#66766f]">{kg(row.confirmed_quantity_kg ?? row.expected_quantity_kg)}</p>
                  </div>
                  <Badge variant="success">Ready to supply</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#66766f]">Add what you have available so buyers can match with it.</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Matching buyer request</CardTitle>
            {topMatch ? <Badge variant="warning">New</Badge> : null}
          </CardHeader>
          <CardContent>
            {topMatch ? (
              <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="text-lg font-semibold text-[#20312c]">
                    A buyer needs {kg(topMatch.required_quantity_kg)} {topMatch.commodity_name}
                  </p>
                  <p className="mt-1 text-sm text-[#66766f]">
                    Delivery by {new Date(topMatch.delivery_date).toLocaleDateString()}
                  </p>
                </div>
                <PhotoPlaceholder label="Produce photo" />
              </div>
            ) : (
              <p className="text-sm text-[#66766f]">Check back once a buyer posts a matching requirement.</p>
            )}
          </CardContent>
          {topMatch ? <CardFooter><Button>Offer supply</Button></CardFooter> : null}
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Upcoming pickup</CardTitle>
            <Link href="/farmer/pickups" className="text-xs font-semibold text-[#1f5a4d] hover:underline">View all</Link>
          </CardHeader>
          <CardContent>
            {nextPickup ? (
              <>
                <p className="text-sm font-medium text-[#20312c]">{nextPickup.address}</p>
                <p className="mt-1 text-sm text-[#66766f]">
                  {nextPickup.planned_at ? new Date(nextPickup.planned_at).toLocaleString() : "Time to be confirmed"}
                </p>
              </>
            ) : (
              <p className="text-sm text-[#66766f]">Scheduled once a route is confirmed.</p>
            )}
          </CardContent>
          {nextPickup ? <CardFooter><Badge>{nextPickup.status}</Badge></CardFooter> : null}
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Current shipment</CardTitle>
            <Link href="/farmer/shipments" className="text-xs font-semibold text-[#1f5a4d] hover:underline">View details</Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentShipment ? (
              <>
                <div className="flex items-baseline justify-between">
                  <p className="text-sm text-[#66766f]">To {currentShipment.route?.destination_address ?? "destination"}</p>
                  <p className="text-lg font-semibold text-[#20312c]">{kg(currentShipment.quantity_kg)}</p>
                </div>
                <ShipmentProgress status={currentShipment.route?.status} />
                <p className="text-xs text-[#66766f]">
                  {currentShipment.route?.planned_arrival
                    ? `Estimated arrival ${new Date(currentShipment.route.planned_arrival).toLocaleString()}`
                    : "Estimated arrival not yet set"}
                </p>
              </>
            ) : (
              <p className="text-sm text-[#66766f]">Nothing moving yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Expected payment</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{payment ? `₱${Number(payment.amount_php).toLocaleString()}` : "—"}</p>
            <p className="mt-1 text-sm text-[#66766f]">
              {payment ? new Date(payment.created_at).toLocaleDateString() : "No payments yet"}
            </p>
          </CardContent>
          {payment ? <CardFooter><Badge variant="info">Processing</Badge></CardFooter> : null}
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>My produce</CardTitle>
          <Link href="/farmer/supply" className="text-xs font-semibold text-[#1f5a4d] hover:underline">Manage produce</Link>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-120 text-left text-sm">
            <thead>
              <tr className="border-b border-[#e5ebe0] text-xs uppercase tracking-wide text-[#8a988f]">
                <th className="pb-2 font-medium">Product</th>
                <th className="pb-2 font-medium">Quantity</th>
                <th className="pb-2 font-medium">Harvest date</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {supply?.length ? (
                supply.map((row) => (
                  <tr key={row.id} className="border-b border-[#f1f5ed] last:border-0">
                    <td className="py-2.5">{row.commodities?.name ?? "Commodity"}</td>
                    <td className="py-2.5 text-[#66766f]">{kg(row.confirmed_quantity_kg ?? row.expected_quantity_kg)}</td>
                    <td className="py-2.5 text-[#66766f]">{new Date(row.harvest_date).toLocaleDateString()}</td>
                    <td className="py-2.5"><Badge variant={row.status === "confirmed" ? "success" : "outline"}>{row.status}</Badge></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="py-4 text-[#66766f]">Nothing listed yet.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent shipment activity</CardTitle>
            <Link href="/farmer/shipments" className="text-xs font-semibold text-[#1f5a4d] hover:underline">View all shipments</Link>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-130 text-left text-sm">
              <thead>
                <tr className="border-b border-[#e5ebe0] text-xs uppercase tracking-wide text-[#8a988f]">
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Quantity</th>
                  <th className="pb-2 font-medium">Destination</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {shipments?.length ? (
                  shipments.map((row) => (
                    <tr key={row.id} className="border-b border-[#f1f5ed] last:border-0">
                      <td className="py-2.5">{new Date(row.created_at).toLocaleDateString()}</td>
                      <td className="py-2.5 text-[#66766f]">{kg(row.quantity_kg)}</td>
                      <td className="py-2.5 text-[#66766f]">{row.route?.destination_address ?? "—"}</td>
                      <td className="py-2.5"><Badge variant={row.route?.status === "delivered" ? "success" : "info"}>{row.route?.status ?? "unassigned"}</Badge></td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="py-4 text-[#66766f]">No shipment activity yet.</td></tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Notifications</CardTitle>
            <span className="text-xs font-semibold text-[#1f5a4d]">View all</span>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications?.length ? (
              notifications.map((n) => (
                <div key={n.id} className="flex items-start gap-2">
                  {!n.read_at ? <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c97a6b]" aria-hidden="true" /> : <span className="mt-1.5 h-1.5 w-1.5 shrink-0" />}
                  <div>
                    <p className="text-sm font-medium text-[#20312c]">{n.title}</p>
                    <p className="text-xs text-[#66766f]">{n.body}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#66766f]">Nothing new.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}