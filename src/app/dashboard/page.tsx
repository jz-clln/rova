// src/app/dashboard/page.tsx
import { ShoppingBasket, Sprout, Route, PackageCheck, ArrowUpRight } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const stats = [
  { icon: ShoppingBasket, label: "Open requirements", value: "3", note: "Awaiting matched supply" },
  { icon: Sprout, label: "Supply awaiting match", value: "7", note: "From confirmed farms" },
  { icon: Route, label: "Routes today", value: "2", note: "Across active carriers" },
  { icon: PackageCheck, label: "On-time delivery", value: "100%", note: "Last 7 days", badge: "On track" },
];

export default function DashboardPage() {
  return (
    <AppShell title="Dashboard" eyebrow="Rova MVP">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ icon: Icon, label, value, note, badge }) => (
          <Card key={label}>
            <CardHeader className="flex-row items-start justify-between">
              <div>
                <CardDescription>{label}</CardDescription>
                <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
              </div>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#dce6d5] bg-[#f1f5ed] text-[#50764e]">
                <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
              </span>
            </CardHeader>
            <CardFooter className="justify-between">
              <span className="text-xs text-[#66766f]">{note}</span>
              {badge ? <Badge variant="success">{badge}</Badge> : null}
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Foundation focus</CardTitle>
          <CardDescription>What this MVP is deliberately not doing yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="max-w-3xl leading-7 text-[#66766f]">
            The initial product is not a nationwide marketplace. Prove one anchor buyer, one recurring
            destination, one farmer cluster, a small carrier pool, and one successful consolidated route pattern.
          </p>
        </CardContent>
        <CardFooter>
          <a href="/requirements" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1f5a4d] hover:underline">
            View open requirements <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </CardFooter>
      </Card>
    </AppShell>
  );
}