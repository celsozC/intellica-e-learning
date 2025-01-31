import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "@/lib/jwt";

// Public routes (no auth required)
const publicRoutes = ["/"];

// Auth routes (only for non-authenticated users)
const authRoutes = ["/login", "/register"];

// Protected routes (only for authenticated users)
const protectedRoutes = ["/dashboard", "/profile", "/settings"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  console.log("Middleware executing for path:", pathname);
  console.log("Token present:", !!token);

  // Allow all API routes to pass through
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Check if token exists and is valid
  if (token) {
    try {
      const isValidToken = verifyJWT(token);
      console.log("Token validation:", isValidToken ? "valid" : "invalid");

      // If token is valid and user tries to access auth routes, redirect to dashboard
      if (isValidToken && authRoutes.includes(pathname)) {
        console.log(
          "Redirecting authenticated user from auth route to dashboard"
        );
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // Allow access to protected routes with valid token
      if (
        isValidToken &&
        protectedRoutes.some((route) => pathname.startsWith(route))
      ) {
        return NextResponse.next();
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      // Clear invalid token and redirect to login
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("token");
      return response;
    }
  }

  // Handle unauthenticated access to protected routes
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    console.log("Unauthenticated access attempt to protected route");
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Allow access to auth routes only if not authenticated
  if (authRoutes.includes(pathname)) {
    if (token) {
      console.log("Authenticated user attempting to access auth route");
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Allow access to public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Update the matcher configuration to run on all routes
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (static files)
     * 4. /_vercel (Vercel internals)
     * 5. /favicon.ico, /sitemap.xml, /robots.txt (static files)
     */
    "/((?!api|_next|_static|_vercel|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
