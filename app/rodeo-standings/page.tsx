import type { Metadata } from "next";
import { SeoLandingPage } from "../components/seo-landing-page";
import { pageMetadata } from "../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Rodeo Standings",
  description:
    "Track rodeo standings, PRCA standings, world standings, circuit standings, rookie standings, athlete rankings, and earnings in Rodeo Daily.",
  path: "/rodeo-standings"
});

export default function RodeoStandingsPage() {
  return (
    <SeoLandingPage
      eyebrow="Rodeo Standings"
      title="Rodeo Standings, Rankings, and Athlete Profiles"
      description="Rodeo Daily makes it easy to check PRCA and WPRA rodeo standings by event, season, and standings type, then open athlete profiles for stats, results, career history, highlights, and bios."
      primaryHref="/?tab=standings"
      primaryLabel="View Rodeo Standings"
      sections={[
        {
          title: "Current Standings",
          body: "Follow current rodeo standings and athlete earnings in a mobile-friendly web app built around the Rodeo Daily iOS experience."
        },
        {
          title: "Multiple Standings Types",
          body: "Browse world standings, circuit standings, and rookie standings for the events available in the Rodeo Daily standings feed."
        },
        {
          title: "From Standings to Athletes",
          body: "Tap an athlete from the standings to open a profile with stats, results, career data, highlights, and biography information."
        }
      ]}
    />
  );
}
