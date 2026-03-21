"use client";

import { useState, useEffect, useCallback } from "react";
import { CalendarPost } from "./calendar-data";
import { createClient } from "@/lib/supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRow(row: any): CalendarPost {
  return {
    id:         row.id,
    date:       row.date,
    time:       row.time,
    platform:   row.platform,
    type:       row.type,
    status:     row.status,
    caption:    row.caption,
    format:     row.format,
    hashtags:   row.hashtags ?? undefined,
    script:     row.script ?? undefined,
    mediaFiles: row.media_files
      ? (row.media_files as CalendarPost["mediaFiles"])
      : undefined,
    notes:      row.notes ?? undefined,
    engagement: row.engagement ?? undefined,
  };
}

function toInsert(post: Omit<CalendarPost, "id">, userId: string) {
  // Strip `url` from mediaFiles — object URLs are session-only
  const mediaFiles = post.mediaFiles
    ? post.mediaFiles.map(({ url: _url, ...meta }) => meta)
    : null;

  return {
    id:          `c${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    user_id:     userId,
    date:        post.date,
    time:        post.time,
    platform:    post.platform,
    type:        post.type,
    status:      post.status,
    caption:     post.caption,
    format:      post.format,
    hashtags:    post.hashtags ?? null,
    script:      post.script ?? null,
    media_files: mediaFiles,
    notes:       post.notes ?? null,
    engagement:  post.engagement ?? null,
  };
}

export function useCalendarPosts() {
  const [posts, setPosts]       = useState<CalendarPost[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    let active = true;
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setHydrated(true); return; }

      const { data } = await supabase
        .from("calendar_posts")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: true });

      if (active) {
        setPosts((data ?? []).map(fromRow));
        setHydrated(true);
      }
    }
    init();
    return () => { active = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addPost = useCallback(
    async (post: Omit<CalendarPost, "id">): Promise<CalendarPost> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const fallback: CalendarPost = {
          ...post,
          id: `c${Date.now()}`,
        };
        return fallback;
      }

      const row = toInsert(post, user.id);
      const { data, error } = await supabase
        .from("calendar_posts")
        .insert(row)
        .select()
        .single();

      const result = !error && data ? fromRow(data) : { ...post, id: row.id };
      setPosts((prev) => [...prev, result]);
      return result;
    },
    [supabase]
  );

  const updatePost = useCallback(
    async (id: string, updates: Partial<CalendarPost>) => {
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );

      const dbUpdates: Record<string, unknown> = {};
      if (updates.date       !== undefined) dbUpdates.date        = updates.date;
      if (updates.time       !== undefined) dbUpdates.time        = updates.time;
      if (updates.platform   !== undefined) dbUpdates.platform    = updates.platform;
      if (updates.type       !== undefined) dbUpdates.type        = updates.type;
      if (updates.status     !== undefined) dbUpdates.status      = updates.status;
      if (updates.caption    !== undefined) dbUpdates.caption     = updates.caption;
      if (updates.format     !== undefined) dbUpdates.format      = updates.format;
      if (updates.hashtags   !== undefined) dbUpdates.hashtags    = updates.hashtags;
      if (updates.script     !== undefined) dbUpdates.script      = updates.script;
      if (updates.notes      !== undefined) dbUpdates.notes       = updates.notes;
      if (updates.engagement !== undefined) dbUpdates.engagement  = updates.engagement;
      if (updates.mediaFiles !== undefined) {
        dbUpdates.media_files = updates.mediaFiles?.map(({ url: _url, ...meta }) => meta) ?? null;
      }

      await supabase.from("calendar_posts").update(dbUpdates).eq("id", id);
    },
    [supabase]
  );

  const deletePost = useCallback(
    async (id: string) => {
      setPosts((prev) => prev.filter((p) => p.id !== id));
      await supabase.from("calendar_posts").delete().eq("id", id);
    },
    [supabase]
  );

  return { posts, hydrated, addPost, updatePost, deletePost };
}
