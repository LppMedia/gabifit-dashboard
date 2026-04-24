import { NextRequest, NextResponse } from "next/server";

const KIE_KEY = process.env.KIE_AI_API_KEY ?? "";
const KIE_URL = "https://kieai.erweima.ai/api/v1/chat/completions";
const MODEL = "deepseek-chat";

export async function POST(req: NextRequest) {
  if (!KIE_KEY) {
    return NextResponse.json({ error: "KIE_AI_API_KEY no configurado" }, { status: 500 });
  }

  const { posts, transcripts, competitorSummary, handle } = await req.json().catch(() => ({}));

  if (!posts?.length) {
    return NextResponse.json({ error: "No hay posts para analizar" }, { status: 400 });
  }

  const postsText = posts
    .map(
      (
        p: {
          shortCode: string;
          type: string;
          likesCount: number;
          commentsCount: number;
          videoViewCount: number;
          caption: string;
          timestamp: string;
        },
        i: number
      ) => {
        const transcript = transcripts?.[p.shortCode] || "";
        return `POST ${i + 1} (${p.type}):
- Likes: ${p.likesCount} | Comentarios: ${p.commentsCount} | Vistas: ${p.videoViewCount}
- Caption: ${p.caption?.slice(0, 200)}
- Fecha: ${new Date(p.timestamp).toLocaleDateString("es-DO")}
${transcript ? `- Transcripción: ${transcript.slice(0, 500)}` : ""}`;
      }
    )
    .join("\n\n");

  const prompt = `Eres una estratega de contenido experta en fitness femenino latinoamericano para Instagram.

MARCA: GabiFit (@${handle || "gabifit"})
- Coach de fitness postparto, dominicana
- Voz: cálida, empoderada, como amiga que sabe
- Audiencia: mamás 25-40 años, latinas, bebés 0-3 años
- Formatos: Reels 15-60s, carruseles educativos

CONTENIDO DE LOS ÚLTIMOS 7 DÍAS:
${postsText}

${competitorSummary ? `CONTEXTO COMPETIDORES (top posts de la semana en el nicho):\n${competitorSummary}` : ""}

Genera ÚNICAMENTE JSON válido (sin markdown, sin texto adicional):
{
  "weekSummary": {
    "totalPosts": number,
    "totalLikes": number,
    "totalComments": number,
    "totalViews": number,
    "avgEngagement": "X.XX%",
    "bestPerformingType": "Reel|Carrusel|Post",
    "topPost": { "caption": "...", "likes": number, "why": "Por qué funcionó" }
  },
  "voiceAnalysis": {
    "strengths": ["Fortaleza 1 de tu voz esta semana", "Fortaleza 2"],
    "opportunities": ["Oportunidad 1 para mejorar", "Oportunidad 2"],
    "toneScore": number (1-10),
    "consistencyScore": number (1-10)
  },
  "topicsThisWeek": ["Tema 1", "Tema 2", "Tema 3"],
  "audienceAlignment": {
    "score": number (1-10),
    "notes": "Análisis de alineación con buyer persona (mamás latinas postparto)",
    "emotionalHooks": ["Hook emocional 1 usado", "Hook emocional 2"]
  },
  "competitorInsights": "Qué están haciendo diferente los competidores y qué puedes adaptar",
  "nextWeekPlan": {
    "theme": "Tema central de la semana que viene",
    "contentPieces": [
      {
        "day": "Lunes",
        "format": "Reel",
        "topic": "Tema específico del reel",
        "hook": "Gancho de apertura listo para grabar",
        "cta": "CTA específico",
        "notes": "Tips de grabación"
      },
      {
        "day": "Martes",
        "format": "Carrusel",
        "topic": "...",
        "hook": "...",
        "cta": "...",
        "notes": "..."
      },
      {
        "day": "Miércoles",
        "format": "Reel",
        "topic": "...",
        "hook": "...",
        "cta": "...",
        "notes": "..."
      },
      {
        "day": "Jueves",
        "format": "Story",
        "topic": "...",
        "hook": "...",
        "cta": "...",
        "notes": "..."
      },
      {
        "day": "Viernes",
        "format": "Reel",
        "topic": "...",
        "hook": "...",
        "cta": "...",
        "notes": "..."
      }
    ],
    "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"],
    "keyMessage": "Mensaje central que unifica el contenido de la semana"
  },
  "actionItems": [
    "Acción concreta 1 para esta semana",
    "Acción concreta 2",
    "Acción concreta 3"
  ]
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
      max_tokens: 4000,
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    console.error("[weekly-review] KIE error:", err);
    return NextResponse.json({ error: `Error IA: ${res.status}` }, { status: 502 });
  }

  const data = await res.json();
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
    generatedAt: new Date().toISOString(),
    handle: handle || "gabifit",
    postsAnalyzed: posts.length,
  });
}
