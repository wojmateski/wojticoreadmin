import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signJwt, createRefreshToken } from "@/lib/auth";
import { cookies } from "next/headers";

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

  const { email, password, redirect } = body ?? {};
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

    const redirectUrl =
      user.role === "ADMIN" || user.role === "SHOP_MANAGER" ? "/admin" : "/";

    return NextResponse.json({
      accessToken,
      redirectUrl: redirect || redirectUrl,
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
