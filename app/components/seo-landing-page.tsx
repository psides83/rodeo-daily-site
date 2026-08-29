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
};

export function SeoLandingPage({ eyebrow, title, description, primaryHref, primaryLabel, sections }: SeoLandingPageProps) {
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

        <footer className="seo-page-footer" aria-label="Rodeo Daily legal and support links">
          <Link href="/ios-app">iOS App</Link>
          <Link href="/support">Support</Link>
          <Link href="/privacy">Privacy Policy</Link>
        </footer>
      </section>
    </main>
  );
}
