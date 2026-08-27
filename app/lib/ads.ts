import type { AppSettings } from "./types";

export type AdPlacement =
  | "standingsListInline"
  | "resultsListInline"
  | "resultsDetailSection"
  | "scheduleListInline"
  | "scheduleDetailBottom"
  | "athleteBioSection"
  | "pastChampionsList"
  | "rodeoListingsList"
  | "generalMediumRectangle";

export const adsensePublisherId = "ca-pub-4837925489125062";

export const adsenseSlots: Partial<Record<AdPlacement, string | undefined>> = {
  standingsListInline: process.env.NEXT_PUBLIC_ADSENSE_SLOT_STANDINGS_LIST ?? "5395053591",
  resultsListInline: process.env.NEXT_PUBLIC_ADSENSE_SLOT_RESULTS_LIST ?? "1712170909",
  resultsDetailSection: process.env.NEXT_PUBLIC_ADSENSE_SLOT_RESULTS_DETAIL ?? "2744839522",
  scheduleListInline: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SCHEDULE_LIST ?? "2969412258",
  scheduleDetailBottom: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SCHEDULE_DETAIL ?? "6516563576",
  athleteBioSection: process.env.NEXT_PUBLIC_ADSENSE_SLOT_ATHLETE_BIO ?? "6605404933",
  pastChampionsList: process.env.NEXT_PUBLIC_ADSENSE_SLOT_PAST_CHAMPIONS ?? "6927627118",
  rodeoListingsList: process.env.NEXT_PUBLIC_ADSENSE_SLOT_RODEO_LISTINGS ?? "4468100257",
  generalMediumRectangle: process.env.NEXT_PUBLIC_ADSENSE_SLOT_GENERAL_MREC ?? "6413833246"
};

export function shouldRequestAds(consent: AppSettings["adConsent"]) {
  return consent === "personalized" || consent === "nonPersonalized";
}

export function shouldRequestNonPersonalizedAds(consent: AppSettings["adConsent"]) {
  return consent === "nonPersonalized";
}

export function shouldShowListAd(index: number, firstAfter = 5, repeatEvery = 5) {
  if (index < firstAfter) return false;
  if (index === firstAfter) return true;
  return (index - firstAfter) % repeatEvery === 0;
}

export function shouldShowBottomAd(itemCount: number, minimumItems = 3) {
  return itemCount >= minimumItems;
}
