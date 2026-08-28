"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { RodeoDetailView } from "../../components/rodeo-views";
import { eventCodes, events, fetchJson, mapDaysheets, mapResultRounds, mapWinners } from "../../lib/rodeo-data";
import type { ApiDaysheetResponse, ApiRodeoResults, DaysheetRow, EventName, LoadState, RodeoRow } from "../../lib/types";

type ScheduleRodeoClientProps = {
  rodeoId: number;
};

function eventParam(value: string | null): EventName {
  return events.includes(value as EventName) ? (value as EventName) : "Tie-Down Roping";
}

export function ScheduleRodeoClient({ rodeoId }: ScheduleRodeoClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [event, setEvent] = useState<EventName>(() => eventParam(searchParams.get("event")));
  const [state, setState] = useState<LoadState>("idle");
  const [daysheetState, setDaysheetState] = useState<LoadState>("idle");
  const [daysheets, setDaysheets] = useState<DaysheetRow[]>([]);
  const [rodeo, setRodeo] = useState<RodeoRow>({
    id: rodeoId,
    name: searchParams.get("name") || `Rodeo #${rodeoId || ""}`,
    location: searchParams.get("location") || "",
    venueName: searchParams.get("venue") || "",
    websiteUrl: searchParams.get("website") || null,
    startDate: searchParams.get("start") || "",
    endDate: searchParams.get("end") || "",
    payout: searchParams.get("payout") || "",
    hasDaysheets: searchParams.get("daysheets") === "true",
    inProgress: false,
    winners: [],
    resultRounds: []
  });

  useEffect(() => {
    let cancelled = false;
    async function loadWinners() {
      if (!rodeoId) return;
      setState("loading");
      try {
        const query = new URLSearchParams({ resource: "rodeo-results", rodeoId: String(rodeoId) });
        const payload = await fetchJson<ApiRodeoResults>(`/api/rodeo?${query}`);
        const winners = mapWinners(payload, eventCodes[event]);
        const resultRounds = mapResultRounds(payload, eventCodes[event]);
        if (!cancelled) {
          setRodeo((current) => ({ ...current, winners, resultRounds }));
          setState("loaded");
        }
      } catch {
        if (!cancelled) setState("error");
      }
    }
    loadWinners();
    return () => {
      cancelled = true;
    };
  }, [event, rodeoId]);

  useEffect(() => {
    let cancelled = false;
    async function loadDaysheets() {
      if (!rodeoId || !rodeo.hasDaysheets) return;
      setDaysheetState("loading");
      try {
        const query = new URLSearchParams({ resource: "daysheet", rodeoId: String(rodeoId) });
        const payload = await fetchJson<ApiDaysheetResponse>(`/api/rodeo?${query}`);
        if (!cancelled) {
          setDaysheets(mapDaysheets(payload));
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
  }, [rodeo.hasDaysheets, rodeoId]);

  return (
    <RodeoDetailView
      rodeo={rodeo}
      state={state}
      daysheetState={daysheetState}
      daysheets={daysheets}
      event={event}
      setEvent={setEvent}
      source="schedule"
      onBack={() => router.back()}
    />
  );
}
