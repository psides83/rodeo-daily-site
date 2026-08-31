import { NextResponse } from "next/server";
import { loginAdminUser } from "../../../../lib/supabase-news";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const { email, password } = (await request.json()) as { email?: string; password?: string };
    if (!email || !password) return NextResponse.json({ error: "Email and password are required." }, { status: 400 });

    return NextResponse.json(await loginAdminUser(email, password), {
      headers: {
        "Cache-Control": "no-store, max-age=0"
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to login." }, { status: 401 });
  }
}
