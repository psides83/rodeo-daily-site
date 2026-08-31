import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GoogleAdSlot } from "../../components/google-ads";
import { RodeoDailyLogoMark } from "../../components/rodeo-views";
import { newsPostImage, newsPostUrl } from "../../lib/news";
import { absoluteUrl } from "../../lib/seo";
import { fetchNewsPostBySlug, fetchPublishedNewsPosts } from "../../lib/supabase-news";

type NewsArticlePageProps = {
  params: {
    slug: string;
  };
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: NewsArticlePageProps): Promise<Metadata> {
  const post = await fetchNewsPostBySlug(params.slug);
  if (!post) return {};
  const url = newsPostUrl(post);
  const image = newsPostImage(post);

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: url
    },
    openGraph: {
      type: "article",
      url,
      title: `${post.title} | Rodeo Daily`,
      description: post.excerpt,
      siteName: "Rodeo Daily",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      tags: post.tags,
      images: [{ url: image, alt: post.title }]
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | Rodeo Daily`,
      description: post.excerpt,
      images: [image]
    }
  };
}

export default async function NewsArticlePage({ params }: NewsArticlePageProps) {
  const post = await fetchNewsPostBySlug(params.slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.excerpt,
    image: newsPostImage(post),
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
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
    },
    mainEntityOfPage: newsPostUrl(post),
    keywords: post.tags.join(", "),
    citation: post.sourceUrls
  };

  return (
    <main className="news-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c")
        }}
      />
      <article className="news-article-shell">
        <header className="seo-page-header">
          <Link className="seo-page-brand" href="/">
            <RodeoDailyLogoMark />
            <span>Rodeo Daily</span>
          </Link>
          <Link className="seo-page-open-app" href="/news">
            News
          </Link>
        </header>

        <section className="news-article-hero">
          <span>{post.category}</span>
          <h1>{post.title}</h1>
          <p>{post.excerpt}</p>
          <div>
            <time dateTime={post.publishedAt}>{formatNewsDate(post.publishedAt)}</time>
            <span>{post.author}</span>
          </div>
        </section>

        {post.heroImage && (
          <figure className="news-article-image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={newsPostImage(post)} alt={post.title} />
          </figure>
        )}

        <GoogleAdSlot placement="generalMediumRectangle" className="news-ad-slot" />

        <section className="news-article-body">
          {post.paragraphs.map((paragraph, index) => (
            <div key={`${paragraph}-${index}`}>
              {renderArticleBlock(paragraph)}
              {index === 1 && <GoogleAdSlot placement="generalMediumRectangle" className="news-inline-ad-slot" />}
            </div>
          ))}
        </section>

        {post.sourceUrls.length > 0 && (
          <section className="news-source-list">
            <h2>Sources</h2>
            {post.sourceUrls.map((sourceUrl) => (
              <Link href={sourceUrl} key={sourceUrl}>
                {sourceUrl}
              </Link>
            ))}
          </section>
        )}

        <section className="news-seo-links" aria-label="Related rodeo pages">
          <Link href="/news">More Rodeo News</Link>
          <Link href="/prca-results">PRCA Results</Link>
          <Link href="/wpra-results">WPRA Results</Link>
          <Link href="/prca-standings">PRCA Standings</Link>
          <Link href="/wpra-standings">WPRA Standings</Link>
        </section>
      </article>
    </main>
  );
}

function formatNewsDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently Published";
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(date);
}

function renderArticleBlock(value: string) {
  if (value.startsWith("### ")) {
    return <h3>{value.replace(/^###\s+/, "")}</h3>;
  }

  if (value.startsWith("## ")) {
    return <h2>{value.replace(/^##\s+/, "")}</h2>;
  }

  return <p>{value}</p>;
}
