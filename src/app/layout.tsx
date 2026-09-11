import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JetSwap | Para Trafiği Olmayan Küresel Takas Platformu",
  description: "Cebinden para çıkmasın. Kullanmadığın eşyalarını portföyüne ekle, ne ile takas etmek istediğini seç, akıllı öneri motoruyla eşleş ve güvenle takas et. %100 nakitsiz takas ekonomisi.",
  keywords: ["takas", "barter", "para olmadan takas", "eşya takası", "jetswap", "nakitsiz ekonomi", "küresel takas platformu"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "JetSwap",
  },
};

import { LanguageProvider } from "@/i18n";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
