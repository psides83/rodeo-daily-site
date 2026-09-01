import type { Metadata } from "next";
import { ResultsRodeoClient } from "./results-rodeo-client";
import { ThemeSync } from "../../components/theme-sync";
import { eventCodes, events, mapWinners } from "../../lib/rodeo-data";
import type { ApiRodeoResults, EventName } from "../../lib/types";
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
  const rodeo = rodeoFromSearchParams(rodeoId ?? 0, searchParams);
  const event = eventParam(searchParam(searchParams, "event"));
  const title = `${rodeo.name} ${event} Results`;
  const locationText = rodeo.location ? ` in ${rodeo.location}` : "";
  const dateText = rodeo.endDate || rodeo.startDate ? ` from ${rodeo.startDate || rodeo.endDate}${rodeo.endDate && rodeo.endDate !== rodeo.startDate ? ` to ${rodeo.endDate}` : ""}` : "";
  const description = `View ${event} rodeo results for ${rodeo.name}${locationText}${dateText}, including winners, round results, payouts, and athlete links on Rodeo Daily.`;
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
  const rodeo = rodeoFromSearchParams(rodeoId, searchParams);
  const event = eventParam(searchParam(searchParams, "event"));
  const winners = rodeoId ? await fetchWinners(rodeoId, event) : [];
  const jsonLd = resultJsonLd(rodeo, event, winners);

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
        <ResultsRodeoClient rodeoId={rodeoId} />
      </section>
    </main>
  );
}

async function fetchWinners(rodeoId: number, event: EventName) {
  try {
    const url = new URL("results", rodeoApiBaseUrl);
    url.searchParams.set("rodeoid", String(rodeoId));
    const response = await fetch(url, { next: { revalidate } });
    if (!response.ok) return [];
    const payload = (await response.json()) as ApiRodeoResults;
    return mapWinners(payload, eventCodes[event]);
  } catch {
    return [];
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
    endDateRaw: searchParam(searchParams, "endRaw") || ""
  };
}

function eventParam(value?: string): EventName {
  return events.includes(value as EventName) ? (value as EventName) : "Tie-Down Roping";
}

function searchParam(searchParams: Record<string, string | string[] | undefined> | undefined, key: string) {
  const value = searchParams?.[key];
  return Array.isArray(value) ? value[0] : value;
}

function safeRodeoId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}
