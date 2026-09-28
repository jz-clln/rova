// src/app/profile/page.tsx
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { ProfileForm } from "./profile-form";

const ROLE_LABEL: Record<string, string> = {
  farmer: "Farmer",
  buyer: "Buyer",
  driver: "Driver",
  truck_operator: "Truck Operator",
  admin: "Rova Admin",
};

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/sign-in");

  return (
    <AppShell subtitle="Manage your account details." searchPlaceholder="Search settings...">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Account details</CardTitle>
            <CardDescription>This information is visible to Rova and, where relevant, to your counterparts on a route.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm profile={profile} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Account status</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[#66766f]">Role</span>
              <Badge variant="outline">{ROLE_LABEL[profile.role] ?? profile.role}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#66766f]">Verification</span>
              <Badge variant={profile.verification_status === "verified" ? "success" : "warning"}>
                {profile.verification_status}
              </Badge>
            </div>
            <p className="pt-2 text-xs leading-5 text-[#8a988f]">
              Role and verification status can only be changed by a Rova administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}