import type { Metadata } from "next";
import { SeoLandingPage } from "../components/seo-landing-page";
import { pageMetadata, seoStandingEvents, wpraStandingEvents } from "../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "PRCA Standings, WPRA Standings & Pro Rodeo Standings",
  description:
    "Open Rodeo Daily for PRCA standings, WPRA standings, pro rodeo standings, PRCA results, WPRA results, world standings, circuit standings, athlete rankings, and earnings.",
  path: "/standings"
});

export default function StandingsPage() {
  return (
    <SeoLandingPage
      eyebrow="Rodeo Standings"
      title="PRCA Standings, WPRA Standings, and Pro Rodeo Standings"
      description="Use Rodeo Daily to follow PRCA standings, WPRA standings, pro rodeo standings, PRCA results, WPRA results, athlete rankings, season earnings, and event-specific standings pages."
      primaryHref="/?tab=standings"
      primaryLabel="Open Standings"
      trustIntro="Standings are one of the core Rodeo Daily features, with event pages, athlete profile links, earnings, hometowns, standings types, results context, and schedule navigation built for season-long use."
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
        },
        {
          title: "Event Pages",
          body: "Each event standings page can show ranked athletes, earnings, hometowns, profile links, related result pages, and a direct path back into the full app view."
        },
        {
          title: "Why Fans Use It",
          body: "Rodeo fans often compare standings and results during the same visit. Rodeo Daily keeps those workflows close together instead of scattering them across separate pages."
        },
        {
          title: "Data Updates",
          body: "Standings may shift as official sources publish new results, corrections, or season totals. Rodeo Daily provides a support path for data questions and corrections."
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
