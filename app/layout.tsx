import "../styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wojticore Login",
  description: "SSO dla Wojticore (WooCommerce + Baselinker)"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body>
        <main className="min-h-screen flex flex-col items-center justify-center p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
