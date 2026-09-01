import type { Metadata } from "next";
import { SeoLandingPage } from "../components/seo-landing-page";
import { pageMetadata, wpraResultEvents } from "../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "WPRA Results & Pro Rodeo Results",
  description:
    "Follow WPRA results, pro rodeo results, PRCA results, WPRA standings, PRCA standings, barrel racing results, breakaway roping results, payouts, leaders, and rodeo detail pages in Rodeo Daily.",
  path: "/wpra-results"
});

export default function WpraResultsPage() {
  return (
    <SeoLandingPage
      eyebrow="WPRA Results"
      title="WPRA Results and Pro Rodeo Results"
      description="Rodeo Daily helps fans follow WPRA results for barrel racing and breakaway roping alongside PRCA and pro rodeo results, rodeo detail pages, leaders, payouts, and schedules."
      primaryHref="/?tab=results"
      primaryLabel="Open Results"
      sections={[
        {
          title: "Barrel Racing and Breakaway",
          body: "Track WPRA-focused rodeo results for barrel racing and breakaway roping from the same fast results view used across Rodeo Daily."
        },
        {
          title: "Pro Rodeo Results",
          body: "Use Rodeo Daily to move from WPRA results into broader pro rodeo results, event leaders, schedules, daysheets, and rodeo detail pages."
        },
        {
          title: "Results Built for Search",
          body: "Rodeo result pages are organized around events, rodeos, athletes, dates, round results, and payouts when the source feed provides them."
        }
      ]}
      relatedLinks={wpraResultEvents.map((event) => ({
        href: `/wpra-results/${event.slug}`,
        label: `WPRA ${event.name} Results`
      }))}
    />
  );
}
