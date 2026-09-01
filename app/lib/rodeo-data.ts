import type {
  ApiAthleteBioResponse,
  ApiAthleteSearchResponse,
  ApiBusinessJournalListing,
  ApiBusinessJournalResponse,
  ApiDaysheetResponse,
  ApiNfrContestant,
  ApiNfrStandingsResponse,
  ApiPosition,
  ApiRodeo,
  ApiRodeoResults,
  ApiRound,
  AthleteBio,
  AthleteSearchRow,
  BusinessJournalRow,
  CircuitOption,
  DateRange,
  DaysheetEntry,
  DaysheetEventGroup,
  DaysheetRow,
  EventCode,
  EventName,
  NfrContestant,
  PastChampion,
  RodeoResultRound,
  RodeoRow,
  StandingRow,
  StandingType,
  TopMoneyEarner
} from "./types";

export const events: EventName[] = [
  "Bareback Riding",
  "Steer Wrestling",
  "Team Roping",
  "Saddle Bronc Riding",
  "Tie-Down Roping",
  "Barrel Racing",
  "Bull Riding",
  "Steer Roping",
  "Breakaway Roping"
];

export const standingEvents: EventName[] = [
  "All Around",
  "Bareback Riding",
  "Steer Wrestling",
  "Team Roping (Headers)",
  "Team Roping (Heelers)",
  "Saddle Bronc Riding",
  "Tie-Down Roping",
  "Barrel Racing",
  "Bull Riding",
  "Steer Roping",
  "Breakaway Roping"
];

const rodeoResultListLimit = 20;

export const standingTypeOptions: StandingType[] = [
  "World Standings",
  "Playoff Series",
  "Rookie",
  "Circuit",
  "Xtreme Bulls",
  "Xtreme Broncs",
  "Permit",
  "Legacy Steer Roping"
];

export const circuits: CircuitOption[] = [
  { id: "1", title: "Columbia River" },
  { id: "2", title: "California" },
  { id: "3", title: "Wilderness" },
  { id: "4", title: "Montana" },
  { id: "5", title: "Mountain States" },
  { id: "6", title: "Turquoise" },
  { id: "7", title: "Texas" },
  { id: "8", title: "Prairie" },
  { id: "9", title: "Great Lakes" },
  { id: "10", title: "Southeastern" },
  { id: "11", title: "First Frontier" },
  { id: "12", title: "Maple Leaf" },
  { id: "13", title: "Badlands" },
  { id: "14", title: "Mexico" },
  { id: "15", title: "Brazil" }
];

export const defaultCircuitId = circuits[0].id;

export const singleEventStandingTypes = new Set<StandingType>(["Xtreme Bulls", "Xtreme Broncs", "Legacy Steer Roping"]);

export const eventCodes: Record<EventName, EventCode> = {
  "All Around": "AA",
  "Bareback Riding": "BB",
  "Steer Wrestling": "SW",
  "Team Roping": "TR",
  "Team Roping (Headers)": "TRHD",
  "Team Roping (Heelers)": "TRHL",
  "Saddle Bronc Riding": "SB",
  "Tie-Down Roping": "TD",
  "Barrel Racing": "GB",
  "Bull Riding": "BR",
  "Xtreme Bulls": "XB",
  "Steer Roping": "SR",
  "Breakaway Roping": "LB"
};

export const standingTypes: Record<StandingType, string> = {
  "World Standings": "world",
  "Playoff Series": "playoffSeries",
  Rookie: "rookie",
  Circuit: "circuit",
  "Xtreme Bulls": "xtremeBulls",
  "Xtreme Broncs": "xtremeBroncs",
  Permit: "permit",
  "Legacy Steer Roping": "legacySteerRoping"
};

export function standingEventsForType(type: StandingType) {
  if (type === "Playoff Series") {
    return standingEvents.filter((event) => event !== "All Around" && event !== "Barrel Racing" && event !== "Breakaway Roping");
  }

  return standingEvents;
}

export function normalizeStandingEventForType(event: EventName, type: StandingType): EventName {
  const normalizedEvent = event === "Team Roping" ? "Team Roping (Headers)" : event === "Xtreme Bulls" ? "All Around" : event;
  const availableEvents = standingEventsForType(type);
  return availableEvents.includes(normalizedEvent) ? normalizedEvent : "Bareback Riding";
}

export function standingTypeHasEvents(type: StandingType) {
  return !singleEventStandingTypes.has(type);
}

