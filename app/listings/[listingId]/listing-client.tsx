"use client";

import { Newspaper } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BusinessJournalListingDetailView } from "../../components/rodeo-views";
import { ThemeSync } from "../../components/theme-sync";
import { fetchJson, mapBusinessJournalRows } from "../../lib/rodeo-data";
import type { ApiBusinessJournalResponse, BusinessJournalRow, LoadState } from "../../lib/types";

function paramValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function fallbackListing(id: string, searchParams: ReturnType<typeof useSearchParams>): BusinessJournalRow {
  return {
    id,
    title: searchParams.get("title") || "Rodeo Listing",
    subtitle: "",
    dateText: searchParams.get("date") || "",
    eventStartDate: null,
    eventEndDate: null,
    locationText: searchParams.get("location") || "",
    eventsText: "",
    perfsText: "",
    specialEntryFeesText: "",
    addedMoneyText: "",
    addedMoneyTotal: null,
    entryWindowText: "",
    source: searchParams.get("source") || "Listing",
    link: "https://pbj.prorodeo.org/",
    detailFields: []
  };
}

export default function BusinessJournalListingRoutePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const listingId = safeDecode(paramValue(params.listingId) ?? "");
  const [listing, setListing] = useState<BusinessJournalRow>(() => fallbackListing(listingId, searchParams));
  const [state, setState] = useState<LoadState>("idle");

  useEffect(() => {
    let cancelled = false;

    async function loadListing() {
      if (!listingId) {
        setState("error");
        return;
      }

      setState("loading");
      try {
        const query = new URLSearchParams({ resource: "business-journal" });
        const payload = await fetchJson<ApiBusinessJournalResponse>(`/api/rodeo?${query}`);
        const rows = mapBusinessJournalRows(payload);
        const match = rows.find((row) => row.id === listingId);
        if (!cancelled) {
          if (match) {
            setListing(match);
            setState("loaded");
          } else {
            setState("error");
          }
        }
      } catch {
        if (!cancelled) setState("error");
      }
    }

    loadListing();
    return () => {
      cancelled = true;
    };
  }, [listingId]);

  return (
    <main className="browser-stage routed-stage">
      <ThemeSync />
      <section className="routed-window">
        {state === "loading" ? (
          <div className="business-listing-detail">
            <section className="app-card detail-screen-header">
              <button onClick={() => router.push("/?tab=more&section=listings")}>Back</button>
              <div>
                <span>Rodeo</span>
                <h2>{listing.title}</h2>
                <p>Loading listing...</p>
              </div>
            </section>
          </div>
        ) : state === "error" && listing.detailFields.length === 0 ? (
          <div className="business-listing-detail">
            <section className="app-card detail-screen-header">
              <button onClick={() => router.push("/?tab=more&section=listings")}>Back</button>
              <div>
                <span>Rodeo</span>
                <h2>{listing.title}</h2>
                <p>{listing.dateText || listing.locationText || "Listing details could not be loaded."}</p>
              </div>
            </section>
            <section className="app-card detail-section">
              <div className="section-title-row">
                <div>
                  <span>{listing.source || "Listing"}</span>
                  <h3>Listing Unavailable</h3>
                </div>
                <Newspaper size={18} />
              </div>
              <p className="muted-copy">This listing is no longer available in the Business Journal feed.</p>
            </section>
          </div>
        ) : (
          <BusinessJournalListingDetailView item={listing} onBack={() => router.push("/?tab=more&section=listings")} />
        )}
      </section>
    </main>
  );
}
