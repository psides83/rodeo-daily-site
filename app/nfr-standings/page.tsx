import type { Metadata } from "next";
import { SeoLandingPage } from "../components/seo-landing-page";
import { pageMetadata } from "../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "NFR Standings",
  description:
    "Follow NFR standings, PRCA standings, WPRA standings, rodeo rankings, season earnings, athletes, past champions, and pro rodeo results in Rodeo Daily.",
  path: "/nfr-standings"
});

export default function NfrStandingsPage() {
  return (
    <SeoLandingPage
      eyebrow="NFR Standings"
      title="NFR Standings and Rodeo Season Rankings"
      description="Rodeo Daily connects NFR standings with PRCA standings, WPRA standings, current rodeo rankings, athlete profiles, past champions, schedules, and pro rodeo results."
      primaryHref="/?tab=more&section=nfr"
      primaryLabel="Open NFR Standings"
      sections={[
        {
          title: "NFR Standings",
          body: "Check NFR standings and season rankings by event from the same Rodeo Daily app experience used for rodeo results and standings."
        },
        {
          title: "PRCA and WPRA Context",
          body: "Move from NFR standings into PRCA standings, WPRA standings, athlete profiles, schedules, and results pages."
        },
        {
          title: "Rodeo Reference",
          body: "Use Rodeo Daily for NFR information, past world champions, rodeo listings, schedules, and season-long rodeo tracking."
        }
      ]}
      relatedLinks={[
        { href: "/prca-standings", label: "PRCA Standings" },
        { href: "/wpra-standings", label: "WPRA Standings" },
        { href: "/pro-rodeo-results", label: "Pro Rodeo Results" }
      ]}
    />
  );
}
