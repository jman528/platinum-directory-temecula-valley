import type { Metadata, Viewport } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "@/components/ui/sonner";
import { OrganizationSchema } from "@/components/seo/StructuredData";
import { GTMHead, GTMBody, MetaPixel, TikTokPixel } from "@/components/AnalyticsPixels";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://platinumdirectorytemeculavalley.com'),
  title: {
    default: 'Platinum Directory Temecula Valley | Local Businesses, Wineries & Deals',
    template: '%s | Platinum Directory Temecula Valley',
  },
  description: 'Discover the best local businesses, wineries, restaurants, and attractions in Temecula Valley. Find exclusive deals, Smart Offers, and earn rewards. Your guide to Temecula Valley, CA.',
  keywords: [
    'Temecula Valley businesses', 'Temecula wineries', 'Temecula restaurants',
    'things to do Temecula', 'Temecula local deals', 'Temecula wine country',
    'Old Town Temecula', 'Temecula Valley CA', 'best wineries Temecula',
    'Temecula Valley directory', 'local businesses Temecula', 'Temecula attractions',
    'Murrieta businesses', 'Hemet directory', 'Menifee local',
  ],
  authors: [{ name: 'Platinum Directory Temecula Valley' }],
  creator: 'Platinum Directory',
  publisher: 'Platinum Directory',
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://platinumdirectorytemeculavalley.com',
    siteName: 'Platinum Directory Temecula Valley',
    title: 'Platinum Directory Temecula Valley | Discover Local Businesses & Deals',
    description: 'The premier local business directory for Temecula Valley, CA. Wineries, restaurants, spas, and exclusive Smart Offers.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Platinum Directory Temecula Valley',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Platinum Directory Temecula Valley',
    description: 'Discover local businesses, wineries, and exclusive deals in Temecula Valley, CA.',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://platinumdirectorytemeculavalley.com',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  },
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
        <GTMHead />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <GTMBody />
        <MetaPixel />
        <TikTokPixel />
        <a href="#main" className="skip-link">Skip to main content</a>
        <OrganizationSchema />
        {children}
        <Toaster />
        <SpeedInsights />
      </body>
    </html>
  );
}
