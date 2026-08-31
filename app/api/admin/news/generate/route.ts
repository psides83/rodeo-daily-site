import { NextResponse } from "next/server";
import { generateAdminNewsDraft } from "../../../../lib/supabase-news";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function bearerToken(request: Request) {
  const header = request.headers.get("authorization") || "";
  return header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : "";
}

export async function POST(request: Request) {
  try {
    const token = bearerToken(request);
    if (!token) return NextResponse.json({ error: "Login required." }, { status: 401 });

    return NextResponse.json(await generateAdminNewsDraft(token), {
      headers: {
        "Cache-Control": "no-store, max-age=0"
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to generate article draft." }, { status: 400 });
  }
}
