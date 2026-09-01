import type { Metadata } from "next";
import { AthleteProfileClient } from "./athlete-profile-client";
import { ThemeSync } from "../../components/theme-sync";
import { mapAthleteBio } from "../../lib/rodeo-data";
import type { ApiAthleteBioResponse, AthleteBio } from "../../lib/types";
import { absoluteUrl } from "../../lib/seo";

type AthleteRoutePageProps = {
  params: {
    athleteId: string;
  };
  searchParams?: {
    event?: string;
  };
};

const athleteApiBaseUrl = "https://d1kfpvgfupbmyo.cloudfront.net/services/pro_rodeo.ashx/";

export const revalidate = 1800;

export async function generateMetadata({ params }: AthleteRoutePageProps): Promise<Metadata> {
  const athleteId = safeAthleteId(params.athleteId);
  if (!athleteId) {
    return {
      title: "Athlete Profile",
      description: "View PRCA athlete standings, results, career earnings, and rodeo profile details on Rodeo Daily."
    };
  }

  const bio = await fetchAthleteBio(athleteId);
  const name = bio?.name || "PRCA Athlete";
  const eventText = bio?.events.length ? `${bio.events.join(", ")} rodeo athlete` : "PRCA rodeo athlete";
  const rankingText = bio?.rankings[0] ? ` Current ranking: #${bio.rankings[0].rank} ${bio.rankings[0].eventName}.` : "";
  const earningsText = bio?.yearEarnings ? ` ${bio.yearEarnings} in current season earnings.` : "";
  const description = `${name} profile on Rodeo Daily: ${eventText}, standings, results, career earnings, biography, and highlights.${rankingText}${earningsText}`;
  const path = `/athletes/${athleteId}`;
  const image = bio?.imageUrl ? absoluteImageUrl(bio.imageUrl) : undefined;

  return {
    title: `${name} PRCA Athlete Profile`,
    description,
    alternates: {
      canonical: absoluteUrl(path)
    },
    openGraph: {
      type: "profile",
      url: absoluteUrl(path),
      title: `${name} PRCA Athlete Profile | Rodeo Daily`,
      description,
      images: image ? [{ url: image }] : undefined
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: `${name} PRCA Athlete Profile | Rodeo Daily`,
      description,
      images: image ? [image] : undefined
    }
  };
}

export default async function AthleteRoutePage({ params, searchParams }: AthleteRoutePageProps) {
  const athleteId = safeAthleteId(params.athleteId) ?? 0;
  const bio = athleteId ? await fetchAthleteBio(athleteId) : null;
  const jsonLd = bio ? athleteJsonLd(bio) : null;

  return (
    <main className="browser-stage routed-stage">
      <ThemeSync />
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c")
          }}
        />
      )}
      <section className="routed-window">
        <AthleteProfileClient athleteId={athleteId} initialBio={bio} preferredEvent={searchParams?.event ?? null} />
      </section>
    </main>
  );
}

async function fetchAthleteBio(athleteId: number) {
  try {
    const url = new URL("athlete", athleteApiBaseUrl);
    url.searchParams.set("id", String(athleteId));
    const response = await fetch(url, { next: { revalidate } });
    if (!response.ok) return null;
    const payload = (await response.json()) as ApiAthleteBioResponse;
    return mapAthleteBio(payload);
  } catch {
    return null;
  }
}

function athleteJsonLd(bio: AthleteBio) {
  const descriptionParts = [
    bio.hometown ? `${bio.name} is a rodeo athlete from ${bio.hometown}.` : `${bio.name} is a rodeo athlete.`,
    bio.yearEarnings ? `Current season earnings: ${bio.yearEarnings}.` : "",
    bio.totalEarnings ? `Career earnings: ${bio.totalEarnings}.` : "",
    bio.rankings[0] ? `Current ranking: #${bio.rankings[0].rank} ${bio.rankings[0].eventName}.` : ""
  ].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: bio.name,
    url: absoluteUrl(`/athletes/${bio.id}`),
    image: bio.imageUrl ? absoluteImageUrl(bio.imageUrl) : undefined,
    homeLocation: bio.hometown || undefined,
    description: descriptionParts.join(" "),
    knowsAbout: bio.events.length ? bio.events : ["PRCA rodeo", "rodeo standings", "rodeo results"],
    award: [
      bio.worldTitles ? `${bio.worldTitles} world title${bio.worldTitles === 1 ? "" : "s"}` : "",
      bio.nfrQualifications ? `${bio.nfrQualifications} NFR qualification${bio.nfrQualifications === 1 ? "" : "s"}` : ""
    ].filter(Boolean)
  };
}

function safeAthleteId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function absoluteImageUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://") ? value : absoluteUrl(value);
}
