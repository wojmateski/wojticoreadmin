import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    return NextResponse.json({ users });
  } catch (err: any) {
    console.error("Admin users error", err);
    return NextResponse.json({ message: "Błąd pobierania użytkowników" }, { status: 500 });
  }
}
