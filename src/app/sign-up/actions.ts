// src/app/sign-up/actions.ts
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ROLE_HOME, SELF_SERVICE_ROLES, type SelfServiceRole } from "@/config/roles";

export type SignUpState = {
  error: string;
  notice?: string;
  // Echoed back so a failed submit doesn't wipe the form (passwords excluded).
  values?: { role: string; full_name: string; business_name: string; phone: string; email: string };
};

const signUpSchema = z
  .object({
    role: z.enum(SELF_SERVICE_ROLES, { errorMap: () => ({ message: "Choose how you'll use Rova." }) }),
    full_name: z.string().trim().min(1, "Enter your full name.").max(200),
    business_name: z.string().trim().max(200),
    phone: z.string().trim().max(30),
    email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(254),
    password: z.string().min(8, "Use at least 8 characters.").max(72, "Use 72 characters or fewer."),
    confirm_password: z.string(),
    consent: z.literal(true, { errorMap: () => ({ message: "Please accept the terms to continue." }) }),
  })
  .refine((d) => d.password === d.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords don't match.",
  });

const GENERIC_FAILURE = "We couldn't create that account. Check your details, or try signing in instead.";
const CHECK_EMAIL = "Check your email to confirm your address, then sign in.";

async function createAccountRecords(
  userId: string,
  input: { role: SelfServiceRole; full_name: string; business_name: string; phone: string },
) {
  const admin = createAdminClient();

  const { data: profile, error } = await admin
    .from("profiles")
    .insert({
      auth_user_id: userId,
      role: input.role,
      full_name: input.full_name,
      phone: input.phone || null,
      business_name: input.business_name || null,
    })
    .select("id")
    .single();
  if (error || !profile) throw error ?? new Error("Profile was not created");

  const name = input.business_name || null;

  // One explicit insert per role: each subtype table has different columns.
  switch (input.role) {
    case "farmer": {
      const { error: subtypeError } = await admin
        .from("farmer_profiles")
        .insert({ profile_id: profile.id, farm_name: name });
      if (subtypeError) throw subtypeError;
      break;
    }
    case "buyer": {
      const { error: subtypeError } = await admin
        .from("buyer_profiles")
        .insert({ profile_id: profile.id });
      if (subtypeError) throw subtypeError;
      break;
    }
    case "truck_operator": {
      const { error: subtypeError } = await admin
        .from("operator_profiles")
        .insert({ profile_id: profile.id, legal_name: name });
      if (subtypeError) throw subtypeError;
      break;
    }
    case "driver": {
      // Drivers are created unattached. An admin links them to an operator;
      // a driver can never self-assign to a fleet.
      const { error: subtypeError } = await admin
        .from("drivers")
        .insert({ profile_id: profile.id });
      if (subtypeError) throw subtypeError;
      break;
    }
  }
}

export async function signUp(_previous: SignUpState, formData: FormData): Promise<SignUpState> {
  const text = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value : "";
  };

  const values = {
    role: text("role"),
    full_name: text("full_name"),
    business_name: text("business_name"),
    phone: text("phone"),
    email: text("email"),
  };

  const parsed = signUpSchema.safeParse({
    ...values,
    password: text("password"),
    confirm_password: text("confirm_password"),
    consent: formData.get("consent") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the fields and try again.", values };
  }
  const input = parsed.data;

  let signedIn = false;
  try {
    const supabase = await createClient();
    // Role is intentionally NOT sent as auth metadata: metadata is client-controlled.
    const { data, error } = await supabase.auth.signUp({ email: input.email, password: input.password });

    if (error) {
      if (error.status === 429) {
        return { error: "Too many attempts. Please wait a few minutes before trying again.", values };
      }
      return { error: GENERIC_FAILURE, values };
    }

    const user = data.user;
    if (!user) return { error: GENERIC_FAILURE, values };

    // With email confirmation on, Supabase answers a repeat sign-up with an
    // obfuscated user that has no identities. Treat it exactly like a success so
    // the form can't be used to discover which emails have accounts.
    if (user.identities?.length === 0) return { error: "", notice: CHECK_EMAIL, values };

    try {
      await createAccountRecords(user.id, input);
    } catch {
      // Don't leave an auth user with no profile behind. Profile and subtype
      // rows cascade-delete with the auth user.
      await createAdminClient().auth.admin.deleteUser(user.id);
      return { error: "We couldn't finish setting up your account. Please try again.", values };
    }

    signedIn = !!data.session;
  } catch {
    return { error: "Sign-up is temporarily unavailable. Please try again shortly.", values };
  }

  if (!signedIn) return { error: "", notice: CHECK_EMAIL, values };

  revalidatePath("/", "layout");
  redirect(ROLE_HOME[input.role]);
}