"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AthleteProfileScreen } from "../../components/rodeo-views";
import { fetchJson, mapAthleteBio } from "../../lib/rodeo-data";
import type { ApiAthleteBioResponse, AthleteBio, LoadState, SavedAthlete, StandingRow } from "../../lib/types";

function paramValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function AthleteRoutePage() {
  const router = useRouter();
  const params = useParams();
  const athleteId = Number(paramValue(params.athleteId));
  const [bio, setBio] = useState<AthleteBio | null>(null);
  const [state, setState] = useState<LoadState>("idle");
  const [favoriteAthletes, setFavoriteAthletes] = useState<Record<number, SavedAthlete>>({});
  const [followedAthletes, setFollowedAthletes] = useState<number[]>([]);

  useEffect(() => {
    const storedFavorites = window.localStorage.getItem("rodeodaily.favoriteAthletes");
    const storedFollows = window.localStorage.getItem("rodeodaily.followedAthletes");
    if (storedFavorites) setFavoriteAthletes(JSON.parse(storedFavorites) as Record<number, SavedAthlete>);
    if (storedFollows) setFollowedAthletes(JSON.parse(storedFollows) as number[]);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("rodeodaily.favoriteAthletes", JSON.stringify(favoriteAthletes));
  }, [favoriteAthletes]);

  useEffect(() => {
    window.localStorage.setItem("rodeodaily.followedAthletes", JSON.stringify(followedAthletes));
  }, [followedAthletes]);

  useEffect(() => {
    let cancelled = false;
    async function loadAthlete() {
      if (!athleteId) {
        setState("error");
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
  }, [athleteId]);

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
    setFavoriteAthletes((current) => {
      const next = { ...current };
      if (next[nextAthlete.id]) {
        delete next[nextAthlete.id];
      } else {
        next[nextAthlete.id] = {
          id: nextAthlete.id,
          name: nextAthlete.name,
          hometown: nextAthlete.hometown,
          imageUrl: nextAthlete.imageUrl,
          metric: nextAthlete.metric,
          metricLabel: nextAthlete.metricLabel
        };
      }
      return next;
    });
  }

  function toggleFollowedAthlete(nextAthleteId: number) {
    setFollowedAthletes((current) =>
      current.includes(nextAthleteId) ? current.filter((id) => id !== nextAthleteId) : [...current, nextAthleteId]
    );
  }

  return (
    <main className="browser-stage routed-stage">
      <section className="routed-window">
        <AthleteProfileScreen
          athlete={athlete}
          bio={bio}
          state={state}
          onBack={() => router.back()}
          toggleFavoriteAthlete={toggleFavoriteAthlete}
          toggleFollowedAthlete={toggleFollowedAthlete}
        />
      </section>
    </main>
  );
}
