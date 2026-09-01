"use client";

import { useEffect } from "react";
import { appSettingsStorageKey, readJson } from "../lib/local-preferences";
import { applyAppTheme, defaultSettings } from "../lib/theme";
import type { AppSettings } from "../lib/types";

export function ThemeSync() {
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const settings = {
      ...defaultSettings,
      ...readJson<Partial<AppSettings> | null>(window.localStorage, appSettingsStorageKey, null)
    };

    function syncTheme() {
      applyAppTheme(document.documentElement, settings, mediaQuery.matches);
    }

    syncTheme();

    if (settings.appearanceMode !== "device") return;

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", syncTheme);
      return () => mediaQuery.removeEventListener("change", syncTheme);
    }

    mediaQuery.addListener(syncTheme);
    return () => mediaQuery.removeListener(syncTheme);
  }, []);

  return null;
}
