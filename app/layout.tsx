import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rodeo Daily",
  description: "A fast PWA for rodeo schedules, results, standings, and athlete watchlists.",
  applicationName: "Rodeo Daily",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Rodeo Daily"
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-touch-icon.svg"
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
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
