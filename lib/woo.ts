import axios from "axios";

const baseURL = process.env.WOO_BASE_URL;
const key = process.env.WOO_CONSUMER_KEY;
const secret = process.env.WOO_CONSUMER_SECRET;

export async function fetchWooOrders() {
  if (!baseURL || !key || !secret) {
    return [];
  }
  const url = `${baseURL}/wp-json/wc/v3/orders`;
  const res = await axios.get(url, {
    auth: { username: key, password: secret },
    params: { per_page: 5, orderby: "date", order: "desc" }
  });
  return res.data?.map((o: any) => ({
    id: String(o.id),
    status: o.status,
    total: o.total,
    source: "woo" as const
  }));
}
