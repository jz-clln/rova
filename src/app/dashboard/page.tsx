import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const stats = [
  ["Open requirements", "3"],
  ["Supply awaiting match", "7"],
  ["Routes today", "2"],
  ["On-time delivery", "100%"],
];

export default function DashboardPage() {
  return (
    <AppShell title="Dashboard" eyebrow="Rova MVP">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value]) => <Card key={label}><CardHeader><p className="text-sm text-[#66766f]">{label}</p></CardHeader><CardContent><p className="text-3xl font-bold">{value}</p></CardContent></Card>)}
      </div>
      <Card className="mt-6">
        <CardHeader><h2 className="text-lg font-bold">Foundation focus</h2></CardHeader>
        <CardContent><p className="max-w-3xl leading-7 text-[#66766f]">The initial product is not a nationwide marketplace. Prove one anchor buyer, one recurring destination, one farmer cluster, a small carrier pool, and one successful consolidated route pattern.</p></CardContent>
      </Card>
    </AppShell>
  );
}
