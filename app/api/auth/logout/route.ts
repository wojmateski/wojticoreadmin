import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const cookieStore = cookies();
  const refresh = cookieStore.get("wojticore_refresh")?.value;

  if (refresh) {
    try {
      await prisma.refreshToken.deleteMany({ where: { token: refresh } });
    } catch (e) {
      // ignore
    }
  }

  cookieStore.set("wojticore_refresh", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    expires: new Date(0),
    path: "/"
  });

  return NextResponse.json({ ok: true });
}
