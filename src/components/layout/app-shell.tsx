// src/components/layout/app-shell.tsx
import { Sidebar } from "./sidebar";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "./sign-out-button";

export async function AppShell({ title, eyebrow, children }: { title: string; eyebrow?: string; children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/sign-in");
  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#dce6df] bg-white px-5 py-5 md:px-8">
          <div>
          {eyebrow ? <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#5d9278]">{eyebrow}</p> : null}
          <h1 className="text-2xl font-bold tracking-tight text-[#20312c]">{title}</h1>
          </div>
          <SignOutButton />
        </header>
        <div className="p-5 md:p-8">{children}</div>
      </main>
    </div>
  );
}
