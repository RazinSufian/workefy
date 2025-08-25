import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  // Get the token from the request
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET
  });

  const { pathname } = req.nextUrl;

  console.log("Token:", token);
  console.log("Pathname:", pathname);

  // If no token (user not authenticated), redirect to login
  if (!token) {
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/worker") ||
      pathname.startsWith("/client")
    ) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // User is authenticated, check role-based access
  const userRole = token.role;
  console.log("User Role:", userRole);

  // Admin routes - only allow admin users
  if (pathname.startsWith("/admin") && userRole !== "admin") {
    // Redirect to appropriate dashboard based on user role
    if (userRole === "worker") {
      return NextResponse.redirect(new URL("/worker/dashboard", req.url));
    } else if (userRole === "client") {
      return NextResponse.redirect(new URL("/client/dashboard", req.url));
    }
    // Fallback redirect to login if role is undefined
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Worker routes - only allow worker users
  if (pathname.startsWith("/worker") && userRole !== "worker") {
    if (userRole === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    } else if (userRole === "client") {
      return NextResponse.redirect(new URL("/client/dashboard", req.url));
    }
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Client routes - only allow client users
  if (pathname.startsWith("/client") && userRole !== "client") {
    if (userRole === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    } else if (userRole === "worker") {
      return NextResponse.redirect(new URL("/worker/dashboard", req.url));
    }
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Redirect authenticated users away from auth pages
  if (token && (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register"))) {
    // Redirect to appropriate dashboard based on user role
    if (userRole === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    } else if (userRole === "worker") {
      return NextResponse.redirect(new URL("/worker/dashboard", req.url));
    } else if (userRole === "client") {
      return NextResponse.redirect(new URL("/client/dashboard", req.url));
    }
    // Fallback to home page
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Allow access if user has correct role or accessing other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/worker/:path*",
    "/client/:path*",
    "/auth/login",
    "/auth/register"
  ],
};