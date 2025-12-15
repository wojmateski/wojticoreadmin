export default function Home() {
  return (
    <div className="card" style={{ width: "100%", maxWidth: 520 }}>
      <h1 className="text-2xl font-semibold mb-3">Wojticore SSO</h1>
      <p className="text-sm text-slate-300 mb-6">
        Minimalny punkt startowy: wybierz logowanie lub panel admina.
      </p>
      <div className="flex gap-3">
        <a className="button-primary" href="/login">Logowanie / Rejestracja</a>
        <a className="button-primary" href="/admin" style={{ background: "#0ea5e9" }}>
          Panel administracyjny
        </a>
      </div>
    </div>
  );
}
