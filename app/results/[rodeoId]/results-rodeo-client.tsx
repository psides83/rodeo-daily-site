"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { RodeoDetailView } from "../../components/rodeo-views";
import { eventCodes, events, fetchJson, mapDaysheets, mapResultRounds, mapTopMoneyEarners, mapWinners } from "../../lib/rodeo-data";
import type { ApiDaysheetResponse, ApiRodeoResults, DaysheetRow, EventName, LoadState, RodeoRow, TopMoneyEarner } from "../../lib/types";

type ResultsRodeoClientProps = {
  rodeoId: number;
  initialRodeo: RodeoRow;
};

function eventParam(value: string | null): EventName {
  return events.includes(value as EventName) ? (value as EventName) : "Tie-Down Roping";
}

export function ResultsRodeoClient({ rodeoId, initialRodeo }: ResultsRodeoClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [event, setEvent] = useState<EventName>(() => eventParam(searchParams.get("event")));
  const [state, setState] = useState<LoadState>("idle");
  const [daysheetState, setDaysheetState] = useState<LoadState>("idle");
  const [daysheets, setDaysheets] = useState<DaysheetRow[]>([]);
  const [topMoneyEarners, setTopMoneyEarners] = useState<TopMoneyEarner[]>([]);
  const [rodeo, setRodeo] = useState<RodeoRow>(initialRodeo);

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
        const moneyEarners = mapTopMoneyEarners(payload, eventCodes[event]);
        if (!cancelled) {
          setRodeo((current) => ({ ...current, ...rodeoDetailFromResults(payload, current), winners, resultRounds }));
          setTopMoneyEarners(moneyEarners);
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
      source="results"
      topMoneyEarners={topMoneyEarners}
      onBack={() => router.back()}
    />
  );
}

function rodeoDetailFromResults(payload: ApiRodeoResults, current: RodeoRow): Partial<RodeoRow> {
  const detail = payload.data?.[0];
  if (!detail) return {};

  return {
    name: detail.RodeoName?.trim() || current.name,
    location: [detail.City, detail.State || detail.StateAbbrv].filter(Boolean).join(", ") || current.location,
    venueName: detail.VenueName?.trim() || current.venueName
  };
}
