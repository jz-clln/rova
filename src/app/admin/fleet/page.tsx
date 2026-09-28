// src/app/admin/fleet/page.tsx
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Page() {
  return (
    <AppShell subtitle="Fleet ? Network-wide, authorized carriers">
      <Card>
        <CardHeader><CardTitle>Foundation module</CardTitle></CardHeader>
        <CardContent><p className="max-w-3xl leading-7 text-[#66766f]">Manage operators, drivers, vehicles, capacity, verification status, and route assignments across every truck operator on the network.</p></CardContent>
      </Card>
    </AppShell>
  );
}