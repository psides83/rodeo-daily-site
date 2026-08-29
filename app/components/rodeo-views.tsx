"use client";

import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  Calendar,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  CircleDollarSign,
  ExternalLink,
  Mail,
  ListOrdered,
  MapPin,
  MonitorSmartphone,
  Moon,
  Newspaper,
  Search,
  Settings,
  ShieldCheck,
  Star,
  Sun,
  Trophy,
  Users,
  X
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import type { KeyboardEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { GoogleAdSlot } from "./google-ads";
import { shouldShowBottomAd, shouldShowListAd } from "../lib/ads";
import type {
  AppSettings,
  AthleteBio,
  AthleteBioResult,
  AthleteSearchRow,
  BusinessJournalRow,
  DateRange,
  DaysheetEntry,
  DaysheetEventGroup,
  DaysheetReride,
  DaysheetRow,
  EventName,
  LoadState,
  MoreSection,
  NfrContestant,
  PastChampion,
  RodeoResultRound,
  RodeoResultRow,
  RodeoDetailSource,
  RodeoRow,
  SavedAthlete,
  StandingRow,
  StandingType,
  Tab
} from "../lib/types";
import {
  businessJournalMatchesDate,
  businessJournalMatchesSearch,
  championEvents,
  circuits,
  events,
  filterChampions,
  formatDate,
  makeDaysheetDisplayRows,
  mapScheduleToBusinessJournalRow,
  normalizeStandingEventForType,
  sortBusinessJournalRows,
  standingEventsForType,
  standingTypeHasEvents,
  standingTypeOptions,
  topChampionCounts
} from "../lib/rodeo-data";

const athletePlaceholderImage = "/noimage.png";

const moreItems = [
  {
    id: "favorites",
    icon: Users,
    title: "Favorite Athletes",
    subtitle: "Browse your selected favorite athlete bios"
  },
  {
    id: "listings",
    icon: Newspaper,
    title: "Rodeo Listings",
    subtitle: "Rodeo listings and details"
  },
  {
    id: "champions",
    icon: ShieldCheck,
    title: "Past World Champions",
    subtitle: "Historic PRCA world champions"
  },
  {
    id: "settings",
    icon: Settings,
    title: "Settings",
    subtitle: "Preferences and app info"
  }
] satisfies Array<{ id: Exclude<MoreSection, "menu">; icon: LucideIcon; title: string; subtitle: string }>;

const standingYears = ["2026", "2025", "2024", "2023", "2022", "2021", "2020"];
const nfrEvents: EventName[] = [
  "Bareback Riding",
  "Steer Wrestling",
  "Team Roping",
  "Saddle Bronc Riding",
  "Tie-Down Roping",
  "Barrel Racing",
  "Bull Riding"
];

const athleteProfileTabs = ["Stats", "Results", "Career", "Highlights"] as const;
type AthleteProfileTab = (typeof athleteProfileTabs)[number];
type AthleteResultSort = "Date" | "Rodeo" | "Result" | "Earnings";
const iosAppStoreUrl = "https://apps.apple.com/us/app/rodeo-daily/id1671624492";

export function RodeoDailyLogoMark() {
  return (
    <span className="logo-mark" role="img" aria-label="Rodeo Daily">
      <Image className="logo-mark-image" src="/rodeo-daily-icon.png" alt="" width={84} height={84} priority />
    </span>
  );
}

export function CookieConsentBanner({
  consent,
  onChoose
}: {
  consent: AppSettings["adConsent"];
  onChoose: (consent: AppSettings["adConsent"]) => void;
}) {
  if (consent !== "unset") return null;

  return (
    <section className="cookie-consent-banner" aria-label="Cookie consent">
      <div>
        <strong>Ads & Privacy</strong>
        <p>Rodeo Daily can use cookies to support Google ads. You can allow personalized ads, use basic ads, or decline ad cookies.</p>
      </div>
      <div className="cookie-consent-actions">
        <button onClick={() => onChoose("declined")}>Decline</button>
        <button onClick={() => onChoose("nonPersonalized")}>Basic Ads</button>
        <button className="primary" onClick={() => onChoose("personalized")}>
          Allow
        </button>
      </div>
    </section>
  );
}

export function MobileContextStrip({
  activeTab,
  athlete,
  rodeo,
  hidden,
  onOpenAthlete,
  onOpenRodeo
}: {
  activeTab: Tab;
  athlete: StandingRow | null;
  rodeo: RodeoRow | null;
  hidden: boolean;
  onOpenAthlete: (athlete: StandingRow) => void;
  onOpenRodeo: (rodeo: RodeoRow, source: RodeoDetailSource) => void;
}) {
  if (hidden) return null;

  if (activeTab === "Standings" && athlete) {
    return (
      <section className="mobile-context-strip">
        <AthleteAvatar athlete={athlete} size="small" />
        <div>
          <span>Selected Athlete</span>
          <strong>{athlete.name}</strong>
          <p>{athlete.hometown || athlete.metric}</p>
        </div>
        <button onClick={() => onOpenAthlete(athlete)}>Profile</button>
      </section>
    );
  }

  if ((activeTab === "Results" || activeTab === "Schedule") && rodeo) {
    return (
      <section className="mobile-context-strip">
        <Calendar size={21} />
        <div>
          <span>Selected Rodeo</span>
          <strong>{rodeo.name}</strong>
          <p>{rodeo.location}</p>
        </div>
        <button onClick={() => onOpenRodeo(rodeo, activeTab === "Schedule" ? "schedule" : "results")}>Open</button>
      </section>
    );
  }

  return null;
}

export function StandingsView({
  standingType,
  setStandingType,
  standingEvent,
  setStandingEvent,
  selectedCircuitId,
  setSelectedCircuitId,
  standingYear,
  setStandingYear,
  rows,
  state,
  onOpenAthlete,
  toggleFavoriteAthlete
}: {
  standingType: StandingType;
  setStandingType: (type: StandingType) => void;
  standingEvent: EventName;
  setStandingEvent: (event: EventName) => void;
  selectedCircuitId: string;
  setSelectedCircuitId: (circuitId: string) => void;
  standingYear: string;
  setStandingYear: (year: string) => void;
  rows: StandingRow[];
  state: LoadState;
  onOpenAthlete: (athlete: StandingRow) => void;
  toggleFavoriteAthlete: (athlete: StandingRow) => void;
}) {
  const availableStandingEvents = standingEventsForType(standingType);
  const showsEventFilter = standingTypeHasEvents(standingType);
  const selectedCircuit = circuits.find((circuit) => circuit.id === selectedCircuitId) ?? circuits[0];
  const circuitLabels = Object.fromEntries(circuits.map((circuit) => [circuit.id, circuit.title]));
  const filterHeaderRef = useRef<HTMLElement | null>(null);
  const [showCurrentOverlay, setShowCurrentOverlay] = useState(false);

  useEffect(() => {
    const filterHeader = filterHeaderRef.current;
    const scrollContainer = filterHeader?.closest(".tab-scroll");
    if (!filterHeader || !scrollContainer) {
      return;
    }
    const headerElement = filterHeader;
    const scrollElement = scrollContainer;

    function updateOverlayVisibility() {
      const headerBounds = headerElement.getBoundingClientRect();
      const containerBounds = scrollElement.getBoundingClientRect();
      setShowCurrentOverlay(headerBounds.bottom <= containerBounds.top + 10);
    }

    updateOverlayVisibility();
    scrollElement.addEventListener("scroll", updateOverlayVisibility, { passive: true });
    window.addEventListener("resize", updateOverlayVisibility);

    return () => {
      scrollElement.removeEventListener("scroll", updateOverlayVisibility);
      window.removeEventListener("resize", updateOverlayVisibility);
    };
  }, []);

  return (
    <div className="stack">
      <section className="app-card header-card standings-filter-card" ref={filterHeaderRef}>
        <div>
          <span>Standings</span>
          <h2>
            {standingType === "Circuit" ? selectedCircuit.title : standingEvent}
            <br />
            {standingType}
          </h2>
        </div>
        <label className="standing-year-picker">
          <select value={standingYear} onChange={(event) => setStandingYear(event.target.value)} aria-label="Season">
            {standingYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <ChevronDown size={20} />
        </label>
      </section>

      <div className="chip-grid standings-filter-grid">
        <SelectChip
          label="Type"
          value={standingType}
          options={standingTypeOptions}
          onChange={(value) => {
            const nextType = value as StandingType;
            setStandingType(nextType);
            setStandingEvent(normalizeStandingEventForType(standingEvent, nextType));
          }}
        />
        {showsEventFilter && (
          <SelectChip label="Event" value={standingEvent} options={availableStandingEvents} onChange={(value) => setStandingEvent(value as EventName)} />
        )}
        {standingType === "Circuit" && (
          <SelectChip
            label="Circuit"
            value={selectedCircuit.id}
            options={circuits.map((circuit) => circuit.id)}
            optionLabels={circuitLabels}
            onChange={setSelectedCircuitId}
          />
        )}
      </div>

      <div
        className={showCurrentOverlay ? "standings-current-overlay visible" : "standings-current-overlay"}
        aria-hidden={!showCurrentOverlay}
        aria-label="Current standings selection"
      >
        <div className="standings-current-pill">
          <strong>{standingType === "Circuit" ? selectedCircuit.title : standingEvent}</strong>
          <span>
            {standingYear} {standingType}
          </span>
        </div>
      </div>

      <div className="list-stack standings-list">
        {state === "loading" ? (
          <LoadingState title="Loading standings" />
        ) : state === "error" ? (
          <EmptyState title="Standings Unavailable" subtitle="The live standings feed could not be loaded." icon={ListOrdered} />
        ) : rows.length > 0 ? (
          <>
            {rows.map((position, index) => (
              <div className="ad-list-item-group" key={position.id}>
                {shouldShowListAd(index, 10, 10) && <GoogleAdSlot placement="standingsListInline" />}
                <StandingCard
                  position={position}
                  onOpenProfile={() => onOpenAthlete(position)}
                  onToggleFavorite={() => toggleFavoriteAthlete(position)}
                />
              </div>
            ))}
            {shouldShowBottomAd(rows.length, 10) && <GoogleAdSlot placement="standingsListInline" />}
          </>
        ) : (
          <EmptyState title="No Standings Found" subtitle="Try a different event, type, or search." icon={ListOrdered} />
        )}
      </div>
    </div>
  );
}

function StandingCard({
  position,
  onOpenProfile,
  onToggleFavorite
}: {
  position: StandingRow;
  onOpenProfile: () => void;
  onToggleFavorite: () => void;
}) {
  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpenProfile();
    }
  }

  return (
    <article
      className="app-card standings-card"
      role="button"
      tabIndex={0}
      onClick={onOpenProfile}
      onKeyDown={handleKeyDown}
      aria-label={`Open ${position.name} profile`}
    >
      <div className="standings-card-content">
        <div className="standing-copy">
          <div className="standing-name-stack">
            <span className="rank-badge">#{position.place}</span>
            <div>
              <h3>{position.name}</h3>
              <p>{position.hometown}</p>
            </div>
          </div>
        </div>

        <div className="card-metrics">
          <div className="icons">
            <button
              aria-label={position.favorite ? "Remove favorite athlete" : "Favorite athlete"}
              className={position.favorite ? "status-control active" : "status-control"}
              onClick={(event) => {
                event.stopPropagation();
                onToggleFavorite();
              }}
            >
              <Star size={16} fill={position.favorite ? "currentColor" : "none"} />
            </button>
            <ChevronRight size={17} />
          </div>
          <span>{position.metricLabel}</span>
          <strong>{position.metric}</strong>
        </div>
      </div>

      <div className="standing-portrait" aria-hidden="true">
        <AthleteAvatar athlete={position} size="card" />
      </div>
    </article>
  );
}

