# GabiFit AI Weekly Report + Calendar Auto-Fill — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a single "Generar Reporte + Plan" button to the Plan Semanal tab that scrapes Instagram via Apify, calls KIE AI once with an extended prompt, shows a deep weekly report + content plan preview, then bulk-fills the Calendar via a confirm modal.

**Architecture:** The existing `/api/weekly-review` endpoint is extended to accept `scope` (`"week"|"month"`) and `month` (YYYY-MM), extend the KIE AI prompt to output two new top-level keys (`weeklyReport` + `contentPlan`), and enrich `topPosts` thumbnails server-side. Three new React components render Bloque 1 (report), Bloque 2 (plan preview), and Bloque 3 (confirm + bulk-insert modal). The instagram page wires everything with new state and a scope selector.

**Tech Stack:** Next.js 16 App Router, TypeScript 5, Tailwind CSS 4, Shadcn/ui, Supabase JS v2, KIE AI (DeepSeek Chat), Apify (existing integration), Lucide React icons.

**Spec:** `docs/superpowers/specs/2026-04-24-gabifit-ai-weekly-report-calendar-fill-design.md`

---

## File Map

| Action | Path |
|--------|------|
| **Create** | `src/lib/weekly-review-types.ts` |
| **Create** | `src/components/instagram/WeeklyReportBlock.tsx` |
| **Create** | `src/components/instagram/ContentPlanPreview.tsx` |
| **Create** | `src/components/instagram/CalendarFillModal.tsx` |
| **Modify** | `src/app/api/weekly-review/route.ts` |
| **Modify** | `src/app/(dashboard)/instagram/page.tsx` |

---

## Task 1: Shared Type Definitions

**Files:**
- Create: `src/lib/weekly-review-types.ts`

- [ ] **Step 1: Create the types file**

```ts
// src/lib/weekly-review-types.ts

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
  plataforma: "instagram" | "tiktok" | "youtube";
  formato: string;               // "Reel" | "Carrusel" | "Story" | "Short" | "Video"
  tema: string;
  hook: string;                  // exact opening line ready to record
  cta: string;
  caption: string;               // full caption, max ~150 chars
  tipo: "informativo" | "ventas" | "viralidad";
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
```

- [ ] **Step 2: Verify types compile**

```bash
npx tsc --noEmit --project tsconfig.json
```

Expected: no errors on the new file.

- [ ] **Step 3: Commit**

```bash
git add src/lib/weekly-review-types.ts
git commit -m "feat(types): add WeeklyReport + ContentPlan type definitions"
```

---

## Task 2: Extend the `/api/weekly-review` Endpoint

**Files:**
- Modify: `src/app/api/weekly-review/route.ts`

The endpoint already receives `posts` in the request body (the Apify call happens client-side via `scrapeProfile`). We need to:
1. Accept `scope` and `month` from the request body
2. Add `weeklyReport` and `contentPlan` sections to the AI prompt JSON schema
3. Compute `weeklyReport.resumenSemana` server-side from last-7-days posts (override AI values)
4. Enrich `weeklyReport.topPosts` with thumbnailUrl + metrics from the posts array
5. Increase `max_tokens` to 9000 for the larger output

- [ ] **Step 1: Replace the full route file with the extended version**

```ts
// src/app/api/weekly-review/route.ts
import { NextRequest, NextResponse } from "next/server";

const KIE_KEY = process.env.KIE_AI_API_KEY ?? "";
const KIE_URL = "https://kieai.erweima.ai/api/v1/chat/completions";
const MODEL   = "deepseek-chat";

export async function POST(req: NextRequest) {
  if (!KIE_KEY) {
    return NextResponse.json({ error: "KIE_AI_API_KEY no configurado" }, { status: 500 });
  }

  const { posts, transcripts, competitorSummary, handle, scope = "week", month } =
    await req.json().catch(() => ({}));

  if (!posts?.length) {
    return NextResponse.json({ error: "No hay posts para analizar" }, { status: 400 });
  }

  type RawPost = {
    shortCode: string;
    type: string;
    likesCount: number;
    commentsCount: number;
    videoViewCount: number;
    displayUrl: string;
    caption: string;
    timestamp: string;
    engagementRate?: number;
  };

  // ── Compute profile-wide averages for relative benchmarking ────────────────
  const totalEngPosts = posts.filter((p: RawPost) => p.videoViewCount > 0);
  const avgViews = totalEngPosts.length
    ? totalEngPosts.reduce((s: number, p: RawPost) => s + p.videoViewCount, 0) / totalEngPosts.length
    : 0;
  const avgLikesAll = posts.reduce((s: number, p: RawPost) => s + p.likesCount, 0) / posts.length;

  // ── Build posts text for the prompt ────────────────────────────────────────
  const postsText = posts
    .map((p: RawPost, i: number) => {
      const transcript = transcripts?.[p.shortCode] ?? "";
      const views    = p.videoViewCount || 0;
      const likes    = p.likesCount     || 0;
      const comments = p.commentsCount  || 0;
      const engRate  = views > 0
        ? ((likes + comments) / views * 100).toFixed(2)
        : likes > 0 ? `${((likes + comments) / Math.max(avgLikesAll, 1) * 100).toFixed(0)}% relativo` : "0";
      const vsAvgViews = views > 0 && avgViews > 0
        ? views >= avgViews * 1.5 ? "⬆ sobre promedio" : views <= avgViews * 0.6 ? "⬇ bajo promedio" : "≈ promedio"
        : "";
      return `POST ${i + 1} [ID: ${p.shortCode}] (${p.type}):
