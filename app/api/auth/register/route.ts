import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signJwt, createRefreshToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { Role } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Nieprawidłowe dane (brak JSON w żądaniu)" },
      { status: 400 }
    );
  }

  const { email, password, role, target } = body ?? {};
  if (!email || !password) {
    return NextResponse.json(
      { message: "Email i hasło są wymagane" },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { message: "Użytkownik już istnieje" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, passwordHash, role: role ?? Role.CUSTOMER }
    });

    const accessToken = signJwt({
      sub: user.id,
      email: user.email,
      role: user.role
    });

    const { token: refreshToken, expiresAt } = await createRefreshToken(user.id);
    const cookieStore = cookies();
    cookieStore.set("wojticore_refresh", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      expires: expiresAt,
      path: "/"
    });

    const ssoBase = process.env.WP_SSO_CONSUME_URL || process.env.NEXT_PUBLIC_WP_SSO_CONSUME_URL;
    const adminPanelUrl = process.env.ADMIN_PANEL_URL || "/admin";

    let redirectUrl: string;

    if (user.role === "ADMIN" || user.role === "SHOP_MANAGER") {
      if (target === "wp-admin" && ssoBase) {
        redirectUrl = `${ssoBase}?token=${accessToken}&target=wp-admin`;
      } else if (target === "admin-panel") {
        redirectUrl = adminPanelUrl;
      } else {
        redirectUrl = "/admin";
      }
    } else {
      if (ssoBase) {
        redirectUrl = `${ssoBase}?token=${accessToken}`;
      } else {
        redirectUrl = "/";
      }
    }

    return NextResponse.json({ accessToken, redirectUrl, role: user.role });
  } catch (err: any) {
    console.error("Register error:", err);
    return NextResponse.json(
      { message: "Błąd serwera przy rejestracji" },
      { status: 500 }
    );
  }
}
