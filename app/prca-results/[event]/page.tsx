import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoLandingPage } from "../../components/seo-landing-page";
import { pageMetadata, resultEventForSlug } from "../../lib/seo";

type EventResultsPageProps = {
  params: {
    event: string;
  };
};

export function generateMetadata({ params }: EventResultsPageProps): Metadata {
  const event = resultEventForSlug(params.event);
  if (!event) return {};

  return pageMetadata({
    title: `PRCA ${event.name} Results`,
    description: `Follow PRCA ${event.name} results, pro rodeo results, leaders, round results, payouts, schedules, daysheets, and athlete links in Rodeo Daily.`,
    path: `/prca-results/${event.slug}`
  });
}

export default function PrcaEventResultsPage({ params }: EventResultsPageProps) {
  const event = resultEventForSlug(params.event);
  if (!event) notFound();

  return (
    <SeoLandingPage
      eyebrow="PRCA Results"
      title={`PRCA ${event.name} Results`}
      description={`Use Rodeo Daily to follow PRCA ${event.name} results with rodeo leaders, round results, payouts, schedules, daysheets, athlete pages, and pro rodeo results.`}
      primaryHref="/?tab=results"
      primaryLabel="Open Results"
      sections={[
        {
          title: `${event.name} Results`,
          body: `Track ${event.name.toLowerCase()} results by rodeo and move into detail pages for leaders, times or scores, payouts, and related event information.`
        },
        {
          title: "PRCA Results by Rodeo",
          body: "Open rodeo detail pages from the results feed to check event leaders, round results, average results, venues, dates, and daysheets."
        },
        {
          title: "Results, Standings, and Athletes",
          body: "Move from PRCA results into standings, athlete profiles, schedules, WPRA results, and broader pro rodeo results."
        }
      ]}
      relatedLinks={[
        { href: "/prca-results", label: "PRCA Results" },
        { href: "/pro-rodeo-results", label: "Pro Rodeo Results" },
        { href: `/prca-standings/2026/${event.slug}`, label: `2026 PRCA ${event.name} Standings` }
      ]}
    />
  );
}
