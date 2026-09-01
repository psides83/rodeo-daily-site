import { newsPostUrl } from "../../lib/news";
import { absoluteUrl, siteDescription } from "../../lib/seo";
import { fetchPublishedNewsPosts } from "../../lib/supabase-news";

export const dynamic = "force-dynamic";

export async function GET() {
  const posts = await fetchPublishedNewsPosts();
  const updatedAt = posts[0]?.updatedAt ?? posts[0]?.publishedAt ?? new Date().toISOString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Rodeo Daily News</title>
    <link>${escapeXml(absoluteUrl("/news"))}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date(updatedAt).toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(absoluteUrl("/news/rss.xml"))}" rel="self" type="application/rss+xml" />
${posts.map(rssItem).join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=1800, stale-while-revalidate=86400"
    }
  });
}

function rssItem(post: Awaited<ReturnType<typeof fetchPublishedNewsPosts>>[number]) {
  const publishedAt = new Date(post.publishedAt).toUTCString();
  const updatedAt = post.updatedAt ? new Date(post.updatedAt).toUTCString() : publishedAt;
  return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(newsPostUrl(post))}</link>
      <guid isPermaLink="true">${escapeXml(newsPostUrl(post))}</guid>
      <description>${escapeXml(post.excerpt)}</description>
      <category>${escapeXml(post.category)}</category>
      <pubDate>${publishedAt}</pubDate>
      <atom:updated>${updatedAt}</atom:updated>
    </item>`;
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
