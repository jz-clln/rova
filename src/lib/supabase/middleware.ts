// src/lib/supabase/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ROLE_HOME, roleBaseOf } from "@/config/roles";
import type { UserRole } from "@/types";

const PUBLIC_PATHS = ["/", "/sign-in"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname === path);
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
  if (!user && !isPublicPath(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/sign-in";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  if (user) {
    // RLS's "account reads own profile" policy allows this — a user can only
    // ever read their own row here, so this can't be used to probe others.
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("auth_user_id", user.id)
      .maybeSingle();
    const home = profile ? ROLE_HOME[profile.role as UserRole] : "/sign-in";

    // Already signed in, no reason to see the sign-in page.
    if (pathname === "/sign-in") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = home;
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }

    // One role's area, requested by a different role -> bounce to their own
    // home. Admin is exempt: broader network visibility is intentional
    // (see Admin Visibility in the role-dashboard spec).
    const requestedBase = roleBaseOf(pathname);
    if (requestedBase && profile?.role !== "admin" && requestedBase !== home) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = home;
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}