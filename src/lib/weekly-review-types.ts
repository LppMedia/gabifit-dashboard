import type { PlatformKey, ContentTypeKey } from "@/lib/calendar-data";

// ── Deep-dive video analysis ───────────────────────────────────────────────────

export interface ContentStructure {
  hook: string;           // Exact opening hook (first 2-5 seconds)
  problema: string;       // Problem being addressed
  solucion: string;       // Solution / value delivered
  cta: string;            // Call to action
  ritmo: string;          // Pacing and editing style notes
  porQueFunciona: string; // Why this structure works for postpartum moms
}

export interface AngleVariation {
  numero: number;
  titulo: string;         // e.g. "Ángulo 2: La mamá cansada"
  angulo: string;         // The specific perspective / entry point
  hook: string;           // Exact opening line ready to record
  diferenciador: string;  // What makes this angle unique vs the original
}

export interface TopVideoDeepDive {
  shortCode: string;
  thumbnailUrl: string;
  caption: string;              // Original Instagram caption
  likesCount: number;
  commentsCount: number;
  videoViewCount: number;
  porQueFuncionó: string;       // 3-4 sentence specific diagnosis
  estructura: ContentStructure;
  angulos: AngleVariation[];    // Exactly 5 angles
}

// ── Niche recommendations ──────────────────────────────────────────────────────

export interface NicheRecommendation {
  titulo: string;
  hook: string;                  // Exact opening line ready to record
  angulo: string;                // Content angle / approach
  formato: string;               // e.g. "Reel 20-30s" | "Carrusel 5 slides"
  porQueAhora: string;           // Why this topic works NOW in this niche
  relacionadoA: "curso" | "evento" | "comunidad";
}

// ── Calendar post with full script ────────────────────────────────────────────

export interface ContentPlanPost {
  fecha: string;                 // "YYYY-MM-DD"
  plataforma: PlatformKey;
  formato: string;               // "Reel" | "Carrusel" | "Story" | "Short" | "Video"
  tema: string;
  hook: string;                  // Exact opening line ready to record
  guion: string;                 // Full script: hook + desarrollo + CTA
  caption: string;               // Instagram caption max ~150 chars
  cta: string;
  tipo: ContentTypeKey;
  apuntaA: "curso" | "evento" | "comunidad" | null;
  notasProduccion: string;       // Production notes (B-roll, text on screen, etc.)
}

export interface WeekPlan {
  enfoqueSemana: "ventas_curso" | "evento_presencial" | "comunidad" | "educativo";
  posts: ContentPlanPost[];
}

export interface ContentPlan {
  scope: "week" | "month";
  semanas: WeekPlan[];
}

// ── Weekly report ─────────────────────────────────────────────────────────────

export interface WeeklyReport {
  resumenSemana: {
    totalPosts: number;
    totalLikes: number;
    totalViews: number;
    totalComments: number;
    avgEngagementRate: number;    // decimal e.g. 4.52
    bestPerformingFormat: string;
  };
  topVideos: TopVideoDeepDive[];              // Top 3 with deep-dive analysis
  insights: string;                            // 3-4 sentence paragraph
  videosRecomendados: NicheRecommendation[];  // 5-8 niche video ideas
  estrategia: string[];                        // Exactly 3 concrete actions
}
