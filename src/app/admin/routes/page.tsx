// src/app/admin/routes/page.tsx
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Page() {
  return (
    <AppShell subtitle="Routes ? Shared freight">
      <Card>
        <CardHeader><CardTitle>Foundation module</CardTitle></CardHeader>
        <CardContent><p className="max-w-3xl leading-7 text-[#66766f]">Combine compatible supply into a route only when capacity, time, detour, and destination economics make sense.</p></CardContent>
      </Card>
    </AppShell>
  );
}