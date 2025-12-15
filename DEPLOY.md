# Wojticore SSO (Next.js + MySQL + Woo + Baselinker)

## Wymagania
- Node 18+
- MySQL 8 (lub MariaDB)
- Dostęp do API WooCommerce (klucz + sekret)
- Token Baselinker

## Instalacja lokalnie
```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Ustaw `.env` na podstawie `.env.example`.

## Struktura
- `app/` – Next.js App Router: `/login`, `/register`, `/admin`.
- `app/api/auth/*` – logowanie, rejestracja, refresh, profil (JWT + refresh cookie).
- `app/api/admin/orders` – łączy zamówienia z Woo i Baselinker.
- `lib/` – helpery (Prisma, JWT, Woo, Baselinker).
- `prisma/schema.prisma` – model `User`, `RefreshToken`.
- `wp-plugin/wojticore-sso.php` – wtyczka (MU) do WordPressa/WooCommerce.

## Wtyczka WordPress
1. Skopiuj `wp-plugin/wojticore-sso.php` do `wp-content/mu-plugins/` (utwórz katalog jeśli go nie ma).
2. W `.htaccess` / serwerze ustaw stały HTTPS.
3. W `.env` WordPressa ustaw `JWT_SECRET`, `JWT_ISS`, `JWT_AUD` zgodne z IdP.
4. Endpoint: `https://home.wojticore.pl/wp-json/wojticore-sso/v1/consume?token=...&target=wp-admin`.

## Flow SSO
- Klient klika „Moje konto” → redirect do `login.wojticore.pl?redirect=home`.
- Logowanie/rejestracja → `/api/auth/login` wystawia `accessToken` + refresh cookie, redirect wg roli.
- WP wtyczka weryfikuje token (HS256), zakłada/loguje użytkownika, przekierowuje do konta / wp-admin.

## Deploy na hostingu współdzielonym (przykład)
1. Zainstaluj Node 18+ i PM2 (jeśli możliwe): `npm install -g pm2`.
2. `npm install --production` w katalogu projektu.
3. `npm run build` → generuje `.next/standalone` (jeśli włączysz output standalone) lub użyj `next start`.
4. Uruchom: `pm2 start npm --name wojticore-sso -- start`.
5. Reverse proxy (Apache/Nginx) na `login.wojticore.pl` i `admin.wojticore.pl` kieruje do portu aplikacji (np. 3000), SSL przez Let’s Encrypt.
6. Ustaw cron/monitoring PM2 dla restarta.

## Ustawienia środowiskowe
- `NEXT_PUBLIC_APP_URL` – adres publiczny Next (np. https://login.wojticore.pl).
- `DATABASE_URL` – połączenie MySQL.
- `JWT_SECRET` – klucz HS256 (wspólny z WP).
- `JWT_ISS`, `JWT_AUD` – identyfikatory żetonu (muszą zgadzać się w WP).
- `WOO_BASE_URL`, `WOO_CONSUMER_KEY`, `WOO_CONSUMER_SECRET` – dostęp do Woo.
- `BASELINKER_API_TOKEN` – dostęp do Baselinker.

## Notatki
- Endpointy są minimalne – dodaj walidację, logi, rate limiting.
- Refresh token jest trzymany w cookie `wojticore_refresh` (httpOnly, secure).
- Admin domyślnie kieruje na `/admin`, z którego wybierasz wp-admin lub panel zewnętrzny.
