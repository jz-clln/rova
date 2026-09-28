// src/app/buyer/page.tsx
import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { cn } from "@/lib/utils";
import { kg, formatDate, formatTime, manilaToday } from "@/lib/format";
import { requirementProgress, requirementStatusBadge, routeStatusBadge } from "@/lib/status";
import type { RequirementStatus, RouteStatus } from "@/types";

interface RequirementRow {
  id: string;
  required_quantity_kg: number;
  delivery_date: string;
  receiving_window_start: string;
  receiving_window_end: string;
  status: RequirementStatus;
  commodities: { name: string } | null;
}

interface AllocationRow {
  requirement_id: string;
  allocated_quantity_kg: number;
}

interface RouteRow {
  id: string;
  status: RouteStatus;
  planned_arrival: string | null;
  total_load_kg: number;
  created_at: string;
  shipments: { count: number }[];
}

interface NotificationRow {
  id: string;
  title: string;
  body: string;
  created_at: string;
  read_at: string | null;
}

function PhotoPlaceholder({ label, className }: { label: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex aspect-video w-full items-center justify-center rounded-xl border border-dashed border-[#cad9ce] bg-[#f1f5ed] text-[#7c9083]",
        className
      )}
    >
      <div className="flex flex-col items-center gap-1 text-xs">
        <ImageIcon size={20} aria-hidden="true" />
        {label}
      </div>
    </div>
  );
}

function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center" role="list" aria-label="Delivery progress">
      {steps.map((label, i) => (
        <div key={label} role="listitem" className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <span
              className={cn("h-2.5 w-2.5 rounded-full", i <= current ? "bg-[#1f5a4d]" : "bg-[#dce6df]")}
              aria-hidden="true"
            />
            <span className="text-[10px] text-[#66766f]">{label}</span>
          </div>
          {i < steps.length - 1 ? (
            <span className={cn("mx-1 h-px flex-1", i < current ? "bg-[#1f5a4d]" : "bg-[#dce6df]")} aria-hidden="true" />
          ) : null}
        </div>
      ))}
    </div>
  );
}

const ACTIVE_ROUTE_STATUSES: RouteStatus[] = ["offered", "confirmed", "in_progress"];

