import type { Metadata } from "next";
import { SeoLandingPage } from "../components/seo-landing-page";
import { absoluteUrl } from "../lib/seo";

export const metadata: Metadata = {
  title: "Rodeo Results",
  description:
    "Find rodeo results, PRCA results, round results, payouts, leaders, and event-specific results for professional rodeos in Rodeo Daily.",
  alternates: {
    canonical: absoluteUrl("/rodeo-results")
  }
};

export default function RodeoResultsPage() {
  return (
    <SeoLandingPage
      eyebrow="Rodeo Results"
      title="Rodeo Results by Event"
      description="Use Rodeo Daily to check rodeo results by event, open individual rodeo pages, review leaders, and follow results as they become available."
      primaryHref="/?tab=results"
      primaryLabel="View Rodeo Results"
      sections={[
        {
          title: "Event Results",
          body: "Filter rodeo results by event and quickly move between roping, roughstock, barrel racing, and breakaway results."
        },
        {
          title: "Round Results and Payouts",
          body: "Rodeo detail pages can show round sections, athlete placements, times or scores, and payoff values when the feed provides them."
        },
        {
          title: "Results, Schedule, and Standings Together",
          body: "Rodeo Daily connects results with schedules, standings, athlete pages, daysheets, NFR standings, and rodeo listings."
        }
      ]}
    />
  );
}
