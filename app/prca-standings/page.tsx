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
        }
      ]}
      relatedLinks={seoStandingEvents.map((event) => ({
        href: `/prca-standings/2026/${event.slug}`,
        label: `2026 PRCA ${event.name} Standings`
      }))}
    />
  );
}
