import { NextResponse } from "next/server";
import { fetchAdminStoryCandidates, refreshAdminStoryCandidates } from "../../../../lib/supabase-news";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function bearerToken(request: Request) {
  const header = request.headers.get("authorization") || "";
  return header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : "";
}

export async function GET(request: Request) {
  try {
    const token = bearerToken(request);
    if (!token) return NextResponse.json({ error: "Login required." }, { status: 401 });

    const candidates = await fetchAdminStoryCandidates(token);
    return NextResponse.json(
      {
        data: candidates,
        count: candidates.length
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0"
        }
      }
    );
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load story candidates." }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    const token = bearerToken(request);
    if (!token) return NextResponse.json({ error: "Login required." }, { status: 401 });

    const candidates = await refreshAdminStoryCandidates(token);
    return NextResponse.json(
      {
        data: candidates,
        count: candidates.length
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0"
        }
      }
    );
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to refresh story candidates." }, { status: 400 });
  }
}
