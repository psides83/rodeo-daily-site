import type { Metadata } from "next";
import { ResultsRodeoClient } from "./results-rodeo-client";
import { eventCodes, events, mapRodeo, mapWinners } from "../../lib/rodeo-data";
import type { ApiRodeo, ApiRodeoResults, EventCode, EventName } from "../../lib/types";
import { absoluteUrl } from "../../lib/seo";

type ResultsRodeoRoutePageProps = {
  params: {
    rodeoId: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
};

const rodeoApiBaseUrl = "https://d1kfpvgfupbmyo.cloudfront.net/services/pro_rodeo.ashx/";

export const revalidate = 900;

export async function generateMetadata({ params, searchParams }: ResultsRodeoRoutePageProps): Promise<Metadata> {
  const rodeoId = safeRodeoId(params.rodeoId);
  const resultDetail = rodeoId ? await fetchResultDetail(rodeoId) : null;
  const rodeo = await resolveRodeo(rodeoId ?? 0, searchParams, resultDetail);
  const event = eventParam(searchParam(searchParams, "event"));
  const eventText = event ? `${event} ` : "PRCA Results & WPRA Results";
  const title = event ? `${rodeo.name} ${eventText}Results` : `${rodeo.name} ${eventText}`;
  const locationText = rodeo.location ? ` in ${rodeo.location}` : "";
  const dateText = rodeo.endDate || rodeo.startDate ? ` from ${rodeo.startDate || rodeo.endDate}${rodeo.endDate && rodeo.endDate !== rodeo.startDate ? ` to ${rodeo.endDate}` : ""}` : "";
  const payoutText = rodeo.payout ? `, ${rodeo.payout} payout` : "";
  const description = event
    ? `View ${event} ${eventResultKeywords(event)} for ${rodeo.name}${locationText}${dateText}${payoutText}, including round results, payouts, leaders, standings context, and athlete links on Rodeo Daily.`
    : `View PRCA results, WPRA results, pro rodeo results, round results, payouts, leaders, standings context, and athlete links for ${rodeo.name}${locationText}${dateText}${payoutText} on Rodeo Daily.`;
  const path = `/results/${rodeoId ?? params.rodeoId}`;

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(path)
    },
    openGraph: {
      type: "article",
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

export default async function ResultsRodeoRoutePage({ params, searchParams }: ResultsRodeoRoutePageProps) {
  const rodeoId = safeRodeoId(params.rodeoId) ?? 0;
  const resultDetail = rodeoId ? await fetchResultDetail(rodeoId) : null;
  const rodeo = await resolveRodeo(rodeoId, searchParams, resultDetail);
  const event = selectedEvent(searchParam(searchParams, "event"), resultDetail) ?? "Tie-Down Roping";
  const winners = resultDetail ? mapWinners(resultDetail, eventCodes[event]) : [];
  const jsonLd = resultJsonLd(rodeo, event, winners);

  return (
    <main className="browser-stage routed-stage">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c")
        }}
      />
      <section className="routed-window">
        <ResultsRodeoClient rodeoId={rodeoId} />
      </section>
    </main>
  );
}

async function fetchResultDetail(rodeoId: number) {
  try {
    const url = new URL("results", rodeoApiBaseUrl);
    url.searchParams.set("rodeoid", String(rodeoId));
    const response = await fetch(url, { next: { revalidate } });
    if (!response.ok) return null;
    return (await response.json()) as ApiRodeoResults;
  } catch {
    return null;
  }
}

async function resolveRodeo(
  rodeoId: number,
  searchParams?: Record<string, string | string[] | undefined>,
  resultDetail?: ApiRodeoResults | null
): Promise<SeoRodeo> {
  const fromParams = rodeoFromSearchParams(rodeoId, searchParams);
  if (fromParams.name && fromParams.name !== `Rodeo #${rodeoId || ""}`) return fromParams;

  const fromResultsList = await fetchResultRodeoSummary(rodeoId);
  if (fromResultsList) return fromResultsList;

  const fromResultDetail = rodeoFromResultDetail(rodeoId, resultDetail);
  return fromResultDetail ?? fromParams;
}

async function fetchResultRodeoSummary(rodeoId: number): Promise<SeoRodeo | null> {
  if (!rodeoId) return null;

  try {
    const url = new URL("schedule", rodeoApiBaseUrl);
    url.searchParams.set("type", "results");
    url.searchParams.set("page_size", "80");
    url.searchParams.set("index", "1");
    url.searchParams.set("search_term", "");
    url.searchParams.set("search_type", "");
    url.searchParams.set("tourId", "");
    url.searchParams.set("circuitId", "");
    url.searchParams.set("combine_results", "true");
    url.searchParams.set("active", "true");
    const response = await fetch(url, { next: { revalidate } });
    if (!response.ok) return null;
    const payload = (await response.json()) as { data?: ApiRodeo[] };
    const row = payload.data?.find((rodeo) => rodeo.RodeoId === rodeoId);
    return row ? seoRodeoFromRow(mapRodeo(row)) : null;
  } catch {
    return null;
  }
}

