import { NextResponse } from "next/server";
import { fetchPublishedNewsPosts } from "../../lib/supabase-news";

export async function GET() {
  return NextResponse.json({
    data: await fetchPublishedNewsPosts()
  });
}
