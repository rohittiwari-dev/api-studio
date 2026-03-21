import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import { PWALoadingHider } from "@/components/pwa-loading-hider";
import { ServiceWorkerRegistration } from "@/components/sw-register";
import {
  APP_AUTHOR,
  APP_DESCRIPTION,
  APP_KEYWORDS,
  APP_NAME,
  APP_SOCIAL,
  APP_THUMBNAIL,
  APP_TITLE,
  APP_URL,
  OG_CONFIG,
} from "@/constants";
import SystemProviders from "@/lib/providers";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  // Basic metadata
  title: {
    default: APP_TITLE,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: APP_KEYWORDS,
  authors: [{ name: APP_AUTHOR.name, url: APP_AUTHOR.url }],
  creator: APP_AUTHOR.name,
  publisher: APP_NAME,

  // URL & Canonical
  metadataBase: new URL(APP_URL),
  alternates: {
    canonical: "/",
  },

  // Open Graph
  openGraph: {
    type: OG_CONFIG.type as "website",
    locale: OG_CONFIG.locale,
    url: APP_URL,
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    siteName: OG_CONFIG.siteName,
    images: [
      {
        url: APP_THUMBNAIL,
        width: 1200,
        height: 630,
        alt: `${APP_NAME} - API Testing Tool`,
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    creator: APP_SOCIAL.twitter,
    images: [APP_THUMBNAIL],
  },

  // Robots & Indexing
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Icons
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },

  // App-specific
  applicationName: APP_NAME,
  category: "Developer Tools",

  // PWA & Mobile App
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },

  // Additional SEO
  other: {
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#0a0a0a",
    "msapplication-tap-highlight": "no",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="mask-icon" href="/logo.png" color="#0a0a0a" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        {/* ── Instant inline loading splash (pure CSS, renders before JS) ── */}
        <div id="pwa-splash" aria-hidden="true">
          <div className="pwa-splash__bg">
            <div className="pwa-splash__blob pwa-splash__blob--1" />
            <div className="pwa-splash__blob pwa-splash__blob--2" />
          </div>
          <div className="pwa-splash__content">
            <div className="pwa-splash__ring">
              <div className="pwa-splash__ring-track" />
              {/** biome-ignore lint/performance/noImgElement: needed locally */}
              <img
                src="/logo.png"
                alt=""
                width={32}
                height={32}
                className="pwa-splash__logo"
              />
            </div>
            <p className="pwa-splash__title">Api Studio</p>
            <div className="pwa-splash__bar">
              <div className="pwa-splash__bar-fill" />
            </div>
          </div>
        </div>

        <ServiceWorkerRegistration>
          <PWALoadingHider />
          <NextTopLoader
            color="#8b5cf6"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="linear"
            speed={200}
            shadow="0 0 10px #8b5cf6, 0 0 5px #a78bfa"
          />
          <SystemProviders>{children}</SystemProviders>
        </ServiceWorkerRegistration>
      </body>
    </html>
  );
}
