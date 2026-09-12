import type { Metadata } from "next";
import Link from "next/link";
import { RodeoDailyLogoMark } from "../components/rodeo-views";
import { eventCodes, mapNfrStandings } from "../lib/rodeo-data";
import { currentNfrSeason, currentNfrSeasonLabel } from "../lib/nfr";
import type { ApiNfrStandingsResponse, EventName, NfrContestant } from "../lib/types";
import { absoluteUrl } from "../lib/seo";

const nfrApiBaseUrl = "https://d1kfpvgfupbmyo.cloudfront.net/services/nfr.ashx/standings";
const nfrEvents: Array<{ name: EventName; code: string }> = [
  { name: "Bareback Riding", code: eventCodes["Bareback Riding"] },
  { name: "Steer Wrestling", code: eventCodes["Steer Wrestling"] },
  { name: "Team Roping", code: eventCodes["Team Roping"] },
  { name: "Saddle Bronc Riding", code: eventCodes["Saddle Bronc Riding"] },
  { name: "Tie-Down Roping", code: eventCodes["Tie-Down Roping"] },
  { name: "Barrel Racing", code: eventCodes["Barrel Racing"] },
  { name: "Bull Riding", code: eventCodes["Bull Riding"] }
];

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export const metadata: Metadata = {
  title: `${currentNfrSeason} NFR Standings`,
  description: `View ${currentNfrSeason} NFR standings by event, including average rankings, world standings position, round results, and related PRCA and WPRA rodeo context on Rodeo Daily.`,
  alternates: {
    canonical: absoluteUrl("/nfr-standings")
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/nfr-standings"),
    title: `${currentNfrSeason} NFR Standings | Rodeo Daily`,
    description: `Browse ${currentNfrSeason} NFR standings by event with average rankings, world standings positions, round results, and related rodeo reference pages.`
  },
  twitter: {
    card: "summary",
    title: `${currentNfrSeason} NFR Standings | Rodeo Daily`,
    description: `Browse ${currentNfrSeason} NFR standings by event with average rankings, world standings positions, round results, and related rodeo reference pages.`
  }
};

