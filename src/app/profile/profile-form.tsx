// src/app/profile/profile-form.tsx
"use client";

import { useActionState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateProfile, type ProfileState } from "./actions";
import type { Profile } from "@/types";

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(updateProfile, { error: "" });

  return (
    <form action={action} className="space-y-5" aria-busy={pending}>
      <div className="space-y-2">
        <Label htmlFor="full_name">Full name</Label>
        <Input id="full_name" name="full_name" defaultValue={profile.full_name} required maxLength={200} readOnly={pending} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone number</Label>
        <Input id="phone" name="phone" type="tel" defaultValue={profile.phone ?? ""} maxLength={30} readOnly={pending} placeholder="09XX XXX XXXX" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="business_name">Business / farm name</Label>
        <Input id="business_name" name="business_name" defaultValue={profile.business_name ?? ""} maxLength={200} readOnly={pending} />
      </div>

      <div aria-live="polite" aria-atomic="true">
        {state.error ? (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-800">{state.error}</p>
        ) : state.success ? (
          <p role="status" className="rounded-xl border border-[#dce6df] bg-[#f1f5ed] p-3 text-sm leading-6 text-[#3f6b52]">Saved.</p>
        ) : null}
      </div>

      <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save changes"}</Button>
    </form>
  );
}