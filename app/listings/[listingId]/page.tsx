import type { Metadata } from "next";
import BusinessJournalListingClient from "./listing-client";
import { mapBusinessJournalRows } from "../../lib/rodeo-data";
import type { ApiBusinessJournalResponse, BusinessJournalRow } from "../../lib/types";
import { absoluteUrl } from "../../lib/seo";

type BusinessJournalListingPageProps = {
  params: {
    listingId: string;
  };
};

const businessJournalFeedUrl = "https://psides83.github.io/pbj-scraper/pbj-detailed.json";

export const revalidate = 1800;

export async function generateMetadata({ params }: BusinessJournalListingPageProps): Promise<Metadata> {
  const listingId = safeDecode(params.listingId);
  const listing = await fetchListing(listingId);
  const path = `/listings/${encodeURIComponent(listingId)}`;

  if (!listing) {
    return {
      title: "Rodeo Listing",
      description: "View rodeo listing details, entry windows, performances, events, and added money on Rodeo Daily.",
      alternates: {
        canonical: absoluteUrl(path)
      }
    };
  }

  const title = `${listing.title} Rodeo Listing`;
  const description = listingDescription(listing);

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(path)
    },
    openGraph: {
      type: "article",
      url: absoluteUrl(path),
      title: `${title} | Rodeo Daily`,
      description,
      siteName: "Rodeo Daily"
    },
    twitter: {
      card: "summary",
      title: `${title} | Rodeo Daily`,
      description
    }
  };
}

export default async function BusinessJournalListingRoutePage({ params }: BusinessJournalListingPageProps) {
  const listingId = safeDecode(params.listingId);
  const listing = await fetchListing(listingId);
  const jsonLd = listing ? listingJsonLd(listing) : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c")
          }}
        />
      )}
      <BusinessJournalListingClient />
    </>
  );
}

async function fetchListing(listingId: string) {
  try {
    const response = await fetch(businessJournalFeedUrl, { next: { revalidate } });
    if (!response.ok) return null;
    const payload = (await response.json()) as ApiBusinessJournalResponse;
    return mapBusinessJournalRows(payload).find((listing) => listing.id === listingId) ?? null;
  } catch {
    return null;
  }
}

function listingDescription(listing: BusinessJournalRow) {
  const details = [
    listing.subtitle,
    listing.dateText,
    listing.eventsText,
    listing.entryWindowText ? `Entries: ${listing.entryWindowText}` : "",
    listing.addedMoneyText
  ].filter(Boolean);

  return `View ${listing.title} rodeo listing details on Rodeo Daily${details.length ? `, including ${details.join(", ")}` : ""}.`;
}

function listingJsonLd(listing: BusinessJournalRow) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: listing.subtitle || listing.title,
    url: absoluteUrl(`/listings/${encodeURIComponent(listing.id)}`),
    startDate: listing.eventStartDate || undefined,
    endDate: listing.eventEndDate || undefined,
    sport: "Rodeo",
    location: listing.locationText
      ? {
          "@type": "Place",
          name: listing.title,
          address: listing.locationText
        }
      : undefined,
    description: listingDescription(listing),
    organizer: {
      "@type": "Organization",
      name: "Rodeo Daily",
      url: absoluteUrl("/")
    }
  };
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
