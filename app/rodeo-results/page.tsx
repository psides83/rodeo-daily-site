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
      trustIntro="Rodeo Daily is a rodeo reference app: it collects standings, results, schedules, athlete pages, and rodeo detail links into one place for fans following the season."
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
        },
        {
          title: "Rodeo Detail Context",
          body: "Detail pages help readers connect a rodeo name with location, venue, dates, event leaders, round data, and payout information when the source provides it."
        },
        {
          title: "Fan-Facing Reference",
          body: "The site is designed for quick repeat use during the rodeo season, especially when fans are moving between current results and updated standings."
        },
        {
          title: "Data Notes",
          body: "Official associations and rodeo offices remain the authority for entries, payout disputes, rule decisions, and final records. Rodeo Daily organizes available data for easier browsing."
        }
      ]}
    />
  );
}
