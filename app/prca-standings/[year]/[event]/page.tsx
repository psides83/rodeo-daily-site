import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RodeoDailyLogoMark } from "../../../components/rodeo-views";
import { mapPosition, sortStandingsPositions } from "../../../lib/rodeo-data";
import type { ApiPosition } from "../../../lib/types";
import { absoluteUrl, standingEventForSlug } from "../../../lib/seo";

type StandingsSeoPageProps = {
  params: {
    year: string;
    event: string;
  };
};

const standingsApiBaseUrl = "https://d1kfpvgfupbmyo.cloudfront.net/services/pro_rodeo.ashx/";
const wpraApiBaseUrl = "https://rodeo-data-api.psides83.workers.dev";
const wpraEvents = new Set(["GB", "LB"]);

export const revalidate = 1800;

export function generateMetadata({ params }: StandingsSeoPageProps): Metadata {
  const event = standingEventForSlug(params.event);
  const year = safeYear(params.year);
  if (!event || !year) return {};

  const title = `${year} PRCA ${event.name} Standings`;
  const description = `Follow the ${year} PRCA ${event.name} standings, rodeo rankings, athlete earnings, and current season leaders on Rodeo Daily.`;
  const path = `/prca-standings/${year}/${event.slug}`;

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

export default async function StandingsSeoPage({ params }: StandingsSeoPageProps) {
  const event = standingEventForSlug(params.event);
  const year = safeYear(params.year);
  if (!event || !year) notFound();

  const rows = await fetchStandings(year, event.code);
  const leaders = rows.slice(0, 20);
  const title = `${year} PRCA ${event.name} Standings`;
  const description = `Current ${year} ${event.name} world standings with ranked athletes, hometowns, and season earnings.`;
  const appHref = `/?tab=standings`;
  const pageUrl = absoluteUrl(`/prca-standings/${year}/${event.slug}`);
  const relatedResultLinks = prcaRelatedResultLinks(event);
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
          <span>PRCA Standings</span>
          <h1>{title}</h1>
          <p>{description} Open the full Rodeo Daily app view for filters, favorites, athlete profiles, and live updates.</p>
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
            <p className="seo-standings-empty">Standings are temporarily unavailable. Open Rodeo Daily for the latest app view.</p>
          )}
        </section>

        <section className="app-card seo-related-links-section" aria-label={`Related ${event.name} results pages`}>
          <div>
            <span>Related Results</span>
            <h2>{event.name} Results and Standings</h2>
            <p>
              Move from {year} PRCA {event.name} standings into related PRCA results, WPRA results, pro rodeo results, and rodeo standings pages.
            </p>
          </div>
          <nav className="seo-related-links" aria-label={`Related ${event.name} results links`}>
            {relatedResultLinks.map((link) => (
              <Link href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </section>
      </section>
    </main>
  );
}

async function fetchStandings(year: string, eventCode: string) {
  try {
    const url = wpraEvents.has(eventCode) ? wpraStandingsUrl(year, eventCode) : prcaStandingsUrl(year, eventCode);
    const response = await fetch(url, { next: { revalidate } });
    if (!response.ok) return [];
    const payload = (await response.json()) as { data?: ApiPosition[] } | ApiPosition[];
    const positions = Array.isArray(payload) ? payload : (payload.data ?? []);
    return sortStandingsPositions(positions).map(mapPosition);
  } catch {
    return [];
  }
}

function prcaStandingsUrl(year: string, eventCode: string) {
  const url = new URL("standings", standingsApiBaseUrl);
  url.searchParams.set("year", year);
  url.searchParams.set("type", "world");
  url.searchParams.set("id", "");
  url.searchParams.set("event", eventCode);
  return url;
}

function wpraStandingsUrl(year: string, eventCode: string) {
  const url = new URL("/v1/wpra/standings", wpraApiBaseUrl);
  url.searchParams.set("season_year", year);
  url.searchParams.set("event", eventCode);
  url.searchParams.set("type", "world");
  return url;
}

function safeYear(value: string) {
  return /^20\d{2}$/.test(value) ? value : null;
}

function prcaRelatedResultLinks(event: NonNullable<ReturnType<typeof standingEventForSlug>>) {
  const resultSlug = resultSlugForStandingEvent(event.slug);
  const links = [
    { href: "/prca-results", label: "PRCA Results" },
    { href: "/pro-rodeo-results", label: "Pro Rodeo Results" },
    { href: "/standings", label: "PRCA and WPRA Standings" }
  ];

  if (resultSlug) {
    links.unshift(
      { href: `/prca-results/${resultSlug}`, label: `PRCA ${event.name} Results` },
      { href: `/pro-rodeo-results/${resultSlug}`, label: `Pro Rodeo ${event.name} Results` }
    );
  }

  if (wpraEvents.has(event.code) && resultSlug) {
    links.splice(2, 0, { href: `/wpra-results/${resultSlug}`, label: `WPRA ${event.name} Results` });
  }

  return links;
}

function resultSlugForStandingEvent(slug: string) {
  if (slug === "all-around") return null;
  if (slug === "team-roping-headers" || slug === "team-roping-heelers") return "team-roping";
  return slug;
}
