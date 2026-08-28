import type { SavedAthlete, StandingRow } from "./types";

export const favoriteAthletesStorageKey = "rodeodaily.favoriteAthletes";
export const favoriteAthleteOrderStorageKey = "rodeodaily.favoriteAthleteOrder";
export const followedAthletesStorageKey = "rodeodaily.followedAthletes";
export const appSettingsStorageKey = "rodeodaily.settings";

export type FavoriteAthleteState = {
  athletes: Record<number, SavedAthlete>;
  order: number[];
};

export function loadFavoriteAthleteState(storage: Storage): FavoriteAthleteState {
  const athletes = readJson<Record<number, SavedAthlete>>(storage, favoriteAthletesStorageKey, {});
  const storedOrder = readJson<number[]>(storage, favoriteAthleteOrderStorageKey, []);
  return {
    athletes,
    order: normalizeFavoriteOrder(athletes, storedOrder)
  };
}

export function saveFavoriteAthleteState(storage: Storage, state: FavoriteAthleteState) {
  const order = normalizeFavoriteOrder(state.athletes, state.order);
  storage.setItem(favoriteAthletesStorageKey, JSON.stringify(state.athletes));
  storage.setItem(favoriteAthleteOrderStorageKey, JSON.stringify(order));
}

export function loadFollowedAthletes(storage: Storage) {
  return readJson<number[]>(storage, followedAthletesStorageKey, []);
}

export function saveFollowedAthletes(storage: Storage, athleteIds: number[]) {
  storage.setItem(followedAthletesStorageKey, JSON.stringify(uniqueNumbers(athleteIds)));
}

export function toggleSavedAthlete(state: FavoriteAthleteState, athlete: StandingRow): FavoriteAthleteState {
  const athletes = { ...state.athletes };
  const isSaved = Boolean(athletes[athlete.id]);

  if (isSaved) {
    delete athletes[athlete.id];
  } else {
    athletes[athlete.id] = standingRowToSavedAthlete(athlete);
  }

  return {
    athletes,
    order: isSaved ? state.order.filter((id) => id !== athlete.id) : normalizeFavoriteOrder(athletes, [...state.order, athlete.id])
  };
}

export function moveFavoriteAthleteOrder(state: FavoriteAthleteState, athleteId: number, direction: "up" | "down") {
  const order = normalizeFavoriteOrder(state.athletes, state.order);
  const index = order.indexOf(athleteId);
  const nextIndex = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || nextIndex < 0 || nextIndex >= order.length) {
    return order;
  }

  const next = [...order];
  [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
  return next;
}

export function normalizeFavoriteOrder(athletes: Record<number, SavedAthlete>, order: number[]) {
  const favoriteIds = Object.keys(athletes).map(Number);
  const kept = uniqueNumbers(order).filter((id) => Boolean(athletes[id]));
  const missing = favoriteIds.filter((id) => !kept.includes(id));
  return [...kept, ...missing];
}

export function standingRowToSavedAthlete(athlete: StandingRow): SavedAthlete {
  return {
    id: athlete.id,
    name: athlete.name,
    hometown: athlete.hometown,
    imageUrl: athlete.imageUrl,
    metric: athlete.metric,
    metricLabel: athlete.metricLabel
  };
}

export function readJson<T>(storage: Storage, key: string, fallback: T): T {
  const rawValue = storage.getItem(key);
  if (!rawValue) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
}

function uniqueNumbers(values: number[]) {
  return Array.from(new Set(values.filter((value) => Number.isFinite(value))));
}
