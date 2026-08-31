"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RodeoDailyLogoMark } from "../../components/rodeo-views";
import { supabasePublicUrl, supabasePublishableKey } from "../../lib/supabase-config";
import type { AdminNewsPost, GeneratedNewsDraft, NewsAdminDiagnostics, NewsPostInput, NewsStoryCandidate } from "../../lib/supabase-news";

type PublicNewsPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  status: "draft" | "published";
  featured: boolean;
  heroImage?: string;
  sourceUrls: string[];
  storyScore?: number;
  tags: string[];
  paragraphs: string[];
};

const emptyPost: NewsPostInput = {
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  status: "draft",
  category: "Pro Rodeo Roundup",
  author: "Rodeo Daily",
  tags: ["PRCA results", "WPRA results", "pro rodeo results"],
  sourceUrls: [],
  featured: false,
  storyScore: undefined,
  publishedAt: ""
};

const tokenStorageKey = "rodeodaily.newsAdminToken";

export function NewsAdminEditor() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [posts, setPosts] = useState<AdminNewsPost[]>([]);
  const [candidates, setCandidates] = useState<NewsStoryCandidate[]>([]);
  const [draft, setDraft] = useState<NewsPostInput>(emptyPost);
  const [message, setMessage] = useState("");
  const [postListMessage, setPostListMessage] = useState("");
  const [candidateMessage, setCandidateMessage] = useState("");
  const [diagnostics, setDiagnostics] = useState<NewsAdminDiagnostics | null>(null);
  const [loading, setLoading] = useState(false);

  const canSave = useMemo(() => draft.title.trim() && draft.slug.trim() && draft.excerpt.trim() && draft.content.trim(), [draft]);

  const loadPosts = useCallback(async (activeToken = token) => {
    if (!activeToken) return;
    setLoading(true);
    setPostListMessage("Loading posts...");

    try {
      const response = await fetch("/api/admin/news", {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${activeToken}`
        }
      });
      const payload = (await response.json()) as { data?: AdminNewsPost[]; count?: number; diagnostics?: NewsAdminDiagnostics; error?: string };
      if (!response.ok) throw new Error(payload.error || "Unable to load posts.");
      let loadedPosts = payload.data ?? [];
      let loadedFromPublicFallback = false;
      if (loadedPosts.length === 0) {
        loadedPosts = await loadPublishedPostsFallback();
        loadedFromPublicFallback = loadedPosts.length > 0;
      }
      setPosts(loadedPosts);
      setDiagnostics(payload.diagnostics ?? null);
      const count = loadedPosts.length || payload.count || 0;
      setPostListMessage(
        loadedFromPublicFallback
          ? `${count} published post${count === 1 ? "" : "s"} loaded from /news. Drafts are unavailable until the admin list query returns rows.`
          : `${count} post${count === 1 ? "" : "s"} loaded.`
      );
    } catch (error) {
      setPostListMessage(error instanceof Error ? error.message : "Unable to load posts.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const loadCandidates = useCallback(async (activeToken = token) => {
    if (!activeToken) return;
    setCandidateMessage("Loading article leads...");

    try {
      const response = await fetch("/api/admin/news/candidates", {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${activeToken}`
        }
      });
      const payload = (await response.json()) as { data?: NewsStoryCandidate[]; count?: number; error?: string };
      if (!response.ok) throw new Error(payload.error || "Unable to load article leads.");
      const loadedCandidates = payload.data ?? [];
      setCandidates(loadedCandidates);
      setCandidateMessage(`${loadedCandidates.length || payload.count || 0} article lead${loadedCandidates.length === 1 ? "" : "s"} ready.`);
    } catch (error) {
      setCandidateMessage(error instanceof Error ? error.message : "Unable to load article leads.");
    }
  }, [token]);

  useEffect(() => {
    const storedToken = window.localStorage.getItem(tokenStorageKey);
    if (storedToken) {
      setToken(storedToken);
      void loadPosts(storedToken);
      void loadCandidates(storedToken);
    }
  }, [loadCandidates, loadPosts]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${supabasePublicUrl}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
          apikey: supabasePublishableKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });
      const payload = (await response.json()) as { access_token?: string; error_description?: string; msg?: string };
      if (!response.ok || !payload.access_token) {
        throw new Error(payload.error_description || payload.msg || "Unable to login.");
      }

      window.localStorage.setItem(tokenStorageKey, payload.access_token);
      setToken(payload.access_token);
      await loadPosts(payload.access_token);
      await loadCandidates(payload.access_token);
      setPassword("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to login.");
    } finally {
      setLoading(false);
    }
  }

  async function savePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSave || !token) return;
    setLoading(true);
    setMessage("");

    try {
      const input: NewsPostInput = {
        ...draft,
        slug: slugify(draft.slug || draft.title),
        title: draft.title.trim(),
        excerpt: draft.excerpt.trim(),
        content: draft.content.trim(),
        category: draft.category.trim() || "Pro Rodeo Roundup",
        author: draft.author.trim() || "Rodeo Daily",
        tags: cleanList(draft.tags),
        sourceUrls: cleanList(draft.sourceUrls),
        heroImage: draft.heroImage?.trim() || undefined,
        publishedAt: draft.publishedAt || undefined
      };

      const response = await fetch("/api/admin/news", {
        method: "POST",
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(input)
      });
      const payload = (await response.json()) as { data?: AdminNewsPost; error?: string };
      if (!response.ok) throw new Error(payload.error || "Unable to save post.");

      if (payload.data) {
        setPosts((current) => {
          const nextPosts = [payload.data!, ...current.filter((post) => post.slug !== payload.data!.slug)];
          setPostListMessage(`${nextPosts.length} post${nextPosts.length === 1 ? "" : "s"} in this editor.`);
          return nextPosts;
        });
      }
      setMessage(input.status === "published" ? "Post saved and published. It should now appear on /news." : "Draft saved. It will not appear on /news until Published is checked.");
      setDraft(emptyPost);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save post.");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    window.localStorage.removeItem(tokenStorageKey);
    setToken("");
    setPosts([]);
    setCandidates([]);
    setDraft(emptyPost);
    setPostListMessage("");
    setCandidateMessage("");
    setDiagnostics(null);
  }

  async function refreshCandidates() {
    if (!token) return;
    setLoading(true);
    setMessage("");
    setCandidateMessage("Finding article leads from recent rodeo results...");

    try {
      const response = await fetch("/api/admin/news/candidates", {
        method: "POST",
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const payload = (await response.json()) as { data?: NewsStoryCandidate[]; count?: number; error?: string };
      if (!response.ok) throw new Error(payload.error || "Unable to find article leads.");
      const loadedCandidates = payload.data ?? [];
      setCandidates(loadedCandidates);
      setCandidateMessage(`${loadedCandidates.length || payload.count || 0} article lead${loadedCandidates.length === 1 ? "" : "s"} ready.`);
    } catch (error) {
      setCandidateMessage(error instanceof Error ? error.message : "Unable to find article leads.");
    } finally {
      setLoading(false);
    }
  }

  async function generateArticle() {
    if (!token) return;
    setLoading(true);
    setMessage("");
    setCandidateMessage("Generating an article from recent rodeo results...");

    try {
      const response = await fetch("/api/admin/news/generate", {
        method: "POST",
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const payload = (await response.json()) as GeneratedNewsDraft & { error?: string };
      if (!response.ok) throw new Error(payload.error || "Unable to generate an article.");
      setCandidates(payload.candidates ?? []);
      setDraft((current) => ({
        ...current,
        ...payload.post,
        status: current.status,
        featured: current.featured,
        publishedAt: current.publishedAt,
        heroImage: current.heroImage
      }));
      setCandidateMessage(`${payload.candidates?.length ?? 0} article lead${payload.candidates?.length === 1 ? "" : "s"} ready.`);
      setMessage(
        payload.usedAi
          ? "Researched article draft generated. Review names, numbers, sources, and standings impact before publishing."
          : "Article draft generated without AI because the site is missing an OpenAI key or the AI request failed. Review and expand before publishing."
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to generate an article.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="news-admin-page">
      <section className="news-admin-shell">
        <header className="seo-page-header">
          <Link className="seo-page-brand" href="/">
            <RodeoDailyLogoMark />
            <span>Rodeo Daily</span>
          </Link>
          <Link className="seo-page-open-app" href="/news">
            News
          </Link>
        </header>

        <section className="news-admin-hero">
          <div>
            <span>Editor</span>
            <h1>News Admin</h1>
            <p>Create drafts and publish rodeo news articles for the Rodeo Daily news section.</p>
          </div>
          {token && (
            <button type="button" onClick={logout}>
              Log Out
            </button>
          )}
        </section>

        {!token ? (
          <form className="news-admin-card news-admin-login" onSubmit={login}>
            <label>
              <span>Email</span>
              <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required />
            </label>
            <label>
              <span>Password</span>
              <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" required />
            </label>
            <button type="submit" disabled={loading}>
              {loading ? "Logging In..." : "Log In"}
            </button>
          </form>
        ) : (
          <section className="news-admin-layout">
            <form className="news-admin-card news-admin-form" onSubmit={savePost}>
              <section className="news-generator-panel" aria-label="Article generator">
                <div className="news-generator-header">
                  <div>
                    <span>Generator</span>
                    <h2>Generate Article</h2>
                  </div>
                  <button type="button" onClick={() => void generateArticle()} disabled={loading}>
                    {loading ? "Generating..." : "Generate Article"}
                  </button>
                </div>
                <p>{candidateMessage || "Creates an editable draft from the strongest recent result lead."}</p>
              </section>

              <div className="news-admin-form-grid">
                <label>
                  <span>Title</span>
                  <input value={draft.title} onChange={(event) => updateDraft({ title: event.target.value, slug: draft.slug || slugify(event.target.value) })} required />
                </label>
                <label>
                  <span>Slug</span>
                  <input value={draft.slug} onChange={(event) => updateDraft({ slug: slugify(event.target.value) })} required />
                </label>
                <label>
                  <span>Category</span>
                  <input value={draft.category} onChange={(event) => updateDraft({ category: event.target.value })} />
                </label>
                <label>
                  <span>Author</span>
                  <input value={draft.author} onChange={(event) => updateDraft({ author: event.target.value })} />
                </label>
              </div>

              <label>
                <span>Excerpt</span>
                <textarea value={draft.excerpt} onChange={(event) => updateDraft({ excerpt: event.target.value })} rows={3} required />
              </label>

              <label>
                <span>Article Body</span>
                <textarea value={draft.content} onChange={(event) => updateDraft({ content: event.target.value })} rows={12} required />
              </label>

              <div className="news-admin-form-grid">
                <label>
                  <span>Tags</span>
                  <input value={draft.tags.join(", ")} onChange={(event) => updateDraft({ tags: splitList(event.target.value) })} />
                </label>
                <label>
                  <span>Source URLs</span>
                  <input value={draft.sourceUrls.join(", ")} onChange={(event) => updateDraft({ sourceUrls: splitList(event.target.value) })} />
                </label>
                <label>
                  <span>Hero Image URL</span>
                  <input value={draft.heroImage ?? ""} onChange={(event) => updateDraft({ heroImage: event.target.value })} />
                </label>
                <label>
                  <span>Publish Date</span>
                  <input value={draft.publishedAt ?? ""} onChange={(event) => updateDraft({ publishedAt: event.target.value })} type="datetime-local" />
                </label>
              </div>

              <div className="news-admin-actions">
                <label className="news-admin-check">
                  <input checked={draft.status === "published"} onChange={(event) => updateDraft({ status: event.target.checked ? "published" : "draft" })} type="checkbox" />
                  <span>Published</span>
                </label>
                <label className="news-admin-check">
                  <input checked={draft.featured} onChange={(event) => updateDraft({ featured: event.target.checked })} type="checkbox" />
                  <span>Featured</span>
                </label>
                <button type="submit" disabled={!canSave || loading}>
                  {loading ? "Saving..." : "Save Post"}
                </button>
              </div>
            </form>

            <aside className="news-admin-card news-admin-post-list">
              <div>
                <h2>Article Leads</h2>
                <button type="button" onClick={() => void refreshCandidates()} disabled={loading}>
                  Find Leads
                </button>
              </div>
              {candidateMessage && <p>{candidateMessage}</p>}
              {candidates.length === 0 && <p>No leads found yet.</p>}
              {candidates.slice(0, 8).map((candidate) => (
                <button type="button" key={candidate.id} onClick={() => generateDraftFromCandidate(candidate)}>
                  <strong>{candidate.headline}</strong>
                  <span>{candidate.sourceName} - score {candidate.relevanceScore}</span>
                </button>
              ))}

              <div>
                <h2>Posts</h2>
                <button type="button" onClick={() => void loadPosts()} disabled={loading}>
                  Refresh
                </button>
              </div>
              {postListMessage && <p>{postListMessage}</p>}
              {diagnostics && (
                <p>
                  Supabase: {diagnostics.projectHost || "not set"} / table count:{" "}
                  {typeof diagnostics.directCount === "number" ? diagnostics.directCount : "unknown"} / status:{" "}
                  {diagnostics.directStatus ?? "unknown"}
                </p>
              )}
              {diagnostics?.directError && <p>{diagnostics.directError}</p>}
              {posts.length === 0 && <p>No posts found.</p>}
              {posts.map((post) => (
                <button type="button" key={post.slug} onClick={() => setDraft(post)}>
                  <strong>{post.title}</strong>
                  <span>{post.status === "published" ? "Published on /news" : "Draft - hidden from /news"}</span>
                </button>
              ))}
            </aside>
          </section>
        )}

        {message && <p className="news-admin-message">{message}</p>}
      </section>
    </main>
  );

  function updateDraft(next: Partial<NewsPostInput>) {
    setDraft((current) => ({ ...current, ...next }));
  }

  function generateDraftFromCandidate(candidate: NewsStoryCandidate) {
    applyCandidateDraft(candidate);
    setMessage("Article draft generated from the selected lead. Review the source and confirm standings impact before publishing.");
  }

  function applyCandidateDraft(candidate: NewsStoryCandidate) {
    const generatedPost = buildGeneratedPostFromCandidate(candidate);
    setDraft((current) => ({
      ...current,
      ...generatedPost,
      status: current.status,
      featured: current.featured,
      publishedAt: current.publishedAt,
      heroImage: current.heroImage
    }));
  }
}

async function loadPublishedPostsFallback(): Promise<AdminNewsPost[]> {
  try {
    const response = await fetch("/api/news", { cache: "no-store" });
    const payload = (await response.json()) as { data?: PublicNewsPost[] };
    if (!response.ok) return [];
    return (payload.data ?? []).map((post) => ({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.paragraphs.join("\n\n"),
      status: "published",
      category: post.category,
      author: post.author,
      tags: post.tags,
      heroImage: post.heroImage,
      sourceUrls: post.sourceUrls,
      featured: post.featured,
      storyScore: post.storyScore,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt
    }));
  } catch {
    return [];
  }
}

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
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

function buildGeneratedPostFromCandidate(candidate: NewsStoryCandidate): NewsPostInput {
  const headline = candidate.headline.trim();
  const summary = candidate.summary.trim();
  const cleanHeadline = headline || "Recent Pro Rodeo Result Creates Standings Story";
  const title = headlineCase(cleanHeadline);
  const sourceUrls = candidate.sourceUrl ? [candidate.sourceUrl] : [];
  const paragraphs = [
    `${summary || cleanHeadline} The result gives Rodeo Daily a story lead to review from the latest pro rodeo results.`,
    "The first editorial pass should verify the official placing, score or time, payout, and event context before the story is published. Once those details are confirmed, the article can connect the result to PRCA standings, WPRA standings, and the broader NFR picture.",
    "This story is strongest when it explains why the result matters beyond the leaderboard. That can include a standings jump, a season-best performance, a breakthrough win, a comeback, or a result that changes the pressure around the next rodeo.",
    "Rodeo Daily will continue tracking the follow-up as more PRCA results, WPRA results, and standings updates become available."
  ];

  return {
    slug: slugify(`${cleanHeadline}-article`),
    title,
    excerpt: `${title} is a rodeo news lead pulled from recent results for review, verification, and standings impact analysis.`,
    content: paragraphs.join("\n\n"),
    status: "draft",
    category: "Pro Rodeo Roundup",
    author: "Rodeo Daily",
    tags: ["PRCA results", "WPRA results", "pro rodeo results", "PRCA standings", "WPRA standings"],
    sourceUrls,
    featured: false,
    storyScore: candidate.relevanceScore,
    publishedAt: ""
  };
}

function headlineCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
