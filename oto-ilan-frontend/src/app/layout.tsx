import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/providers/query-provider";
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Oto İlan - Türkiye'nin En Güvenilir Otomobil İlan Platformu",
    template: "%s | Oto İlan"
  },
  description: "Türkiye'nin en kapsamlı ikinci el araba pazarı. Binlerce otomobil ilanı, güvenli alım-satım ve profesyonel hizmet.",
  keywords: [
    "otomobil",
    "araba",
    "ikinci el",
    "satlık araba", 
    "oto ilan",
    "araç alım satım",
    "otomobil pazarı",
    "ikinci el araç"
  ],
  authors: [{ name: "Oto İlan Team" }],
  creator: "Oto İlan",
  publisher: "Oto İlan",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "/",
    title: "Oto İlan - Türkiye'nin En Güvenilir Otomobil İlan Platformu",
    description: "Türkiye'nin en kapsamlı ikinci el araba pazarı. Binlerce otomobil ilanı, güvenli alım-satım ve profesyonel hizmet.",
    siteName: "Oto İlan",
  },
  twitter: {
    card: "summary_large_image",
    title: "Oto İlan - Türkiye'nin En Güvenilir Otomobil İlan Platformu",
    description: "Türkiye'nin en kapsamlı ikinci el araba pazarı. Binlerce otomobil ilanı, güvenli alım-satım ve profesyonel hizmet.",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <QueryProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                border: '1px solid hsl(var(--border))',
              },
              success: {
                iconTheme: {
                  primary: 'hsl(var(--primary))',
                  secondary: 'white',
                },
              },
              error: {
                iconTheme: {
                  primary: 'hsl(var(--destructive))',
                  secondary: 'white',
                },
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
