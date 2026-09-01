import type { Metadata } from "next";
import { SeoLandingPage } from "../components/seo-landing-page";
import { pageMetadata } from "../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Rodeo Results, PRCA Results & WPRA Results",
  description:
    "Find rodeo results, PRCA results, WPRA results, pro rodeo results, PRCA standings, WPRA standings, round results, payouts, leaders, and event-specific results in Rodeo Daily.",
  path: "/rodeo-results"
});

export default function RodeoResultsPage() {
  return (
    <SeoLandingPage
      eyebrow="Rodeo Results"
      title="Rodeo Results, PRCA Results, and WPRA Results by Event"
      description="Use Rodeo Daily to check rodeo results, PRCA results, WPRA results, pro rodeo results, PRCA standings, WPRA standings, individual rodeo pages, event leaders, and payouts."
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
