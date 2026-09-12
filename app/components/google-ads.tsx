"use client";

import { Clapperboard, Mic2, PlayCircle, Radio, Smartphone } from "lucide-react";
import { useEffect, useRef } from "react";
import {
  adsensePublisherId,
  adsenseSlots,
  houseAdsEnabled,
  shouldRequestAds,
  shouldRequestNonPersonalizedAds,
  type AdPlacement
} from "../lib/ads";
import type { AppSettings } from "../lib/types";

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>> & {
      loaded?: boolean;
      pauseAdRequests?: 0 | 1;
      requestNonPersonalizedAds?: 0 | 1;
    };
  }
}

type HouseAd = {
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  theme: "app" | "video" | "podcast" | "roping" | "daily";
  icon: typeof Smartphone;
};

const houseAds: HouseAd[] = [
  {
    eyebrow: "Rodeo Daily App",
    title: "Follow standings, results, schedules, and favorites on iPhone.",
    body: "Get the Rodeo Daily app for quick season checks, athlete tracking, and rodeo updates from your home screen.",
    href: "https://apps.apple.com/us/app/rodeo-daily/id1671624492",
    cta: "View on App Store",
    theme: "app",
    icon: Smartphone
  },
  {
    eyebrow: "Calf Roping Daily",
    title: "Watch more calf roping clips, runs, and rodeo updates.",
    body: "Subscribe for roping-focused videos from the Calf Roping Daily channel.",
    href: "https://www.youtube.com/@calfropingdaily",
    cta: "Watch on YouTube",
    theme: "daily",
    icon: PlayCircle
  },
  {
    eyebrow: "CalfRoper6.0",
    title: "Roping content for fans who like studying the run.",
    body: "Catch videos, practice looks, and rodeo-minded roping content from CalfRoper6.0.",
    href: "https://www.youtube.com/@CalfRoper6.0",
    cta: "Open Channel",
    theme: "roping",
    icon: Clapperboard
  },
  {
    eyebrow: "Roping Boyz",
    title: "Team roping videos, arena energy, and western lifestyle.",
    body: "Follow Roping Boyz for more roping action and video content from the rodeo side of YouTube.",
    href: "https://www.youtube.com/@RopingBoyz",
    cta: "Watch Videos",
    theme: "video",
    icon: Radio
  },
  {
    eyebrow: "The Rope Cast",
    title: "Rodeo talk, roping stories, and long-form conversation.",
    body: "Listen in with The Rope Cast for more voices, stories, and perspective from the roping world.",
    href: "https://www.youtube.com/@TheRopeCast",
    cta: "Visit Channel",
    theme: "podcast",
    icon: Mic2
  }
];

export function GoogleAdsController({ consent }: { consent: AppSettings["adConsent"] }) {
  useEffect(() => {
    if (houseAdsEnabled) return;

    const ads = (window.adsbygoogle = window.adsbygoogle || []);

    if (!shouldRequestAds(consent)) {
      ads.pauseAdRequests = 1;
      return;
    }

    ads.requestNonPersonalizedAds = shouldRequestNonPersonalizedAds(consent) ? 1 : 0;
    ads.pauseAdRequests = 0;

    if (document.querySelector<HTMLScriptElement>("script[data-rodeo-daily-adsense]")) return;

    const script = document.createElement("script");
    script.async = true;
    script.crossOrigin = "anonymous";
    script.dataset.rodeoDailyAdsense = "true";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsensePublisherId}`;
    document.head.appendChild(script);
  }, [consent]);

  return null;
}

export function GoogleAdSlot({
  placement,
  className = ""
}: {
  placement: AdPlacement;
  className?: string;
}) {
  const pushedRef = useRef(false);
  const slot = adsenseSlots[placement];
  const houseAd = houseAdForPlacement(placement);

  useEffect(() => {
    if (houseAdsEnabled || !slot || pushedRef.current) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushedRef.current = true;
    } catch {
      pushedRef.current = false;
    }
  }, [slot]);

  if (houseAdsEnabled) {
    return <HouseAdSlot ad={houseAd} className={className} placement={placement} />;
  }

  if (!slot) return null;

  return (
    <div className={`google-ad-shell ${className}`} data-placement={placement}>
      <span>Advertisement</span>
      <ins
        className="adsbygoogle"
        data-ad-client={adsensePublisherId}
        data-ad-format="auto"
        data-ad-slot={slot}
        data-full-width-responsive="false"
        style={{ display: "block" }}
      />
    </div>
  );
}

function HouseAdSlot({ ad, className, placement }: { ad: HouseAd; className: string; placement: AdPlacement }) {
  const Icon = ad.icon;

  return (
    <aside className={`google-ad-shell house-ad-shell house-ad-${ad.theme} ${className}`} data-placement={placement} aria-label="Promoted rodeo link">
      <span>Promoted</span>
      <a className="house-ad-card" href={ad.href} target="_blank" rel="noreferrer">
        <span className="house-ad-icon" aria-hidden="true">
          <Icon size={22} />
        </span>
        <span className="house-ad-copy">
          <strong>{ad.eyebrow}</strong>
          <b>{ad.title}</b>
          <em>{ad.body}</em>
        </span>
        <span className="house-ad-cta">{ad.cta}</span>
      </a>
    </aside>
  );
}

function houseAdForPlacement(placement: AdPlacement) {
  const placementOrder: Record<AdPlacement, number> = {
    standingsListInline: 0,
    resultsListInline: 1,
    resultsDetailSection: 2,
    scheduleListInline: 3,
    scheduleDetailBottom: 4,
    athleteBioSection: 0,
    pastChampionsList: 1,
    rodeoListingsList: 2,
    generalMediumRectangle: 3
  };

  return houseAds[placementOrder[placement] % houseAds.length];
}
