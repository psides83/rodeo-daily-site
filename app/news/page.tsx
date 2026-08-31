import type { Metadata } from "next";
import Link from "next/link";
import { GoogleAdSlot } from "../components/google-ads";
import { RodeoDailyLogoMark } from "../components/rodeo-views";
import { newsPostImage, newsPostUrl } from "../lib/news";
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
  const latestPosts = featured ? posts.slice(1) : posts;
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

        <section className="news-index-header">
          <span>Pro Rodeo News</span>
          <h1>Stories from the standings, results, and the road to the NFR.</h1>
          <p>
            Rodeo Daily follows PRCA and WPRA results, standings movement, playoff implications, and the weekly
            stories shaping pro rodeo.
          </p>
        </section>

        {featured && (
          <section className="news-featured-story" aria-labelledby="featured-news-heading">
            <Link className="news-featured-image" href={`/news/${featured.slug}`} aria-label={featured.title}>
              {featured.heroImage ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={newsPostImage(featured)} alt={featured.title} />
                </>
              ) : (
                <span>{featured.category}</span>
              )}
            </Link>
            <div>
              <span>Featured</span>
              <h2 id="featured-news-heading">
                <Link href={`/news/${featured.slug}`}>{featured.title}</Link>
              </h2>
              <p>{featured.excerpt}</p>
              <div>
                <time dateTime={featured.publishedAt}>{formatNewsDate(featured.publishedAt)}</time>
                <Link href={`/news/${featured.slug}`}>Read Story</Link>
              </div>
            </div>
          </section>
        )}

        <GoogleAdSlot placement="generalMediumRectangle" className="news-ad-slot" />

        {latestPosts.length > 0 && (
          <>
            <div className="news-section-heading">
              <span>Latest</span>
              <h2>Recent Rodeo Daily stories</h2>
            </div>

            <section className="news-grid" aria-label="Latest rodeo news">
              {latestPosts.map((post) => (
                <article className="news-card" key={post.slug}>
                  {post.heroImage && (
                    <Link className="news-card-image" href={`/news/${post.slug}`} aria-label={post.title}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={newsPostImage(post)} alt={post.title} loading="lazy" />
                    </Link>
                  )}
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
          </>
        )}

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
