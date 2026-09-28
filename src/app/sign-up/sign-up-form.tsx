// src/app/sign-up/sign-up-form.tsx
"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, LoaderCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp, type SignUpState } from "./actions";

const ROLE_OPTIONS = [
  { value: "farmer", title: "Farmer", description: "List your harvest and get matched to buyers." },
  { value: "buyer", title: "Buyer", description: "Post produce requirements and receive shared deliveries." },
  { value: "truck_operator", title: "Truck operator", description: "Manage trucks and drivers, and accept route jobs." },
  { value: "driver", title: "Driver", description: "Run assigned pickup and delivery routes." },
] as const;

const BUSINESS_LABEL: Record<string, string> = {
  farmer: "Farm name",
  buyer: "Business name",
  truck_operator: "Company name",
};

const inputClass =
  "h-12 rounded-xl border-[#dce6df] bg-white px-3 text-base shadow-none focus-visible:border-[#1f5a4d] focus-visible:ring-[#7faeaa]/40";

export function SignUpForm() {
  const [state, action, pending] = useActionState<SignUpState, FormData>(signUp, { error: "" });
  const [role, setRole] = useState(state.values?.role ?? "");
  const [visible, setVisible] = useState(false);

  if (state.notice) {
    return (
      <div role="status" className="mt-7 rounded-xl border border-[#dce6df] bg-[#f1f5ed] p-4 text-sm leading-6 text-[#3f6b52]">
        {state.notice}
      </div>
    );
  }

  const businessLabel = BUSINESS_LABEL[role];

  return (
    <form action={action} className="mt-7 space-y-5" aria-busy={pending}>
      <fieldset className="space-y-2" disabled={pending}>
        <legend className="mb-2 text-sm font-medium text-[#20312c]">I am a…</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {ROLE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer flex-col gap-1 rounded-xl border border-[#dce6df] bg-white p-3 transition-colors hover:bg-[#f9fbf6] has-checked:border-[#1f5a4d] has-checked:bg-[#f1f5ed] has-focus-visible:outline-2 has-focus-visible:outline-[#1f5a4d]"
            >
              <input
                type="radio"
                name="role"
                value={option.value}
                checked={role === option.value}
                onChange={() => setRole(option.value)}
                required
                className="sr-only"
              />
              <span className="text-sm font-semibold text-[#20312c]">{option.title}</span>
              <span className="text-xs leading-5 text-[#66766f]">{option.description}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="full_name">Full name</Label>
        <Input id="full_name" name="full_name" autoComplete="name" required maxLength={200} defaultValue={state.values?.full_name} readOnly={pending} className={inputClass} />
      </div>

      {businessLabel ? (
        <div className="space-y-2">
          <Label htmlFor="business_name">{businessLabel} <span className="font-normal text-[#8a988f]">(optional)</span></Label>
          <Input id="business_name" name="business_name" autoComplete="organization" maxLength={200} defaultValue={state.values?.business_name} readOnly={pending} className={inputClass} />
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="phone">Phone number <span className="font-normal text-[#8a988f]">(optional)</span></Label>
        <Input id="phone" name="phone" type="tel" autoComplete="tel" maxLength={30} placeholder="09XX XXX XXXX" defaultValue={state.values?.phone} readOnly={pending} className={inputClass} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input id="email" name="email" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} required maxLength={254} placeholder="you@example.com" defaultValue={state.values?.email} readOnly={pending} className={inputClass} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input id="password" name="password" type={visible ? "text" : "password"} autoComplete="new-password" required minLength={8} maxLength={72} readOnly={pending} className={`${inputClass} pr-12`} />
          <button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? "Hide passwords" : "Show passwords"} aria-pressed={visible} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-xl text-[#66766f] focus-visible:outline-2 focus-visible:outline-[#1f5a4d]">
            {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        </div>
        <p className="text-xs text-[#8a988f]">At least 8 characters.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm_password">Confirm password</Label>
        <Input id="confirm_password" name="confirm_password" type={visible ? "text" : "password"} autoComplete="new-password" required minLength={8} maxLength={72} readOnly={pending} className={inputClass} />
      </div>

      <label className="flex items-start gap-3 text-sm leading-6 text-[#50655e]">
        <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 shrink-0 accent-[#1f5a4d]" />
        <span>I agree to Rova&apos;s Terms of Service and Privacy Policy, and to Rova processing my details to coordinate deliveries.</span>
      </label>

      <div aria-live="polite" aria-atomic="true">
        {state.error ? (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-800">{state.error}</p>
        ) : null}
      </div>

      <Button type="submit" disabled={pending} className="h-12 w-full gap-2">
        {pending ? <><LoaderCircle size={17} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> Creating account…</> : <>Create account <ArrowRight size={17} aria-hidden="true" /></>}
      </Button>
    </form>
  );
}