import type { MetadataRoute } from "next";
import { absoluteUrl, seoResultEvents, seoStandingEvents, wpraResultEvents, wpraStandingEvents } from "./lib/seo";
import { fetchPublishedNewsPosts } from "./lib/supabase-news";
import { mapBusinessJournalRows } from "./lib/rodeo-data";
import type { ApiBusinessJournalResponse, ApiPosition, ApiRodeo } from "./lib/types";

const now = new Date();
const standingsSeoYears = ["2026", "2025"];
const localizedPublicRoutes = ["/br/privacy", "/br/support", "/br/ios-app", "/mx/privacy", "/mx/support", "/mx/ios-app"];
const standingsApiBaseUrl = "https://d1kfpvgfupbmyo.cloudfront.net/services/pro_rodeo.ashx/";
const wpraApiBaseUrl = "https://rodeo-data-api.psides83.workers.dev";
const businessJournalFeedUrl = "https://psides83.github.io/pbj-scraper/pbj-detailed.json";
const wpraEvents = new Set(["GB", "LB"]);

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1
    },
    {
      url: absoluteUrl("/results"),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.99
    },
    {
      url: absoluteUrl("/standings"),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.99
    },
    {
      url: absoluteUrl("/prca-results"),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.98
    },
    {
      url: absoluteUrl("/pro-rodeo-results"),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.98
    },
    {
      url: absoluteUrl("/prca-standings"),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.98
    },
    {
      url: absoluteUrl("/wpra-results"),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.94
    },
    {
      url: absoluteUrl("/wpra-standings"),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.94
    },
    {
      url: absoluteUrl("/pro-rodeo-standings"),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.94
    },
    {
      url: absoluteUrl("/rodeo-results"),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.92
    },
    {
      url: absoluteUrl("/rodeo-standings"),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.92
    },
    {
      url: absoluteUrl("/privacy"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.45
    },
    {
      url: absoluteUrl("/support"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.55
    },
    {
      url: absoluteUrl("/ios-app"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.82
    },
    {
      url: absoluteUrl("/schedule"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85
    },
    {
      url: absoluteUrl("/nfr-standings"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.75
    },
    {
      url: absoluteUrl("/rodeo-listings"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7
    },
    {
      url: absoluteUrl("/news"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.86
    }
  ];

  const standingsRoutes: MetadataRoute.Sitemap = standingsSeoYears.flatMap((year) =>
    seoStandingEvents.map((event) => ({
      url: absoluteUrl(`/prca-standings/${year}/${event.slug}`),
      lastModified: now,
      changeFrequency: "hourly" as const,
      priority: year === "2026" ? 0.96 : 0.82
    }))
  );
  const prcaResultRoutes: MetadataRoute.Sitemap = seoResultEvents.map((event) => ({
    url: absoluteUrl(`/prca-results/${event.slug}`),
    lastModified: now,
    changeFrequency: "hourly" as const,
    priority: 0.9
  }));
  const proRodeoResultRoutes: MetadataRoute.Sitemap = seoResultEvents.map((event) => ({
    url: absoluteUrl(`/pro-rodeo-results/${event.slug}`),
    lastModified: now,
    changeFrequency: "hourly" as const,
    priority: 0.88
  }));
  const wpraResultRoutes: MetadataRoute.Sitemap = wpraResultEvents.map((event) => ({
    url: absoluteUrl(`/wpra-results/${event.slug}`),
    lastModified: now,
    changeFrequency: "hourly" as const,
    priority: 0.9
  }));
  const wpraStandingsRoutes: MetadataRoute.Sitemap = standingsSeoYears.flatMap((year) =>
    wpraStandingEvents.map((event) => ({
      url: absoluteUrl(`/wpra-standings/${year}/${event.slug}`),
      lastModified: now,
      changeFrequency: "hourly" as const,
      priority: year === "2026" ? 0.94 : 0.8
    }))
  );
  const localizedRoutes = localizedPublicRoutes.map((route) => ({
    url: absoluteUrl(route),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: route.endsWith("/ios-app") ? 0.72 : 0.48
  }));
  const athleteRoutes = await topAthleteSitemapRoutes();
  const scheduleRoutes = await upcomingScheduleSitemapRoutes();
  const listingRoutes = await businessJournalSitemapRoutes();
  const newsRoutes = await newsSitemapRoutes();

  return [
    ...staticRoutes,
    ...localizedRoutes,
    ...standingsRoutes,
    ...wpraStandingsRoutes,
    ...prcaResultRoutes,
    ...proRodeoResultRoutes,
    ...wpraResultRoutes,
    ...athleteRoutes,
    ...scheduleRoutes,
    ...listingRoutes,
    ...newsRoutes
  ];
}

async function newsSitemapRoutes(): Promise<MetadataRoute.Sitemap> {
  const posts = await fetchPublishedNewsPosts();
  return posts.map((post) => ({
    url: absoluteUrl(`/news/${post.slug}`),
    lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(post.publishedAt),
    changeFrequency: "weekly" as const,
    priority: post.featured ? 0.84 : 0.78
  }));
}

async function topAthleteSitemapRoutes(): Promise<MetadataRoute.Sitemap> {
  try {
    const responses = await Promise.all(
      seoStandingEvents.map(async (event) => {
        const url = wpraEvents.has(event.code) ? wpraStandingsUrl(event.code) : prcaStandingsUrl(event.code);
        const response = await fetch(url, { next: { revalidate: 3600 } });
        if (!response.ok) return [];
        const payload = (await response.json()) as { data?: ApiPosition[] } | ApiPosition[];
        return Array.isArray(payload) ? payload : (payload.data ?? []);
      })
    );
    const athleteIds = Array.from(
      new Set(
        responses
          .flat()
          .map((position) => position.ContestantId ?? position.contestant_id ?? position.id)
          .filter((id): id is number => typeof id === "number" && Number.isInteger(id) && id > 0)
      )
    ).slice(0, 80);

    return athleteIds.map((id) => ({
      url: absoluteUrl(`/athletes/${id}`),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.72
    }));
  } catch {
    return [];
  }
}

function prcaStandingsUrl(eventCode: string) {
  const url = new URL("standings", standingsApiBaseUrl);
  url.searchParams.set("year", "2026");
  url.searchParams.set("type", "world");
  url.searchParams.set("id", "");
  url.searchParams.set("event", eventCode);
  return url;
}

function wpraStandingsUrl(eventCode: string) {
  const url = new URL("/v1/wpra/standings", wpraApiBaseUrl);
  url.searchParams.set("season_year", "2026");
  url.searchParams.set("event", eventCode);
  url.searchParams.set("type", "world");
  return url;
}

async function upcomingScheduleSitemapRoutes(): Promise<MetadataRoute.Sitemap> {
  try {
    const url = new URL("schedule", standingsApiBaseUrl);
    url.searchParams.set("type", "schedule");
    url.searchParams.set("page_size", "80");
    url.searchParams.set("index", "1");
    url.searchParams.set("search_term", "");
    url.searchParams.set("search_type", "");
    url.searchParams.set("tourId", "");
    url.searchParams.set("circuitId", "");
    url.searchParams.set("start", todayForProrodeo());
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) return [];
    const payload = (await response.json()) as { data?: ApiRodeo[] };
    return (payload.data ?? [])
      .filter((rodeo) => typeof rodeo.RodeoId === "number" && rodeo.RodeoId > 0)
      .slice(0, 80)
      .map((rodeo) => ({
        url: absoluteUrl(`/schedule/${rodeo.RodeoId}`),
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.76
      }));
  } catch {
    return [];
  }
}

async function businessJournalSitemapRoutes(): Promise<MetadataRoute.Sitemap> {
  try {
    const response = await fetch(businessJournalFeedUrl, { next: { revalidate: 1800 } });
    if (!response.ok) return [];
    const payload = (await response.json()) as ApiBusinessJournalResponse;
    return mapBusinessJournalRows(payload)
      .slice(0, 80)
      .map((listing) => ({
        url: absoluteUrl(`/listings/${encodeURIComponent(listing.id)}`),
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.68
      }));
  } catch {
    return [];
  }
}

function todayForProrodeo() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}
