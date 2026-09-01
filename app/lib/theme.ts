import type { AppSettings } from "./types";

export const defaultSettings: AppSettings = {
  accentTheme: "classic",
  appearanceMode: "device",
  favoriteStandingsEvent: "All Around",
  favoriteResultsEvent: "Tie-Down Roping",
  followAlertsEnabled: true,
  compactLists: false,
  adConsent: "unset",
  consentUpdatedAt: ""
};

export const themeVariables: Record<AppSettings["accentTheme"], Record<string, string>> = {
  classic: {
    "--app-primary": "#4d5d52",
    "--app-secondary": "#a08a59",
    "--app-tertiary": "#6b6f76"
  },
  arena: {
    "--app-primary": "#31484f",
    "--app-secondary": "#b57935",
    "--app-tertiary": "#647071"
  },
  river: {
    "--app-primary": "#29555a",
    "--app-secondary": "#8f7c3f",
    "--app-tertiary": "#657175"
  },
  rose: {
    "--app-primary": "#61424a",
    "--app-secondary": "#b47852",
    "--app-tertiary": "#756970"
  }
};

export const darkThemeVariables: Record<string, string> = {
  "--app-primary": "#f5f5f5",
  "--app-secondary": "#ffd478",
  "--app-tertiary": "#bcbccf"
};

export function resolveAppearanceMode(mode: AppSettings["appearanceMode"], prefersDark: boolean) {
  if (mode === "device") return prefersDark ? "dark" : "light";
  return mode;
}

export function applyAppTheme(root: HTMLElement, settings: AppSettings, prefersDark: boolean) {
  const resolvedAppearance = resolveAppearanceMode(settings.appearanceMode, prefersDark);
  const activeVariables = resolvedAppearance === "dark" ? darkThemeVariables : themeVariables[settings.accentTheme];

  root.dataset.theme = resolvedAppearance;
  root.dataset.appearanceMode = settings.appearanceMode;
  root.dataset.compactLists = settings.compactLists ? "true" : "false";
  root.style.colorScheme = resolvedAppearance;

  for (const [key, value] of Object.entries(activeVariables)) {
    root.style.setProperty(key, value);
  }
}