export async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Request failed with ${response.status}`);
  return response.json() as Promise<T>;
}

export function dateRangeParams(resource: "results-rodeos" | "schedule", range: DateRange, searchText = "", index = 1) {
  const params = new URLSearchParams({ resource });
  params.set("index", String(index));
  if (range.start) params.set("start", range.start);
  if (range.end) params.set("end", range.end);
  const query = searchText.trim();
  if (query) params.set("search", query);
  return params;
}

export function mapPosition(position: ApiPosition): StandingRow {
  const id =
    numberValue(
      position.ContestantId ?? position.contestant_id ?? position.StandingId ?? position.standing_id ?? position.id ?? position.Place ?? position.place
    ) ?? Math.random();
  const first = cleanText(position.FirstName ?? position.first_name);
  const last = cleanText(position.LastName ?? position.last_name);
  const nick = cleanText(position.NickName ?? position.nick_name);
  const name = `${nick || first} ${last}`.trim() || "Unknown Athlete";
  const tourId = numberValue(position.TourId ?? position.tour_id);
  const isPoints = tourId === 2;
  const earnings = numberValue(position.Earnings ?? position.earnings) ?? 0;
  const points = numberValue(position.Points ?? position.points) ?? 0;

  return {
    id,
    place: numberValue(position.Place ?? position.place) ?? 0,
    name,
    hometown: cleanText(position.Hometown ?? position.hometown),
    imageUrl: normalizeAthleteImageUrl(position.SidearmPhotoUrl ?? position.image_315_url ?? position.photo_url ?? position.image_url),
    metric: isPoints ? formatNumber(points) : formatCurrency(earnings),
    metricLabel: isPoints ? "Points" : "Earnings",
    followed: false,
    favorite: false
  };
}

export function sortStandingsPositions(positions: ApiPosition[]) {
  return positions.slice().sort((left, right) => {
    const leftPlace = numberValue(left.Place ?? left.place) ?? Number.MAX_SAFE_INTEGER;
    const rightPlace = numberValue(right.Place ?? right.place) ?? Number.MAX_SAFE_INTEGER;
    if (leftPlace !== rightPlace) return leftPlace - rightPlace;

    const leftEarnings = numberValue(left.Earnings ?? left.earnings) ?? 0;
    const rightEarnings = numberValue(right.Earnings ?? right.earnings) ?? 0;
    return rightEarnings - leftEarnings;
  });
}

function numberValue(value: number | string | null | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const parsed = Number(value.replace(/[$,]/g, "").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

export function mapAthleteBio(payload: ApiAthleteBioResponse): AthleteBio | null {
  const bio = payload.data;
  if (!bio?.ContestantId) return null;
  const first = bio.FirstName?.trim() ?? "";
  const last = bio.LastName?.trim() ?? "";
  const nick = bio.NickName?.trim();
  const name = `${nick || first} ${last}`.trim();

  return {
    id: bio.ContestantId,
    name,
    hometown: bio.Hometown?.trim() ?? "",
    imageUrl: normalizeAthleteImageUrl(bio.image_315_url ?? bio.PhotoUrl),
    age: bio.Age ?? null,
    totalEarnings: bio.TotalEarnings ? formatCurrency(bio.TotalEarnings) : "",
    yearEarnings: bio.YearEarnings ? formatCurrency(bio.YearEarnings) : "",
    worldTitles: bio.WorldTitles ?? null,
    nfrQualifications: bio.NFRQualifications ?? null,
    dateJoined: formatDate(bio.DateJoined ?? undefined),
    biography: parseAthleteBiography(bio.BiographyText),
    events: athleteBioEvents(bio),
    earnings: mapAthleteBioEarnings(bio.Earnings),
    rankings: (bio.Rankings ?? []).map((ranking, index) => ({
      id: `${ranking.EventName ?? "event"}-${ranking.Season ?? index}-${ranking.RankType ?? "rank"}`,
      rank: ranking.Rank?.trim() ?? "Unranked",
      rankType: ranking.RankType?.trim() ?? "",
      eventName: ranking.EventName?.trim() ?? "",
      season: ranking.Season ?? 0
    })),
    recentResults: [...(bio.Results ?? []), ...(bio.Averages ?? [])]
      .slice()
      .sort((left, right) => (right.EndDate ?? "").localeCompare(left.EndDate ?? ""))
      .map((result, index) => ({
        id: `${athleteResultId(result) ?? "result"}-${index}`,
        rodeoId: result.RodeoId ?? 0,
        rodeoName: result.RodeoName?.trim() ?? "Unnamed Rodeo",
        location: [result.City, result.StateAbbrv].filter(Boolean).join(", "),
        eventType: result.EventType?.trim() ?? "",
        place: result.Place ?? 0,
        payoff: formatOptionalCurrency(result.Payoff),
        resultValue: formatAthleteResultValue(result.EventType, result.Time, result.Score),
        round: result.Round?.trim() ?? "",
        endDate: formatDate(result.EndDate),
        endDateRaw: result.EndDate ?? "",
        season: athleteResultSeason(result)
      })),
    career: (bio.Career ?? [])
      .slice()
      .sort((left, right) => (right.Season ?? 0) - (left.Season ?? 0))
      .map((season, index) => ({
        id: `${season.Season ?? index}-${season.EventType ?? "event"}`,
        season: season.Season ?? 0,
        eventType: season.EventType?.trim() ?? "",
        earnings: formatOptionalCurrency(season.Earnings),
        worldTitles: season.WorldTitles ?? 0,
        nfrQualified: Boolean(season.NFRQualified)
      })),
    highlights: parseHighlightVideos(bio.VideoHighlights)
  };
}

function parseHighlightVideos(value?: string | null) {
  const seen = new Set<string>();
  return (value ?? "")
    .split(",")
    .map((path) => path.trim().replace("/videos", "/video"))
    .filter(Boolean)
    .flatMap((path) => {
      const id = path
        .split("/")
        .map((segment) => segment.trim())
        .reverse()
        .find((segment) => /^\d+$/.test(segment));
      if (!id || seen.has(id)) return [];
      seen.add(id);
      return [{ id, path }];
    })
    .sort((left, right) => right.id.localeCompare(left.id));
}

function athleteBioEvents(bio: NonNullable<ApiAthleteBioResponse["data"]>) {
  const eventsFromResults = [...(bio.Results ?? []), ...(bio.Averages ?? [])].map((result) => cleanText(result.EventType)).filter(Boolean);
  return Array.from(new Set([...eventsFromResults, ...(bio.EventTypes ?? []).map(cleanText).filter(Boolean)]));
}

function mapAthleteBioEarnings(earnings?: NonNullable<ApiAthleteBioResponse["data"]>["Earnings"]) {
  return Object.fromEntries(
    Object.entries(earnings ?? {}).map(([season, rows]) => [
      season,
      rows.map((row) => ({
        seasonYear: row.SeasonYear ?? (Number(season) || 0),
        earnings: row.Earnings ?? 0,
        eventType: cleanText(row.EventType)
      }))
    ])
  );
}

export function mapAthleteSearchRows(payload: ApiAthleteSearchResponse, favoriteIds: number[]): AthleteSearchRow[] {
  const favorites = new Set(favoriteIds);
  return (payload.data ?? []).flatMap((athlete) => {
    const id = athlete.ContestantId ?? 0;
    if (!id) return [];
    const first = athlete.FirstName?.trim() ?? "";
    const last = athlete.LastName?.trim() ?? "";
    const nick = athlete.NickName?.trim();
    const name = `${nick || first} ${last}`.trim();
    if (!name) return [];
    return [
      {
        id,
        name,
        hometown: athlete.Hometown?.trim() ?? "",
        imageUrl: normalizeAthleteImageUrl(athlete.image_315_url ?? athlete.PhotoUrl),
        metric: "",
        metricLabel: "Profile",
        favorite: favorites.has(id)
      }
    ];
  });
}

export function mapPastChampions(payload: PastChampion[]): PastChampion[] {
  return payload
    .filter((champion) => champion.id && champion.year && champion.event && champion.athlete)
    .sort((left, right) => {
      if (left.year !== right.year) return right.year - left.year;
      if (left.event !== right.event) return left.event.localeCompare(right.event);
      return left.athlete.localeCompare(right.athlete);
    });
}

export function mapNfrStandings(payload: ApiNfrStandingsResponse): NfrContestant[] {
  return (payload.data?.data ?? [])
    .filter((contestant) => contestant.Id && contestant.ContestantId)
    .map((contestant) => {
      const averagePlace = contestant.AveragePlace ?? 0;
      const currentRound = contestant.CurrentGo ?? 0;
      const eventType = cleanText(contestant.EventType);
      const isRoughStock = isRoughStockCode(eventType);
      const averageScore = formatNfrResultDisplay(cleanText(contestant.AverageScore), isRoughStock);
      const firstName = cleanText(contestant.FirstName);
      const lastName = cleanText(contestant.LastName);
      const rounds = makeNfrRounds(contestant, currentRound, isRoughStock);

      return {
        id: contestant.Id ?? contestant.ContestantId ?? 0,
        worldPlace: contestant.WorldPlace ?? 0,
        currentRound,
        contestantId: contestant.ContestantId ?? 0,
        averagePlace,
        averageScore,
        eventType,
        imageUrl: normalizeAthleteImageUrl(contestant.SidearmPhotoUrl),
        name: `${firstName} ${lastName}`.trim() || "Unknown Athlete",
        averageDisplayValue: `${ordinal(averagePlace)} in the AVG with ${averageScore || "-"} on ${rounds.filter((round) => round.hasResult).length}`,
        rounds
      };
    });
}

export function championEvents(champions: PastChampion[]) {
  return ["All Events", ...Array.from(new Set(champions.map((champion) => champion.event))).sort()];
}

export function filterChampions(champions: PastChampion[], event: string, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  return champions.filter((champion) => {
    const matchesEvent = event === "All Events" || champion.event === event;
    const matchesSearch =
      !normalizedQuery ||
      champion.athlete.toLowerCase().includes(normalizedQuery) ||
      champion.event.toLowerCase().includes(normalizedQuery) ||
      champion.hometown.toLowerCase().includes(normalizedQuery) ||
      String(champion.year).includes(normalizedQuery);
    return matchesEvent && matchesSearch;
  });
}

export function topChampionCounts(champions: PastChampion[], event: string) {
  if (event === "All Events") return [];
  const counts = new Map<string, number>();
  for (const champion of champions.filter((item) => item.event === event)) {
    counts.set(champion.athlete, (counts.get(champion.athlete) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([name, titles]) => ({ name, titles }))
    .sort((left, right) => (left.titles === right.titles ? left.name.localeCompare(right.name) : right.titles - left.titles))
    .slice(0, 5);
}

export function normalizeAthleteImageUrl(value?: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("/")) return `https://d1kfpvgfupbmyo.cloudfront.net${trimmed}`;
  return `https://d1kfpvgfupbmyo.cloudfront.net/${trimmed}`;
}

