// src/app/buyer/page.tsx
import { ClipboardList, Truck, CircleCheckBig } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function BuyerHomePage() {
  return (
    <AppShell title="Home" eyebrow="Buyer">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div><CardTitle>Open requirement</CardTitle><CardDescription>Tomatoes &middot; 1,000 kg requested</CardDescription></div>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#dce6d5] bg-[#f1f5ed] text-[#50764e]"><ClipboardList size={18} /></span>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">750 kg</p><p className="mt-1 text-sm text-[#66766f]">Confirmed &middot; 250 kg still needed</p></CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div><CardTitle>Incoming delivery</CardTitle><CardDescription>1 shared truck &middot; 3 farms</CardDescription></div>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#dce6d5] bg-[#f1f5ed] text-[#50764e]"><Truck size={18} /></span>
          </CardHeader>
          <CardContent><p className="text-sm text-[#66766f]">1,000 kg &middot; ETA 4:35 AM</p></CardContent>
          <CardFooter><span className="text-xs text-[#66766f]">Must arrive before 5:00 AM</span></CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div><CardTitle>Receive delivery</CardTitle><CardDescription>Confirm on arrival</CardDescription></div>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#dce6d5] bg-[#f1f5ed] text-[#50764e]"><CircleCheckBig size={18} /></span>
          </CardHeader>
          <CardContent><p className="text-sm text-[#66766f]">Quantity, condition, and time received</p></CardContent>
          <CardFooter><Badge variant="outline">Awaiting arrival</Badge></CardFooter>
        </Card>
      </div>
    </AppShell>
  );
}