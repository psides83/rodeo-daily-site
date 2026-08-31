import { NextResponse } from "next/server";
import { deleteAdminDraftNewsPost, fetchAdminNewsPosts, fetchNewsAdminDiagnostics, upsertAdminNewsPost, type NewsPostInput } from "../../../lib/supabase-news";

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

    const posts = await fetchAdminNewsPosts(token);
    return NextResponse.json(
      {
        data: posts,
        count: posts.length,
        diagnostics: await fetchNewsAdminDiagnostics(token)
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0"
        }
      }
    );
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load news posts." }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    const token = bearerToken(request);
    if (!token) return NextResponse.json({ error: "Login required." }, { status: 401 });

    const input = (await request.json()) as NewsPostInput;
    return NextResponse.json(
      {
        data: await upsertAdminNewsPost(input, token)
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0"
        }
      }
    );
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save news post." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const token = bearerToken(request);
    if (!token) return NextResponse.json({ error: "Login required." }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    if (!slug) return NextResponse.json({ error: "Post slug is required." }, { status: 400 });

    await deleteAdminDraftNewsPost(slug, token);
    return NextResponse.json(
      {
        deleted: true,
        slug
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0"
        }
      }
    );
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete news post." }, { status: 400 });
  }
}
