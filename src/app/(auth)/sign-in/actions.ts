// src/app/sign-in/actions.ts
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ROLE_HOME } from "@/config/roles";
import type { UserRole } from "@/types";

export type AuthState = { error: string };

const credentials = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(1024),
});

export async function signIn(_previous: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentials.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: "Enter a valid email address and your password." };

  let destination = "/sign-in";
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) {
      if (error.status === 429) return { error: "Too many attempts. Please wait a few minutes before trying again." };
      // Do not reveal whether an email address has an account.
      return { error: "Unable to sign in. Check your email and password and try again." };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("auth_user_id", data.user.id)
      .maybeSingle();

    destination = profile ? ROLE_HOME[profile.role as UserRole] : "/sign-in";
  } catch {
    return { error: "Sign-in is temporarily unavailable. Please try again shortly." };
  }

  revalidatePath("/", "layout");
  redirect(destination);
}

export async function signOut(): Promise<AuthState> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) return { error: "Could not sign out. Please try again." };
  } catch {
    return { error: "Could not sign out. Please check your connection and try again." };
  }
  revalidatePath("/", "layout");
  redirect("/sign-in");
}