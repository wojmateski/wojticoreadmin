import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_MATCHERS = ["/admin", "/api/admin"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminPath = ADMIN_MATCHERS.some(
    (base) => pathname === base || pathname.startsWith(base + "/")
  );

  if (!isAdminPath) {
    return NextResponse.next();
  }

  const refresh = req.cookies.get("wojticore_refresh")?.value;
  if (!refresh) {
    const url = new URL("/login?target=admin-panel", req.url);
    return NextResponse.redirect(url);
  }

  try {
    const token = await prisma.refreshToken.findUnique({
      where: { token: refresh },
      include: { user: true }
    });

    if (!token || token.expiresAt < new Date() || !token.user) {
      const url = new URL("/login?target=admin-panel", req.url);
      return NextResponse.redirect(url);
    }

    if (!(["ADMIN", "SHOP_MANAGER"].includes(token.user.role as string))) {
      return NextResponse.json({ message: "Brak uprawnień" }, { status: 403 });
    }

    return NextResponse.next();
  } catch (err) {
    console.error("Middleware auth error", err);
    const url = new URL("/login?target=admin-panel", req.url);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
