import { NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Brak tokena" }, { status: 401 });
  }
  const token = auth.replace("Bearer ", "");
  try {
    const payload = verifyJwt(token);
    return NextResponse.json({ user: payload });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 401 });
  }
}
