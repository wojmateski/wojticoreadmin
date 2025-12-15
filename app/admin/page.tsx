"use client";

import { useEffect, useState } from "react";

type OrdersResponse = { id: string; status: string; total: string; source: "woo" | "baselinker" }[];

export default function AdminPage() {
  const [orders, setOrders] = useState<OrdersResponse>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/orders");
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Nie udało się pobrać zamówień");
        setOrders(data.orders ?? []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="card" style={{ width: "100%", maxWidth: 760 }}>
      <h1 className="text-2xl font-semibold mb-2">Panel admina (SSO)</h1>
      <p className="text-sm text-slate-300 mb-4">
        Wybierz gdzie chcesz przejść lub sprawdź podgląd zamówień.
      </p>
      <div className="flex flex-wrap gap-3 mb-6">
        <a className="button-primary" href="https://home.wojticore.pl/wp-json/wojticore-sso/consume?target=wp-admin">
          Przejdź do WP-Admin
        </a>
        <a className="button-primary" href="https://admin.wojticore.pl">
          Zewnętrzny panel admina
        </a>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Zamówienia (Woo + Baselinker)</h2>
          {loading && <span className="text-sm text-slate-400">Ładowanie...</span>}
        </div>
        {error && <div className="text-red-400 text-sm">{error}</div>}
        <div className="grid md:grid-cols-2 gap-3">
          {orders.map((o) => (
            <div key={o.id} className="card" style={{ padding: 16 }}>
              <div className="text-sm text-slate-400">{o.source === "woo" ? "WooCommerce" : "Baselinker"}</div>
              <div className="font-semibold">#{o.id}</div>
              <div className="text-slate-300">Status: {o.status}</div>
              <div className="text-slate-100">Suma: {o.total}</div>
            </div>
          ))}
          {!loading && orders.length === 0 && <div className="text-slate-400">Brak zamówień (mock lub brak danych)</div>}
        </div>
      </div>
    </div>
  );
}
