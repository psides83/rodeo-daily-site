export type Tab = "Standings" | "Results" | "Schedule" | "More";
export type StandingType =
  | "World Standings"
  | "Playoff Series"
  | "Rookie"
  | "Circuit"
  | "Xtreme Bulls"
  | "Xtreme Broncs"
  | "Permit"
  | "Legacy Steer Roping";
export type EventName =
  | "Bareback Riding"
  | "Steer Wrestling"
  | "Team Roping"
  | "Saddle Bronc Riding"
  | "Tie-Down Roping"
  | "Barrel Racing"
  | "Bull Riding"
  | "Breakaway Roping";

export type EventCode = "BB" | "SW" | "TR" | "SB" | "TD" | "GB" | "BR" | "SR" | "LB";
export type LoadState = "idle" | "loading" | "loaded" | "error";
export type MoreSection = "menu" | "favorites" | "nfr" | "listings" | "champions" | "settings";
export type RodeoDetailSource = "results" | "schedule";
export type DateRange = {
  start: string;
  end: string;
};

export type CircuitOption = {
  id: string;
  title: string;
};

export type AppSettings = {
  accentTheme: "classic" | "arena" | "river" | "rose";
  favoriteStandingsEvent: EventName;
  favoriteResultsEvent: EventName;
  followAlertsEnabled: boolean;
  compactLists: boolean;
  adConsent: "unset" | "personalized" | "nonPersonalized" | "declined";
  consentUpdatedAt: string;
};

export type StandingRow = {
  id: number;
  place: number;
  name: string;
  hometown: string;
  imageUrl: string | null;
  metric: string;
  metricLabel: string;
  followed: boolean;
  favorite: boolean;
};

export type RodeoRow = {
  id: number;
  name: string;
  location: string;
  venueName: string;
  websiteUrl: string | null;
  startDate: string;
  endDate: string;
  startDateRaw?: string;
  endDateRaw?: string;
  payout: string;
  event?: EventName;
  hasDaysheets: boolean;
  inProgress: boolean;
  winners: Array<[string, string, string]>;
  resultRounds: RodeoResultRound[];
};

export type RodeoResultRound = {
  id: string;
  label: string;
  rows: RodeoResultRow[];
};

export type RodeoResultRow = {
  id: string;
  contestantId: number;
  place: string;
  name: string;
  hometown: string;
  imageUrl: string | null;
  payoff: string;
  value: string;
  teamId: number | null;
};

export type BusinessJournalRow = {
  id: string;
  title: string;
  subtitle: string;
  dateText: string;
  eventStartDate: string | null;
  eventEndDate: string | null;
  locationText: string;
  eventsText: string;
  perfsText: string;
  specialEntryFeesText: string;
  addedMoneyText: string;
  addedMoneyTotal: number | null;
  entryWindowText: string;
  source: string;
  link: string | null;
  detailFields: Array<{ id: string; label: string; value: string }>;
};

export type SavedAthlete = Pick<StandingRow, "id" | "name" | "hometown" | "imageUrl" | "metric" | "metricLabel">;

export type AthleteSearchRow = SavedAthlete & {
  favorite: boolean;
};

export type PastChampion = {
  id: string;
  year: number;
  event: string;
  athlete: string;
  hometown: string;
};

export type NfrRoundResult = {
  round: number;
  displayValue: string;
  pending: boolean;
  hasResult: boolean;
};

export type NfrContestant = {
  id: number;
  worldPlace: number;
  currentRound: number;
  contestantId: number;
  averagePlace: number;
  averageScore: string;
  eventType: string;
  imageUrl: string | null;
  name: string;
  averageDisplayValue: string;
  rounds: NfrRoundResult[];
};

