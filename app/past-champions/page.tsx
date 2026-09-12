import type { Metadata } from "next";
import Link from "next/link";
import { RodeoDailyLogoMark } from "../components/rodeo-views";
import { mapPastChampions } from "../lib/rodeo-data";
import type { PastChampion } from "../lib/types";
import { absoluteUrl } from "../lib/seo";

const championsApiUrl = "https://rodeo-data-api.psides83.workers.dev/v1/past-champions";
const contactEmail = "thewaymediaco@gmail.com";

export const dynamic = "force-dynamic";
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "PRCA Past World Champions",
  description:
    "Browse PRCA past world champions by year and event, including all-around, roughstock, timed event, steer roping, barrel racing, and breakaway champions on Rodeo Daily.",
  alternates: {
    canonical: absoluteUrl("/past-champions")
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/past-champions"),
    title: "PRCA Past World Champions | Rodeo Daily",
    description:
      "Browse PRCA past world champions by year and event, with historic rodeo champions organized for fans following standings, results, and NFR context."
  },
  twitter: {
    card: "summary",
    title: "PRCA Past World Champions | Rodeo Daily",
    description:
      "Browse PRCA past world champions by year and event, with historic rodeo champions organized for fans following standings, results, and NFR context."
  }
};

export default async function PastChampionsPage() {
  const champions = await fetchPastChampions();
  const recentChampions = champions.slice(0, 48);
  const events = Array.from(new Set(champions.map((champion) => champion.event))).sort();
  const latestYear = champions[0]?.year;
  const earliestYear = champions.reduce((year, champion) => Math.min(year, champion.year), latestYear ?? new Date().getFullYear());
  const eventSummaries = events.map((event) => ({
    event,
    champions: champions.filter((champion) => champion.event === event).slice(0, 6)
  }));
  const jsonLd = pageJsonLd(champions, recentChampions);

  return (
    <main className="seo-page past-champions-seo-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c")
        }}
      />
      <section className="seo-page-shell past-champions-shell">
        <header className="seo-page-header">
          <Link className="seo-page-brand" href="/">
            <RodeoDailyLogoMark />
            <span>Rodeo Daily</span>
          </Link>
          <Link className="seo-page-open-app" href="/?tab=more&section=champions">
            Open Champions
          </Link>
        </header>

        <section className="seo-page-hero seo-standings-hero">
          <span>Past Champions</span>
          <h1>PRCA Past World Champions by Year and Event</h1>
          <p>
            Browse historic rodeo world champions across all-around, roughstock, timed events, barrel racing,
            steer roping, and breakaway roping. Rodeo Daily connects past champions with the same standings,
            results, schedule, athlete, and NFR reference tools used throughout the current season.
          </p>
          <p className="seo-page-trust-intro">
            This page is a fan-facing historical reference. Official rodeo associations remain the authority for
            final records, corrections, and eligibility decisions.
          </p>
          <Link href="/?tab=more&section=champions">Search Champions In App</Link>
        </section>

        <section className="app-card champions-reference-card" aria-label="Past champions reference overview">
          <div>
            <span>Reference Scope</span>
            <h2>Historic Rodeo Champions</h2>
            <p>
              Rodeo Daily organizes past champions by year, event, athlete, and hometown so fans can compare
              current standings with the names that shaped previous seasons.
            </p>
          </div>
          <dl>
            <div>
              <dt>Champion Rows</dt>
              <dd>{champions.length || "Loading"}</dd>
            </div>
            <div>
              <dt>Events</dt>
              <dd>{events.length || "Loading"}</dd>
            </div>
            <div>
              <dt>Years Covered</dt>
              <dd>{latestYear ? `${earliestYear}-${latestYear}` : "Updating"}</dd>
            </div>
          </dl>
        </section>

        <section className="champions-seo-grid" aria-label="Past champion event summaries">
          {eventSummaries.map((summary) => (
            <article className="app-card champion-event-summary" key={summary.event} id={eventAnchor(summary.event)}>
              <h2>{summary.event} Past Champions</h2>
              <p>
                Recent {summary.event.toLowerCase()} world champions in the Rodeo Daily archive, with year and hometown
                details where available.
              </p>
              {summary.champions.length > 0 ? (
                <ol>
                  {summary.champions.map((champion) => (
                    <li key={champion.id}>
                      <span>{champion.year}</span>
                      <strong>{champion.athlete}</strong>
                      <em>{champion.hometown || "Hometown unavailable"}</em>
                    </li>
                  ))}
                </ol>
              ) : (
                <p>Champion rows for this event are temporarily unavailable.</p>
              )}
            </article>
          ))}
        </section>

        <section className="app-card seo-related-links-section" aria-label="Related Rodeo Daily reference pages">
          <div>
            <span>Related Reference Pages</span>
            <h2>Standings, Results, and NFR Context</h2>
            <p>
              Past champions are most useful beside current standings, recent results, and NFR context. Use these pages
              to move between historical winners and the current rodeo season.
            </p>
          </div>
          <nav className="seo-related-links" aria-label="Related Rodeo Daily pages">
            <Link href="/nfr-standings">NFR Standings</Link>
            <Link href="/standings">Rodeo Standings</Link>
            <Link href="/results">Rodeo Results</Link>
            <Link href="/schedule">Rodeo Schedule</Link>
            <Link href="/about">About Rodeo Daily</Link>
            <Link href="/support">Support</Link>
          </nav>
        </section>

        <section className="app-card privacy-contact-card">
          <h2>Corrections</h2>
          <p>
            To report a correction, email <a href={`mailto:${contactEmail}`}>{contactEmail}</a> with the year, event,
            athlete name, and the official source that should be reviewed.
          </p>
        </section>
      </section>
    </main>
  );
}

async function fetchPastChampions() {
  try {
    const response = await fetch(championsApiUrl, { next: { revalidate } });
    if (!response.ok) return [];
    const payload = (await response.json()) as PastChampion[];
    return mapPastChampions(payload);
  } catch {
    return [];
  }
}

function pageJsonLd(champions: PastChampion[], recentChampions: PastChampion[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${absoluteUrl("/past-champions")}#collection`,
        name: "PRCA Past World Champions",
        url: absoluteUrl("/past-champions"),
        description:
          "Past rodeo world champions organized by year, event, athlete, and hometown for Rodeo Daily readers.",
        isPartOf: {
          "@type": "WebSite",
          name: "Rodeo Daily",
          url: absoluteUrl("/")
        },
        about: [
          "PRCA past world champions",
          "rodeo world champions",
          "NFR champions",
          "pro rodeo history",
          "rodeo standings"
        ],
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: champions.length,
          itemListElement: recentChampions.map((champion, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "Person",
              name: champion.athlete,
              homeLocation: champion.hometown || undefined,
              description: `${champion.year} ${champion.event} world champion`
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
            name: "Past Champions",
            item: absoluteUrl("/past-champions")
          }
        ]
      }
    ]
  };
}

function eventAnchor(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
