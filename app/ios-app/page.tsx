import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { RodeoDailyLogoMark } from "../components/rodeo-views";
import { absoluteUrl } from "../lib/seo";

const appStoreUrl = "https://apps.apple.com/us/app/rodeo-daily/id1671624492";

export const metadata: Metadata = {
  title: "Rodeo Daily iPhone App",
  description:
    "Download Rodeo Daily for iPhone to follow PRCA standings, WPRA standings, rodeo results, schedules, daysheets, athlete profiles, favorites, and rodeo updates.",
  alternates: {
    canonical: absoluteUrl("/ios-app")
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/ios-app"),
    title: "Rodeo Daily iPhone App",
    description:
      "Follow PRCA standings, WPRA standings, rodeo results, schedules, daysheets, athlete profiles, favorites, and rodeo updates from your iPhone."
  },
  twitter: {
    card: "summary",
    title: "Rodeo Daily iPhone App",
    description:
      "Download Rodeo Daily for iPhone to follow standings, results, schedules, daysheets, athlete profiles, and rodeo updates."
  }
};

const featureCards = [
  {
    title: "Standings",
    body: "Follow PRCA and WPRA standings by season, event, circuit, and standings type."
  },
  {
    title: "Results",
    body: "Track rodeo results, round placings, average results, payouts, and recent updates."
  },
  {
    title: "Schedule",
    body: "Find upcoming rodeos, date ranges, locations, daysheets, and event details."
  },
  {
    title: "Athletes",
    body: "Open athlete profiles with stats, results, career history, highlights, and bio links."
  },
  {
    title: "Favorites",
    body: "Keep followed athletes and rodeo information close without digging through lists."
  },
  {
    title: "Rodeo Reference",
    body: "Browse NFR information, past champions, rodeo listings, and useful rodeo resources."
  }
];

const appHighlights = [
  "PRCA world standings and circuit standings",
  "WPRA barrel racing and breakaway standings",
  "Rodeo results with round and average results",
  "Schedules, daysheets, rodeo details, and listings",
  "Athlete profiles with stats, results, career, highlights, and bio links",
  "Favorites and quick access to followed rodeo content"
];

export default function IosAppMarketingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Rodeo Daily",
    applicationCategory: "SportsApplication",
    operatingSystem: "iOS",
    url: absoluteUrl("/ios-app"),
    installUrl: appStoreUrl,
    image: absoluteUrl("/rodeo-daily-icon.png"),
    description:
      "Rodeo Daily is an iPhone app for PRCA standings, WPRA standings, rodeo results, schedules, daysheets, athlete profiles, favorites, and rodeo updates.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    },
    publisher: {
      "@type": "Organization",
      name: "Rodeo Daily",
      url: absoluteUrl("/")
    }
  };

  return (
    <main className="marketing-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c")
        }}
      />
      <section className="marketing-shell">
        <header className="marketing-header">
          <Link className="seo-page-brand" href="/">
            <RodeoDailyLogoMark />
            <span>Rodeo Daily</span>
          </Link>
          <nav className="marketing-header-links" aria-label="Rodeo Daily links">
            <Link href="/support">Support</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/">Web App</Link>
          </nav>
        </header>

        <section className="marketing-hero">
          <div className="marketing-hero-copy">
            <Image
              className="marketing-app-icon"
              src="/rodeo-daily-icon.png"
              width={88}
              height={88}
              alt="Rodeo Daily app icon"
              priority
            />
            <span>Rodeo Daily for iPhone</span>
            <h1>Follow rodeo standings, results, schedules, and athletes from one app.</h1>
            <p>
              Rodeo Daily brings PRCA standings, WPRA standings, rodeo results, schedules, daysheets, athlete profiles,
              favorites, and rodeo reference tools into a fast iPhone experience.
            </p>
            <div className="marketing-cta-row">
              <a href={appStoreUrl} target="_blank" rel="noreferrer" aria-label="Download Rodeo Daily on the App Store">
                <Image src="/app-store-badge.svg" width={162} height={54} alt="Download on the App Store" priority />
              </a>
              <Link className="marketing-web-link" href="/">
                Open Web App
              </Link>
            </div>
          </div>

          <div className="marketing-phone-preview" aria-label="Rodeo Daily app preview">
            <div className="marketing-phone-screen">
              <div className="marketing-preview-card marketing-preview-filter">
                <strong>Standings</strong>
                <span>Tie-Down Roping</span>
                <em>2026 World Standings</em>
              </div>
              <div className="marketing-preview-row">
                <b>#1</b>
                <div>
                  <strong>Riley Webb</strong>
                  <span>Denton, TX</span>
                </div>
                <em>$279,558</em>
              </div>
              <div className="marketing-preview-row">
                <b>#2</b>
                <div>
                  <strong>Haven Meged</strong>
                  <span>Miles City, MT</span>
                </div>
                <em>$204,146</em>
              </div>
              <div className="marketing-preview-row">
                <b>#3</b>
                <div>
                  <strong>Kincade Henry</strong>
                  <span>Mount Pleasant, TX</span>
                </div>
                <em>$183,677</em>
              </div>
            </div>
          </div>
        </section>

        <section className="marketing-feature-grid" aria-label="Rodeo Daily iPhone app features">
          {featureCards.map((feature) => (
            <article className="app-card marketing-feature-card" key={feature.title}>
              <h2>{feature.title}</h2>
              <p>{feature.body}</p>
            </article>
          ))}
        </section>

        <section className="app-card marketing-list-section">
          <div>
            <span>Built For Rodeo Fans</span>
            <h2>Everything you check during rodeo season, organized for quick access.</h2>
          </div>
          <ul>
            {appHighlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        </section>

        <section className="marketing-footer-cta">
          <h2>Download Rodeo Daily on the App Store.</h2>
          <p>
            Use Rodeo Daily on iPhone for the full app experience, or open the web app when you are on another device.
          </p>
          <div className="marketing-cta-row">
            <a href={appStoreUrl} target="_blank" rel="noreferrer" aria-label="Download Rodeo Daily on the App Store">
              <Image src="/app-store-badge.svg" width={162} height={54} alt="Download on the App Store" />
            </a>
            <Link className="marketing-web-link" href="/support">
              Contact Support
            </Link>
          </div>
        </section>

        <footer className="seo-page-footer" aria-label="Rodeo Daily legal and support links">
          <Link href="/support">Support</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/">Open Web App</Link>
        </footer>
      </section>
    </main>
  );
}
