import type { Metadata } from "next";
import { SeoLandingPage } from "../components/seo-landing-page";
import { pageMetadata, prcaResultEvents } from "../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "PRCA Results & Pro Rodeo Results",
  description:
    "View PRCA results, pro rodeo results, WPRA results, PRCA standings, rodeo standings, rodeo leaders, round results, payouts, schedules, and daysheets in Rodeo Daily.",
  path: "/prca-results"
});

export default function PrcaResultsPage() {
  return (
    <SeoLandingPage
      eyebrow="PRCA Results"
      title="PRCA Results and Rodeo Results"
      description="Rodeo Daily gives rodeo fans a fast way to follow PRCA results by event, open rodeo detail pages, review leaders, see round results, and check payouts when they are available."
      primaryHref="/?tab=results"
      primaryLabel="Open Results"
      trustIntro="The results experience is the center of Rodeo Daily: event pages, rodeo pages, standings links, athlete profiles, and schedule context are organized for fans who follow PRCA results throughout the season."
      sections={[
        {
          title: "Results by Event",
          body: "Browse rodeo results for bareback riding, steer wrestling, team roping, saddle bronc riding, tie-down roping, barrel racing, bull riding, and breakaway roping."
        },
        {
          title: "Rodeo Detail Pages",
          body: "Open individual rodeos to view leaders, round-by-round results, payouts, venue information, and daysheets when the rodeo provides them."
        },
        {
          title: "Built for Rodeo Fans",
          body: "Rodeo Daily is designed as a fast web version of the Rodeo Daily app for checking PRCA results, rodeo standings, schedules, athletes, and more."
        },
        {
          title: "What Each Page Connects",
          body: "Result pages connect a rodeo's event leaders with schedule details, athlete pages, standings pages, daysheets, and other ways to follow the same rodeo."
        },
        {
          title: "Update Timing",
          body: "Results can change when official data sources post corrections, finals, or payout updates. Rodeo Daily refreshes data views and gives readers a support path for questions."
        },
        {
          title: "Independent Reference",
          body: "Rodeo Daily is built as an independent fan-facing reference and is not a rodeo entry, payout dispute, or official association support system."
        }
      ]}
      relatedLinks={prcaResultEvents.map((event) => ({
        href: `/prca-results/${event.slug}`,
        label: `PRCA ${event.name} Results`
      }))}
    />
  );
}
