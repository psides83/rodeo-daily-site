import { supabasePublicUrl } from "./supabase-config";

const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const allowedRedirectHosts = (process.env.TRACKING_REDIRECT_ALLOWED_HOSTS || "")
  .split(",")
  .map((host) => host.trim().toLowerCase())
  .filter(Boolean);

type ClickTrackingInput = {
  campaign: string;
  destinationUrl: string;
  ipAddress: string;
  country: string;
  region: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  timezone: string;
  userAgent: string;
  referrer: string;
  source: string;
  isLikelyBot: boolean;
  botReason: string;
};

export function clickTrackingConfigured() {
  return Boolean(supabasePublicUrl && supabaseServiceRoleKey);
}

export function normalizeTrackedDestination(rawDestination: string | null) {
  if (!rawDestination) return null;

  try {
    const destination = new URL(rawDestination);
    if (!["http:", "https:"].includes(destination.protocol)) return null;
    if (allowedRedirectHosts.length && !allowedRedirectHosts.includes(destination.hostname.toLowerCase())) return null;
    return destination.toString();
  } catch {
    return null;
  }
}

export function detectLikelyBot(userAgent: string, referrer: string) {
  const userAgentValue = userAgent.toLowerCase();
  const referrerValue = referrer.toLowerCase();
  const botPatterns = [
    { pattern: /bot|crawler|spider|preview|scanner|scan|phish|safe|headless|monitor|checker|fetcher|scraper/, reason: "automated user agent" },
    { pattern: /yahoomailproxy|yahoo! slurp|yahoo link preview|yahoo ad monitoring|yahoocachesystem/, reason: "yahoo automated scanner" },
    { pattern: /facebookexternalhit|facebot|twitterbot|slackbot|discordbot|linkedinbot|telegrambot|whatsapp|skypeuripreview/, reason: "social or messaging preview" },
    { pattern: /curl|wget|python-requests|go-http-client|httpclient|axios|postmanruntime/, reason: "non-browser client" }
  ];

  for (const { pattern, reason } of botPatterns) {
    if (pattern.test(userAgentValue)) {
      return { isLikelyBot: true, botReason: reason };
    }
  }

  if (!userAgentValue) {
    return { isLikelyBot: true, botReason: "missing user agent" };
  }

  if (referrerValue.includes("mail.yahoo.") && !/mozilla|chrome|safari|firefox|edge|edg\//.test(userAgentValue)) {
    return { isLikelyBot: true, botReason: "yahoo mail non-browser click" };
  }

  return { isLikelyBot: false, botReason: "" };
}

export async function recordTrackedClick(input: ClickTrackingInput) {
  if (!clickTrackingConfigured()) return;

  const response = await fetch(`${supabasePublicUrl}/rest/v1/tracked_link_clicks`, {
    method: "POST",
    headers: {
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal"
    },
    body: JSON.stringify({
      campaign: input.campaign,
      destination_url: input.destinationUrl,
      ip_address: input.ipAddress || null,
      country: input.country || null,
      region: input.region || null,
      city: input.city || null,
      latitude: input.latitude,
      longitude: input.longitude,
      timezone: input.timezone || null,
      user_agent: input.userAgent || null,
      referrer: input.referrer || null,
      location_source: input.source || null,
      is_likely_bot: input.isLikelyBot,
      bot_reason: input.botReason || null
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Unable to record tracked click${body ? `: ${body}` : "."}`);
  }
}
