import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signJwt, createRefreshToken } from "@/lib/auth";
import { cookies } from "next/headers";

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

  const { email, password, target } = body ?? {};
  if (!email || !password) {
    return NextResponse.json(
      { message: "Email i hasło są wymagane" },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { message: "Niepoprawne dane logowania" },
        { status: 401 }
      );
    }
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { message: "Niepoprawne dane logowania" },
        { status: 401 }
      );
    }

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
      // admin/shop manager
      if (target === "wp-admin" && ssoBase) {
        redirectUrl = `${ssoBase}?token=${accessToken}&target=wp-admin`;
      } else if (target === "admin-panel") {
        redirectUrl = adminPanelUrl;
      } else {
        // domyślnie wewnętrzny panel admina (z wyborem)
        redirectUrl = "/admin";
      }
    } else {
      // zwykły klient → przekierowanie do WooCommerce przez SSO, jeśli skonfigurowane
      if (ssoBase) {
        redirectUrl = `${ssoBase}?token=${accessToken}`;
      } else {
        redirectUrl = "/";
      }
    }

    return NextResponse.json({
      accessToken,
      redirectUrl,
      role: user.role
    });
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json(
      { message: "Błąd serwera przy logowaniu" },
      { status: 500 }
    );
  }
}
