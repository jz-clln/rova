// src/app/operator/page.tsx
import { Route, Truck, Wallet } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function OperatorHomePage() {
  return (
    <AppShell title="Overview" eyebrow="Truck Operator">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div><CardTitle>Available route job</CardTitle><CardDescription>Route RVA-1024</CardDescription></div>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#dce6d5] bg-[#f1f5ed] text-[#50764e]"><Route size={18} /></span>
          </CardHeader>
          <CardContent><p className="text-sm text-[#66766f]">1,850 kg &middot; 4 pickups &middot; 118 km to Buyer X</p></CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div><CardTitle>Active trucks</CardTitle><CardDescription>Truck A</CardDescription></div>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#dce6d5] bg-[#f1f5ed] text-[#50764e]"><Truck size={18} /></span>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">92%</p><p className="mt-1 text-sm text-[#66766f]">Utilization &middot; en route</p></CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div><CardTitle>Earnings today</CardTitle><CardDescription>Across active routes</CardDescription></div>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#dce6d5] bg-[#f1f5ed] text-[#50764e]"><Wallet size={18} /></span>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">₱8,500</p></CardContent>
          <CardFooter><Badge>Fleet utilization 78%</Badge></CardFooter>
        </Card>
      </div>
    </AppShell>
  );
}