- Likes: ${likes} | Comentarios: ${comments} | Vistas: ${views} ${vsAvgViews} | Eng: ${engRate}%
- Caption (primeras 200 chars): ${p.caption?.slice(0, 200) ?? "(sin caption)"}
- Fecha: ${new Date(p.timestamp).toLocaleDateString("es-DO", { weekday: "short", day: "numeric", month: "short" })}${transcript ? `\n- Audio (transcripción parcial): ${transcript.slice(0, 500)}` : ""}`;
    })
    .join("\n\n");

  const postIds = posts.map((p: RawPost) => p.shortCode);

  // ── Compute next Monday for plan date anchoring ─────────────────────────────
  const today = new Date();
  const dow = today.getDay(); // 0=Sun,1=Mon,...
  const daysToMonday = dow === 1 ? 7 : dow === 0 ? 1 : 8 - dow;
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysToMonday);
  const nextMondayStr = nextMonday.toISOString().slice(0, 10);

  const scopeInstruction = scope === "month"
    ? `scope=month → genera 4 semanas completas (~24-28 posts total). Distribuye por semana: semana1=educativo, semana2=ventas_curso, semana3=comunidad, semana4=evento_presencial`
    : `scope=week → genera 1 semana (5-7 posts total). Elige el enfoque basado en el momentum actual`;

  const prompt = `Eres la estratega de contenido #1 en fitness postparto latinoamericano para Instagram 2025.

═══════════════════════════════════════════
MARCA: GabiFit (@${handle || "gabifitrd"})
═══════════════════════════════════════════
- Coach de fitness postparto, dominicana
- Voz: cálida, empoderada, directa, como amiga que sabe (no formal, no médica)
- Audiencia: mamás latinas 25-40 años, bebés 0-3 años, quieren recuperar su cuerpo sin culpa
- Diferenciador: dominicana, auténtica, postparto real (no cuerpo fitness perfecto)
- Formatos principales: Reels 15-60s, carruseles educativos
- PRODUCTOS A VENDER: un curso online de fitness postparto + un evento presencial

═══════════════════════════════════════════
TENDENCIAS INSTAGRAM 2025 — NICHO POSTPARTO
═══════════════════════════════════════════
FORMATOS QUE ESTÁN GANANDO AHORA:
• Reels 7-20s con hook visual impactante en los primeros 1-2 segundos
• "POV: eres mamá postparto y..." — narración en segunda persona genera más saves
• Before/after progreso real (no perfecto) → record de guardados
• "3 cosas que nadie te dice sobre..." → autoridad + educación + saves masivos
• Contenido vulnerable auténtico ("el día que casi me rindo") → comentarios explosivos
• Day-in-life mamá + ejercicio integrado → mucho más relatable que gym puro
• Texto on-screen en primeros 2s (no esperar el habla) → retención alta sin audio
• Carrusel educativo con slide 1 que promete transformación específica

