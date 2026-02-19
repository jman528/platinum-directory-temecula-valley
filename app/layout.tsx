import type { Metadata, Viewport } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Platinum Directory — Temecula Valley's Verified Business Directory",
    template: "%s | Platinum Directory",
  },
  description:
    "Discover verified local businesses in Temecula Valley. Wine country dining, premium services, and exclusive deals from trusted businesses across 11 cities.",
  keywords: [
    "Temecula Valley", "business directory", "local businesses", "wineries",
    "restaurants", "Temecula", "Murrieta", "verified businesses", "platinum directory",
  ],
  authors: [{ name: "Platinum Directory" }],
  creator: "Platinum Directory",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Platinum Directory",
    title: "Platinum Directory — Temecula Valley's Verified Business Directory",
    description: "Discover verified local businesses in Temecula Valley. Wine country dining, premium services, and exclusive deals.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Platinum Directory — Temecula Valley",
    description: "Discover verified local businesses in Temecula Valley.",
  },
  robots: { index: true, follow: true },
  icons: { icon: "/logo.png", apple: "/logo.png" },
};

export const viewport: Viewport = {
  themeColor: "#0A0F1A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://api.mapbox.com" />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <a href="#main" className="skip-link">Skip to main content</a>
        {children}
        <Toaster />
        <SpeedInsights />
      </body>
    </html>
  );
}
