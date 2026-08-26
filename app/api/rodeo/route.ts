import { NextResponse } from "next/server";

const baseUrl = "https://d1kfpvgfupbmyo.cloudfront.net/services/pro_rodeo.ashx/";

const allowedEvents = new Set(["BB", "SW", "TR", "SB", "TD", "GB", "BR", "SR", "LB"]);
const allowedTypes = new Set(["world", "circuit", "rookie"]);

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

  const url = new URL("standings", baseUrl);
  url.searchParams.set("year", String(year));
  url.searchParams.set("type", type);
  url.searchParams.set("id", "");
  url.searchParams.set("event", event);
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
    next: { revalidate: 300 }
  });

  if (!response.ok) {
    return NextResponse.json({ error: `Rodeo service returned ${response.status}` }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}

function safeEvent(value: string) {
  const normalized = value.toUpperCase();
  return allowedEvents.has(normalized) ? normalized : "TD";
}

function safeStandingType(value: string) {
  const normalized = value.toLowerCase();
  return allowedTypes.has(normalized) ? normalized : "world";
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