function formatAthleteResultValue(eventType?: string, time?: number, score?: number) {
  const isRoughStock = ["BB", "SB", "BR"].includes((eventType ?? "").toUpperCase());
  const value = isRoughStock ? score : time;
  if (!value || value === -99) return isRoughStock ? "NS" : "NT";
  return isRoughStock ? formatNumber(value) : formatTimedResult(value);
}

function athleteResultSeason(result: { RodeoName?: string; EndDate?: string; SeasonYear?: number }) {
  const seasonYear = result.SeasonYear ?? rodeoSeasonYearFromDate(result.EndDate);
  if (!seasonYear) return 0;
  return isNationalFinalsRodeo(result.RodeoName) ? seasonYear - 1 : seasonYear;
}

function athleteResultId(result: { RodeoId?: number; RodeoResultId?: number; AggregateId?: number }) {
  return result.RodeoResultId ?? result.AggregateId ?? result.RodeoId;
}

function rodeoSeasonYearFromDate(value?: string) {
  if (!value) return 0;
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.getMonth() >= 9 ? date.getFullYear() + 1 : date.getFullYear();
  }
  const match = value.match(/\b(19|20)\d{2}\b/);
  return match ? Number(match[0]) : 0;
}

function isNationalFinalsRodeo(value?: string) {
  return (value ?? "").toLowerCase().includes("national finals");
}

