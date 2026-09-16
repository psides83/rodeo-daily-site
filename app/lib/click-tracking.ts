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
      location_source: input.source || null
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Unable to record tracked click${body ? `: ${body}` : "."}`);
  }
}
