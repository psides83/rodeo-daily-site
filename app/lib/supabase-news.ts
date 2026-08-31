import { newsPosts, type RodeoNewsPost } from "./news";
import { supabasePublicUrl, supabasePublishableKey } from "./supabase-config";
import type { ApiPosition, ApiRodeo, ApiRodeoResults, ApiRound, EventCode } from "./types";

const supabaseUrl = supabasePublicUrl;
const supabaseAnonKey = supabasePublishableKey;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const openAiApiKey = process.env.OPENAI_API_KEY || "";
const newsGeneratorModel = process.env.NEWS_GENERATOR_MODEL || "gpt-4o-mini";
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

type SupabaseStoryCandidateRow = {
  id: string;
  headline: string;
  summary: string | null;
  source_url: string | null;
  source_name: string | null;
  detected_athlete_name: string | null;
  detected_event: string | null;
  keywords: string[] | null;
  published_at: string | null;
  relevance_score: number | null;
  selected: boolean;
  article_id: string | null;
  discovered_at: string;
  created_at: string;
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

export type NewsStoryCandidate = {
  id: string;
  headline: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  detectedAthleteName: string;
  detectedEvent: string;
  keywords: string[];
  publishedAt?: string;
  relevanceScore: number;
  selected: boolean;
  articleId?: string;
  discoveredAt: string;
};

export type GeneratedNewsDraft = {
  post: NewsPostInput;
  candidates: NewsStoryCandidate[];
  researchNotes: string[];
  usedAi: boolean;
};

export type NewsAdminLogin = {
  accessToken: string;
  email: string;
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

const prorodeoBaseUrl = "https://d1kfpvgfupbmyo.cloudfront.net/services/pro_rodeo.ashx/";
const rodeoDailyBaseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.rodeodaily.com";
const candidateEventCodes: EventCode[] = ["BB", "SW", "TR", "SB", "TD", "GB", "BR", "SR", "LB"];
const eventNames: Record<EventCode, string> = {
  AA: "All Around",
  BB: "Bareback Riding",
  SW: "Steer Wrestling",
  TR: "Team Roping",
  TRHD: "Team Roping",
  TRHL: "Team Roping",
  SB: "Saddle Bronc Riding",
  TD: "Tie-Down Roping",
  GB: "Barrel Racing",
  BR: "Bull Riding",
  XB: "Xtreme Bulls",
  SR: "Steer Roping",
  LB: "Breakaway Roping"
};
const newsSourcePages = [
  { name: "PRCA News", url: "https://www.prorodeo.com/news" },
  { name: "CalfRoping.com", url: "https://calfroping.com/" },
  { name: "Yardbarker Rodeo", url: "https://www.yardbarker.com/rodeo" },
  { name: "The Cowboy Channel", url: "https://www.thecowboychannel.com/news" },
  { name: "The Team Roping Journal", url: "https://teamropingjournal.com/category/news/" }
];

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

export async function fetchAdminStoryCandidates(accessToken: string) {
  await assertAdminUser(accessToken);
  const rows = await supabaseRequest<SupabaseStoryCandidateRow[]>(
    "/rest/v1/news_story_candidates?select=*&order=discovered_at.desc,created_at.desc&limit=50",
    {
      serviceRole: true,
      cache: "no-store"
    }
  );
  return rows.map(mapStoryCandidateRow);
}

export async function loginAdminUser(email: string, password: string): Promise<NewsAdminLogin> {
  if (!supabaseNewsConfigured()) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password }),
    cache: "no-store"
  });
  const payload = (await response.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
    msg?: string;
    user?: { email?: string };
  };
  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description || payload.msg || payload.error || "Unable to login.");
  }

  await assertAdminUser(payload.access_token);
  return {
    accessToken: payload.access_token,
    email: payload.user?.email ?? email
  };
}

export async function refreshAdminStoryCandidates(accessToken: string) {
  await assertAdminUser(accessToken);

  const discovered = await discoverRecentStoryCandidates();
  if (discovered.length === 0) return fetchAdminStoryCandidates(accessToken);

  const existingRows = await supabaseRequest<SupabaseStoryCandidateRow[]>(
    "/rest/v1/news_story_candidates?select=*&order=discovered_at.desc,created_at.desc&limit=150",
    {
      serviceRole: true,
      cache: "no-store"
    }
  );
  const existingKeys = new Set(existingRows.map(candidateDeduplicationKey));
  const newRows = discovered.filter((candidate) => !existingKeys.has(candidateDeduplicationKey(candidate)));

  if (newRows.length > 0) {
    await supabaseRequest<SupabaseStoryCandidateRow[]>("/rest/v1/news_story_candidates", {
      method: "POST",
      serviceRole: true,
      headers: {
        Prefer: "return=representation"
      },
      body: JSON.stringify(newRows)
    });
  }

  return fetchAdminStoryCandidates(accessToken);
}

