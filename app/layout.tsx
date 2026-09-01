import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { ThemeSync } from "./components/theme-sync";
import { appSettingsStorageKey } from "./lib/local-preferences";
import { absoluteUrl, seoKeywords, siteDescription, siteUrl } from "./lib/seo";
import { darkThemeVariables, defaultSettings, themeVariables } from "./lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Rodeo Daily | PRCA Results, PRCA Standings & Pro Rodeo Results",
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
    title: "Rodeo Daily | PRCA Results, PRCA Standings & Pro Rodeo Results",
    description: siteDescription
  },
  twitter: {
    card: "summary",
    title: "Rodeo Daily | PRCA Results, PRCA Standings & Pro Rodeo Results",
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

function themeInitScript() {
  return `
(function() {
  try {
    var root = document.documentElement;
    var stored = window.localStorage.getItem(${JSON.stringify(appSettingsStorageKey)});
    var settings = Object.assign(${JSON.stringify(defaultSettings)}, stored ? JSON.parse(stored) : {});
    var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    var resolved = settings.appearanceMode === "device" ? (prefersDark ? "dark" : "light") : settings.appearanceMode;
    var lightThemes = ${JSON.stringify(themeVariables)};
    var darkTheme = ${JSON.stringify(darkThemeVariables)};
    var variables = resolved === "dark" ? darkTheme : lightThemes[settings.accentTheme] || lightThemes.classic;

    root.dataset.theme = resolved;
    root.dataset.appearanceMode = settings.appearanceMode || "device";
    root.dataset.compactLists = settings.compactLists ? "true" : "false";
    root.style.colorScheme = resolved;

    for (var key in variables) {
      root.style.setProperty(key, variables[key]);
    }
  } catch (error) {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.dataset.theme = "dark";
      document.documentElement.style.colorScheme = "dark";
    }
  }
})();`;
}

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
      "pro rodeo results",
      "WPRA results",
      "WPRA standings",
      "pro rodeo news",
      "rodeo news",
      "rodeo results",
      "rodeo standings",
      "NFR standings"
    ]
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript() }} />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c")
          }}
        />
        <ThemeSync />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
