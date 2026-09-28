// src/app/buyer/requirements/new/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { manilaToday } from "@/lib/format";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { RequirementForm } from "./requirement-form";

export default async function NewRequirementPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/sign-in");

  const supabase = await createClient();
  const { data: commodities } = await supabase
    .from("commodities")
    .select("id, name")
    .order("name")
    .returns<{ id: string; name: string }[]>();

  return (
    <AppShell subtitle="Tell us what your business needs." searchPlaceholder="Search produce, suppliers, or requirements...">
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>New requirement</CardTitle>
          <CardDescription>
            Save a draft to finish later, or publish it so farmers can see what you need. Farmers see the produce,
            quantity, date and address, but not your business name or phone number.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RequirementForm
            commodities={commodities ?? []}
            today={manilaToday()}
            defaults={{
              receiver_name: profile.business_name || profile.full_name,
              receiver_phone: profile.phone ?? "",
            }}
          />
        </CardContent>
      </Card>
    </AppShell>
  );
}