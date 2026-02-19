import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SanityLive } from "@/lib/sanity/live";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Platinum Directory | Temecula Valley's Premium Business Guide",
    template: "%s | Platinum Directory",
  },
  description:
    "Discover Temecula Valley's finest businesses. Platinum Directory is the premium guide to wine country's restaurants, wineries, spas, and more.",
  keywords: [
    "Temecula Valley",
    "business directory",
    "Temecula restaurants",
    "Temecula wineries",
    "local businesses",
    "wine country",
    "premium directory",
    "Old Town Temecula",
    "Temecula spa",
  ],
  authors: [{ name: "Platinum Directory" }],
  creator: "Platinum Directory",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Platinum Directory",
    title: "Platinum Directory | Temecula Valley's Premium Business Guide",
    description:
      "Discover Temecula Valley's finest businesses. The premium guide to wine country.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Platinum Directory | Temecula Valley's Premium Business Guide",
    description:
      "Discover Temecula Valley's finest businesses. The premium guide to wine country.",
  },
  robots: { index: true, follow: true },
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
        </head>
        <body
          className={`${inter.variable} ${playfair.variable} font-sans antialiased`}
          suppressHydrationWarning
        >
          {children}
          <Toaster />
          <SanityLive />
        </body>
      </html>
    </ClerkProvider>
  );
}
