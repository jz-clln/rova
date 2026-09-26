import { createClient } from "@/lib/supabase/server";

export async function getCurrentProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, full_name, business_name, verification_status")
    .eq("auth_user_id", user.id)
    .single();

  if (error) throw error;
  return data;
}
