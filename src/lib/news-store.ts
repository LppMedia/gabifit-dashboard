"use client";
import { useState, useEffect, useCallback } from "react";
import { NewsArticle, NEWS_ARTICLES, getArticlesByBatch } from "./news-data";
import { createClient } from "@/lib/supabase/client";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

interface NewsState {
  bookmarks: string[];
  activeBatch: number;
  lastRefreshedAt: string;
  readArticles: string[];
}

const DEFAULT_STATE: NewsState = {
  bookmarks:       [],
  activeBatch:     1,
  lastRefreshedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  readArticles:    [],
};

export function useNews() {
  const [state, setState]       = useState<NewsState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    let active = true;
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setHydrated(true); return; }

      const { data } = await supabase
        .from("news_state")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (active) {
        if (data) {
          setState({
            bookmarks:       data.bookmarks ?? [],
            activeBatch:     data.active_batch ?? 1,
            lastRefreshedAt: data.last_refreshed_at ?? DEFAULT_STATE.lastRefreshedAt,
            readArticles:    data.read_articles ?? [],
          });
        }
        setHydrated(true);
      }
    }
    init();
    return () => { active = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = useCallback(
    async (s: NewsState) => {
      setState(s);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("news_state").upsert({
        user_id:           user.id,
        bookmarks:         s.bookmarks,
        active_batch:      s.activeBatch,
        last_refreshed_at: s.lastRefreshedAt,
        read_articles:     s.readArticles,
      });
    },
    [supabase]
  );

  const activeArticles: NewsArticle[] = (() => {
    const batch1   = getArticlesByBatch(state.activeBatch);
    const prevBatch = state.activeBatch === 1 ? 5 : state.activeBatch - 1;
    const batch2   = getArticlesByBatch(prevBatch);
    return [...batch1, ...batch2].slice(0, 20);
  })();

  const bookmarkedArticles = NEWS_ARTICLES.filter((a) => state.bookmarks.includes(a.id));
  const hasNewArticles     = Date.now() - new Date(state.lastRefreshedAt).getTime() > WEEK_MS;

  const toggleBookmark = useCallback(
    (id: string) => {
      persist({
        ...state,
        bookmarks: state.bookmarks.includes(id)
          ? state.bookmarks.filter((b) => b !== id)
          : [...state.bookmarks, id],
      });
    },
    [state, persist]
  );

  const markRead = useCallback(
    (id: string) => {
      if (state.readArticles.includes(id)) return;
      persist({ ...state, readArticles: [...state.readArticles, id] });
    },
    [state, persist]
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise<void>((r) => setTimeout(r, 1800));
    const nextBatch = state.activeBatch === 5 ? 1 : state.activeBatch + 1;
    await persist({ ...state, activeBatch: nextBatch, lastRefreshedAt: new Date().toISOString() });
    setRefreshing(false);
  }, [state, persist]);

  const daysSinceRefresh = Math.floor(
    (Date.now() - new Date(state.lastRefreshedAt).getTime()) / (24 * 60 * 60 * 1000)
  );

  return {
    hydrated,
    activeArticles,
    bookmarkedArticles,
    bookmarks:    state.bookmarks,
    readArticles: state.readArticles,
    toggleBookmark,
    markRead,
    refresh,
    refreshing,
    hasNewArticles,
    daysSinceRefresh,
    totalBookmarks: state.bookmarks.length,
  };
}
