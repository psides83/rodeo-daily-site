export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://rodeodaily.com";

export const seoKeywords = [
  "PRCA results",
  "PRCA standings",
  "rodeo results",
  "rodeo standings",
  "pro rodeo results",
  "pro rodeo standings",
  "NFR standings",
  "WPRA standings",
  "rodeo schedule",
  "Rodeo Daily"
];

export const siteDescription =
  "Rodeo Daily tracks PRCA results, PRCA standings, rodeo standings, rodeo results, schedules, daysheets, NFR standings, and athlete profiles in one fast rodeo app.";

export const seoStandingEvents = [
  { name: "Bareback Riding", slug: "bareback-riding", code: "BB" },
  { name: "Steer Wrestling", slug: "steer-wrestling", code: "SW" },
  { name: "Team Roping", slug: "team-roping", code: "TR" },
  { name: "Saddle Bronc Riding", slug: "saddle-bronc-riding", code: "SB" },
  { name: "Tie-Down Roping", slug: "tie-down-roping", code: "TD" },
  { name: "Barrel Racing", slug: "barrel-racing", code: "GB" },
  { name: "Bull Riding", slug: "bull-riding", code: "BR" },
  { name: "Breakaway Roping", slug: "breakaway-roping", code: "LB" }
] as const;

export type SeoStandingEvent = (typeof seoStandingEvents)[number];

export function absoluteUrl(path = "/") {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function standingEventForSlug(slug: string): SeoStandingEvent | undefined {
  return seoStandingEvents.find((event) => event.slug === slug);
}
