import { NextResponse } from "next/server";
import { fetchAdminNewsPosts, fetchNewsAdminDiagnostics, upsertAdminNewsPost, type NewsPostInput } from "../../../lib/supabase-news";

function bearerToken(request: Request) {
  const header = request.headers.get("authorization") || "";
  return header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : "";
}

export async function GET(request: Request) {
  try {
    const token = bearerToken(request);
    if (!token) return NextResponse.json({ error: "Login required." }, { status: 401 });

    const posts = await fetchAdminNewsPosts(token);
    return NextResponse.json({
      data: posts,
      count: posts.length,
      diagnostics: await fetchNewsAdminDiagnostics(token)
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load news posts." }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    const token = bearerToken(request);
    if (!token) return NextResponse.json({ error: "Login required." }, { status: 401 });

    const input = (await request.json()) as NewsPostInput;
    return NextResponse.json({
      data: await upsertAdminNewsPost(input, token)
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save news post." }, { status: 400 });
  }
}
