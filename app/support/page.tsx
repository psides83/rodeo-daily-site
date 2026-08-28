import type { Metadata } from "next";
import Link from "next/link";
import { RodeoDailyLogoMark } from "../components/rodeo-views";
import { localeAlternates } from "../components/localized-public-pages";
import { absoluteUrl } from "../lib/seo";

const contactEmail = "thewaymediaco@gmail.com";
const appStoreUrl = "https://apps.apple.com/us/app/rodeo-daily/id1671624492";
const supportMailto =
  "mailto:thewaymediaco@gmail.com?subject=Rodeo%20Daily%20Support&body=Tell%20us%20what%20you%20were%20trying%20to%20do%2C%20what%20happened%2C%20and%20what%20device%20or%20browser%20you%20were%20using.";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Get support for Rodeo Daily, including the iOS app, web app, PWA, PRCA standings, rodeo results, schedules, athlete profiles, ads, and privacy.",
  alternates: {
    canonical: absoluteUrl("/support"),
    languages: localeAlternates("support")
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/support"),
    title: "Support | Rodeo Daily",
    description:
      "Contact Rodeo Daily support and find help for the iOS app, web app, PWA, PRCA standings, rodeo results, schedules, athlete profiles, ads, and privacy."
  },
  twitter: {
    card: "summary",
    title: "Support | Rodeo Daily",
    description:
      "Contact Rodeo Daily support and find help for the iOS app, web app, PWA, PRCA standings, rodeo results, schedules, athlete profiles, ads, and privacy."
  }
};

const helpSections = [
  {
    title: "Before You Email",
    body: [
      "Include the device you are using, the app version or browser, the page you were on, the rodeo or athlete name if one is involved, and a screenshot when possible.",
      "For bugs, the most helpful report includes what you expected to happen, what actually happened, and the steps that caused the issue."
    ]
  },
  {
    title: "iOS App Help",
    body: [
      "If the iPhone app is not showing the latest standings, results, or schedules, first check the App Store for an update and then fully close and reopen Rodeo Daily.",
      "Favorites, followed athletes, notification choices, and display preferences may be stored on your device. Deleting the app can remove device-local settings."
    ]
  },
  {
    title: "Web App and PWA Help",
    body: [
      "If you installed Rodeo Daily with Add to Home Screen, your browser may cache app files so the PWA opens quickly. Reloading the page or removing and re-adding the PWA can help after a site update.",
      "The website stores device-local choices such as favorites, consent settings, and dismissed banners in your browser. Clearing site data can reset those choices."
    ]
  },
  {
    title: "Rodeo Data Questions",
    body: [
      "Rodeo Daily displays rodeo standings, results, schedules, daysheets, athlete profiles, and related information from PRCA, WPRA, and other rodeo data sources.",
      "If a result, ranking, or schedule looks different from an official rodeo source, it may be caused by source timing, corrections, or delayed updates. For official entries, payouts, or final rulings, contact the official association or rodeo office."
    ]
  },
  {
    title: "Ads and Privacy",
    body: [
      "Rodeo Daily may show ads in the iOS app and on the website. Web ad choices can be managed from the app settings on this site.",
      "Privacy details, advertising information, browser storage, and user choices are covered in the Rodeo Daily Privacy Policy."
    ],
    link: {
      href: "/privacy",
      label: "Read the Privacy Policy"
    }
  },
  {
    title: "Feature Requests",
    body: [
      "Feature requests are welcome. Include the part of the app you are using, the rodeo workflow you are trying to improve, and why the change would help.",
      "Examples include new standings filters, athlete profile improvements, schedule tools, daysheet details, or better ways to follow favorites."
    ]
  }
];

export default function SupportPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Rodeo Daily Support",
    url: absoluteUrl("/support"),
    about: "Support for Rodeo Daily iOS app, web app, PWA, PRCA standings, rodeo results, schedules, and athlete profiles.",
    publisher: {
      "@type": "Organization",
      name: "Rodeo Daily",
      url: absoluteUrl("/")
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: contactEmail,
      contactType: "customer support",
      availableLanguage: "English"
    }
  };

  return (
    <main className="seo-page privacy-page support-page">
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
          <span>Support</span>
          <h1>Rodeo Daily Support</h1>
          <p>
            Get help with the Rodeo Daily iOS app, web app, PWA, PRCA standings, rodeo results, schedules, athlete
            profiles, ads, and privacy settings.
          </p>
        </section>

        <section className="app-card privacy-summary-card support-contact-card" aria-label="Contact support">
          <h2>Contact Support</h2>
          <p>
            For app support, bug reports, feature requests, or data questions, email{" "}
            <a href={supportMailto}>{contactEmail}</a>.
          </p>
          <div className="support-action-row">
            <a className="support-primary-action" href={supportMailto}>
              Email Support
            </a>
            <a className="support-secondary-action" href={appStoreUrl} target="_blank" rel="noreferrer">
              View iOS App
            </a>
          </div>
        </section>

        <section className="privacy-section-list" aria-label="Support topics">
          {helpSections.map((section) => (
            <article className="app-card privacy-policy-section" key={section.title}>
              <h2>{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.link ? (
                <p>
                  <Link href={section.link.href}>{section.link.label}</Link>
                </p>
              ) : null}
            </article>
          ))}
        </section>

        <section className="app-card privacy-contact-card">
          <h2>Response Notes</h2>
          <p>
            Rodeo Daily support is handled by email. This support page is not an official rodeo association support desk,
            and it is not used for rodeo entries, payout disputes, medical emergencies, or time-sensitive event operations.
          </p>
          <p className="privacy-note">
            Previous Calf Roping Daily support directed iOS app users to {contactEmail}. This updated page expands support
            coverage for Rodeo Daily on iPhone, web, and PWA installs.
          </p>
        </section>

        <footer className="seo-page-footer" aria-label="Rodeo Daily legal and support links">
          <Link href="/ios-app">iOS App</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/">Open App</Link>
        </footer>
      </section>
    </main>
  );
}