export function ResultsView({
  resultEvent,
  setResultEvent,
  dateRange,
  setDateRange,
  onOpenRodeo,
  onLoadMore,
  rows,
  state
}: {
  resultEvent: EventName;
  setResultEvent: (event: EventName) => void;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  onOpenRodeo: (result: RodeoRow) => void;
  onLoadMore: () => void;
  rows: RodeoRow[];
  state: LoadState;
}) {
  const isInitialLoading = state === "loading" && rows.length === 0;
  const isLoadingMore = state === "loading" && rows.length > 0;
  const inProgressRows = rows.filter((rodeo) => rodeo.inProgress);
  const completedRows = rows.filter((rodeo) => !rodeo.inProgress);
  const hasDateFilter = Boolean(dateRange.start || dateRange.end);
  const dateFilterText = [dateRange.start, dateRange.end].filter(Boolean).join(" - ");

  return (
    <div className="stack">
      <section className="app-card header-card results-list-header-card">
        <h1>Results</h1>
        <h2>{resultEvent} Rodeo Results</h2>
      </section>

      <div className="chip-row results-filter-row">
        <SelectChip label="Event" value={resultEvent} options={events} onChange={(value) => setResultEvent(value as EventName)} />
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </div>

      {hasDateFilter && (
        <div className="active-date-filter-chip">
          <span>Current Range</span>
          <strong>{dateFilterText}</strong>
          <button aria-label="Clear date filter" onClick={() => setDateRange({ start: "", end: "" })}>
            <X size={15} />
          </button>
        </div>
      )}

      <div className="list-stack">
        {isInitialLoading ? (
          <LoadingState title="Loading rodeos" />
        ) : state === "error" ? (
          <EmptyState title="Results Unavailable" subtitle="The live results feed could not be loaded." icon={CircleDollarSign} />
        ) : rows.length > 0 ? (
          <>
            {inProgressRows.length > 0 && (
              <section className="rodeo-list-section">
                <h2>In Progress</h2>
                <div className="list-stack">
                  {inProgressRows.map((rodeo) => (
                    <RodeoListCard key={rodeo.id} rodeo={rodeo} mode="results" onOpen={() => onOpenRodeo(rodeo)} />
                  ))}
                </div>
              </section>
            )}

            {completedRows.length > 0 && (
              <section className="rodeo-list-section">
                <h2>Completed Rodeos</h2>
                <div className="list-stack">
                  {completedRows.map((rodeo, index) => (
                    <div className="ad-list-item-group" key={rodeo.id}>
                      {shouldShowListAd(index, 8, 20) && <GoogleAdSlot placement="resultsListInline" />}
                      <RodeoListCard rodeo={rodeo} mode="results" onOpen={() => onOpenRodeo(rodeo)} />
                    </div>
                  ))}
                </div>
              </section>
            )}
            {shouldShowBottomAd(rows.length, 10) && <GoogleAdSlot placement="resultsListInline" />}
            <button className="load-more-button" onClick={onLoadMore} disabled={isLoadingMore}>
              {isLoadingMore ? "Loading..." : "Load More"}
            </button>
          </>
        ) : (
          <EmptyState title="No Results Found" subtitle="Try a different event or check again later." icon={CircleDollarSign} />
        )}
      </div>
    </div>
  );
}

export function ScheduleView({
  rows,
  state,
  dateRange,
  setDateRange,
  onOpenRodeo,
  onLoadMore
}: {
  rows: RodeoRow[];
  state: LoadState;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  onOpenRodeo: (result: RodeoRow) => void;
  onLoadMore: () => void;
}) {
  const isInitialLoading = state === "loading" && rows.length === 0;
  const isLoadingMore = state === "loading" && rows.length > 0;
  const hasDateFilter = Boolean(dateRange.start || dateRange.end);
  const dateFilterText = [dateRange.start, dateRange.end].filter(Boolean).join(" - ");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const displayedRows = [...rows]
    .filter((rodeo) => {
      if (hasDateFilter || rodeo.inProgress) return true;
      const endTime = parseRodeoDate(rodeo.endDateRaw ?? rodeo.endDate)?.getTime();
      return !endTime || endTime >= today.getTime();
    })
    .sort((left, right) => {
      const leftTime = parseRodeoDate(left.startDateRaw ?? left.startDate)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const rightTime = parseRodeoDate(right.startDateRaw ?? right.startDate)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return leftTime - rightTime;
    });

  return (
    <div className="stack">
      <section className="app-card header-card results-list-header-card">
        <h1>Schedule</h1>
        <h2>Upcoming Rodeos</h2>
      </section>

      <div className="chip-row results-filter-row">
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </div>

      <div className="schedule-info-note">
        <CircleHelp size={16} />
        <p>Day sheets for “In Progress” rodeos can be viewed in Rodeo Results.</p>
      </div>

      {hasDateFilter && (
        <div className="active-date-filter-chip">
          <span>Current Range</span>
          <strong>{dateFilterText}</strong>
          <button aria-label="Clear date filter" onClick={() => setDateRange({ start: "", end: "" })}>
            <X size={15} />
          </button>
        </div>
      )}

      <div className="list-stack">
        {isInitialLoading ? (
          <LoadingState title="Loading schedule" />
        ) : state === "error" ? (
          <EmptyState title="Schedule Unavailable" subtitle="The live schedule feed could not be loaded." icon={Calendar} />
        ) : displayedRows.length > 0 ? (
          <>
            {displayedRows.map((rodeo, index) => (
              <div className="ad-list-item-group" key={rodeo.id}>
                {shouldShowListAd(index, 8, 20) && <GoogleAdSlot placement="scheduleListInline" />}
                <RodeoListCard rodeo={rodeo} mode="schedule" onOpen={() => onOpenRodeo(rodeo)} />
              </div>
            ))}
            {shouldShowBottomAd(displayedRows.length, 10) && <GoogleAdSlot placement="scheduleListInline" />}
            <button className="load-more-button" onClick={onLoadMore} disabled={isLoadingMore}>
              {isLoadingMore ? "Loading..." : "Load More"}
            </button>
          </>
        ) : (
          <EmptyState title="No Rodeos Found" subtitle="There are no upcoming rodeos for this feed." icon={Calendar} />
        )}
      </div>
    </div>
  );
}

function parseRodeoDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function displayRodeoDate(value?: string) {
  return formatDate(value) || "TBD";
}