FORMATOS QUE ESTÁN PERDIENDO FUERZA:
• Reels largos de más de 45s con introducción lenta
• Posts estáticos sin texto overlay ni valor educativo
• Captions genéricas sin historia personal
• Hashtags masivos (#fitness #gym) → menor alcance que hashtags de nicho exacto

HOOKS QUE FUNCIONAN EN EL NICHO AHORA:
• "Si tienes diastasis abdominal, PARA todo y mira esto 🛑"
• "Nadie te dijo esto después del parto..."
• "POV: tu entrenadora postparto te llama a las 6am"
• "El error que cometen el 90% de mamás al volver al gym"
• "Yo también pensé que nunca iba a recuperar mi cuerpo"
• "Esto vs. eso: lo que sí funciona vs. lo que te dicen en internet"

ALGORITMO IG 2025:
• Saves y compartidos > likes para reach orgánico
• Consistencia 4-5x/semana supera frecuencia 1-2x aunque sea mejor contenido
• Primeras 24h determinan si el Reel "vuela" o muere
• Audio trending = boost inicial, luego el contenido decide
• Subtítulos en pantalla = +40% retención (muchos ven sin sonido)
• Responder comentarios en primera hora = señal positiva al algoritmo
• Carruseles tienen el mayor tiempo de visualización → favorecidos para explorar

PILARES DE CONTENIDO QUE CONVIERTEN EN ESTE NICHO:
1. EDUCACIÓN: "Cómo se recupera el suelo pélvico realmente" (autoridad)
2. INSPIRACIÓN REAL: progreso auténtico tuyo o de clientas (no perfecto)
3. ERRORES COMUNES: "Lo que te dijeron mal sobre el postparto" (saves)
4. RUTINAS RÁPIDAS: "10 min siendo mamá de 0-3 años" (valor inmediato)
5. COMUNIDAD: preguntas, encuestas, "cuéntame tu historia" (comentarios)

═══════════════════════════════════════════
POSTS A ANALIZAR (${posts.length} publicaciones recientes):
═══════════════════════════════════════════
Promedio de vistas del perfil: ${Math.round(avgViews).toLocaleString()} vistas/video
Promedio de likes: ${Math.round(avgLikesAll).toLocaleString()} likes/post

${postsText}

${competitorSummary ? `COMPETIDORES:\n${competitorSummary}\n` : ""}
IDs para postAnalyses y weeklyReport.topPosts: ${postIds.join(", ")}

═══════════════════════════════════════════
INSTRUCCIONES DE ANÁLISIS
═══════════════════════════════════════════
Para cada post, diagnostica ESPECÍFICAMENTE:
- ¿Qué elemento técnico funcionó o falló? (hook visual, caption, formato, duración, CTA)
- ¿Qué emoción activó o no activó? (inspiración, miedo a perderse algo, validación, humor)
- ¿Qué elemento específico repetir o evitar?
SÉ DIAGNÓSTICO, NO GENÉRICO. "El hook capturó atención" no es suficiente.
Di: "El texto 'POV: tu cuerpo después de 3 hijos' en los primeros 2s activó identificación inmediata en mamás con vergüenza corporal."

Para contentPlan:
- Primer post a partir del lunes: ${nextMondayStr}
- ${scopeInstruction}
- Distribución de CTAs: ~30% apuntaA=curso, ~20% apuntaA=evento, ~50% apuntaA=comunidad o null
- Plataformas: ~60% instagram, ~25% tiktok, ~15% youtube
- Captions: máx 150 caracteres (cortos y directos, se expanden en el editor)
- Cada caption debe terminar con un CTA de acción (Guarda esto / Comenta / Link en bio)

Genera ÚNICAMENTE JSON válido (sin markdown, sin explicaciones fuera del JSON):
{
  "weekSummary": {
    "totalPosts": 0,
    "totalLikes": 0,
    "totalComments": 0,
    "totalViews": 0,
    "avgEngagement": "0%",
    "bestPerformingType": "Reel|Carrusel|Post",
    "topPost": { "caption": "...", "likes": 0, "why": "En 1 oración diagnóstica específica: qué elemento exacto lo hizo viral" }
  },
  "postAnalyses": [
    {
      "shortCode": "ID_DEL_POST",
      "performanceScore": 0,
      "tier": "viral|good|avg|low",
      "why": "Diagnóstico específico: qué elemento visual/textual/emocional determinó el resultado",
      "whatToRepeat": "El elemento concreto a replicar en el próximo video (con ejemplo de cómo hacerlo)"
    }
  ],
  "voiceAnalysis": {
    "strengths": ["Fortaleza específica de Gabi que conecta con su audiencia"],
    "opportunities": ["Oportunidad concreta que NO está aprovechando aún"],
    "toneScore": 0,
    "consistencyScore": 0
  },
  "topicsThisWeek": ["Tema detectado 1"],
  "audienceAlignment": {
    "score": 0,
    "notes": "Análisis de qué tan bien el contenido habla directamente a mamás latinas postparto 25-40",
    "emotionalHooks": ["Hook emocional que YA está funcionando"]
  },
  "trendInsights": {
    "topFormatsNow": ["Formato específico que está explotando AHORA para este nicho"],
    "viralHooksToTest": ["Hook exacto listo para grabar esta semana"],
    "contentGaps": ["Tema que la competencia está cubriendo y GabiFit no"],
    "algorithmTips": ["Tip de algoritmo específico basado en el patrón de los posts analizados"]
  },
  "growthStrategy": {
    "mainBottleneck": "El freno #1 del crecimiento basado en el análisis de estos posts",
    "quickWins": ["Cosa que Gabi puede hacer ESTA semana para subir alcance — específica y accionable"],
    "contentPillars": [
      { "pillar": "Nombre del pilar", "why": "Por qué este pilar es clave para el nicho ahora", "frequency": "Xveces/semana", "exampleHook": "Hook de ejemplo listo para grabar" }
    ]
  },
  "competitorInsights": "Qué están haciendo diferente los competidores y qué puede adaptar Gabi",
  "nextWeekPlan": {
    "theme": "Tema central unificador para la próxima semana",
    "contentPieces": [
      { "day": "Lunes", "format": "Reel", "topic": "Tema específico", "hook": "Hook de apertura EXACTO listo para grabar", "cta": "CTA específico con la acción que quieres que hagan", "notes": "Detalles de producción" }
    ],
    "hashtags": ["hashtag_nicho_exacto_1"],
    "keyMessage": "Mensaje central que une todo el contenido de la semana en 1 frase"
  },
  "actionItems": [
    "Acción MUY específica y accionable #1 — qué grabar, cuándo publicar, qué decir"
  ],
  "weeklyReport": {
    "resumenSemana": {
      "totalPosts": 0,
      "totalLikes": 0,
      "totalViews": 0,
      "totalComments": 0,
      "avgEngagementRate": 0.0,
      "bestPerformingFormat": "Reel"
    },
    "topPosts": [
      {
        "shortCode": "ID_DEL_POST_MAS_EXITOSO",
        "porQueFuncionó": "Diagnóstico específico de 2-3 oraciones: qué elemento técnico/emocional determinó el resultado",
        "queRepetir": "Acción concreta lista para implementar esta semana"
      }
    ],
    "insights": "Párrafo de 3-4 oraciones: qué tipo de contenido ganó esta semana, qué patrón emergió, qué emoción activó más engagement",
    "estrategia": [
      "Acción #1: específica y accionable para esta semana",
      "Acción #2: específica y accionable",
      "Acción #3: específica y accionable"
    ]
  },
  "contentPlan": {
    "scope": "${scope}",
    "semanas": [
      {
        "enfoqueSemana": "ventas_curso|evento_presencial|comunidad|educativo",
        "posts": [
          {
            "fecha": "YYYY-MM-DD",
            "plataforma": "instagram|tiktok|youtube",
            "formato": "Reel|Carrusel|Story|Short|Video",
            "tema": "Tema específico del post",
            "hook": "Hook de apertura EXACTO — las primeras palabras del video/post",
            "cta": "CTA específico con la acción que se busca",
            "caption": "Caption en voz GabiFit, máx 150 chars, termina con CTA",
            "tipo": "informativo|ventas|viralidad",
            "apuntaA": "curso|evento|comunidad"
          }
        ]
      }
    ]
  }
}`;

  const res = await fetch(KIE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${KIE_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: scope === "month" ? 9000 : 6500,
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    console.error("[weekly-review] KIE error:", err);
    return NextResponse.json({ error: `Error IA: ${res.status}` }, { status: 502 });
  }

  const data    = await res.json();
  const rawText: string = data?.choices?.[0]?.message?.content ?? "{}";

  let analysis: Record<string, unknown>;
  try {
    const cleaned = rawText.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    analysis = JSON.parse(cleaned);
  } catch {
    return NextResponse.json(
      { error: "IA devolvió JSON inválido", raw: rawText.slice(0, 500) },
      { status: 502 }
    );
  }

  // ── Override weekSummary with real computed values ──────────────────────────
  const realLikes    = posts.reduce((s: number, p: RawPost) => s + (p.likesCount    || 0), 0);
  const realComments = posts.reduce((s: number, p: RawPost) => s + (p.commentsCount || 0), 0);
  const realViews    = posts.reduce((s: number, p: RawPost) => s + (p.videoViewCount || 0), 0);
  const realAvgEng   = realViews > 0
    ? `${((realLikes + realComments) / realViews * 100).toFixed(2)}%`
    : realLikes > 0 ? `${(realLikes / posts.length).toFixed(0)} avg likes` : "0%";
  if (!analysis.weekSummary) analysis.weekSummary = {};
  const ws = analysis.weekSummary as Record<string, unknown>;
  ws.totalPosts    = posts.length;
  ws.totalLikes    = realLikes;
  ws.totalComments = realComments;
  ws.totalViews    = realViews;
  ws.avgEngagement = ws.avgEngagement || realAvgEng;

  // ── Override weeklyReport.resumenSemana with last-7-days computed values ────
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentPosts = posts.filter((p: RawPost) => new Date(p.timestamp) >= sevenDaysAgo);

  const recentLikes    = recentPosts.reduce((s: number, p: RawPost) => s + (p.likesCount    || 0), 0);
  const recentComments = recentPosts.reduce((s: number, p: RawPost) => s + (p.commentsCount || 0), 0);
  const recentViews    = recentPosts.reduce((s: number, p: RawPost) => s + (p.videoViewCount || 0), 0);
  const recentAvgEng   = recentViews > 0
    ? parseFloat(((recentLikes + recentComments) / recentViews * 100).toFixed(2))
    : recentLikes > 0 ? parseFloat(((recentLikes + recentComments) / Math.max(recentPosts.length, 1)).toFixed(2)) : 0;

  // Count best performing format in recent posts
  const formatCount: Record<string, number> = {};
  recentPosts.forEach((p: RawPost) => {
    formatCount[p.type] = (formatCount[p.type] ?? 0) + 1;
  });
  const bestFormat = Object.entries(formatCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Reel";

  if (analysis.weeklyReport) {
    const wr = analysis.weeklyReport as Record<string, unknown>;
    wr.resumenSemana = {
      totalPosts:           recentPosts.length,
      totalLikes:           recentLikes,
      totalViews:           recentViews,
      totalComments:        recentComments,
      avgEngagementRate:    recentAvgEng,
      bestPerformingFormat: bestFormat,
    };

    // ── Enrich topPosts with thumbnailUrl + real metrics ──────────────────────
    const postsMap = new Map(posts.map((p: RawPost) => [p.shortCode, p]));
    const topPosts = wr.topPosts as Array<Record<string, unknown>> | undefined;
    if (topPosts?.length) {
      wr.topPosts = topPosts.map((tp) => {
        const src = postsMap.get(tp.shortCode as string);
        return {
          ...tp,
          thumbnailUrl:    src?.displayUrl    ?? "",
          likesCount:      src?.likesCount    ?? 0,
          commentsCount:   src?.commentsCount ?? 0,
          videoViewCount:  src?.videoViewCount ?? 0,
        };
      });
    }
  }

  return NextResponse.json({
    ...analysis,
    generatedAt:   new Date().toISOString(),
    handle:        handle || "gabifitrd",
    postsAnalyzed: posts.length,
    scope,
  });
}
```

- [ ] **Step 2: Verify it lints without errors**

```bash
npm run lint -- --max-warnings=0 src/app/api/weekly-review/route.ts
```

Expected: no errors (warnings about `any` may appear; they are acceptable).

- [ ] **Step 3: Commit**

```bash
git add src/app/api/weekly-review/route.ts
git commit -m "feat(api): extend weekly-review with weeklyReport + contentPlan output"
```

---

## Task 3: WeeklyReportBlock Component (Bloque 1)

**Files:**
- Create: `src/components/instagram/WeeklyReportBlock.tsx`

Renders KPI row, top-5 posts grid with thumbnails + "Por qué funcionó" / "Qué repetir", insights paragraph, and 3-action estrategia checklist.

- [ ] **Step 1: Create the component**

```tsx
// src/components/instagram/WeeklyReportBlock.tsx
"use client";

import { Eye, Heart, MessageCircle, CheckCircle2, Zap, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WeeklyReport } from "@/lib/weekly-review-types";

interface Props {
  report: WeeklyReport;
}

const RANK_STYLES = [
  "bg-amber-400 text-black",
  "bg-zinc-300 text-black",
  "bg-orange-700 text-white",
  "bg-zinc-600 text-white",
  "bg-zinc-700 text-white",
];

export function WeeklyReportBlock({ report }: Props) {
  const { resumenSemana, topPosts, insights, estrategia } = report;

  return (
    <div className="flex flex-col gap-5">
      {/* ── KPI row ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Posts esta semana", value: String(resumenSemana.totalPosts),                       color: "text-lime-400"   },
          { label: "Total likes",       value: resumenSemana.totalLikes.toLocaleString(),              color: "text-pink-400"  },
          { label: "Total vistas",      value: resumenSemana.totalViews.toLocaleString(),              color: "text-cyan-400"  },
          { label: "Engagement",        value: `${resumenSemana.avgEngagementRate.toFixed(1)}%`,       color: "text-violet-400"},
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-border/40 bg-card px-5 py-4">
            <p className={cn("font-display text-[28px] font-bold tabular-nums leading-none", color)}>{value}</p>
            <p className="mt-1.5 text-[12px] text-muted-foreground/60">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Top posts ──────────────────────────────────────────────────────── */}
      {topPosts.length > 0 && (
        <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
          <div className="h-[3px] bg-gradient-to-r from-amber-400 via-pink-500 to-violet-500" />
          <div className="p-5 flex flex-col gap-4">
            <h3 className="font-display text-[15px] font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              Top Posts — Por qué funcionaron
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {topPosts.slice(0, 5).map((post, i) => (
                <div key={post.shortCode} className="flex flex-col rounded-xl border border-border/30 bg-white/[0.02] overflow-hidden">
                  {/* Thumbnail */}
                  <div className="relative aspect-[4/5] bg-gradient-to-br from-purple-900/30 to-pink-900/20 overflow-hidden">
                    {post.thumbnailUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`/api/proxy-image?url=${encodeURIComponent(post.thumbnailUrl)}`}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                    {/* Rank badge */}
                    <div className="absolute top-2 left-2 z-10">
                      <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold", RANK_STYLES[i] ?? RANK_STYLES[4])}>
                        #{i + 1}
                      </span>
                    </div>
                    {/* Metrics overlay */}
                    <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 bg-gradient-to-t from-black/70 to-transparent px-2.5 pt-6 pb-2 text-[11px] text-white">
                      {post.videoViewCount > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Eye className="h-3 w-3" />{post.videoViewCount.toLocaleString()}
                        </span>
                      )}
                      <span className="flex items-center gap-0.5">
                        <Heart className="h-3 w-3" />{post.likesCount.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-0.5 text-white/60">
                        <MessageCircle className="h-3 w-3" />{post.commentsCount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {/* Analysis */}
                  <div className="p-3 flex flex-col gap-2.5">
                    <div>
                      <p className="text-[9px] uppercase tracking-wide font-semibold text-lime-400/60 mb-0.5">Por qué funcionó</p>
                      <p className="text-[11px] text-foreground/80 leading-relaxed">{post.porQueFuncionó}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wide font-semibold text-purple-400/60 mb-0.5">Qué repetir</p>
                      <p className="text-[11px] text-purple-200/70 leading-relaxed">{post.queRepetir}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Insights ───────────────────────────────────────────────────────── */}
      {insights && (
        <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
          <div className="h-[3px] bg-gradient-to-r from-cyan-500 to-blue-500" />
          <div className="p-5 flex flex-col gap-2">
            <h3 className="font-display text-[15px] font-semibold flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-cyan-400" />Insights de la Semana
            </h3>
            <p className="text-[13px] text-foreground/70 leading-relaxed">{insights}</p>
          </div>
        </div>
      )}

      {/* ── Estrategia ─────────────────────────────────────────────────────── */}
      {estrategia.length > 0 && (
        <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
          <div className="h-[3px] bg-gradient-to-r from-emerald-500 to-lime-400" />
          <div className="p-5 flex flex-col gap-3">
            <h3 className="font-display text-[15px] font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />Estrategia: 3 Acciones Esta Semana
            </h3>
            {estrategia.slice(0, 3).map((action, i) => (
              <div key={i} className="flex items-start gap-2.5 text-[13px] text-foreground/80">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10 text-[10px] font-bold text-emerald-400">
                  {i + 1}
                </div>
                {action}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify no type errors**

```bash
npx tsc --noEmit --project tsconfig.json
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/instagram/WeeklyReportBlock.tsx
git commit -m "feat(ui): add WeeklyReportBlock component — top posts + insights + estrategia"
```

---

## Task 4: ContentPlanPreview Component (Bloque 2)

**Files:**
- Create: `src/components/instagram/ContentPlanPreview.tsx`

Renders week-grouped post chips with platform colors and CTA icons, plus the "Confirmar y llenar calendario" button.

- [ ] **Step 1: Create the component**

```tsx
// src/components/instagram/ContentPlanPreview.tsx
"use client";

import { ShoppingCart, MapPin, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContentPlan, ContentPlanPost } from "@/lib/weekly-review-types";
import { PLATFORMS } from "@/lib/calendar-data";

interface Props {
  contentPlan: ContentPlan;
  onConfirm: () => void;
}

const FOCUS_LABELS: Record<string, { label: string; color: string }> = {
  ventas_curso:      { label: "Ventas — Curso",   color: "text-amber-400 bg-amber-500/10 border-amber-500/25"   },
  evento_presencial: { label: "Evento Presencial", color: "text-pink-400 bg-pink-500/10 border-pink-500/25"     },
  comunidad:         { label: "Comunidad",         color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25" },
  educativo:         { label: "Educativo",         color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/25"     },
};

function CtaIcon({ apuntaA }: { apuntaA: ContentPlanPost["apuntaA"] }) {
  if (apuntaA === "curso")  return <ShoppingCart className="h-3 w-3 text-amber-400 shrink-0" title="Apunta al curso" />;
  if (apuntaA === "evento") return <MapPin className="h-3 w-3 text-pink-400 shrink-0" title="Apunta al evento" />;
  return null;
}

export function ContentPlanPreview({ contentPlan, onConfirm }: Props) {
  const totalPosts = contentPlan.semanas.reduce((s, w) => s + w.posts.length, 0);
  const byPlatform = { instagram: 0, tiktok: 0, youtube: 0 };
  contentPlan.semanas.forEach((w) =>
    w.posts.forEach((p) => {
      if (p.plataforma in byPlatform) byPlatform[p.plataforma as keyof typeof byPlatform]++;
    })
  );

  const platformSummaryParts: string[] = [];
  if (byPlatform.instagram > 0) platformSummaryParts.push(`${byPlatform.instagram} en Instagram`);
  if (byPlatform.tiktok > 0)    platformSummaryParts.push(`${byPlatform.tiktok} en TikTok`);
  if (byPlatform.youtube > 0)   platformSummaryParts.push(`${byPlatform.youtube} en YouTube`);

  return (
    <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
      <div className="h-[3px] bg-gradient-to-r from-pink-500 via-violet-500 to-cyan-500" />
      <div className="p-5 flex flex-col gap-4">
        {/* Header */}
        <div>
          <h3 className="font-display text-[15px] font-semibold flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-violet-400" />
            {contentPlan.scope === "week" ? "Plan Semanal" : "Plan Mensual"} — {totalPosts} posts listos
          </h3>
          <p className="text-[12px] text-muted-foreground/50 mt-0.5">{platformSummaryParts.join(" · ")}</p>
        </div>

        {/* Weeks */}
        {contentPlan.semanas.map((semana, wi) => {
          const focus = FOCUS_LABELS[semana.enfoqueSemana] ?? FOCUS_LABELS.comunidad;
          return (
            <div key={wi} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-wide">
                  Semana {wi + 1}
                </span>
                <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", focus.color)}>
                  {focus.label}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {semana.posts.map((post, pi) => {
                  const platform = PLATFORMS[post.plataforma as keyof typeof PLATFORMS];
                  return (
                    <div
                      key={pi}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium cursor-default",
                        platform?.bg ?? "bg-white/5",
                        platform?.border ?? "border-white/10",
                        platform?.color ?? "text-white"
                      )}
                      title={`${post.fecha} — ${post.hook}`}
                    >
                      <span className="font-semibold">{platform?.abbr ?? "IG"}</span>
                      <span className="text-foreground/30">·</span>
                      <span>{post.formato}</span>
                      <span className="text-foreground/30">·</span>
                      <span className="max-w-[72px] truncate text-foreground/80">{post.tema}</span>
                      <CtaIcon apuntaA={post.apuntaA} />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Confirm button */}
        <button
          onClick={onConfirm}
          className="mt-1 w-full rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 hover:opacity-90 active:opacity-80 transition-opacity"
        >
          Confirmar y llenar calendario →
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify no type errors**

```bash
npx tsc --noEmit --project tsconfig.json
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/instagram/ContentPlanPreview.tsx
git commit -m "feat(ui): add ContentPlanPreview component — week-grouped plan chips"
```

---

## Task 5: CalendarFillModal Component (Bloque 3)

**Files:**
- Create: `src/components/instagram/CalendarFillModal.tsx`

On open: fetches existing `calendar_posts` for the plan's date range to detect conflicts. Shows a table with checkboxes (free posts checked, conflicts unchecked). On confirm: bulk-inserts to `calendar_posts` Supabase table, then redirects to `/calendar`.

- [ ] **Step 1: Create the component**

```tsx
// src/components/instagram/CalendarFillModal.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, AlertTriangle, X } from "lucide-react";
import type { ContentPlan, ContentPlanPost } from "@/lib/weekly-review-types";
import { createClient } from "@/lib/supabase/client";
import { PLATFORMS } from "@/lib/calendar-data";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentPlan: ContentPlan;
}

interface PostRow extends ContentPlanPost {
  conflict: boolean;
  selected: boolean;
}

function makeId(i: number) {
  return `ai${Date.now() + i}-${Math.random().toString(36).slice(2, 9)}`;
}

export function CalendarFillModal({ open, onOpenChange, contentPlan }: Props) {
  const router = useRouter();
  const [rows,    setRows]    = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filling, setFilling] = useState(false);
  const [toast,   setToast]   = useState<string | null>(null);

  // Detect conflicts every time the modal opens
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setToast(null);

    async function detectConflicts() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const allPlanPosts = contentPlan.semanas.flatMap((w) => w.posts);
      if (!allPlanPosts.length) { setRows([]); setLoading(false); return; }

      const dates     = allPlanPosts.map((p) => p.fecha);
      const rangeStart = dates.reduce((a, b) => (a < b ? a : b));
      const rangeEnd   = dates.reduce((a, b) => (a > b ? a : b));

      const { data: existing } = await supabase
        .from("calendar_posts")
        .select("date")
        .gte("date", rangeStart)
        .lte("date", rangeEnd)
        .eq("user_id", user.id);

      const occupiedDates = new Set<string>((existing ?? []).map((r) => r.date as string));

      setRows(
        allPlanPosts.map((post) => ({
          ...post,
          conflict: occupiedDates.has(post.fecha),
          selected: !occupiedDates.has(post.fecha),
        }))
      );
      setLoading(false);
    }

    detectConflicts();
  }, [open, contentPlan]);

  function toggleRow(index: number) {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, selected: !r.selected } : r))
    );
  }

  async function handleFill() {
    setFilling(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setFilling(false); return; }

    const selected = rows.filter((r) => r.selected);
    if (!selected.length) { setFilling(false); return; }

    const toInsert = selected.map((p, i) => ({
      id:          makeId(i),
      user_id:     user.id,
      date:        p.fecha,
      time:        "09:00",
      platform:    p.plataforma,
      type:        p.tipo,
      status:      "scheduled",
      caption:     p.caption,
      format:      p.formato,
      hashtags:    null,
      script:      null,
      notes:       p.hook ? `Hook: ${p.hook}\nCTA: ${p.cta}` : null,
      media_files: null,
      engagement:  null,
    }));

    const { error } = await supabase.from("calendar_posts").insert(toInsert);

    if (error) {
      setToast(`Error al guardar: ${error.message}`);
      setFilling(false);
      return;
    }

    setToast(`${toInsert.length} posts agregados al calendario ✓`);
    setTimeout(() => {
      onOpenChange(false);
      router.push("/calendar");
    }, 1400);
  }

  if (!open) return null;

  const selectedCount = rows.filter((r) => r.selected).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-border/50 bg-background shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/30 shrink-0">
          <div>
            <h2 className="font-display text-[16px] font-semibold">Revisar antes de llenar el calendario</h2>
            <p className="text-[12px] text-muted-foreground/50 mt-0.5">{selectedCount} posts seleccionados</p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-14 text-[13px] text-muted-foreground/50">
              <Loader2 className="h-4 w-4 animate-spin" />
              Detectando conflictos con el calendario...
            </div>
          ) : rows.length === 0 ? (
            <p className="py-10 text-center text-[13px] text-muted-foreground/40">
              El plan no tiene posts para agregar.
            </p>
          ) : (
            <table className="w-full text-[12px]">
              <thead className="sticky top-0 bg-background/95 backdrop-blur border-b border-border/20">
                <tr>
                  {["", "Fecha", "Plataforma", "Tema", "Estado"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/40">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const platform = PLATFORMS[row.plataforma as keyof typeof PLATFORMS];
                  return (
                    <tr
                      key={i}
                      className={cn(
                        "border-b border-border/15 transition-colors",
                        row.selected ? "hover:bg-white/[0.02]" : "opacity-50"
                      )}
                    >
                      <td className="pl-4 py-3">
                        <input
                          type="checkbox"
                          checked={row.selected}
                          onChange={() => toggleRow(i)}
                          className="h-3.5 w-3.5 rounded accent-violet-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground/80 tabular-nums whitespace-nowrap">
                        {new Date(row.fecha + "T12:00:00").toLocaleDateString("es-DO", {
                          weekday: "short", day: "numeric", month: "short",
                        })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={cn("font-semibold", platform?.color ?? "text-white")}>{platform?.abbr ?? row.plataforma}</span>
                        <span className="ml-1 text-muted-foreground/40">{row.formato}</span>
                      </td>
                      <td className="px-4 py-3 text-foreground/70 max-w-[180px] truncate">{row.tema}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {row.conflict ? (
                          <span className="flex items-center gap-1 text-[11px] text-amber-400">
                            <AlertTriangle className="h-3 w-3" />Conflicto
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />Libre
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-border/30 bg-background shrink-0">
          {toast ? (
            <p className="text-[13px] text-emerald-400 font-medium">{toast}</p>
          ) : (
            <p className="text-[12px] text-muted-foreground/50">
              {selectedCount} de {rows.length} posts serán creados en el calendario
            </p>
          )}
          <button
            onClick={handleFill}
            disabled={filling || selectedCount === 0 || !!toast}
            className="flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            {filling
              ? <><Loader2 className="h-4 w-4 animate-spin" />Llenando...</>
              : <>Llenar calendario</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify no type errors**

```bash
npx tsc --noEmit --project tsconfig.json
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/instagram/CalendarFillModal.tsx
git commit -m "feat(ui): add CalendarFillModal — conflict detection + bulk calendar insert"
```

---

## Task 6: Wire Everything in instagram/page.tsx

**Files:**
- Modify: `src/app/(dashboard)/instagram/page.tsx`

Changes needed:
1. Import 3 new components + 2 new types
2. Add 5 new state variables: `planScope`, `planMonth`, `weeklyReport`, `contentPlan`, `fillModalOpen`
3. Update mount `useEffect` to restore `weeklyReport` + `contentPlan` from Supabase
4. Update `generatePlan()` to pass `scope`/`month` and extract new fields
5. Update Plan Semanal tab: add scope selector, render `WeeklyReportBlock` + `ContentPlanPreview` before the existing sections, render `CalendarFillModal`
6. Update the reset button to clear new state

- [ ] **Step 1: Add imports at the top of the file (after existing imports)**

Find the line `import { cn } from "@/lib/utils";` in `src/app/(dashboard)/instagram/page.tsx` and add after it:

```ts
import type { WeeklyReport, ContentPlan } from "@/lib/weekly-review-types";
import { WeeklyReportBlock } from "@/components/instagram/WeeklyReportBlock";
import { ContentPlanPreview } from "@/components/instagram/ContentPlanPreview";
import { CalendarFillModal } from "@/components/instagram/CalendarFillModal";
```

- [ ] **Step 2: Add new state variables**

Find the block of `useState` declarations inside `InstagramPage()` that starts at approximately line 406:
```ts
const [activeTab, setActiveTab]           = useState("feed");
```

Add these 5 new state declarations right after the existing block (after `const [editPost, setEditPost]`):

```ts
const [planScope, setPlanScope]       = useState<"week" | "month">("week");
const [planMonth, setPlanMonth]       = useState(() => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`;
});
const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null);
const [contentPlan,  setContentPlan]  = useState<ContentPlan  | null>(null);
const [fillModalOpen, setFillModalOpen] = useState(false);
```

- [ ] **Step 3: Update the mount useEffect to restore new fields**

Find the existing `loadSavedPlan` useEffect (around line 419). Replace the lines inside `if (data?.analysis?.postAnalyses?.length)` block — specifically the block that ends with `setPlanStep("done"); setPlanLoadedAt(...)` — to also restore the new fields:

Existing block to find:
```ts
        if (data?.analysis?.postAnalyses?.length) {
          const savedAnalysis = data.analysis as WeeklyAnalysis;
          setWeeklyAnalysis(savedAnalysis);
          const map: Record<string, PostAnalysis> = {};
          (savedAnalysis.postAnalyses ?? []).forEach((pa) => { map[pa.shortCode] = pa; });
          setPaMap(map);
          setPlanStep("done");
          setPlanLoadedAt(data.scraped_at ?? null);
        }
```

Replace with:
```ts
        if (data?.analysis?.postAnalyses?.length) {
          const savedAnalysis = data.analysis as WeeklyAnalysis;
          setWeeklyAnalysis(savedAnalysis);
          const map: Record<string, PostAnalysis> = {};
          (savedAnalysis.postAnalyses ?? []).forEach((pa) => { map[pa.shortCode] = pa; });
          setPaMap(map);
          // Restore new fields if they exist in the saved analysis
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((savedAnalysis as any).weeklyReport) setWeeklyReport((savedAnalysis as any).weeklyReport);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((savedAnalysis as any).contentPlan)  setContentPlan((savedAnalysis as any).contentPlan);
          setPlanStep("done");
          setPlanLoadedAt(data.scraped_at ?? null);
        }
```

- [ ] **Step 4: Update generatePlan() to pass scope/month and extract new fields**

Find the existing `async function generatePlan()` (around line 479). Replace the entire function body with:

```ts
  async function generatePlan() {
    if (!profile?.posts.length) return;
    setPlanStep("analyzing");
    setPlanError(null);
    try {
      const r = await fetch("/api/weekly-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          posts:  profile.posts,
          handle: profile.username,
          scope:  planScope,
          month:  planMonth,
        }),
      });
      if (!r.ok) throw new Error(((await r.json().catch(() => ({}))) as { error?: string }).error ?? "Error IA");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: WeeklyAnalysis & Record<string, any> = await r.json();

      const map: Record<string, PostAnalysis> = {};
      (data.postAnalyses ?? []).forEach((pa) => { map[pa.shortCode] = pa; });
      setPaMap(map);

      if (data.weeklyReport) setWeeklyReport(data.weeklyReport as WeeklyReport);
      if (data.contentPlan)  setContentPlan(data.contentPlan  as ContentPlan);

      setPlanStep("saving");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const ws = new Date();
        ws.setDate(ws.getDate() - ws.getDay());
        ws.setHours(0, 0, 0, 0);
        await supabase.from("weekly_reviews").upsert({
          user_id:         user.id,
          week_start_date: ws.toISOString().split("T")[0],
          posts:           profile.posts,
          analysis:        data,
          scraped_at:      new Date().toISOString(),
        });
      }

      setWeeklyAnalysis(data);
      setLogRefreshKey((k) => k + 1);
      setPlanStep("done");
    } catch (e) {
      setPlanError(e instanceof Error ? e.message : "Error de red");
      setPlanStep("error");
    }
  }
```

- [ ] **Step 5: Add scope selector to the Plan Semanal generate section**

Inside the Plan Semanal tab (`{/* ══════════════ TAB 3: PLAN SEMANAL ══════════════ */}`), find the outer `<div className="flex flex-col gap-6">` and add the scope selector as the very first child, before the `{planStep !== "done" && (` block:

```tsx
              {/* Scope selector — always visible */}
              <div className="flex items-center gap-1 rounded-xl border border-border/40 bg-card p-1 w-fit">
                {(["week", "month"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setPlanScope(s)}
                    className={cn(
                      "rounded-lg px-4 py-2 text-[12px] font-semibold transition-colors",
                      planScope === s
                        ? "bg-lime-600 text-black shadow-sm"
                        : "text-muted-foreground/60 hover:text-foreground"
                    )}
                  >
                    {s === "week" ? "Esta semana (7 días)" : "Este mes (4 semanas)"}
                  </button>
                ))}
              </div>
```

- [ ] **Step 6: Update the generate button label inside the hero section**

Find the generate button text inside the Hero section:
```tsx
                      <><Sparkles className="h-4 w-4" />Generar Plan Semanal</>
```
Replace with:
```tsx
                      <><Sparkles className="h-4 w-4" />Generar Reporte + Plan</>
```

Also update the loading status text inside the hero:
```tsx
                      {planStep === "analyzing" ? "Analizando posts con IA..." : "Guardando en Supabase..."}
```
Replace with:
```tsx
                      {planStep === "analyzing" ? "Analizando con IA... (30-60 seg)" : "Guardando análisis..."}
```

- [ ] **Step 7: Add WeeklyReportBlock and ContentPlanPreview to the results section**

Inside the `{wa && planStep === "done" && (` block, find the opening:
```tsx
                <div className="flex flex-col gap-5">
                  {/* KPI row */}
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
```

Add the two new blocks **before** the existing KPI row:
```tsx
                <div className="flex flex-col gap-5">
                  {/* NEW: Bloque 1 — Weekly Report */}
                  {weeklyReport && <WeeklyReportBlock report={weeklyReport} />}

                  {/* NEW: Bloque 2 — Content Plan Preview */}
                  {contentPlan && (
                    <ContentPlanPreview
                      contentPlan={contentPlan}
                      onConfirm={() => setFillModalOpen(true)}
                    />
                  )}

                  {/* KPI row */}
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
```

- [ ] **Step 8: Update the reset button to clear new state**

Find the reset `Button` (around line 1035):
```tsx
                        <Button variant="outline" onClick={() => { setPlanStep("idle"); setWeeklyAnalysis(null); setPaMap({}); }}
```
Replace with:
```tsx
                        <Button variant="outline" onClick={() => { setPlanStep("idle"); setWeeklyAnalysis(null); setPaMap({}); setWeeklyReport(null); setContentPlan(null); }}
```

- [ ] **Step 9: Render CalendarFillModal before the closing fragment**

Find the closing lines of the component (after the `<NewPostDialog .../>` element):
```tsx
      <NewPostDialog
        open={dialogOpen}
        ...
      />
    </>
  );
}
```

Add the modal before the closing `</>`:
```tsx
      <NewPostDialog
        open={dialogOpen}
        onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditPost(null); }}
        editPost={editPost}
        onSave={handleSave}
      />

      {/* NEW: Calendar Fill Modal */}
      {contentPlan && (
        <CalendarFillModal
          open={fillModalOpen}
          onOpenChange={setFillModalOpen}
          contentPlan={contentPlan}
        />
      )}
    </>
  );
}
```

- [ ] **Step 10: Verify the build passes**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors. Lint warnings about `any` casts are acceptable.

- [ ] **Step 11: Commit**

```bash
git add src/app/(dashboard)/instagram/page.tsx
git commit -m "feat(instagram): AI weekly report + scope selector + calendar auto-fill wired up"
```

---

## Self-Review Checklist

After completing all tasks, verify:

- [ ] `WeeklyReport` and `ContentPlan` types are consistently referenced by the same names across all 4 files
- [ ] `topPosts` in API response is enriched with `thumbnailUrl` from `displayUrl` field (not from AI)
- [ ] `resumenSemana` values are computed server-side from last-7-days posts, not trusted from AI
- [ ] `CalendarFillModal` inserts with `platform` = `ContentPlanPost.plataforma` which matches `PlatformKey` union (`"instagram" | "tiktok" | "youtube"`)
- [ ] `CalendarFillModal` inserts with `type` = `ContentPlanPost.tipo` which matches `ContentTypeKey` union (`"informativo" | "ventas" | "viralidad"`)
- [ ] Scope selector is visible before the generate hero, not hidden behind it
- [ ] Reset clears `weeklyReport` and `contentPlan` in addition to existing state
- [ ] `CalendarFillModal` only renders when `contentPlan` is non-null (conditional wrapper guards it)