function resultJsonLd(rodeo: SeoRodeo, event: EventName, winners: Array<[string, string, string]>) {
  const eventUrl = absoluteUrl(`/results/${rodeo.id}`);
  return [
    {
      "@context": "https://schema.org",
      "@type": "SportsEvent",
      name: `${rodeo.name} ${event} Results`,
      url: eventUrl,
      startDate: rodeo.startDateRaw || undefined,
      endDate: rodeo.endDateRaw || undefined,
      location: rodeo.location
        ? {
            "@type": "Place",
            name: rodeo.venueName || rodeo.name,
            address: rodeo.location
          }
        : undefined,
      sport: "Rodeo",
      description: `Rodeo results for ${event} at ${rodeo.name}.`
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${rodeo.name} ${event} winners`,
      url: eventUrl,
      itemListElement: winners.map((winner, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Person",
          name: winner[1],
          description: `${winner[0]} with ${winner[2]}`
        }
      }))
    }
  ];
}

type SeoRodeo = {
  id: number;
  name: string;
  location: string;
  venueName: string;
  startDate: string;
  endDate: string;
  startDateRaw: string;
  endDateRaw: string;
  payout: string;
};

function rodeoFromSearchParams(rodeoId: number, searchParams?: Record<string, string | string[] | undefined>): SeoRodeo {
  return {
    id: rodeoId,
    name: searchParam(searchParams, "name") || `Rodeo #${rodeoId || ""}`,
    location: searchParam(searchParams, "location") || "",
    venueName: searchParam(searchParams, "venue") || "",
    startDate: searchParam(searchParams, "start") || "",
    endDate: searchParam(searchParams, "end") || "",
    startDateRaw: searchParam(searchParams, "startRaw") || "",
    endDateRaw: searchParam(searchParams, "endRaw") || "",
    payout: searchParam(searchParams, "payout") || ""
  };
}

function seoRodeoFromRow(rodeo: ReturnType<typeof mapRodeo>): SeoRodeo {
  return {
    id: rodeo.id,
    name: rodeo.name,
    location: rodeo.location,
    venueName: rodeo.venueName,
    startDate: rodeo.startDate,
    endDate: rodeo.endDate,
    startDateRaw: rodeo.startDateRaw || "",
    endDateRaw: rodeo.endDateRaw || "",
    payout: rodeo.payout
  };
}

function rodeoFromResultDetail(rodeoId: number, payload?: ApiRodeoResults | null): SeoRodeo | null {
  const detail = payload?.data?.[0] as ResultDetailRodeo | undefined;
  if (!detail) return null;
  return {
    id: detail.RodeoId ?? rodeoId,
    name: detail.RodeoName?.trim() || `Rodeo #${rodeoId || ""}`,
    location: [detail.City, detail.State].filter(Boolean).join(", "),
    venueName: detail.VenueName?.trim() ?? "",
    startDate: "",
    endDate: "",
    startDateRaw: "",
    endDateRaw: "",
    payout: ""
  };
}

function selectedEvent(value?: string, payload?: ApiRodeoResults | null): EventName | null {
  const event = eventParam(value);
  if (event) return event;

  const eventCode = firstResultEventCode(payload);
  return eventCode ? eventNameForCode(eventCode) : null;
}

function eventParam(value?: string): EventName | null {
  return events.includes(value as EventName) ? (value as EventName) : null;
}

function firstResultEventCode(payload?: ApiRodeoResults | null): EventCode | null {
  const eventMap = payload?.data?.[0]?.Events;
  if (!eventMap) return null;
  return (Object.keys(eventMap).find((code) => eventNameForCode(code as EventCode)) as EventCode | undefined) ?? null;
}

function eventNameForCode(code: EventCode): EventName | null {
  const entry = Object.entries(eventCodes).find(([, eventCode]) => eventCode === code);
  return (entry?.[0] as EventName | undefined) ?? null;
}

function eventResultKeywords(event: EventName) {
  return event === "Barrel Racing" || event === "Breakaway Roping"
    ? "WPRA results, PRCA results, and pro rodeo results"
    : "PRCA results and pro rodeo results";
}

function searchParam(searchParams: Record<string, string | string[] | undefined> | undefined, key: string) {
  const value = searchParams?.[key];
  return Array.isArray(value) ? value[0] : value;
}

function safeRodeoId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

type ResultDetailRodeo = {
  RodeoName?: string;
  RodeoId?: number;
  City?: string;
  State?: string;
  VenueName?: string | null;
};
