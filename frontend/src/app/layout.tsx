import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DukaOS - Merchant OS Tanzania",
  description: "Stock, mauzo, na maagizo kwa maduka madogo Tanzania",
  manifest: "/manifest.json",
  themeColor: "#16a34a",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sw">
      <body>{children}</body>
    </html>
  );
}
