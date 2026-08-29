import Link from "next/link";
import { RodeoDailyLogoMark } from "./rodeo-views";

type SeoLandingPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  sections: Array<{
    title: string;
    body: string;
  }>;
  relatedLinks?: Array<{
    href: string;
    label: string;
  }>;
};

export function SeoLandingPage({ eyebrow, title, description, primaryHref, primaryLabel, sections, relatedLinks = [] }: SeoLandingPageProps) {
  return (
    <main className="seo-page">
      <section className="seo-page-shell">
        <header className="seo-page-header">
          <Link className="seo-page-brand" href="/">
            <RodeoDailyLogoMark />
            <span>Rodeo Daily</span>
          </Link>
          <Link className="seo-page-open-app" href={primaryHref}>
            {primaryLabel}
          </Link>
        </header>

        <section className="seo-page-hero">
          <span>{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
          <Link href={primaryHref}>{primaryLabel}</Link>
        </section>

        <section className="seo-page-grid" aria-label="Rodeo Daily SEO content">
          {sections.map((section) => (
            <article className="app-card seo-page-card" key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </article>
          ))}
        </section>

        {relatedLinks.length > 0 && (
          <section className="seo-page-footer" aria-label="Related rodeo pages">
            {relatedLinks.map((link) => (
              <Link href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
          </section>
        )}

        <footer className="seo-page-footer" aria-label="Rodeo Daily legal and support links">
          <Link href="/prca-results">PRCA Results</Link>
          <Link href="/pro-rodeo-results">Pro Rodeo Results</Link>
          <Link href="/prca-standings">PRCA Standings</Link>
          <Link href="/wpra-results">WPRA Results</Link>
          <Link href="/wpra-standings">WPRA Standings</Link>
          <Link href="/ios-app">iOS App</Link>
          <Link href="/support">Support</Link>
          <Link href="/privacy">Privacy Policy</Link>
        </footer>
      </section>
    </main>
  );
}
