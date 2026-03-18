"use client";

/**
 * calendar-store.ts
 *
 * Client-side persistence for calendar posts via localStorage.
 *
 * TODO (Supabase migration): Replace the localStorage read/write in
 * `persist()` and the `useEffect` initialiser with Supabase calls.
 * The hook interface (addPost / updatePost / deletePost) stays identical,
 * so no component changes are needed.
 */

import { useState, useEffect, useCallback } from "react";
import { CalendarPost, CALENDAR_POSTS } from "./calendar-data";

const STORAGE_KEY = "gabifit-calendar-v2";

function load(): CalendarPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as CalendarPost[];
  } catch {}
  return CALENDAR_POSTS; // fall back to seed data
}

function save(posts: CalendarPost[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch {
    // Storage quota exceeded — silently ignore for now
  }
}

export function useCalendarPosts() {
  const [posts, setPosts]       = useState<CalendarPost[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate once on mount
  useEffect(() => {
    const stored = load();
    // Merge seed data so new seed posts appear even after prior localStorage writes
    const storedIds = new Set(stored.map((p) => p.id));
    const merged    = [
      ...stored,
      ...CALENDAR_POSTS.filter((p) => !storedIds.has(p.id)),
    ];
    setPosts(merged);
    save(merged);
    setHydrated(true);
  }, []);

  // Updater that keeps state + storage in sync
  const persist = useCallback((updater: (prev: CalendarPost[]) => CalendarPost[]) => {
    setPosts((prev) => {
      const next = updater(prev);
      save(next);
      return next;
    });
  }, []);

  const addPost = useCallback(
    (post: Omit<CalendarPost, "id">): CalendarPost => {
      const newPost: CalendarPost = {
        ...post,
        id: `c${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      };
      persist((prev) => [...prev, newPost]);
      return newPost;
    },
    [persist]
  );

  const updatePost = useCallback(
    (id: string, updates: Partial<CalendarPost>) => {
      persist((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
    },
    [persist]
  );

  const deletePost = useCallback(
    (id: string) => {
      persist((prev) => prev.filter((p) => p.id !== id));
    },
    [persist]
  );

  return { posts, hydrated, addPost, updatePost, deletePost };
}