export async function generateAdminNewsDraft(accessToken: string): Promise<GeneratedNewsDraft> {
  await assertAdminUser(accessToken);

  const candidates = await refreshAdminStoryCandidates(accessToken);
  const primaryCandidate = candidates[0];
  if (!primaryCandidate) {
    throw new Error("No recent result leads were found.");
  }

  const [standingsContext, sourceContext] = await Promise.all([
    fetchStandingContext(primaryCandidate),
    fetchSourceContext(primaryCandidate)
  ]);
  const fallbackPost = buildFallbackGeneratedPost(primaryCandidate, standingsContext, sourceContext);
  const aiPost = openAiApiKey
    ? await generatePostWithOpenAi(primaryCandidate, standingsContext, sourceContext, fallbackPost)
    : null;

  return {
    post: aiPost ?? fallbackPost,
    candidates,
    researchNotes: [
      `Primary lead: ${primaryCandidate.headline}`,
      ...standingsContext.notes,
      ...sourceContext.map((source) => `${source.sourceName}: ${source.title}`)
    ],
    usedAi: Boolean(aiPost)
  };
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
    const body = await response.text();
    throw new Error(`Invalid Supabase login${body ? `: ${body}` : "."}`);
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

function mapStoryCandidateRow(row: SupabaseStoryCandidateRow): NewsStoryCandidate {
  return {
    id: row.id,
    headline: row.headline,
    summary: row.summary ?? "",
    sourceUrl: row.source_url ?? "",
    sourceName: row.source_name ?? "PRCA Results",
    detectedAthleteName: row.detected_athlete_name ?? "",
    detectedEvent: row.detected_event ?? "",
    keywords: row.keywords ?? [],
    publishedAt: row.published_at ?? undefined,
    relevanceScore: row.relevance_score ?? 0,
    selected: row.selected,
    articleId: row.article_id ?? undefined,
    discoveredAt: row.discovered_at
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

async function discoverRecentStoryCandidates(): Promise<Array<Omit<SupabaseStoryCandidateRow, "id" | "selected" | "article_id" | "created_at">>> {
  const rodeos = await fetchRecentResultRodeos();
  const candidates: Array<Omit<SupabaseStoryCandidateRow, "id" | "selected" | "article_id" | "created_at">> = [];

  for (const rodeo of rodeos.slice(0, 10)) {
    if (!rodeo.RodeoId) continue;
    const results = await fetchRodeoResults(rodeo.RodeoId);
    for (const event of candidateEventCodes) {
      const winner = topResultForEvent(results, event);
      if (!winner) continue;
      const contestant = winner.Contestant?.[0];
      const athlete = contestantName(contestant);
      if (!athlete) continue;
      const eventName = eventNames[event];
      const result = resultDisplay(winner, event);
      const sourceUrl = `/results/${rodeo.RodeoId}`;
      const place = winner.Place && winner.Place > 0 ? `${ordinal(winner.Place)} place` : "a winning result";
      const payoff = winner.Payoff ? ` and ${formatCurrency(winner.Payoff)}` : "";
      candidates.push({
        headline: `${athlete} leads ${eventName.toLowerCase()} story at ${cleanText(rodeo.Name) || "recent pro rodeo"}`,
        summary: `${athlete} posted ${result} for ${place}${payoff} at ${rodeoLocation(rodeo)}. Review this lead for PRCA results, WPRA results, standings movement, and NFR impact.`,
        source_url: sourceUrl,
        source_name: "Rodeo Daily Results",
        detected_athlete_name: athlete,
        detected_event: eventName,
        keywords: ["results", eventName, athlete, cleanText(rodeo.Name)].filter(Boolean),
        published_at: rodeo.EndDate ?? null,
        relevance_score: candidateScore(rodeo, winner, event),
        discovered_at: new Date().toISOString()
      });
    }
  }

  return candidates
    .sort((left, right) => (right.relevance_score ?? 0) - (left.relevance_score ?? 0))
    .slice(0, 30);
}

async function fetchRecentResultRodeos(): Promise<ApiRodeo[]> {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 14);
  const url = new URL("schedule", prorodeoBaseUrl);
  url.searchParams.set("type", "results");
  url.searchParams.set("page_size", "18");
  url.searchParams.set("index", "1");
  url.searchParams.set("search_term", "");
  url.searchParams.set("search_type", "");
  url.searchParams.set("tourId", "");
  url.searchParams.set("circuitId", "");
  url.searchParams.set("combine_results", "true");
  url.searchParams.set("active", "true");
  url.searchParams.set("start", prorodeoDate(start));
  url.searchParams.set("end", prorodeoDate(end));

  const payload = await fetchExternalJson<{ data?: ApiRodeo[] }>(url);
  return payload.data ?? [];
}

async function fetchRodeoResults(rodeoId: number): Promise<ApiRodeoResults> {
  const url = new URL("results", prorodeoBaseUrl);
  url.searchParams.set("rodeoid", String(rodeoId));
  return fetchExternalJson<ApiRodeoResults>(url);
}

async function fetchExternalJson<T>(url: URL): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache"
    },
    next: { revalidate: 300 }
  });
  if (!response.ok) throw new Error(`Rodeo service returned ${response.status}`);
  return response.json() as Promise<T>;
}

