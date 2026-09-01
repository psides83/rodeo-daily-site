import type { Metadata } from "next";
import { SeoLandingPage } from "../components/seo-landing-page";
import { pageMetadata, seoResultEvents } from "../lib/seo";

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
        }
      ]}
      relatedLinks={seoResultEvents.map((event) => ({
        href: `/prca-results/${event.slug}`,
        label: `PRCA ${event.name} Results`
      }))}
    />
  );
}
