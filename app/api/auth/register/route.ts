import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signJwt, createRefreshToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { Role } from "@prisma/client";

export async function POST(request: Request) {
  const { email, password, role } = await request.json();
  if (!email || !password) {
    return NextResponse.json({ message: "Email i hasło są wymagane" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ message: "Użytkownik już istnieje" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { email, passwordHash, role: role ?? Role.CUSTOMER } });

  const accessToken = signJwt({ sub: user.id, email: user.email, role: user.role });
  const { token: refreshToken, expiresAt } = await createRefreshToken(user.id);
  const cookieStore = cookies();
  cookieStore.set("wojticore_refresh", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    expires: expiresAt,
    path: "/"
  });

  const redirectUrl = user.role === "ADMIN" || user.role === "SHOP_MANAGER" ? "/admin" : "/";
  return NextResponse.json({ accessToken, redirectUrl, role: user.role });
}
