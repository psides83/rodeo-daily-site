import type { Metadata } from "next";
import Link from "next/link";
import { RodeoDailyLogoMark } from "../components/rodeo-views";
import { absoluteUrl } from "../lib/seo";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the Rodeo Daily privacy policy for the iOS app, web app, PWA, advertising, cookies, local preferences, and rodeo data sources.",
  alternates: {
    canonical: absoluteUrl("/privacy")
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/privacy"),
    title: "Privacy Policy | Rodeo Daily",
    description:
      "How Rodeo Daily handles privacy for the iOS app, web app, PWA, advertising, cookies, local preferences, and rodeo data sources."
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy | Rodeo Daily",
    description:
      "How Rodeo Daily handles privacy for the iOS app, web app, PWA, advertising, cookies, local preferences, and rodeo data sources."
  }
};

const updatedDate = "August 28, 2026";
const contactEmail = "thewaymediaco@gmail.com";

const sections = [
  {
    title: "Information Rodeo Daily Collects",
    body: [
      "Rodeo Daily is designed primarily as an informational rodeo app. You can browse standings, results, schedules, daysheets, athlete profiles, past champions, and rodeo listings without creating an account.",
      "The app and website may collect limited information you provide directly, such as an email message if you contact support. The app may also store preferences on your device, including favorite athletes, followed athletes, display settings, ad consent choices, and app banner dismissals."
    ]
  },
  {
    title: "Information Collected Automatically",
    body: [
      "When you use the website, standard technical information may be processed by hosting, browser, analytics, advertising, or security systems. This can include your IP address, browser type, device type, operating system, pages viewed, referring pages, approximate location inferred from IP address, and interaction data.",
      "The iOS app may process device-level information needed to operate app features, measure performance, show ads, diagnose problems, and improve the experience."
    ]
  },
  {
    title: "Cookies, Local Storage, and PWA Storage",
    body: [
      "The Rodeo Daily website uses browser storage to remember choices on the same device, including privacy choices, favorites, followed athletes, compact list settings, theme settings, and whether promotional banners have been dismissed.",
      "If you install Rodeo Daily as a Progressive Web App, your browser may also cache app files so the site launches quickly. You can clear this data through your browser settings, site settings, or device storage settings."
    ]
  },
  {
    title: "Advertising",
    body: [
      "Rodeo Daily may show ads in the iOS app and on the website. The previous Calf Roping Daily policy covered AdMob advertising. Rodeo Daily may use Google advertising services, including Google AdMob in the iOS app and Google AdSense on the website.",
      "Advertising providers may use cookies, device identifiers, usage data, and similar technologies to deliver ads, measure ad performance, prevent fraud, cap ad frequency, and personalize ads where permitted. On the website, Rodeo Daily provides choices for personalized ads, basic non-personalized ads, or declining ad cookies where supported."
    ]
  },
  {
    title: "How Information Is Used",
    body: [
      "Rodeo Daily uses information to provide app and website features, remember preferences, show rodeo content, maintain favorites, improve performance, troubleshoot issues, respond to support requests, measure usage, display ads, comply with legal obligations, and protect the service from abuse.",
      "Rodeo Daily does not sell personal information directly to data brokers. Some advertising practices may be considered sharing or targeted advertising under certain privacy laws, depending on your location and the ad settings you choose."
    ]
  },
  {
    title: "Rodeo Data and Third-Party Sources",
    body: [
      "Rodeo Daily displays rodeo-related information such as standings, results, schedules, daysheets, athlete profiles, rankings, earnings, photos, and listings from third-party rodeo data sources and publicly available sources.",
      "That rodeo content may include athlete names, hometowns, photos, earnings, competition results, rankings, and other professional rodeo information. Rodeo Daily uses this information to provide sports reporting, reference, and fan-facing app features."
    ]
  },
  {
    title: "How Information Is Shared",
    body: [
      "Rodeo Daily may share information with service providers that help operate the app or website, such as hosting providers, analytics providers, advertising providers, error monitoring services, and support tools.",
      "Information may also be disclosed if required by law, to protect rights and safety, to prevent fraud or abuse, or as part of a business transfer such as a merger, acquisition, or sale of assets."
    ]
  },
  {
    title: "Your Choices",
    body: [
      "You can manage ad consent choices in the Rodeo Daily web app privacy settings. You can also clear local browser storage, block cookies, limit ad tracking in your device settings, or use privacy controls provided by Apple, Google, your browser, or participating advertising industry opt-out tools.",
      "Deleting the app, clearing browser data, or removing the PWA from your device may remove locally stored preferences such as favorites and dismissed banners."
    ]
  },
  {
    title: "Children",
    body: [
      "Rodeo Daily is not directed to children under 13 and does not knowingly collect personal information from children under 13. If you believe a child has provided personal information, contact Rodeo Daily so the information can be reviewed and deleted where appropriate."
    ]
  },
  {
    title: "Security and Retention",
    body: [
      "Rodeo Daily uses reasonable technical and organizational measures designed to protect information. No internet service, app, or storage system can be guaranteed to be completely secure.",
      "Information is kept only as long as reasonably needed for the purposes described in this policy, unless a longer retention period is required or allowed by law. Device-local preferences remain on your device until you clear them or the app/site removes or updates them."
    ]
  },
  {
    title: "Privacy Rights",
    body: [
      "Depending on where you live, you may have privacy rights such as the right to request access, correction, deletion, portability, or to opt out of certain targeted advertising or sharing practices.",
      `To make a privacy request, contact ${contactEmail}. Rodeo Daily may need to verify your request before taking action.`
    ]
  },
  {
    title: "Changes to This Policy",
    body: [
      "Rodeo Daily may update this Privacy Policy from time to time. The updated version will be posted on this page with a new effective date. Continued use of Rodeo Daily after an update means the revised policy applies."
    ]
  }
];

