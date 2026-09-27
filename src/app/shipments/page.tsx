// src/app/shipments/page.tsx
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Page() {
  return (
    <AppShell title="Farm supply" eyebrow="Confirmed supply">
      <Card>
        <CardHeader><h2 className="text-lg font-bold">Foundation module</h2></CardHeader>
        <CardContent><p className="max-w-3xl leading-7 text-[#66766f]">Capture available quantity, harvest state, pickup mode, pickup window, and product specifications.</p></CardContent>
      </Card>
    </AppShell>
  );
}
