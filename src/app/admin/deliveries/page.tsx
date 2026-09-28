// src/app/admin/deliveries/page.tsx
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Page() {
  return (
    <AppShell subtitle="Deliveries ? Direct B2B delivery">
      <Card>
        <CardHeader><CardTitle>Foundation module</CardTitle></CardHeader>
        <CardContent><p className="max-w-3xl leading-7 text-[#66766f]">The MVP delivers the consolidated load directly to the buyer or market. Consumer last-mile delivery is out of scope.</p></CardContent>
      </Card>
    </AppShell>
  );
}