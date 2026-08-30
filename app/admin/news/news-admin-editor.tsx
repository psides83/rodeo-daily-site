"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RodeoDailyLogoMark } from "../../components/rodeo-views";
import { supabasePublicUrl, supabasePublishableKey } from "../../lib/supabase-config";
import type { AdminNewsPost, NewsAdminDiagnostics, NewsPostInput } from "../../lib/supabase-news";

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
  const [draft, setDraft] = useState<NewsPostInput>(emptyPost);
  const [message, setMessage] = useState("");
  const [postListMessage, setPostListMessage] = useState("");
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
      setPosts(payload.data ?? []);
      setDiagnostics(payload.diagnostics ?? null);
      const count = payload.count ?? payload.data?.length ?? 0;
      setPostListMessage(`${count} post${count === 1 ? "" : "s"} loaded.`);
    } catch (error) {
      setPostListMessage(error instanceof Error ? error.message : "Unable to load posts.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const storedToken = window.localStorage.getItem(tokenStorageKey);
    if (storedToken) {
      setToken(storedToken);
      void loadPosts(storedToken);
    }
  }, [loadPosts]);

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
    setDraft(emptyPost);
    setPostListMessage("");
    setDiagnostics(null);
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
