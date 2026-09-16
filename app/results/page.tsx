import type { Metadata } from "next";
import { SeoLandingPage } from "../components/seo-landing-page";
import { pageMetadata, prcaResultEvents, wpraResultEvents } from "../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "PRCA Results, WPRA Results & Pro Rodeo Results",
  description:
    "Open Rodeo Daily for PRCA results, WPRA results, pro rodeo results, rodeo standings, PRCA standings, WPRA standings, round results, payouts, leaders, schedules, and rodeo detail pages.",
  path: "/results"
});

const prcaResultLinks = prcaResultEvents.map((event) => ({
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
      description="Use Rodeo Daily to follow PRCA results, WPRA results, pro rodeo results, rodeo standings, PRCA standings, WPRA standings, event leaders, payouts, and rodeo detail pages."
      primaryHref="/?tab=results"
      primaryLabel="Open Results"
      trustIntro="Rodeo Daily organizes official rodeo result feeds and related data into a fan-friendly reference with event filters, detail pages, athlete links, and source-aware context."
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
        },
        {
          title: "How Results Are Organized",
          body: "Rodeo Daily groups results by rodeo and event, then connects each page to related standings, athlete profiles, daysheets, schedules, and payout details when available."
        },
        {
          title: "Corrections and Timing",
          body: "Rodeo results may update as official feeds publish corrections or final payout information. Rodeo Daily provides support and correction contact paths for data questions."
        },
        {
          title: "Useful for Repeat Checking",
          body: "The results pages are built for fans who check back throughout a rodeo week and want a fast path from leaders to standings and upcoming schedule pages."
        }
      ]}
      relatedLinks={[...prcaResultLinks, ...wpraResultLinks]}
    />
  );
}
