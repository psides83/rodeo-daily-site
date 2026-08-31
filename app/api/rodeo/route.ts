import { NextResponse } from "next/server";

const baseUrl = "https://d1kfpvgfupbmyo.cloudfront.net/services/pro_rodeo.ashx/";
const rodeoDataApiUrl = "https://rodeo-data-api.psides83.workers.dev";

const allowedEvents = new Set(["AA", "BB", "SW", "TR", "TRHD", "TRHL", "SB", "TD", "GB", "BR", "XB", "SR", "LB"]);
const wpraEvents = new Set(["GB", "LB"]);
const defaultCircuitId = "1";
const standingTypeAliases = new Map([
  ["world", "world"],
  ["circuit", "circuit"],
  ["rookie", "rookie"],
  ["permit", "permit"],
  ["playoffseries", "playoffSeries"],
  ["playoffSeries", "playoffSeries"],
  ["xtremebulls", "xtremeBulls"],
  ["xtremeBulls", "xtremeBulls"],
  ["xtremebroncs", "xtremeBroncs"],
  ["xtremeBroncs", "xtremeBroncs"],
  ["legacysteerroping", "legacySteerRoping"],
  ["legacySteerRoping", "legacySteerRoping"]
]);
const tourStandingTypes = new Set(["playoffSeries", "xtremeBulls", "xtremeBroncs", "legacySteerRoping"]);
const singleEventTourStandingTypes = new Set(["xtremeBulls", "xtremeBroncs", "legacySteerRoping"]);
const tourIds: Record<string, string> = {
  xtremeBulls: "4",
  xtremeBroncs: "15",
  legacySteerRoping: "16",
  playoffSeries: "17"
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const resource = searchParams.get("resource");

  try {
    if (resource === "standings") {
      return proxy(standingsUrl(searchParams));
    }

    if (resource === "athlete") {
      return proxy(athleteUrl(searchParams));
    }

    if (resource === "athlete-search") {
      return proxy(athleteSearchUrl(searchParams));
    }

    if (resource === "results-rodeos") {
      return proxy(rodeoListUrl(searchParams, "results"));
    }

    if (resource === "schedule") {
      return proxy(rodeoListUrl(searchParams, "schedule"));
    }

    if (resource === "rodeo-results") {
      return proxy(rodeoResultsUrl(searchParams));
    }

    if (resource === "daysheet") {
      return proxy(daysheetUrl(searchParams));
    }

    if (resource === "business-journal") {
      return proxy(new URL("https://psides83.github.io/pbj-scraper/pbj-detailed.json"));
    }

    if (resource === "past-champions") {
      return proxy(new URL("https://rodeo-data-api.psides83.workers.dev/v1/past-champions"));
    }

    if (resource === "nfr-standings") {
      return proxy(nfrStandingsUrl(searchParams));
    }

    return NextResponse.json({ error: "Unknown rodeo resource" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load rodeo data";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

function standingsUrl(searchParams: URLSearchParams) {
  const year = safeNumber(searchParams.get("year")) ?? new Date().getFullYear();
  const event = safeEvent(searchParams.get("event") ?? "TD");
  const type = safeStandingType(searchParams.get("type") ?? "world");

  if (wpraEvents.has(event) && !singleEventTourStandingTypes.has(type)) {
    return wpraStandingsUrl(year, event, type, searchParams);
  }

  const url = new URL("standings", baseUrl);
  url.searchParams.set("year", String(year));
  url.searchParams.set("type", tourStandingTypes.has(type) ? "tour" : type);
  url.searchParams.set("id", tourIds[type] ?? (type === "circuit" ? safeNumber(searchParams.get("circuitId"))?.toString() ?? defaultCircuitId : ""));
  url.searchParams.set("event", singleEventTourStandingTypes.has(type) ? "AA" : event);
  return url;
}

function wpraStandingsUrl(year: number, event: string, type: string, searchParams: URLSearchParams) {
  const url = new URL("/v1/wpra/standings", rodeoDataApiUrl);
  url.searchParams.set("season_year", String(year));
  url.searchParams.set("event", event);
  url.searchParams.set("type", normalizedStandingType(type));
  url.searchParams.set("refresh", wpraWeeklyRefreshKey());

  if (type === "circuit") {
    url.searchParams.set("circuit_id", safeNumber(searchParams.get("circuitId"))?.toString() ?? defaultCircuitId);
  }

  return url;
}

function athleteUrl(searchParams: URLSearchParams) {
  const athleteId = safeNumber(searchParams.get("athleteId"));
  if (!athleteId) throw new Error("Missing athleteId");

  const url = new URL("athlete", baseUrl);
  url.searchParams.set("id", String(athleteId));
  return url;
}

function athleteSearchUrl(searchParams: URLSearchParams) {
  const url = new URL("athletes", baseUrl);
  url.searchParams.set("event_type", "");
  url.searchParams.set("letter", "");
  url.searchParams.set("page_size", "12");
  url.searchParams.set("index", "1");
  url.searchParams.set("search_term", searchParams.get("search")?.slice(0, 80) ?? "");
  url.searchParams.set("search_type", "");
  url.searchParams.set("exact_search", "null");
  return url;
}

function rodeoListUrl(searchParams: URLSearchParams, type: "results" | "schedule") {
  const url = new URL("schedule", baseUrl);
  url.searchParams.set("type", type);
  url.searchParams.set("page_size", "24");
  url.searchParams.set("index", String(safeNumber(searchParams.get("index")) ?? 1));
  url.searchParams.set("search_term", searchParams.get("search")?.slice(0, 80) ?? "");
  url.searchParams.set("search_type", "");
  url.searchParams.set("tourId", "");
  url.searchParams.set("circuitId", "");

  const start = safeDateParam(searchParams.get("start"));
  const end = safeDateParam(searchParams.get("end"));

  if (type === "results") {
    url.searchParams.set("combine_results", "true");
    url.searchParams.set("active", "true");
    if (start) url.searchParams.set("start", start);
    if (end) url.searchParams.set("end", end);
  } else {
    url.searchParams.set("start", start ?? todayForProrodeo());
    if (end) url.searchParams.set("end", end);
  }

  return url;
}

function rodeoResultsUrl(searchParams: URLSearchParams) {
  const rodeoId = safeNumber(searchParams.get("rodeoId"));
  if (!rodeoId) throw new Error("Missing rodeoId");

  const url = new URL("results", baseUrl);
  url.searchParams.set("rodeoid", String(rodeoId));
  return url;
}

function daysheetUrl(searchParams: URLSearchParams) {
  const rodeoId = safeNumber(searchParams.get("rodeoId"));
  if (!rodeoId) throw new Error("Missing rodeoId");

  const url = new URL("daysheet", baseUrl);
  url.searchParams.set("id", String(rodeoId));
  return url;
}

function nfrStandingsUrl(searchParams: URLSearchParams) {
  const event = safeEvent(searchParams.get("event") ?? "BB");
  const url = new URL("https://d1kfpvgfupbmyo.cloudfront.net/services/nfr.ashx/standings");
  url.searchParams.set("event", event === "TRHD" || event === "TRHL" ? "TR" : event);
  return url;
}

async function proxy(url: URL) {
  const response = await fetch(url, {
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache"
    },
    next: { revalidate: 60 }
  });

  if (!response.ok) {
    return NextResponse.json({ error: `Rodeo service returned ${response.status}` }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store, max-age=0"
    }
  });
}

function safeEvent(value: string) {
  const normalized = value.toUpperCase();
  return allowedEvents.has(normalized) ? normalized : "TD";
}

function safeStandingType(value: string) {
  const trimmed = value.trim();
  return standingTypeAliases.get(trimmed) ?? standingTypeAliases.get(trimmed.toLowerCase()) ?? "world";
}

function normalizedStandingType(value: string) {
  const cleaned = value.trim().toLowerCase();
  if (!cleaned) return "world";
  if (cleaned.includes("world")) return "world";
  if (cleaned.includes("circuit")) return "circuit";
  if (cleaned.includes("rookie")) return "rookie";
  if (cleaned.includes("permit")) return "permit";
  if (cleaned.includes("xtremebull") || cleaned.includes("xbull")) return "xtremebulls";
  if (cleaned.includes("xtremebronc") || cleaned.includes("xbronc")) return "xtremebroncs";
  if (cleaned.includes("legacy")) return "legacysteerroping";
  if (cleaned.includes("playoff")) return "playoffseries";
  return cleaned.replace(/\s+/g, "");
}

function wpraWeeklyRefreshKey(date = new Date()) {
  const updateHourUtc = 12;
  const day = date.getUTCDay();
  const daysSinceMonday = (day + 6) % 7;
  let mondayNoon = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - daysSinceMonday, updateHourUtc);

  if (date.getTime() < mondayNoon) {
    mondayNoon -= 7 * 24 * 60 * 60 * 1000;
  }

  const refreshDate = new Date(mondayNoon);
  const year = refreshDate.getUTCFullYear();
  const month = String(refreshDate.getUTCMonth() + 1).padStart(2, "0");
  const dayOfMonth = String(refreshDate.getUTCDate()).padStart(2, "0");
  return `${year}${month}${dayOfMonth}`;
}

function safeNumber(value: string | null) {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function safeDateParam(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return `${month}/${day}/${year}`;
}

function todayForProrodeo() {
  const today = new Date();
  return `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
}
