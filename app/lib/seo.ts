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

export function absoluteUrl(path = "/") {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
