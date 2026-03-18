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
  analyzedAt: string;      // ISO
}

export interface CompetitorScrapedData {
  competitorId: string;
  handle: string;
  posts: ScrapedPost[];
  scrapedAt: string;       // ISO
  transcripts: Record<string, VideoTranscript>;   // postUrl → transcript
  analyses: Record<string, VideoAnalysis>;         // postUrl → analysis
}
