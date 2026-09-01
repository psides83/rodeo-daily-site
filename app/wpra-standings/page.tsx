import type { Metadata } from "next";
import { SeoLandingPage } from "../components/seo-landing-page";
import { pageMetadata, wpraStandingEvents } from "../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "WPRA Standings & Pro Rodeo Standings",
  description:
    "Track WPRA standings, pro rodeo standings, PRCA standings, WPRA results, PRCA results, barrel racing standings, breakaway roping standings, athlete rankings, and earnings in Rodeo Daily.",
  path: "/wpra-standings"
});

export default function WpraStandingsPage() {
  return (
    <SeoLandingPage
      eyebrow="WPRA Standings"
      title="WPRA Standings for Barrel Racing and Breakaway"
      description="Rodeo Daily tracks WPRA standings for barrel racing and breakaway roping with season rankings, athlete earnings, profiles, and related pro rodeo standings."
      primaryHref="/?tab=standings"
      primaryLabel="Open Standings"
      sections={[
        {
          title: "Current WPRA Standings",
          body: "Follow WPRA standings by event with ranked athletes, season earnings, hometowns, and profile links where available."
        },
        {
          title: "Barrel Racing Standings",
          body: "Check barrel racing standings alongside the PRCA and pro rodeo standings views already available in Rodeo Daily."
        },
        {
          title: "Breakaway Roping Standings",
          body: "Track breakaway roping standings, current rankings, athlete earnings, and related rodeo results from one web app."
        }
      ]}
      relatedLinks={wpraStandingEvents.map((event) => ({
        href: `/wpra-standings/2026/${event.slug}`,
        label: `2026 WPRA ${event.name} Standings`
      }))}
    />
  );
}
