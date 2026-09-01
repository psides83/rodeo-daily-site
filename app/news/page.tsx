import type { Metadata } from "next";
import Link from "next/link";
import { GoogleAdSlot } from "../components/google-ads";
import { NewsAppShell } from "../components/news-app-shell";
import { newsPostImage, newsPostUrl } from "../lib/news";
import { absoluteUrl, pageMetadata } from "../lib/seo";
import { fetchPublishedNewsPosts } from "../lib/supabase-news";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "PRCA News, WPRA News, Pro Rodeo Results & Standings Stories",
    description:
      "Read Rodeo Daily PRCA news, WPRA news, ProRodeo results analysis, standings movement, NFR bubble stories, rodeo athlete features, and weekly pro rodeo news.",
    path: "/news"
  }),
  alternates: {
    canonical: absoluteUrl("/news"),
    types: {
      "application/rss+xml": absoluteUrl("/news/rss.xml")
    }
  },
  keywords: [
    "PRCA news",
    "WPRA news",
    "ProRodeo news",
    "pro rodeo news",
    "PRCA results",
    "WPRA results",
    "PRCA standings",
    "WPRA standings",
    "NFR standings",
    "rodeo results",
    "rodeo standings",
    "Rodeo Daily"
  ]
};

export default async function NewsPage() {
  const posts = await fetchPublishedNewsPosts();
  const featured = posts[0];
  const latestPosts = featured ? posts.slice(1) : posts;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": absoluteUrl("/news#collection"),
        name: "PRCA News, WPRA News, Pro Rodeo Results and Standings Stories",
        url: absoluteUrl("/news"),
        description:
          "Rodeo Daily news covers PRCA news, WPRA news, ProRodeo results, standings movement, NFR implications, athlete storylines, and weekly pro rodeo analysis.",
        isPartOf: {
          "@type": "WebSite",
          name: "Rodeo Daily",
          url: absoluteUrl("/")
        },
        about: [
          "PRCA news",
          "WPRA news",
          "ProRodeo news",
          "PRCA results",
          "WPRA results",
          "PRCA standings",
          "WPRA standings",
          "NFR standings",
          "pro rodeo results",
          "pro rodeo standings"
        ],
        mainEntity: {
          "@type": "ItemList",
          itemListElement: posts.map((post, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: newsPostUrl(post),
            name: post.title
          }))
        }
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Rodeo Daily",
            item: absoluteUrl("/")
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "News",
            item: absoluteUrl("/news")
          }
        ]
      },
      {
        "@type": "NewsMediaOrganization",
        name: "Rodeo Daily",
        url: absoluteUrl("/"),
        logo: absoluteUrl("/rodeo-daily-icon.png"),
        publishingPrinciples: absoluteUrl("/privacy"),
        sameAs: []
      },
      ...posts.map((post) => ({
        "@type": "NewsArticle",
        headline: post.title,
        url: newsPostUrl(post),
        image: newsPostImage(post),
        datePublished: post.publishedAt,
        dateModified: post.updatedAt ?? post.publishedAt,
        articleSection: post.category,
        keywords: [...post.tags, "PRCA news", "WPRA news", "pro rodeo results", "rodeo standings"].join(", "),
        author: {
          "@type": "Organization",
          name: post.author
        },
        publisher: {
          "@type": "Organization",
          name: "Rodeo Daily",
          logo: {
            "@type": "ImageObject",
            url: absoluteUrl("/rodeo-daily-icon.png")
          }
        }
      }))
    ]
  };

  return (
    <NewsAppShell title="News" subtitle="PRCA, WPRA, results, standings, and NFR storylines">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c")
        }}
      />
      <section className="news-shell news-app-content">
        <section className="news-index-header">
          <span>Pro Rodeo News</span>
          <h1>PRCA and WPRA news from the standings, results, and the road to the NFR.</h1>
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
    </NewsAppShell>
  );
}

function formatNewsDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently Published";
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(date);
}