export default async function BuyerHomePage() {
  const supabase = await createClient();
  const today = manilaToday();

  const [{ data: requirements }, { data: routes }, { data: notifications }] = await Promise.all([
    supabase
      .from("buyer_requirements")
      .select("id, required_quantity_kg, delivery_date, receiving_window_start, receiving_window_end, status, commodities(name)")
      .gte("delivery_date", today)
      .neq("status", "cancelled")
      .order("delivery_date", { ascending: true })
      .limit(20)
      .returns<RequirementRow[]>(),
    supabase
      .from("routes")
      .select("id, status, planned_arrival, total_load_kg, created_at, shipments(count)")
      .order("created_at", { ascending: false })
      .limit(10)
      .returns<RouteRow[]>(),
    supabase
      .from("notifications")
      .select("id, title, body, created_at, read_at")
      .order("created_at", { ascending: false })
      .limit(4)
      .returns<NotificationRow[]>(),
  ]);

  const requirementList = requirements ?? [];
  const requirementIds = requirementList.map((r) => r.id);

  const { data: allocations } = requirementIds.length
    ? await supabase
        .from("allocations")
        .select("requirement_id, allocated_quantity_kg")
        .in("requirement_id", requirementIds)
        .order("created_at", { ascending: true })
        .returns<AllocationRow[]>()
    : { data: [] as AllocationRow[] };

  const confirmedById = new Map<string, number>();
  for (const a of allocations ?? []) {
    confirmedById.set(a.requirement_id, (confirmedById.get(a.requirement_id) ?? 0) + Number(a.allocated_quantity_kg));
  }

  // Open requirement
  const featured = requirementList.find((r) => r.status === "open" || r.status === "matching");
  const featuredRequired = Number(featured?.required_quantity_kg ?? 0);
  const featuredConfirmed = featured ? confirmedById.get(featured.id) ?? 0 : 0;
  const featuredStillNeeded = Math.max(featuredRequired - featuredConfirmed, 0);
  const featuredProgress = requirementProgress(featuredRequired, featuredConfirmed);
  const featuredAllocations = featured ? (allocations ?? []).filter((a) => a.requirement_id === featured.id) : [];

  // Incoming delivery
  const routeList = routes ?? [];
  const activeRoutes = routeList
    .filter((r) => ACTIVE_ROUTE_STATUSES.includes(r.status))
    .sort((a, b) => (a.planned_arrival ?? "9999").localeCompare(b.planned_arrival ?? "9999"));
  const nextRoute = activeRoutes[0];
  const nextRouteBadge = nextRoute ? routeStatusBadge(nextRoute.status) : null;
  const nextRouteFarms = nextRoute?.shipments?.[0]?.count ?? 0;
  const deliveryStep = nextRoute?.status === "in_progress" ? 1 : 0;
  const arriving = activeRoutes.find((r) => r.status === "in_progress");

  // Today's receiving schedule
  const receivingToday = requirementList.filter((r) => r.delivery_date === today && r.status !== "draft");

  return (
    <AppShell subtitle="Here is your incoming supply activity today." searchPlaceholder="Search produce, suppliers, or requirements...">
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Open requirement */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Open requirement</CardTitle>
            <Link href="/buyer/requirements" className="text-xs font-semibold text-[#1f5a4d] hover:underline">View all</Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {featured ? (
              <>
                <div className="flex items-start gap-4">
                  <PhotoPlaceholder label="Photo" className="aspect-square w-20 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-lg font-semibold text-[#20312c]">{featured.commodities?.name ?? "Produce"}</p>
                    <p className="mt-1 text-xs text-[#66766f]">Required quantity</p>
                    <p className="text-2xl font-bold">{kg(featuredRequired)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-[#66766f]">Confirmed</p>
                    <p className="text-lg font-semibold text-[#3f7350]">{kg(featuredConfirmed)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#66766f]">Still needed</p>
                    <p className="text-lg font-semibold text-[#b5533f]">{kg(featuredStillNeeded)}</p>
                  </div>
                </div>
                <div>
                  <div
                    role="progressbar"
                    aria-label="Requirement fulfilled"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={featuredProgress}
                    className="h-2 w-full overflow-hidden rounded-full bg-[#e5ebe0]"
                  >
                    <div className="h-full rounded-full bg-[#6ba67b]" style={{ width: `${featuredProgress}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-[#66766f]">
                    {featuredProgress}% fulfilled · Required before {formatTime(featured.receiving_window_end)},{" "}
                    {formatDate(featured.receiving_window_end)}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm text-[#66766f]">
                Nothing open right now. Post what your business needs and farmers will be able to match it.
              </p>
            )}
          </CardContent>
          <CardFooter>
            {featured ? (
              <LinkButton href="/buyer/requirements">Review supply</LinkButton>
            ) : (
              <LinkButton href="/buyer/requirements/new">Create requirement</LinkButton>
            )}
          </CardFooter>
        </Card>

        {/* Incoming delivery */}
        <Card>
          <CardHeader><CardTitle>Incoming delivery</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {nextRoute && nextRouteBadge ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-semibold text-[#20312c]">
                    1 truck · {nextRouteFarms} {nextRouteFarms === 1 ? "farm" : "farms"}
                  </p>
                  <Badge variant={nextRouteBadge.variant}>{nextRouteBadge.label}</Badge>
                </div>
                <PhotoPlaceholder label="Truck photo" />
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-[#66766f]">Load</dt>
                    <dd className="font-semibold text-[#20312c]">{kg(nextRoute.total_load_kg)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[#66766f]">ETA</dt>
                    <dd className="font-semibold text-[#20312c]">
                      {nextRoute.planned_arrival
                        ? `${formatTime(nextRoute.planned_arrival)}, ${formatDate(nextRoute.planned_arrival)}`
                        : "To be confirmed"}
                    </dd>
                  </div>
                </dl>
                <Stepper steps={["Scheduled", "On the way", "Delivered"]} current={deliveryStep} />
              </>
            ) : (
              <p className="text-sm text-[#66766f]">No delivery is on the way yet. It will appear here once a route is planned for your requirement.</p>
            )}
          </CardContent>
        </Card>

        {/* Today's receiving schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s receiving schedule</CardTitle>
            <CardDescription>Deliveries due today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {receivingToday.length ? (
              receivingToday.map((r) => {
                const required = Number(r.required_quantity_kg);
                const badge = requirementStatusBadge(r.status, required, confirmedById.get(r.id) ?? 0);
                return (
                  <div key={r.id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-[#66766f]">
                        {formatTime(r.receiving_window_start)} – {formatTime(r.receiving_window_end)}
                      </p>
                      <p className="text-sm font-medium text-[#20312c]">
                        {r.commodities?.name ?? "Produce"} · {kg(required)}
                      </p>
                    </div>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-[#66766f]">Nothing is due today.</p>
            )}
          </CardContent>
        </Card>

        {/* Supplier breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Supplier breakdown</CardTitle>
            <CardDescription>Shown by contribution, not by name</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {featuredAllocations.length ? (
              featuredAllocations.map((a, i) => {
                const amount = Number(a.allocated_quantity_kg);
                const share = featuredConfirmed > 0 ? Math.round((amount / featuredConfirmed) * 100) : 0;
                return (
                  <div key={`${a.requirement_id}-${i}`} className="flex items-baseline justify-between text-sm">
                    <span className="font-medium text-[#20312c]">Farm {String.fromCharCode(65 + (i % 26))}</span>
                    <span className="text-[#66766f]">{kg(amount)} · {share}%</span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-[#66766f]">Supply appears here once farmers are matched to your requirement.</p>
            )}
          </CardContent>
        </Card>

        {/* Receive delivery */}
        <Card>
          <CardHeader>
            <CardTitle>Receive delivery</CardTitle>
            <CardDescription>Confirm what arrived</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Receipt confirmation needs its own migration: buyers can't insert delivery_confirmations yet. */}
            <p className="text-sm text-[#66766f]">
              {arriving
                ? `Expected ${kg(arriving.total_load_kg)} · ETA ${formatTime(arriving.planned_arrival)}`
                : "No delivery is on the way right now."}
            </p>
          </CardContent>
          <CardFooter className="gap-3">
            <Button disabled>Confirm receipt</Button>
            <span className="text-xs text-[#66766f]">Opens when your truck arrives.</span>
          </CardFooter>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {notifications?.length ? (
              notifications.map((n) => (
                <div key={n.id} className="flex items-start gap-2">
                  {!n.read_at ? (
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c97a6b]" aria-hidden="true" />
                  ) : (
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0" />
                  )}
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

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* My requirements */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>My requirements</CardTitle>
            <Link href="/buyer/requirements" className="text-xs font-semibold text-[#1f5a4d] hover:underline">View all requirements</Link>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-120 text-left text-sm">
              <thead>
                <tr className="border-b border-[#e5ebe0] text-xs uppercase tracking-wide text-[#8a988f]">
                  <th className="pb-2 font-medium">Product</th>
                  <th className="pb-2 font-medium">Requested</th>
                  <th className="pb-2 font-medium">Confirmed</th>
                  <th className="pb-2 font-medium">Remaining</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {requirementList.length ? (
                  requirementList.slice(0, 5).map((r) => {
                    const required = Number(r.required_quantity_kg);
                    const confirmed = confirmedById.get(r.id) ?? 0;
                    const remaining = Math.max(required - confirmed, 0);
                    const badge = requirementStatusBadge(r.status, required, confirmed);
                    return (
                      <tr key={r.id} className="border-b border-[#f1f5ed] last:border-0">
                        <td className="py-2.5">{r.commodities?.name ?? "Produce"}</td>
                        <td className="py-2.5 text-[#66766f]">{kg(required)}</td>
                        <td className="py-2.5 text-[#66766f]">{kg(confirmed)}</td>
                        <td className={`py-2.5 ${remaining > 0 ? "text-[#b5533f]" : "text-[#66766f]"}`}>{kg(remaining)}</td>
                        <td className="py-2.5"><Badge variant={badge.variant}>{badge.label}</Badge></td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan={5} className="py-4 text-[#66766f]">No upcoming requirements.</td></tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Incoming delivery activity */}
        <Card>
          <CardHeader><CardTitle>Incoming delivery activity</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-120 text-left text-sm">
              <thead>
                <tr className="border-b border-[#e5ebe0] text-xs uppercase tracking-wide text-[#8a988f]">
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Route</th>
                  <th className="pb-2 font-medium">Load</th>
                  <th className="pb-2 font-medium">Farms</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {routeList.length ? (
                  routeList.slice(0, 5).map((r) => {
                    const badge = routeStatusBadge(r.status);
                    return (
                      <tr key={r.id} className="border-b border-[#f1f5ed] last:border-0">
                        <td className="py-2.5">{formatDate(r.planned_arrival ?? r.created_at)}</td>
                        <td className="py-2.5 text-[#66766f]">#{r.id.slice(0, 6).toUpperCase()}</td>
                        <td className="py-2.5 text-[#66766f]">{kg(r.total_load_kg)}</td>
                        <td className="py-2.5 text-[#66766f]">{r.shipments?.[0]?.count ?? 0}</td>
                        <td className="py-2.5"><Badge variant={badge.variant}>{badge.label}</Badge></td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan={5} className="py-4 text-[#66766f]">No deliveries yet.</td></tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}