import { NextResponse } from "next/server";
import { rotateRefreshToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = cookies();
  const current = cookieStore.get("wojticore_refresh")?.value;
  if (!current) return NextResponse.json({ message: "Brak refresh tokena" }, { status: 401 });

  try {
    const { accessToken, refreshToken, refreshExpiresAt } = await rotateRefreshToken(current);
    cookieStore.set("wojticore_refresh", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      expires: refreshExpiresAt,
      path: "/"
    });
    return NextResponse.json({ accessToken });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 401 });
  }
}
