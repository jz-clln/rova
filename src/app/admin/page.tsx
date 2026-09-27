// src/app/admin/page.tsx
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Page() {
  return (
    <AppShell title="Operations" eyebrow="Manual oversight">
      <Card>
        <CardHeader><h2 className="text-lg font-bold">Foundation module</h2></CardHeader>
        <CardContent><p className="max-w-3xl leading-7 text-[#66766f]">Early Rova is software-assisted logistics. Admins can intervene in matching, cancellations, route changes, and delivery issues.</p></CardContent>
      </Card>
    </AppShell>
  );
}
