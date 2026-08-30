export const supabasePublicUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") || "https://achpzqhveafdqkdufwhk.supabase.co";

export const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_61Zt6GCmZ6eoowr3YqgGsw_ZvHj_UQX";
