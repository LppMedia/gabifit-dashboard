"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CompetitorScrapedData,
  VideoTranscript,
  VideoAnalysis,
} from "./scraped-types";
import { createClient } from "@/lib/supabase/client";

export function useScrapedData() {
  const [data, setData]             = useState<Record<string, CompetitorScrapedData>>({});
  const [hydrated, setHydrated]     = useState(false);
  const [scraping, setScraping]     = useState<Set<string>>(new Set());
  const [transcribing, setTranscribing] = useState<Set<string>>(new Set());
  const [analyzing, setAnalyzing]   = useState<Set<string>>(new Set());
  const [errors, setErrors]         = useState<Record<string, string>>({});
  const supabase = createClient();

  useEffect(() => {
    let active = true;
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setHydrated(true); return; }

      const { data: rows } = await supabase
        .from("competitor_scraped_data")
        .select("*")
        .eq("user_id", user.id);

      if (active) {
        const map: Record<string, CompetitorScrapedData> = {};
        for (const row of rows ?? []) {
          map[row.competitor_id] = {
            competitorId: row.competitor_id,
            handle:       row.handle,
            posts:        row.posts ?? [],
            scrapedAt:    row.scraped_at,
            transcripts:  row.transcripts ?? {},
            analyses:     row.analyses ?? {},
          };
        }
        setData(map);
        setHydrated(true);
      }
    }
    init();
    return () => { active = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Upsert a full scraped data record to DB
  const persistToDB = useCallback(
    async (record: CompetitorScrapedData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("competitor_scraped_data").upsert({
        competitor_id: record.competitorId,
        user_id:       user.id,
        handle:        record.handle,
        posts:         record.posts,
        transcripts:   record.transcripts,
        analyses:      record.analyses,
        scraped_at:    record.scrapedAt,
      });
    },
    [supabase]
  );

  const scrapeCompetitor = useCallback(
    async (
      competitorId: string,
      handle: string,
      onFollowersUpdate?: (followers: number) => void
    ) => {
      setScraping((prev) => new Set(prev).add(competitorId));
      setErrors((prev) => { const n = { ...prev }; delete n[competitorId]; return n; });
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
        const { posts, followers } = await res.json();
        if (followers != null && onFollowersUpdate) {
          onFollowersUpdate(followers);
        }
        setData((current) => {
          const scraped: CompetitorScrapedData = {
            competitorId,
            handle,
            posts,
            scrapedAt:   new Date().toISOString(),
            transcripts: current[competitorId]?.transcripts ?? {},
            analyses:    current[competitorId]?.analyses ?? {},
          };
          const next = { ...current, [competitorId]: scraped };
          persistToDB(scraped);
          return next;
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Error al scrapear";
        setErrors((prev) => ({ ...prev, [competitorId]: message }));
      } finally {
        setScraping((prev) => { const n = new Set(prev); n.delete(competitorId); return n; });
      }
    },
    [persistToDB]
  );

  const fetchTranscript = useCallback(
    async (competitorId: string, postUrl: string, videoUrl?: string) => {
      setTranscribing((prev) => new Set(prev).add(postUrl));
      setErrors((prev) => { const n = { ...prev }; delete n[`transcript-${postUrl}`]; return n; });
      try {
        // Prefer the actual video file URL for transcription; fall back to the post URL
        const urlForTranscript = videoUrl ?? postUrl;
        const res = await fetch("/api/competitors/transcript", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoUrl: urlForTranscript }),
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
          persistToDB(updated);
          return next;
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Error en transcripción";
        setErrors((prev) => ({ ...prev, [`transcript-${postUrl}`]: message }));
      } finally {
        setTranscribing((prev) => { const n = new Set(prev); n.delete(postUrl); return n; });
      }
    },
    [persistToDB]
  );

  const analyzePost = useCallback(
    async (
      competitorId: string,
      postUrl: string,
      transcript: string,
      caption: string,
      handle: string,
      mode?: string
    ) => {
      setAnalyzing((prev) => new Set(prev).add(postUrl));
      setErrors((prev) => { const n = { ...prev }; delete n[`analyze-${postUrl}`]; return n; });
      try {
        const res = await fetch("/api/competitors/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postUrl, transcript, caption, handle, mode }),
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
          persistToDB(updated);
          return next;
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Error en análisis";
        setErrors((prev) => ({ ...prev, [`analyze-${postUrl}`]: message }));
      } finally {
        setAnalyzing((prev) => { const n = new Set(prev); n.delete(postUrl); return n; });
      }
    },
    [persistToDB]
  );

  const clearCompetitorData = useCallback(
    async (competitorId: string) => {
      setData((current) => {
        const next = { ...current };
        delete next[competitorId];
        return next;
      });
      await supabase
        .from("competitor_scraped_data")
        .delete()
        .eq("competitor_id", competitorId);
    },
    [supabase]
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
