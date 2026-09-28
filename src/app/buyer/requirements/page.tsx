// src/app/buyer/requirements/page.tsx
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { kg, formatDate, formatTime } from "@/lib/format";
import { requirementStatusBadge } from "@/lib/status";
import { publishRequirement } from "./actions";
import { CancelRequirementButton } from "./cancel-button";
import type { RequirementStatus } from "@/types";

interface RequirementRow {
  id: string;
  required_quantity_kg: number;
  delivery_date: string;
  receiving_window_end: string;
  status: RequirementStatus;
  commodities: { name: string } | null;
}

interface AllocationRow {
  requirement_id: string;
  allocated_quantity_kg: number;
}

const NOTICES = {
  draft: "Draft saved. Publish it when you're ready for farmers to see it.",
  open: "Requirement published. Farmers can now see it.",
  cancelled: "Requirement cancelled.",
} as const;

const ERRORS = {
  publish: "We couldn't publish that requirement. It may have already changed.",
  cancel: "We couldn't cancel that requirement. It may have already changed.",
} as const;

export default async function RequirementsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { saved, error } = await searchParams;
  const notice = saved === "draft" || saved === "open" || saved === "cancelled" ? NOTICES[saved] : undefined;
  const failure = error === "publish" || error === "cancel" ? ERRORS[error] : undefined;

  const supabase = await createClient();
  const { data: requirements } = await supabase
    .from("buyer_requirements")
    .select("id, required_quantity_kg, delivery_date, receiving_window_end, status, commodities(name)")
    .order("created_at", { ascending: false })
    .returns<RequirementRow[]>();

  const ids = requirements?.map((r) => r.id) ?? [];
  const { data: allocations } = ids.length
    ? await supabase
        .from("allocations")
        .select("requirement_id, allocated_quantity_kg")
        .in("requirement_id", ids)
        .returns<AllocationRow[]>()
    : { data: [] as AllocationRow[] };

  const confirmedById = new Map<string, number>();
  for (const a of allocations ?? []) {
    confirmedById.set(a.requirement_id, (confirmedById.get(a.requirement_id) ?? 0) + Number(a.allocated_quantity_kg));
  }

  return (
    <AppShell subtitle="Everything you've asked for, and how much is covered." searchPlaceholder="Search produce, suppliers, or requirements...">
      {notice ? (
        <p role="status" className="mb-4 rounded-xl border border-[#dce6df] bg-[#f1f5ed] p-3 text-sm text-[#3f6b52]">{notice}</p>
      ) : null}
      {failure ? (
        <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{failure}</p>
      ) : null}

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>My requirements</CardTitle>
            <CardDescription>Publish a draft to make it visible to farmers.</CardDescription>
          </div>
          <LinkButton href="/buyer/requirements/new">New requirement</LinkButton>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-160 text-left text-sm">
            <thead>
              <tr className="border-b border-[#e5ebe0] text-xs uppercase tracking-wide text-[#8a988f]">
                <th className="pb-2 font-medium">Product</th>
                <th className="pb-2 font-medium">Requested</th>
                <th className="pb-2 font-medium">Confirmed</th>
                <th className="pb-2 font-medium">Remaining</th>
                <th className="pb-2 font-medium">Receive by</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {requirements?.length ? (
                requirements.map((r) => {
                  const required = Number(r.required_quantity_kg);
                  const confirmed = confirmedById.get(r.id) ?? 0;
                  const remaining = Math.max(required - confirmed, 0);
                  const badge = requirementStatusBadge(r.status, required, confirmed);
                  return (
                    <tr key={r.id} className="border-b border-[#f1f5ed] last:border-0">
                      <td className="py-2.5 font-medium text-[#20312c]">{r.commodities?.name ?? "Produce"}</td>
                      <td className="py-2.5 text-[#66766f]">{kg(required)}</td>
                      <td className="py-2.5 text-[#66766f]">{kg(confirmed)}</td>
                      <td className={`py-2.5 ${remaining > 0 ? "text-[#b5533f]" : "text-[#66766f]"}`}>{kg(remaining)}</td>
                      <td className="py-2.5 text-[#66766f]">
                        {formatDate(r.receiving_window_end)}, {formatTime(r.receiving_window_end)}
                      </td>
                      <td className="py-2.5"><Badge variant={badge.variant}>{badge.label}</Badge></td>
                      <td className="py-2.5">
                        <div className="flex items-center justify-end gap-3">
                          {r.status === "draft" ? (
                            <form action={publishRequirement}>
                              <input type="hidden" name="id" value={r.id} />
                              <button type="submit" className="text-xs font-semibold text-[#1f5a4d] hover:underline">
                                Publish
                              </button>
                            </form>
                          ) : null}
                          {r.status === "draft" || r.status === "open" || r.status === "matching" ? (
                            <CancelRequirementButton id={r.id} />
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-[#66766f]">
                    You haven&apos;t posted a requirement yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </AppShell>
  );
}