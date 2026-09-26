// src/app/farmer/page.tsx
import { Sprout, ClipboardList, Route } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function FarmerHomePage() {
  return (
    <AppShell title="Home" eyebrow="Farmer">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div><CardTitle>Available produce</CardTitle><CardDescription>Tomatoes</CardDescription></div>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#dce6d5] bg-[#f1f5ed] text-[#50764e]"><Sprout size={18} /></span>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">320 kg</p><p className="mt-1 text-sm text-[#66766f]">Harvest ready tomorrow</p></CardContent>
          <CardFooter><span className="text-xs text-[#66766f]">Update quantity or mark unavailable</span></CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div><CardTitle>Matching buyer request</CardTitle><CardDescription>500 kg tomatoes needed</CardDescription></div>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#dce6d5] bg-[#f1f5ed] text-[#50764e]"><ClipboardList size={18} /></span>
          </CardHeader>
          <CardContent><p className="text-sm text-[#66766f]">Your farm can supply 320 kg. Delivery Friday before 5 AM.</p></CardContent>
          <CardFooter><Badge variant="success">Offer supply</Badge></CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div><CardTitle>Upcoming pickup</CardTitle><CardDescription>Tomorrow, 3:30 AM</CardDescription></div>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#dce6d5] bg-[#f1f5ed] text-[#50764e]"><Route size={18} /></span>
          </CardHeader>
          <CardContent><p className="text-sm text-[#66766f]">Collection Point A</p></CardContent>
          <CardFooter><Badge>Route confirmed</Badge></CardFooter>
        </Card>
      </div>
    </AppShell>
  );
}