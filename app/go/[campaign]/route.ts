import { NextResponse, type NextRequest } from "next/server";
import { detectLikelyBot, normalizeTrackedDestination, recordTrackedClick } from "../../lib/click-tracking";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function firstForwardedIp(header: string | null) {
  return header?.split(",")[0]?.trim() || "";
}

function headerValue(request: NextRequest, name: string) {
  return request.headers.get(name) || "";
}

function numericHeader(request: NextRequest, name: string) {
  const value = Number(headerValue(request, name));
  return Number.isFinite(value) ? value : null;
}

function decodeHeaderValue(value: string) {
  if (!value) return "";

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function GET(request: NextRequest, context: { params: { campaign: string } }) {
  const destinationUrl = normalizeTrackedDestination(request.nextUrl.searchParams.get("to"));

  if (!destinationUrl) {
    return NextResponse.json({ error: "A valid destination URL is required." }, { status: 400 });
  }

  const campaign = context.params.campaign || "link";
  const ipAddress =
    firstForwardedIp(headerValue(request, "x-forwarded-for")) ||
    headerValue(request, "x-real-ip") ||
    headerValue(request, "cf-connecting-ip");
  const userAgent = headerValue(request, "user-agent");
  const referrer = headerValue(request, "referer");
  const botDetection = detectLikelyBot(userAgent, referrer);

  try {
    await recordTrackedClick({
      campaign,
      destinationUrl,
      ipAddress,
      country: headerValue(request, "x-vercel-ip-country") || headerValue(request, "cf-ipcountry"),
      region: headerValue(request, "x-vercel-ip-country-region"),
      city: decodeHeaderValue(headerValue(request, "x-vercel-ip-city")),
      latitude: numericHeader(request, "x-vercel-ip-latitude"),
      longitude: numericHeader(request, "x-vercel-ip-longitude"),
      timezone: headerValue(request, "x-vercel-ip-timezone"),
      userAgent,
      referrer,
      source: headerValue(request, "x-vercel-ip-country") ? "vercel" : headerValue(request, "cf-ipcountry") ? "cloudflare" : "headers",
      isLikelyBot: botDetection.isLikelyBot,
      botReason: botDetection.botReason
    });
  } catch (error) {
    console.error(error);
  }

  return NextResponse.redirect(destinationUrl, {
    headers: {
      "Cache-Control": "no-store, max-age=0"
    }
  });
}
