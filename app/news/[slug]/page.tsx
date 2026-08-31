import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
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
  const trimmed = value.trim();

  const image = markdownImage(trimmed);
  if (image) {
    return (
      <figure className="news-article-body-image">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image.src} alt={image.alt} />
        {image.alt && <figcaption>{image.alt}</figcaption>}
      </figure>
    );
  }

  if (isBlockquote(trimmed)) {
    return <blockquote>{trimmed.split("\n").map((line) => line.replace(/^>\s?/, "")).join(" ")}</blockquote>;
  }

  if (isBulletList(trimmed)) {
    return (
      <ul>
        {trimmed.split("\n").map((line) => (
          <li key={line}>{renderInlineMarkdown(line.replace(/^[-*]\s+/, ""))}</li>
        ))}
      </ul>
    );
  }

  if (isNumberedList(trimmed)) {
    return (
      <ol>
        {trimmed.split("\n").map((line) => (
          <li key={line}>{renderInlineMarkdown(line.replace(/^\d+\.\s+/, ""))}</li>
        ))}
      </ol>
    );
  }

  if (value.startsWith("### ")) {
    return <h3>{renderInlineMarkdown(value.replace(/^###\s+/, ""))}</h3>;
  }

  if (value.startsWith("## ")) {
    return <h2>{renderInlineMarkdown(value.replace(/^##\s+/, ""))}</h2>;
  }

  return <p>{renderInlineMarkdown(value)}</p>;
}

function isBulletList(value: string) {
  const lines = value.split("\n").filter(Boolean);
  return lines.length > 0 && lines.every((line) => /^[-*]\s+/.test(line));
}

function isNumberedList(value: string) {
  const lines = value.split("\n").filter(Boolean);
  return lines.length > 0 && lines.every((line) => /^\d+\.\s+/.test(line));
}

function isBlockquote(value: string) {
  const lines = value.split("\n").filter(Boolean);
  return lines.length > 0 && lines.every((line) => /^>\s?/.test(line));
}

function markdownImage(value: string) {
  const match = value.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
  if (!match) return null;
  const src = safeMarkdownUrl(match[2]);
  if (!src) return null;
  return {
    alt: match[1].trim(),
    src
  };
}

function renderInlineMarkdown(value: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(value))) {
    if (match.index > cursor) {
      parts.push(value.slice(cursor, match.index));
    }

    const token = match[0];
    const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const href = safeMarkdownUrl(link[2]);
      parts.push(
        href ? (
          <a href={href} key={`${token}-${match.index}`} rel={isExternalUrl(href) ? "noopener noreferrer" : undefined} target={isExternalUrl(href) ? "_blank" : undefined}>
            {link[1]}
          </a>
        ) : (
          link[1]
        )
      );
    } else if (token.startsWith("**")) {
      parts.push(<strong key={`${token}-${match.index}`}>{token.slice(2, -2)}</strong>);
    } else {
      parts.push(<em key={`${token}-${match.index}`}>{token.slice(1, -1)}</em>);
    }

    cursor = match.index + token.length;
  }

  if (cursor < value.length) {
    parts.push(value.slice(cursor));
  }

  return parts;
}

function safeMarkdownUrl(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith("/")) return trimmed;

  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function isExternalUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}
