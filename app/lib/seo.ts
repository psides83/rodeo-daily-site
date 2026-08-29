import type { Metadata } from "next";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://prorodeoresults.app";

export const seoKeywords = [
  "PRCA results",
  "PRCA standings",
  "pro rodeo results",
  "WPRA results",
  "WPRA standings",
  "rodeo results",
  "rodeo standings",
  "pro rodeo standings",
  "NFR standings",
  "rodeo schedule",
  "Rodeo Daily"
];

export const siteDescription =
  "Rodeo Daily tracks PRCA results, PRCA standings, pro rodeo results, WPRA results, WPRA standings, rodeo schedules, daysheets, NFR standings, and athlete profiles in one fast rodeo app.";

export const seoStandingEvents = [
  { name: "All Around", slug: "all-around", code: "AA" },
  { name: "Bareback Riding", slug: "bareback-riding", code: "BB" },
  { name: "Steer Wrestling", slug: "steer-wrestling", code: "SW" },
  { name: "Team Roping (Headers)", slug: "team-roping-headers", code: "TRHD" },
  { name: "Team Roping (Heelers)", slug: "team-roping-heelers", code: "TRHL" },
  { name: "Saddle Bronc Riding", slug: "saddle-bronc-riding", code: "SB" },
  { name: "Tie-Down Roping", slug: "tie-down-roping", code: "TD" },
  { name: "Barrel Racing", slug: "barrel-racing", code: "GB" },
  { name: "Bull Riding", slug: "bull-riding", code: "BR" },
  { name: "Steer Roping", slug: "steer-roping", code: "SR" },
  { name: "Breakaway Roping", slug: "breakaway-roping", code: "LB" }
] as const;

export const seoResultEvents = [
  { name: "Bareback Riding", slug: "bareback-riding", code: "BB" },
  { name: "Steer Wrestling", slug: "steer-wrestling", code: "SW" },
  { name: "Team Roping", slug: "team-roping", code: "TR" },
  { name: "Saddle Bronc Riding", slug: "saddle-bronc-riding", code: "SB" },
  { name: "Tie-Down Roping", slug: "tie-down-roping", code: "TD" },
  { name: "Barrel Racing", slug: "barrel-racing", code: "GB" },
  { name: "Bull Riding", slug: "bull-riding", code: "BR" },
  { name: "Steer Roping", slug: "steer-roping", code: "SR" },
  { name: "Breakaway Roping", slug: "breakaway-roping", code: "LB" }
] as const;

export type SeoStandingEvent = (typeof seoStandingEvents)[number];
export type SeoResultEvent = (typeof seoResultEvents)[number];

export const wpraStandingEvents = seoStandingEvents.filter((event) => event.code === "GB" || event.code === "LB");
export const wpraResultEvents = seoResultEvents.filter((event) => event.code === "GB" || event.code === "LB");

export function absoluteUrl(path = "/") {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageMetadata({
  title,
  description,
  path,
  image = "/rodeo-daily-icon.png"
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
}): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = title.includes("Rodeo Daily") ? title : `${title} | Rodeo Daily`;

  return {
    title,
    description,
    alternates: {
      canonical: url
    },
    openGraph: {
      type: "website",
      url,
      title: fullTitle,
      description,
      siteName: "Rodeo Daily",
      images: [
        {
          url: absoluteUrl(image),
          alt: "Rodeo Daily"
        }
      ]
    },
    twitter: {
      card: "summary",
      title: fullTitle,
      description,
      images: [absoluteUrl(image)]
    }
  };
}

export function standingEventForSlug(slug: string): SeoStandingEvent | undefined {
  return seoStandingEvents.find((event) => event.slug === slug);
}

export function resultEventForSlug(slug: string): SeoResultEvent | undefined {
  return seoResultEvents.find((event) => event.slug === slug);
}
