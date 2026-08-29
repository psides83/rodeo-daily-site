import type { Metadata } from "next";
import { SeoLandingPage } from "../components/seo-landing-page";
import { pageMetadata, seoResultEvents, wpraResultEvents } from "../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Results",
  description:
    "Open Rodeo Daily results for PRCA results, WPRA results, pro rodeo results, round results, payouts, leaders, schedules, and rodeo detail pages.",
  path: "/results"
});

const prcaResultLinks = seoResultEvents.map((event) => ({
  href: `/prca-results/${event.slug}`,
  label: `PRCA ${event.name} Results`
}));

const wpraResultLinks = wpraResultEvents.map((event) => ({
  href: `/wpra-results/${event.slug}`,
  label: `WPRA ${event.name} Results`
}));

export default function ResultsPage() {
  return (
    <SeoLandingPage
      eyebrow="Rodeo Results"
      title="PRCA Results, WPRA Results, and Pro Rodeo Results"
      description="Use Rodeo Daily to follow rodeo results by event, open rodeo detail pages, check leaders, review payouts, and move between PRCA results, WPRA results, and broader pro rodeo results."
      primaryHref="/?tab=results"
      primaryLabel="Open Results"
      sections={[
        {
          title: "PRCA Results",
          body: "Browse PRCA results by event with links into rodeo detail pages, leaders, round results, payouts, schedules, and daysheets when available."
        },
        {
          title: "WPRA Results",
          body: "Track WPRA results for barrel racing and breakaway roping alongside the full Rodeo Daily results experience."
        },
        {
          title: "Pro Rodeo Results",
          body: "Follow pro rodeo results across events, dates, rodeos, athlete profiles, standings, and listing pages from one app."
        }
      ]}
      relatedLinks={[{ href: "/pro-rodeo-results", label: "Pro Rodeo Results" }, ...prcaResultLinks, ...wpraResultLinks]}
    />
  );
}
