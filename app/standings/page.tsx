import type { Metadata } from "next";
import { SeoLandingPage } from "../components/seo-landing-page";
import { pageMetadata, seoStandingEvents, wpraStandingEvents } from "../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Standings",
  description:
    "Open Rodeo Daily standings for PRCA standings, WPRA standings, pro rodeo standings, world standings, circuit standings, athlete rankings, and earnings.",
  path: "/standings"
});

export default function StandingsPage() {
  return (
    <SeoLandingPage
      eyebrow="Rodeo Standings"
      title="PRCA Standings, WPRA Standings, and Pro Rodeo Standings"
      description="Use Rodeo Daily to follow current PRCA standings, WPRA standings, pro rodeo standings, athlete rankings, season earnings, and event-specific standings pages."
      primaryHref="/?tab=standings"
      primaryLabel="Open Standings"
      sections={[
        {
          title: "PRCA Standings",
          body: "Follow PRCA standings by event, season, standings type, athlete ranking, hometown, and earnings."
        },
        {
          title: "WPRA Standings",
          body: "Track WPRA barrel racing standings and WPRA breakaway roping standings with current leaders and athlete profile links."
        },
        {
          title: "Pro Rodeo Standings",
          body: "Move between standings, results, schedules, NFR reference pages, athlete profiles, and rodeo listings in one rodeo app."
        }
      ]}
      relatedLinks={[
        { href: "/prca-standings", label: "PRCA Standings" },
        { href: "/wpra-standings", label: "WPRA Standings" },
        { href: "/pro-rodeo-standings", label: "Pro Rodeo Standings" },
        ...seoStandingEvents.map((event) => ({
          href: `/prca-standings/2026/${event.slug}`,
          label: `2026 PRCA ${event.name} Standings`
        })),
        ...wpraStandingEvents.map((event) => ({
          href: `/wpra-standings/2026/${event.slug}`,
          label: `2026 WPRA ${event.name} Standings`
        }))
      ]}
    />
  );
}
