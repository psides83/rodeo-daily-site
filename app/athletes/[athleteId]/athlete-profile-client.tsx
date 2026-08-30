"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AthleteProfileScreen } from "../../components/rodeo-views";
import {
  loadFavoriteAthleteState,
  loadFollowedAthletes,
  saveFavoriteAthleteState,
  saveFollowedAthletes,
  toggleSavedAthlete
} from "../../lib/local-preferences";
import { fetchJson, mapAthleteBio } from "../../lib/rodeo-data";
import type { ApiAthleteBioResponse, AthleteBio, LoadState, SavedAthlete, StandingRow } from "../../lib/types";

type AthleteProfileClientProps = {
  athleteId: number;
  initialBio: AthleteBio | null;
  preferredEvent: string | null;
};

export function AthleteProfileClient({ athleteId, initialBio, preferredEvent }: AthleteProfileClientProps) {
  const router = useRouter();
  const [bio, setBio] = useState<AthleteBio | null>(initialBio);
  const [state, setState] = useState<LoadState>(initialBio ? "loaded" : "idle");
  const [favoriteAthletes, setFavoriteAthletes] = useState<Record<number, SavedAthlete>>({});
  const [favoriteAthleteOrder, setFavoriteAthleteOrder] = useState<number[]>([]);
  const [followedAthletes, setFollowedAthletes] = useState<number[]>([]);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

  useEffect(() => {
    const favoriteState = loadFavoriteAthleteState(window.localStorage);
    setFavoriteAthletes(favoriteState.athletes);
    setFavoriteAthleteOrder(favoriteState.order);
    setFollowedAthletes(loadFollowedAthletes(window.localStorage));
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
    let cancelled = false;
    async function loadAthlete() {
      if (!athleteId) {
        setState("error");
        return;
      }

      if (initialBio) {
        setBio(initialBio);
        setState("loaded");
        return;
      }

      setState("loading");
      try {
        const query = new URLSearchParams({ resource: "athlete", athleteId: String(athleteId) });
        const payload = await fetchJson<ApiAthleteBioResponse>(`/api/rodeo?${query}`);
        const loadedBio = mapAthleteBio(payload);
        if (!cancelled) {
          setBio(loadedBio);
          setState(loadedBio ? "loaded" : "error");
        }
      } catch {
        if (!cancelled) setState("error");
      }
    }
    loadAthlete();
    return () => {
      cancelled = true;
    };
  }, [athleteId, initialBio]);

  const athlete = useMemo<StandingRow>(() => {
    const saved = favoriteAthletes[athleteId];
    return {
      id: athleteId,
      place: 0,
      name: bio?.name || saved?.name || "Athlete Profile",
      hometown: bio?.hometown || saved?.hometown || "",
      imageUrl: bio?.imageUrl || saved?.imageUrl || null,
      metric: bio?.yearEarnings || saved?.metric || "",
      metricLabel: bio?.yearEarnings ? "This Year" : saved?.metricLabel || "Profile",
      favorite: Boolean(favoriteAthletes[athleteId]),
      followed: followedAthletes.includes(athleteId)
    };
  }, [athleteId, bio, favoriteAthletes, followedAthletes]);

  function toggleFavoriteAthlete(nextAthlete: StandingRow) {
    const nextState = toggleSavedAthlete({ athletes: favoriteAthletes, order: favoriteAthleteOrder }, nextAthlete);
    setFavoriteAthletes(nextState.athletes);
    setFavoriteAthleteOrder(nextState.order);
  }

  return (
    <AthleteProfileScreen
      athlete={athlete}
      bio={bio}
      state={state}
      preferredEvent={preferredEvent}
      onBack={() => router.back()}
      toggleFavoriteAthlete={toggleFavoriteAthlete}
    />
  );
}
