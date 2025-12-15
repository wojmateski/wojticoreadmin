export default function Home() {
  return (
    <div className="card" style={{ width: "100%", maxWidth: 520 }}>
      <h1 className="text-3xl font-semibold mb-2">Wojticore Account</h1>
      <p className="text-sm text-slate-300 mb-5">
        Jedno miejsce do zarządzania Twoim kontem i dostępem do usług Wojticore.
      </p>
      <div className="space-y-3">
        <a className="button-primary w-full justify-center" href="/login">
          Zaloguj się / Zarejestruj
        </a>
        <p className="text-xs text-slate-400 text-center">
          Po zalogowaniu administratorzy zostaną automatycznie przekierowani do panelu administracyjnego.
        </p>
      </div>
    </div>
  );
}
