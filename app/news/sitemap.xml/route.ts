import { newsPostUrl } from "../../lib/news";
import { fetchPublishedNewsPosts } from "../../lib/supabase-news";

const newsSitemapWindowMs = 2 * 24 * 60 * 60 * 1000;

export const dynamic = "force-dynamic";

export async function GET() {
  const cutoff = Date.now() - newsSitemapWindowMs;
  const posts = (await fetchPublishedNewsPosts()).slice(0, 1000);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${posts.map((post) => newsSitemapItem(post, cutoff)).join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=1800, stale-while-revalidate=86400"
    }
  });
}

function newsSitemapItem(post: Awaited<ReturnType<typeof fetchPublishedNewsPosts>>[number], cutoff: number) {
  const publishedAt = new Date(post.publishedAt).getTime();
  const isRecentNews = Number.isFinite(publishedAt) && publishedAt >= cutoff;

  return `  <url>
    <loc>${escapeXml(newsPostUrl(post))}</loc>
${isRecentNews ? `    <news:news>
      <news:publication>
        <news:name>Rodeo Daily</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${escapeXml(post.publishedAt)}</news:publication_date>
      <news:title>${escapeXml(post.title)}</news:title>
    </news:news>` : ""}
  </url>`;
}

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (character) => {
    switch (character) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case "\"":
        return "&quot;";
      default:
        return character;
    }
  });
}
