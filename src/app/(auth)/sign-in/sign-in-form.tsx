// src/app/(auth)/sign-in/sign-in-form.tsx
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
    <form action={action} className="auth-form space-y-5" aria-busy={pending}>
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input id="email" name="email" type="email" inputMode="email" autoComplete="username" autoCapitalize="none" spellCheck={false} required maxLength={254} placeholder="you@example.com" readOnly={pending} aria-describedby={state.error ? "sign-in-error" : undefined} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input id="password" name="password" type={visible ? "text" : "password"} autoComplete="current-password" required maxLength={1024} readOnly={pending} aria-describedby={state.error ? "sign-in-error" : undefined} className="auth-pass" />
          <button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? "Hide password" : "Show password"} aria-controls="password" aria-pressed={visible} className="auth-eye">
            {visible ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>
      <div aria-live="polite" aria-atomic="true">
        {state.error && <p id="sign-in-error" role="alert" className="auth-error">{state.error}</p>}
      </div>
      <Button type="submit" disabled={pending} className="auth-submit w-full gap-2">
        {pending ? <><LoaderCircle size={20} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> Signing in…</> : <>Sign in <ArrowRight size={20} aria-hidden="true" /></>}
      </Button>
    </form>
  );
}