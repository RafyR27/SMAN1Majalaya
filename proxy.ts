import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const isAuthRoute = pathname.startsWith("/auth");

  if (!session) {
    if (isAuthRoute) {
      return NextResponse.next();
    }

    const protectedPrefixes = ["/dashboard", "/users-management"];

    const isProtected = protectedPrefixes.some((prefix) =>
      pathname.startsWith(prefix),
    );

    if (isProtected) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    return NextResponse.next();
  }

  if (isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth/:path*", "/dashboard/:path*", "/users-management/:path*"],
};
