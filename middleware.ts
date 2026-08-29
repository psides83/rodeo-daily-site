import { NextResponse, type NextRequest } from "next/server";

const canonicalHost = "prorodeoresults.app";
const redirectHosts = new Set(["rodeo-daily-site.vercel.app", "www.prorodeoresults.app"]);

export function middleware(request: NextRequest) {
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
