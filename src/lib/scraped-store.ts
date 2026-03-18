"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CompetitorScrapedData,
  VideoTranscript,
  VideoAnalysis,
} from "./scraped-types";

const STORAGE_KEY = "gabifit-scraped-v1";

function load(): Record<string, CompetitorScrapedData> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

export function useScrapedData() {
  const [data, setData] = useState<Record<string, CompetitorScrapedData>>({});
  const [hydrated, setHydrated] = useState(false);
  const [scraping, setScraping] = useState<Set<string>>(new Set());
  const [transcribing, setTranscribing] = useState<Set<string>>(new Set());
  const [analyzing, setAnalyzing] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setData(load());
    setHydrated(true);
  }, []);

  const persist = useCallback(
    (next: Record<string, CompetitorScrapedData>) => {
      setData(next);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
    },
    []
  );

  const scrapeCompetitor = useCallback(
    async (competitorId: string, handle: string) => {
      setScraping((prev) => new Set(prev).add(competitorId));
      setErrors((prev) => {
        const n = { ...prev };
        delete n[competitorId];
        return n;
      });
      try {
        const res = await fetch("/api/competitors/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ handle }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Error desconocido" }));
          throw new Error(err.error ?? `HTTP ${res.status}`);
        }
        const posts = await res.json();
        setData((current) => {
          const scraped: CompetitorScrapedData = {
            competitorId,
            handle,
            posts,
            scrapedAt: new Date().toISOString(),
            transcripts: current[competitorId]?.transcripts ?? {},
            analyses: current[competitorId]?.analyses ?? {},
          };
          const next = { ...current, [competitorId]: scraped };
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          } catch {}
          return next;
        });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Error al scrapear";
        setErrors((prev) => ({ ...prev, [competitorId]: message }));
      } finally {
        setScraping((prev) => {
          const n = new Set(prev);
          n.delete(competitorId);
          return n;
        });
      }
    },
    []
  );

  const fetchTranscript = useCallback(
    async (competitorId: string, postUrl: string) => {
      setTranscribing((prev) => new Set(prev).add(postUrl));
      setErrors((prev) => {
        const n = { ...prev };
        delete n[`transcript-${postUrl}`];
        return n;
      });
      try {
        const res = await fetch("/api/competitors/transcript", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoUrl: postUrl }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Error" }));
          throw new Error(err.error ?? `HTTP ${res.status}`);
        }
        const transcript: VideoTranscript = await res.json();
        setData((current) => {
          const existing = current[competitorId];
          if (!existing) return current;
          const updated: CompetitorScrapedData = {
            ...existing,
            transcripts: { ...existing.transcripts, [postUrl]: transcript },
          };
          const next = { ...current, [competitorId]: updated };
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          } catch {}
          return next;
        });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Error en transcripción";
        setErrors((prev) => ({
          ...prev,
          [`transcript-${postUrl}`]: message,
        }));
      } finally {
        setTranscribing((prev) => {
          const n = new Set(prev);
          n.delete(postUrl);
          return n;
        });
      }
    },
    []
  );

  const analyzePost = useCallback(
    async (
      competitorId: string,
      postUrl: string,
      transcript: string,
      caption: string,
      handle: string
    ) => {
      setAnalyzing((prev) => new Set(prev).add(postUrl));
      setErrors((prev) => {
        const n = { ...prev };
        delete n[`analyze-${postUrl}`];
        return n;
      });
      try {
        const res = await fetch("/api/competitors/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postUrl, transcript, caption, handle }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Error" }));
          throw new Error(err.error ?? `HTTP ${res.status}`);
        }
        const analysis: VideoAnalysis = await res.json();
        setData((current) => {
          const existing = current[competitorId];
          if (!existing) return current;
          const updated: CompetitorScrapedData = {
            ...existing,
            analyses: { ...existing.analyses, [postUrl]: analysis },
          };
          const next = { ...current, [competitorId]: updated };
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          } catch {}
          return next;
        });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Error en análisis";
        setErrors((prev) => ({
          ...prev,
          [`analyze-${postUrl}`]: message,
        }));
      } finally {
        setAnalyzing((prev) => {
          const n = new Set(prev);
          n.delete(postUrl);
          return n;
        });
      }
    },
    []
  );

  const clearCompetitorData = useCallback(
    (competitorId: string) => {
      setData((current) => {
        const next = { ...current };
        delete next[competitorId];
        persist(next);
        return next;
      });
    },
    [persist]
  );

  return {
    hydrated,
    data,
    scraping,
    transcribing,
    analyzing,
    errors,
    scrapeCompetitor,
    fetchTranscript,
    analyzePost,
    clearCompetitorData,
    getScrapedData: (id: string) => data[id] ?? null,
  };
}
