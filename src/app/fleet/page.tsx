import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Page() {
  return (
    <AppShell title="Fleet" eyebrow="Authorized carriers">
      <Card>
        <CardHeader><h2 className="text-lg font-bold">Foundation module</h2></CardHeader>
        <CardContent><p className="max-w-3xl leading-7 text-[#66766f]">Manage operators, drivers, vehicles, capacity, verification status, and route assignments.</p></CardContent>
      </Card>
    </AppShell>
  );
}
