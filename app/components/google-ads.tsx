"use client";

import { Clapperboard, Mic2, PlayCircle, Radio, Smartphone } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  imageUrl?: string;
};

const houseAds: HouseAd[] = [
  {
    eyebrow: "Rodeo Daily iOS App",
    title: "Follow standings, results, schedules, and favorites on iPhone.",
    body: "Download the iOS app for quick season checks, athlete tracking, and rodeo updates from your iPhone home screen.",
    href: "https://apps.apple.com/us/app/rodeo-daily/id1671624492",
    cta: "Download",
    theme: "app",
    icon: Smartphone,
    imageUrl: "/rodeo-daily-icon.png"
  },
  {
    eyebrow: "Calf Roping Daily",
    title: "Watch more calf roping clips, runs, and rodeo updates.",
    body: "Subscribe for roping-focused videos from the Calf Roping Daily channel.",
    href: "https://www.youtube.com/@calfropingdaily",
    cta: "Watch on YouTube",
    theme: "daily",
    icon: PlayCircle,
    imageUrl: "https://yt3.googleusercontent.com/HsUqv3VpRHL1o9Z_zkvRJmtCRRY5Ol1Uyp37Fqa87zeJu3jGvINpwM-jK8F-InmmSibzaaPxBw=s900-c-k-c0x00ffffff-no-rj"
  },
  {
    eyebrow: "CalfRoper6.0",
    title: "Roping content for fans who like studying the run.",
    body: "Catch videos, practice looks, and rodeo-minded roping content from CalfRoper6.0.",
    href: "https://www.youtube.com/@CalfRoper6.0",
    cta: "Open Channel",
    theme: "roping",
    icon: Clapperboard,
    imageUrl: "https://yt3.googleusercontent.com/LQfGctIbTeVamGdrf_P-sPFyR6jHFL-NaWGUYUx-ofcBNRqQQ44o-CfnwR4wsLhy32I3jyqlsA=s900-c-k-c0x00ffffff-no-rj"
  },
  {
    eyebrow: "Roping Boyz",
    title: "Team roping videos, arena energy, and western lifestyle.",
    body: "Follow Roping Boyz for more roping action and video content from the rodeo side of YouTube.",
    href: "https://www.youtube.com/@RopingBoyz",
    cta: "Watch Videos",
    theme: "video",
    icon: Radio,
    imageUrl: "https://yt3.googleusercontent.com/ZTsd7WrYre57kU-7QqEeSuW2D2nMgI5oIv1RiwfUWWNFJGRV96ww69iPZP8OxnvGKI2FU19S=s900-c-k-c0x00ffffff-no-rj"
  },
  {
    eyebrow: "The Rope Cast",
    title: "Rodeo talk, roping stories, and long-form conversation.",
    body: "Listen in with The Rope Cast for more voices, stories, and perspective from the roping world.",
    href: "https://www.youtube.com/@TheRopeCast",
    cta: "Visit Channel",
    theme: "podcast",
    icon: Mic2,
    imageUrl: "https://yt3.googleusercontent.com/gGwCuXhcwmUKtIKLB1mEZQg2P2qJfFHOxYVZfluBaVJ0R-kC4eXYmmaWSJKlN6H8w08V1zY2=s900-c-k-c0x00ffffff-no-rj"
  }
];

let houseAdDeck: HouseAd[] = [];

function shuffleHouseAds() {
  const shuffled = [...houseAds];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function drawHouseAd(previousAd?: HouseAd) {
  if (houseAdDeck.length === 0) {
    houseAdDeck = shuffleHouseAds();
    if (previousAd && houseAdDeck[0] === previousAd && houseAdDeck.length > 1) {
      [houseAdDeck[0], houseAdDeck[1]] = [houseAdDeck[1], houseAdDeck[0]];
    }
  }

  return houseAdDeck.shift() ?? houseAds[0];
}

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
  const [houseAd, setHouseAd] = useState(() => houseAdForPlacement(placement));

  useEffect(() => {
    if (houseAdsEnabled || !slot || pushedRef.current) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushedRef.current = true;
    } catch {
      pushedRef.current = false;
    }
  }, [slot]);

  useEffect(() => {
    if (!houseAdsEnabled) return;
    setHouseAd((currentAd) => drawHouseAd(currentAd));
  }, []);

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
        <span className={ad.imageUrl ? "house-ad-icon house-ad-avatar" : "house-ad-icon"} aria-hidden="true">
          {ad.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ad.imageUrl} alt="" loading="lazy" referrerPolicy="no-referrer" />
          ) : (
            <Icon size={22} />
          )}
        </span>
        <span className="house-ad-copy">
          <strong>{ad.eyebrow}</strong>
          <b>{ad.title}</b>
          <em>{ad.body}</em>
        </span>
        {ad.theme === "app" ? (
          <span className="house-ad-store-badge">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/app-store-badge.svg" alt="Download on the App Store" />
          </span>
        ) : (
          <span className="house-ad-cta">{ad.cta}</span>
        )}
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
