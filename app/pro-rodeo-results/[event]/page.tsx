import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoLandingPage } from "../../components/seo-landing-page";
import { pageMetadata, resultEventForSlug } from "../../lib/seo";

type ProRodeoEventResultsPageProps = {
  params: {
    event: string;
  };
};

export function generateMetadata({ params }: ProRodeoEventResultsPageProps): Metadata {
  const event = resultEventForSlug(params.event);
  if (!event) return {};

  return pageMetadata({
    title: `Pro Rodeo ${event.name} Results`,
    description: `Check pro rodeo ${event.name.toLowerCase()} results, PRCA results, WPRA results, leaders, round results, payouts, schedules, and standings in Rodeo Daily.`,
    path: `/pro-rodeo-results/${event.slug}`
  });
}

export default function ProRodeoEventResultsPage({ params }: ProRodeoEventResultsPageProps) {
  const event = resultEventForSlug(params.event);
  if (!event) notFound();

  return (
    <SeoLandingPage
      eyebrow="Pro Rodeo Results"
      title={`Pro Rodeo ${event.name} Results`}
      description={`Use Rodeo Daily to check pro rodeo ${event.name.toLowerCase()} results with PRCA results, WPRA results, leaders, round results, payouts, schedules, standings, and athlete profiles.`}
      primaryHref="/?tab=results"
      primaryLabel="Open Results"
      sections={[
        {
          title: `${event.name} Results`,
          body: `Follow pro rodeo ${event.name.toLowerCase()} results by rodeo, date, leader, payout, and related athlete information.`
        },
        {
          title: "PRCA and WPRA Coverage",
          body: "Use one route into PRCA results, WPRA results, standings, schedules, rodeo listings, and detail pages."
        },
        {
          title: "Rodeo Detail Pages",
          body: "Open individual rodeos for event leaders, round results, average results, dates, venues, daysheets, and payout information."
        }
      ]}
      relatedLinks={[
        { href: "/pro-rodeo-results", label: "Pro Rodeo Results" },
        { href: `/prca-results/${event.slug}`, label: `PRCA ${event.name} Results` },
        { href: `/prca-standings/2026/${event.slug}`, label: `2026 PRCA ${event.name} Standings` }
      ]}
    />
  );
}
