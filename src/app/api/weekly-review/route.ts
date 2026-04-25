import { NextRequest, NextResponse } from "next/server";

const KIE_KEY = process.env.KIE_AI_API_KEY ?? "";
const KIE_URL = "https://kieai.erweima.ai/api/v1/chat/completions";
const MODEL   = "claude-opus-4-5";

export async function POST(req: NextRequest) {
  if (!KIE_KEY) {
    return NextResponse.json({ error: "KIE_AI_API_KEY no configurado" }, { status: 500 });
  }

  const body = await req.json().catch(() => ({}));
  const { posts, transcripts, competitorSummary, handle } = body;
  const scope: "week" | "month" = body.scope === "month" ? "month" : "week";
  const month: string | undefined = typeof body.month === "string" ? body.month : undefined;
  void month;

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

  // ── Compute profile-wide averages for relative benchmarking ──────────────────
  const totalEngPosts = posts.filter((p: RawPost) => p.videoViewCount > 0);
  const avgViews = totalEngPosts.length
    ? totalEngPosts.reduce((s: number, p: RawPost) => s + p.videoViewCount, 0) / totalEngPosts.length
    : 0;
  const avgLikesAll = posts.reduce((s: number, p: RawPost) => s + p.likesCount, 0) / posts.length;

  // ── Sort posts by engagement to identify top 3 clearly ───────────────────────
  const sortedPosts = [...posts].sort((a: RawPost, b: RawPost) => {
    const scoreA = (a.videoViewCount || 0) + (a.likesCount || 0) * 3 + (a.commentsCount || 0) * 5;
    const scoreB = (b.videoViewCount || 0) + (b.likesCount || 0) * 3 + (b.commentsCount || 0) * 5;
    return scoreB - scoreA;
  });
  const top3Codes = sortedPosts.slice(0, 3).map((p: RawPost) => p.shortCode);

  // ── Build posts text for the prompt ──────────────────────────────────────────
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
      const isTop3 = top3Codes.includes(p.shortCode) ? " ★TOP3★" : "";
      return `POST ${i + 1}${isTop3} [ID: ${p.shortCode}] (${p.type}):
- Likes: ${likes} | Comentarios: ${comments} | Vistas: ${views} ${vsAvgViews} | Eng: ${engRate}%
- Caption completo: ${p.caption ?? "(sin caption)"}
- Fecha: ${new Date(p.timestamp).toLocaleDateString("es-DO", { weekday: "short", day: "numeric", month: "short" })}${transcript ? `\n- Transcripción de audio: ${transcript.slice(0, 800)}` : ""}`;
    })
    .join("\n\n");

  const postIds = posts.map((p: RawPost) => p.shortCode);

  // ── Compute next Monday for plan date anchoring ───────────────────────────────
  const today = new Date();
  const dow = today.getDay();
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
• Subtítulos en pantalla = +40% retención
• Responder comentarios en primera hora = señal positiva al algoritmo

═══════════════════════════════════════════
POSTS A ANALIZAR (${posts.length} publicaciones):
═══════════════════════════════════════════
Promedio de vistas del perfil: ${Math.round(avgViews).toLocaleString()} vistas/video
Promedio de likes: ${Math.round(avgLikesAll).toLocaleString()} likes/post

${postsText}

${competitorSummary ? `COMPETIDORES:\n${competitorSummary}\n` : ""}
IDs disponibles: ${postIds.join(", ")}
TOP 3 IDs (los más performantes): ${top3Codes.join(", ")}

═══════════════════════════════════════════
INSTRUCCIONES — LEE CON ATENCIÓN
═══════════════════════════════════════════

SECCIÓN weeklyReport.topVideos — ANÁLISIS PROFUNDO DE LOS 3 MEJORES VIDEOS:
Para cada uno de los 3 posts marcados ★TOP3★, genera:
1. porQueFuncionó: Diagnóstico específico de 3-4 oraciones. NO genérico. Di exactamente qué elemento visual/textual/emocional determinó el resultado y por qué resonó con mamás latinas postparto.
2. estructura: Extrae la estructura del contenido desde la caption y el tipo de video:
   - hook: Las primeras palabras exactas / texto en pantalla en los primeros 2 segundos
   - problema: El dolor o situación que aborda el video
   - solucion: Qué ofrece o muestra como solución
   - cta: Qué acción pide o implica al final
   - ritmo: Estilo de edición y pacing (cortes, velocidad, texto en pantalla, duración estimada)
   - porQueFunciona: Por qué esta estructura específica conecta con el público objetivo
3. angulos: EXACTAMENTE 5 variaciones del mismo tema desde ángulos distintos. Cada ángulo debe:
   - Ser completamente diferente al original y a los otros 4
   - Tener un hook exacto y listo para grabar (las primeras palabras del video)
   - Apuntar a un segmento diferente (primeriza, mamá de 3, mamá que trabaja, etc.)

