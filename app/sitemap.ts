import type { MetadataRoute } from "next";
import { absoluteUrl, seoStandingEvents } from "./lib/seo";
import type { ApiPosition, ApiRodeo } from "./lib/types";

const now = new Date();
const standingsSeoYears = ["2026", "2025"];
const standingsApiBaseUrl = "https://d1kfpvgfupbmyo.cloudfront.net/services/pro_rodeo.ashx/";
const wpraApiBaseUrl = "https://rodeo-data-api.psides83.workers.dev";
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
      url: absoluteUrl("/prca-results"),
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
      url: absoluteUrl("/?tab=standings"),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.95
    },
    {
      url: absoluteUrl("/?tab=results"),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.95
    },
    {
      url: absoluteUrl("/?tab=schedule"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85
    },
    {
      url: absoluteUrl("/?tab=more&section=nfr"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.75
    },
    {
      url: absoluteUrl("/?tab=more&section=champions"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7
    },
    {
      url: absoluteUrl("/?tab=more&section=listings"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7
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
  const athleteRoutes = await topAthleteSitemapRoutes();
  const scheduleRoutes = await upcomingScheduleSitemapRoutes();

  return [...staticRoutes, ...standingsRoutes, ...athleteRoutes, ...scheduleRoutes];
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

function todayForProrodeo() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}