export function normalizeWebsiteUrl(value?: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const fixed = trimmed.replace(/^http:\/\/https:\/\//i, "https://");
  if (fixed.startsWith("http://") || fixed.startsWith("https://")) return fixed;
  return `https://${fixed}`;
}

export function mapBusinessJournalRows(payload: ApiBusinessJournalResponse): BusinessJournalRow[] {
  const seen = new Set<string>();
  return (payload.listings ?? []).flatMap((listing, index) => {
    const item = makeBusinessJournalRow(listing, index, payload.source);
    if (!item || seen.has(item.id)) return [];
    seen.add(item.id);
    return [item];
  });
}

export function makeBusinessJournalRow(listing: ApiBusinessJournalListing, fallbackIndex: number, sourceUrl?: string): BusinessJournalRow | null {
  const fields = listing.fields;
  const eventStartDate = cleanText(fields?.eventDateRange?.startDate);
  const eventEndDate = cleanText(fields?.eventDateRange?.endDate);
  const locationText = cleanText(listing.location);
  const subtitle = cleanText(listing.eventName) || cleanText(listing.summaryText);
  const title = locationText || subtitle;
  if (!title) return null;

  const eventsRows = fields?.events ?? [];
  const addedMoneyTotal = eventsRows.length > 0 ? eventsRows.reduce((sum, event) => sum + (event.addedMoney ?? 0), 0) : null;
  const eventsText = formatBusinessJournalEvents(eventsRows);
  const specialEntryFeesText = formatBusinessJournalEntryFees(fields?.entryFees ?? []);
  const perfsText = formatBusinessJournalPerfs(fields?.perfs);
  const slacksText = formatBusinessJournalSlacks(fields?.slacks);
  const openText = formatBusinessJournalDateTime(fields?.entriesOpen) || cleanText(fields?.entriesOpen);
  const closeText = formatBusinessJournalDateTime(fields?.entriesClose) || cleanText(fields?.entriesClose);
  const entryWindowText = [openText, closeText].filter(Boolean).join(" - ");
  const dateText = makeBusinessJournalDateText(eventStartDate, eventEndDate, cleanText(listing.eventDates) || cleanText(listing.publishDate));
  const detailFields = [
    detailField("publish_date", "Publish Date", formatBusinessJournalDate(listing.publishDate) || listing.publishDate),
    detailField("rodeo_name", "Rodeo Name", subtitle),
    detailField("arena", "Arena", fields?.arena),
    detailField("address", "Address", fields?.address),
    detailField("perfs", "Perfs", perfsText),
    detailField("slacks", "Slacks", slacksText),
    detailField("events", "Events", eventsText),
    detailField("special_entry_fees", "Special Entry Fees", specialEntryFeesText),
    detailField("permits", "Permits", fields?.permits),
    detailField("ground_rules", "Ground Rules", fields?.groundRules),
    detailField("stock_contractor", "Stk Cont.", fields?.stockContractor),
    detailField("sub_contractors", "Sub Contractors", fields?.subContractors),
    detailField("entries_open", "EO", openText),
    detailField("entries_close", "EC", closeText)
  ].filter(Boolean) as BusinessJournalRow["detailFields"];

  return {
    id: `pbj-${listing.index ?? fallbackIndex}-${title}`,
    title,
    subtitle: subtitle === title ? "" : subtitle,
    dateText,
    eventStartDate,
    eventEndDate,
    locationText,
    eventsText,
    perfsText,
    specialEntryFeesText,
    addedMoneyText: addedMoneyTotal ? formatCurrency(addedMoneyTotal) : "",
    addedMoneyTotal,
    entryWindowText,
    source: cleanText(listing.tour) || cleanText(fields?.tour),
    link: sourceUrl ?? "https://pbj.prorodeo.org/",
    detailFields
  };
}

export function mapScheduleToBusinessJournalRow(rodeo: RodeoRow): BusinessJournalRow {
  return {
    id: `schedule-${rodeo.id}`,
    title: rodeo.name,
    subtitle: rodeo.venueName,
    dateText: `${rodeo.startDate} - ${rodeo.endDate}`,
    eventStartDate: parseDisplayDateToISO(rodeo.startDate),
    eventEndDate: parseDisplayDateToISO(rodeo.endDate),
    locationText: rodeo.location,
    eventsText: "",
    perfsText: "",
    specialEntryFeesText: "",
    addedMoneyText: rodeo.payout,
    addedMoneyTotal: moneyToNumber(rodeo.payout),
    entryWindowText: "",
    source: "Schedule",
    link: rodeo.websiteUrl,
    detailFields: [
      detailField("venue", "Arena", rodeo.venueName),
      detailField("location", "Address", rodeo.location),
      detailField("dates", "Event Dates", `${rodeo.startDate} - ${rodeo.endDate}`),
      detailField("payout", "Added Money", rodeo.payout)
    ].filter(Boolean) as BusinessJournalRow["detailFields"]
  };
}

export function businessJournalMatchesSearch(item: BusinessJournalRow, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return [item.title, item.subtitle, item.locationText, item.eventsText, item.source]
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(normalized));
}

