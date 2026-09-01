import type { Metadata } from "next";
import { SeoLandingPage } from "../components/seo-landing-page";
import { pageMetadata, seoStandingEvents, wpraStandingEvents } from "../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Pro Rodeo Standings, PRCA Standings & WPRA Standings",
  description:
    "Track pro rodeo standings, PRCA standings, WPRA standings, PRCA results, WPRA results, world standings, circuit standings, athlete rankings, season earnings, and rodeo results in Rodeo Daily.",
  path: "/pro-rodeo-standings"
});

export default function ProRodeoStandingsPage() {
  return (
    <SeoLandingPage
      eyebrow="Pro Rodeo Standings"
      title="Pro Rodeo Standings, PRCA Standings, and WPRA Standings"
      description="Rodeo Daily helps fans follow pro rodeo standings with PRCA standings, WPRA standings, event rankings, season earnings, athlete profiles, schedules, and results."
      primaryHref="/?tab=standings"
      primaryLabel="Open Standings"
      sections={[
        {
          title: "PRCA Standings",
          body: "Follow PRCA world standings, circuit standings, rookie standings, event rankings, athlete earnings, and profile links."
        },
        {
          title: "WPRA Standings",
          body: "Track WPRA barrel racing standings and breakaway roping standings alongside broader pro rodeo standings."
        },
        {
          title: "Standings to Results",
          body: "Move from pro rodeo standings into PRCA results, WPRA results, schedules, NFR standings, and athlete detail pages."
        }
      ]}
      relatedLinks={[
        { href: "/prca-standings", label: "PRCA Standings" },
        { href: "/wpra-standings", label: "WPRA Standings" },
        { href: "/pro-rodeo-results", label: "Pro Rodeo Results" },
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
