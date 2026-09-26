import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Page() {
  return (
    <AppShell title="Routes" eyebrow="Shared freight">
      <Card>
        <CardHeader><h2 className="text-lg font-bold">Foundation module</h2></CardHeader>
        <CardContent><p className="max-w-3xl leading-7 text-[#66766f]">Combine compatible supply into a route only when capacity, time, detour, and destination economics make sense.</p></CardContent>
      </Card>
    </AppShell>
  );
}