SECCIÓN weeklyReport.videosRecomendados — 8 IDEAS PARA EL NICHO FITNESS POSTPARTO:
Videos que NO ha hecho Gabi pero que están funcionando en el nicho ahora mismo.
Considera: fitness postparto, diastasis abdominal, suelo pélvico, lactancia y ejercicio, recuperación posparto, crianza + bienestar físico, imagen corporal postparto.
Mezcla los 3 tipos: 30% relacionadoA=curso, 20% relacionadoA=evento, 50% relacionadoA=comunidad.

SECCIÓN contentPlan — CALENDARIO SEMANAL CON GUIONES COMPLETOS:
Para cada post del plan, incluye un guion COMPLETO y listo para grabar:
guion format:
"HOOK (0-3s): [texto exacto que Gabi dice o aparece en pantalla]
DESARROLLO (3-Xs): [lo que dice Gabi, punto por punto, en su voz]
CTA (últimos 3s): [texto exacto del cierre]
TEXTO EN PANTALLA: [subtítulos clave / overlays]"

El guion debe estar en la voz de Gabi: cálida, dominicana, directa, como amiga. No formal. Usa "mami", "nena", "te lo juro", expresiones caribeñas auténticas cuando aplique.

Para contentPlan:
- Primer post a partir del lunes: ${nextMondayStr}
- ${scopeInstruction}
- Distribución CTAs: ~30% apuntaA=curso, ~20% apuntaA=evento, ~50% apuntaA=comunidad o null
- Plataformas: ~60% instagram, ~25% tiktok, ~15% youtube
- notasProduccion: incluye encuadre, luz recomendada, si necesita B-roll, props, etc.

═══════════════════════════════════════════
FORMATO DE RESPUESTA — SOLO JSON VÁLIDO
═══════════════════════════════════════════
Sin markdown, sin explicaciones fuera del JSON.

