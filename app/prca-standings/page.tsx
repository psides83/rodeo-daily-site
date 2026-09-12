import type { Metadata } from "next";
import { SeoLandingPage } from "../components/seo-landing-page";
import { pageMetadata, seoStandingEvents } from "../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "PRCA Standings & Pro Rodeo Standings",
  description:
    "Follow PRCA standings, pro rodeo standings, WPRA standings, PRCA results, WPRA results, rodeo standings, world standings, circuit standings, rookie standings, and athlete profiles by event in Rodeo Daily.",
  path: "/prca-standings"
});

export default function PrcaStandingsPage() {
  return (
    <SeoLandingPage
      eyebrow="PRCA Standings"
      title="PRCA Standings and Rodeo Standings"
      description="Rodeo Daily helps fans follow PRCA standings by season, standings type, and event with athlete cards, earnings, rankings, profile pages, stats, results, career data, and highlights."
      primaryHref="/?tab=standings"
      primaryLabel="Open Standings"
      trustIntro="Rodeo Daily turns PRCA standings into a usable season reference, linking rankings to athlete pages, results pages, schedule context, NFR races, and event-specific views."
      sections={[
        {
          title: "World, Circuit, and Rookie Standings",
          body: "Switch between world standings, circuit standings, and rookie standings to track rodeo athletes across the season."
        },
        {
          title: "Standings by Event",
          body: "View standings for bareback riding, steer wrestling, team roping, saddle bronc riding, tie-down roping, barrel racing, bull riding, and breakaway roping."
        },
        {
          title: "Athlete Profiles",
          body: "Open athlete pages from the standings to view stats, results, career information, highlights, and biography details where available."
        },
        {
          title: "Season Context",
          body: "Standings pages are built for checking who is leading, who is moving, and how current results connect with the broader PRCA season."
        },
        {
          title: "Clear Data Use",
          body: "Rodeo Daily organizes PRCA standings and related data for fan browsing. Official associations remain the final authority for official records and eligibility decisions."
        },
        {
          title: "Support and Corrections",
          body: "Readers can report confusing rankings, broken athlete links, or missing context through Rodeo Daily support with the event, year, athlete, and source details."
        }
      ]}
      relatedLinks={seoStandingEvents.map((event) => ({
        href: `/prca-standings/2026/${event.slug}`,
        label: `2026 PRCA ${event.name} Standings`
      }))}
    />
  );
}