export default function PrivacyPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PrivacyPolicy",
    name: "Rodeo Daily Privacy Policy",
    url: absoluteUrl("/privacy"),
    dateModified: "2026-08-28",
    publisher: {
      "@type": "Organization",
      name: "Rodeo Daily",
      url: absoluteUrl("/")
    }
  };

  return (
    <main className="seo-page privacy-page">
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
          <span>Privacy Policy</span>
          <h1>Rodeo Daily Privacy Policy</h1>
          <p>
            This policy explains how Rodeo Daily handles information for the iOS app, website, and Progressive Web App,
            including advertising, cookies, local preferences, and rodeo data sources.
          </p>
          <p className="privacy-updated">Effective date: {updatedDate}</p>
        </section>

        <section className="app-card privacy-summary-card" aria-label="Privacy policy summary">
          <h2>Summary</h2>
          <p>
            Rodeo Daily does not require an account for browsing rodeo standings, results, schedules, athlete profiles, or
            daysheets. Most preferences are stored on your own device. Ads may be shown through Google services, and you can
            manage web ad choices from the app privacy settings.
          </p>
        </section>

        <section className="privacy-section-list" aria-label="Privacy policy details">
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
          <h2>Contact</h2>
          <p>
            For privacy questions, support requests, or rights requests, contact{" "}
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
          </p>
          <div className="support-action-row">
            <Link className="support-primary-action" href="/support">
              Open Support
            </Link>
            <Link className="support-secondary-action" href="/">
              Open App
            </Link>
          </div>
          <p className="privacy-note">
            This page is an improved replacement for the prior Calf Roping Daily privacy policy and covers the Rodeo Daily
            iOS app, web app, and PWA experience.
          </p>
        </section>

        <footer className="seo-page-footer" aria-label="Rodeo Daily legal and support links">
          <Link href="/ios-app">iOS App</Link>
          <Link href="/support">Support</Link>
          <Link href="/">Open App</Link>
        </footer>
      </section>
    </main>
  );
}
