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
      trustIntro="Rodeo Daily treats WPRA results as part of the main rodeo workflow, connecting barrel racing and breakaway results to standings, schedules, rodeo pages, and athlete context."
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
        },
        {
          title: "Standings Context",
          body: "WPRA result pages link naturally into barrel racing and breakaway standings so fans can understand how rodeo results fit into the season."
        },
        {
          title: "Data Source Notes",
          body: "WPRA data can update as official results and standings are corrected or finalized. Rodeo Daily organizes available information for browsing and points operational questions to official sources."
        },
        {
          title: "Rodeo Daily Support",
          body: "Readers can contact Rodeo Daily support with broken links, missing context, or correction notes that include the rodeo, event, athlete, and source page."
        }
      ]}
      relatedLinks={wpraResultEvents.map((event) => ({
        href: `/wpra-results/${event.slug}`,
        label: `WPRA ${event.name} Results`
      }))}
    />
  );
}