function topResultForEvent(payload: ApiRodeoResults, event: EventCode) {
  const eventRounds = payload.data?.[0]?.Events?.[event];
  if (!eventRounds) return null;
  const rows = Object.values(eventRounds)
    .flat()
    .filter((row) => row.Contestant?.length)
    .filter((row) => Boolean(row.Payoff) || Boolean(row.Score) || Boolean(row.Time));
  if (rows.length === 0) return null;

  return rows.sort((left, right) => {
    const leftPlace = left.Place && left.Place > 0 ? left.Place : Number.MAX_SAFE_INTEGER;
    const rightPlace = right.Place && right.Place > 0 ? right.Place : Number.MAX_SAFE_INTEGER;
    if (leftPlace !== rightPlace) return leftPlace - rightPlace;
    return event === "BB" || event === "SB" || event === "BR"
      ? (right.Score ?? 0) - (left.Score ?? 0)
      : (left.Time ?? Number.MAX_SAFE_INTEGER) - (right.Time ?? Number.MAX_SAFE_INTEGER);
  })[0];
}

function resultDisplay(row: ApiRound, event: EventCode) {
  if (event === "BB" || event === "SB" || event === "BR") {
    return row.Score ? `${formatNumber(row.Score)} points` : "a qualified ride";
  }
  return row.Time ? `${formatNumber(row.Time)} seconds` : "a marked time";
}

function candidateScore(rodeo: ApiRodeo, result: ApiRound, event: EventCode) {
  const payoutScore = Math.min(Math.round((rodeo.Payout ?? 0) / 1000), 45);
  const payoffScore = Math.min(Math.round((result.Payoff ?? 0) / 250), 35);
  const wpraScore = event === "GB" || event === "LB" ? 8 : 0;
  const inProgressScore = rodeo.InProgress ? 8 : 0;
  return 50 + payoutScore + payoffScore + wpraScore + inProgressScore;
}

function candidateDeduplicationKey(candidate: Pick<SupabaseStoryCandidateRow, "headline" | "source_url">) {
  return `${candidate.headline.trim().toLowerCase()}|${candidate.source_url ?? ""}`;
}

function contestantName(contestant?: NonNullable<ApiRound["Contestant"]>[number]) {
  if (!contestant) return "";
  return cleanText(`${contestant.NickName || contestant.FirstName || ""} ${contestant.LastName || ""}`);
}

function rodeoLocation(rodeo: ApiRodeo) {
  return cleanText([rodeo.Name, rodeo.City, rodeo.StateAbbrv].filter(Boolean).join(", ")) || "a recent pro rodeo";
}

function cleanText(value?: string | null) {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

function cleanList(value: string[]) {
  return value.map((item) => item.trim()).filter(Boolean);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function prorodeoDate(date: Date) {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2
  }).format(value);
}

function ordinal(value: number) {
  const remainder = value % 100;
  if (remainder >= 11 && remainder <= 13) return `${value}th`;
  switch (value % 10) {
    case 1:
      return `${value}st`;
    case 2:
      return `${value}nd`;
    case 3:
      return `${value}rd`;
    default:
      return `${value}th`;
  }
}

