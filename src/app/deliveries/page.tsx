import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Page() {
  return (
    <AppShell title="Deliveries" eyebrow="Direct B2B delivery">
      <Card>
        <CardHeader><h2 className="text-lg font-bold">Foundation module</h2></CardHeader>
        <CardContent><p className="max-w-3xl leading-7 text-[#66766f]">The MVP delivers the consolidated load directly to the buyer or market. Consumer last-mile delivery is out of scope.</p></CardContent>
      </Card>
    </AppShell>
  );
}
