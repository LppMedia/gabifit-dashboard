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

  // Suppress unused variable warning — month param kept for future anchoring
  void month;

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
    const postsMap = new Map<string, RawPost>(posts.map((p: RawPost) => [p.shortCode, p]));
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
