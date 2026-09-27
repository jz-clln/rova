// src/app/requirements/page.tsx
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Page() {
  return (
    <AppShell title="Buyer requirements" eyebrow="Anchor demand first">
      <Card>
        <CardHeader><h2 className="text-lg font-bold">Foundation module</h2></CardHeader>
        <CardContent><p className="max-w-3xl leading-7 text-[#66766f]">Create recurring B2B produce requirements with quantity, destination, receiving window, and delivery deadline.</p></CardContent>
      </Card>
    </AppShell>
  );
}
