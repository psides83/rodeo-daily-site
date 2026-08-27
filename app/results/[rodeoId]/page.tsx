"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { RodeoDetailView } from "../../components/rodeo-views";
import { eventCodes, fetchJson, mapDaysheets, mapWinners } from "../../lib/rodeo-data";
import type { ApiDaysheetResponse, ApiRodeoResults, DaysheetRow, EventName, LoadState, RodeoRow } from "../../lib/types";

function paramValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function ResultsRodeoRoutePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const rodeoId = Number(paramValue(params.rodeoId));
  const [event, setEvent] = useState<EventName>("Tie-Down Roping");
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
    winners: []
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
        if (!cancelled) {
          setRodeo((current) => ({ ...current, winners }));
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
    <main className="browser-stage routed-stage">
      <section className="routed-window">
        <RodeoDetailView
          rodeo={rodeo}
          state={state}
          daysheetState={daysheetState}
          daysheets={daysheets}
          event={event}
          setEvent={setEvent}
          source="results"
          onBack={() => router.back()}
        />
      </section>
    </main>
  );
}
