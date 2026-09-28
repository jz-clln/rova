// src/lib/supabase/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ROLE_HOME, roleBaseOf } from "@/config/roles";
import type { UserRole } from "@/types";

const PUBLIC_PATHS = ["/", "/sign-in", "/sign-up"];
const AUTH_PAGES = ["/sign-in", "/sign-up"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.includes(pathname);
}

function redirectTo(request: NextRequest, pathname: string) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = pathname;
  redirectUrl.search = "";
  return NextResponse.redirect(redirectUrl);
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return response;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // No session, trying to reach a protected page -> bounce to sign-in.
  if (!user) {
    return isPublicPath(pathname) ? response : redirectTo(request, "/sign-in");
  }

  // RLS's "account reads own profile" policy means this can only ever return
  // the caller's own row.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  const role = profile?.role as UserRole | undefined;
  const home = role ? ROLE_HOME[role] : null;

  // Signed in but no profile row (e.g. sign-up was interrupted). Never redirect
  // public pages here: sending them to /sign-in from /sign-in would loop forever.
  if (!home) {
    return isPublicPath(pathname) ? response : redirectTo(request, "/sign-in");
  }

  // Already signed in, no reason to see the sign-in or sign-up pages.
  if (AUTH_PAGES.includes(pathname)) return redirectTo(request, home);

  // One role's area requested by a different role -> bounce to their own home.
  // Admin is exempt: network-wide visibility is intentional.
  const requestedBase = roleBaseOf(pathname);
  if (requestedBase && role !== "admin" && requestedBase !== home) {
    return redirectTo(request, home);
  }

  return response;
}