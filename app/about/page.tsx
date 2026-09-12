import type { Metadata } from "next";
import Link from "next/link";
import { RodeoDailyLogoMark } from "../components/rodeo-views";
import { absoluteUrl } from "../lib/seo";

const contactEmail = "thewaymediaco@gmail.com";

export const metadata: Metadata = {
  title: "About Rodeo Daily",
  description:
    "Learn about Rodeo Daily, a rodeo standings, results, schedule, athlete profile, and rodeo data app built for fans following PRCA and WPRA rodeo.",
  alternates: {
    canonical: absoluteUrl("/about")
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/about"),
    title: "About Rodeo Daily",
    description:
      "Rodeo Daily helps rodeo fans follow PRCA and WPRA standings, results, schedules, athlete profiles, daysheets, and rodeo listings."
  },
  twitter: {
    card: "summary",
    title: "About Rodeo Daily",
    description:
      "Rodeo Daily helps rodeo fans follow PRCA and WPRA standings, results, schedules, athlete profiles, daysheets, and rodeo listings."
  }
};

const sections = [
  {
    title: "What Rodeo Daily Covers",
    body: [
      "Rodeo Daily is built around pro rodeo information that fans check repeatedly during the season: PRCA standings, WPRA standings, rodeo results, upcoming schedules, athlete profile pages, daysheets, payouts, NFR standings, and rodeo listings.",
      "The site is organized so a fan can move from an event standings page to an athlete profile, from a schedule listing to a rodeo detail page, or from a result to related standings context without digging through several separate sources."
    ]
  },
  {
    title: "Data Sources and Updates",
    body: [
      "Rodeo Daily uses PRCA, WPRA, and related rodeo data sources to organize standings, results, schedules, daysheets, rodeo pages, athlete links, and event information in a mobile-friendly format.",
      "Rodeo data can change as official associations post updates, correct results, finalize payouts, or publish new schedules. Rodeo Daily is intended as a fan-facing reference and points users back to official rodeo associations or rodeo offices for entries, rulings, and final operational decisions."
    ]
  },
  {
    title: "Editorial Approach",
    body: [
      "The main value of Rodeo Daily is not a traditional news feed. It is a structured rodeo reference: rankings by event, results by rodeo, schedule pages, athlete pages, and related links that make the season easier to follow.",
      "When Rodeo Daily publishes articles or context pages, they are meant to explain standings movement, results, athlete storylines, and NFR implications rather than replace official records."
    ]
  },
  {
    title: "Corrections and Contact",
    body: [
      `For corrections, data questions, app support, privacy requests, or advertising questions, contact Rodeo Daily at ${contactEmail}.`,
      "Helpful correction notes include the page URL, rodeo name, event, athlete name, date, and the official source that shows a different result or listing."
    ]
  }
];

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Rodeo Daily",
    url: absoluteUrl("/about"),
    about: "Rodeo Daily PRCA and WPRA standings, results, schedules, athlete profiles, daysheets, and rodeo listings.",
    publisher: {
      "@type": "Organization",
      name: "Rodeo Daily",
      url: absoluteUrl("/"),
      contactPoint: {
        "@type": "ContactPoint",
        email: contactEmail,
        contactType: "customer support"
      }
    }
  };

  return (
    <main className="seo-page privacy-page about-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c")
        }}
      />
      <section className="seo-page-shell privacy-page-shell">
        <header className="seo-page-header">
          <Link className="seo-page-brand" href="/">
            <RodeoDailyLogoMark />
            <span>Rodeo Daily</span>
          </Link>
          <Link className="seo-page-open-app" href="/">
            Open App
          </Link>
        </header>

        <section className="seo-page-hero privacy-hero">
          <span>About</span>
          <h1>About Rodeo Daily</h1>
          <p>
            Rodeo Daily helps fans follow PRCA and WPRA rodeo through standings, results, schedules, athlete profiles,
            rodeo detail pages, daysheets, payouts, listings, and NFR context.
          </p>
        </section>

        <section className="privacy-section-list" aria-label="About Rodeo Daily">
          {sections.map((section) => (
            <article className="app-card privacy-policy-section" key={section.title}>
              <h2>{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </article>
          ))}
        </section>

        <section className="app-card privacy-contact-card">
          <h2>Core Rodeo Pages</h2>
          <p>
            Start with standings, results, or schedule pages depending on what you are following during the rodeo season.
          </p>
          <nav className="seo-related-links" aria-label="Core Rodeo Daily pages">
            <Link href="/standings">Standings</Link>
            <Link href="/results">Results</Link>
            <Link href="/schedule">Schedule</Link>
            <Link href="/past-champions">Past Champions</Link>
            <Link href="/support">Support</Link>
            <Link href="/privacy">Privacy Policy</Link>
          </nav>
        </section>
      </section>
    </main>
  );
}
