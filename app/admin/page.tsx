"use client";

import { useEffect, useState } from "react";

type Order = { id: string; status: string; total: string; source: "woo" | "baselinker" };
type User = { id: string; email: string; role: string; createdAt: string };

type Tab = "overview" | "orders" | "users";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    const loadOrders = async () => {
      setLoadingOrders(true);
      try {
        const res = await fetch("/api/admin/orders");
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Nie udało się pobrać zamówień");
        setOrders(data.orders ?? []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoadingOrders(false);
      }
    };

    const loadUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Nie udało się pobrać użytkowników");
        setUsers(data.users ?? []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoadingUsers(false);
      }
    };

    loadOrders();
    loadUsers();
  }, []);

  const wooCount = orders.filter((o) => o.source === "woo").length;
  const blCount = orders.filter((o) => o.source === "baselinker").length;

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    window.location.href = "/";
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Panel administracyjny</h1>
          <p className="text-sm text-slate-300">
            Podgląd zamówień z WooCommerce i Baselinker oraz użytkowników Wojticore Account.
          </p>
        </div>
        <button className="button-primary" onClick={handleLogout}>
          Wyloguj
        </button>
      </div>

      <div className="flex gap-2 text-sm border border-slate-700 rounded-xl bg-slate-900/40 p-1 w-full md:w-auto">
        <button
          className={`px-4 py-2 rounded-lg transition ${
            activeTab === "overview" ? "bg-slate-800 text-white" : "text-slate-300"
          }`}
          onClick={() => setActiveTab("overview")}
        >
          Przegląd
        </button>
        <button
          className={`px-4 py-2 rounded-lg transition ${
            activeTab === "orders" ? "bg-slate-800 text-white" : "text-slate-300"
          }`}
          onClick={() => setActiveTab("orders")}
        >
          Zamówienia
        </button>
        <button
          className={`px-4 py-2 rounded-lg transition ${
            activeTab === "users" ? "bg-slate-800 text-white" : "text-slate-300"
          }`}
          onClick={() => setActiveTab("users")}
        >
          Użytkownicy
        </button>
      </div>

      {error && <div className="text-red-400 text-sm">{error}</div>}

      {activeTab === "overview" && (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="card">
            <p className="text-xs text-slate-400 mb-1">Łączna liczba zamówień</p>
            <p className="text-3xl font-semibold">{orders.length}</p>
            <p className="text-xs text-slate-500 mt-2">Ostatnie pobrane z WooCommerce i Baselinker</p>
          </div>
          <div className="card">
            <p className="text-xs text-slate-400 mb-1">Zamówienia WooCommerce</p>
            <p className="text-3xl font-semibold">{wooCount}</p>
            <p className="text-xs text-slate-500 mt-2">Dane z REST API sklepu</p>
          </div>
          <div className="card">
            <p className="text-xs text-slate-400 mb-1">Zamówienia Baselinker</p>
            <p className="text-3xl font-semibold">{blCount}</p>
            <p className="text-xs text-slate-500 mt-2">Dane z API Baselinker</p>
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Zamówienia</h2>
            {loadingOrders && <span className="text-sm text-slate-400">Ładowanie...</span>}
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {orders.map((o) => (
              <div key={o.id} className="card" style={{ padding: 16 }}>
                <div className="flex items-center justify-between mb-1 text-xs text-slate-400">
                  <span>{o.source === "woo" ? "WooCommerce" : "Baselinker"}</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 text-[11px] uppercase">
                    {o.status}
                  </span>
                </div>
                <div className="font-semibold mb-1">#{o.id}</div>
                <div className="text-slate-100 text-sm">Suma: {o.total}</div>
              </div>
            ))}
            {!loadingOrders && orders.length === 0 && (
              <div className="text-slate-400 text-sm">Brak zamówień (brak danych lub błąd API)</div>
            )}
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Użytkownicy</h2>
            {loadingUsers && <span className="text-sm text-slate-400">Ładowanie...</span>}
          </div>
          <div className="space-y-2 max-h-96 overflow-auto">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between border border-slate-800 rounded-lg px-3 py-2 text-sm"
              >
                <div>
                  <div className="font-medium">{u.email}</div>
                  <div className="text-xs text-slate-400">
                    Utworzono: {new Date(u.createdAt).toLocaleString("pl-PL")}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 text-[11px] uppercase">
                  {u.role}
                </span>
              </div>
            ))}
            {!loadingUsers && users.length === 0 && (
              <div className="text-slate-400 text-sm">Brak użytkowników w systemie.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
