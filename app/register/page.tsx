"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const params = new URLSearchParams(window.location.search);
      const target = params.get("target");

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, target })
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // brak JSON (np. 500 bez body)
      }

      if (!res.ok) {
        throw new Error(data?.message || "Błąd rejestracji (serwer)");
      }

      window.location.href = data?.redirectUrl ?? "/";
    } catch (err: any) {
      setError(err.message || "Nieznany błąd");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ width: "100%", maxWidth: 480 }}>
      <h1 className="text-2xl font-semibold mb-2">Rejestracja</h1>
      <p className="text-sm text-slate-300 mb-4">
        Konto tworzone jest w IdP Wojticore i synchronizowane do WooCommerce.
      </p>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="space-y-1">
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="label">Hasło</label>
          <input
            className="input"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <div className="text-red-400 text-sm">{error}</div>}
        <button className="button-primary w-full" disabled={loading} type="submit">
          {loading ? "Tworzenie..." : "Załóż konto"}
        </button>
        <p className="text-sm text-center text-slate-400">
          Masz konto? <a href="/login">Zaloguj się</a>
        </p>
      </form>
    </div>
  );
}
