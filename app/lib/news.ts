import { absoluteUrl } from "./seo";

export type RodeoNewsPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  status: "draft" | "published";
  featured: boolean;
  heroImage?: string;
  sourceUrls: string[];
  storyScore?: number;
  tags: string[];
  paragraphs: string[];
};

export const newsPosts: RodeoNewsPost[] = [
  {
    slug: "monday-pro-rodeo-roundup-prca-wpra-results",
    title: "Monday Pro Rodeo Roundup: PRCA Results, WPRA Standings, and Weekend Stories",
    excerpt:
      "Rodeo Daily is adding a weekly news workflow built around PRCA results, WPRA results, pro rodeo standings, NFR implications, and the biggest stories from each weekend.",
    category: "Pro Rodeo Roundup",
    author: "Rodeo Daily",
    publishedAt: "2026-08-29T12:00:00.000Z",
    status: "published",
    featured: true,
    sourceUrls: [],
    storyScore: 100,
    tags: ["PRCA results", "WPRA results", "pro rodeo results", "PRCA standings", "WPRA standings"],
    paragraphs: [
      "Rodeo Daily is building a weekly pro rodeo roundup for fans who want the story behind the weekend results. The goal is to connect PRCA results, WPRA results, pro rodeo standings, athlete movement, payouts, and NFR implications in one easy place to read.",
      "The roundup will focus on the most meaningful story from the past weekend rather than simply repeating a result list. A strong story might come from a major win, a standings jump, a breakthrough performance, a comeback, a notable WPRA result, or a result that changes the NFR picture.",
      "The best version of this workflow starts with structured rodeo data, then uses source research to verify names, dates, scores, times, money, and standings impact. That keeps the article useful for search while still giving rodeo fans context they cannot get from a raw leaderboard alone.",
      "Future Monday roundup articles can include the winning performance, why it mattered, how it affected PRCA standings or WPRA standings, related pro rodeo results, and where fans can follow the next rodeo on the schedule."
    ]
  }
];

export function publishedNewsPosts() {
  return newsPosts
    .filter((post) => post.status === "published")
    .slice()
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));
}

export function newsPostBySlug(slug: string) {
  return publishedNewsPosts().find((post) => post.slug === slug);
}

export function newsPostUrl(post: RodeoNewsPost) {
  return absoluteUrl(`/news/${post.slug}`);
}

export function newsPostImage(post: RodeoNewsPost) {
  if (post.heroImage?.startsWith("http://") || post.heroImage?.startsWith("https://")) {
    return post.heroImage;
  }
  return absoluteUrl(post.heroImage || "/rodeo-daily-icon.png");
}
