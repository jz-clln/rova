// src/components/layout/sign-out-button.tsx
"use client";

import { useFormStatus } from "react-dom";
import { signOut } from "@/app/(auth)/sign-in/actions";
import { Button } from "@/components/ui/button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" disabled={pending}>
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}

export function SignOutButton() {
  // form's action prop wants (formData) => void | Promise<void>;
  // signOut takes no arguments and resolves to AuthState, so wrap,
  // drop the formData param, and discard the return value.
  async function action() {
    await signOut();
  }

  return (
    <form action={action} className="shrink-0 text-right">
      <SubmitButton />
    </form>
  );
}