export type AthleteBio = {
  id: number;
  name: string;
  hometown: string;
  imageUrl: string | null;
  age: number | null;
  totalEarnings: string;
  yearEarnings: string;
  worldTitles: number | null;
  nfrQualifications: number | null;
  dateJoined: string;
  biography: AthleteBiography;
  events: string[];
  rankings: AthleteBioRanking[];
  recentResults: AthleteBioResult[];
  career: AthleteCareerSeason[];
  highlights: AthleteHighlightVideo[];
};

export type AthleteBiography = {
  facts: AthleteBiographyFact[];
  summary: string[];
  sections: AthleteBiographySection[];
};

export type AthleteBiographyFact = {
  id: string;
  label: string;
  value: string;
};

export type AthleteBiographySection = {
  id: string;
  title: string;
  paragraphs: string[];
};

export type AthleteBioRanking = {
  id: string;
  rank: string;
  rankType: string;
  eventName: string;
  season: number;
};

export type AthleteBioResult = {
  id: string;
  rodeoName: string;
  location: string;
  eventType: string;
  place: number;
  payoff: string;
  resultValue: string;
  round: string;
  endDate: string;
  season: number;
};

export type AthleteCareerSeason = {
  id: string;
  season: number;
  eventType: string;
  earnings: string;
  worldTitles: number;
  nfrQualified: boolean;
};

export type AthleteHighlightVideo = {
  id: string;
  path: string;
};

export type DaysheetRow = {
  id: string;
  startDisplay: string;
  roundDisplay: string;
  eventNames: string[];
  eventsByName: Record<string, DaysheetEventGroup>;
};

export type ApiPosition = {
  ContestantId?: number | string;
  contestant_id?: number | string;
  StandingId?: number | string;
  standing_id?: number | string;
  id?: number | string;
  FirstName?: string;
  first_name?: string;
  LastName?: string;
  last_name?: string;
  NickName?: string;
  nick_name?: string;
  Hometown?: string;
  hometown?: string;
  SidearmPhotoUrl?: string | null;
  image_315_url?: string | null;
  photo_url?: string | null;
  image_url?: string | null;
  Earnings?: number | string;
  earnings?: number | string;
  Points?: number | string;
  points?: number | string;
  Place?: number | string;
  place?: number | string;
  Event?: string;
  event?: string;
  event_abbrev?: string;
  Type?: string;
  type?: string;
  standing_type?: string;
  SeasonYear?: number | string;
  season_year?: number | string;
  TourId?: number | string | null;
  tour_id?: number | string | null;
  CircuitId?: number | string | null;
  circuit_id?: number | string | null;
};

export type ApiRodeo = {
  RodeoId?: number;
  Name?: string;
  City?: string;
  StateAbbrv?: string;
  StartDate?: string;
  EndDate?: string;
  Payout?: number;
  InProgress?: boolean;
  HasDaysheets?: boolean;
  VenueName?: string | null;
  WebsiteUrl?: string | null;
  ApResults?: string | null;
};

export type ApiRound = {
  Payoff?: number;
  Place?: number;
  Score?: number;
  Time?: number;
  GoRound?: number;
  GoRoundLabel?: string;
  Contestant?: Array<{
    ContestantId?: number;
    FirstName?: string;
    LastName?: string;
    NickName?: string;
    Hometown?: string | null;
    SidearmPhotoUrl?: string | null;
    PhotoUrl?: string | null;
    image_315_url?: string | null;
  }>;
  TeamId?: number | null;
};

export type ApiRodeoResults = {
  data?: Array<{
    Events?: Partial<Record<EventCode, Record<string, ApiRound[]>>>;
  }>;
};

export type ApiDaysheetResponse = {
  data?: Record<string, Record<string, Record<string, DaysheetEventGroup>>>;
};

export type ApiBusinessJournalResponse = {
  source?: string;
  listings?: ApiBusinessJournalListing[];
};

