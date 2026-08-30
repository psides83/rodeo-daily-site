import type { Metadata } from "next";
import { SeoLandingPage } from "../components/seo-landing-page";
import { pageMetadata, seoResultEvents } from "../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Pro Rodeo Results",
  description:
    "Check pro rodeo results, PRCA results, WPRA results, rodeo leaders, round results, payouts, schedules, daysheets, and athlete links in Rodeo Daily.",
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
        }
      ]}
      relatedLinks={seoResultEvents.map((event) => ({
        href: `/pro-rodeo-results/${event.slug}`,
        label: `Pro Rodeo ${event.name} Results`
      }))}
    />
  );
}
