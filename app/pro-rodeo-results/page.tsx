import type { Metadata } from "next";
import { SeoLandingPage } from "../components/seo-landing-page";
import { pageMetadata, seoResultEvents } from "../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Pro Rodeo Results, PRCA Results & WPRA Results",
  description:
    "Check pro rodeo results, PRCA results, WPRA results, PRCA standings, WPRA standings, rodeo leaders, round results, payouts, schedules, daysheets, and athlete links in Rodeo Daily.",
  path: "/pro-rodeo-results"
});

export default function ProRodeoResultsPage() {
  return (
    <SeoLandingPage
      eyebrow="Pro Rodeo Results"
      title="Pro Rodeo Results, PRCA Results, and WPRA Results"
      description="Rodeo Daily organizes pro rodeo results for fans who want PRCA results, WPRA results, event leaders, round results, payouts, schedules, daysheets, and athlete detail pages in one fast view."
      primaryHref="/?tab=results"
      primaryLabel="Open Results"
      trustIntro="The pro rodeo results pages make the site's core utility visible: structured result browsing, event filters, rodeo details, schedule links, standings context, and athlete pages."
      sections={[
        {
          title: "PRCA Results",
          body: "Follow PRCA results by event and open individual rodeo pages for leaders, round results, payouts, venue details, and daysheets."
        },
        {
          title: "WPRA Results",
          body: "Track WPRA results for barrel racing and breakaway roping alongside broader professional rodeo results."
        },
        {
          title: "Results and Schedules Together",
          body: "Move from pro rodeo results into schedules, standings, athlete profiles, rodeo listings, and NFR reference sections without leaving Rodeo Daily."
        },
        {
          title: "Event-Level Organization",
          body: "Rodeo Daily separates result paths by event so fans can follow a specific discipline and still move back to the full rodeo or standings view."
        },
        {
          title: "Maintained App Pages",
          body: "The site combines public landing pages with the same app workflows fans use for checking current results, favorites, schedules, and standings."
        },
        {
          title: "Official Data Caveat",
          body: "Rodeo Daily organizes available rodeo data for fans. Official rodeo associations and rodeo offices remain the final source for entries, rulings, and official payout decisions."
        }
      ]}
      relatedLinks={seoResultEvents.map((event) => ({
        href: `/pro-rodeo-results/${event.slug}`,
        label: `Pro Rodeo ${event.name} Results`
      }))}
    />
  );
}