export function businessJournalMatchesDate(item: BusinessJournalRow, mode: string, range: DateRange) {
  if (mode !== "Date Range" || (!range.start && !range.end)) return true;
  const itemStart = item.eventStartDate ?? item.eventEndDate;
  const itemEnd = item.eventEndDate ?? item.eventStartDate;
  if (!itemStart || !itemEnd) return false;
  const start = range.start || "0001-01-01";
  const end = range.end || "9999-12-31";
  return itemStart <= end && itemEnd >= start;
}

export function sortBusinessJournalRows(left: BusinessJournalRow, right: BusinessJournalRow, sortOption: string) {
  if (sortOption === "Added Money (High-Low)" || sortOption === "Added Money (Low-High)") {
    const leftMoney = left.addedMoneyTotal ?? -1;
    const rightMoney = right.addedMoneyTotal ?? -1;
    if (leftMoney !== rightMoney) {
      return sortOption === "Added Money (High-Low)" ? rightMoney - leftMoney : leftMoney - rightMoney;
    }
  }

  const leftDate = left.eventStartDate ?? left.eventEndDate ?? "";
  const rightDate = right.eventStartDate ?? right.eventEndDate ?? "";
  if (leftDate !== rightDate) {
    return sortOption === "Event Date (Latest)" ? rightDate.localeCompare(leftDate) : leftDate.localeCompare(rightDate);
  }

  return left.title.localeCompare(right.title);
}

export function formatBusinessJournalEvents(eventsRows: NonNullable<ApiBusinessJournalListing["fields"]>["events"]) {
  const grouped = new Map<string, string[]>();
  for (const row of eventsRows ?? []) {
    const event = cleanText(row.event);
    if (!event) continue;
    const money = row.addedMoney ? formatCurrency(row.addedMoney) : "";
    grouped.set(money, [...(grouped.get(money) ?? []), event]);
  }
  return Array.from(grouped.entries())
    .map(([money, eventNames]) => (money ? `${eventNames.join(" ")} @ ${money}` : eventNames.join(" ")))
    .join(" ");
}

export function formatBusinessJournalEntryFees(fees: NonNullable<ApiBusinessJournalListing["fields"]>["entryFees"]) {
  return (fees ?? [])
    .map((row) => {
      const event = cleanText(row.event);
      const fee = cleanText(row.fees);
      return event && fee ? `${event}-${fee}` : "";
    })
    .filter(Boolean)
    .join("; ");
}

export function formatBusinessJournalPerfs(perfs?: NonNullable<ApiBusinessJournalListing["fields"]>["perfs"]) {
  const dates = (perfs?.perfDates ?? []).map((date) => formatBusinessJournalDateTime(date) || date).filter(Boolean);
  if (dates.length === 0) return "";
  return `${perfs?.perfsCount ?? dates.length} Perfs: ${dates.join("; ")}`;
}

export function formatBusinessJournalSlacks(slacks?: NonNullable<ApiBusinessJournalListing["fields"]>["slacks"]) {
  const dates = (slacks?.isoDateTimes ?? []).map((date) => formatBusinessJournalDateTime(date) || date).filter(Boolean);
  return dates.join("; ") || cleanText(slacks?.raw);
}

export function makeBusinessJournalDateText(start?: string, end?: string, fallback?: string) {
  const startText = formatBusinessJournalDate(start);
  const endText = formatBusinessJournalDate(end);
  if (startText && endText && startText !== endText) return `${startText} - ${endText}`;
  return startText || endText || fallback || "";
}

