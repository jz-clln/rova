// src/app/sign-in/sign-in-form.tsx
"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, LoaderCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "./actions";

export function SignInForm() {
  const [state, action, pending] = useActionState(signIn, { error: "" });
  const [visible, setVisible] = useState(false);

  return (
    <form action={action} className="mt-7 space-y-5" aria-busy={pending}>
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input id="email" name="email" type="email" autoComplete="username" autoCapitalize="none" spellCheck={false} required maxLength={254} placeholder="you@example.com" readOnly={pending} aria-describedby={state.error ? "sign-in-error" : undefined} className="h-12 rounded-xl border-[#dce6df] bg-white px-3 text-base shadow-none focus-visible:border-[#1f5a4d] focus-visible:ring-[#7faeaa]/40" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input id="password" name="password" type={visible ? "text" : "password"} autoComplete="current-password" required maxLength={1024} readOnly={pending} aria-describedby={state.error ? "sign-in-error" : undefined} className="h-12 rounded-xl border-[#dce6df] bg-white px-3 pr-12 text-base shadow-none focus-visible:border-[#1f5a4d] focus-visible:ring-[#7faeaa]/40" />
          <button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? "Hide password" : "Show password"} aria-controls="password" aria-pressed={visible} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-xl text-[#66766f] focus-visible:outline-2 focus-visible:outline-[#1f5a4d]">
            {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        </div>
      </div>
      <div aria-live="polite" aria-atomic="true">
        {state.error && <p id="sign-in-error" role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-800">{state.error}</p>}
      </div>
      <Button type="submit" disabled={pending} className="h-12 w-full gap-2">
        {pending ? <><LoaderCircle size={17} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> Signing in…</> : <>Sign in <ArrowRight size={17} aria-hidden="true" /></>}
      </Button>
    </form>
  );
}
