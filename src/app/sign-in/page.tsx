// src/app/sign-in/page.tsx
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "Sign in | Rova", robots: { index: false, follow: false } };

export default async function SignInPage() {
  let signedIn = false;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    signedIn = !!user;
  } catch { /* Keep the form available so it can report a service outage. */ }
  if (signedIn) redirect("/dashboard");

  return (
    <main className="grid min-h-dvh place-items-center bg-[#f6f8f4] px-5 py-10">
      <div className="w-full max-w-md">
        <Link href="/" aria-label="Rova home" className="mx-auto mb-8 flex w-fit items-center gap-1 rounded-lg focus-visible:outline-2 focus-visible:outline-[#1f5a4d]">
          <Image src="/brand/rova-icon.png" alt="" width={44} height={44} priority />
          <Image src="/brand/rova-wordmark.png" alt="Rova" width={110} height={37} priority className="h-auto" />
        </Link>
        <section aria-labelledby="sign-in-title" className="rounded-2xl border border-[#dce6df] bg-white p-6 shadow-sm sm:p-8">
          <h1 id="sign-in-title" className="text-2xl font-semibold tracking-tight text-[#20312c]">Welcome back.</h1>
          <p className="mt-2 text-sm leading-6 text-[#66766f]">Sign in to continue your journey with Rova.</p>
          <SignInForm />
        </section>
        <Link href="/" className="mx-auto mt-5 flex min-h-11 w-fit items-center rounded-md px-3 text-sm text-[#1f5a4d] hover:underline focus-visible:outline-2 focus-visible:outline-[#1f5a4d]">Back to Rova</Link>
      </div>
    </main>
  );
}
