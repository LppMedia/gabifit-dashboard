import { NextRequest, NextResponse } from "next/server";

const KIE_KEY = process.env.KIE_AI_API_KEY ?? "";
const KIE_URL = "https://kieai.erweima.ai/api/v1/chat/completions";
const MODEL   = "deepseek-chat";

export async function POST(req: NextRequest) {
  if (!KIE_KEY) {
    return NextResponse.json({ error: "KIE_AI_API_KEY no configurado" }, { status: 500 });
  }

  const { posts, transcripts, competitorSummary, handle } = await req.json().catch(() => ({}));

  if (!posts?.length) {
    return NextResponse.json({ error: "No hay posts para analizar" }, { status: 400 });
  }

  type RawPost = {
    shortCode: string;
    type: string;
    likesCount: number;
    commentsCount: number;
    videoViewCount: number;
    caption: string;
    timestamp: string;
  };

  const postsText = posts
    .map((p: RawPost, i: number) => {
      const transcript = transcripts?.[p.shortCode] ?? "";
      const views   = p.videoViewCount || 0;
      const likes   = p.likesCount     || 0;
      const comments = p.commentsCount || 0;
      const engRate = views > 0
        ? ((likes + comments) / views * 100).toFixed(2)
        : "N/A";
      return `POST ${i + 1} [ID: ${p.shortCode}] (${p.type}):
- Likes: ${likes} | Comentarios: ${comments} | Vistas: ${views} | Engagement: ${engRate}%
- Caption: ${p.caption?.slice(0, 250) ?? ""}
- Fecha: ${new Date(p.timestamp).toLocaleDateString("es-DO")}${transcript ? `\n- Transcripción: ${transcript.slice(0, 600)}` : ""}`;
    })
    .join("\n\n");

  const postIds = posts.map((p: RawPost) => p.shortCode);

  const prompt = `Eres una estratega de contenido experta en fitness femenino latinoamericano para Instagram.

MARCA: GabiFit (@${handle || "gabifit"})
- Coach de fitness postparto, dominicana
- Voz: cálida, empoderada, como amiga que sabe
- Audiencia: mamás 25-40 años, latinas, bebés 0-3 años
- Formatos: Reels 15-60s, carruseles educativos

CONTENIDO RECIENTE (${posts.length} posts):
${postsText}

${competitorSummary ? `CONTEXTO COMPETIDORES:\n${competitorSummary}\n` : ""}
IDs de posts a analizar individualmente: ${postIds.join(", ")}

Genera ÚNICAMENTE JSON válido (sin markdown, sin texto adicional):
{
  "weekSummary": {
    "totalPosts": number,
    "totalLikes": number,
    "totalComments": number,
    "totalViews": number,
    "avgEngagement": "X.XX%",
    "bestPerformingType": "Reel|Carrusel|Post",
    "topPost": { "caption": "...", "likes": number, "why": "Por qué funcionó en 1 oración" }
  },
  "postAnalyses": [
    {
      "shortCode": "ID_DEL_POST",
      "performanceScore": number (1-10 basado en engagement vs promedio del perfil),
      "tier": "viral|good|avg|low",
      "why": "Por qué funcionó o no funcionó — 1 oración específica",
      "whatToRepeat": "Qué elemento repetir en futuros posts — 1 oración"
    }
  ],
  "voiceAnalysis": {
    "strengths": ["Fortaleza 1", "Fortaleza 2"],
    "opportunities": ["Oportunidad 1", "Oportunidad 2"],
    "toneScore": number (1-10),
    "consistencyScore": number (1-10)
  },
  "topicsThisWeek": ["Tema 1", "Tema 2", "Tema 3"],
  "audienceAlignment": {
    "score": number (1-10),
    "notes": "Análisis de alineación con buyer persona (mamás latinas postparto)",
    "emotionalHooks": ["Hook emocional 1", "Hook emocional 2"]
  },
  "competitorInsights": "Qué están haciendo diferente los competidores y qué puedes adaptar",
  "nextWeekPlan": {
    "theme": "Tema central de la semana que viene",
    "contentPieces": [
      { "day": "Lunes",    "format": "Reel",     "topic": "...", "hook": "Gancho de apertura listo para grabar", "cta": "...", "notes": "..." },
      { "day": "Martes",   "format": "Carrusel", "topic": "...", "hook": "...", "cta": "...", "notes": "..." },
      { "day": "Miércoles","format": "Reel",     "topic": "...", "hook": "...", "cta": "...", "notes": "..." },
      { "day": "Jueves",   "format": "Story",    "topic": "...", "hook": "...", "cta": "...", "notes": "..." },
      { "day": "Viernes",  "format": "Reel",     "topic": "...", "hook": "...", "cta": "...", "notes": "..." }
    ],
    "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"],
    "keyMessage": "Mensaje central que unifica el contenido de la semana"
  },
  "actionItems": ["Acción concreta 1", "Acción concreta 2", "Acción concreta 3"]
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
      max_tokens: 5000,
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    console.error("[weekly-review] KIE error:", err);
    return NextResponse.json({ error: `Error IA: ${res.status}` }, { status: 502 });
  }

  const data    = await res.json();
  const rawText: string = data?.choices?.[0]?.message?.content ?? "{}";

  let analysis;
  try {
    const cleaned = rawText.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    analysis = JSON.parse(cleaned);
  } catch {
    return NextResponse.json(
      { error: "IA devolvió JSON inválido", raw: rawText.slice(0, 500) },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ...analysis,
    generatedAt:   new Date().toISOString(),
    handle:        handle || "gabifit",
    postsAnalyzed: posts.length,
  });
}
