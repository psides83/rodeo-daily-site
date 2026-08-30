import { NextResponse } from "next/server";
import { fetchPublishedNewsPosts, supabaseNewsConfigured } from "../../lib/supabase-news";

export async function GET() {
  return NextResponse.json({
    data: await fetchPublishedNewsPosts(),
    source: supabaseNewsConfigured() ? "supabase" : "fallback"
  });
}
