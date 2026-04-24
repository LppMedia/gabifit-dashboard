import type { PlatformKey, ContentTypeKey } from "@/lib/calendar-data";

export interface TopPostReport {
  shortCode: string;
  thumbnailUrl: string;        // enriched server-side from Apify displayUrl
  likesCount: number;
  commentsCount: number;
  videoViewCount: number;
  porQueFuncionó: string;      // 2-3 sentence AI diagnosis
  queRepetir: string;          // one concrete action to replicate
}

export interface WeeklyReport {
  resumenSemana: {
    totalPosts: number;
    totalLikes: number;
    totalViews: number;
    totalComments: number;
    avgEngagementRate: number;   // decimal percentage e.g. 4.52
    bestPerformingFormat: string;
  };
  topPosts: TopPostReport[];     // up to 5, sorted engagement desc
  insights: string;              // 3-4 sentence paragraph
  estrategia: string[];          // exactly 3 concrete actions
}

export interface ContentPlanPost {
  fecha: string;                 // "YYYY-MM-DD"
  plataforma: PlatformKey;
  formato: string;               // "Reel" | "Carrusel" | "Story" | "Short" | "Video"
  tema: string;
  hook: string;                  // exact opening line ready to record
  cta: string;
  caption: string;               // full caption, max ~150 chars
  tipo: ContentTypeKey;
  apuntaA: "curso" | "evento" | "comunidad" | null;
}

export interface WeekPlan {
  enfoqueSemana: "ventas_curso" | "evento_presencial" | "comunidad" | "educativo";
  posts: ContentPlanPost[];
}

export interface ContentPlan {
  scope: "week" | "month";
  semanas: WeekPlan[];
}
