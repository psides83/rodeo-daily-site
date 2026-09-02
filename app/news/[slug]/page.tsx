import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { GoogleAdSlot } from "../../components/google-ads";
import { NewsAppShell } from "../../components/news-app-shell";
import { newsPostImage, newsPostUrl, type RodeoNewsPost } from "../../lib/news";
import { absoluteUrl } from "../../lib/seo";
import { fetchNewsPostBySlug, fetchPublishedNewsPosts } from "../../lib/supabase-news";

type NewsArticlePageProps = {
  params: {
    slug: string;
  };
};

type ArticleEntityLink = {
  key: string;
  name: string;
  href: string;
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
    keywords: [...post.tags, "PRCA news", "WPRA news", "ProRodeo news", "PRCA results", "WPRA results", "PRCA standings", "WPRA standings"],
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
  const entityLinks = articleEntityLinks(post);
  const linkedEntities = new Set<string>();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsArticle",
        "@id": `${newsPostUrl(post)}#article`,
        headline: post.title,
        description: post.excerpt,
        image: newsPostImage(post),
        datePublished: post.publishedAt,
        dateModified: post.updatedAt ?? post.publishedAt,
        articleSection: post.category,
        isPartOf: {
          "@type": "CollectionPage",
          name: "Rodeo Daily News",
          url: absoluteUrl("/news")
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
        mentions: articleJsonLdMentions(post),
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
        keywords: [...post.tags, "PRCA news", "WPRA news", "ProRodeo news", "PRCA results", "WPRA results", "rodeo standings"].join(", "),
        citation: post.sourceUrls
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
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.title,
            item: newsPostUrl(post)
          }
        ]
      }
    ]
  };
  const articleBlocks = post.paragraphs
    .map((paragraph) => renderArticleBlock(paragraph, post.title, entityLinks, linkedEntities))
    .filter((block): block is ReactNode => block !== null);

  return (
    <NewsAppShell title="News" subtitle={post.title}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c")
        }}
      />
      <article className="news-article-shell news-app-content">
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
          {articleBlocks.map((block, index) => (
            <div key={index}>
              {block}
              {index === 2 && <GoogleAdSlot placement="generalMediumRectangle" className="news-inline-ad-slot" />}
            </div>
          ))}
        </section>

        <ArticleEntityFooter post={post} />

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
    </NewsAppShell>
  );
}

