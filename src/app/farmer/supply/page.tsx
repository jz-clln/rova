// src/app/farmer/supply/page.tsx
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Page() {
  return (
    <AppShell title="My produce" eyebrow="Confirmed supply">
      <Card>
        <CardHeader><CardTitle>Foundation module</CardTitle></CardHeader>
        <CardContent><p className="max-w-3xl leading-7 text-[#66766f]">Capture available quantity, harvest state, pickup mode, pickup window, and product specifications.</p></CardContent>
      </Card>
    </AppShell>
  );
}