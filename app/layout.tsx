import type { Metadata, Viewport } from "next";
import { absoluteUrl, seoKeywords, siteDescription, siteUrl } from "./lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Rodeo Daily | PRCA Results, PRCA Standings & Rodeo Standings",
    template: "%s | Rodeo Daily"
  },
  description: siteDescription,
  keywords: seoKeywords,
  applicationName: "Rodeo Daily",
  alternates: {
    canonical: absoluteUrl("/")
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Rodeo Daily"
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/rodeo-daily-icon.png",
    shortcut: "/rodeo-daily-icon.png",
    apple: "/apple-touch-icon.png"
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/"),
    siteName: "Rodeo Daily",
    title: "Rodeo Daily | PRCA Results, PRCA Standings & Rodeo Standings",
    description: siteDescription
  },
  twitter: {
    card: "summary",
    title: "Rodeo Daily | PRCA Results, PRCA Standings & Rodeo Standings",
    description: siteDescription
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },
  other: {
    "google-adsense-account": "ca-pub-4837925489125062"
  }
};

export const viewport: Viewport = {
  themeColor: "#15130f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Rodeo Daily",
    url: siteUrl,
    description: siteDescription,
    applicationCategory: "SportsApplication",
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl("/")}?tab=standings&q={search_term_string}`,
      "query-input": "required name=search_term_string"
    },
    about: [
      "PRCA results",
      "PRCA standings",
      "rodeo results",
      "rodeo standings",
      "NFR standings"
    ]
  };

  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c")
          }}
        />
        {children}
      </body>
    </html>
  );
}
