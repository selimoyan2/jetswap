import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/i18n";
import { WebSiteJsonLd, OrganizationJsonLd } from "@/components/seo/json-ld";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://jetswap.com.tr'),
  title: {
    default: "JetSwap | Para Trafiği Olmayan Küresel Takas Platformu",
    template: "%s | JetSwap"
  },
  description: "Cebinden 1 TL bile çıkmasın! Kullanmadığın eşyalarını portföyüne ekle, JetMatch akıllı eşleşme motoruyla anında eşleş ve kameralı güvenli noktalarda güvenle takasla. %100 nakitsiz takas ve döngüsel ekonomi platformu.",
  keywords: [
    "takas",
    "takas siteleri",
    "eşya takası",
    "para olmadan takas",
    "nakitsiz alışveriş",
    "barter",
    "barter platformu",
    "sıfır nakit takas",
    "ikinci el takas",
    "telefon takası",
    "laptop takası",
    "güvenli takas",
    "jetswap",
    "döngüsel ekonomi",
    "zero cash swap",
    "peer to peer barter",
    "online barter trading",
    "swap items without money"
  ],
  authors: [{ name: "JetSwap Global", url: "https://jetswap.com.tr" }],
  creator: "JetSwap Global Network",
  publisher: "JetSwap Global Network",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
    languages: {
      'tr-TR': 'https://jetswap.com.tr?lang=tr',
      'en-US': 'https://jetswap.com.tr?lang=en',
    },
  },
  openGraph: {
    title: "JetSwap | Para Trafiği Olmayan Küresel Takas Platformu",
    description: "Cebinden para çıkmasın. %100 nakitsiz eşyadan eşyaya takas yap, döngüsel ekonomiye katıl. Akıllı JetMatch ve güvenli buluşma noktaları.",
    url: 'https://jetswap.com.tr',
    siteName: 'JetSwap',
    locale: 'tr_TR',
    alternateLocale: ['en_US'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "JetSwap | Sıfır Nakit Küresel Takas Platformu",
    description: "Eşyalarını nakit harcamadan güvenle takasla. Akıllı öneri motoru ve doğrulanmış kameralı güvenli alanlar.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "JetSwap",
  },
};

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
      <head>
        <WebSiteJsonLd />
        <OrganizationJsonLd />
      </head>
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
