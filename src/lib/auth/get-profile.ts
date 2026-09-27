// src/lib/auth/get-profile.ts
import { createClient } from "@/lib/supabase/server";

export async function getCurrentProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // maybeSingle: a signed-in user with no profile row yet (e.g. the
  // provisioning trigger hasn't run) should get null, not a crash.
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, full_name, business_name, verification_status")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (error) throw error;
  return data;
}