import type { Metadata } from "next";
import { ScheduleRodeoClient } from "./schedule-rodeo-client";
import { ThemeSync } from "../../components/theme-sync";
import { mapRodeo } from "../../lib/rodeo-data";
import type { ApiRodeo } from "../../lib/types";
import { absoluteUrl } from "../../lib/seo";

type ScheduleRodeoRoutePageProps = {
  params: {
    rodeoId: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
};

type SeoRodeo = {
  id: number;
  name: string;
  location: string;
  venueName: string;
  websiteUrl: string | null;
  startDate: string;
  endDate: string;
  startDateRaw: string;
  endDateRaw: string;
  payout: string;
  hasDaysheets: boolean;
};

const rodeoApiBaseUrl = "https://d1kfpvgfupbmyo.cloudfront.net/services/pro_rodeo.ashx/";

export const revalidate = 1800;

export async function generateMetadata({ params, searchParams }: ScheduleRodeoRoutePageProps): Promise<Metadata> {
  const rodeoId = safeRodeoId(params.rodeoId);
  const rodeo = await resolveRodeo(rodeoId ?? 0, searchParams);
  const title = `${rodeo.name} Rodeo Schedule`;
  const locationText = rodeo.location ? ` in ${rodeo.location}` : "";
  const dateText = rodeo.startDate || rodeo.endDate ? ` from ${rodeo.startDate || rodeo.endDate}${rodeo.endDate && rodeo.endDate !== rodeo.startDate ? ` to ${rodeo.endDate}` : ""}` : "";
  const daysheetText = rodeo.hasDaysheets ? " Includes daysheets when available." : "";
  const description = `View the ${rodeo.name} rodeo schedule${locationText}${dateText}, venue details, payout information, results, and daysheets on Rodeo Daily.${daysheetText}`;
  const path = `/schedule/${rodeoId ?? params.rodeoId}`;

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(path)
    },
    openGraph: {
      type: "website",
      url: absoluteUrl(path),
      title: `${title} | Rodeo Daily`,
      description
    },
    twitter: {
      card: "summary",
      title: `${title} | Rodeo Daily`,
      description
    }
  };
}

export default async function ScheduleRodeoRoutePage({ params, searchParams }: ScheduleRodeoRoutePageProps) {
  const rodeoId = safeRodeoId(params.rodeoId) ?? 0;
  const rodeo = await resolveRodeo(rodeoId, searchParams);
  const jsonLd = scheduleJsonLd(rodeo);

  return (
    <main className="browser-stage routed-stage">
      <ThemeSync />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c")
        }}
      />
      <section className="routed-window">
        <ScheduleRodeoClient rodeoId={rodeoId} />
      </section>
    </main>
  );
}

async function resolveRodeo(rodeoId: number, searchParams?: Record<string, string | string[] | undefined>): Promise<SeoRodeo> {
  const fromParams = rodeoFromSearchParams(rodeoId, searchParams);
  if (fromParams.name && fromParams.name !== `Rodeo #${rodeoId || ""}`) return fromParams;
  const fromSchedule = await fetchUpcomingRodeo(rodeoId);
  return fromSchedule ?? fromParams;
}

async function fetchUpcomingRodeo(rodeoId: number): Promise<SeoRodeo | null> {
  if (!rodeoId) return null;
  try {
    const url = new URL("schedule", rodeoApiBaseUrl);
    url.searchParams.set("type", "schedule");
    url.searchParams.set("page_size", "120");
    url.searchParams.set("index", "1");
    url.searchParams.set("search_term", "");
    url.searchParams.set("search_type", "");
    url.searchParams.set("tourId", "");
    url.searchParams.set("circuitId", "");
    url.searchParams.set("start", todayForProrodeo());
    const response = await fetch(url, { next: { revalidate } });
    if (!response.ok) return null;
    const payload = (await response.json()) as { data?: ApiRodeo[] };
    const apiRodeo = payload.data?.find((item) => item.RodeoId === rodeoId);
    if (!apiRodeo) return null;
    return seoRodeoFromRow(mapRodeo(apiRodeo));
  } catch {
    return null;
  }
}

function scheduleJsonLd(rodeo: SeoRodeo) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: rodeo.name,
    url: absoluteUrl(`/schedule/${rodeo.id}`),
    startDate: rodeo.startDateRaw || undefined,
    endDate: rodeo.endDateRaw || undefined,
    sport: "Rodeo",
    location: rodeo.location
      ? {
          "@type": "Place",
          name: rodeo.venueName || rodeo.name,
          address: rodeo.location
        }
      : undefined,
    offers: rodeo.websiteUrl
      ? {
          "@type": "Offer",
          url: rodeo.websiteUrl,
          availability: "https://schema.org/InStock"
        }
      : undefined,
    description: `Schedule, venue, payout, daysheets, and results for ${rodeo.name}.`
  };
}

function rodeoFromSearchParams(rodeoId: number, searchParams?: Record<string, string | string[] | undefined>): SeoRodeo {
  return {
    id: rodeoId,
    name: searchParam(searchParams, "name") || `Rodeo #${rodeoId || ""}`,
    location: searchParam(searchParams, "location") || "",
    venueName: searchParam(searchParams, "venue") || "",
    websiteUrl: searchParam(searchParams, "website") || null,
    startDate: searchParam(searchParams, "start") || "",
    endDate: searchParam(searchParams, "end") || "",
    startDateRaw: searchParam(searchParams, "startRaw") || "",
    endDateRaw: searchParam(searchParams, "endRaw") || "",
    payout: searchParam(searchParams, "payout") || "",
    hasDaysheets: searchParam(searchParams, "daysheets") === "true"
  };
}

function seoRodeoFromRow(rodeo: ReturnType<typeof mapRodeo>): SeoRodeo {
  return {
    id: rodeo.id,
    name: rodeo.name,
    location: rodeo.location,
    venueName: rodeo.venueName,
    websiteUrl: rodeo.websiteUrl,
    startDate: rodeo.startDate,
    endDate: rodeo.endDate,
    startDateRaw: rodeo.startDateRaw || "",
    endDateRaw: rodeo.endDateRaw || "",
    payout: rodeo.payout,
    hasDaysheets: rodeo.hasDaysheets
  };
}

function searchParam(searchParams: Record<string, string | string[] | undefined> | undefined, key: string) {
  const value = searchParams?.[key];
  return Array.isArray(value) ? value[0] : value;
}

function safeRodeoId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function todayForProrodeo() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}
