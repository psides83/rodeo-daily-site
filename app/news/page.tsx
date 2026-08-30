import type { Metadata } from "next";
import Link from "next/link";
import { GoogleAdSlot } from "../components/google-ads";
import { RodeoDailyLogoMark } from "../components/rodeo-views";
import { newsPostUrl } from "../lib/news";
import { absoluteUrl, pageMetadata } from "../lib/seo";
import { fetchPublishedNewsPosts } from "../lib/supabase-news";

export const metadata: Metadata = pageMetadata({
  title: "Pro Rodeo News",
  description:
    "Read Rodeo Daily news, Monday pro rodeo roundups, PRCA results analysis, WPRA results stories, standings updates, and NFR implications.",
  path: "/news"
});

export default async function NewsPage() {
  const posts = await fetchPublishedNewsPosts();
  const featured = posts[0];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Pro Rodeo News",
    url: absoluteUrl("/news"),
    description:
      "Rodeo Daily news covers PRCA results, WPRA results, pro rodeo results, standings movement, and weekly rodeo stories.",
    hasPart: posts.map((post) => ({
      "@type": "Article",
      headline: post.title,
      url: newsPostUrl(post),
      datePublished: post.publishedAt,
      author: {
        "@type": "Organization",
        name: post.author
      }
    }))
  };

  return (
    <main className="news-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c")
        }}
      />
      <section className="news-shell">
        <header className="seo-page-header">
          <Link className="seo-page-brand" href="/">
            <RodeoDailyLogoMark />
            <span>Rodeo Daily</span>
          </Link>
          <Link className="seo-page-open-app" href="/results">
            PRCA Results
          </Link>
        </header>

        <section className="news-hero">
          <div>
            <span>Pro Rodeo News</span>
            <h1>Monday rodeo stories built from PRCA results, WPRA results, and standings impact.</h1>
            <p>
              Follow weekly rodeo news, weekend results analysis, PRCA standings movement, WPRA standings updates,
              and NFR storylines from Rodeo Daily.
            </p>
          </div>
          {featured && (
            <Link className="news-featured-card" href={`/news/${featured.slug}`}>
              <span>{featured.category}</span>
              <h2>{featured.title}</h2>
              <p>{featured.excerpt}</p>
              <strong>Read Story</strong>
            </Link>
          )}
        </section>

        <GoogleAdSlot placement="generalMediumRectangle" className="news-ad-slot" />

        <section className="news-grid" aria-label="Latest rodeo news">
          {posts.map((post) => (
            <article className="news-card" key={post.slug}>
              <span>{post.category}</span>
              <h2>
                <Link href={`/news/${post.slug}`}>{post.title}</Link>
              </h2>
              <p>{post.excerpt}</p>
              <div>
                <time dateTime={post.publishedAt}>{formatNewsDate(post.publishedAt)}</time>
                <Link href={`/news/${post.slug}`}>Read</Link>
              </div>
            </article>
          ))}
        </section>

        <section className="news-seo-links" aria-label="Related rodeo pages">
          <Link href="/prca-results">PRCA Results</Link>
          <Link href="/wpra-results">WPRA Results</Link>
          <Link href="/pro-rodeo-results">Pro Rodeo Results</Link>
          <Link href="/prca-standings">PRCA Standings</Link>
          <Link href="/wpra-standings">WPRA Standings</Link>
        </section>
      </section>
    </main>
  );
}

function formatNewsDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently Published";
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(date);
}
