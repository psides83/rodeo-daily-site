import type { Metadata } from "next";
import { SeoLandingPage } from "../components/seo-landing-page";
import { absoluteUrl } from "../lib/seo";

export const metadata: Metadata = {
  title: "PRCA Results",
  description:
    "View PRCA results and rodeo results by event, including rodeo leaders, round results, payouts, schedules, and daysheets in Rodeo Daily.",
  alternates: {
    canonical: absoluteUrl("/prca-results")
  }
};

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
    />
  );
}