export function formatBusinessJournalDate(value?: string) {
  const date = parseDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export function formatBusinessJournalDateTime(value?: string) {
  const date = parseDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
}

export function parseDate(value?: string) {
  const cleaned = cleanText(value);
  if (!cleaned) return null;
  const parsed = new Date(cleaned);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function parseDisplayDateToISO(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

export function moneyToNumber(value: string) {
  const parsed = Number(value.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

export function detailField(id: string, label: string, value?: string | null) {
  const cleanValue = cleanText(value);
  return cleanValue ? { id, label, value: cleanValue } : null;
}

export function cleanText(value?: string | null) {
  return value?.trim() ?? "";
}

function parseAthleteBiography(value?: string | null) {
  const html = cleanText(value);
  if (!html) return { facts: [], summary: [], sections: [] };

  const blocks = html
    .replace(/<\s*strong[^>]*>([\s\S]*?)<\/\s*strong\s*>/gi, (_, text: string) => `[[strong]]${text}[[/strong]]`)
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/<\/\s*(p|div|li|h[1-6])\s*>/gi, "\n")
    .replace(/<\s*(p|div|li|h[1-6])[^>]*>/gi, "\n")
    .split(/\n+/)
    .map(parseBiographyBlock)
    .filter((block): block is { text: string; strongText: string } => Boolean(block));

  const facts: Array<{ id: string; label: string; value: string }> = [];
  const summary: string[] = [];
  const sections: Array<{ id: string; title: string; paragraphs: string[] }> = [];
  let currentSection: { id: string; title: string; paragraphs: string[] } | null = null;

  for (const block of blocks) {
    const fact = parseBiographyFact(block);
    if (fact && !currentSection) {
      facts.push(fact);
      continue;
    }

    const title = normalizeBiographyHeading(block.text, block.strongText);
    if (title) {
      currentSection = { id: slugify(title), title, paragraphs: [] };
      sections.push(currentSection);
    } else if (currentSection) {
      currentSection.paragraphs.push(block.text);
    } else {
      summary.push(block.text);
    }
  }

  return { facts, summary, sections: sections.filter((section) => section.paragraphs.length > 0) };
}

function parseBiographyBlock(block: string) {
  const decoded = decodeHtmlEntities(stripHtml(block)).replace(/\s+/g, " ").trim();
  if (!decoded) return null;
  const strongMatches = Array.from(decoded.matchAll(/\[\[strong\]\](.*?)\[\[\/strong\]\]/g))
    .map((match) => match[1].replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const text = decoded.replace(/\[\[\/?strong\]\]/g, "").replace(/\s+/g, " ").trim();
  if (!text) return null;
  return { text, strongText: strongMatches[0] ?? "" };
}

function parseBiographyFact(block: { text: string; strongText: string }) {
  const label = block.strongText.replace(/:$/, "").trim();
  if (!label || !block.strongText.includes(":")) return null;
  const value = block.text
    .replace(block.strongText, "")
    .replace(/^:/, "")
    .trim();
  if (!value) return null;
  return { id: slugify(label), label, value };
}

function normalizeBiographyHeading(value: string, strongText = "") {
  const cleaned = value.replace(/:$/, "").trim();
  const strongHeading = strongText.replace(/:$/, "").trim();
  const knownHeadings = new Set([
    "All-Around",
    "Awards",
    "Bull Riding",
    "Career Highlights",
    "Education",
    "Family",
    "Hobbies",
    "Injuries",
    "Personal",
    "Professional",
    "Rodeo Career",
    "Saddle Bronc Riding",
    "Sponsors"
  ]);
  if (knownHeadings.has(cleaned)) return cleaned;
  if (knownHeadings.has(strongHeading) && cleaned === strongHeading) return strongHeading;
  if (/^\d{4}\s+Highlights$/.test(cleaned)) return cleaned;
  return cleaned.length <= 34 && /^[A-Z][A-Za-z\s&/-]+$/.test(cleaned) ? cleaned : "";
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, "");
}

function decodeHtmlEntities(value: string) {
  const namedEntities: Record<string, string> = {
    amp: "&",
    apos: "'",
    hellip: "...",
    nbsp: " ",
    quot: "\"",
    rsquo: "'",
    lsquo: "'",
    rdquo: "\"",
    ldquo: "\""
  };

  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, code: string) => {
    const normalized = code.toLowerCase();
    if (normalized[0] === "#") {
      const radix = normalized[1] === "x" ? 16 : 10;
      const number = Number.parseInt(normalized.slice(radix === 16 ? 2 : 1), radix);
      return Number.isFinite(number) ? String.fromCharCode(number) : entity;
    }
    return namedEntities[normalized] ?? entity;
  });
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function makeNfrRounds(contestant: ApiNfrContestant, currentRound: number, isRoughStock: boolean) {
  return Array.from({ length: 10 }, (_, index) => {
    const round = index + 1;
    const result = cleanText(contestant[`Go${round}Result` as keyof ApiNfrContestant] as string | undefined);
    const placeValue = cleanText(contestant[`Go${round}Place` as keyof ApiNfrContestant] as string | undefined);
    const place = Number.parseInt(placeValue, 10);
    const pending = round > currentRound;
    const numericResult = Number.parseFloat(result);
    const hasResult = Number.isFinite(numericResult) && numericResult !== 0;

    return {
      round,
      pending,
      hasResult,
      displayValue: pending
        ? "Pending"
        : hasResult
          ? Number.isFinite(place)
            ? `${ordinal(place)} - ${formatNfrResultDisplay(result, isRoughStock)}`
            : formatNfrResultDisplay(result, isRoughStock)
          : isRoughStock
            ? "NS"
            : "NT"
    };
  });
}

function formatNfrResultDisplay(value: string, isRoughStock: boolean) {
  const numericValue = Number.parseFloat(value);
  if (!Number.isFinite(numericValue)) return value;

  if (!isRoughStock) {
    return numericValue.toFixed(1);
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2
  }).format(numericValue);
}

function isRoughStockCode(eventType: string) {
  return ["BB", "SB", "BR"].includes(eventType);
}

function ordinal(value: number) {
  if (!value) return "-";
  const remainder = value % 100;
  if (remainder >= 11 && remainder <= 13) return `${value}th`;
  switch (value % 10) {
    case 1:
      return `${value}st`;
    case 2:
      return `${value}nd`;
    case 3:
      return `${value}rd`;
    default:
      return `${value}th`;
  }
}

export function initialsFor(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function mapRodeo(rodeo: ApiRodeo): RodeoRow {
  return {
    id: rodeo.RodeoId ?? 0,
    name: rodeo.Name?.trim() || "Unnamed Rodeo",
    location: [rodeo.City, rodeo.StateAbbrv].filter(Boolean).join(", "),
    venueName: rodeo.VenueName?.trim() ?? "",
    websiteUrl: normalizeWebsiteUrl(rodeo.WebsiteUrl),
    startDate: formatDate(rodeo.StartDate),
    endDate: formatDate(rodeo.EndDate),
    startDateRaw: rodeo.StartDate,
    endDateRaw: rodeo.EndDate,
    payout: formatCurrency(rodeo.Payout ?? 0),
    hasDaysheets: Boolean(rodeo.HasDaysheets),
    inProgress: rodeoIsCurrentlyActive(rodeo),
    winners: [],
    resultRounds: []
  };
}

function rodeoIsCurrentlyActive(rodeo: ApiRodeo) {
  if (!rodeo.InProgress) return false;
  const endDate = parseDate(rodeo.EndDate);
  if (!endDate) return true;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  return endDate.getTime() >= today.getTime();
}

export function rodeoHasEvent(rodeo: ApiRodeo, event: EventName) {
  const html = rodeo.ApResults?.toLowerCase() ?? "";
  if (!html) return true;

  const phrases: Record<EventName, string[]> = {
    "All Around": ["all around", "all-around"],
    "Bareback Riding": ["bareback"],
    "Steer Wrestling": ["steer wrestling"],
    "Team Roping": ["team roping"],
    "Team Roping (Headers)": ["team roping"],
    "Team Roping (Heelers)": ["team roping"],
    "Saddle Bronc Riding": ["saddle bronc"],
    "Tie-Down Roping": ["tie-down", "tie down"],
    "Barrel Racing": ["barrel racing"],
    "Bull Riding": ["bull riding"],
    "Xtreme Bulls": ["xtreme bulls", "bull riding"],
    "Steer Roping": ["steer roping"],
    "Breakaway Roping": ["breakaway"]
  };

  return phrases[event].some((phrase) => html.includes(phrase));
}

export function mapWinners(payload: ApiRodeoResults, event: EventCode): Array<[string, string, string]> {
  const eventRounds = payload.data?.[0]?.Events?.[event];
  if (!eventRounds) return [];

  const rounds = Object.entries(eventRounds)
    .flatMap(([roundId, rows]) => rows.map((row) => ({ ...row, roundId })))
    .filter((row) => row.Contestant?.length);

  const unique = new Map<number, ApiRound & { roundId: string }>();
  for (const row of rounds) {
    const contestantId = row.Contestant?.[0]?.ContestantId;
    if (!contestantId || unique.has(contestantId)) continue;
    unique.set(contestantId, row);
  }

  return Array.from(unique.values())
    .filter((row) => Boolean(row.Payoff) || Boolean(row.Score) || Boolean(row.Time))
    .sort((a, b) => {
      const aPlace = a.Place && a.Place > 0 ? a.Place : Number.MAX_SAFE_INTEGER;
      const bPlace = b.Place && b.Place > 0 ? b.Place : Number.MAX_SAFE_INTEGER;
      if (aPlace !== bPlace) return aPlace - bPlace;
      return event === "BB" || event === "SB" || event === "BR"
        ? (b.Score ?? 0) - (a.Score ?? 0)
        : (a.Time ?? Number.MAX_SAFE_INTEGER) - (b.Time ?? Number.MAX_SAFE_INTEGER);
    })
    .slice(0, rodeoResultListLimit)
    .map((row, index) => {
      const contestant = row.Contestant?.[0];
      const name = `${contestant?.NickName || contestant?.FirstName || ""} ${contestant?.LastName || ""}`.trim();
      return [`#${row.Place && row.Place > 0 ? row.Place : index + 1}`, name || "Unknown Athlete", resultValue(row, event)];
    });
}

export function mapResultRounds(payload: ApiRodeoResults, event: EventCode): RodeoResultRound[] {
  const eventRounds = payload.data?.[0]?.Events?.[event];
  if (!eventRounds) return [];

  return Object.entries(eventRounds)
    .map(([roundId, rows]) => {
      const sortedRows = [...rows]
        .filter((row) => row.Contestant?.length)
        .filter((row) => Boolean(row.Payoff) || Boolean(row.Score) || Boolean(row.Time))
        .sort((a, b) => {
          const aPlace = a.Place && a.Place > 0 ? a.Place : Number.MAX_SAFE_INTEGER;
          const bPlace = b.Place && b.Place > 0 ? b.Place : Number.MAX_SAFE_INTEGER;
          if (aPlace !== bPlace) return aPlace - bPlace;
          return event === "BB" || event === "SB" || event === "BR"
            ? (b.Score ?? 0) - (a.Score ?? 0)
            : (a.Time ?? Number.MAX_SAFE_INTEGER) - (b.Time ?? Number.MAX_SAFE_INTEGER);
        })
        .slice(0, rodeoResultListLimit);
      const firstRow = sortedRows[0];
      const label = normalizeRoundName(
        firstRow?.GoRoundLabel?.trim() || (firstRow?.GoRound ? `Round ${firstRow.GoRound}` : roundId)
      );

      return {
        id: roundId,
        label,
        rows: sortedRows.map((row, index) => {
          const contestant = row.Contestant?.[0];
          const name = `${contestant?.NickName || contestant?.FirstName || ""} ${contestant?.LastName || ""}`.trim();
          return {
            id: `${roundId}-${contestant?.ContestantId ?? index}`,
            contestantId: contestant?.ContestantId ?? 0,
            place: `#${row.Place && row.Place > 0 ? row.Place : index + 1}`,
            name: name || "Unknown Athlete",
            hometown: contestant?.Hometown?.trim() ?? "",
            imageUrl: normalizeAthleteImageUrl(contestant?.SidearmPhotoUrl ?? contestant?.image_315_url ?? contestant?.PhotoUrl),
            payoff: formatOptionalCurrency(row.Payoff),
            value: resultValue(row, event),
            teamId: row.TeamId ?? null
          };
        })
      };
    })
    .filter((round) => round.rows.length > 0)
    .sort((a, b) => {
      const aNumber = Number(a.id.replace(/\D/g, ""));
      const bNumber = Number(b.id.replace(/\D/g, ""));
      if (Number.isFinite(aNumber) && Number.isFinite(bNumber) && aNumber !== bNumber) return aNumber - bNumber;
      return a.label.localeCompare(b.label);
    });
}

export function mapTopMoneyEarners(payload: ApiRodeoResults, event: EventCode): TopMoneyEarner[] {
  const roundsByName = payload.data?.[0]?.Events?.[event];
  if (!roundsByName) return [];

  const earners = new Map<number, TopMoneyEarner>();

  for (const row of Object.values(roundsByName).flat()) {
    const payoff = row.Payoff ?? 0;
    if (payoff <= 0) continue;

    for (const contestant of row.Contestant ?? []) {
      const contestantId = contestant.ContestantId ?? 0;
      if (!contestantId) continue;

      const first = contestant.FirstName?.trim() ?? "";
      const last = contestant.LastName?.trim() ?? "";
      const nick = contestant.NickName?.trim();
      const name = `${nick || first} ${last}`.trim() || "Unknown Athlete";
      const current = earners.get(contestantId) ?? {
        id: contestantId,
        name,
        hometown: contestant.Hometown?.trim() ?? "",
        imageUrl: normalizeAthleteImageUrl(contestant.SidearmPhotoUrl ?? contestant.image_315_url ?? contestant.PhotoUrl),
        totalPayoff: "",
        totalPayoffValue: 0,
        eventNames: [],
        resultCount: 0
      };
      const eventName = eventNameForCode(event);

      current.totalPayoffValue += payoff;
      current.totalPayoff = formatCurrency(current.totalPayoffValue);
      current.resultCount += 1;
      if (eventName && !current.eventNames.includes(eventName)) {
        current.eventNames.push(eventName);
      }
      earners.set(contestantId, current);
    }
  }

  return Array.from(earners.values())
    .sort((left, right) => right.totalPayoffValue - left.totalPayoffValue || left.name.localeCompare(right.name))
    .slice(0, 10);
}

export function resultValue(row: ApiRound, event: EventCode) {
  if (event === "BB" || event === "SB" || event === "BR") {
    return row.Score ? formatNumber(row.Score) : "-";
  }

  return row.Time ? formatTimedResult(row.Time) : "-";
}

function eventNameForCode(event: EventCode) {
  const teamRopingEvent = event === "TRHD" || event === "TRHL" ? "TR" : event;
  return events.find((name) => eventCodes[name] === teamRopingEvent) ?? event;
}

export function mapDaysheets(payload: ApiDaysheetResponse): DaysheetRow[] {
  return Object.entries(payload.data ?? {})
    .map(([startDate, performances]) => {
      const roundEntries = Object.entries(performances);
      const roundDisplay = roundEntries.map(([round]) => normalizeRoundName(round)).join(" - ");
      const eventsByName = roundEntries.reduce<Record<string, DaysheetEventGroup>>((merged, [, eventsByName]) => {
        for (const [eventName, group] of Object.entries(eventsByName)) {
          const normalizedEvent = eventName.trim();
          const existing = merged[normalizedEvent] ?? { Events: [], Rerides: [] };
          merged[normalizedEvent] = {
            Events: [...(existing.Events ?? []), ...(group.Events ?? [])],
            Rerides: [...(existing.Rerides ?? []), ...(group.Rerides ?? [])]
          };
        }
        return merged;
      }, {});

      return {
        id: startDate,
        startDisplay: formatDateTime(startDate),
        roundDisplay: roundDisplay || "Daysheet",
        eventNames: Object.keys(eventsByName).sort(),
        eventsByName
      };
    })
    .sort((left, right) => new Date(left.id).getTime() - new Date(right.id).getTime());
}

export function makeDaysheetDisplayRows(entries: DaysheetEntry[]) {
  const sorted = [...entries].sort((left, right) => {
    const leftPosition = left.GoPosition ?? Number.MAX_SAFE_INTEGER;
    const rightPosition = right.GoPosition ?? Number.MAX_SAFE_INTEGER;
    if (leftPosition !== rightPosition) return leftPosition - rightPosition;
    return (left.Name ?? "").localeCompare(right.Name ?? "");
  });

  let drawOrder = 1;
  return sorted.map((entry) => {
    const row = {
      entry,
      drawOrder: entry.HasTurnout ? null : drawOrder
    };

    if (!entry.HasTurnout) drawOrder += 1;
    return row;
  });
}

export function normalizeRoundName(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "Round";
  if (/^\d+$/.test(trimmed)) return `Round ${trimmed}`;
  return trimmed.replace(/\bgo\b/gi, "Round");
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function formatOptionalCurrency(value: number | null | undefined) {
  return value && value > 0 ? formatCurrency(value) : "–";
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2
  }).format(value);
}

export function formatTimedResult(value: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2
  }).format(value);
}

export function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(date);
}

export function formatDateTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}
