import type { Metadata } from "next";
import { SeoLandingPage } from "../components/seo-landing-page";
import { pageMetadata } from "../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "PRCA Schedule, Rodeo Results & Standings",
  description:
    "Find the PRCA schedule, pro rodeo schedule, upcoming rodeos, PRCA results, WPRA results, PRCA standings, WPRA standings, dates, venues, daysheets, payouts, and rodeo detail pages.",
  path: "/schedule"
});

export default function SchedulePage() {
  return (
    <SeoLandingPage
      eyebrow="Rodeo Schedule"
      title="Pro Rodeo Schedule and Upcoming Rodeos"
      description="Rodeo Daily helps fans find upcoming rodeos, PRCA schedule details, venues, dates, daysheets, payouts, results links, and rodeo detail pages."
      primaryHref="/?tab=schedule"
      primaryLabel="Open Schedule"
      trustIntro="The schedule is part of the main Rodeo Daily rodeo workflow, connecting upcoming rodeos to detail pages, daysheets, results, standings, athlete information, and listing context."
      sections={[
        {
          title: "Upcoming Rodeos",
          body: "Browse upcoming rodeos by date and open detail pages for venue information, payouts, daysheets, websites, and results links."
        },
        {
          title: "PRCA Schedule Details",
          body: "Use Rodeo Daily as a fast way to move through PRCA schedule information and event details from the same web app."
        },
        {
          title: "Schedule to Results",
          body: "Move from schedule pages into pro rodeo results, PRCA results, WPRA results, standings, and athlete profile pages."
        },
        {
          title: "Rodeo Detail Pages",
          body: "Individual schedule pages can include dates, venues, locations, payout information, official website links, daysheets, and result paths when they become available."
        },
        {
          title: "Updated Season View",
          body: "Rodeo schedules may change as event offices update dates, pages, entries, or daysheets. Rodeo Daily keeps schedule browsing tied to the same app used for current results."
        },
        {
          title: "Official Decisions",
          body: "Use Rodeo Daily for browsing and planning context. For entries, fees, stock draws, payout disputes, or time-sensitive event operations, contact the official rodeo office."
        }
      ]}
      relatedLinks={[
        { href: "/results", label: "Rodeo Results" },
        { href: "/pro-rodeo-results", label: "Pro Rodeo Results" },
        { href: "/standings", label: "Rodeo Standings" },
        { href: "/rodeo-listings", label: "Rodeo Listings" }
      ]}
    />
  );
}
