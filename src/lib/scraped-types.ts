export interface ScrapedPost {
  id: string;              // shortCode
  shortCode: string;
  url: string;
  type: "Video" | "Image" | "Sidecar";
  caption: string;
  likesCount: number;
  commentsCount: number;
  videoViewCount: number;
  timestamp: string;       // ISO
  displayUrl: string;      // thumbnail
  videoUrl: string | null;
  ownerUsername: string;
  durationSec: number | null;
  // Computed after scraping
  engagementRate?: number;
}

export interface VideoTranscript {
  postUrl: string;
  transcript: string;
  segments: Array<{ start: number; end: number; text: string }>;
  language: string;
  fetchedAt: string;       // ISO
}

// ─── GabiFit full-script section ──────────────────────────────────────────────
export interface GabifitScriptSection {
  label:        string;    // e.g. "Hook", "Problema", "Solución", "CTA"
  emoji:        string;    // e.g. "🎣", "😤", "💡", "📲"
  durationHint: string;    // e.g. "0:00-0:05"
  script:       string;    // exact words Gabi would say
  visualNotes:  string;    // camera / editing / B-roll notes
}

// ─── AI analysis result ────────────────────────────────────────────────────────
export interface VideoAnalysis {
  postUrl: string;
  hook: {
    text: string;
    type: "curiosidad" | "dolor" | "promesa" | "identidad" | "humor" | "sorpresa";
  };
  structure: Array<{
    time: string;          // "0:00-0:05"
    section: string;
    description: string;
  }>;
  tone: {
    main: string;
    attributes: string[];
  };
  tactics: string[];
  gabifitAdaptation: {
    title: string;
    tips: string[];
    suggestedHook: string;
    suggestedCTA: string;
  };
  // Full rewritten script — present when mode:"full_script" was requested
  gabifitScript?: GabifitScriptSection[];
  analyzedAt: string;      // ISO
}

// ─── Scraped data store record ────────────────────────────────────────────────
export interface CompetitorScrapedData {
  competitorId: string;
  handle: string;
  posts: ScrapedPost[];
  scrapedAt: string;       // ISO
  transcripts: Record<string, VideoTranscript>;   // postUrl → transcript
  analyses: Record<string, VideoAnalysis>;         // postUrl → analysis
}

// ─── Scrape API response (new shape that includes follower count) ──────────────
export interface ScrapeApiResponse {
  posts:     ScrapedPost[];
  followers: number | null;
}

// ─── URL Drop Analyzer ────────────────────────────────────────────────────────
export type UrlAnalyzerStep =
  | "idle"
  | "scraping"
  | "transcribing"
  | "analyzing"
  | "done"
  | "error";

export interface UrlAnalyzerState {
  step:       UrlAnalyzerStep;
  post:       ScrapedPost | null;
  transcript: VideoTranscript | null;
  analysis:   VideoAnalysis | null;
  error:      string | null;
}