type StandingContext = {
  event: string;
  rows: Array<{
    rank: number;
    name: string;
    hometown: string;
    metric: string;
  }>;
  notes: string[];
};

type SourceContext = {
  sourceName: string;
  url: string;
  title: string;
  excerpt: string;
};

function buildFallbackGeneratedPost(candidate: NewsStoryCandidate, standingsContext: StandingContext, sourceContext: SourceContext[]): NewsPostInput {
  const title = headlineCase(candidate.headline);
  const athlete = candidate.detectedAthleteName || "the highlighted competitor";
  const event = candidate.detectedEvent || "pro rodeo";
  const standingsNote = standingsContext.rows.length
    ? `${standingsContext.event} standings context: ${standingsContext.rows
        .slice(0, 5)
        .map((row) => `#${row.rank} ${row.name} (${row.metric})`)
        .join("; ")}.`
    : `Standings context for ${event} should be reviewed before publishing.`;
  const sourceNote = sourceContext.length
    ? `Related storyline signals reviewed: ${sourceContext.map((source) => source.sourceName).join(", ")}.`
    : "No related outside storyline signal was found during this pass.";
  const sourceUrls = cleanList([candidate.sourceUrl, ...sourceContext.map((source) => source.url)]);

  return {
    slug: slugify(`${candidate.headline}-article`),
    title,
    excerpt: `${athlete} gives Rodeo Daily a fresh ${event.toLowerCase()} storyline from recent results, with standings context and NFR implications to review.`,
    content: [
      `${candidate.summary} The result stands out as a Rodeo Daily story lead because it combines a recent arena result with a broader standings question.`,
      standingsNote,
      `${sourceNote} These sources are being used as context signals only; this draft should remain original Rodeo Daily reporting and analysis rather than a rewrite of another outlet's article.`,
      `The useful angle for readers is what this result changes next. Before publishing, confirm the official result, payout, current standings position, and whether ${athlete} gained ground in the NFR race or strengthened a lead in ${event.toLowerCase()}.`
    ].join("\n\n"),
    status: "draft",
    category: "Pro Rodeo Roundup",
    author: "Rodeo Daily",
    tags: cleanList(["PRCA results", "WPRA results", "pro rodeo results", "PRCA standings", "WPRA standings", event, athlete]),
    sourceUrls,
    featured: false,
    storyScore: candidate.relevanceScore,
    publishedAt: ""
  };
}

async function generatePostWithOpenAi(
  candidate: NewsStoryCandidate,
  standingsContext: StandingContext,
  sourceContext: SourceContext[],
  fallbackPost: NewsPostInput
) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: newsGeneratorModel,
      input: [
        {
          role: "system",
          content:
            "You write original Rodeo Daily news drafts. Do not copy, rewrite, or closely paraphrase third-party articles. Use third-party source titles only as context signals. Use structured rodeo results and standings as the factual backbone. Return strict JSON only."
        },
        {
          role: "user",
          content: JSON.stringify({
            requiredJsonShape: {
              title: "string",
              excerpt: "string",
              content: "4-7 paragraphs separated by blank lines",
              tags: ["string"]
            },
            primaryLead: candidate,
            standingsContext,
            storylineSourceSignals: sourceContext,
            fallbackDraft: fallbackPost
          })
        }
      ],
      text: {
        format: {
          type: "json_object"
        }
      }
    })
  });

  if (!response.ok) return null;
  const payload = (await response.json()) as { output_text?: string };
  const parsed = safeJsonParse<Partial<NewsPostInput> & { title?: string; excerpt?: string; content?: string; tags?: string[] }>(payload.output_text ?? "");
  if (!parsed?.title || !parsed.excerpt || !parsed.content) return null;

  return {
    ...fallbackPost,
    title: parsed.title.trim(),
    slug: slugify(parsed.title),
    excerpt: parsed.excerpt.trim(),
    content: parsed.content.trim(),
    tags: cleanList(parsed.tags?.length ? parsed.tags : fallbackPost.tags)
  };
}

