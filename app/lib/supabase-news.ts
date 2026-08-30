import { newsPosts, type RodeoNewsPost } from "./news";
import { supabasePublicUrl, supabasePublishableKey } from "./supabase-config";

const supabaseUrl = supabasePublicUrl;
const supabaseAnonKey = supabasePublishableKey;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const adminEmails = (process.env.NEWS_ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

type SupabaseNewsPostRow = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  status: "draft" | "published";
  category: string;
  author: string;
  tags: string[] | null;
  hero_image: string | null;
  source_urls: string[] | null;
  featured: boolean;
  story_score: number | null;
  published_at: string | null;
  created_at?: string;
  updated_at: string | null;
};

export type NewsPostInput = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  status: "draft" | "published";
  category: string;
  author: string;
  tags: string[];
  heroImage?: string;
  sourceUrls: string[];
  featured: boolean;
  storyScore?: number;
  publishedAt?: string;
};

export type AdminNewsPost = NewsPostInput & {
  updatedAt?: string;
};

export type NewsAdminDiagnostics = {
  configured: boolean;
  projectHost: string;
  adminEmailCount: number;
  serviceRolePresent: boolean;
  directCount?: number;
  directStatus?: number;
  directError?: string;
};

export function supabaseNewsConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function supabaseAdminConfigured() {
  return Boolean(supabaseNewsConfigured() && supabaseServiceRoleKey && adminEmails.length > 0);
}

export async function fetchPublishedNewsPosts() {
  if (!supabaseNewsConfigured()) return fallbackPublishedPosts();

  try {
    const rows = await supabaseRequest<SupabaseNewsPostRow[]>(
      "/rest/v1/news_posts?select=*&status=eq.published&order=published_at.desc.nullslast,created_at.desc",
      { cache: "no-store", serviceRole: Boolean(supabaseServiceRoleKey) }
    );
    return rows.map(mapNewsPostRow);
  } catch {
    return fallbackPublishedPosts();
  }
}

export async function fetchNewsPostBySlug(slug: string) {
  if (!supabaseNewsConfigured()) return fallbackPublishedPosts().find((post) => post.slug === slug);

  try {
    const rows = await supabaseRequest<SupabaseNewsPostRow[]>(
      `/rest/v1/news_posts?select=*&slug=eq.${encodeURIComponent(slug)}&status=eq.published&limit=1`,
      { cache: "no-store", serviceRole: Boolean(supabaseServiceRoleKey) }
    );
    return rows[0] ? mapNewsPostRow(rows[0]) : undefined;
  } catch {
    return fallbackPublishedPosts().find((post) => post.slug === slug);
  }
}

export async function fetchAdminNewsPosts(accessToken: string) {
  await assertAdminUser(accessToken);
  const rows = await supabaseRequest<SupabaseNewsPostRow[]>("/rest/v1/news_posts?select=*&limit=100", {
    serviceRole: true,
    cache: "no-store"
  });
  return rows
    .map(mapAdminNewsPostRow)
    .sort((left, right) => (right.updatedAt ?? right.publishedAt ?? "").localeCompare(left.updatedAt ?? left.publishedAt ?? ""));
}

export async function upsertAdminNewsPost(input: NewsPostInput, accessToken: string) {
  await assertAdminUser(accessToken);
  const [row] = await supabaseRequest<SupabaseNewsPostRow[]>("/rest/v1/news_posts?on_conflict=slug", {
    method: "POST",
    serviceRole: true,
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation"
    },
    body: JSON.stringify(newsPostInputToRow(input))
  });
  return mapAdminNewsPostRow(row);
}

export async function fetchNewsAdminDiagnostics(accessToken: string): Promise<NewsAdminDiagnostics> {
  await assertAdminUser(accessToken);

  const diagnostics: NewsAdminDiagnostics = {
    configured: supabaseAdminConfigured(),
    projectHost: supabaseUrl ? new URL(supabaseUrl).host : "",
    adminEmailCount: adminEmails.length,
    serviceRolePresent: Boolean(supabaseServiceRoleKey)
  };

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/news_posts?select=slug`, {
      headers: {
        apikey: supabaseServiceRoleKey,
        Authorization: `Bearer ${supabaseServiceRoleKey}`,
        Prefer: "count=exact",
        "Accept-Profile": "public"
      },
      cache: "no-store"
    });
    diagnostics.directStatus = response.status;
    const contentRange = response.headers.get("content-range");
    const countText = contentRange?.split("/")[1];
    diagnostics.directCount = countText && countText !== "*" ? Number(countText) : undefined;
    if (!response.ok) {
      diagnostics.directError = await response.text();
    }
  } catch (error) {
    diagnostics.directError = error instanceof Error ? error.message : "Unable to run diagnostics.";
  }

  return diagnostics;
}

async function assertAdminUser(accessToken: string) {
  if (!supabaseAdminConfigured()) {
    throw new Error("Supabase admin environment variables are not configured.");
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${accessToken}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Invalid Supabase login.");
  }

  const user = (await response.json()) as { email?: string };
  if (!user.email || !adminEmails.includes(user.email.toLowerCase())) {
    throw new Error("This Supabase user is not allowed to manage news posts.");
  }
}

async function supabaseRequest<T>(
  path: string,
  options: RequestInit & { serviceRole?: boolean } = {}
) {
  const key = options.serviceRole ? supabaseServiceRoleKey : supabaseAnonKey;
  const response = await fetch(`${supabaseUrl}${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Accept-Profile": "public",
      "Content-Type": "application/json",
      "Content-Profile": "public",
      ...(options.headers ?? {})
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase request failed with ${response.status}${body ? `: ${body}` : ""}`);
  }

  return (await response.json()) as T;
}

function fallbackPublishedPosts() {
  return newsPosts
    .filter((post) => post.status === "published")
    .slice()
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));
}

function mapNewsPostRow(row: SupabaseNewsPostRow): RodeoNewsPost {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    author: row.author,
    publishedAt: row.published_at ?? row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? undefined,
    status: row.status,
    featured: row.featured,
    heroImage: row.hero_image ?? undefined,
    sourceUrls: row.source_urls ?? [],
    storyScore: row.story_score ?? undefined,
    tags: row.tags ?? [],
    paragraphs: row.content
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
  };
}

function mapAdminNewsPostRow(row: SupabaseNewsPostRow): AdminNewsPost {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    status: row.status,
    category: row.category,
    author: row.author,
    tags: row.tags ?? [],
    heroImage: row.hero_image ?? undefined,
    sourceUrls: row.source_urls ?? [],
    featured: row.featured,
    storyScore: row.story_score ?? undefined,
    publishedAt: row.published_at ?? undefined,
    updatedAt: row.updated_at ?? undefined
  };
}

function newsPostInputToRow(input: NewsPostInput): SupabaseNewsPostRow {
  const publishedAt = input.status === "published" ? input.publishedAt || new Date().toISOString() : input.publishedAt || null;
  return {
    slug: input.slug,
    title: input.title,
    excerpt: input.excerpt,
    content: input.content,
    status: input.status,
    category: input.category,
    author: input.author,
    tags: input.tags,
    hero_image: input.heroImage || null,
    source_urls: input.sourceUrls,
    featured: input.featured,
    story_score: input.storyScore ?? null,
    published_at: publishedAt,
    updated_at: new Date().toISOString()
  };
}
