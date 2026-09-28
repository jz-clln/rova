// src/app/profile/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type ProfileState = { error: string; success?: boolean };

const profileFields = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(200),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  business_name: z.string().trim().max(200).optional().or(z.literal("")),
});

export async function updateProfile(_previous: ProfileState, formData: FormData): Promise<ProfileState> {
  const parsed = profileFields.safeParse({
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
    business_name: formData.get("business_name"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the fields and try again." };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Your session has expired. Please sign in again." };

    // role and verification_status are intentionally never sent — the
    // protect_profile_identity trigger (0005) would reject a non-admin
    // attempt to change them anyway, but keeping them out of this update
    // means a bug here can't even attempt it.
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: parsed.data.full_name,
        phone: parsed.data.phone || null,
        business_name: parsed.data.business_name || null,
      })
      .eq("auth_user_id", user.id);

    if (error) return { error: "Could not save your details. Please try again." };
  } catch {
    return { error: "Something went wrong. Please try again shortly." };
  }

  revalidatePath("/profile");
  return { error: "", success: true };
}