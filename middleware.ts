import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret:process.env.NEXTAUTH_SECRET,
    cookieName: process.env.NODE_ENV === "production"
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token"
  });
  const url = request.nextUrl;

  // Redirect authenticated users away from auth pages
  if (
    token &&
    (url.pathname === "/signIn" ||
      url.pathname === "/signUp" ||
      url.pathname.startsWith("/verify") ||
      url.pathname === "/")
  ) {
    if (token.role === "doctor") {
      return NextResponse.redirect(new URL("/doctor/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (
    !token &&
    (url.pathname.startsWith("/dashboard") ||
      url.pathname.startsWith("/doctor") ||
      url.pathname === "/info" ||
      url.pathname === "/chatbot")  
) {
    return NextResponse.redirect(new URL("/signIn", request.url));
}

// doctor trying to access user dashboard
if (token && token.role === "doctor" && url.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/doctor/dashboard", request.url));
}

// user trying to access doctor dashboard
if (token && token.role === "user" && url.pathname.startsWith("/doctor")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
}

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/signIn",
    "/signUp",
    "/verify/:path*",
    "/",
    "/dashboard",
    "/dashboard/:path*",
    "/info",
    "/doctor",
    "/doctor/:path*",
    "/chatbot"
  ],
};
