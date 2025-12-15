import axios from "axios";

const BASE_URL = "https://api.baselinker.com/connector.php";
const token = process.env.BASELINKER_API_TOKEN;

export async function fetchBaselinkerOrders() {
  if (!token) return [];
  const res = await axios.post(
    BASE_URL,
    new URLSearchParams({
      method: "getOrders",
      parameters: JSON.stringify({ order_status_id: null, date_from: 0, get_unconfirmed_orders: true })
    }),
    { headers: { "X-BLToken": token } }
  );
  const orders = res.data?.orders ?? [];
  return orders.slice(0, 5).map((o: any) => ({
    id: String(o.order_id),
    status: o.status_name || "unknown",
    total: o.payment?.amount || "0",
    source: "baselinker" as const
  }));
}
