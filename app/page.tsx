"use client";

import { Bell, Calendar, CircleDollarSign, Ellipsis, ListOrdered, Menu, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PwaRegister } from "./pwa-register";
import {
  AthleteDetailPane,
  AthleteProfileScreen,
  CookieConsentBanner,
  DetailPane,
  EmptyDetailPane,
  FollowAlertsPanel,
  MobileContextStrip,
  MoreView,
  ResultsView,
  RodeoDailyLogoMark,
  RodeoDetailView,
  ScheduleView,
  StandingsView
} from "./components/rodeo-views";
import {
  dateRangeParams,
  eventCodes,
  fetchJson,
  mapAthleteBio,
  mapAthleteSearchRows,
  mapBusinessJournalRows,
  mapDaysheets,
  mapNfrStandings,
  mapPastChampions,
  mapPosition,
  mapRodeo,
  mapWinners,
  rodeoHasEvent,
  standingTypes
} from "./lib/rodeo-data";
import type {
  ApiBusinessJournalResponse,
  ApiAthleteBioResponse,
  ApiAthleteSearchResponse,
  ApiDaysheetResponse,
  ApiNfrStandingsResponse,
  ApiPosition,
  ApiRodeo,
  ApiRodeoResults,
  AppSettings,
  AthleteBio,
  AthleteSearchRow,
  BusinessJournalRow,
  DateRange,
  DaysheetRow,
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


const tabs: Array<{ label: Tab; icon: typeof ListOrdered }> = [
  { label: "Standings", icon: ListOrdered },
  { label: "Results", icon: CircleDollarSign },
  { label: "Schedule", icon: Calendar },
  { label: "More", icon: Ellipsis }
];

const defaultSettings: AppSettings = {
  accentTheme: "classic",
  favoriteStandingsEvent: "Tie-Down Roping",
  favoriteResultsEvent: "Tie-Down Roping",
  followAlertsEnabled: true,
  compactLists: false,
  adConsent: "unset",
  consentUpdatedAt: ""
};

const themeVariables: Record<AppSettings["accentTheme"], Record<string, string>> = {
  classic: {
    "--app-primary": "#4d5d52",
    "--app-secondary": "#a08a59",
    "--app-tertiary": "#6b6f76",
    "--logo-bg": "#4d5d52",
    "--logo-outer": "#a08a59",
    "--logo-bar": "#6b6f76"
  },
  arena: {
    "--app-primary": "#31484f",
    "--app-secondary": "#b57935",
    "--app-tertiary": "#647071",
    "--logo-bg": "#31484f",
    "--logo-outer": "#b57935",
    "--logo-bar": "#647071"
  },
  river: {
    "--app-primary": "#29555a",
    "--app-secondary": "#8f7c3f",
    "--app-tertiary": "#657175",
    "--logo-bg": "#29555a",
    "--logo-outer": "#8f7c3f",
    "--logo-bar": "#657175"
  },
  rose: {
    "--app-primary": "#61424a",
    "--app-secondary": "#b47852",
    "--app-tertiary": "#756970",
    "--logo-bg": "#61424a",
    "--logo-outer": "#b47852",
    "--logo-bar": "#756970"
  }
};

function appendUniqueRodeos(current: RodeoRow[], incoming: RodeoRow[]) {
  const seen = new Set(current.map((rodeo) => rodeo.id));
  return [...current, ...incoming.filter((rodeo) => !seen.has(rodeo.id))];
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("Standings");
  const [standingType, setStandingType] = useState<StandingType>("World Standings");
  const [standingEvent, setStandingEvent] = useState<EventName>("Tie-Down Roping");
  const [standingYear, setStandingYear] = useState("2026");
  const [resultEvent, setResultEvent] = useState<EventName>("Tie-Down Roping");
  const [detailEvent, setDetailEvent] = useState<EventName>("Tie-Down Roping");
  const [nfrEvent, setNfrEvent] = useState<EventName>("Bareback Riding");
  const [resultsDateRange, setResultsDateRange] = useState<DateRange>({ start: "", end: "" });
  const [scheduleDateRange, setScheduleDateRange] = useState<DateRange>({ start: "", end: "" });
  const [resultsPage, setResultsPage] = useState(1);
  const [schedulePage, setSchedulePage] = useState(1);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [standingsRows, setStandingsRows] = useState<StandingRow[]>([]);
  const [resultsRows, setResultsRows] = useState<RodeoRow[]>([]);
  const [scheduleRows, setScheduleRows] = useState<RodeoRow[]>([]);
  const [businessJournalRows, setBusinessJournalRows] = useState<BusinessJournalRow[]>([]);
  const [pastChampions, setPastChampions] = useState<PastChampion[]>([]);
  const [nfrStandings, setNfrStandings] = useState<NfrContestant[]>([]);
  const [athleteBio, setAthleteBio] = useState<AthleteBio | null>(null);
  const [athleteSearchText, setAthleteSearchText] = useState("");
  const [athleteSearchRows, setAthleteSearchRows] = useState<AthleteSearchRow[]>([]);
  const [daysheets, setDaysheets] = useState<DaysheetRow[]>([]);
  const [selectedResult, setSelectedResult] = useState<RodeoRow | null>(null);
  const [selectedStanding, setSelectedStanding] = useState<StandingRow | null>(null);
  const [athleteProfileOpen, setAthleteProfileOpen] = useState(false);
  const [rodeoDetailSource, setRodeoDetailSource] = useState<RodeoDetailSource | null>(null);
  const [favoriteAthletes, setFavoriteAthletes] = useState<Record<number, SavedAthlete>>({});
  const [favoriteAthleteOrder, setFavoriteAthleteOrder] = useState<number[]>([]);
  const [followedAthletes, setFollowedAthletes] = useState<number[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings>(defaultSettings);
  const [followAlertsOpen, setFollowAlertsOpen] = useState(false);
  const [moreSection, setMoreSection] = useState<MoreSection>("menu");
  const [standingsState, setStandingsState] = useState<LoadState>("idle");
  const [resultsState, setResultsState] = useState<LoadState>("idle");
  const [scheduleState, setScheduleState] = useState<LoadState>("idle");
  const [businessJournalState, setBusinessJournalState] = useState<LoadState>("idle");
  const [pastChampionsState, setPastChampionsState] = useState<LoadState>("idle");
  const [nfrState, setNfrState] = useState<LoadState>("idle");
  const [athleteBioState, setAthleteBioState] = useState<LoadState>("idle");
  const [athleteSearchState, setAthleteSearchState] = useState<LoadState>("idle");
  const [detailState, setDetailState] = useState<LoadState>("idle");
  const [daysheetState, setDaysheetState] = useState<LoadState>("idle");
  const selectedResultId = selectedResult?.id;
  const selectedStandingId = selectedStanding?.id;
  const standingsSearchText = activeTab === "Standings" ? searchText : "";
  const resultsSearchText = activeTab === "Results" ? searchText : "";
  const scheduleSearchText = activeTab === "Schedule" ? searchText : "";
  const showMobileContextStrip =
    !athleteProfileOpen &&
    !rodeoDetailSource &&
    activeTab !== "More" &&
    ((activeTab === "Standings" && Boolean(selectedStanding)) ||
      ((activeTab === "Results" || activeTab === "Schedule") && Boolean(selectedResult)));

  const headerSubtitle = useMemo(() => {
    if (activeTab === "Standings") return `${standingEvent} - ${standingYear} ${standingType}`;
    if (activeTab === "Results") return `${resultEvent} Rodeo Results`;
    if (activeTab === "Schedule") return "Upcoming Rodeos";
    return "More Features";
  }, [activeTab, resultEvent, standingEvent, standingType, standingYear]);

  const searchPlaceholder = useMemo(() => {
    if (activeTab === "Standings") return "Search athletes...";
    if (activeTab === "Results") return "Search results rodeos...";
    if (activeTab === "Schedule") return "Search upcoming rodeos...";
    return "Search...";
  }, [activeTab]);

  useEffect(() => {
    const storedFavorites = window.localStorage.getItem("rodeodaily.favoriteAthletes");
    const storedFavoriteOrder = window.localStorage.getItem("rodeodaily.favoriteAthleteOrder");
    const storedFollows = window.localStorage.getItem("rodeodaily.followedAthletes");
    const storedSettings = window.localStorage.getItem("rodeodaily.settings");

    if (storedFavorites) {
      setFavoriteAthletes(JSON.parse(storedFavorites) as Record<number, SavedAthlete>);
    }

    if (storedFavoriteOrder) {
      setFavoriteAthleteOrder(JSON.parse(storedFavoriteOrder) as number[]);
    }

    if (storedFollows) {
      setFollowedAthletes(JSON.parse(storedFollows) as number[]);
    }

    if (storedSettings) {
      const settings = { ...defaultSettings, ...(JSON.parse(storedSettings) as Partial<AppSettings>) };
      setAppSettings(settings);
      setStandingEvent(settings.favoriteStandingsEvent);
      setResultEvent(settings.favoriteResultsEvent);
      setDetailEvent(settings.favoriteResultsEvent);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("rodeodaily.favoriteAthletes", JSON.stringify(favoriteAthletes));
  }, [favoriteAthletes]);

  useEffect(() => {
    setFavoriteAthleteOrder((current) => {
      const favoriteIds = Object.keys(favoriteAthletes).map(Number);
      const kept = current.filter((id) => Boolean(favoriteAthletes[id]));
      const missing = favoriteIds.filter((id) => !kept.includes(id));
      const next = [...kept, ...missing];
      return next.length === current.length && next.every((id, index) => id === current[index]) ? current : next;
    });
  }, [favoriteAthletes]);

  useEffect(() => {
    window.localStorage.setItem("rodeodaily.favoriteAthleteOrder", JSON.stringify(favoriteAthleteOrder));
  }, [favoriteAthleteOrder]);

  useEffect(() => {
    window.localStorage.setItem("rodeodaily.followedAthletes", JSON.stringify(followedAthletes));
  }, [followedAthletes]);

  useEffect(() => {
    window.localStorage.setItem("rodeodaily.settings", JSON.stringify(appSettings));
    const root = document.documentElement;
    for (const [key, value] of Object.entries(themeVariables[appSettings.accentTheme])) {
      root.style.setProperty(key, value);
    }
    root.dataset.compactLists = appSettings.compactLists ? "true" : "false";

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
  }, [appSettings]);

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
        const payload = await fetchJson<{ data?: ApiPosition[] }>(`/api/rodeo?${params}`);
        const rows = (payload.data ?? []).map(mapPosition);
        if (!cancelled) {
          setStandingsRows(rows);
          setSelectedStanding((current) => rows.find((row) => row.id === current?.id) ?? rows[0] ?? null);
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
  }, [standingEvent, standingType, standingYear]);

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
        const rows = (payload.data ?? []).filter((rodeo) => rodeoHasEvent(rodeo, resultEvent)).map(mapRodeo);
        if (!cancelled) {
          setResultsRows((current) => (resultsPage === 1 ? rows : appendUniqueRodeos(current, rows)));
          setSelectedResult((current) => rows.find((row) => row.id === current?.id) ?? current ?? rows[0] ?? null);
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

    async function loadAthleteBio() {
      if (!selectedStandingId) {
        setAthleteBio(null);
        setAthleteBioState("idle");
        return;
      }

      setAthleteBioState("loading");
      try {
        const params = new URLSearchParams({
          resource: "athlete",
          athleteId: String(selectedStandingId)
        });
        const payload = await fetchJson<ApiAthleteBioResponse>(`/api/rodeo?${params}`);
        const bio = mapAthleteBio(payload);
        if (!cancelled) {
          setAthleteBio(bio);
          setAthleteBioState(bio ? "loaded" : "error");
        }
      } catch {
        if (!cancelled) setAthleteBioState("error");
      }
    }

    loadAthleteBio();
    return () => {
      cancelled = true;
    };
  }, [selectedStandingId]);

  useEffect(() => {
    let cancelled = false;

    async function loadSelectedWinners() {
      if (!selectedResultId) return;
      setDetailState("loading");
      try {
        const params = new URLSearchParams({
          resource: "rodeo-results",
          rodeoId: String(selectedResultId)
        });
        const payload = await fetchJson<ApiRodeoResults>(`/api/rodeo?${params}`);
        const winners = mapWinners(payload, eventCodes[detailEvent]);
        if (!cancelled) {
          setSelectedResult((current) => (current?.id === selectedResultId ? { ...current, winners } : current));
          setDetailState("loaded");
        }
      } catch {
        if (!cancelled) setDetailState("error");
      }
    }

    loadSelectedWinners();
    return () => {
      cancelled = true;
    };
  }, [selectedResultId, detailEvent]);

  useEffect(() => {
    let cancelled = false;

    async function loadDaysheets() {
      if (!selectedResultId || !selectedResult?.hasDaysheets) {
        setDaysheets([]);
        setDaysheetState("loaded");
        return;
      }

      setDaysheetState("loading");
      try {
        const params = new URLSearchParams({
          resource: "daysheet",
          rodeoId: String(selectedResultId)
        });
        const payload = await fetchJson<ApiDaysheetResponse>(`/api/rodeo?${params}`);
        const rows = mapDaysheets(payload);
        if (!cancelled) {
          setDaysheets(rows);
          setDaysheetState("loaded");
        }
      } catch {
        if (!cancelled) setDaysheetState("error");
      }
    }

    loadDaysheets();
    return () => {
      cancelled = true;
    };
  }, [selectedResultId, selectedResult?.hasDaysheets]);

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
    setFavoriteAthletes((current) => {
      const next = { ...current };
      if (next[athlete.id]) {
        delete next[athlete.id];
      } else {
        next[athlete.id] = {
          id: athlete.id,
          name: athlete.name,
          hometown: athlete.hometown,
          imageUrl: athlete.imageUrl,
          metric: athlete.metric,
          metricLabel: athlete.metricLabel
        };
      }
      return next;
    });
    setFavoriteAthleteOrder((current) =>
      current.includes(athlete.id) ? current.filter((id) => id !== athlete.id) : [...current, athlete.id]
    );
  }

  function moveFavoriteAthlete(athleteId: number, direction: "up" | "down") {
    setFavoriteAthleteOrder((current) => {
      const favoriteIds = Object.keys(favoriteAthletes).map(Number);
      const order = [...current.filter((id) => favoriteAthletes[id]), ...favoriteIds.filter((id) => !current.includes(id))];
      const index = order.indexOf(athleteId);
      const nextIndex = direction === "up" ? index - 1 : index + 1;
      if (index < 0 || nextIndex < 0 || nextIndex >= order.length) return current;
      const next = [...order];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  function toggleFollowedAthlete(athleteId: number) {
    setFollowedAthletes((current) =>
      current.includes(athleteId) ? current.filter((id) => id !== athleteId) : [...current, athleteId]
    );
  }

  function openRodeoDetail(rodeo: RodeoRow, source: RodeoDetailSource) {
    setSelectedResult(rodeo);
    setDetailEvent(resultEvent);
    setRodeoDetailSource(source);
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
      setStandingEvent(nextSettings.favoriteStandingsEvent);
    }
    if (nextSettings.favoriteResultsEvent) {
      setResultsPage(1);
      setResultEvent(nextSettings.favoriteResultsEvent);
      setDetailEvent(nextSettings.favoriteResultsEvent);
    }
  }

  function updateAdConsent(adConsent: AppSettings["adConsent"]) {
    updateAppSettings({ adConsent, consentUpdatedAt: new Date().toISOString() });
  }

  function openAthleteProfile(athlete: StandingRow) {
    setSelectedStanding(athlete);
    setAthleteProfileOpen(true);
    setActiveTab("Standings");
    setMoreSection("menu");
  }

  function selectTab(tab: Tab) {
    setActiveTab(tab);
    setSearchText("");
    setSearchExpanded(false);
    setRodeoDetailSource(null);
    setAthleteProfileOpen(false);
    setFollowAlertsOpen(false);
  }

  return (
    <main className="browser-stage">
      <PwaRegister />
      <section className="app-window" aria-label="Rodeo Daily web app">
        <CookieConsentBanner consent={appSettings.adConsent} onChoose={updateAdConsent} />
        <header className="top-toolbar">
          <div className="identity">
            <RodeoDailyLogoMark />
            <div>
              <strong>Rodeo Daily</strong>
            </div>
          </div>
          <div className="toolbar-actions">
            <button aria-label="Notifications" onClick={() => setFollowAlertsOpen((open) => !open)}>
              <Bell size={19} />
              {followedAthletes.length > 0 && <span className="badge-count">{followedAthletes.length}</span>}
            </button>
            <button aria-label="Menu" onClick={() => selectTab("More")}>
              <Menu size={20} />
            </button>
          </div>
          {followAlertsOpen && (
            <FollowAlertsPanel
              followedAthletes={followedAthleteRows}
              alertsEnabled={appSettings.followAlertsEnabled}
              onOpenAthlete={openAthleteProfile}
              onOpenSettings={() => {
                setActiveTab("More");
                setMoreSection("settings");
                setFollowAlertsOpen(false);
              }}
              onClose={() => setFollowAlertsOpen(false)}
            />
          )}
        </header>

        <div className="content-grid">
          <aside className="sidebar" aria-label="Primary">
            <div className="sidebar-title">
              <span>Tabs</span>
            </div>
            {tabs.map((tab) => {
              const Icon = tab.icon;
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
          </aside>

          <section className={showMobileContextStrip ? "phone-surface has-context-strip" : "phone-surface"}>
            <div className="native-header">
              <div>
                <h1>{activeTab}</h1>
                <p>{headerSubtitle}</p>
              </div>
              {activeTab !== "More" && (
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

            <MobileContextStrip
              activeTab={activeTab}
              athlete={selectedStanding}
              rodeo={selectedResult}
              hidden={!showMobileContextStrip}
              onOpenAthlete={openAthleteProfile}
              onOpenRodeo={openRodeoDetail}
            />

            <div className="tab-scroll">
              {activeTab === "Standings" && athleteProfileOpen && selectedStanding ? (
                <AthleteProfileScreen
                  athlete={selectedStanding}
                  bio={athleteBio}
                  state={athleteBioState}
                  onBack={() => setAthleteProfileOpen(false)}
                  toggleFavoriteAthlete={toggleFavoriteAthlete}
                  toggleFollowedAthlete={toggleFollowedAthlete}
                />
              ) : activeTab === "Standings" && (
                <StandingsView
                  standingType={standingType}
                  setStandingType={setStandingType}
                  standingEvent={standingEvent}
                  setStandingEvent={setStandingEvent}
                  standingYear={standingYear}
                  setStandingYear={setStandingYear}
                  rows={filteredStandings}
                  state={standingsState}
                  selectedStanding={selectedStanding}
                  setSelectedStanding={setSelectedStanding}
                  onOpenAthlete={openAthleteProfile}
                  toggleFavoriteAthlete={toggleFavoriteAthlete}
                  toggleFollowedAthlete={toggleFollowedAthlete}
                />
              )}
              {activeTab === "Results" && (
                rodeoDetailSource === "results" && selectedResult ? (
                  <RodeoDetailView
                    rodeo={selectedResult}
                    state={detailState}
                    daysheetState={daysheetState}
                    daysheets={daysheets}
                    event={detailEvent}
                    setEvent={setDetailEvent}
                    source="results"
                    onBack={() => setRodeoDetailSource(null)}
                  />
                ) : (
                  <ResultsView
                  resultEvent={resultEvent}
                  setResultEvent={updateResultEvent}
                  dateRange={resultsDateRange}
                  setDateRange={updateResultsDateRange}
                  selectedResult={selectedResult}
                    onOpenRodeo={(rodeo) => openRodeoDetail(rodeo, "results")}
                    onLoadMore={() => setResultsPage((page) => page + 1)}
                    rows={resultsRows}
                    state={resultsState}
                  />
                )
              )}
              {activeTab === "Schedule" && (
                rodeoDetailSource === "schedule" && selectedResult ? (
                  <RodeoDetailView
                    rodeo={selectedResult}
                    state={detailState}
                    daysheetState={daysheetState}
                    daysheets={daysheets}
                    event={detailEvent}
                    setEvent={setDetailEvent}
                    source="schedule"
                    onBack={() => setRodeoDetailSource(null)}
                  />
                ) : (
                  <ScheduleView
                    rows={scheduleRows}
                    state={scheduleState}
                    dateRange={scheduleDateRange}
                    setDateRange={updateScheduleDateRange}
                    selectedResult={selectedResult}
                    onOpenRodeo={(rodeo) => openRodeoDetail(rodeo, "schedule")}
                    onLoadMore={() => setSchedulePage((page) => page + 1)}
                  />
                )
              )}
              {activeTab === "More" && (
                <MoreView
                  section={moreSection}
                  setSection={setMoreSection}
                  favoriteAthletes={favoriteAthleteRows}
                  followedCount={followedAthletes.length}
                  scheduleRows={scheduleRows}
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

            <nav className={searchExpanded ? "tab-bar search-mode" : "tab-bar"} aria-label="Bottom tabs">
              <div className="tab-items">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      className={activeTab === tab.label ? "tab-button active" : "tab-button"}
                      key={tab.label}
                      onClick={() => selectTab(tab.label)}
                    >
                      <Icon size={21} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="bottom-search">
                {searchExpanded && (
                  <input
                    autoFocus
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    placeholder={searchPlaceholder}
                  />
                )}
                <button
                  aria-label={searchExpanded ? "Close search" : "Search"}
                  onClick={() => {
                    setSearchExpanded((expanded) => !expanded);
                    if (searchExpanded) setSearchText("");
                  }}
                >
                  {searchExpanded ? <X size={20} /> : <Search size={21} />}
                </button>
              </div>
            </nav>
          </section>

          <aside className="detail-pane">
            {activeTab === "Standings" && selectedStanding ? (
              <AthleteDetailPane
                athlete={selectedStanding}
                bio={athleteBio}
                state={athleteBioState}
                toggleFavoriteAthlete={toggleFavoriteAthlete}
                toggleFollowedAthlete={toggleFollowedAthlete}
              />
            ) : selectedResult ? (
              <DetailPane rodeo={selectedResult} state={detailState} />
            ) : (
              <EmptyDetailPane />
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