export default async function NfrStandingsPage() {
  const eventGroups = await fetchNfrEventGroups();
  const visibleRows = eventGroups.flatMap((group) => group.rows.slice(0, 8));
  const currentRound = Math.max(0, ...visibleRows.map((row) => row.currentRound || 0));
  const jsonLd = pageJsonLd(eventGroups, visibleRows);

  return (
    <main className="seo-page nfr-seo-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c")
        }}
      />
      <section className="seo-page-shell nfr-seo-shell">
        <header className="seo-page-header">
          <Link className="seo-page-brand" href="/">
            <RodeoDailyLogoMark />
            <span>Rodeo Daily</span>
          </Link>
          <Link className="seo-page-open-app" href="/?tab=more&section=nfr">
            Open NFR
          </Link>
        </header>

        <section className="seo-page-hero seo-standings-hero">
          <span>{currentNfrSeasonLabel} Standings</span>
          <h1>{currentNfrSeason} NFR Standings by Event</h1>
          <p>
            Follow the visible {currentNfrSeason} National Finals Rodeo standings by event, including average positions,
            world standings rank, round-by-round results, and contestant names from the NFR feed.
          </p>
          <p className="seo-page-trust-intro">
            Rodeo Daily labels the NFR season shown here because the standings feed reflects a specific Finals year.
            These rows currently represent the {currentNfrSeason} NFR.
          </p>
          <Link href="/?tab=more&section=nfr">View {currentNfrSeasonLabel} In App</Link>
        </section>

        <section className="app-card nfr-season-card" aria-label={`${currentNfrSeason} NFR season summary`}>
          <div>
            <span>Season Shown</span>
            <h2>{currentNfrSeasonLabel}</h2>
            <p>
              The NFR view is separate from the regular-season PRCA and WPRA standings. It tracks Finals average
              standings and round results for the season displayed on this page.
            </p>
          </div>
          <dl>
            <div>
              <dt>Season</dt>
              <dd>{currentNfrSeason}</dd>
            </div>
            <div>
              <dt>Events</dt>
              <dd>{eventGroups.length}</dd>
            </div>
            <div>
              <dt>Round Status</dt>
              <dd>{currentRound ? `Round ${currentRound}` : "Updating"}</dd>
            </div>
          </dl>
        </section>

        <section className="nfr-seo-grid" aria-label={`${currentNfrSeason} NFR standings by event`}>
          {eventGroups.map((group) => (
            <article className="app-card nfr-event-summary" key={group.name} id={eventAnchor(group.name)}>
              <div className="nfr-event-summary-heading">
                <span>{currentNfrSeasonLabel}</span>
                <h2>{group.name} Standings</h2>
                <p>
                  Average standings and world standings context for {group.name.toLowerCase()} at the {currentNfrSeason} NFR.
                </p>
              </div>
              {group.rows.length > 0 ? (
                <ol>
                  {group.rows.slice(0, 8).map((row) => (
                    <li key={`${group.name}-${row.id}`}>
                      <span>Avg {row.averagePlace || "-"}</span>
                      <div>
                        <strong>{row.name}</strong>
                        <em>
                          World #{row.worldPlace || "-"} - {row.averageDisplayValue}
                        </em>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p>NFR standings for this event are temporarily unavailable.</p>
              )}
            </article>
          ))}
        </section>

        <section className="app-card seo-related-links-section" aria-label="Related NFR and rodeo pages">
          <div>
            <span>Related Rodeo Reference</span>
            <h2>{currentNfrSeasonLabel}, Current Standings, and Past Champions</h2>
            <p>
              Compare the visible {currentNfrSeason} NFR standings with regular-season standings, recent results,
              schedules, and historic world champion reference pages.
            </p>
          </div>
          <nav className="seo-related-links" aria-label="Related NFR links">
            <Link href="/past-champions">PRCA Past World Champions</Link>
            <Link href="/standings">Rodeo Standings</Link>
            <Link href="/results">Rodeo Results</Link>
            <Link href="/schedule">Rodeo Schedule</Link>
            <Link href="/about">About Rodeo Daily</Link>
            <Link href="/support">Support</Link>
          </nav>
        </section>
      </section>
    </main>
  );
}

async function fetchNfrEventGroups() {
  return Promise.all(
    nfrEvents.map(async (event) => ({
      name: event.name,
      rows: await fetchNfrStandings(event.code)
    }))
  );
}

async function fetchNfrStandings(eventCode: string) {
  try {
    const url = new URL(nfrApiBaseUrl);
    url.searchParams.set("event", eventCode);
    const response = await fetch(url, { next: { revalidate } });
    if (!response.ok) return [];
    const payload = (await response.json()) as ApiNfrStandingsResponse;
    return mapNfrStandings(payload);
  } catch {
    return [];
  }
}

function pageJsonLd(eventGroups: Array<{ name: EventName; rows: NfrContestant[] }>, visibleRows: NfrContestant[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${absoluteUrl("/nfr-standings")}#collection`,
        name: `${currentNfrSeason} NFR Standings`,
        url: absoluteUrl("/nfr-standings"),
        description: `${currentNfrSeason} National Finals Rodeo standings by event, average place, world standings rank, and round results.`,
        isPartOf: {
          "@type": "WebSite",
          name: "Rodeo Daily",
          url: absoluteUrl("/")
        },
        about: [
          `${currentNfrSeason} NFR standings`,
          "National Finals Rodeo standings",
          "PRCA standings",
          "WPRA standings",
          "rodeo results"
        ],
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: visibleRows.length,
          itemListElement: visibleRows.map((row, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "Person",
              name: row.name,
              description: `${currentNfrSeason} NFR ${eventLabel(row.eventType, eventGroups)} average place ${row.averagePlace || "-"}, world standings rank ${row.worldPlace || "-"}`
            }
          }))
        }
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Rodeo Daily",
            item: absoluteUrl("/")
          },
          {
            "@type": "ListItem",
            position: 2,
            name: `${currentNfrSeason} NFR Standings`,
            item: absoluteUrl("/nfr-standings")
          }
        ]
      }
    ]
  };
}

function eventLabel(eventCode: string, eventGroups: Array<{ name: EventName; rows: NfrContestant[] }>) {
  return eventGroups.find((group) => group.rows.some((row) => row.eventType === eventCode))?.name ?? eventCode;
}

function eventAnchor(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
