// src/app/buyer/requirements/actions.ts
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { manilaToday } from "@/lib/format";
import type { RequirementStatus } from "@/types";

export type RequirementState = {
  error: string;
  // Echoed back so a failed submit doesn't wipe the form.
  values?: Record<string, string>;
};

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

const requirementSchema = z
  .object({
    intent: z.enum(["draft", "open"]),
    commodity_id: z.string().uuid("Choose a produce type."),
    required_quantity_kg: z.coerce
      .number({ invalid_type_error: "Enter the quantity in kilograms." })
      .min(0.01, "Quantity must be more than 0 kg.")
      .max(1_000_000, "That quantity is too large. Contact Rova for loads above 1,000,000 kg.")
      .transform((n) => Math.round(n * 100) / 100),
    delivery_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a delivery date."),
    window_start: z.string().regex(TIME, "Enter when receiving opens."),
    window_end: z.string().regex(TIME, "Enter when receiving closes."),
    destination_address: z.string().trim().min(3, "Enter the delivery address.").max(500),
    receiver_name: z.string().trim().min(1, "Enter who will receive the delivery.").max(200),
    receiver_phone: z.string().trim().max(30),
    notes: z.string().trim().max(500, "Keep notes under 500 characters."),
  })
  .superRefine((d, ctx) => {
    if (d.delivery_date < manilaToday()) {
      ctx.addIssue({ code: "custom", path: ["delivery_date"], message: "Delivery date can't be in the past." });
    }
    if (d.window_end <= d.window_start) {
      ctx.addIssue({ code: "custom", path: ["window_end"], message: "Receiving must close after it opens." });
    }
  });

export async function createRequirement(
  _previous: RequirementState,
  formData: FormData,
): Promise<RequirementState> {
  const text = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value : "";
  };

  const values = {
    commodity_id: text("commodity_id"),
    required_quantity_kg: text("required_quantity_kg"),
    delivery_date: text("delivery_date"),
    window_start: text("window_start"),
    window_end: text("window_end"),
    destination_address: text("destination_address"),
    receiver_name: text("receiver_name"),
    receiver_phone: text("receiver_phone"),
    notes: text("notes"),
  };

  const parsed = requirementSchema.safeParse({ ...values, intent: text("intent") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the fields and try again.", values };
  }
  const input = parsed.data;

  try {
    const profile = await getCurrentProfile();
    if (!profile) return { error: "Your session has expired. Please sign in again.", values };
    if (profile.role !== "buyer") return { error: "Only buyer accounts can post requirements.", values };

    const supabase = await createClient();
    const { error } = await supabase.from("buyer_requirements").insert({
      buyer_profile_id: profile.id,
      commodity_id: input.commodity_id,
      required_quantity_kg: input.required_quantity_kg,
      product_specification: input.notes ? { notes: input.notes } : {},
      delivery_date: input.delivery_date,
      // The Philippines has no daylight saving, so a fixed +08:00 offset is exact.
      receiving_window_start: `${input.delivery_date}T${input.window_start}:00+08:00`,
      receiving_window_end: `${input.delivery_date}T${input.window_end}:00+08:00`,
      destination_address: input.destination_address,
      receiver_name: input.receiver_name,
      receiver_phone: input.receiver_phone || null,
      status: input.intent,
    });

    if (error) {
      // 23503 = foreign key: the account has no buyer_profiles row.
      if (error.code === "23503") {
        return { error: "Your buyer profile isn't fully set up yet. Please contact Rova.", values };
      }
      return { error: "We couldn't save your requirement. Please try again.", values };
    }
  } catch {
    return { error: "Something went wrong. Please try again shortly.", values };
  }

  revalidatePath("/buyer", "layout");
  redirect(`/buyer/requirements?saved=${input.intent}`);
}

async function transition(
  formData: FormData,
  from: RequirementStatus[],
  to: RequirementStatus,
): Promise<boolean> {
  const id = formData.get("id");
  if (typeof id !== "string" || !z.string().uuid().safeParse(id).success) return false;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("buyer_requirements")
      .update({ status: to })
      .eq("id", id)
      .in("status", from)
      .select("id");
    return !error && !!data?.length;
  } catch {
    return false;
  }
}

export async function publishRequirement(formData: FormData): Promise<void> {
  const ok = await transition(formData, ["draft"], "open");
  revalidatePath("/buyer", "layout");
  redirect(ok ? "/buyer/requirements?saved=open" : "/buyer/requirements?error=publish");
}

export async function cancelRequirement(formData: FormData): Promise<void> {
  const ok = await transition(formData, ["draft", "open", "matching"], "cancelled");
  revalidatePath("/buyer", "layout");
  redirect(ok ? "/buyer/requirements?saved=cancelled" : "/buyer/requirements?error=cancel");
}