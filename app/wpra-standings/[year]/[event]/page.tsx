import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RodeoDailyLogoMark } from "../../../components/rodeo-views";
import { mapPosition, sortStandingsPositions } from "../../../lib/rodeo-data";
import type { ApiPosition } from "../../../lib/types";
import { absoluteUrl, standingEventForSlug, wpraStandingEvents } from "../../../lib/seo";

type WpraStandingsPageProps = {
  params: {
    year: string;
    event: string;
  };
};

const wpraApiBaseUrl = "https://rodeo-data-api.psides83.workers.dev";

export const revalidate = 1800;

export function generateMetadata({ params }: WpraStandingsPageProps): Metadata {
  const event = wpraStandingEventForSlug(params.event);
  const year = safeYear(params.year);
  if (!event || !year) return {};

  const title = `${year} WPRA ${event.name} Standings`;
  const description = `Follow the ${year} WPRA ${event.name} standings, athlete rankings, season earnings, and current leaders on Rodeo Daily.`;
  const path = `/wpra-standings/${year}/${event.slug}`;

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
      description,
      siteName: "Rodeo Daily"
    },
    twitter: {
      card: "summary",
      title: `${title} | Rodeo Daily`,
      description
    }
  };
}

export default async function WpraStandingsEventPage({ params }: WpraStandingsPageProps) {
  const event = wpraStandingEventForSlug(params.event);
  const year = safeYear(params.year);
  if (!event || !year) notFound();

  const rows = await fetchWpraStandings(year, event.code);
  const leaders = rows.slice(0, 20);
  const title = `${year} WPRA ${event.name} Standings`;
  const description = `Current ${year} WPRA ${event.name} world standings with ranked athletes, hometowns, and season earnings.`;
  const appHref = "/?tab=standings";
  const pageUrl = absoluteUrl(`/wpra-standings/${year}/${event.slug}`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: title,
    description,
    url: pageUrl,
    itemListElement: leaders.map((row, index) => ({
      "@type": "ListItem",
      position: row.place || index + 1,
      item: {
        "@type": "Person",
        name: row.name,
        homeLocation: row.hometown || undefined,
        url: absoluteUrl(`/athletes/${row.id}`)
      }
    }))
  };

  return (
    <main className="seo-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c")
        }}
      />
      <section className="seo-page-shell">
        <header className="seo-page-header">
          <Link className="seo-page-brand" href="/">
            <RodeoDailyLogoMark />
            <span>Rodeo Daily</span>
          </Link>
          <Link className="seo-page-open-app" href={appHref}>
            Open Standings
          </Link>
        </header>

        <section className="seo-page-hero seo-standings-hero">
          <span>WPRA Standings</span>
          <h1>{title}</h1>
          <p>{description} Open Rodeo Daily for filters, favorites, athlete profiles, PRCA standings, and pro rodeo results.</p>
          <Link href={appHref}>View In App</Link>
        </section>

        <section className="app-card seo-standings-card" aria-label={title}>
          <div className="seo-standings-card-header">
            <div>
              <span>World Standings</span>
              <h2>{event.name}</h2>
            </div>
            <strong>{year}</strong>
          </div>

          {leaders.length > 0 ? (
            <ol className="seo-standings-list">
              {leaders.map((row) => (
                <li key={row.id}>
                  <span>#{row.place}</span>
                  <div>
                    <Link href={`/athletes/${row.id}`}>{row.name}</Link>
                    <p>{row.hometown || "Hometown unavailable"}</p>
                  </div>
                  <strong>{row.metric}</strong>
                </li>
              ))}
            </ol>
          ) : (
            <p className="seo-standings-empty">WPRA standings are temporarily unavailable. Open Rodeo Daily for the latest app view.</p>
          )}
        </section>
      </section>
    </main>
  );
}

async function fetchWpraStandings(year: string, eventCode: string) {
  try {
    const url = new URL("/v1/wpra/standings", wpraApiBaseUrl);
    url.searchParams.set("season_year", year);
    url.searchParams.set("event", eventCode);
    url.searchParams.set("type", "world");
    const response = await fetch(url, { next: { revalidate } });
    if (!response.ok) return [];
    const payload = (await response.json()) as { data?: ApiPosition[] } | ApiPosition[];
    const positions = Array.isArray(payload) ? payload : (payload.data ?? []);
    return sortStandingsPositions(positions).map(mapPosition);
  } catch {
    return [];
  }
}

function wpraStandingEventForSlug(slug: string) {
  const event = standingEventForSlug(slug);
  return wpraStandingEvents.find((wpraEvent) => wpraEvent.slug === event?.slug);
}

function safeYear(value: string) {
  return /^20\d{2}$/.test(value) ? value : null;
}
