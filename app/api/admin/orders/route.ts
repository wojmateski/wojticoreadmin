import { NextResponse } from "next/server";
import { fetchWooOrders } from "@/lib/woo";
import { fetchBaselinkerOrders } from "@/lib/baselinker";

export async function GET() {
  try {
    const [woo, bl] = await Promise.all([fetchWooOrders(), fetchBaselinkerOrders()]);
    return NextResponse.json({ orders: [...woo, ...bl] });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
