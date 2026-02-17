import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter, Montserrat } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SanityLive } from "@/lib/sanity/live";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Platinum Directory — Temecula Valley's Verified Business Directory",
    template: "%s | Platinum Directory",
  },
  description:
    "Discover verified local businesses in Temecula Valley. Wine country dining, premium services, and exclusive deals from trusted businesses across 11 cities.",
  keywords: [
    "Temecula Valley",
    "business directory",
    "local businesses",
    "wineries",
    "restaurants",
    "Temecula",
    "Murrieta",
    "verified businesses",
    "platinum directory",
  ],
  authors: [{ name: "Platinum Directory" }],
  creator: "Platinum Directory",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Platinum Directory",
    title: "Platinum Directory — Temecula Valley's Verified Business Directory",
    description:
      "Discover verified local businesses in Temecula Valley. Wine country dining, premium services, and exclusive deals.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Platinum Directory — Temecula Valley",
    description:
      "Discover verified local businesses in Temecula Valley. Wine country dining, premium services, and exclusive deals.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0F1A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://cdn.sanity.io" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link rel="preconnect" href="https://api.mapbox.com" />
        </head>
        <body
          className={`${inter.variable} ${montserrat.variable} ${geistMono.variable} font-body antialiased`}
        >
          <a href="#main" className="skip-link">
            Skip to main content
          </a>
          {children}
          <Toaster />
          <SanityLive />
        </body>
      </html>
    </ClerkProvider>
  );
}
