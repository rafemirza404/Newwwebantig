import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// These paths never need an auth check — return immediately with no Supabase call.
// The middleware was previously running getUser() on every single request (including
// the marketing homepage and all API calls), causing ConnectTimeoutErrors and 7s+ loads.
const SKIP_AUTH = (pathname: string) =>
  pathname === "/" ||
  pathname.startsWith("/about") ||
  pathname.startsWith("/services") ||
  pathname.startsWith("/contact") ||
  pathname.startsWith("/watch-demo") ||
  pathname.startsWith("/pricing") ||
  pathname.startsWith("/terms") ||
  pathname.startsWith("/privacy") ||
  pathname.startsWith("/api/") ||      // API routes handle auth themselves
  pathname.startsWith("/auth/") ||     // Auth callback handles itself
  pathname.startsWith("/portal/login") ||     // Portal public auth pages
  pathname.startsWith("/portal/signup") ||
  pathname.startsWith("/portal/reset-password") ||
  pathname.startsWith("/_next/") ||
  pathname.includes(".");              // Static files missed by matcher

export async function middleware(request: NextRequest) {
  // Demo mode: no auth checks
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Fast path: skip Supabase entirely for public/API routes
  if (SKIP_AUTH(pathname)) {
    const res = NextResponse.next();
    res.headers.set("x-pathname", pathname);
    return res;
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  });
  // Expose current pathname to server components (e.g. portal layout)
  response.headers.set("x-pathname", pathname);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (err: any) {
    // Stale/deleted account — clear auth cookies so the browser doesn't loop
    // retrying an invalid refresh token on every request.
    const isStale =
      err?.code === "refresh_token_not_found" ||
      err?.status === 400 ||
      err?.name === "AuthApiError";

    if (isStale) {
      const clearRes = NextResponse.next({ request: { headers: request.headers } });
      request.cookies
        .getAll()
        .filter((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"))
        .forEach((c) => clearRes.cookies.delete(c.name));
      return clearRes;
    }
    // Other errors (e.g. network blip) — treat as logged out but don't clear cookies
  }

  // Portal client users — redirect away from agency/dashboard routes immediately
  // Use user_metadata to avoid a DB call in middleware
  const isPortalClient = user?.user_metadata?.user_type === "client";
  if (isPortalClient) {
    const agencyRoutes = ["/dashboard", "/audit", "/onboarding", "/report"];
    if (agencyRoutes.some((p) => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL("/portal", request.url));
    }
  }

  // Protect authenticated routes
  const protectedPaths = ["/dashboard", "/audit", "/report", "/portal", "/onboarding"];
  if (protectedPaths.some((p) => pathname.startsWith(p)) && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect already-logged-in users away from auth pages
  const authPages = ["/login", "/signup"];
  if (authPages.some((p) => pathname.startsWith(p)) && user) {
    if (isPortalClient) {
      return NextResponse.redirect(new URL("/portal", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