{
  "weekSummary": {
    "totalPosts": 0,
    "totalLikes": 0,
    "totalComments": 0,
    "totalViews": 0,
    "avgEngagement": "0%",
    "bestPerformingType": "Reel|Carrusel|Post",
    "topPost": { "caption": "...", "likes": 0, "why": "diagnóstico específico en 1 oración" }
  },
  "postAnalyses": [
    {
      "shortCode": "ID_DEL_POST",
      "performanceScore": 0,
      "tier": "viral|good|avg|low",
      "why": "diagnóstico específico del resultado",
      "whatToRepeat": "elemento concreto a replicar"
    }
  ],
  "voiceAnalysis": {
    "strengths": ["fortaleza específica"],
    "opportunities": ["oportunidad concreta"],
    "toneScore": 0,
    "consistencyScore": 0
  },
  "topicsThisWeek": ["tema detectado"],
  "audienceAlignment": {
    "score": 0,
    "notes": "análisis de alineación con mamás latinas postparto 25-40",
    "emotionalHooks": ["hook emocional que YA está funcionando"]
  },
  "trendInsights": {
    "topFormatsNow": ["formato específico explotando ahora"],
    "viralHooksToTest": ["hook exacto listo para grabar"],
    "contentGaps": ["tema que la competencia cubre y GabiFit no"],
    "algorithmTips": ["tip de algoritmo basado en estos posts"]
  },
  "growthStrategy": {
    "mainBottleneck": "freno #1 al crecimiento",
    "quickWins": ["acción concreta para subir alcance esta semana"],
    "contentPillars": [
      { "pillar": "nombre del pilar", "why": "por qué es clave ahora", "frequency": "Xveces/semana", "exampleHook": "hook de ejemplo listo para grabar" }
    ]
  },
  "competitorInsights": "qué hacen diferente los competidores y qué puede adaptar Gabi",
  "nextWeekPlan": {
    "theme": "tema central unificador de la próxima semana",
    "contentPieces": [
      { "day": "Lunes", "format": "Reel", "topic": "tema específico", "hook": "hook de apertura EXACTO", "cta": "CTA específico", "notes": "detalles de producción" }
    ],
    "hashtags": ["hashtag_nicho_exacto"],
    "keyMessage": "mensaje central que une el contenido de la semana"
  },
  "actionItems": ["acción MUY específica y accionable"],
  "weeklyReport": {
    "resumenSemana": {
      "totalPosts": 0,
      "totalLikes": 0,
      "totalViews": 0,
      "totalComments": 0,
      "avgEngagementRate": 0.0,
      "bestPerformingFormat": "Reel"
    },
    "topVideos": [
      {
        "shortCode": "ID_TOP_VIDEO_1",
        "porQueFuncionó": "diagnóstico específico de 3-4 oraciones: qué elemento técnico/emocional determinó el resultado",
        "estructura": {
          "hook": "texto exacto de apertura",
          "problema": "el dolor que aborda",
          "solucion": "lo que ofrece como solución",
          "cta": "acción que pide al final",
          "ritmo": "notas de pacing y edición",
          "porQueFunciona": "por qué esta estructura resonó con mamás postparto"
        },
        "angulos": [
          { "numero": 1, "titulo": "Ángulo 1: [nombre descriptivo]", "angulo": "perspectiva específica", "hook": "texto EXACTO de apertura listo para grabar", "diferenciador": "qué hace único este ángulo vs el original" },
          { "numero": 2, "titulo": "Ángulo 2: [nombre descriptivo]", "angulo": "perspectiva específica", "hook": "texto EXACTO de apertura listo para grabar", "diferenciador": "qué hace único este ángulo vs el original" },
          { "numero": 3, "titulo": "Ángulo 3: [nombre descriptivo]", "angulo": "perspectiva específica", "hook": "texto EXACTO de apertura listo para grabar", "diferenciador": "qué hace único este ángulo vs el original" },
          { "numero": 4, "titulo": "Ángulo 4: [nombre descriptivo]", "angulo": "perspectiva específica", "hook": "texto EXACTO de apertura listo para grabar", "diferenciador": "qué hace único este ángulo vs el original" },
          { "numero": 5, "titulo": "Ángulo 5: [nombre descriptivo]", "angulo": "perspectiva específica", "hook": "texto EXACTO de apertura listo para grabar", "diferenciador": "qué hace único este ángulo vs el original" }
        ]
      }
    ],
    "insights": "párrafo de 3-4 oraciones: qué ganó esta semana, qué patrón emergió, qué emoción activó más engagement",
    "videosRecomendados": [
      { "titulo": "título del video recomendado", "hook": "texto EXACTO de apertura listo para grabar", "angulo": "ángulo / enfoque del contenido", "formato": "Reel 20-30s | Carrusel 5 slides | etc.", "porQueAhora": "por qué este tema funciona AHORA en el nicho", "relacionadoA": "curso|evento|comunidad" }
    ],
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
            "tema": "tema específico del post",
            "hook": "hook de apertura EXACTO — primeras palabras del video/post",
            "guion": "HOOK (0-3s): [texto exacto]\\nDESARROLLO (3-Xs): [script completo en voz de Gabi]\\nCTA (últimos 3s): [cierre exacto]\\nTEXTO EN PANTALLA: [overlays clave]",
            "cta": "CTA específico con la acción que se busca",
            "caption": "caption en voz GabiFit, máx 150 chars, termina con CTA",
            "tipo": "informativo|ventas|viralidad",
            "apuntaA": "curso|evento|comunidad",
            "notasProduccion": "encuadre, luz, B-roll necesario, props, subtítulos"
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
      max_tokens: scope === "month" ? 16000 : 12000,
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

  // ── Override weekSummary with real computed values ────────────────────────────
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

  // ── Override weeklyReport.resumenSemana with last-7-days computed values ──────
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentPosts = posts.filter((p: RawPost) => new Date(p.timestamp) >= sevenDaysAgo);

  const recentLikes    = recentPosts.reduce((s: number, p: RawPost) => s + (p.likesCount    || 0), 0);
  const recentComments = recentPosts.reduce((s: number, p: RawPost) => s + (p.commentsCount || 0), 0);
  const recentViews    = recentPosts.reduce((s: number, p: RawPost) => s + (p.videoViewCount || 0), 0);
  const recentAvgEng   = recentViews > 0
    ? parseFloat(((recentLikes + recentComments) / recentViews * 100).toFixed(2))
    : 0;

  const formatCount: Record<string, number> = {};
  recentPosts.forEach((p: RawPost) => { formatCount[p.type] = (formatCount[p.type] ?? 0) + 1; });
  const bestFormat = recentPosts.length > 0
    ? (Object.entries(formatCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "")
    : "";

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

    // ── Enrich topVideos with caption + thumbnailUrl + real metrics ───────────
    const postsMap = new Map<string, RawPost>(posts.map((p: RawPost) => [p.shortCode, p]));
    const rawTopVideos = wr.topVideos;
    if (Array.isArray(rawTopVideos) && rawTopVideos.length) {
      wr.topVideos = rawTopVideos
        .filter((tv): tv is Record<string, unknown> => !!tv && typeof tv === "object")
        .map((tv) => {
          const code = typeof tv.shortCode === "string" ? tv.shortCode : "";
          const src  = postsMap.get(code);
          return {
            ...tv,
            thumbnailUrl:   src?.displayUrl    ?? "",
            caption:        src?.caption       ?? "",
            likesCount:     src?.likesCount    ?? 0,
            commentsCount:  src?.commentsCount ?? 0,
            videoViewCount: src?.videoViewCount ?? 0,
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