export type ApiBusinessJournalListing = {
  index?: number;
  summaryText?: string;
  publishDate?: string;
  location?: string;
  eventDates?: string;
  eventName?: string;
  tour?: string;
  detailLines?: string[];
  detailText?: string;
  fields?: {
    arena?: string;
    address?: string;
    eventDateRange?: {
      startDate?: string;
      endDate?: string;
    };
    perfs?: {
      perfsCount?: number;
      perfDates?: string[];
    };
    slacks?: {
      raw?: string;
      isoDateTimes?: string[];
    };
    events?: Array<{
      event?: string;
      addedMoney?: number;
    }>;
    entryFees?: Array<{
      event?: string;
      fees?: string;
    }>;
    permits?: string;
    groundRules?: string;
    stockContractor?: string;
    subContractors?: string;
    entriesOpen?: string;
    entriesClose?: string;
    tour?: string;
  };
};

export type ApiAthleteBioResponse = {
  data?: ApiAthleteBio;
};

export type ApiNfrStandingsResponse = {
  data?: {
    data?: ApiNfrContestant[];
  };
};

export type ApiNfrContestant = {
  Id?: number;
  WorldPlace?: number;
  CurrentGo?: number;
  ContestantId?: number;
  AveragePlace?: number;
  AverageScore?: string;
  EventType?: string;
  SidearmPhotoUrl?: string | null;
  FirstName?: string;
  LastName?: string;
  Go1Result?: string;
  Go1Place?: string;
  Go2Result?: string;
  Go2Place?: string;
  Go3Result?: string;
  Go3Place?: string;
  Go4Result?: string;
  Go4Place?: string;
  Go5Result?: string;
  Go5Place?: string;
  Go6Result?: string;
  Go6Place?: string;
  Go7Result?: string;
  Go7Place?: string;
  Go8Result?: string;
  Go8Place?: string;
  Go9Result?: string;
  Go9Place?: string;
  Go10Result?: string;
  Go10Place?: string;
};

export type ApiAthleteSearchResponse = {
  data?: ApiAthleteSearchEntry[];
};

export type ApiAthleteSearchEntry = {
  ContestantId?: number;
  FirstName?: string;
  LastName?: string;
  NickName?: string;
  Hometown?: string;
  image_315_url?: string | null;
  PhotoUrl?: string | null;
};

export type ApiAthleteBio = {
  ContestantId?: number;
  FirstName?: string;
  LastName?: string;
  NickName?: string | null;
  Hometown?: string;
  PhotoUrl?: string | null;
  image_315_url?: string | null;
  Age?: number | null;
  TotalEarnings?: number | null;
  YearEarnings?: number | null;
  WorldTitles?: number | null;
  NFRQualifications?: number | null;
  DateJoined?: string | null;
  BiographyText?: string;
  VideoHighlights?: string | null;
  EventTypes?: string[];
  Rankings?: Array<{
    Rank?: string;
    RankType?: string;
    EventName?: string;
    Season?: number;
  }>;
  Results?: Array<{
    RodeoId?: number;
    RodeoName?: string;
    City?: string;
    StateAbbrv?: string;
    EndDate?: string;
    RodeoResultId?: number;
    EventType?: string;
    Place?: number;
    Payoff?: number;
    Time?: number;
    Score?: number;
    Round?: string;
  }>;
  Career?: Array<{
    Season?: number;
    EventType?: string;
    Earnings?: number;
    WorldTitles?: number;
    NFRQualified?: boolean;
  }>;
};

export type DaysheetEventGroup = {
  Events?: DaysheetEntry[];
  Rerides?: DaysheetReride[];
};

export type DaysheetEntry = {
  EventEntryId?: number;
  GoPosition?: number | null;
  ContestantNumber?: number | null;
  HasTurnout?: boolean;
  Name?: string;
  Hometown?: string | null;
  Brand?: string | null;
  StockName?: string | null;
  ContractorInitials?: string | null;
};

export type DaysheetReride = {
  RerideEntryId?: number;
  RerideNumber?: number | null;
  Brand?: string | null;
  StockName?: string | null;
  ContractorInitials?: string | null;
};
