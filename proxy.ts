import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Next 16 renamed the middleware convention to `proxy` and only runs it from the
// project root (or src/). This was previously at app/middleware.ts, so it never
// executed — auth gating fell entirely to the client. Now it runs as the primary gate.
export function proxy(request: NextRequest) {
  // Public routes that don't require authentication.
  // "/" must be public so the SSO #token hash hand-off can land: the hash is
  // invisible to the server, so client JS (captureTokenFromUrl) must run first
  // to persist the cookie before any server-side gate kicks in.
  const publicRoutes = ["/login"];
  const isPublicRoute =
    request.nextUrl.pathname === "/" ||
    publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route));

  // Check for token in cookies or headers (for SSR)
  // For client-side, we'll handle in components
  const token = request.cookies.get("token")?.value;

  // If accessing public route, allow
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // If no token and not public route, bounce to the centralized Frontend login,
  // which authenticates and redirects back here with the token.
  // Note: basic check; full auth check happens client-side (AuthContext).
  if (!token && !isPublicRoute) {
    const frontendAuthUrl =
      process.env.NEXT_PUBLIC_FRONTEND_AUTH_URL || "https://www.mathpro.academy";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const returnTo = appUrl + request.nextUrl.pathname + request.nextUrl.search;
    const loginUrl = new URL("/auth/login", frontendAuthUrl);
    loginUrl.searchParams.set("redirect", returnTo);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
