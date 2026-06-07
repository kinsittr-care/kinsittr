import { NextRequest, NextResponse } from "next/server";

const AUTH_ROLE_COOKIE = "kinsittr.auth.role";

const protectedRoutes = [
  { prefix: "/parent", role: "parent", authPath: "/auth/parent" },
  { prefix: "/nanny", role: "nanny", authPath: "/auth/nanny" },
  { prefix: "/admin", role: "admin", authPath: "/auth/admin" },
] as const;

const roleHome = {
  parent: "/parent",
  nanny: "/nanny",
  admin: "/admin",
} as const;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const match = protectedRoutes.find((route) => isProtectedPath(pathname, route.prefix));

  if (!match) {
    return NextResponse.next();
  }

  const role = request.cookies.get(AUTH_ROLE_COOKIE)?.value;

  if (!role) {
    return redirect(request, match.authPath);
  }

  if (role !== match.role) {
    return redirect(request, roleHome[role as keyof typeof roleHome] ?? match.authPath);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/parent/:path*", "/nanny/:path*", "/admin/:path*"],
};

function isProtectedPath(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function redirect(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url));
}
