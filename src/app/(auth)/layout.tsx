// src/app/(auth)/layout.tsx
// Shared shell for /sign-in and /sign-up. It stays mounted while people switch
// between the two pages, which is what makes the soft transition possible.
import { AuthShell } from "@/components/auth/auth-shell";

export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  return <AuthShell>{children}</AuthShell>;
}