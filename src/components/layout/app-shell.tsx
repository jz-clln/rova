// src/components/layout/app-shell.tsx
import { redirect } from "next/navigation";
import { Sidebar } from "./sidebar";
import { DashboardHeader } from "./dashboard-header";
import { getCurrentProfile } from "@/lib/auth/get-profile";

export async function AppShell({
  subtitle,
  searchPlaceholder = "Search...",
  children,
}: {
  subtitle: string;
  searchPlaceholder?: string;
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/sign-in");

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar role={profile.role} />
      <main className="min-w-0 flex-1">
        <DashboardHeader profile={profile} subtitle={subtitle} searchPlaceholder={searchPlaceholder} />
        <div className="p-5 md:p-8">{children}</div>
      </main>
    </div>
  );
}