async function fetchStandingContext(candidate: NewsStoryCandidate): Promise<StandingContext> {
  const event = eventCodeForName(candidate.detectedEvent);
  if (!event) return { event: candidate.detectedEvent, rows: [], notes: ["No standings event could be matched for the primary lead."] };

  try {
    const year = new Date().getFullYear();
    const url = new URL("standings", prorodeoBaseUrl);
    url.searchParams.set("year", String(year));
    url.searchParams.set("type", "world");
    url.searchParams.set("id", "");
    url.searchParams.set("event", event);
    const payload = await fetchExternalJson<{ data?: ApiPosition[] }>(url);
    const rows = (payload.data ?? []).slice(0, 15).map((row) => ({
      rank: numberValue(row.Place ?? row.place) ?? 0,
      name: contestantStandingName(row),
      hometown: cleanText(row.Hometown ?? row.hometown),
      metric: row.Earnings ? formatCurrency(Number(row.Earnings)) : row.earnings ? formatCurrency(Number(row.earnings)) : row.Points ? `${row.Points} points` : ""
    }));
    return {
      event: candidate.detectedEvent,
      rows,
      notes: rows.length
        ? [`Pulled current top-${rows.length} ${candidate.detectedEvent} world standings for context.`]
        : [`No ${candidate.detectedEvent} standings rows were returned.`]
    };
  } catch (error) {
    return {
      event: candidate.detectedEvent,
      rows: [],
      notes: [error instanceof Error ? `Unable to load standings context: ${error.message}` : "Unable to load standings context."]
    };
  }
}

async function fetchSourceContext(candidate: NewsStoryCandidate): Promise<SourceContext[]> {
  const keywords = cleanList([
    candidate.detectedAthleteName,
    candidate.detectedEvent,
    ...candidate.keywords
  ]).map((keyword) => keyword.toLowerCase());
  const contexts = await Promise.all(newsSourcePages.map((source) => fetchSourcePageContext(source, keywords)));
  return contexts.filter((context): context is SourceContext => Boolean(context)).slice(0, 5);
}

async function fetchSourcePageContext(source: { name: string; url: string }, keywords: string[]) {
  try {
    const response = await fetch(source.url, {
      headers: {
        "User-Agent": "RodeoDailyBot/1.0; story research metadata only"
      },
      next: { revalidate: 900 }
    });
    if (!response.ok) return null;
    const html = await response.text();
    const title = firstMatchingTitle(html, keywords) || pageTitle(html) || source.name;
    const excerpt = metaDescription(html) || `Potential rodeo storyline context from ${source.name}.`;
    return {
      sourceName: source.name,
      url: source.url,
      title,
      excerpt
    };
  } catch {
    return null;
  }
}

function firstMatchingTitle(html: string, keywords: string[]) {
  const anchors = Array.from(html.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi))
    .map((match) => cleanText(decodeHtmlEntities(stripHtml(match[1]))))
    .filter((value) => value.length > 12 && value.length < 180);
  return anchors.find((title) => keywords.some((keyword) => keyword && title.toLowerCase().includes(keyword))) ?? "";
}

function pageTitle(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? cleanText(decodeHtmlEntities(stripHtml(match[1]))) : "";
}

function metaDescription(html: string) {
  const match = html.match(/<meta\s+[^>]*(?:name|property)=["'](?:description|og:description)["'][^>]*content=["']([^"']+)["'][^>]*>/i);
  return match ? cleanText(decodeHtmlEntities(match[1])) : "";
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ");
}

function decodeHtmlEntities(value: string) {
  const namedEntities: Record<string, string> = {
    amp: "&",
    apos: "'",
    nbsp: " ",
    quot: "\"",
    rsquo: "'",
    lsquo: "'",
    rdquo: "\"",
    ldquo: "\""
  };

  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, code: string) => {
    const normalized = code.toLowerCase();
    if (normalized[0] === "#") {
      const radix = normalized[1] === "x" ? 16 : 10;
      const number = Number.parseInt(normalized.slice(radix === 16 ? 2 : 1), radix);
      return Number.isFinite(number) ? String.fromCharCode(number) : entity;
    }
    return namedEntities[normalized] ?? entity;
  });
}

function contestantStandingName(position: ApiPosition) {
  return cleanText(`${position.NickName || position.FirstName || position.first_name || ""} ${position.LastName || position.last_name || ""}`) || "Unknown Athlete";
}

function eventCodeForName(value: string) {
  const normalized = value.trim().toLowerCase();
  const entry = Object.entries(eventNames).find(([, name]) => name.toLowerCase() === normalized);
  return entry?.[0] as EventCode | undefined;
}

function numberValue(value: number | string | null | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const parsed = Number(value.replace(/[$,]/g, "").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function safeJsonParse<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function headlineCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
