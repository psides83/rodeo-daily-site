import { NextResponse, type NextRequest } from "next/server";

const canonicalHost = "www.prorodeoresults.app";
const redirectHosts = new Set(["prorodeoresults.app", "rodeo-daily-site.vercel.app"]);
const blockedIps = new Set(["172.56.217.54"]);

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim();
  }

  return request.headers.get("x-real-ip")?.trim();
}

export function middleware(request: NextRequest) {
  const clientIp = getClientIp(request);
  if (clientIp && blockedIps.has(clientIp)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const host = request.headers.get("host")?.split(":")[0].toLowerCase();
  if (!host || !redirectHosts.has(host)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.protocol = "https:";
  url.hostname = canonicalHost;
  url.port = "";
  return NextResponse.redirect(url, 301);
}