function ArticleEntityFooter({ post }: { post: RodeoNewsPost }) {
  const hasEntities = post.mentionedAthletes.length > 0 || post.mentionedRodeos.length > 0 || post.mentionedEvents.length > 0;
  if (!hasEntities) return null;

  return (
    <section className="news-entity-footer" aria-label="Article mentions">
      <h2>Article Mentions</h2>
      <div className="news-entity-footer-grid">
        {post.mentionedAthletes.length > 0 && (
          <div className="news-entity-group">
            <h3>Athletes</h3>
            <div className="news-entity-links">
              {post.mentionedAthletes.map((athlete) => (
                <Link href={`/athletes/${athlete.athleteId}`} key={`athlete-${athlete.athleteId}`}>
                  {athlete.name}
                </Link>
              ))}
            </div>
          </div>
        )}
        {post.mentionedRodeos.length > 0 && (
          <div className="news-entity-group">
            <h3>Rodeos</h3>
            <div className="news-entity-links">
              {post.mentionedRodeos.map((rodeo) => (
                <Link href={`/results/${rodeo.rodeoId}`} key={`rodeo-${rodeo.rodeoId}`}>
                  {rodeo.name} Results
                </Link>
              ))}
            </div>
          </div>
        )}
        {post.mentionedEvents.length > 0 && (
          <div className="news-entity-group">
            <h3>Events</h3>
            <div className="news-entity-links">
              {post.mentionedEvents.map((event) => (
                <span key={`event-${event.name}-${event.standingsHref}`}>
                  <Link href={event.standingsHref}>{event.name} Standings</Link>
                  {event.resultsHref && <Link href={event.resultsHref}>{event.name} Results</Link>}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function formatNewsDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently Published";
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(date);
}

function renderArticleBlock(value: string, articleTitle: string, entityLinks: ArticleEntityLink[], linkedEntities: Set<string>): ReactNode | null {
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
    return <blockquote>{renderInlineMarkdown(trimmed.split("\n").map((line) => line.replace(/^>\s?/, "")).join(" "), entityLinks, linkedEntities)}</blockquote>;
  }

  if (isBulletList(trimmed)) {
    return (
      <ul>
        {trimmed.split("\n").map((line) => (
          <li key={line}>{renderInlineMarkdown(line.replace(/^[-*]\s+/, ""), entityLinks, linkedEntities)}</li>
        ))}
      </ul>
    );
  }

  if (isNumberedList(trimmed)) {
    return (
      <ol>
        {trimmed.split("\n").map((line) => (
          <li key={line}>{renderInlineMarkdown(line.replace(/^\d+\.\s+/, ""), entityLinks, linkedEntities)}</li>
        ))}
      </ol>
    );
  }

  if (trimmed.startsWith("# ")) {
    const heading = trimmed.replace(/^#\s+/, "");
    if (normalizeArticleText(heading) === normalizeArticleText(articleTitle)) return null;
    return <h2>{renderInlineMarkdown(heading)}</h2>;
  }

  if (trimmed.startsWith("### ")) {
    return <h3>{renderInlineMarkdown(trimmed.replace(/^###\s+/, ""))}</h3>;
  }

  if (trimmed.startsWith("## ")) {
    return <h2>{renderInlineMarkdown(trimmed.replace(/^##\s+/, ""))}</h2>;
  }

  return <p>{renderInlineMarkdown(trimmed, entityLinks, linkedEntities)}</p>;
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

function renderInlineMarkdown(value: string, entityLinks: ArticleEntityLink[] = [], linkedEntities = new Set<string>()): ReactNode[] {
  const parts: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(value))) {
    if (match.index > cursor) {
      parts.push(...renderLinkedText(value.slice(cursor, match.index), entityLinks, linkedEntities, `text-${cursor}`));
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
      parts.push(<strong key={`${token}-${match.index}`}>{renderLinkedText(token.slice(2, -2), entityLinks, linkedEntities, `strong-${match.index}`)}</strong>);
    } else {
      parts.push(<em key={`${token}-${match.index}`}>{renderLinkedText(token.slice(1, -1), entityLinks, linkedEntities, `em-${match.index}`)}</em>);
    }

    cursor = match.index + token.length;
  }

  if (cursor < value.length) {
    parts.push(...renderLinkedText(value.slice(cursor), entityLinks, linkedEntities, `text-${cursor}`));
  }

  return parts;
}

function renderLinkedText(value: string, entityLinks: ArticleEntityLink[], linkedEntities: Set<string>, keyPrefix: string): ReactNode[] {
  if (!entityLinks.length || !value.trim()) return [value];

  const nodes: ReactNode[] = [];
  let cursor = 0;
  let linkIndex = 0;

  while (cursor < value.length) {
    const next = nextEntityMention(value, cursor, entityLinks, linkedEntities);
    if (!next) {
      nodes.push(value.slice(cursor));
      break;
    }

    if (next.start > cursor) nodes.push(value.slice(cursor, next.start));
    nodes.push(
      <Link href={next.entity.href} key={`${keyPrefix}-${next.entity.key}-${linkIndex}`}>
        {value.slice(next.start, next.end)}
      </Link>
    );
    linkedEntities.add(next.entity.key);
    cursor = next.end;
    linkIndex += 1;
  }

  return nodes;
}

function nextEntityMention(value: string, cursor: number, entityLinks: ArticleEntityLink[], linkedEntities: Set<string>) {
  let best: { entity: ArticleEntityLink; start: number; end: number } | null = null;
  const text = value.slice(cursor);

  for (const entity of entityLinks) {
    if (linkedEntities.has(entity.key)) continue;
    const match = new RegExp(`(^|[^A-Za-z0-9])(${escapeRegExp(entity.name)})(?=$|[^A-Za-z0-9])`, "i").exec(text);
    if (!match) continue;
    const start = cursor + match.index + match[1].length;
    const end = start + match[2].length;

    if (!best || start < best.start || (start === best.start && entity.name.length > best.entity.name.length)) {
      best = { entity, start, end };
    }
  }

  return best;
}

function articleEntityLinks(post: RodeoNewsPost): ArticleEntityLink[] {
  return [
    ...post.mentionedAthletes.map((athlete) => ({
      key: `athlete-${athlete.athleteId}`,
      name: athlete.name,
      href: `/athletes/${athlete.athleteId}`
    })),
    ...post.mentionedRodeos.map((rodeo) => ({
      key: `rodeo-${rodeo.rodeoId}`,
      name: rodeo.name,
      href: `/results/${rodeo.rodeoId}`
    })),
    ...post.mentionedEvents.map((event) => ({
      key: `event-${event.name.toLowerCase()}-${event.standingsHref}`,
      name: event.name,
      href: event.standingsHref
    }))
  ].sort((left, right) => right.name.length - left.name.length);
}

function articleJsonLdMentions(post: RodeoNewsPost) {
  return [
    ...post.mentionedAthletes.map((athlete) => ({
      "@type": "Person",
      name: athlete.name,
      url: absoluteUrl(`/athletes/${athlete.athleteId}`)
    })),
    ...post.mentionedRodeos.map((rodeo) => ({
      "@type": "SportsEvent",
      name: rodeo.name,
      url: absoluteUrl(`/results/${rodeo.rodeoId}`)
    })),
    ...post.mentionedEvents.map((event) => ({
      "@type": "Thing",
      name: event.name,
      url: absoluteUrl(event.standingsHref)
    }))
  ];
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

function normalizeArticleText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}
