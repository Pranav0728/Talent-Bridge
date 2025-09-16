import { NextResponse } from "next/server";

export function middleware(req) {
  const role = req.cookies.get("role")?.value || req.cookies.get("userRole")?.value;
  const url = req.nextUrl.clone();

  // Allow these routes for everyone
  const publicRoutes = [
    "/landingpage",
    "/login", 
    "/register",
    "/unauthorized",
    "/"
  ];

  // Check if current route is public
  const isPublicRoute = publicRoutes.some(route => 
    url.pathname === route || url.pathname.startsWith(route + "/")
  );

  // If no role (not logged in)
  if (!role) {
    if (isPublicRoute) {
      return NextResponse.next();
    }
    url.pathname = "/unauthorized";
    return NextResponse.redirect(url);
  }

  // If logged in, don't allow access to login/register
  if (role && (url.pathname === "/login" || url.pathname === "/register")) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Role-based restrictions
  if (url.pathname.startsWith("/recruiter") && role !== "recruiter") {
    url.pathname = "/unauthorized";
    return NextResponse.redirect(url);
  }

  if (url.pathname.startsWith("/jobseeker") && role !== "jobseeker") {
    url.pathname = "/unauthorized";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Apply middleware globally except for static files
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)", 
  ],
};