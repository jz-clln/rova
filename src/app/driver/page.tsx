// src/app/driver/page.tsx
import { Route, PackageOpen } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DriverHomePage() {
  return (
    <AppShell title="Today" eyebrow="Driver">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div><CardTitle>Route for Today</CardTitle><CardDescription>4 pickups &middot; 1 destination</CardDescription></div>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#dce6d5] bg-[#f1f5ed] text-[#50764e]"><Route size={18} /></span>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">1,850 / 2,000 kg</p><p className="mt-1 text-sm text-[#66766f]">Delivery deadline: 5:00 AM</p></CardContent>
          <CardFooter><Button>Start route</Button></CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div><CardTitle>Pickup 1</CardTitle><CardDescription>Green Valley Farm</CardDescription></div>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#dce6d5] bg-[#f1f5ed] text-[#50764e]"><PackageOpen size={18} /></span>
          </CardHeader>
          <CardContent><p className="text-sm text-[#66766f]">450 kg tomatoes &middot; window 2:30 AM to 2:45 AM</p></CardContent>
          <CardFooter><Button variant="secondary">Navigate</Button></CardFooter>
        </Card>
      </div>
    </AppShell>
  );
}