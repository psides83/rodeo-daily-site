"use client";

import {
  ArrowDown,
  ArrowUp,
  Bell,
  Calendar,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  ExternalLink,
  Heart,
  ListOrdered,
  MapPin,
  Newspaper,
  Search,
  Settings,
  ShieldCheck,
  Star,
  Trophy,
  Users,
  X
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import type {
  AppSettings,
  AthleteBio,
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
  events,
  filterChampions,
  initialsFor,
  makeDaysheetDisplayRows,
  mapScheduleToBusinessJournalRow,
  sortBusinessJournalRows,
  topChampionCounts
} from "../lib/rodeo-data";

const moreItems = [
  {
    id: "favorites",
    icon: Users,
    title: "Favorite Athletes",
    subtitle: "Browse your selected favorite athlete bios"
  },
  {
    id: "nfr",
    icon: Trophy,
    title: "NFR Standings",
    subtitle: "Round-by-round NFR average rankings"
  },
  {
    id: "listings",
    icon: Newspaper,
    title: "Rodeo Listings",
    subtitle: "Rodeo listings and details"
  },
  {
    id: "champions",
    icon: Trophy,
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

export function RodeoDailyLogoMark() {
  return (
    <svg className="logo-mark" viewBox="0 0 180 180" role="img" aria-label="Rodeo Daily">
      <rect width="180" height="180" rx="40" />
      <path className="logo-arc outer" d="M28 112c23-40 101-40 124 0" />
      <path className="logo-arc inner" d="M52 76c13-23 63-23 76 0" />
      <path className="logo-bar" d="M60 96h60" />
      <text x="90" y="139" fontSize="38" fontWeight="900" textAnchor="middle">
        RD
      </text>
    </svg>
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
  standingYear,
  setStandingYear,
  rows,
  state,
  selectedStanding,
  setSelectedStanding,
  onOpenAthlete,
  toggleFavoriteAthlete,
  toggleFollowedAthlete
}: {
  standingType: StandingType;
  setStandingType: (type: StandingType) => void;
  standingEvent: EventName;
  setStandingEvent: (event: EventName) => void;
  standingYear: string;
  setStandingYear: (year: string) => void;
  rows: StandingRow[];
  state: LoadState;
  selectedStanding: StandingRow | null;
  setSelectedStanding: (athlete: StandingRow) => void;
  onOpenAthlete: (athlete: StandingRow) => void;
  toggleFavoriteAthlete: (athlete: StandingRow) => void;
  toggleFollowedAthlete: (athleteId: number) => void;
}) {
  return (
    <div className="stack">
      <section className="app-card header-card">
        <span>Standings</span>
        <div>
          <h2>{standingEvent}</h2>
          <strong className="season-label">{standingYear}</strong>
        </div>
      </section>

      <div className="chip-grid">
        <SelectChip label="Season" value={standingYear} options={standingYears} onChange={setStandingYear} />
        <SelectChip
          label="Type"
          value={standingType}
          options={["World Standings", "Circuit Standings", "Rookie Standings"]}
          onChange={(value) => setStandingType(value as StandingType)}
        />
        <SelectChip label="Event" value={standingEvent} options={events} onChange={(value) => setStandingEvent(value as EventName)} />
      </div>

      <div className="sticky-pill">
        <strong>{standingEvent}</strong>
        <span>{standingYear} {standingType}</span>
      </div>

      <div className="list-stack">
        {state === "loading" ? (
          <LoadingState title="Loading standings" />
        ) : state === "error" ? (
          <EmptyState title="Standings Unavailable" subtitle="The live standings feed could not be loaded." icon={ListOrdered} />
        ) : rows.length > 0 ? (
          rows.map((position) => (
            <StandingCard
              key={position.id}
              position={position}
              selected={selectedStanding?.id === position.id}
              onSelect={() => setSelectedStanding(position)}
              onOpenProfile={() => onOpenAthlete(position)}
              onToggleFavorite={() => toggleFavoriteAthlete(position)}
              onToggleFollow={() => toggleFollowedAthlete(position.id)}
            />
          ))
        ) : (
          <EmptyState title="No Standings Found" subtitle="Try a different event, type, or search." icon={ListOrdered} />
        )}
      </div>
    </div>
  );
}

function StandingCard({
  position,
  selected,
  onSelect,
  onOpenProfile,
  onToggleFavorite,
  onToggleFollow
}: {
  position: StandingRow;
  selected: boolean;
  onSelect: () => void;
  onOpenProfile: () => void;
  onToggleFavorite: () => void;
  onToggleFollow: () => void;
}) {
  return (
    <article className={selected ? "app-card standings-card active" : "app-card standings-card"}>
      <button className="card-main" onClick={onSelect}>
        <AthleteAvatar athlete={position} size="card" />
        <div>
          <span className="rank-badge">#{position.place}</span>
          <h3>{position.name}</h3>
          <p>{position.hometown}</p>
        </div>
      </button>
      <div className="card-metrics">
        <div className="icons">
          <button aria-label={position.followed ? "Unfollow athlete" : "Follow athlete"} onClick={onToggleFollow}>
            <Bell size={16} fill={position.followed ? "currentColor" : "none"} />
          </button>
          <button aria-label={position.favorite ? "Remove favorite athlete" : "Favorite athlete"} onClick={onToggleFavorite}>
            <Star size={16} fill={position.favorite ? "currentColor" : "none"} />
          </button>
          <ChevronRight size={17} />
        </div>
        <span>{position.metricLabel}</span>
        <strong>{position.metric}</strong>
        <button className="profile-link-button" onClick={onOpenProfile}>
          View Profile
        </button>
      </div>
    </article>
  );
}

export function ResultsView({
  resultEvent,
  setResultEvent,
  dateRange,
  setDateRange,
  selectedResult,
  onOpenRodeo,
  onLoadMore,
  rows,
  state
}: {
  resultEvent: EventName;
  setResultEvent: (event: EventName) => void;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  selectedResult: RodeoRow | null;
  onOpenRodeo: (result: RodeoRow) => void;
  onLoadMore: () => void;
  rows: RodeoRow[];
  state: LoadState;
}) {
  const isInitialLoading = state === "loading" && rows.length === 0;
  const isLoadingMore = state === "loading" && rows.length > 0;

  return (
    <div className="stack">
      <section className="app-card header-card">
        <span>Results</span>
        <div>
          <h2>{resultEvent} Rodeo Results</h2>
        </div>
      </section>

      <div className="chip-row">
        <SelectChip label="Event" value={resultEvent} options={events} onChange={(value) => setResultEvent(value as EventName)} />
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </div>

      <div className="sticky-pill">
        <strong>{resultEvent}</strong>
        <span>Latest rodeos</span>
      </div>

      <div className="list-stack">
        {isInitialLoading ? (
          <LoadingState title="Loading rodeos" />
        ) : state === "error" ? (
          <EmptyState title="Results Unavailable" subtitle="The live results feed could not be loaded." icon={CircleDollarSign} />
        ) : rows.length > 0 ? (
          <>
            {rows.map((rodeo) => (
              <button
                className={selectedResult?.id === rodeo.id ? "app-card rodeo-card active" : "app-card rodeo-card"}
                key={rodeo.id}
                onClick={() => onOpenRodeo(rodeo)}
              >
                <div>
                  <h3>{rodeo.name}</h3>
                  <p>
                    <MapPin size={14} /> {rodeo.location}
                  </p>
                </div>
                <div className="rodeo-meta">
                  <strong>{rodeo.payout}</strong>
                  <span>{rodeo.inProgress ? "In Progress" : `Ended ${rodeo.endDate}`}</span>
                  {rodeo.hasDaysheets && <em>Daysheets</em>}
                </div>
                <ChevronRight size={18} />
              </button>
            ))}
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
  selectedResult,
  onOpenRodeo,
  onLoadMore
}: {
  rows: RodeoRow[];
  state: LoadState;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  selectedResult: RodeoRow | null;
  onOpenRodeo: (result: RodeoRow) => void;
  onLoadMore: () => void;
}) {
  const isInitialLoading = state === "loading" && rows.length === 0;
  const isLoadingMore = state === "loading" && rows.length > 0;

  return (
    <div className="stack">
      <section className="app-card header-card">
        <span>Schedule</span>
        <div>
          <h2>Upcoming Rodeos</h2>
        </div>
      </section>

      <div className="chip-row">
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </div>

      <div className="list-stack">
        {isInitialLoading ? (
          <LoadingState title="Loading schedule" />
        ) : state === "error" ? (
          <EmptyState title="Schedule Unavailable" subtitle="The live schedule feed could not be loaded." icon={Calendar} />
        ) : rows.length > 0 ? (
          <>
            {rows.map((rodeo) => (
              <button
                className={selectedResult?.id === rodeo.id ? "app-card rodeo-card active" : "app-card rodeo-card"}
                key={rodeo.id}
                onClick={() => onOpenRodeo(rodeo)}
              >
                <div>
                  <h3>{rodeo.name}</h3>
                  <p>
                    <MapPin size={14} /> {rodeo.location}
                  </p>
                </div>
                <div className="rodeo-meta">
                  <strong>
                    {rodeo.startDate} - {rodeo.endDate}
                  </strong>
                  <span>{rodeo.payout}</span>
                  {rodeo.hasDaysheets && <em>Daysheets</em>}
                </div>
                <ChevronRight size={18} />
              </button>
            ))}
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
  const [view, setView] = useState<"results" | "daysheets">("results");
  const [selectedDaysheetId, setSelectedDaysheetId] = useState("");
  const selectedDaysheet = daysheets.find((daysheet) => daysheet.id === selectedDaysheetId) ?? daysheets[0];
  const [selectedDaysheetEvent, setSelectedDaysheetEvent] = useState("");

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

  return (
    <div className="stack">
      <section className="app-card detail-screen-header">
        <button onClick={onBack}>Back</button>
        <div>
          <span>{source === "results" ? "Results" : "Schedule"}</span>
          <h2>{rodeo.name}</h2>
          <p>{rodeo.location}</p>
        </div>
      </section>

      <div className="detail-event-filter">
        <SelectChip label="Event" value={event} options={events} onChange={(value) => setEvent(value as EventName)} />
      </div>

      <div className="detail-screen-metrics">
        <div className="app-card">
          <span>Dates</span>
          <strong>
            {rodeo.startDate ? `${rodeo.startDate} - ${rodeo.endDate}` : rodeo.endDate}
          </strong>
        </div>
        <div className="app-card">
          <span>Payout</span>
          <strong>{rodeo.payout}</strong>
        </div>
        <div className="app-card">
          <span>Status</span>
          <strong>{rodeo.inProgress ? "In Progress" : "Posted"}</strong>
        </div>
      </div>

      <section className="app-card detail-section venue-section">
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

      <div className="detail-toggle" aria-label="Rodeo detail view">
        <button className={view === "results" ? "active" : undefined} onClick={() => setView("results")}>
          Results
        </button>
        <button className={view === "daysheets" ? "active" : undefined} onClick={() => setView("daysheets")}>
          Daysheets
        </button>
      </div>

      {view === "results" ? (
        <section className="app-card detail-section">
          <div className="section-title-row">
            <div>
              <span>{event}</span>
              <h3>Leaders</h3>
            </div>
          </div>
          {state === "loading" ? (
            <LoadingState title="Loading results" />
          ) : state === "error" ? (
            <EmptyState title="Results Unavailable" subtitle="This rodeo detail feed could not be loaded." icon={CircleDollarSign} />
          ) : rodeo.winners.length > 0 ? (
            <div className="winner-list">
              {rodeo.winners.map(([place, name, score]) => (
                <div key={`${place}-${name}-${score}`}>
                  <span>{place}</span>
                  <strong>{name}</strong>
                  <em>{score}</em>
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
    </div>
  );
}

export function MoreView({
  section,
  setSection,
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
        <BusinessJournalListingsView rows={businessJournalRows} state={businessJournalState} fallbackRows={scheduleRows} />
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
          followedCount={followedCount}
          favoriteCount={favoriteAthletes.length}
        />
      </SubViewShell>
    );
  }

  return (
    <div className="stack">
      <section className="app-card header-card">
        <span>More Features</span>
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
      <section className="app-card header-card nfr-header-card">
        <span>NFR</span>
        <div>
          <h2>{event}</h2>
          {currentRound ? <strong className="season-label">Round {currentRound}</strong> : null}
        </div>
      </section>

      <div className="chip-grid">
        <SelectChip label="Event" value={event} options={nfrEvents} onChange={(value) => setEvent(value as EventName)} />
        <SelectChip label="Sort" value={sort} options={["Average", "World Standings"]} onChange={setSort} />
      </div>

      {state === "loading" ? (
        <LoadingState title="Loading NFR standings" />
      ) : state === "error" ? (
        <EmptyState title="NFR Standings Unavailable" subtitle="The NFR standings feed could not be loaded." icon={Trophy} />
      ) : sortedRows.length > 0 ? (
        <div className="nfr-card-list">
          {sortedRows.map((contestant) => (
            <article className="app-card nfr-contestant-card" key={contestant.id}>
              <div className="nfr-contestant-main">
                <AthleteAvatar athlete={{ name: contestant.name, imageUrl: contestant.imageUrl }} size="small" />
                <div>
                  <span>World #{contestant.worldPlace || "-"}</span>
                  <h3>{contestant.name}</h3>
                  <p>{contestant.averageDisplayValue}</p>
                </div>
                <strong>AVG #{contestant.averagePlace || "-"}</strong>
              </div>
              <div className="nfr-round-grid">
                {contestant.rounds.map((round) => (
                  <div className={round.pending ? "nfr-round pending" : "nfr-round"} key={round.round}>
                    <span>R{round.round}</span>
                    <strong>{round.displayValue}</strong>
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
  followedCount,
  favoriteCount
}: {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  updateAdConsent: (consent: AppSettings["adConsent"]) => void;
  followedCount: number;
  favoriteCount: number;
}) {
  const themeOptions: Array<{ id: AppSettings["accentTheme"]; label: string; primary: string; secondary: string }> = [
    { id: "classic", label: "Classic", primary: "#4d5d52", secondary: "#a08a59" },
    { id: "arena", label: "Arena", primary: "#31484f", secondary: "#b57935" },
    { id: "river", label: "River", primary: "#29555a", secondary: "#8f7c3f" },
    { id: "rose", label: "Rose", primary: "#61424a", secondary: "#b47852" }
  ];

  return (
    <div className="settings-grid">
      <section className="app-card settings-section">
        <div className="settings-section-title">
          <Settings size={20} />
          <div>
            <strong>Appearance</strong>
            <span>Change app and logo colors on this device.</span>
          </div>
        </div>
        <div className="theme-swatch-grid">
          {themeOptions.map((theme) => (
            <button
              className={settings.accentTheme === theme.id ? "theme-swatch active" : "theme-swatch"}
              key={theme.id}
              onClick={() => updateSettings({ accentTheme: theme.id })}
            >
              <span>
                <i style={{ background: theme.primary }} />
                <i style={{ background: theme.secondary }} />
              </span>
              {theme.label}
            </button>
          ))}
        </div>
      </section>

      <section className="app-card settings-section">
        <div className="settings-section-title">
          <Bell size={20} />
          <div>
            <strong>Follow Alerts</strong>
            <span>{followedCount} athlete{followedCount === 1 ? "" : "s"} followed on this device</span>
          </div>
        </div>
        <label className="settings-toggle-row">
          <span>Enable alert preferences</span>
          <input
            type="checkbox"
            checked={settings.followAlertsEnabled}
            onChange={(event) => updateSettings({ followAlertsEnabled: event.target.checked })}
          />
        </label>
      </section>

      <section className="app-card settings-section">
        <div className="settings-section-title">
          <ListOrdered size={20} />
          <div>
            <strong>Favorite Events</strong>
            <span>Set the default events for standings and results.</span>
          </div>
        </div>
        <label className="settings-select-row">
          <span>Standings Event</span>
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
          <span>Results Event</span>
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
      </section>

      <section className="app-card settings-section">
        <div className="settings-section-title">
          <Heart size={20} />
          <div>
            <strong>Local Preferences</strong>
            <span>{favoriteCount} favorite athlete{favoriteCount === 1 ? "" : "s"} saved in this browser.</span>
          </div>
        </div>
        <label className="settings-toggle-row">
          <span>Compact list rows</span>
          <input
            type="checkbox"
            checked={settings.compactLists}
            onChange={(event) => updateSettings({ compactLists: event.target.checked })}
          />
        </label>
      </section>

      <section className="app-card settings-section">
        <div className="settings-section-title">
          <ShieldCheck size={20} />
          <div>
            <strong>Ads & Privacy</strong>
            <span>Choose how Rodeo Daily can use ad cookies on this device.</span>
          </div>
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
          <strong>{favoriteAthletes.length} athletes</strong>
          <span>Open an athlete to view bio, results, and follow updates.</span>
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
          <span>Search Results</span>
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
              <article className="app-card more-row favorite-athlete-row" key={athlete.id}>
                <button className="favorite-athlete-main" onClick={() => onOpenAthlete(row)}>
                  <AthleteAvatar athlete={athlete} size="small" />
                  <div>
                    <h3>{athlete.name}</h3>
                    <p>
                      {athlete.hometown || "No hometown listed"}
                      {athlete.metric ? ` - ${athlete.metricLabel}: ${athlete.metric}` : ""}
                    </p>
                  </div>
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
  const topCounts = topChampionCounts(champions, selectedEvent);

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
            ? groupedByYear.map(([year, yearChampions]) => (
                <section className="champion-year-group" key={year}>
                  <h3>{year}</h3>
                  <div className="list-stack">
                    {yearChampions.map((champion) => (
                      <ChampionRow champion={champion} key={champion.id} showEvent />
                    ))}
                  </div>
                </section>
              ))
            : visibleChampions.map((champion) => <ChampionRow champion={champion} key={champion.id} showEvent={false} />)}
        </div>
      ) : (
        <EmptyState title="No Champions Found" subtitle="Try changing search or event filters." icon={Trophy} />
      )}
    </div>
  );
}

function ChampionRow({ champion, showEvent }: { champion: PastChampion; showEvent: boolean }) {
  return (
    <article className="app-card champion-row">
      <span>{champion.year}</span>
      <div>
        <h3>{champion.athlete}</h3>
        <p>{[showEvent ? champion.event : "", champion.hometown].filter(Boolean).join(" - ")}</p>
      </div>
    </article>
  );
}

function BusinessJournalListingsView({
  rows,
  state,
  fallbackRows
}: {
  rows: BusinessJournalRow[];
  state: LoadState;
  fallbackRows: RodeoRow[];
}) {
  const [selectedListing, setSelectedListing] = useState<BusinessJournalRow | null>(null);
  const [query, setQuery] = useState("");
  const [sortOption, setSortOption] = useState("Event Date (Soonest)");
  const [dateMode, setDateMode] = useState("All Dates");
  const [range, setRange] = useState<DateRange>({ start: "", end: "" });
  const sourceRows = rows.length > 0 ? rows : fallbackRows.map(mapScheduleToBusinessJournalRow);

  const visibleRows = sourceRows
    .filter((item) => businessJournalMatchesSearch(item, query))
    .filter((item) => businessJournalMatchesDate(item, dateMode, range))
    .sort((left, right) => sortBusinessJournalRows(left, right, sortOption));

  if (selectedListing) {
    return <BusinessJournalListingDetailView item={selectedListing} onBack={() => setSelectedListing(null)} />;
  }

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
          visibleRows.map((item) => (
            <button className="app-card business-listing-card" key={item.id} onClick={() => setSelectedListing(item)}>
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
              {item.eventsText && <p className="listing-events">{item.eventsText}</p>}
              {item.specialEntryFeesText && (
                <p className="listing-fees">
                  <strong>Special Entry Fees: </strong>
                  {item.specialEntryFeesText}
                </p>
              )}
              <ChevronRight size={18} />
            </button>
          ))
        ) : (
          <EmptyState title="No Rodeos" subtitle="There are no matching rodeos right now." icon={Newspaper} />
        )}
      </div>
    </div>
  );
}

function BusinessJournalListingDetailView({ item, onBack }: { item: BusinessJournalRow; onBack: () => void }) {
  const detailFields = item.detailFields.filter((field) => !["Publish Date", "Rodeo Name"].includes(field.label));

  return (
    <div className="business-listing-detail">
      <section className="app-card detail-screen-header">
        <button onClick={onBack}>Back</button>
        <div>
          <span>Rodeo</span>
          <h2>{item.title}</h2>
          {item.dateText && <p>{item.dateText}</p>}
        </div>
      </section>

      <section className="app-card detail-section">
        <div className="section-title-row">
          <div>
            <span>{item.source || "Listing"}</span>
            <h3>{item.subtitle || item.title}</h3>
          </div>
          {item.link && (
            <a href={item.link} target="_blank" rel="noreferrer" aria-label="Open full listing">
              <ExternalLink size={18} />
            </a>
          )}
        </div>

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
      </section>
    </div>
  );
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

      <div className="draw-list">
        {entries.length > 0 ? (
          entries.map((row) => (
            <div className={row.entry.HasTurnout ? "draw-row turnout" : "draw-row"} key={row.entry.EventEntryId ?? row.entry.Name}>
              <span>{row.drawOrder ? row.drawOrder : "-"}</span>
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

      {rerides.length > 0 && (
        <div className="reride-list">
          <h4>Rerides</h4>
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
          <Bell size={22} />
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
  toggleFavoriteAthlete,
  toggleFollowedAthlete
}: {
  athlete: StandingRow;
  bio: AthleteBio | null;
  state: LoadState;
  toggleFavoriteAthlete: (athlete: StandingRow) => void;
  toggleFollowedAthlete: (athleteId: number) => void;
}) {
  const displayImageAthlete = bio?.imageUrl ? { name: bio.name || athlete.name, imageUrl: bio.imageUrl } : athlete;

  return (
    <div className="detail-card">
      <span className="kicker">Athlete Bio</span>
      <AthleteAvatar athlete={displayImageAthlete} size="detail" />
      <h2>{bio?.name || athlete.name}</h2>
      <p>{bio?.hometown || athlete.hometown || "No hometown listed"}</p>
      <div className="metric-grid">
        <div>
          <span>Rank</span>
          <strong>#{athlete.place}</strong>
        </div>
        <div>
          <span>{athlete.metricLabel}</span>
          <strong>{athlete.metric}</strong>
        </div>
      </div>

      {state === "loading" && (
        <div className="athlete-bio-section">
          <span className="loader" />
          <strong>Loading athlete profile</strong>
        </div>
      )}

      {state === "error" && (
        <div className="athlete-bio-section">
          <strong>Profile unavailable</strong>
          <p>The full athlete profile could not be loaded right now.</p>
        </div>
      )}

      {state === "loaded" && bio && (
        <>
          <div className="athlete-stat-grid">
            {bio.age !== null && (
              <div>
                <span>Age</span>
                <strong>{bio.age}</strong>
              </div>
            )}
            {bio.totalEarnings && (
              <div>
                <span>Total</span>
                <strong>{bio.totalEarnings}</strong>
              </div>
            )}
            {bio.yearEarnings && (
              <div>
                <span>This Year</span>
                <strong>{bio.yearEarnings}</strong>
              </div>
            )}
            {bio.worldTitles !== null && (
              <div>
                <span>World Titles</span>
                <strong>{bio.worldTitles}</strong>
              </div>
            )}
            {bio.nfrQualifications !== null && (
              <div>
                <span>NFR Qual.</span>
                <strong>{bio.nfrQualifications}</strong>
              </div>
            )}
          </div>

          {bio.biographyText && (
            <section className="athlete-bio-section">
              <strong>Bio</strong>
              <p>{bio.biographyText}</p>
            </section>
          )}

          {bio.rankings.length > 0 && (
            <section className="athlete-bio-section">
              <strong>Rankings</strong>
              <div className="athlete-ranking-list">
                {bio.rankings.map((ranking) => (
                  <div key={ranking.id}>
                    <span>{ranking.rank}</span>
                    <p>
                      {ranking.eventName}
                      {ranking.season ? ` - ${ranking.season}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {bio.recentResults.length > 0 && (
            <section className="athlete-bio-section">
              <strong>Recent Results</strong>
              <div className="athlete-result-list">
                {bio.recentResults.map((result) => (
                  <div key={result.id}>
                    <h3>{result.rodeoName}</h3>
                    <p>{[result.location, result.eventType, result.round].filter(Boolean).join(" - ")}</p>
                    <span>
                      {result.place ? `#${result.place}` : "Result"} {result.resultValue || result.payoff}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <div className="detail-actions">
        <button onClick={() => toggleFavoriteAthlete(athlete)}>
          <Star size={17} fill={athlete.favorite ? "currentColor" : "none"} />
          {athlete.favorite ? "Favorited" : "Favorite"}
        </button>
        <button onClick={() => toggleFollowedAthlete(athlete.id)}>
          <Bell size={17} fill={athlete.followed ? "currentColor" : "none"} />
          {athlete.followed ? "Following" : "Follow"}
        </button>
      </div>
    </div>
  );
}

export function AthleteProfileScreen({
  athlete,
  bio,
  state,
  onBack,
  toggleFavoriteAthlete,
  toggleFollowedAthlete
}: {
  athlete: StandingRow;
  bio: AthleteBio | null;
  state: LoadState;
  onBack: () => void;
  toggleFavoriteAthlete: (athlete: StandingRow) => void;
  toggleFollowedAthlete: (athleteId: number) => void;
}) {
  return (
    <div className="stack athlete-profile-screen">
      <section className="app-card subview-header">
        <button onClick={onBack}>Back</button>
        <h2>{bio?.name || athlete.name}</h2>
      </section>
      <AthleteDetailPane
        athlete={athlete}
        bio={bio}
        state={state}
        toggleFavoriteAthlete={toggleFavoriteAthlete}
        toggleFollowedAthlete={toggleFollowedAthlete}
      />
    </div>
  );
}

function AthleteAvatar({ athlete, size }: { athlete: Pick<StandingRow, "name" | "imageUrl">; size: "small" | "card" | "detail" }) {
  const className = `athlete-avatar ${size}`;
  if (athlete.imageUrl) {
    return (
      <span className={className}>
        <Image src={athlete.imageUrl} alt="" fill sizes={size === "detail" ? "132px" : size === "card" ? "92px" : "42px"} />
      </span>
    );
  }

  return <span className={`${className} fallback`}>{initialsFor(athlete.name)}</span>;
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
    <div className="date-range-filter">
      <span>Dates</span>
      <label>
        From
        <input type="date" value={value.start} onChange={(event) => onChange({ ...value, start: event.target.value })} />
      </label>
      <label>
        To
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

function EmptyState({ title, subtitle, icon: Icon }: { title: string; subtitle: string; icon: LucideIcon }) {
  return (
    <div className="empty-state">
      <Icon size={28} />
      <strong>{title}</strong>
      <span>{subtitle}</span>
    </div>
  );
}
