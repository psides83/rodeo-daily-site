"use client";

import { Calendar, CircleDollarSign, ListOrdered, MonitorSmartphone, Newspaper, Search, Settings, ShieldCheck, Trophy, Users, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { PwaRegister } from "./pwa-register";
import { GoogleAdsController } from "./components/google-ads";
import {
  CookieConsentBanner,
  MoreView,
  ResultsView,
  RodeoDailyLogoMark,
  ScheduleView,
  StandingsView
} from "./components/rodeo-views";
import {
  circuits,
  dateRangeParams,
  defaultCircuitId,
  eventCodes,
  fetchJson,
  mapAthleteSearchRows,
  mapBusinessJournalRows,
  mapNfrStandings,
  mapPastChampions,
  mapPosition,
  mapRodeo,
  normalizeStandingEventForType,
  rodeoHasEvent,
  sortStandingsPositions,
  standingTypes
} from "./lib/rodeo-data";
import {
  appSettingsStorageKey,
  loadFavoriteAthleteState,
  loadFollowedAthletes,
  moveFavoriteAthleteOrder,
  readJson,
  saveFavoriteAthleteState,
  saveFollowedAthletes,
  toggleSavedAthlete
} from "./lib/local-preferences";
import type {
  ApiBusinessJournalResponse,
  ApiAthleteSearchResponse,
  ApiNfrStandingsResponse,
  ApiPosition,
  ApiRodeo,
  AppSettings,
  AthleteSearchRow,
  BusinessJournalRow,
  DateRange,
  EventName,
  LoadState,
  MoreSection,
  NfrContestant,
  PastChampion,
  RodeoDetailSource,
  RodeoRow,
  SavedAthlete,
  StandingRow,
  StandingType,
  Tab
} from "./lib/types";


type AppTabItem = { label: Tab; icon: LucideIcon } | { label: "News"; icon: LucideIcon; href: string };

const tabs: AppTabItem[] = [
  { label: "Standings", icon: ListOrdered },
  { label: "Results", icon: CircleDollarSign },
  { label: "Schedule", icon: Calendar },
  { label: "News", icon: Newspaper, href: "/news" },
  { label: "More", icon: Settings }
];

const primaryDesktopTabs = tabs.filter((tab) => tab.label !== "More");
const bottomTabs = tabs.filter((tab) => tab.label !== "Schedule");

const desktopMoreItems: Array<{ section: Exclude<MoreSection, "menu">; icon: LucideIcon; label: string }> = [
  { section: "schedule", icon: Calendar, label: "Schedule" },
  { section: "favorites", icon: Users, label: "Favorite Athletes" },
  { section: "nfr", icon: Trophy, label: "NFR Standings" },
  { section: "listings", icon: Newspaper, label: "Rodeo Listings" },
  { section: "champions", icon: ShieldCheck, label: "Past Champions" },
  { section: "settings", icon: Settings, label: "Settings" }
];

const moreSectionLabels: Record<MoreSection, string> = {
  menu: "More",
  schedule: "Schedule",
  favorites: "Favorite Athletes",
  nfr: "NFR Standings",
  listings: "Rodeo Listings",
  champions: "Past Champions",
  settings: "Settings"
};

const tabRouteValues: Record<Tab, string> = {
  Standings: "standings",
  Results: "results",
  Schedule: "schedule",
  More: "more"
};

const tabRoutes = Object.entries(tabRouteValues).reduce(
  (routes, [tab, route]) => ({ ...routes, [route]: tab as Tab }),
  {} as Record<string, Tab>
);

const moreSectionRouteValues: Record<Exclude<MoreSection, "menu">, string> = {
  schedule: "schedule",
  favorites: "favorites",
  nfr: "nfr",
  listings: "listings",
  champions: "champions",
  settings: "settings"
};

const moreSectionRoutes = Object.entries(moreSectionRouteValues).reduce(
  (routes, [section, route]) => ({ ...routes, [route]: section as MoreSection }),
  {} as Record<string, MoreSection>
);

const defaultSettings: AppSettings = {
  accentTheme: "classic",
  appearanceMode: "device",
  favoriteStandingsEvent: "All Around",
  favoriteResultsEvent: "Tie-Down Roping",
  followAlertsEnabled: true,
  compactLists: false,
  adConsent: "unset",
  consentUpdatedAt: ""
};

const iosAppStoreUrl = "https://apps.apple.com/us/app/rodeo-daily/id1671624492";
const iosAppBannerDismissedKey = "rodeodaily.iosAppBannerDismissed";

const themeVariables: Record<AppSettings["accentTheme"], Record<string, string>> = {
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

const darkThemeVariables: Record<string, string> = {
  "--app-primary": "#f5f5f5",
  "--app-secondary": "#ffd478",
  "--app-tertiary": "#bcbccf"
};

function resolveAppearanceMode(mode: AppSettings["appearanceMode"]) {
  if (mode === "device") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return mode;
}

function appendUniqueRodeos(current: RodeoRow[], incoming: RodeoRow[]) {
  const seen = new Set(current.map((rodeo) => rodeo.id));
  return [...current, ...incoming.filter((rodeo) => !seen.has(rodeo.id))];
}

function appRoute(tab: Tab, section: MoreSection = "menu") {
  const params = new URLSearchParams({ tab: tabRouteValues[tab] });
  if (tab === "More" && section !== "menu") {
    params.set("section", moreSectionRouteValues[section]);
  }
  return `/?${params}`;
}

function readAppRoute() {
  const params = new URL(window.location.href).searchParams;
  const tab = tabRoutes[params.get("tab") ?? ""] ?? "Standings";
  const section = tab === "More" ? moreSectionRoutes[params.get("section") ?? ""] ?? "menu" : "menu";
  return { tab, section };
}

function updateDocumentSeo(title: string, description: string) {
  document.title = title;
  let descriptionTag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (!descriptionTag) {
    descriptionTag = document.createElement("meta");
    descriptionTag.name = "description";
    document.head.appendChild(descriptionTag);
  }
  descriptionTag.content = description;
}

function isAppleDevice() {
  const userAgent = navigator.userAgent || "";
  const platform = navigator.platform || "";
  const maxTouchPoints = navigator.maxTouchPoints || 0;
  return /iPhone|iPad|iPod|Macintosh/.test(userAgent) || /Mac/.test(platform) || (platform === "MacIntel" && maxTouchPoints > 1);
}

function IosAppPromoBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <section className="ios-app-promo-banner" aria-label="Rodeo Daily iOS app">
      <div className="ios-app-promo-main">
        <RodeoDailyLogoMark />
        <div>
          <strong>Rodeo Daily for iPhone</strong>
          <span>Track standings, results, schedules, favorites, and athlete updates in the iOS app.</span>
        </div>
      </div>
      <a className="app-store-badge-link" href={iosAppStoreUrl} target="_blank" rel="noreferrer" aria-label="Download Rodeo Daily on the App Store">
        <Image src="/app-store-badge.svg" alt="Download on the App Store" width={120} height={40} />
      </a>
      <button type="button" aria-label="Dismiss iOS app banner" onClick={onDismiss}>
        <X size={16} />
      </button>
    </section>
  );
}

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("Standings");
  const [standingType, setStandingType] = useState<StandingType>("World Standings");
  const [standingEvent, setStandingEvent] = useState<EventName>("All Around");
  const [selectedCircuitId, setSelectedCircuitId] = useState(defaultCircuitId);
  const [standingYear, setStandingYear] = useState("2026");
  const [resultEvent, setResultEvent] = useState<EventName>("Tie-Down Roping");
  const [nfrEvent, setNfrEvent] = useState<EventName>("Bareback Riding");
  const [resultsDateRange, setResultsDateRange] = useState<DateRange>({ start: "", end: "" });
  const [scheduleDateRange, setScheduleDateRange] = useState<DateRange>({ start: "", end: "" });
  const [resultsPage, setResultsPage] = useState(1);
  const [schedulePage, setSchedulePage] = useState(1);
  const tabScrollRef = useRef<HTMLDivElement | null>(null);
  const lastTabScrollTopRef = useRef(0);
  const searchCloseTimerRef = useRef<number | null>(null);
  const [tabBarHidden, setTabBarHidden] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchClosing, setSearchClosing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [standingsRows, setStandingsRows] = useState<StandingRow[]>([]);
  const [resultsRows, setResultsRows] = useState<RodeoRow[]>([]);
  const [scheduleRows, setScheduleRows] = useState<RodeoRow[]>([]);
  const [businessJournalRows, setBusinessJournalRows] = useState<BusinessJournalRow[]>([]);
  const [pastChampions, setPastChampions] = useState<PastChampion[]>([]);
  const [nfrStandings, setNfrStandings] = useState<NfrContestant[]>([]);
  const [athleteSearchText, setAthleteSearchText] = useState("");
  const [athleteSearchRows, setAthleteSearchRows] = useState<AthleteSearchRow[]>([]);
  const [favoriteAthletes, setFavoriteAthletes] = useState<Record<number, SavedAthlete>>({});
  const [favoriteAthleteOrder, setFavoriteAthleteOrder] = useState<number[]>([]);
  const [followedAthletes, setFollowedAthletes] = useState<number[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings>(defaultSettings);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [followAlertsOpen, setFollowAlertsOpen] = useState(false);
  const [showIosAppBanner, setShowIosAppBanner] = useState(false);
  const [moreSection, setMoreSection] = useState<MoreSection>("menu");
  const [standingsState, setStandingsState] = useState<LoadState>("idle");
  const [resultsState, setResultsState] = useState<LoadState>("idle");
  const [scheduleState, setScheduleState] = useState<LoadState>("idle");
  const [businessJournalState, setBusinessJournalState] = useState<LoadState>("idle");
  const [pastChampionsState, setPastChampionsState] = useState<LoadState>("idle");
  const [nfrState, setNfrState] = useState<LoadState>("idle");
  const [athleteSearchState, setAthleteSearchState] = useState<LoadState>("idle");
  const standingsSearchText = activeTab === "Standings" ? searchText : "";
  const resultsSearchText = activeTab === "Results" ? searchText : "";
  const isScheduleViewActive = activeTab === "Schedule" || (activeTab === "More" && moreSection === "schedule");
  const scheduleSearchText = isScheduleViewActive ? searchText : "";
  const headerSubtitle = useMemo(() => {
    if (activeTab === "Standings") {
      const selectedCircuit = circuits.find((circuit) => circuit.id === selectedCircuitId) ?? circuits[0];
      return `${standingType === "Circuit" ? selectedCircuit.title : standingEvent} - ${standingYear} ${standingType}`;
    }
    if (activeTab === "Results") return `${resultEvent} Rodeo Results`;
    if (isScheduleViewActive) return "Upcoming Rodeos";
    if (moreSection === "favorites") return `${followedAthletes.length} followed athletes`;
    if (moreSection === "nfr") return `${nfrEvent} NFR standings`;
    if (moreSection === "listings") return "Rodeo business listings and schedule details";
    if (moreSection === "champions") return "Historic PRCA world champions";
    if (moreSection === "settings") return "Preferences and app info";
    return "More Features";
  }, [activeTab, followedAthletes.length, isScheduleViewActive, moreSection, nfrEvent, resultEvent, selectedCircuitId, standingEvent, standingType, standingYear]);

  const searchPlaceholder = useMemo(() => {
    if (activeTab === "Standings") return "Search athletes...";
    if (activeTab === "Results") return "Search results rodeos...";
    if (isScheduleViewActive) return "Search upcoming rodeos...";
    return "Search...";
  }, [activeTab, isScheduleViewActive]);

  useEffect(() => {
    if (activeTab === "Standings") {
      updateDocumentSeo(
        `${standingYear} PRCA Standings, WPRA Standings & Pro Rodeo Standings | Rodeo Daily`,
        `Follow ${standingYear} PRCA standings, WPRA standings, pro rodeo standings, world standings, circuit standings, rookie standings, and athlete rankings by event.`
      );
      return;
    }

    if (activeTab === "Results") {
      updateDocumentSeo(
        "PRCA Results, WPRA Results & Pro Rodeo Results | Rodeo Daily",
        `View PRCA results, WPRA results, and pro rodeo results for ${resultEvent}, including leaders, round results, payouts, and rodeo detail pages.`
      );
      return;
    }

    if (isScheduleViewActive) {
      updateDocumentSeo(
        "Rodeo Schedule, Daysheets & Upcoming Rodeos | Rodeo Daily",
        "Find upcoming rodeos, PRCA rodeo schedules, daysheets, venues, dates, payouts, and rodeo detail pages."
      );
      return;
    }

    updateDocumentSeo(
      "NFR Standings, Rodeo Listings & Past Champions | Rodeo Daily",
      "Explore NFR standings, rodeo listings, past world champions, favorite athletes, and Rodeo Daily settings."
    );
  }, [activeTab, isScheduleViewActive, resultEvent, standingYear]);

  useEffect(() => {
    function syncFromRoute() {
      const route = readAppRoute();
      setActiveTab(route.tab);
      setMoreSection(route.section);
      setSearchText("");
      setTabBarHidden(false);
      setSearchExpanded(false);
      setSearchFocused(false);
      setFollowAlertsOpen(false);
    }

    syncFromRoute();
    window.addEventListener("popstate", syncFromRoute);
    return () => window.removeEventListener("popstate", syncFromRoute);
  }, []);

  useEffect(() => {
    const scrollElement = tabScrollRef.current;
    if (!scrollElement) return;
    const scrollContainer = scrollElement;

    function updateTabBarForScroll() {
      const scrollTop = scrollContainer.scrollTop;
      const lastScrollTop = lastTabScrollTopRef.current;
      const scrollDelta = scrollTop - lastScrollTop;

      if (scrollTop < 32) {
        setTabBarHidden(false);
      } else if (scrollDelta > 8 && scrollTop > 96 && !searchExpanded) {
        setTabBarHidden(true);
      } else if (scrollDelta < -8) {
        setTabBarHidden(false);
      }

      lastTabScrollTopRef.current = scrollTop;
    }

    lastTabScrollTopRef.current = scrollContainer.scrollTop;
    updateTabBarForScroll();
    scrollContainer.addEventListener("scroll", updateTabBarForScroll, { passive: true });
    return () => scrollContainer.removeEventListener("scroll", updateTabBarForScroll);
  }, [activeTab, searchExpanded]);

  useEffect(() => {
    const dismissed = window.localStorage.getItem(iosAppBannerDismissedKey) === "true";
    setShowIosAppBanner(isAppleDevice() && !dismissed);
  }, []);

  useEffect(() => {
    return () => {
      if (searchCloseTimerRef.current) {
        window.clearTimeout(searchCloseTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const favoriteState = loadFavoriteAthleteState(window.localStorage);
    const storedSettings = readJson<Partial<AppSettings> | null>(window.localStorage, appSettingsStorageKey, null);

    setFavoriteAthletes(favoriteState.athletes);
    setFavoriteAthleteOrder(favoriteState.order);
    setFollowedAthletes(loadFollowedAthletes(window.localStorage));

    if (storedSettings) {
      const settings = { ...defaultSettings, ...storedSettings };
      const favoriteStandingsEvent = normalizeStandingEventForType(settings.favoriteStandingsEvent, "World Standings");
      const normalizedSettings = { ...settings, favoriteStandingsEvent };
      setAppSettings(normalizedSettings);
      setStandingEvent(normalizedSettings.favoriteStandingsEvent);
      setResultEvent(normalizedSettings.favoriteResultsEvent);
    }

    setPreferencesLoaded(true);
  }, []);

  useEffect(() => {
    if (!preferencesLoaded) return;
    saveFavoriteAthleteState(window.localStorage, { athletes: favoriteAthletes, order: favoriteAthleteOrder });
  }, [favoriteAthletes, favoriteAthleteOrder, preferencesLoaded]);

  useEffect(() => {
    if (!preferencesLoaded) return;
    saveFollowedAthletes(window.localStorage, followedAthletes);
  }, [followedAthletes, preferencesLoaded]);

  useEffect(() => {
    const root = document.documentElement;
    const resolvedAppearance = resolveAppearanceMode(appSettings.appearanceMode);
    const activeVariables = resolvedAppearance === "dark" ? darkThemeVariables : themeVariables[appSettings.accentTheme];
    root.dataset.theme = resolvedAppearance;
    root.dataset.appearanceMode = appSettings.appearanceMode;
    root.style.colorScheme = resolvedAppearance;

    for (const [key, value] of Object.entries(activeVariables)) {
      root.style.setProperty(key, value);
    }
    root.dataset.compactLists = appSettings.compactLists ? "true" : "false";

    if (!preferencesLoaded) return;

    window.localStorage.setItem(appSettingsStorageKey, JSON.stringify(appSettings));

    const consentGranted = appSettings.adConsent === "personalized";
    const adsAllowed = appSettings.adConsent === "personalized" || appSettings.adConsent === "nonPersonalized";
    const googleWindow = window as Window & {
      dataLayer?: unknown[];
      gtag?: (...args: unknown[]) => void;
    };
    const consentUpdate = {
      ad_storage: adsAllowed ? "granted" : "denied",
      analytics_storage: "denied",
      ad_user_data: consentGranted ? "granted" : "denied",
      ad_personalization: consentGranted ? "granted" : "denied"
    };

    googleWindow.dataLayer = googleWindow.dataLayer ?? [];
    if (googleWindow.gtag) {
      googleWindow.gtag("consent", "update", consentUpdate);
    } else {
      googleWindow.dataLayer.push(["consent", "update", consentUpdate]);
    }
  }, [appSettings, preferencesLoaded]);

  useEffect(() => {
    if (appSettings.appearanceMode !== "device") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function updateDeviceTheme() {
      const root = document.documentElement;
      const resolvedAppearance = mediaQuery.matches ? "dark" : "light";
      const activeVariables = resolvedAppearance === "dark" ? darkThemeVariables : themeVariables[appSettings.accentTheme];
      root.dataset.theme = resolvedAppearance;
      root.style.colorScheme = resolvedAppearance;
      for (const [key, value] of Object.entries(activeVariables)) {
        root.style.setProperty(key, value);
      }
    }

    updateDeviceTheme();
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", updateDeviceTheme);
      return () => mediaQuery.removeEventListener("change", updateDeviceTheme);
    }
    mediaQuery.addListener(updateDeviceTheme);
    return () => mediaQuery.removeListener(updateDeviceTheme);
  }, [appSettings.accentTheme, appSettings.appearanceMode]);

  useEffect(() => {
    let cancelled = false;

    async function loadStandings() {
      setStandingsState("loading");
      try {
        const params = new URLSearchParams({
          resource: "standings",
          year: standingYear,
          type: standingTypes[standingType],
          event: eventCodes[standingEvent]
        });
        if (standingType === "Circuit") {
          params.set("circuitId", selectedCircuitId);
        }
        const payload = await fetchJson<{ data?: ApiPosition[] } | ApiPosition[]>(`/api/rodeo?${params}`);
        const positions = Array.isArray(payload) ? payload : (payload.data ?? []);
        const rows = sortStandingsPositions(positions).map(mapPosition);
        if (!cancelled) {
          setStandingsRows(rows);
          setStandingsState("loaded");
        }
      } catch {
        if (!cancelled) setStandingsState("error");
      }
    }

    loadStandings();
    return () => {
      cancelled = true;
    };
  }, [selectedCircuitId, standingEvent, standingType, standingYear]);

  useEffect(() => {
    setResultsPage(1);
  }, [resultEvent, resultsDateRange, resultsSearchText]);

  useEffect(() => {
    setSchedulePage(1);
  }, [scheduleDateRange, scheduleSearchText]);

  useEffect(() => {
    let cancelled = false;

    async function loadResultsRodeos() {
      setResultsState("loading");
      try {
        const params = dateRangeParams("results-rodeos", resultsDateRange, resultsSearchText, resultsPage);
        const payload = await fetchJson<{ data?: ApiRodeo[] }>(`/api/rodeo?${params}`);
        const rows = (payload.data ?? [])
          .filter((rodeo) => rodeoHasEvent(rodeo, resultEvent))
          .map((rodeo) => ({ ...mapRodeo(rodeo), inProgress: false }));
        if (!cancelled) {
          setResultsRows((current) => (resultsPage === 1 ? rows : appendUniqueRodeos(current, rows)));
          setResultsState("loaded");
        }
      } catch {
        if (!cancelled) setResultsState("error");
      }
    }

    loadResultsRodeos();
    return () => {
      cancelled = true;
    };
  }, [resultEvent, resultsDateRange, resultsSearchText, resultsPage]);

  useEffect(() => {
    let cancelled = false;

    async function loadSchedule() {
      setScheduleState("loading");
      try {
        const params = dateRangeParams("schedule", scheduleDateRange, scheduleSearchText, schedulePage);
        const payload = await fetchJson<{ data?: ApiRodeo[] }>(`/api/rodeo?${params}`);
        const rows = (payload.data ?? []).map(mapRodeo);
        if (!cancelled) {
          setScheduleRows((current) => (schedulePage === 1 ? rows : appendUniqueRodeos(current, rows)));
          setScheduleState("loaded");
        }
      } catch {
        if (!cancelled) setScheduleState("error");
      }
    }

    loadSchedule();
    return () => {
      cancelled = true;
    };
  }, [scheduleDateRange, scheduleSearchText, schedulePage]);

  useEffect(() => {
    let cancelled = false;

    async function loadBusinessJournalListings() {
      setBusinessJournalState("loading");
      try {
        const params = new URLSearchParams({ resource: "business-journal" });
        const payload = await fetchJson<ApiBusinessJournalResponse>(`/api/rodeo?${params}`);
        const rows = mapBusinessJournalRows(payload);
        if (!cancelled) {
          setBusinessJournalRows(rows);
          setBusinessJournalState("loaded");
        }
      } catch {
        if (!cancelled) setBusinessJournalState("error");
      }
    }

    loadBusinessJournalListings();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadPastChampions() {
      setPastChampionsState("loading");
      try {
        const params = new URLSearchParams({ resource: "past-champions" });
        const payload = await fetchJson<PastChampion[]>(`/api/rodeo?${params}`);
        const rows = mapPastChampions(payload);
        if (!cancelled) {
          setPastChampions(rows);
          setPastChampionsState("loaded");
        }
      } catch {
        if (!cancelled) setPastChampionsState("error");
      }
    }

    loadPastChampions();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (moreSection !== "nfr") return;

    async function loadNfrStandings() {
      setNfrState("loading");
      try {
        const params = new URLSearchParams({
          resource: "nfr-standings",
          event: eventCodes[nfrEvent]
        });
        const payload = await fetchJson<ApiNfrStandingsResponse>(`/api/rodeo?${params}`);
        if (!cancelled) {
          setNfrStandings(mapNfrStandings(payload));
          setNfrState("loaded");
        }
      } catch {
        if (!cancelled) setNfrState("error");
      }
    }

    loadNfrStandings();
    return () => {
      cancelled = true;
    };
  }, [moreSection, nfrEvent]);

  const decoratedStandings = standingsRows.map((row) => ({
    ...row,
    favorite: Boolean(favoriteAthletes[row.id]),
    followed: followedAthletes.includes(row.id)
  }));

  const filteredStandings = decoratedStandings.filter((item) => {
    const query = standingsSearchText.trim().toLowerCase();
    const matchesSearch =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.hometown.toLowerCase().includes(query);

    return matchesSearch;
  });

  const favoriteAthleteRows = [
    ...favoriteAthleteOrder.flatMap((id) => (favoriteAthletes[id] ? [favoriteAthletes[id]] : [])),
    ...Object.values(favoriteAthletes).filter((athlete) => !favoriteAthleteOrder.includes(athlete.id))
  ];
  const followedAthleteRows = followedAthletes
    .map((id) => {
      const standingRow = decoratedStandings.find((row) => row.id === id);
      if (standingRow) return standingRow;
      const saved = favoriteAthletes[id];
      if (!saved) return null;
      return {
        ...saved,
        place: 0,
        followed: true,
        favorite: true
      };
    })
    .filter(Boolean) as StandingRow[];

  useEffect(() => {
    let cancelled = false;
    const query = athleteSearchText.trim();

    if (moreSection !== "favorites" || query.length < 2) {
      setAthleteSearchRows([]);
      setAthleteSearchState("idle");
      return;
    }

    setAthleteSearchState("loading");
    const timeout = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          resource: "athlete-search",
          search: query
        });
        const payload = await fetchJson<ApiAthleteSearchResponse>(`/api/rodeo?${params}`);
        const favoriteAthleteIds = Object.keys(favoriteAthletes).map(Number);
        const rows = mapAthleteSearchRows(payload, favoriteAthleteIds);
        if (!cancelled) {
          setAthleteSearchRows(rows);
          setAthleteSearchState("loaded");
        }
      } catch {
        if (!cancelled) setAthleteSearchState("error");
      }
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [athleteSearchText, favoriteAthletes, moreSection]);

  function toggleFavoriteAthlete(athlete: StandingRow) {
    const nextState = toggleSavedAthlete({ athletes: favoriteAthletes, order: favoriteAthleteOrder }, athlete);
    setFavoriteAthletes(nextState.athletes);
    setFavoriteAthleteOrder(nextState.order);
  }

  function moveFavoriteAthlete(athleteId: number, direction: "up" | "down") {
    setFavoriteAthleteOrder((current) => moveFavoriteAthleteOrder({ athletes: favoriteAthletes, order: current }, athleteId, direction));
  }

  function toggleFollowedAthlete(athleteId: number) {
    setFollowedAthletes((current) =>
      current.includes(athleteId) ? current.filter((id) => id !== athleteId) : [...current, athleteId]
    );
  }

  function openRodeoDetail(rodeo: RodeoRow, source: RodeoDetailSource, event?: EventName) {
    const query = new URLSearchParams({
      name: rodeo.name,
      location: rodeo.location,
      venue: rodeo.venueName,
      start: rodeo.startDate,
      end: rodeo.endDate,
      payout: rodeo.payout,
      daysheets: String(rodeo.hasDaysheets)
    });
    if (rodeo.startDateRaw) query.set("startRaw", rodeo.startDateRaw);
    if (rodeo.endDateRaw) query.set("endRaw", rodeo.endDateRaw);
    if (event) query.set("event", event);
    if (rodeo.websiteUrl) query.set("website", rodeo.websiteUrl);
    router.push(`/${source}/${rodeo.id}?${query}`);
  }

  function updateResultEvent(event: EventName) {
    setResultsPage(1);
    setResultEvent(event);
  }

  function updateResultsDateRange(range: DateRange) {
    setResultsPage(1);
    setResultsDateRange(range);
  }

  function updateScheduleDateRange(range: DateRange) {
    setSchedulePage(1);
    setScheduleDateRange(range);
  }

  function updateAppSettings(nextSettings: Partial<AppSettings>) {
    setAppSettings((current) => ({ ...current, ...nextSettings }));
    if (nextSettings.favoriteStandingsEvent) {
      setStandingEvent(normalizeStandingEventForType(nextSettings.favoriteStandingsEvent, "World Standings"));
    }
    if (nextSettings.favoriteResultsEvent) {
      setResultsPage(1);
      setResultEvent(nextSettings.favoriteResultsEvent);
    }
  }

  function updateAdConsent(adConsent: AppSettings["adConsent"]) {
    updateAppSettings({ adConsent, consentUpdatedAt: new Date().toISOString() });
  }

  function openAthleteProfile(athlete: StandingRow, preferredEvent?: EventName) {
    const event = preferredEvent ?? (activeTab === "Standings" ? standingEvent : undefined);
    const query = new URLSearchParams();
    if (event) query.set("event", eventCodes[event]);
    router.push(`/athletes/${athlete.id}${query.size ? `?${query}` : ""}`);
  }

  function openBusinessJournalListing(listing: BusinessJournalRow) {
    const query = new URLSearchParams({
      title: listing.title,
      date: listing.dateText,
      location: listing.locationText,
      source: listing.source
    });
    router.push(`/listings/${encodeURIComponent(listing.id)}?${query}`);
  }

  function selectTab(tab: Tab) {
    if (searchCloseTimerRef.current) {
      window.clearTimeout(searchCloseTimerRef.current);
      searchCloseTimerRef.current = null;
    }
    setActiveTab(tab);
    setMoreSection("menu");
    setSearchText("");
    setTabBarHidden(false);
    setSearchExpanded(false);
    setSearchFocused(false);
    setSearchClosing(false);
    setFollowAlertsOpen(false);
    window.history.pushState({}, "", appRoute(tab));
  }

  function selectMoreSection(section: MoreSection) {
    if (searchCloseTimerRef.current) {
      window.clearTimeout(searchCloseTimerRef.current);
      searchCloseTimerRef.current = null;
    }
    setActiveTab("More");
    setMoreSection(section);
    setSearchText("");
    setTabBarHidden(false);
    setSearchExpanded(false);
    setSearchFocused(false);
    setSearchClosing(false);
    setFollowAlertsOpen(false);
    window.history.pushState({}, "", appRoute("More", section));
  }

  function closeSearch() {
    if (searchCloseTimerRef.current) {
      window.clearTimeout(searchCloseTimerRef.current);
    }
    setSearchText("");
    setSearchFocused(false);
    setSearchClosing(true);
    searchCloseTimerRef.current = window.setTimeout(() => {
      setSearchExpanded(false);
      setSearchClosing(false);
      searchCloseTimerRef.current = null;
    }, 560);
  }

  function dismissIosAppBanner() {
    window.localStorage.setItem(iosAppBannerDismissedKey, "true");
    setShowIosAppBanner(false);
  }

  return (
    <main className="browser-stage">
      <PwaRegister />
      {preferencesLoaded && <GoogleAdsController consent={appSettings.adConsent} />}
      <section className="app-window" aria-label="Rodeo Daily web app">
        {showIosAppBanner && <IosAppPromoBanner onDismiss={dismissIosAppBanner} />}
        {preferencesLoaded && <CookieConsentBanner consent={appSettings.adConsent} onChoose={updateAdConsent} />}
        <header className="top-toolbar">
          <div className="identity">
            <RodeoDailyLogoMark />
            <div>
              <strong>Rodeo Daily</strong>
            </div>
          </div>
        </header>

        <div className="content-grid">
          <aside className="sidebar" aria-label="Primary">
            <div className="sidebar-title">
              <span>Tabs</span>
            </div>
            {primaryDesktopTabs.map((tab) => {
              const Icon = tab.icon;
              if ("href" in tab) {
                return (
                  <Link className="sidebar-tab" href={tab.href} key={tab.label}>
                    <Icon size={19} />
                    <span>{tab.label}</span>
                  </Link>
                );
              }
              return (
                <button
                  className={activeTab === tab.label ? "sidebar-tab active" : "sidebar-tab"}
                  key={tab.label}
                  onClick={() => selectTab(tab.label)}
                >
                  <Icon size={19} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
            <div className="sidebar-title sidebar-title-spaced">
              <span>More</span>
            </div>
            {desktopMoreItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === "More" && moreSection === item.section;
              return (
                <button
                  className={active ? "sidebar-tab active" : "sidebar-tab"}
                  key={item.section}
                  onClick={() => selectMoreSection(item.section)}
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <Link className="sidebar-tab" href="/ios-app">
              <MonitorSmartphone size={19} />
              <span>iOS App</span>
            </Link>
          </aside>

          <section className="phone-surface">
            <div className="native-header">
              <div>
                <h1>{activeTab === "More" ? moreSectionLabels[moreSection] : activeTab}</h1>
                <p>{headerSubtitle}</p>
              </div>
              {(activeTab !== "More" || moreSection === "schedule") && (
                <label className="header-search">
                  <Search size={17} />
                  <input
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    placeholder={searchPlaceholder}
                    aria-label={searchPlaceholder}
                  />
                  {searchText && (
                    <button type="button" aria-label="Clear search" onClick={() => setSearchText("")}>
                      <X size={16} />
                    </button>
                  )}
                </label>
              )}
            </div>

            <div className="tab-scroll" ref={tabScrollRef}>
              {activeTab === "Standings" && (
                <StandingsView
                  standingType={standingType}
                  setStandingType={setStandingType}
                  standingEvent={standingEvent}
                  setStandingEvent={setStandingEvent}
                  selectedCircuitId={selectedCircuitId}
                  setSelectedCircuitId={setSelectedCircuitId}
                  standingYear={standingYear}
                  setStandingYear={setStandingYear}
                  rows={filteredStandings}
                  state={standingsState}
                  onOpenAthlete={openAthleteProfile}
                  toggleFavoriteAthlete={toggleFavoriteAthlete}
                />
              )}
              {activeTab === "Results" && (
                <ResultsView
                  resultEvent={resultEvent}
                  setResultEvent={updateResultEvent}
                  dateRange={resultsDateRange}
                  setDateRange={updateResultsDateRange}
                  onOpenRodeo={(rodeo) => openRodeoDetail(rodeo, "results", resultEvent)}
                  onLoadMore={() => setResultsPage((page) => page + 1)}
                  rows={resultsRows}
                  state={resultsState}
                />
              )}
              {activeTab === "Schedule" && (
                <ScheduleView
                  rows={scheduleRows}
                  state={scheduleState}
                  dateRange={scheduleDateRange}
                  setDateRange={updateScheduleDateRange}
                  onOpenRodeo={(rodeo) => openRodeoDetail(rodeo, "schedule", rodeo.event)}
                  onLoadMore={() => setSchedulePage((page) => page + 1)}
                />
              )}
              {activeTab === "More" && (
                <MoreView
                  section={moreSection}
                  setSection={selectMoreSection}
                  onOpenListing={openBusinessJournalListing}
                  favoriteAthletes={favoriteAthleteRows}
                  followedCount={followedAthletes.length}
                  scheduleRows={scheduleRows}
                  scheduleState={scheduleState}
                  scheduleDateRange={scheduleDateRange}
                  setScheduleDateRange={updateScheduleDateRange}
                  onOpenScheduleRodeo={(rodeo) => openRodeoDetail(rodeo, "schedule", rodeo.event)}
                  onLoadMoreSchedule={() => setSchedulePage((page) => page + 1)}
                  businessJournalRows={businessJournalRows}
                  businessJournalState={businessJournalState}
                  pastChampions={pastChampions}
                  pastChampionsState={pastChampionsState}
                  nfrEvent={nfrEvent}
                  setNfrEvent={setNfrEvent}
                  nfrStandings={nfrStandings}
                  nfrState={nfrState}
                  athleteSearchText={athleteSearchText}
                  setAthleteSearchText={setAthleteSearchText}
                  athleteSearchRows={athleteSearchRows}
                  athleteSearchState={athleteSearchState}
                  appSettings={appSettings}
                  updateAppSettings={updateAppSettings}
                  updateAdConsent={updateAdConsent}
                  onToggleFavoriteAthlete={toggleFavoriteAthlete}
                  onMoveFavoriteAthlete={moveFavoriteAthlete}
                  onOpenAthlete={openAthleteProfile}
                />
              )}
            </div>

            <nav
              className={[
                "tab-bar",
                searchExpanded ? "search-mode" : "",
                searchExpanded && (searchFocused || searchClosing) ? "search-focused" : "",
                searchClosing ? "search-closing" : "",
                tabBarHidden && !searchExpanded ? "hidden" : ""
              ]
                .filter(Boolean)
                .join(" ")}
              aria-label="Bottom tabs"
            >
              <div className={searchExpanded ? "tab-items search-active-tab" : "tab-items"}>
                {bottomTabs
                  .filter((tab) => !searchExpanded || (!("href" in tab) && tab.label === activeTab))
                  .map((tab) => {
                    const Icon = tab.icon;
                    if ("href" in tab) {
                      return (
                        <Link className="tab-button" href={tab.href} key={tab.label}>
                          <Icon size={21} />
                          <span>{tab.label}</span>
                        </Link>
                      );
                    }
                    return (
                      <button
                        className={activeTab === tab.label ? "tab-button active" : "tab-button"}
                        key={tab.label}
                        onClick={() => {
                          if (searchExpanded && tab.label === activeTab) {
                            closeSearch();
                            return;
                          }
                          selectTab(tab.label);
                        }}
                      >
                        <Icon size={21} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
              </div>
              <div className={searchExpanded ? "bottom-search expanded" : "bottom-search"}>
                {searchExpanded && (
                  <>
                    <Search size={18} />
                    <input
                      value={searchText}
                      onChange={(event) => setSearchText(event.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                      placeholder={searchPlaceholder}
                      aria-label={searchPlaceholder}
                    />
                  </>
                )}
                {!searchExpanded && (
                  <button
                    aria-label="Search"
                    onClick={() => {
                      if (searchCloseTimerRef.current) {
                        window.clearTimeout(searchCloseTimerRef.current);
                        searchCloseTimerRef.current = null;
                      }
                      setSearchClosing(false);
                      setSearchExpanded(true);
                    }}
                  >
                    <Search size={21} />
                  </button>
                )}
              </div>
              {searchExpanded && (searchFocused || searchClosing) && (
                <button
                  className="search-close-button"
                  aria-label="Close search"
                  onPointerDown={(event) => {
                    event.preventDefault();
                    closeSearch();
                  }}
                >
                  <X size={27} />
                </button>
              )}
            </nav>
          </section>

        </div>
      </section>
    </main>
  );
}
