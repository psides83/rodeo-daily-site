"use client";

import { useEffect, useRef } from "react";
import {
  adsensePublisherId,
  adsenseSlots,
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

export function GoogleAdsController({ consent }: { consent: AppSettings["adConsent"] }) {
  useEffect(() => {
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

  useEffect(() => {
    if (!slot || pushedRef.current) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushedRef.current = true;
    } catch {
      pushedRef.current = false;
    }
  }, [slot]);

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