function RodeoListCard({ rodeo, mode, onOpen }: { rodeo: RodeoRow; mode: "results" | "schedule"; onOpen: () => void }) {
  const startDate = displayRodeoDate(rodeo.startDateRaw ?? rodeo.startDate);
  const endDate = displayRodeoDate(rodeo.endDateRaw ?? rodeo.endDate);
  const dateText =
    startDate === "TBD" && endDate === "TBD"
      ? "Dates TBD"
      : startDate === endDate
        ? startDate
        : `${startDate} - ${endDate}`;
  const tags = [
    rodeo.hasDaysheets ? "Daysheets" : "",
    rodeo.inProgress ? "In Progress" : "",
    mode === "results" && rodeo.winners.length > 0 ? `${rodeo.winners.length} leaders` : ""
  ].filter(Boolean);

  return (
    <button className="app-card rodeo-card" onClick={onOpen}>
      <div className="rodeo-card-main">
        <h3>{rodeo.name}</h3>
        <p className="rodeo-card-subtitle">
          <span>{rodeo.location || "Location TBD"}</span>
          <i />
          <span>Added: {rodeo.payout || "$0"}</span>
        </p>
        {tags.length > 0 && (
          <div className="rodeo-card-tags">
            {tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        )}
        <div className="rodeo-card-date-row">
          <strong>{mode === "results" && !rodeo.inProgress ? `Ended ${endDate}` : dateText}</strong>
          {rodeo.inProgress && <em>In Progress</em>}
        </div>
      </div>
      <ChevronRight size={19} />
    </button>
  );
}

export function RodeoDetailView({
  rodeo,
  state,
  daysheetState,
  daysheets,
  event,
  setEvent,
  source,
  onBack
}: {
  rodeo: RodeoRow;
  state: LoadState;
  daysheetState: LoadState;
  daysheets: DaysheetRow[];
  event: EventName;
  setEvent: (event: EventName) => void;
  source: RodeoDetailSource;
  onBack: () => void;
}) {
  const canShowDaysheets = rodeo.hasDaysheets;
  const [view, setView] = useState<"results" | "daysheets">(() => {
    if (typeof window === "undefined" || !canShowDaysheets) return "results";
    return window.localStorage.getItem("rodeodaily.lastRodeoDetailView") === "daysheets" ? "daysheets" : "results";
  });
  const [showResultsHelp, setShowResultsHelp] = useState(false);
  const [selectedDaysheetId, setSelectedDaysheetId] = useState("");
  const selectedDaysheet = daysheets.find((daysheet) => daysheet.id === selectedDaysheetId) ?? daysheets[0];
  const [selectedDaysheetEvent, setSelectedDaysheetEvent] = useState("");

  useEffect(() => {
    if (!canShowDaysheets) {
      setView("results");
      return;
    }
    window.localStorage.setItem("rodeodaily.lastRodeoDetailView", view);
  }, [canShowDaysheets, view]);

  useEffect(() => {
    if (!selectedDaysheet) return;
    setSelectedDaysheetId((current) => (daysheets.some((daysheet) => daysheet.id === current) ? current : selectedDaysheet.id));
  }, [daysheets, selectedDaysheet]);

  useEffect(() => {
    if (!selectedDaysheet) return;
    setSelectedDaysheetEvent((current) =>
      selectedDaysheet.eventNames.includes(current) ? current : selectedDaysheet.eventNames[0] ?? ""
    );
  }, [selectedDaysheet]);

  const dateRange =
    rodeo.startDate && rodeo.startDate !== rodeo.endDate
      ? `${displayRodeoDate(rodeo.startDateRaw ?? rodeo.startDate)} - ${displayRodeoDate(rodeo.endDateRaw ?? rodeo.endDate)}`
      : displayRodeoDate(rodeo.endDateRaw ?? rodeo.startDateRaw ?? (rodeo.endDate || rodeo.startDate));

  if (source === "schedule") {
    return (
      <div className="stack schedule-detail-view">
        <section className="app-card schedule-detail-hero">
          <button onClick={onBack}>
            <ArrowLeft size={16} />
            Back
          </button>
          <div className="schedule-detail-title">
            <div>
              <h2>{rodeo.name}</h2>
              <p>
                {rodeo.location}
                <span />
                {dateRange}
              </p>
            </div>
            {rodeo.inProgress && <em>In Progress</em>}
          </div>
          <div className="schedule-detail-money">
            <span>Added Money</span>
            <strong>{rodeo.payout}</strong>
          </div>
        </section>

        <section className="app-card detail-section venue-section schedule-venue-card">
          <div className="section-title-row">
            <div>
              <span>Venue</span>
              <h3>{rodeo.venueName || "Venue not listed"}</h3>
            </div>
            {rodeo.websiteUrl && (
              <a href={rodeo.websiteUrl} target="_blank" rel="noreferrer" aria-label="Open rodeo website">
                <ExternalLink size={18} />
              </a>
            )}
          </div>
          <p>{rodeo.location}</p>
        </section>

        <section className="app-card detail-section schedule-daysheet-card">
          <div className="section-title-row">
            <div>
              <span>Daysheets</span>
              <h3>{rodeo.hasDaysheets ? "Draw" : "Not Posted"}</h3>
            </div>
          </div>
          {daysheetState === "loading" ? (
            <LoadingState title="Loading daysheets" />
          ) : daysheetState === "error" ? (
            <EmptyState title="Daysheets Unavailable" subtitle="Unable to load daysheets right now." icon={Calendar} />
          ) : rodeo.hasDaysheets && daysheets.length > 0 && selectedDaysheet ? (
            <DaysheetViewer
              daysheets={daysheets}
              selectedDaysheet={selectedDaysheet}
              selectedEvent={selectedDaysheetEvent}
              setSelectedDaysheetId={setSelectedDaysheetId}
              setSelectedEvent={setSelectedDaysheetEvent}
            />
          ) : rodeo.hasDaysheets ? (
            <EmptyState title="No Daysheets Returned" subtitle="No daysheets were returned yet for this rodeo." icon={Calendar} />
          ) : (
            <EmptyState title="No Daysheets" subtitle="This rodeo has not posted daysheets in the feed." icon={Calendar} />
          )}
        </section>

        {rodeo.websiteUrl && (
          <a className="schedule-website-link" href={rodeo.websiteUrl} target="_blank" rel="noreferrer">
            <ExternalLink size={17} />
            Open Rodeo Website
          </a>
        )}

        <GoogleAdSlot placement="scheduleDetailBottom" />
      </div>
    );
  }

  return (
    <div className="stack">
      <section className="app-card detail-screen-header results-detail-header">
        <button onClick={onBack}>
          <ArrowLeft size={16} />
          Back
        </button>
        <div>
          <span>{event}</span>
          <h2>{rodeo.name}</h2>
          <p>{rodeo.location}</p>
        </div>
        <button
          className="detail-help-button"
          aria-label="Bracket results help"
          onClick={() => setShowResultsHelp((show) => !show)}
          type="button"
        >
          <CircleHelp size={18} />
        </button>
      </section>

      <div className="result-event-filter" aria-label="Select Results Event">
        <span>Event</span>
        <div>
          {events.map((option) => (
            <button className={event === option ? "active" : undefined} key={option} onClick={() => setEvent(option)}>
              {option}
            </button>
          ))}
        </div>
      </div>

      {canShowDaysheets && (
        <div className="detail-view-picker" aria-label="Show results or daysheets">
          <span>View</span>
          <div>
            <button className={view === "results" ? "active" : undefined} onClick={() => setView("results")}>
              Results
            </button>
            <button className={view === "daysheets" ? "active" : undefined} onClick={() => setView("daysheets")}>
              Daysheets
            </button>
          </div>
        </div>
      )}

      {view === "results" ? (
        <section className="detail-results-section">
          {showResultsHelp && (
            <div className="detail-help-note">
              <strong>Important</strong>
              <p>
                For rodeos with bracket formats, multiple athletes may show the same place and payoff within a round. The feed
                groups those bracket winners together under the selected event.
              </p>
            </div>
          )}
          {state === "loading" ? (
            <LoadingState title="Loading results" />
          ) : state === "error" ? (
            <EmptyState title="Results Unavailable" subtitle="This rodeo detail feed could not be loaded." icon={CircleDollarSign} />
          ) : rodeo.resultRounds.length > 0 ? (
            <ResultRoundsList event={event} rounds={rodeo.resultRounds} />
          ) : rodeo.winners.length > 0 ? (
            <div className="app-card result-round-card">
              <div className="result-round-title">
                <strong>Results</strong>
                <span>{event === "Team Roping" ? "Time" : "Result"}</span>
                <span>Earnings</span>
              </div>
              {rodeo.winners.map(([place, name, score]) => (
                <div className="result-winner-row" key={`${place}-${name}-${score}`}>
                  <span>{place}</span>
                  <div className="result-athlete-identity">
                    <strong>{name}</strong>
                  </div>
                  <em>{score}</em>
                  <p>-</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No Leaders Posted" subtitle="No leaders are available for this event yet." icon={CircleDollarSign} />
          )}
        </section>
      ) : (
        <section className="app-card detail-section">
          <div className="section-title-row">
            <div>
              <span>Daysheets</span>
              <h3>{rodeo.hasDaysheets ? "Draw" : "Not Posted"}</h3>
            </div>
          </div>
          {daysheetState === "loading" ? (
            <LoadingState title="Loading daysheets" />
          ) : daysheetState === "error" ? (
            <EmptyState title="Daysheets Unavailable" subtitle="Unable to load daysheets right now." icon={Calendar} />
          ) : rodeo.hasDaysheets && daysheets.length > 0 && selectedDaysheet ? (
            <DaysheetViewer
              daysheets={daysheets}
              selectedDaysheet={selectedDaysheet}
              selectedEvent={selectedDaysheetEvent}
              setSelectedDaysheetId={setSelectedDaysheetId}
              setSelectedEvent={setSelectedDaysheetEvent}
            />
          ) : rodeo.hasDaysheets ? (
            <EmptyState title="No Daysheets Returned" subtitle="No daysheets were returned yet for this rodeo." icon={Calendar} />
          ) : (
            <EmptyState title="No Daysheets" subtitle="This rodeo has not posted daysheets in the feed." icon={Calendar} />
          )}
        </section>
      )}

      <GoogleAdSlot placement="resultsDetailSection" />
    </div>
  );
}

function ResultRoundsList({ event, rounds }: { event: EventName; rounds: RodeoResultRound[] }) {
  const isTeamRoping = event === "Team Roping";

  return (
    <div className="result-round-list">
      {rounds.map((round) => (
        <section className="app-card result-round-card" key={round.id}>
          <div className="result-round-title">
            <strong>{round.label}</strong>
            <span>{isTeamRoping ? "Time" : "Result"}</span>
            <span>Earnings</span>
          </div>
          <div className="result-round-rows">
            {isTeamRoping ? (
              teamRopingRows(round.rows).map((team) => <TeamRopingResultRow key={team.id} team={team} />)
            ) : (
              round.rows.map((row) => <RodeoResultWinnerRow key={row.id} row={row} />)
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

function RodeoResultWinnerRow({ row }: { row: RodeoResultRow }) {
  return (
    <div className="result-winner-row">
      <span>{row.place}</span>
      <AthleteResultIdentity row={row} />
      <em>{row.value}</em>
      <p>{row.payoff}</p>
    </div>
  );
}

type TeamRopingResult = {
  id: string;
  place: string;
  header: RodeoResultRow;
  heeler: RodeoResultRow;
  value: string;
  payoff: string;
};

function TeamRopingResultRow({ team }: { team: TeamRopingResult }) {
  return (
    <div className="result-team-row">
      <span>{team.place}</span>
      <div className="result-team-members">
        <AthleteResultIdentity label="Header" row={team.header} />
        <AthleteResultIdentity label="Heeler" row={team.heeler} />
      </div>
      <em>{team.value}</em>
      <p>{team.payoff}</p>
    </div>
  );
}

function AthleteResultIdentity({ row, label }: { row: RodeoResultRow; label?: string }) {
  const content = (
    <>
      <ResultAthleteAvatar row={row} />
      <div>
        {label && <span>{label}</span>}
        <strong>{row.name}</strong>
        {row.hometown && <small>{row.hometown}</small>}
      </div>
    </>
  );

  if (!row.contestantId) {
    return <div className="result-athlete-identity">{content}</div>;
  }

  return (
    <a className="result-athlete-identity" href={`/athletes/${row.contestantId}`}>
      {content}
    </a>
  );
}

function ResultAthleteAvatar({ row }: { row: RodeoResultRow }) {
  const hasImage = Boolean(row.imageUrl);
  return (
    <Image
      alt=""
      className={hasImage ? undefined : "athlete-placeholder-image"}
      src={row.imageUrl || athletePlaceholderImage}
      width={38}
      height={38}
      sizes="38px"
    />
  );
}

function teamRopingRows(rows: RodeoResultRow[]) {
  const byTeam = new Map<string, RodeoResultRow[]>();

  rows.forEach((row, index) => {
    const key = row.teamId ? String(row.teamId) : `${row.place}-${row.value}-${Math.floor(index / 2)}`;
    byTeam.set(key, [...(byTeam.get(key) ?? []), row]);
  });

  return [...byTeam.entries()].flatMap(([id, teamRows]) => {
    if (teamRows.length < 2) return [];
    return [
      {
        id,
        place: teamRows[0].place,
        header: teamRows[0],
        heeler: teamRows[1],
        value: teamRows[0].value,
        payoff: teamRows[0].payoff
      }
    ];
  });
}

export function MoreView({
  section,
  setSection,
  onOpenListing,
  favoriteAthletes,
  followedCount,
  scheduleRows,
  businessJournalRows,
  businessJournalState,
  pastChampions,
  pastChampionsState,
  nfrEvent,
  setNfrEvent,
  nfrStandings,
  nfrState,
  athleteSearchText,
  setAthleteSearchText,
  athleteSearchRows,
  athleteSearchState,
  appSettings,
  updateAppSettings,
  updateAdConsent,
  onToggleFavoriteAthlete,
  onMoveFavoriteAthlete,
  onOpenAthlete
}: {
  section: MoreSection;
  setSection: (section: MoreSection) => void;
  onOpenListing: (listing: BusinessJournalRow) => void;
  favoriteAthletes: SavedAthlete[];
  followedCount: number;
  scheduleRows: RodeoRow[];
  businessJournalRows: BusinessJournalRow[];
  businessJournalState: LoadState;
  pastChampions: PastChampion[];
  pastChampionsState: LoadState;
  nfrEvent: EventName;
  setNfrEvent: (event: EventName) => void;
  nfrStandings: NfrContestant[];
  nfrState: LoadState;
  athleteSearchText: string;
  setAthleteSearchText: (value: string) => void;
  athleteSearchRows: AthleteSearchRow[];
  athleteSearchState: LoadState;
  appSettings: AppSettings;
  updateAppSettings: (settings: Partial<AppSettings>) => void;
  updateAdConsent: (consent: AppSettings["adConsent"]) => void;
  onToggleFavoriteAthlete: (athlete: StandingRow) => void;
  onMoveFavoriteAthlete: (athleteId: number, direction: "up" | "down") => void;
  onOpenAthlete: (athlete: StandingRow) => void;
}) {
  if (section === "favorites") {
    return (
      <SubViewShell title="Favorite Athletes" onBack={() => setSection("menu")}>
        <FavoriteAthletesView
          favoriteAthletes={favoriteAthletes}
          searchText={athleteSearchText}
          setSearchText={setAthleteSearchText}
          searchRows={athleteSearchRows}
          searchState={athleteSearchState}
          onToggleFavoriteAthlete={onToggleFavoriteAthlete}
          onMoveFavoriteAthlete={onMoveFavoriteAthlete}
          onOpenAthlete={onOpenAthlete}
        />
      </SubViewShell>
    );
  }

  if (section === "listings") {
    return (
      <SubViewShell title="Rodeo Listings" onBack={() => setSection("menu")}>
        <BusinessJournalListingsView
          rows={businessJournalRows}
          state={businessJournalState}
          fallbackRows={scheduleRows}
          onOpenListing={onOpenListing}
        />
      </SubViewShell>
    );
  }

  if (section === "nfr") {
    return (
      <SubViewShell title="NFR" onBack={() => setSection("menu")}>
        <NfrStandingsView event={nfrEvent} setEvent={setNfrEvent} rows={nfrStandings} state={nfrState} />
      </SubViewShell>
    );
  }

  if (section === "champions") {
    return (
      <SubViewShell title="Past World Champions" onBack={() => setSection("menu")}>
        <PastChampionsView champions={pastChampions} state={pastChampionsState} />
      </SubViewShell>
    );
  }

  if (section === "settings") {
    return (
      <SubViewShell title="Settings" onBack={() => setSection("menu")}>
        <SettingsView
          settings={appSettings}
          updateSettings={updateAppSettings}
          updateAdConsent={updateAdConsent}
          favoriteCount={favoriteAthletes.length}
        />
      </SubViewShell>
    );
  }

  return (
    <div className="stack">
      <section className="app-card header-card more-header-card">
        <h1>More Features</h1>
      </section>

      <div className="list-stack">
        {moreItems.map((item) => {
          const Icon = item.icon;
          return (
            <button className="app-card more-row" key={item.title} onClick={() => setSection(item.id)}>
              <Icon size={21} />
              <div>
                <h3>{item.title}</h3>
                <p>{item.subtitle}</p>
              </div>
              <ChevronRight size={17} />
            </button>
          );
        })}
        <a className="app-card more-row more-app-store-row" href={iosAppStoreUrl} target="_blank" rel="noreferrer">
          <Image src="/app-store-badge.svg" alt="Download on the App Store" width={120} height={40} />
          <div>
            <h3>Rodeo Daily for iOS</h3>
            <p>Download on your iOS device</p>
          </div>
          <ExternalLink size={17} />
        </a>
      </div>
    </div>
  );
}

function NfrStandingsView({
  event,
  setEvent,
  rows,
  state
}: {
  event: EventName;
  setEvent: (event: EventName) => void;
  rows: NfrContestant[];
  state: LoadState;
}) {
  const [sort, setSort] = useState("Average");
  const sortedRows = [...rows].sort((left, right) => {
    if (sort === "World Standings") {
      return left.worldPlace === right.worldPlace ? left.averagePlace - right.averagePlace : left.worldPlace - right.worldPlace;
    }
    return left.averagePlace === right.averagePlace ? left.worldPlace - right.worldPlace : left.averagePlace - right.averagePlace;
  });
  const currentRound = sortedRows[0]?.currentRound;

  return (
    <div className="nfr-view">
      <section className="app-card nfr-header-card">
        <div className="nfr-header-main">
          <div>
            <h2>NFR</h2>
            <p>{event}</p>
          </div>
          <div className="nfr-header-actions">
            <SelectChip label="Event" value={event} options={nfrEvents} onChange={(value) => setEvent(value as EventName)} />
            <SelectChip label="Sort" value={sort} options={["Average", "World Standings"]} onChange={setSort} />
          </div>
        </div>
        <div className="nfr-status-line">
          {currentRound ? <span>Current through Round {currentRound}</span> : null}
          <span>Sorted by {sort}</span>
        </div>
      </section>

      {state === "loading" ? (
        <LoadingState title="Loading NFR standings" />
      ) : state === "error" ? (
        <EmptyState title="NFR Standings Unavailable" subtitle="The NFR standings feed could not be loaded." icon={Trophy} />
      ) : sortedRows.length > 0 ? (
        <div className="nfr-card-list">
          {sortedRows.map((contestant) => (
            <article className="app-card nfr-contestant-card" key={contestant.id}>
              <div className="nfr-contestant-main">
                <span className="nfr-world-place">{contestant.worldPlace || "-"}</span>
                <div>
                  <h3>{contestant.name}</h3>
                  <p>{contestant.averageDisplayValue}</p>
                </div>
              </div>
              <div className="nfr-card-divider" />
              <div className="nfr-round-columns">
                {[contestant.rounds.slice(0, 5), contestant.rounds.slice(5)].map((rounds, index) => (
                  <div className="nfr-round-column" key={index}>
                    {rounds.map((round) => (
                      <div className={round.pending ? "nfr-round pending" : "nfr-round"} key={round.round}>
                        <span>Round {round.round}</span>
                        <strong>{round.displayValue}</strong>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="No NFR Standings Found" subtitle="Check back once rankings are posted for this event." icon={Trophy} />
      )}
    </div>
  );
}

function SettingsView({
  settings,
  updateSettings,
  updateAdConsent,
  favoriteCount
}: {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  updateAdConsent: (consent: AppSettings["adConsent"]) => void;
  favoriteCount: number;
}) {
  return (
    <div className="settings-grid">
      <section className="settings-form-section">
        <h3>General</h3>
        <div className="app-card settings-form-card">
          <div className="settings-navigation-row">
            <ListOrdered size={19} />
            <div>
              <strong>Favorite Events</strong>
              <span>
                Standings: {settings.favoriteStandingsEvent} - Results: {settings.favoriteResultsEvent}
              </span>
            </div>
          </div>
          <div className="settings-inline-controls">
            <label className="settings-select-row">
              <span>Standings</span>
              <select
                value={settings.favoriteStandingsEvent}
                onChange={(event) => updateSettings({ favoriteStandingsEvent: event.target.value as EventName })}
              >
                {events.map((event) => (
                  <option key={event} value={event}>
                    {event}
                  </option>
                ))}
              </select>
            </label>
            <label className="settings-select-row">
              <span>Results</span>
              <select
                value={settings.favoriteResultsEvent}
                onChange={(event) => updateSettings({ favoriteResultsEvent: event.target.value as EventName })}
              >
                {events.map((event) => (
                  <option key={event} value={event}>
                    {event}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="settings-navigation-row">
            <Users size={19} />
            <div>
              <strong>Favorite Athletes</strong>
              <span>{favoriteCount} saved in this browser</span>
            </div>
            <ChevronRight size={17} />
          </div>
        </div>
      </section>

      <section className="settings-form-section">
        <h3>Appearance</h3>
        <div className="app-card settings-form-card">
          <div className="settings-navigation-row">
            <MonitorSmartphone size={19} />
            <div>
              <strong>Display Mode</strong>
              <span>Use light mode, dark mode, or match this device.</span>
            </div>
          </div>
          <div className="appearance-choice-grid">
            {[
              { label: "Light Mode", value: "light", icon: Sun },
              { label: "Dark Mode", value: "dark", icon: Moon },
              { label: "Device", value: "device", icon: MonitorSmartphone }
            ].map((option) => {
              const Icon = option.icon;
              return (
                <button
                  className={settings.appearanceMode === option.value ? "appearance-choice active" : "appearance-choice"}
                  key={option.value}
                  onClick={() => updateSettings({ appearanceMode: option.value as AppSettings["appearanceMode"] })}
                >
                  <Icon size={17} />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="settings-form-section">
        <h3>Privacy</h3>
        <div className="app-card settings-form-card">
          <div className="settings-navigation-row">
            <ShieldCheck size={19} />
            <div>
              <strong>Ads & Privacy</strong>
              <span>Choose ad cookies on this device or read the full privacy policy.</span>
            </div>
            <a href="/privacy" aria-label="Open privacy policy">
              <ExternalLink size={16} />
            </a>
          </div>
          <div className="settings-navigation-row">
            <CircleHelp size={19} />
            <div>
              <strong>Support & Privacy Requests</strong>
              <span>Get help, report issues, or contact support about privacy questions.</span>
            </div>
            <a href="/support" aria-label="Open support page">
              <ExternalLink size={16} />
            </a>
          </div>
          <div className="consent-choice-grid">
            <button
              className={settings.adConsent === "personalized" ? "consent-choice active" : "consent-choice"}
              onClick={() => updateAdConsent("personalized")}
            >
              Personalized Ads
            </button>
            <button
              className={settings.adConsent === "nonPersonalized" ? "consent-choice active" : "consent-choice"}
              onClick={() => updateAdConsent("nonPersonalized")}
            >
              Basic Ads
            </button>
            <button
              className={settings.adConsent === "declined" ? "consent-choice active" : "consent-choice"}
              onClick={() => updateAdConsent("declined")}
            >
              Decline Ads
            </button>
          </div>
        </div>
      </section>

      <section className="settings-form-section">
        <h3>About</h3>
        <div className="app-card settings-form-card settings-link-list">
          <a href="/support">
            <CircleHelp size={17} />
            <span>App Support</span>
            <ChevronRight size={16} />
          </a>
          <a href="/privacy">
            <ShieldCheck size={17} />
            <span>Privacy Policy</span>
            <ChevronRight size={16} />
          </a>
          <a href="mailto:thewaymediaco@gmail.com">
            <Mail size={17} />
            <span>Submit Feedback</span>
            <ChevronRight size={16} />
          </a>
          <a href="https://prorodeo.com" target="_blank" rel="noreferrer">
            <ExternalLink size={17} />
            <span>PRCA Results & Standings Data</span>
            <ChevronRight size={16} />
          </a>
          <a href="https://wpra.com" target="_blank" rel="noreferrer">
            <ExternalLink size={17} />
            <span>WPRA Barrel Racing & Breakaway Data</span>
            <ChevronRight size={16} />
          </a>
          <a href="https://iconscout.com/icons/cowboy" target="_blank" rel="noreferrer">
            <ExternalLink size={17} />
            <span>Cowboy Icon Credit</span>
            <ChevronRight size={16} />
          </a>
        </div>
      </section>
    </div>
  );
}

function FavoriteAthletesView({
  favoriteAthletes,
  searchText,
  setSearchText,
  searchRows,
  searchState,
  onToggleFavoriteAthlete,
  onMoveFavoriteAthlete,
  onOpenAthlete
}: {
  favoriteAthletes: SavedAthlete[];
  searchText: string;
  setSearchText: (value: string) => void;
  searchRows: AthleteSearchRow[];
  searchState: LoadState;
  onToggleFavoriteAthlete: (athlete: StandingRow) => void;
  onMoveFavoriteAthlete: (athleteId: number, direction: "up" | "down") => void;
  onOpenAthlete: (athlete: StandingRow) => void;
}) {
  const favoriteIds = new Set(favoriteAthletes.map((athlete) => athlete.id));
  const visibleSearchRows = searchRows.map((athlete) => ({ ...athlete, favorite: favoriteIds.has(athlete.id) || athlete.favorite }));

  return (
    <div className="favorite-athletes-view">
      <section className="app-card favorite-athlete-header">
        <div>
          <h2>Favorite Athletes</h2>
          <strong>{favoriteAthletes.length} athletes</strong>
          <span>Open an athlete to view bio, results, and follow updates.</span>
          <span>Search below to add athletes to your favorites list.</span>
        </div>
        <label className="listing-search">
          <Search size={16} />
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search athletes to add"
          />
          {searchText && (
            <button type="button" aria-label="Clear athlete search" onClick={() => setSearchText("")}>
              <X size={15} />
            </button>
          )}
        </label>
      </section>

      {searchText.trim().length >= 2 && (
        <section className="app-card athlete-search-results">
          <span>Tap an athlete to add to favorites</span>
          {searchState === "loading" ? (
            <LoadingState title="Searching athletes" />
          ) : searchState === "error" ? (
            <EmptyState title="Search Unavailable" subtitle="Athlete search could not be loaded." icon={Users} />
          ) : visibleSearchRows.length > 0 ? (
            visibleSearchRows.map((athlete) => (
              <AthleteSearchResultRow
                athlete={athlete}
                key={athlete.id}
                onOpen={() => onOpenAthlete(athleteSearchToStandingRow(athlete))}
                onToggleFavorite={() => onToggleFavoriteAthlete(athleteSearchToStandingRow(athlete))}
              />
            ))
          ) : (
            <EmptyState title="No Athletes Found" subtitle="Try a different athlete name." icon={Users} />
          )}
        </section>
      )}

      {favoriteAthletes.length > 0 ? (
        <div className="list-stack">
          {favoriteAthletes.map((athlete, index) => {
            const row = savedAthleteToStandingRow(athlete);
            return (
              <article className="app-card favorite-athlete-row" key={athlete.id}>
                <button className="favorite-athlete-main" onClick={() => onOpenAthlete(row)}>
                  <div>
                    <h3>{athlete.name}</h3>
                    <p>{athlete.metric ? `${athlete.metricLabel}: ${athlete.metric}` : athlete.hometown || "Open profile"}</p>
                    <span>{athlete.hometown || "No hometown listed"}</span>
                  </div>
                  <AthleteAvatar athlete={athlete} size="small" />
                </button>
                <div className="favorite-athlete-actions">
                  <button
                    aria-label={`Move ${athlete.name} up`}
                    disabled={index === 0}
                    onClick={() => onMoveFavoriteAthlete(athlete.id, "up")}
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    aria-label={`Move ${athlete.name} down`}
                    disabled={index === favoriteAthletes.length - 1}
                    onClick={() => onMoveFavoriteAthlete(athlete.id, "down")}
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button aria-label="Remove favorite athlete" onClick={() => onToggleFavoriteAthlete(row)}>
                    <Star size={17} fill="currentColor" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No Favorite Athletes" subtitle="Search above or tap the star on a standings athlete to save them here." icon={Star} />
      )}
    </div>
  );
}

function AthleteSearchResultRow({
  athlete,
  onOpen,
  onToggleFavorite
}: {
  athlete: AthleteSearchRow;
  onOpen: () => void;
  onToggleFavorite: () => void;
}) {
  return (
    <div className="athlete-search-row">
      <button onClick={onOpen}>
        <AthleteAvatar athlete={athlete} size="small" />
        <div>
          <strong>{athlete.name}</strong>
          <span>{athlete.hometown || "No hometown listed"}</span>
        </div>
      </button>
      <button aria-label={athlete.favorite ? "Remove favorite athlete" : "Favorite athlete"} onClick={onToggleFavorite}>
        <Star size={17} fill={athlete.favorite ? "currentColor" : "none"} />
      </button>
    </div>
  );
}

function savedAthleteToStandingRow(athlete: SavedAthlete): StandingRow {
  return {
    ...athlete,
    place: 0,
    followed: false,
    favorite: true
  };
}

function athleteSearchToStandingRow(athlete: AthleteSearchRow): StandingRow {
  return {
    ...athlete,
    place: 0,
    followed: false
  };
}

function PastChampionsView({ champions, state }: { champions: PastChampion[]; state: LoadState }) {
  const [query, setQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("All Events");
  const events = championEvents(champions);
  const visibleChampions = filterChampions(champions, selectedEvent, query);
  const groupedByYear = Array.from(
    visibleChampions.reduce((groups, champion) => {
      const current = groups.get(champion.year) ?? [];
      groups.set(champion.year, [...current, champion]);
      return groups;
    }, new Map<number, PastChampion[]>())
  ).sort((left, right) => right[0] - left[0]);
  const topCounts = selectedEvent === "All Events" ? [] : topChampionCounts(champions, selectedEvent);

  return (
    <div className="past-champions-view">
      <section className="app-card champion-filter-card">
        <label className="listing-search">
          <Search size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search champions" />
          {query && (
            <button type="button" aria-label="Clear champion search" onClick={() => setQuery("")}>
              <X size={15} />
            </button>
          )}
        </label>
        <SelectChip label="Event" value={selectedEvent} options={events} onChange={setSelectedEvent} />
      </section>

      {topCounts.length > 0 && (
        <section className="app-card top-champions-card">
          <span>Most World Titles</span>
          {topCounts.map((item) => (
            <div key={item.name}>
              <strong>{item.name}</strong>
              <em>
                {item.titles} title{item.titles === 1 ? "" : "s"}
              </em>
            </div>
          ))}
        </section>
      )}

      {state === "loading" && champions.length === 0 ? (
        <LoadingState title="Loading champions" />
      ) : state === "error" && champions.length === 0 ? (
        <EmptyState title="Champions Unavailable" subtitle="The past champions feed could not be loaded." icon={Trophy} />
      ) : visibleChampions.length > 0 ? (
        <div className="champion-year-list">
          {selectedEvent === "All Events"
            ? groupedByYear.map(([year, yearChampions], index) => (
                <div className="ad-list-item-group" key={year}>
                  {shouldShowListAd(index, 2, 4) && <GoogleAdSlot placement="pastChampionsList" />}
                  <section className="champion-year-group">
                    <h3>{year}</h3>
                    <div className="list-stack">
                      {yearChampions.map((champion) => (
                        <ChampionRow champion={champion} key={champion.id} showEvent />
                      ))}
                    </div>
                  </section>
                </div>
              ))
            : visibleChampions.map((champion, index) => (
                <div className="ad-list-item-group" key={champion.id}>
                  {shouldShowListAd(index, 10, 12) && <GoogleAdSlot placement="pastChampionsList" />}
                  <ChampionRow champion={champion} showEvent={false} />
                </div>
              ))}
          {shouldShowBottomAd(visibleChampions.length, 10) && <GoogleAdSlot placement="pastChampionsList" />}
        </div>
      ) : (
        <EmptyState title="No Champions Found" subtitle="Try changing search or event filters." icon={Trophy} />
      )}
    </div>
  );
}

function ChampionRow({ champion, showEvent }: { champion: PastChampion; showEvent: boolean }) {
  return (
    <article className={showEvent ? "app-card champion-row champion-row-grouped" : "app-card champion-row"}>
      <div>
        <h3>{champion.athlete}</h3>
        <p>{[showEvent ? champion.event : "", champion.hometown].filter(Boolean).join(" - ")}</p>
      </div>
      {!showEvent && <span>{champion.year}</span>}
    </article>
  );
}

function BusinessJournalListingsView({
  rows,
  state,
  fallbackRows,
  onOpenListing
}: {
  rows: BusinessJournalRow[];
  state: LoadState;
  fallbackRows: RodeoRow[];
  onOpenListing: (listing: BusinessJournalRow) => void;
}) {
  const [query, setQuery] = useState("");
  const [sortOption, setSortOption] = useState("Event Date (Soonest)");
  const [dateMode, setDateMode] = useState("All Dates");
  const [range, setRange] = useState<DateRange>({ start: "", end: "" });
  const sourceRows = rows.length > 0 ? rows : fallbackRows.map(mapScheduleToBusinessJournalRow);

  const visibleRows = sourceRows
    .filter((item) => businessJournalMatchesSearch(item, query))
    .filter((item) => businessJournalMatchesDate(item, dateMode, range))
    .sort((left, right) => sortBusinessJournalRows(left, right, sortOption));

  return (
    <div className="business-journal-view">
      <section className="app-card listing-disclaimer">
        <Newspaper size={20} />
        <div>
          <strong>Business Journal Listings</strong>
          <p>Listings shown here are unofficial and may be incomplete or delayed.</p>
          <a href="https://pbj.prorodeo.org/" target="_blank" rel="noreferrer">
            Official PRCA Business Journal Listings <ExternalLink size={14} />
          </a>
        </div>
      </section>

      <label className="listing-search">
        <Search size={16} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search listings..." />
        {query && (
          <button type="button" aria-label="Clear listing search" onClick={() => setQuery("")}>
            <X size={15} />
          </button>
        )}
      </label>

      <div className="chip-row">
        <SelectChip
          label="Sort"
          value={sortOption}
          options={["Event Date (Soonest)", "Event Date (Latest)", "Added Money (High-Low)", "Added Money (Low-High)"]}
          onChange={setSortOption}
        />
        <SelectChip label="Date Filter" value={dateMode} options={["All Dates", "Date Range"]} onChange={setDateMode} />
        {dateMode === "Date Range" && <DateRangeFilter value={range} onChange={setRange} />}
      </div>

      <div className="list-stack">
        {state === "loading" && rows.length === 0 ? (
          <LoadingState title="Loading listings" />
        ) : state === "error" && rows.length === 0 && fallbackRows.length === 0 ? (
          <EmptyState title="Listings Unavailable" subtitle="The Business Journal feed could not be loaded." icon={Newspaper} />
        ) : visibleRows.length > 0 ? (
          <>
            {visibleRows.map((item, index) => (
              <div className="ad-list-item-group" key={item.id}>
                {shouldShowListAd(index) && <GoogleAdSlot placement="rodeoListingsList" />}
                <button className="app-card business-listing-card" onClick={() => onOpenListing(item)}>
                  <div className="listing-card-title">
                    <h3>{item.title}</h3>
                    {item.subtitle && <p>{item.subtitle}</p>}
                  </div>
                  <div className="listing-badges">
                    {item.source && <span>{item.source}</span>}
                    {item.dateText && (
                      <em>
                        <Calendar size={13} /> {item.dateText}
                      </em>
                    )}
                    {item.locationText && (
                      <em>
                        <MapPin size={13} /> {item.locationText}
                      </em>
                    )}
                  </div>
                  {(item.entryWindowText || item.perfsText) && (
                    <div className="listing-badges listing-secondary-badges">
                      {item.entryWindowText && <em>{item.entryWindowText}</em>}
                      {item.perfsText && <em>{item.perfsText}</em>}
                    </div>
                  )}
                  {item.eventsText && <p className="listing-events">{item.eventsText}</p>}
                  {item.specialEntryFeesText && (
                    <p className="listing-fees">
                      <strong>Special Entry Fees: </strong>
                      {item.specialEntryFeesText}
                    </p>
                  )}
                  <ChevronRight size={18} />
                </button>
              </div>
            ))}
            {shouldShowBottomAd(visibleRows.length) && <GoogleAdSlot placement="rodeoListingsList" />}
          </>
        ) : (
          <EmptyState title="No Rodeos" subtitle="There are no matching rodeos right now." icon={Newspaper} />
        )}
      </div>
    </div>
  );
}

export function BusinessJournalListingDetailView({ item, onBack }: { item: BusinessJournalRow; onBack: () => void }) {
  const publishDate = item.detailFields.find((field) => field.label.toLowerCase().includes("publish date"))?.value;
  const detailFields = item.detailFields
    .filter((field) => !["Publish Date", "Rodeo Name"].includes(field.label))
    .sort((left, right) => listingDetailFieldOrder(left.label) - listingDetailFieldOrder(right.label) || left.label.localeCompare(right.label));

  return (
    <div className="business-listing-detail">
      <section className="app-card detail-screen-header">
        <button onClick={onBack}>
          <ArrowLeft size={16} />
          Back
        </button>
        <div>
          <span>Rodeo</span>
          <h2>{item.title}</h2>
          {item.dateText && <p>{item.dateText}</p>}
        </div>
      </section>

      {publishDate && <p className="listing-publish-date">Publish Date: {publishDate}</p>}

      <section className="listing-detail-header">
        <h1>{item.title}</h1>
        {item.dateText && <strong>{item.dateText}</strong>}
        {item.subtitle && <p>{item.subtitle}</p>}
        <div className="listing-badges">
          {item.source && <span>{item.source}</span>}
          {item.locationText && (
            <em>
              <MapPin size={13} /> {item.locationText}
            </em>
          )}
        </div>
      </section>

      <section className="app-card detail-section listing-detail-card">
        <div className="listing-detail-lines">
          {detailFields.length > 0 ? (
            detailFields.map((field) => (
              <p key={field.id}>
                <strong>{field.label}: </strong>
                {field.value}
              </p>
            ))
          ) : (
            <EmptyState title="No Listing Details" subtitle="No additional listing details were included." icon={Newspaper} />
          )}
        </div>
        {item.link && (
          <a className="listing-full-link" href={item.link} target="_blank" rel="noreferrer">
            <ExternalLink size={16} />
            Open Full Listing
          </a>
        )}
      </section>
    </div>
  );
}

function listingDetailFieldOrder(label: string) {
  const normalized = label.toLowerCase().replace(/\s+/g, "_");
  const order = ["arena", "address", "perfs", "slacks", "events", "special_entry_fees", "permits", "ground_rules", "stock", "eo", "ec"];
  const index = order.findIndex((token) => normalized.includes(token));
  return index === -1 ? order.length : index;
}

function DaysheetViewer({
  daysheets,
  selectedDaysheet,
  selectedEvent,
  setSelectedDaysheetId,
  setSelectedEvent
}: {
  daysheets: DaysheetRow[];
  selectedDaysheet: DaysheetRow;
  selectedEvent: string;
  setSelectedDaysheetId: (id: string) => void;
  setSelectedEvent: (event: string) => void;
}) {
  const eventGroup = selectedDaysheet.eventsByName[selectedEvent];
  const entries = makeDaysheetDisplayRows(eventGroup?.Events ?? []);
  const rerides = [...(eventGroup?.Rerides ?? [])].sort((left, right) => (left.RerideNumber ?? 9999) - (right.RerideNumber ?? 9999));

  return (
    <div className="daysheet-viewer">
      <div className="daysheet-summary">
        <strong>{selectedDaysheet.roundDisplay || "Daysheet"}</strong>
        <span>{selectedDaysheet.startDisplay}</span>
      </div>

      <div className="daysheet-controls">
        <SelectChip
          label="Performance"
          value={selectedDaysheet.id}
          options={daysheets.map((daysheet) => daysheet.id)}
          optionLabels={Object.fromEntries(daysheets.map((daysheet) => [daysheet.id, `${daysheet.roundDisplay} - ${daysheet.startDisplay}`]))}
          onChange={setSelectedDaysheetId}
        />
        <SelectChip
          label="Event"
          value={selectedEvent}
          options={selectedDaysheet.eventNames}
          onChange={setSelectedEvent}
        />
      </div>

      <section className="daysheet-list-section">
        <h4>{selectedEvent || "Entries"}</h4>
        <div className="draw-list">
          {entries.length > 0 ? (
            entries.map((row) => (
              <div className={row.entry.HasTurnout ? "draw-row turnout" : "draw-row"} key={row.entry.EventEntryId ?? row.entry.Name}>
                <span>{row.drawOrder ? row.drawOrder : ""}</span>
                <div>
                  <strong>{row.entry.Name?.trim() || "Unnamed contestant"}</strong>
                  <p>
                    {[row.entry.Hometown, row.entry.ContestantNumber ? `No. ${row.entry.ContestantNumber}` : ""]
                      .filter(Boolean)
                      .join(" - ")}
                  </p>
                </div>
                <em>{[row.entry.Brand, row.entry.ContractorInitials].filter(Boolean).join(" ")}</em>
              </div>
            ))
          ) : (
            <EmptyState title="No Entries" subtitle="No entries are listed for this event." icon={Calendar} />
          )}
        </div>
      </section>

      {rerides.length > 0 && (
        <section className="daysheet-list-section">
          <h4>Rerides</h4>
          <div className="reride-list">
            {rerides.map((reride) => (
              <div className="draw-row" key={reride.RerideEntryId ?? `${reride.RerideNumber}-${reride.StockName}`}>
                <span>{reride.RerideNumber ?? "-"}</span>
                <div>
                  <strong>{reride.StockName?.trim() || "Reride Stock"}</strong>
                  <p>{[reride.Brand ? `Brand ${reride.Brand}` : "", reride.ContractorInitials].filter(Boolean).join(" - ")}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SubViewShell({ title, onBack, children }: { title: string; onBack: () => void; children: ReactNode }) {
  return (
    <div className="stack">
      <section className="app-card subview-header">
        <button onClick={onBack}>Back</button>
        <h2>{title}</h2>
      </section>
      {children}
    </div>
  );
}

export function DetailPane({ rodeo, state }: { rodeo: RodeoRow; state: LoadState }) {
  return (
    <div className="detail-card">
      <span className="kicker">Selected Rodeo</span>
      <h2>{rodeo.name}</h2>
      <p>{rodeo.location}</p>
      <div className="metric-grid">
        <div>
          <span>Ends</span>
          <strong>{rodeo.endDate}</strong>
        </div>
        <div>
          <span>Payout</span>
          <strong>{rodeo.payout}</strong>
        </div>
      </div>
      <div className="mini-winners">
        {state === "loading" && <span>Loading winners...</span>}
        {state === "error" && <span>Winners unavailable</span>}
        {state === "loaded" && rodeo.winners.length === 0 && <span>No winners posted for the selected event yet.</span>}
        {state !== "loading" &&
          state !== "error" &&
          rodeo.winners.map(([place, name, score]) => (
            <div key={`${place}-${name}-${score}`}>
              <span>{place}</span>
              <strong>{name}</strong>
              <em>{score}</em>
            </div>
          ))}
      </div>
    </div>
  );
}

export function FollowAlertsPanel({
  followedAthletes,
  alertsEnabled,
  onOpenAthlete,
  onOpenSettings,
  onClose
}: {
  followedAthletes: StandingRow[];
  alertsEnabled: boolean;
  onOpenAthlete: (athlete: StandingRow) => void;
  onOpenSettings: () => void;
  onClose: () => void;
}) {
  return (
    <section className="app-card follow-alerts-panel" aria-label="Follow alerts">
      <div className="follow-alerts-title">
        <div>
          <span>Follow Alerts</span>
          <strong>{alertsEnabled ? "Alerts Enabled" : "Alerts Paused"}</strong>
        </div>
        <button aria-label="Close follow alerts" onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      {followedAthletes.length > 0 ? (
        <div className="follow-alert-list">
          {followedAthletes.map((athlete) => (
            <button key={athlete.id} onClick={() => onOpenAthlete(athlete)}>
              <AthleteAvatar athlete={athlete} size="small" />
              <div>
                <strong>{athlete.name}</strong>
                <span>{athlete.hometown || "No hometown listed"}</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="follow-alert-empty">
          <Users size={22} />
          <strong>No followed athletes</strong>
          <span>Follow athletes from Standings or a profile to track them here.</span>
        </div>
      )}

      <button className="follow-settings-button" onClick={onOpenSettings}>
        Settings
      </button>
    </section>
  );
}

export function AthleteDetailPane({
  athlete,
  bio,
  state,
  toggleFavoriteAthlete
}: {
  athlete: StandingRow;
  bio: AthleteBio | null;
  state: LoadState;
  toggleFavoriteAthlete: (athlete: StandingRow) => void;
}) {
  const [selectedTab, setSelectedTab] = useState<AthleteProfileTab>("Stats");
  const [showBioDocument, setShowBioDocument] = useState(false);
  const displayImageUrl = bio?.imageUrl || athlete.imageUrl || athletePlaceholderImage;
  const hasDisplayImage = Boolean(bio?.imageUrl || athlete.imageUrl);
  const hasBio = Boolean(
    bio && (bio.biography.facts.length > 0 || bio.biography.summary.length > 0 || bio.biography.sections.length > 0)
  );
  const currentRanking = bio?.rankings[0];
  const eventLabel = currentRanking?.eventName || bio?.events[0] || athlete.metricLabel;
  const seasonRanking = currentRanking ? `#${currentRanking.rank} ${currentRanking.eventName}` : athlete.metric ? `${athlete.metricLabel}: ${athlete.metric}` : "";

  function selectTab(tab: AthleteProfileTab) {
    setSelectedTab(tab);
    setShowBioDocument(false);
  }

  return (
    <div className="athlete-profile-shell">
      <section className="athlete-profile-hero">
        <Image className={hasDisplayImage ? undefined : "athlete-placeholder-image"} src={displayImageUrl} alt="" fill priority sizes="760px" />
        <div className="athlete-profile-hero-scrim" />
        <div className="athlete-profile-hero-content">
          <div className="athlete-profile-title-row">
            <div>
              <h1>{bio?.name || athlete.name}</h1>
              <p>{eventLabel}</p>
            </div>
            <div className="athlete-profile-action-buttons">
              <button aria-label={athlete.favorite ? "Remove favorite athlete" : "Favorite athlete"} onClick={() => toggleFavoriteAthlete(athlete)}>
                <Star size={18} fill={athlete.favorite ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          {seasonRanking && <strong className="athlete-season-ranking">{seasonRanking}</strong>}

          <div className="athlete-hero-stat-row">
            <span>{bio?.nfrQualifications ? `${bio.nfrQualifications} NFR${bio.nfrQualifications === 1 ? "" : "'s"}` : "No NFRs"}</span>
            <span>{bio?.worldTitles ? `${bio.worldTitles} World Title${bio.worldTitles === 1 ? "" : "s"}` : "No World Titles"}</span>
            <span>{bio?.age ? `${bio.age} Years old` : "Age unknown"}</span>
          </div>

          <div className="athlete-profile-tabs" role="tablist" aria-label="Athlete profile sections">
            {athleteProfileTabs.map((tab) => (
              <button
                aria-selected={!showBioDocument && selectedTab === tab}
                className={!showBioDocument && selectedTab === tab ? "active" : undefined}
                key={tab}
                onClick={() => selectTab(tab)}
                role="tab"
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="athlete-profile-tab-content">
        {state === "loading" && <AthleteProfileSkeleton />}
        {state === "error" && <EmptyState title="Profile Unavailable" subtitle="The full athlete profile could not be loaded right now." icon={Users} />}
        {state === "loaded" && bio && showBioDocument && <AthleteBioDocument bio={bio} onBack={() => setShowBioDocument(false)} />}
        {state === "loaded" && bio && !showBioDocument && selectedTab === "Stats" && (
          <AthleteStatsTab bio={bio} athlete={athlete} hasBio={hasBio} onOpenBio={() => setShowBioDocument(true)} />
        )}
        {state === "loaded" && bio && !showBioDocument && selectedTab === "Results" && <AthleteResultsTab bio={bio} />}
        {state === "loaded" && bio && !showBioDocument && selectedTab === "Career" && <AthleteCareerTab bio={bio} />}
        {state === "loaded" && bio && !showBioDocument && selectedTab === "Highlights" && <AthleteHighlightsTab bio={bio} />}
        {state === "loaded" && bio && !showBioDocument && <GoogleAdSlot placement="athleteBioSection" />}
      </section>
    </div>
  );
}

function AthleteStatsTab({
  bio,
  athlete,
  hasBio,
  onOpenBio
}: {
  bio: AthleteBio;
  athlete: StandingRow;
  hasBio: boolean;
  onOpenBio: () => void;
}) {
  const seasons = Array.from(
    new Set([
      ...bio.career.map((season) => String(season.season)).filter((season) => season !== "0"),
      ...bio.rankings.map((ranking) => String(ranking.season)).filter((season) => season !== "0"),
      ...bio.recentResults.map((result) => String(result.season)).filter((season) => season !== "0")
    ])
  ).sort((left, right) => Number(right) - Number(left));
  const [selectedSeason, setSelectedSeason] = useState(seasons[0] ?? new Date().getFullYear().toString());
  const activeSeason = seasons.includes(selectedSeason) ? selectedSeason : seasons[0] ?? selectedSeason;
  const seasonCareer = bio.career.find((season) => String(season.season) === activeSeason);
  const seasonRanking = bio.rankings.find((ranking) => String(ranking.season) === activeSeason);
  const seasonResults = bio.recentResults.filter((result) => String(result.season) === activeSeason);
  const hasSeasonStats = Boolean(seasonCareer || seasonRanking || seasonResults.length > 0);
  const bestResult = bestAthleteResult(seasonResults, bio.events[0]);
  const bestPayingGo = [...seasonResults].sort((left, right) => currencyNumber(right.payoff) - currencyNumber(left.payoff))[0];
  const bestPayingRodeo = bestAthletePayingRodeo(seasonResults);
  const monthlyRows = monthlyEarningsRows(seasonResults);
  const monthlyTotal = monthlyRows.reduce((total, row) => total + row.total, 0);
  const maxMonthTotal = Math.max(...monthlyRows.map((row) => row.total), 1);

  return (
    <div className="athlete-profile-stack">
      <section className="app-card athlete-tab-header-card">
        <div>
          <h2>Career Stats</h2>
          <p>{bio.events[0] || athlete.metricLabel}</p>
        </div>
        {hasBio && (
          <button className="athlete-bio-text-link" onClick={onOpenBio}>
            Bio <ChevronRight size={16} />
          </button>
        )}
      </section>

      {seasons.length > 0 && (
        <div className="athlete-season-chip-row" aria-label="Stats season">
          {seasons.map((season) => (
            <button className={activeSeason === season ? "active" : undefined} key={season} onClick={() => setSelectedSeason(season)}>
              {season}
            </button>
          ))}
        </div>
      )}

      {!hasSeasonStats ? (
        <EmptyState title="No Stats Available" subtitle="No stats are available for this season and event." icon={ListOrdered} />
      ) : (
        <>
          <section className="app-card athlete-season-overview-card">
            <div>
              <span>Season {activeSeason}</span>
              <strong>{seasonRanking?.rank ? formatRankDisplay(seasonRanking.rank) : activeSeason === new Date().getFullYear().toString() && athlete.place ? `#${athlete.place}` : "Unranked"}</strong>
            </div>
            <div>
              <span>Earnings</span>
              <strong>{seasonCareer?.earnings || (activeSeason === new Date().getFullYear().toString() ? athlete.metric || bio.yearEarnings : "-")}</strong>
            </div>
          </section>

          <section className="app-card athlete-performance-card athlete-best-performance-card">
            <strong>Best Performances</strong>
            <AthleteStatRow title={resultMetricTitle(bio.events[0])} rodeo={bestResult?.rodeoName || "No result listed"} trailing={bestResult?.resultValue || "-"} />
            <AthleteStatRow
              title="Best Paying Go"
              rodeo={bestPayingGo?.rodeoName || "No payoff listed"}
              trailing={bestPayingGo ? `${bestPayingGo.resultValue || "-"} • ${bestPayingGo.payoff}` : "-"}
            />
            <AthleteStatRow title="Best Paying Rodeo" rodeo={bestPayingRodeo?.rodeoName || "No payoff listed"} trailing={bestPayingRodeo?.payoff || "-"} />
          </section>

          <section className="app-card athlete-performance-card">
            <strong>NFR Summary</strong>
            <div>
              <span>NFR Qualifications</span>
              <p>{seasonCareer?.nfrQualified ? "Qualified" : "No NFR stats for this season"}</p>
            </div>
            <div>
              <span>World Titles</span>
              <p>{seasonCareer?.worldTitles ?? 0}</p>
            </div>
            <div>
              <span>NFR Earnings</span>
              <p>{seasonCareer?.nfrQualified ? seasonCareer.earnings : "No NFR stats for this season"}</p>
            </div>
          </section>

          <section className="app-card athlete-monthly-card">
            <div className="athlete-monthly-heading">
              <strong>Monthly Earnings</strong>
              <span>Regular Season: {formatMoneyFromNumber(monthlyTotal)}</span>
            </div>
            <div className="athlete-monthly-list">
              {monthlyRows.map((row) => (
                <div className="athlete-month-row" key={row.month}>
                  <span>{row.month}</span>
                  <i>
                    <b style={{ width: `${Math.max(4, (row.total / maxMonthTotal) * 100)}%` }} />
                  </i>
                  <strong>{formatMoneyFromNumber(row.total)}</strong>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function AthleteStatRow({ title, rodeo, trailing }: { title: string; rodeo: string; trailing: string }) {
  return (
    <div className="athlete-stat-row">
      <span>{title}</span>
      <div>
        <p>{rodeo}</p>
        <strong>{trailing}</strong>
      </div>
    </div>
  );
}

function currencyNumber(value: string) {
  const parsed = Number(value.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoneyFromNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function monthlyEarningsRows(results: AthleteBio["recentResults"]) {
  const monthKeys = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
  return monthKeys.map((month) => ({
    month,
    total: results
      .filter((result) => result.endDate.startsWith(month))
      .reduce((total, result) => total + currencyNumber(result.payoff), 0)
  }));
}

function bestAthleteResult(results: AthleteBio["recentResults"], eventType?: string) {
  const scored = results.filter((result) => result.resultValue && result.resultValue !== "-");
  const isScore = roughstockEventTypes.has((eventType ?? "").toUpperCase());
  return scored.sort((left, right) => (isScore ? resultNumber(right.resultValue) - resultNumber(left.resultValue) : resultNumber(left.resultValue) - resultNumber(right.resultValue)))[0];
}

function bestAthletePayingRodeo(results: AthleteBio["recentResults"]) {
  const grouped = new Map<string, { rodeoName: string; payoff: number }>();
  results.forEach((result) => {
    const key = `${result.rodeoName}-${result.endDate}`;
    const current = grouped.get(key) ?? { rodeoName: result.rodeoName, payoff: 0 };
    current.payoff += currencyNumber(result.payoff);
    grouped.set(key, current);
  });
  const best = [...grouped.values()].sort((left, right) => right.payoff - left.payoff)[0];
  return best ? { rodeoName: best.rodeoName, payoff: formatMoneyFromNumber(best.payoff) } : null;
}

function resultMetricTitle(eventType?: string) {
  return roughstockEventTypes.has((eventType ?? "").toUpperCase()) ? "Score" : "Time";
}

function AthleteResultsTab({ bio }: { bio: AthleteBio }) {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<AthleteResultSort>("Date");
  const [isSearching, setIsSearching] = useState(false);
  const results = bio.recentResults.filter((result) => athleteResultMatches(result, query));
  const sortedResults = results.slice().sort((left, right) => sortAthleteResults(left, right, sortBy));
  const usesFlatResultList = sortBy === "Result" || sortBy === "Earnings";
  const groupedResults = groupAthleteResults(sortedResults);
  const resultCount = sortedResults.length;
  const resultMetricLabel = roughstockEventTypes.has((bio.events[0] ?? "").toUpperCase()) ? "Score" : "Time";
  const summaryText = usesFlatResultList ? `${resultCount} results` : `${groupedResults.length} rodeos • ${resultCount} results`;

  if (bio.recentResults.length === 0) {
    return <EmptyState title="No Results Found" subtitle="No recent rodeo results are available for this athlete." icon={ListOrdered} />;
  }

  return (
    <div className="athlete-profile-stack">
      <section className="app-card athlete-results-header-card">
        <div className="athlete-results-title-row">
          <div>
            <h2>Results</h2>
            <p>{[bio.events[0], summaryText].filter(Boolean).join(" • ")}</p>
          </div>
          <button
            type="button"
            className="circle-icon-button"
            aria-label={isSearching ? "Close results search" : "Search results"}
            onClick={() => {
              setIsSearching((current) => !current);
              if (isSearching) setQuery("");
            }}
          >
            {isSearching ? <X size={17} /> : <Search size={17} />}
          </button>
        </div>

        {isSearching ? (
          <label className="athlete-results-search">
            <Search size={16} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search rodeo, location, or result"
            />
            {query ? (
              <button type="button" aria-label="Clear results search" onClick={() => setQuery("")}>
                <X size={15} />
              </button>
            ) : null}
          </label>
        ) : null}

        <div className="athlete-results-filter-row">
          <label>
            <span>Sort</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value as AthleteResultSort)}>
              <option>Date</option>
              <option>Rodeo</option>
              <option>Result</option>
              <option>Earnings</option>
            </select>
          </label>
          <div>
            <span>Season</span>
            <strong>{bio.career[0]?.season || new Date().getFullYear()}</strong>
          </div>
        </div>
      </section>

      {resultCount === 0 ? (
        <EmptyState title="No Results Found" subtitle="Try a different sort option or search term." icon={ListOrdered} />
      ) : (
        <>
          <div className="athlete-result-column-header" aria-hidden="true">
            <span>Round</span>
            <span>Place</span>
            <span>{resultMetricLabel}</span>
            <span>Earnings</span>
          </div>

          {usesFlatResultList ? (
            <div className="athlete-flat-result-list">
              {sortedResults.map((result) => (
                <AthleteFlatResultCard key={result.id} result={result} />
              ))}
            </div>
          ) : (
            <div className="athlete-result-group-list">
              {groupedResults.map((group) => (
                <AthleteResultGroupCard key={group.id} group={group} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const roughstockEventTypes = new Set(["BB", "SB", "BR"]);

type AthleteResultGroup = {
  id: string;
  rodeoName: string;
  location: string;
  endDate: string;
  eventType: string;
  results: AthleteBioResult[];
};

function AthleteResultGroupCard({ group }: { group: AthleteResultGroup }) {
  return (
    <section className="app-card athlete-result-group-card">
      <div className="athlete-result-group-heading">
        <div>
          <h3>{group.rodeoName}</h3>
          <p>{[group.location, group.endDate].filter(Boolean).join(" • ")}</p>
        </div>
        <span>{group.results.length}</span>
      </div>
      <div className="athlete-result-table">
        {group.results.map((result) => (
          <AthleteResultDetailRow key={result.id} result={result} />
        ))}
      </div>
    </section>
  );
}

function AthleteFlatResultCard({ result }: { result: AthleteBioResult }) {
  return (
    <section className="app-card athlete-result-group-card">
      <div className="athlete-result-group-heading">
        <div>
          <h3>{result.rodeoName}</h3>
          <p>{[result.location, result.endDate].filter(Boolean).join(" • ")}</p>
        </div>
      </div>
      <div className="athlete-result-table">
        <AthleteResultDetailRow result={result} />
      </div>
    </section>
  );
}

function AthleteResultDetailRow({ result }: { result: AthleteBioResult }) {
  return (
    <div className="athlete-result-detail-row">
      <span>{result.round || "Round"}</span>
      <strong>{result.place ? `#${result.place}` : "-"}</strong>
      <em>{result.resultValue || "-"}</em>
      <p>{result.payoff || "-"}</p>
    </div>
  );
}

function athleteResultMatches(result: AthleteBioResult, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;
  return [result.rodeoName, result.location, result.endDate, result.round, result.resultValue, result.payoff, result.eventType]
    .join(" ")
    .toLowerCase()
    .includes(normalizedQuery);
}

function sortAthleteResults(left: AthleteBioResult, right: AthleteBioResult, sortBy: AthleteResultSort) {
  switch (sortBy) {
    case "Rodeo":
      return left.rodeoName.localeCompare(right.rodeoName) || compareResultDates(right, left);
    case "Result":
      return resultNumber(left.resultValue) - resultNumber(right.resultValue);
    case "Earnings":
      return currencyNumber(right.payoff) - currencyNumber(left.payoff);
    case "Date":
    default:
      return compareResultDates(right, left);
  }
}

function compareResultDates(left: AthleteBioResult, right: AthleteBioResult) {
  return resultDateNumber(left.endDate) - resultDateNumber(right.endDate);
}

function resultDateNumber(value: string) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function resultNumber(value: string) {
  const parsed = Number(value.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
}

function groupAthleteResults(results: AthleteBioResult[]) {
  const groups: AthleteResultGroup[] = [];
  const indexByKey = new Map<string, number>();

  results.forEach((result) => {
    const key = `${result.rodeoName}-${result.endDate}-${result.eventType}`;
    const existingIndex = indexByKey.get(key);

    if (existingIndex === undefined) {
      indexByKey.set(key, groups.length);
      groups.push({
        id: key,
        rodeoName: result.rodeoName,
        location: result.location,
        endDate: result.endDate,
        eventType: result.eventType,
        results: [result]
      });
      return;
    }

    groups[existingIndex].results.push(result);
  });

  return groups;
}

function AthleteCareerTab({ bio }: { bio: AthleteBio }) {
  const careerRows = athleteCareerRows(bio);
  const eventLabel = displayAthleteEvent(bio.events[0] || bio.rankings[0]?.eventName || bio.career[0]?.eventType || "");

  if (bio.career.length === 0 && bio.rankings.length === 0) {
    return <EmptyState title="No Career Data" subtitle="No career rankings are available for this athlete." icon={ListOrdered} />;
  }

  return (
    <div className="athlete-profile-stack">
      <section className="app-card athlete-career-header-card">
        <div>
          <h2>Career</h2>
          <strong>{eventLabel}</strong>
          <p>{careerRows.length} seasons</p>
        </div>
      </section>
      <div className="athlete-career-table">
        <div className="athlete-career-heading">
          <span>Season</span>
          <span>Rank</span>
          <span>Earnings</span>
        </div>
        {careerRows.map((season) => (
          <div className="app-card athlete-career-row" key={season.id}>
            <strong>{season.season || "-"}</strong>
            <span>{season.rank}</span>
            <p>{season.earnings}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function athleteCareerRows(bio: AthleteBio) {
  if (bio.career.length > 0) {
    return bio.career
      .slice()
      .sort((left, right) => right.season - left.season)
      .map((season) => {
        const ranking =
          bio.rankings.find((rank) => rank.season === season.season && rankMatchesEvent(rank.eventName, season.eventType)) ??
          bio.rankings.find((rank) => rank.season === season.season);

        return {
          id: season.id,
          season: season.season,
          rank: ranking?.rank ? formatRankDisplay(ranking.rank) : season.worldTitles ? `${season.worldTitles} WT` : season.nfrQualified ? "NFR" : "-",
          earnings: season.earnings || "-"
        };
      });
  }

  return bio.rankings
    .slice()
    .sort((left, right) => right.season - left.season)
    .map((ranking) => ({
      id: ranking.id,
      season: ranking.season,
      rank: ranking.rank ? formatRankDisplay(ranking.rank) : "-",
      earnings: ranking.eventName || "-"
    }));
}

function rankMatchesEvent(eventName: string, eventType: string) {
  const eventDisplay = displayAthleteEvent(eventType).toLowerCase();
  const normalizedName = eventName.toLowerCase();
  return Boolean(eventDisplay && normalizedName.includes(eventDisplay));
}

function formatRankDisplay(rank: string) {
  const trimmed = rank.trim();
  if (!trimmed || trimmed.toLowerCase() === "unranked") return "-";
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

function displayAthleteEvent(value: string) {
  const normalized = value.trim().toUpperCase();
  const names: Record<string, string> = {
    BB: "Bareback Riding",
    SW: "Steer Wrestling",
    TR: "Team Roping",
    TRHD: "Team Roping",
    TRHL: "Team Roping",
    SB: "Saddle Bronc Riding",
    TD: "Tie-Down Roping",
    GB: "Barrel Racing",
    BR: "Bull Riding",
    LB: "Breakaway Roping",
    SR: "Breakaway Roping"
  };
  return names[normalized] ?? value;
}

function AthleteHighlightsTab({ bio }: { bio: AthleteBio }) {
  if (bio.highlights.length === 0) {
    return (
      <EmptyState
        title="No Highlights Available"
        subtitle={`${bio.name} doesn't have any highlights available. Videos will be added as they become available.`}
        icon={Trophy}
      />
    );
  }

  return (
    <div className="athlete-profile-stack">
      <section className="app-card athlete-highlights-header-card">
        <div>
          <h2>Highlights</h2>
          <strong>{bio.name}</strong>
          <p>{bio.highlights.length} videos</p>
        </div>
      </section>
      <div className="athlete-highlight-grid">
        {bio.highlights.map((video, index) => (
          <section className="athlete-highlight-card" key={video.id}>
            <iframe
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="athlete-highlight-video"
              src={`https://player.vimeo.com/video/${video.id}`}
              title={`${bio.name} highlight video ${index + 1}`}
            />
          </section>
        ))}
      </div>
    </div>
  );
}

function AthleteBioDocument({ bio, onBack }: { bio: AthleteBio; onBack: () => void }) {
  const hasBio = bio.biography.facts.length > 0 || bio.biography.summary.length > 0 || bio.biography.sections.length > 0;

  return (
    <section className="app-card athlete-bio-document">
      <div className="athlete-bio-document-header">
        <button className="athlete-bio-text-link" onClick={onBack}>
          Stats
        </button>
        <h2>{bio.name}</h2>
      </div>
      {!hasBio ? (
        <EmptyState title="No Bio Available" subtitle={`${bio.name} does not have a published bio yet.`} icon={Users} />
      ) : (
        <div className="athlete-biography">
          {bio.biography.facts.length > 0 && (
            <div className="athlete-biography-facts">
              {bio.biography.facts.map((fact) => (
                <div key={fact.id}>
                  <span>{fact.label}</span>
                  <p>{fact.value}</p>
                </div>
              ))}
            </div>
          )}
          {bio.biography.summary.map((paragraph, index) => (
            <p key={`summary-${index}`}>{paragraph}</p>
          ))}
          {bio.biography.sections.map((section) => (
            <div className="athlete-biography-section" key={section.id}>
              <h3>{section.title}</h3>
              {section.paragraphs.map((paragraph, index) => (
                <p key={`${section.id}-${index}`}>{paragraph}</p>
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function AthleteProfileScreen({
  athlete,
  bio,
  state,
  onBack,
  toggleFavoriteAthlete
}: {
  athlete: StandingRow;
  bio: AthleteBio | null;
  state: LoadState;
  onBack: () => void;
  toggleFavoriteAthlete: (athlete: StandingRow) => void;
}) {
  return (
    <div className="stack athlete-profile-screen">
      <section className="app-card subview-header athlete-profile-nav">
        <button onClick={onBack}>
          <ArrowLeft size={16} />
          Back
        </button>
        <h2>{bio?.name || athlete.name}</h2>
      </section>
      <AthleteDetailPane
        athlete={athlete}
        bio={bio}
        state={state}
        toggleFavoriteAthlete={toggleFavoriteAthlete}
      />
    </div>
  );
}

function AthleteAvatar({ athlete, size }: { athlete: Pick<StandingRow, "name" | "imageUrl">; size: "small" | "card" | "detail" }) {
  const className = `athlete-avatar ${size}`;
  const hasImage = Boolean(athlete.imageUrl);
  return (
    <span className={className}>
      <Image
        className={hasImage ? undefined : "athlete-placeholder-image"}
        src={athlete.imageUrl || athletePlaceholderImage}
        alt=""
        fill
        sizes={size === "detail" ? "132px" : size === "card" ? "92px" : "42px"}
      />
    </span>
  );
}

export function EmptyDetailPane() {
  return (
    <div className="detail-card">
      <span className="kicker">Selected Rodeo</span>
      <h2>No rodeo selected</h2>
      <p>Choose a rodeo from Results to see winners here.</p>
    </div>
  );
}

function SelectChip({
  label,
  value,
  options,
  optionLabels,
  onChange
}: {
  label: string;
  value: string;
  options: readonly string[];
  optionLabels?: Record<string, string>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="select-chip">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {optionLabels?.[option] ?? option}
          </option>
        ))}
      </select>
      <ChevronDown size={14} />
    </label>
  );
}

function DateRangeFilter({ value, onChange }: { value: DateRange; onChange: (range: DateRange) => void }) {
  const hasRange = Boolean(value.start || value.end);

  return (
    <div className="date-range-filter compact-date-range">
      <span>Dates</span>
      <label>
        <span>From</span>
        <input type="date" value={value.start} onChange={(event) => onChange({ ...value, start: event.target.value })} />
      </label>
      <label>
        <span>To</span>
        <input type="date" value={value.end} onChange={(event) => onChange({ ...value, end: event.target.value })} />
      </label>
      {hasRange && (
        <button aria-label="Clear date range" onClick={() => onChange({ start: "", end: "" })}>
          <X size={15} />
        </button>
      )}
      {!hasRange && <Calendar size={15} />}
    </div>
  );
}

function LoadingState({ title }: { title: string }) {
  return (
    <div className="empty-state">
      <span className="loader" />
      <strong>{title}</strong>
    </div>
  );
}

function AthleteProfileSkeleton() {
  return (
    <div className="athlete-profile-stack athlete-profile-skeleton" aria-label="Loading athlete profile">
      <section className="app-card athlete-tab-header-card">
        <div>
          <span className="skeleton-line short" />
          <span className="skeleton-line medium" />
        </div>
        <span className="skeleton-pill bio-link" />
      </section>

      <div className="athlete-season-chip-row" aria-hidden="true">
        <span className="skeleton-pill season" />
        <span className="skeleton-pill season" />
        <span className="skeleton-pill season" />
      </div>

      <section className="app-card athlete-season-overview-card">
        <div>
          <span className="skeleton-line label" />
          <span className="skeleton-line large" />
          <span className="skeleton-line medium" />
        </div>
        <div>
          <span className="skeleton-line label" />
          <span className="skeleton-line amount" />
        </div>
      </section>

      <section className="app-card athlete-performance-card athlete-best-performance-card">
        <span className="skeleton-line medium" />
        <div className="athlete-stat-row">
          <span className="skeleton-line label" />
          <span className="skeleton-line large" />
          <span className="skeleton-line short" />
        </div>
        <div className="athlete-stat-row">
          <span className="skeleton-line label" />
          <span className="skeleton-line large" />
          <span className="skeleton-line short" />
        </div>
      </section>

      <section className="app-card athlete-monthly-card">
        <div className="athlete-monthly-heading">
          <span className="skeleton-line medium" />
          <span className="skeleton-line short" />
        </div>
        <div className="athlete-monthly-list">
          {["first", "second", "third"].map((row) => (
            <div className="athlete-month-row" key={row}>
              <span className="skeleton-line short" />
              <i className="skeleton-bar" />
              <strong className="skeleton-line amount" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function EmptyState({ title, subtitle, icon: Icon }: { title: string; subtitle: string; icon: LucideIcon }) {
  return (
    <div className="empty-state">
      <Icon size={28} />
      <strong>{title}</strong>
      <span>{subtitle}</span>
    </div>
  );
}
