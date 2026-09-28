// src/app/operator/trucks/page.tsx
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Page() {
  return (
    <AppShell subtitle="Trucks ? Your fleet">
      <Card>
        <CardHeader><CardTitle>Foundation module</CardTitle></CardHeader>
        <CardContent><p className="max-w-3xl leading-7 text-[#66766f]">Manage your own vehicles, drivers, capacity, verification status, and route assignments.</p></CardContent>
      </Card>
    </AppShell>
  );
}