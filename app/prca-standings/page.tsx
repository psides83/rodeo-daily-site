import type { Metadata } from "next";
import { SeoLandingPage } from "../components/seo-landing-page";
import { absoluteUrl } from "../lib/seo";

export const metadata: Metadata = {
  title: "PRCA Standings",
  description:
    "Follow PRCA standings, rodeo standings, world standings, circuit standings, rookie standings, and athlete profiles by event in Rodeo Daily.",
  alternates: {
    canonical: absoluteUrl("/prca-standings")
  }
};

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
    />
  );
}
