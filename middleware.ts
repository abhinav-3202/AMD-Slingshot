import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret:process.env.NEXTAUTH_SECRET,
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
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (
    !token &&
    (url.pathname.startsWith("/dashboard") ||
      url.pathname === "/info" ||
      url.pathname === "/chatbot")  
) {
    return NextResponse.redirect(new URL("/signIn", request.url));
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
    "/chatbot"
  ],
};
