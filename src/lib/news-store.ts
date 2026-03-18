"use client";
import { useState, useEffect, useCallback } from "react";
import { NewsArticle, NEWS_ARTICLES, getArticlesByBatch } from "./news-data";

const STORAGE_KEY = "gabifit-news-v1";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

interface NewsState {
  bookmarks: string[];
  activeBatch: number;
  lastRefreshedAt: string;
  readArticles: string[];
}

export function useNews() {
  const [state, setState] = useState<NewsState>({
    bookmarks: [],
    activeBatch: 1,
    lastRefreshedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    readArticles: [],
  });
  const [hydrated, setHydrated] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw) as NewsState);
    } catch {
      // ignore parse errors
    }
    setHydrated(true);
  }, []);

  const persist = useCallback((s: NewsState) => {
    setState(s);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {
      // ignore storage errors
    }
  }, []);

  const activeArticles: NewsArticle[] = (() => {
    const batch1 = getArticlesByBatch(state.activeBatch);
    const prevBatch = state.activeBatch === 1 ? 5 : state.activeBatch - 1;
    const batch2 = getArticlesByBatch(prevBatch);
    return [...batch1, ...batch2].slice(0, 20);
  })();

  const bookmarkedArticles = NEWS_ARTICLES.filter((a) =>
    state.bookmarks.includes(a.id)
  );

  const hasNewArticles =
    Date.now() - new Date(state.lastRefreshedAt).getTime() > WEEK_MS;

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
    persist({
      ...state,
      activeBatch: nextBatch,
      lastRefreshedAt: new Date().toISOString(),
    });
    setRefreshing(false);
  }, [state, persist]);

  const daysSinceRefresh = Math.floor(
    (Date.now() - new Date(state.lastRefreshedAt).getTime()) /
      (24 * 60 * 60 * 1000)
  );

  return {
    hydrated,
    activeArticles,
    bookmarkedArticles,
    bookmarks: state.bookmarks,
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
