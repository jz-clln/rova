// src/app/(auth)/sign-up/page.tsx
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ROLE_HOME } from "@/config/roles";
import type { UserRole } from "@/types";
import { SignUpForm } from "./sign-up-form";

export const metadata: Metadata = { title: "Create account | Rova", robots: { index: false, follow: false } };

export default async function SignUpPage() {
  let destination: string | null = null;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("auth_user_id", user.id)
        .maybeSingle();
      destination = profile ? ROLE_HOME[profile.role as UserRole] : null;
    }
  } catch { /* Keep the form available so it can report a service outage. */ }
  if (destination) redirect(destination);

  return <SignUpForm />;
}