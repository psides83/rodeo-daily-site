import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoLandingPage } from "../../components/seo-landing-page";
import { pageMetadata, resultEventForSlug, wpraResultEvents } from "../../lib/seo";

type WpraEventResultsPageProps = {
  params: {
    event: string;
  };
};

export function generateMetadata({ params }: WpraEventResultsPageProps): Metadata {
  const event = wpraEventForSlug(params.event);
  if (!event) return {};

  return pageMetadata({
    title: `WPRA ${event.name} Results`,
    description: `Follow WPRA ${event.name} results, pro rodeo results, leaders, round results, payouts, schedules, standings, and athlete links in Rodeo Daily.`,
    path: `/wpra-results/${event.slug}`
  });
}

export default function WpraEventResultsPage({ params }: WpraEventResultsPageProps) {
  const event = wpraEventForSlug(params.event);
  if (!event) notFound();

  return (
    <SeoLandingPage
      eyebrow="WPRA Results"
      title={`WPRA ${event.name} Results`}
      description={`Use Rodeo Daily to follow WPRA ${event.name} results with pro rodeo result pages, leaders, round results, payouts, schedules, standings, and athlete profiles.`}
      primaryHref="/?tab=results"
      primaryLabel="Open Results"
      sections={[
        {
          title: `${event.name} Results`,
          body: `Track WPRA ${event.name.toLowerCase()} results and move into rodeo detail pages for leaders, times, payouts, and related event information.`
        },
        {
          title: "WPRA Results and Standings",
          body: "Connect WPRA results with standings pages for barrel racing and breakaway roping, plus athlete profile links where available."
        },
        {
          title: "Pro Rodeo Results",
          body: "Move from WPRA results into PRCA results, pro rodeo results, schedules, listings, and NFR reference pages."
        }
      ]}
      relatedLinks={[
        { href: "/wpra-results", label: "WPRA Results" },
        { href: "/pro-rodeo-results", label: "Pro Rodeo Results" },
        { href: `/wpra-standings/2026/${event.slug}`, label: `2026 WPRA ${event.name} Standings` }
      ]}
    />
  );
}

function wpraEventForSlug(slug: string) {
  const event = resultEventForSlug(slug);
  return wpraResultEvents.find((wpraEvent) => wpraEvent.slug === event?.slug);
}
