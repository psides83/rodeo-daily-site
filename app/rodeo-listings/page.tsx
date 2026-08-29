import type { Metadata } from "next";
import { SeoLandingPage } from "../components/seo-landing-page";
import { pageMetadata } from "../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Rodeo Listings",
  description:
    "Browse rodeo listings, PRCA Business Journal listings, entry windows, performances, added money, event details, schedules, and pro rodeo results in Rodeo Daily.",
  path: "/rodeo-listings"
});

export default function RodeoListingsPage() {
  return (
    <SeoLandingPage
      eyebrow="Rodeo Listings"
      title="Rodeo Listings and PRCA Business Journal Details"
      description="Rodeo Daily organizes rodeo listings with entry windows, performances, events, added money, locations, schedules, and links into pro rodeo results and standings."
      primaryHref="/?tab=more&section=listings"
      primaryLabel="Open Listings"
      sections={[
        {
          title: "Rodeo Listing Details",
          body: "Browse listing detail pages for rodeo names, locations, entry open and close times, performances, slack, events, and added money."
        },
        {
          title: "PRCA Business Journal Listings",
          body: "Rodeo Daily gives fans and contestants a fast route into PRCA Business Journal-style listing information."
        },
        {
          title: "Listings to Results",
          body: "Move from rodeo listings into schedules, standings, PRCA results, WPRA results, and pro rodeo result pages."
        }
      ]}
      relatedLinks={[
        { href: "/schedule", label: "Rodeo Schedule" },
        { href: "/pro-rodeo-results", label: "Pro Rodeo Results" },
        { href: "/prca-results", label: "PRCA Results" },
        { href: "/standings", label: "Rodeo Standings" }
      ]}
    />
  );
}
