// ─── Types ─────────────────────────────────────────────────────────────────────

export type PostType =
  | "reel"
  | "video"
  | "short"
  | "carousel"
  | "post"
  | "story"
  | "tweet";

export interface PostAnalysis {
  hook: string;
  hookType: string;
  structure: string[];
  tone: string;
  toneAttributes: string[];
  keyTactics: string[];
  transcript: string;
  replicateTips: string[];
}

export interface CompetitorPost {
  id: string;
  competitorId: string;
  platform: "instagram" | "tiktok" | "youtube" | "twitter" | "linkedin";
  postType: PostType;
  caption: string;
  publishedAt: string;
  coverGradient: string;
  metrics: {
    views?: number;
    likes: number;
    comments: number;
    shares: number;
    saves?: number;
  };
  engagementRate: number;
  analysis: PostAnalysis;
}

export interface CompetitorPlatformMetrics {
  followers: number;
  followersGrowth: number;
  avgEngagementRate: number;
  postsPerWeek: number;
  totalPosts: number;
}

export interface Competitor {
  id: string;
  handle: string;
  name: string;
  platforms: Array<
    "instagram" | "tiktok" | "youtube" | "twitter" | "linkedin"
  >;
  niche: string;
  avatarGradient: string;
  addedAt: string;
  lastRefreshed: string;
  metrics: Partial<
    Record<
      "instagram" | "tiktok" | "youtube" | "twitter" | "linkedin",
      CompetitorPlatformMetrics
    >
  >;
  posts: CompetitorPost[];
}

// ─── Platform meta ──────────────────────────────────────────────────────────────

export const PLATFORM_META: Record<
  string,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  instagram: {
    label: "Instagram",
    color: "text-pink-400",
    bg: "bg-pink-500/15",
    border: "border-pink-500/30",
    dot: "#f472b6",
  },
  tiktok: {
    label: "TikTok",
    color: "text-cyan-400",
    bg: "bg-cyan-500/15",
    border: "border-cyan-500/30",
    dot: "#22d3ee",
  },
  youtube: {
    label: "YouTube",
    color: "text-red-400",
    bg: "bg-red-500/15",
    border: "border-red-500/30",
    dot: "#f87171",
  },
  twitter: {
    label: "Twitter / X",
    color: "text-sky-400",
    bg: "bg-sky-500/15",
    border: "border-sky-500/30",
    dot: "#38bdf8",
  },
  linkedin: {
    label: "LinkedIn",
    color: "text-indigo-400",
    bg: "bg-indigo-500/15",
    border: "border-indigo-500/30",
    dot: "#818cf8",
  },
};

// ─── Utility functions ──────────────────────────────────────────────────────────

export function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

export function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

export function formatEngagement(n: number): string {
  return `${n.toFixed(1)}%`;
}

export function getEngagementColor(rate: number): string {
  if (rate >= 15) return "text-emerald-400";
  if (rate >= 8) return "text-cyan-400";
  if (rate >= 5) return "text-amber-400";
  return "text-zinc-400";
}

export function getGrowthColor(pct: number): string {
  if (pct >= 5) return "text-emerald-400";
  if (pct >= 2) return "text-cyan-400";
  return "text-zinc-400";
}

export function getTotalFollowers(competitor: Competitor): number {
  return Object.values(competitor.metrics).reduce(
    (sum, m) => sum + (m?.followers ?? 0),
    0
  );
}

export function getTopPost(competitor: Competitor): CompetitorPost | undefined {
  if (!competitor.posts.length) return undefined;
  return competitor.posts.reduce((best, p) =>
    p.engagementRate > best.engagementRate ? p : best
  );
}

export function getAllPosts(competitors: Competitor[]): CompetitorPost[] {
  return competitors
    .flatMap((c) => c.posts)
    .sort((a, b) => b.engagementRate - a.engagementRate);
}

// ─── Seed data ──────────────────────────────────────────────────────────────────

export const SEED_COMPETITORS: Competitor[] = [
  // ── Competitor 1: Sofía Moves ────────────────────────────────────────────────
  {
    id: "comp-1",
    handle: "@sofiamovestiktok",
    name: "Sofía Moves",
    platforms: ["tiktok", "instagram"],
    niche: "Fat loss · Lifestyle · Body recomp",
    avatarGradient: "from-pink-500 to-rose-400",
    addedAt: "2026-01-10T08:00:00Z",
    lastRefreshed: "2026-03-17T10:00:00Z",
    metrics: {
      tiktok: {
        followers: 284_000,
        followersGrowth: 4.2,
        avgEngagementRate: 8.7,
        postsPerWeek: 7,
        totalPosts: 312,
      },
      instagram: {
        followers: 142_000,
        followersGrowth: 2.8,
        avgEngagementRate: 12.4,
        postsPerWeek: 4,
        totalPosts: 187,
      },
    },
    posts: [
      {
        id: "s01",
        competitorId: "comp-1",
        platform: "tiktok",
        postType: "reel",
        caption:
          "Lo que nadie te dice sobre perder grasa sin morirte de hambre 🔥 #fatlosss #nutricion",
        publishedAt: "2026-03-12",
        coverGradient: "from-cyan-600 via-pink-600 to-rose-500",
        metrics: {
          views: 2_400_000,
          likes: 189_000,
          comments: 4_200,
          shares: 28_400,
          saves: 67_000,
        },
        engagementRate: 9.2,
        analysis: {
          hook: "¿Por qué sigues sin perder grasa aunque comes poco? Hay algo que nadie te explica...",
          hookType: "Curiosity gap + Pain point",
          structure: [
            "[0:00] Hook — pregunta que activa el dolor del espectador directamente",
            "[0:04] Agitación — amplifica el problema: 'llevas meses esforzándote y nada'",
            "[0:12] Insight contraintuitivo — el problema no son las calorías, es el cortisol elevado por déficit agresivo",
            "[0:28] Prueba — menciona estudio con porcentaje específico (71% más cortisol en déficit extremo)",
            "[0:40] Solución — 3 pasos simples: déficit moderado, proteína alta, gestión del estrés",
            "[0:54] CTA — 'Guárdalo y aplica uno esta semana'",
          ],
          tone: "Directa, empática y educativa a la vez. Habla como amiga que te da información privilegiada. Usa primera persona y lenguaje coloquial sin perder credibilidad científica.",
          toneAttributes: [
            "Empático",
            "Educativo",
            "Coloquial",
            "Auténtico",
            "Urgente",
          ],
          keyTactics: [
            "Curiosity gap en el hook — pregunta sin respuesta inmediata genera scroll-stop",
            "Pain point específico — no es genérico, apunta a una frustración muy concreta",
            "Dato numérico específico — el % de cortisol da credibilidad sin ser técnico en exceso",
            "Insight contraintuitivo — disrupts expectativas, hace que el espectador diga 'no lo sabía'",
            "Pasos numerados al final — percepción de valor concreto y accionable",
            "CTA hacia saves — estratégico porque los saves impulsan el algoritmo",
            "Duración 60s — formato ideal TikTok para contenido educativo con gancho",
          ],
          transcript: `[HOOK — 0s]
"¿Por qué sigues sin perder grasa aunque comes poco?"
→ Pausa de 1 segundo. Mirada a cámara. Sin música aún.

[AGITACIÓN — 4s]
"Llevas semanas en déficit, entrenando, y la báscula no se mueve."
"Y lo peor es que cada vez te sientes más cansada y con más ansiedad."
→ Aquí entra música suave de fondo.

[INSIGHT — 12s]
"El problema no son las calorías. Es el cortisol."
"Cuando comes muy poco, tu cuerpo entra en modo supervivencia."
"El cortisol se dispara un 71% en déficits agresivos — retiene grasa, destruye músculo."
→ Texto overlay: 'cortisol = enemigo silencioso'

[SOLUCIÓN — 28s]
"Lo que funciona de verdad: tres cosas."
"Primero: déficit moderado, máximo 300-400 calorías. No 1000."
"Segundo: proteína alta, mínimo 1.6g por kilo. Saciedad real."
"Tercero: gestionar el estrés. Dormir 7-8h no es opcional si quieres quemar grasa."

[CTA — 54s]
"Guárdalo y aplica uno esta semana. ¿Cuál te cuesta más? Comenta abajo."
→ Texto overlay: 'GUARDA ESTO 📌'`,
          replicateTips: [
            "Replantea el hook: '¿Por qué entrenas 5 días y no ves resultados?' — mismo formato, tu ángulo",
            "Tu insight contraintuitivo: el problema de entrenar demasiado sin recuperar (overttraining cortisol)",
            "Mantén los 3 pasos al final — es el formato que más guardados genera",
            "Añade tu experiencia personal como prueba social antes de los pasos",
            "CTA hacia saves: pide que lo guarden antes de aplicarlo — aumenta el alcance orgánico",
          ],
        },
      },
      {
        id: "s02",
        competitorId: "comp-1",
        platform: "tiktok",
        postType: "video",
        caption:
          "Todo lo que como en un día — 1800 calorías con alto volumen 🍽️ #mealplan",
        publishedAt: "2026-03-08",
        coverGradient: "from-cyan-500 to-teal-600",
        metrics: {
          views: 890_000,
          likes: 67_000,
          comments: 2_100,
          shares: 8_900,
          saves: 34_000,
        },
        engagementRate: 7.8,
        analysis: {
          hook: "Lo que como en un día para mantener el cuerpo que ves. Sin pasar hambre. Sin contar obsesivamente.",
          hookType: "Curiosity + Social proof",
          structure: [
            "[0:00] Hook — promesa: comer bien sin obsesión",
            "[0:05] Desayuno — muestra cada alimento con overlay de macros",
            "[0:20] Almuerzo — comida principal con desglose calórico",
            "[0:35] Merienda — opciones saciantes con poca densidad calórica",
            "[0:50] Cena — ligera pero proteica",
            "[0:58] Resumen — total calorías + macros en pantalla",
            "[1:05] CTA — pregunta engagement",
          ],
          tone: "Cercana, transparente, sin perfeccionismo. Muestra la realidad de comer bien sin que sea una obsesión. Tono de 'yo también soy humana'.",
          toneAttributes: [
            "Transparente",
            "Realista",
            "Motivador",
            "Sin juicio",
          ],
          keyTactics: [
            "Fórmula 'día completo' — alto valor percibido, mucha información en poco tiempo",
            "Overlay de macros — credibilidad técnica sin texto abrumador",
            "Promesa de normalidad — 'sin pasar hambre' elimina la objeción principal",
            "Ritmo visual rápido — cambio de clip cada 10-15s mantiene atención",
            "Resumen final en pantalla — el espectador hace captura = más retención",
            "Pregunta de cierre — activa comentarios (señal de engagement al algoritmo)",
          ],
          transcript: `[HOOK — 0s]
"Lo que como en un día para mantener esto."
→ Quick cut a plano del cuerpo, vuelta a cara. Natural, no posado.
"1800 calorías. Alto volumen. Sin contar cada gramo."

[DESAYUNO — 5s]
Bowl de avena: 70g avena + leche de avena + plátano + mantequilla de maní.
→ Texto overlay: "Desayuno | 520 kcal | 22g proteína"
Cueing: "Me lleva 5 minutos y me aguanta hasta el mediodía."

[ALMUERZO — 20s]
Arroz basmati + pollo al horno + brócoli + aguacate.
→ Overlay: "Almuerzo | 650 kcal | 48g proteína"

[MERIENDA — 35s]
Yogur griego 0% + frutas rojas + 20g nueces.
→ Overlay: "Merienda | 280 kcal | 18g proteína"

[CENA — 50s]
Salmón al vapor + ensalada grande + edamame.
→ Overlay: "Cena | 420 kcal | 38g proteína"

[RESUMEN — 58s]
Texto en pantalla: "TOTAL: 1.870 kcal | 126g proteína | 195g HC | 62g grasa"
Voz: "Comer bien no tiene que ser aburrido ni restrictivo."

[CTA — 1:05]
"¿Quieres que haga el de 2000 cal? Dímelo en comentarios 👇"`,
          replicateTips: [
            "Haz tu versión: 'Lo que como como fitness coach para mantener mi cuerpo en forma'",
            "Añade el contexto de entrenamiento — 'día de pierna vs día de descanso'",
            "Overlay de macros es clave — da credibilidad y la gente hace capturas (= saves)",
            "Pide en el CTA un vídeo específico que quieran ver — genera comentarios Y te da ideas de contenido",
            "Sé honesta con los alimentos — mostrar un capricho o alimento 'imperfecto' genera mucha identificación",
          ],
        },
      },
      {
        id: "s03",
        competitorId: "comp-1",
        platform: "instagram",
        postType: "reel",
        caption:
          "5 ejercicios de glúteos que cambiarán tu entrenamiento para siempre 🍑 Guárdalo",
        publishedAt: "2026-03-05",
        coverGradient: "from-pink-500 to-rose-600",
        metrics: {
          views: 312_000,
          likes: 38_800,
          comments: 890,
          shares: 4_200,
          saves: 21_000,
        },
        engagementRate: 12.4,
        analysis: {
          hook: "Los 5 ejercicios de glúteos que ninguna fitness influencer te enseña (y son los más efectivos)",
          hookType: "Bold claim + Exclusivity",
          structure: [
            "[0:00] Hook — 'lo que nadie te enseña' activa curiosidad inmediata",
            "[0:05] Ejercicio 1 — Hip thrust con banda + cueing técnico",
            "[0:18] Ejercicio 2 — Bulgarian split squat + error común",
            "[0:30] Ejercicio 3 — Cable kickback + posición correcta",
            "[0:42] Ejercicio 4 — Sumo deadlift + activación glútea",
            "[0:54] Ejercicio 5 — Glute bridge isométrico + respiración",
            "[1:05] Cierre — 'guárdalo para tu próximo entrenamiento'",
          ],
          tone: "Técnica pero accesible. Muestra expertise sin ser condescendiente. Usa lenguaje de entrenadora que quiere que sus seguidoras progresen.",
          toneAttributes: ["Técnico", "Empoderador", "Directo", "Experto"],
          keyTactics: [
            "Claim de exclusividad — 'lo que nadie te enseña' crea FOMO inmediato",
            "5 ítems en lista — formato probado que funciona siempre en fitness",
            "Corrección de error por ejercicio — añade valor extra y diferencia el contenido",
            "CTA a saves antes del final — 'guárdalo' dicho a mitad del vídeo tiene más impacto",
            "Formato sin cara visible — permite foco total en los ejercicios y forma",
            "Música trending — boost algorítmico en Reels",
          ],
          transcript: `[HOOK — 0s]
"Los 5 ejercicios de glúteos que ninguna te enseña."
→ Sin cara. Plano de cuerpo completo. Música trending desde el inicio.

[EJERCICIO 1 — 5s: HIP THRUST CON BANDA]
Demo: hip thrust con barra + banda por encima de rodillas.
Cueing overlay: "Aprieta los glúteos ARRIBA, no en la subida."
Error común: "Error: no bloquear la cadera al final = -50% activación."

[EJERCICIO 2 — 18s: BULGARIAN SPLIT SQUAT]
Demo lenta con texto del ángulo correcto de pie delantero.
"La rodilla trasera baja en línea recta. El talón delantero no se levanta."

[EJERCICIO 3 — 30s: CABLE KICKBACK]
Demo: ángulo de cadera a 45° para máxima activación.
"Muchas lo hacen de pie erguido — así activas más lumbar que glúteo."

[EJERCICIO 4 — 42s: SUMO DEADLIFT]
Demo: apertura de pies, puntas hacia fuera.
"Empuja el suelo hacia fuera al subir — así activarás glúteo medio y mayor."

[EJERCICIO 5 — 54s: GLUTE BRIDGE ISOMÉTRICO]
Demo: mantener posición alta 3 segundos con apriete.
"El tiempo bajo tensión es lo que produce hipertrofia, no el número de reps."

[CIERRE — 1:05]
"Guárdalo para tu próximo glúteo day. ¿Cuál ya hacías? Comenta 👇"`,
          replicateTips: [
            "Replantea como 'Los 5 errores en glúteos que te están frenando' — mismo formato con más urgencia",
            "Añade tu toque: cada ejercicio con una corrección que solo tú, como coach, darías",
            "Formato sin cara funciona muy bien para ejercicios técnicos — focus en el movimiento",
            "Usa música trending + que encaje con la energía del vídeo (busca en TikTok la tendencia de esa semana)",
            "Pide en el CTA que digan qué ejercicio ya hacen — activa comentarios con respuestas fáciles",
          ],
        },
      },
      {
        id: "s04",
        competitorId: "comp-1",
        platform: "tiktok",
        postType: "video",
        caption:
          "POV: llevas 3 meses entrenando en serio y ya no reconoces tu cuerpo 🔥",
        publishedAt: "2026-03-01",
        coverGradient: "from-violet-600 to-pink-500",
        metrics: {
          views: 1_840_000,
          likes: 156_000,
          comments: 8_900,
          shares: 22_000,
          saves: 45_000,
        },
        engagementRate: 11.2,
        analysis: {
          hook: "POV: llevas 3 meses entrenando en serio...",
          hookType: "POV + Transformation aspiration",
          structure: [
            "[0:00] Hook POV — el espectador se pone en la situación",
            "[0:03] Mes 1 — caos, dudas, sin resultados visibles, texto honesto",
            "[0:15] Mes 2 — primeros cambios, más energía, ropa empieza a quedar diferente",
            "[0:28] Mes 3 — cambio real visible, confianza elevada, nueva identidad",
            "[0:45] Mensaje — 'el cambio que nadie ve: tu relación con tu cuerpo'",
            "[0:55] CTA — tag a quien necesita ver esto",
          ],
          tone: "Aspiracional pero honesto. Muestra la parte difícil para que el espectador sienta que el resultado vale el proceso.",
          toneAttributes: [
            "Aspiracional",
            "Honesto",
            "Motivador",
            "Narrativo",
            "Empático",
          ],
          keyTactics: [
            "Formato POV — el espectador se convierte en protagonista = identificación máxima",
            "Narrativa en 3 actos (dificultad → progreso → transformación) — estructura dramática efectiva",
            "Honestidad del mes 1 — mostrar la parte difícil genera más credibilidad que ir directo al éxito",
            "El mensaje emocional del mes 3 — 'tu relación con tu cuerpo' apela a la identidad, no solo al físico",
            "Tag CTA — 'envíaselo a alguien' genera shares masivos",
            "Música emocional crescendo — refuerza el arco emocional",
          ],
          transcript: `[HOOK — 0s]
"POV: llevas 3 meses entrenando en serio."
→ Música suave, casi triste al inicio.

[MES 1 — 3s]
Texto overlay: "Mes 1"
"No ves nada en el espejo. Te preguntas si esto sirve."
"Cancelas planes sociales por entrenar y te sientes rara."
"La báscula sube por el músculo y entras en pánico."

[MES 2 — 15s]
Texto overlay: "Mes 2"
Música empieza a subir de intensidad.
"La ropa empieza a quedar diferente aunque el peso sea igual."
"Tienes más energía a las 3 de la tarde — sin café."
"Empiezas a disfrutar el proceso aunque no lo admitas."

[MES 3 — 28s]
Texto overlay: "Mes 3"
Música al máximo.
"Ya no reconoces tu cuerpo. Y tampoco tu cabeza."
"Lo que cambió no es solo físico."
"Cambió cómo te ves. Cómo te sientes. Cómo te tratas."

[MENSAJE — 45s]
"El cambio visible dura semanas."
"El cambio que nadie ve — tu relación con tu cuerpo — dura toda la vida."
→ Texto en pantalla con tipografía grande.

[CTA — 55s]
"Envíaselo a alguien que está en su mes 1 y necesita saber que vale la pena."
→ Texto overlay: 'MANDALO 🙏'`,
          replicateTips: [
            "Este formato POV es uno de los más potentes — hazlo desde tu perspectiva como COACH: 'POV: tu entrenadora ve tu progreso de 3 meses'",
            "La clave es la honestidad en el mes 1 — muestra la parte difícil del proceso, es lo que genera identificación",
            "El mensaje emocional del final es el diferenciador — habla de identidad y autoestima, no de kilos",
            "Usa el CTA de compartir en lugar de like/follow — los shares son la mayor señal positiva para el algoritmo",
            "Adapta la música al arco emocional: introspectiva → esperanzadora → eufórica",
          ],
        },
      },
    ],
  },

  // ── Competitor 2: Entrena con Pablo ─────────────────────────────────────────
  {
    id: "comp-2",
    handle: "@entrenacpablo",
    name: "Entrena con Pablo",
    platforms: ["youtube", "instagram"],
    niche: "Fuerza · Nutrición deportiva · Powerlifting",
    avatarGradient: "from-cyan-500 to-blue-600",
    addedAt: "2026-01-15T08:00:00Z",
    lastRefreshed: "2026-03-17T09:30:00Z",
    metrics: {
      youtube: {
        followers: 94_000,
        followersGrowth: 1.8,
        avgEngagementRate: 9.3,
        postsPerWeek: 2,
        totalPosts: 156,
      },
      instagram: {
        followers: 79_000,
        followersGrowth: 1.2,
        avgEngagementRate: 14.8,
        postsPerWeek: 5,
        totalPosts: 290,
      },
    },
    posts: [
      {
        id: "p01",
        competitorId: "comp-2",
        platform: "youtube",
        postType: "video",
        caption:
          "Guía DEFINITIVA de la sentadilla: técnica, errores y progresión (2026)",
        publishedAt: "2026-03-10",
        coverGradient: "from-red-600 to-rose-700",
        metrics: {
          views: 148_000,
          likes: 9_200,
          comments: 1_840,
          shares: 3_400,
        },
        engagementRate: 9.8,
        analysis: {
          hook: "Llevas años haciendo sentadillas y hay algo fundamental que estás haciendo mal — hoy lo corregimos",
          hookType: "Bold claim + Authority",
          structure: [
            "[0:00] Hook — promesa de corrección definitiva",
            "[2:00] Por qué la sentadilla es el rey de los ejercicios — contexto teórico",
            "[8:00] Los 7 errores más comunes con demo visual",
            "[20:00] Técnica perfecta paso a paso — setup, descenso, ascenso",
            "[32:00] Progresión: de principiante a avanzado",
            "[40:00] Programación: cómo incluirla en tu rutina",
            "[44:00] Q&A de los comentarios anteriores",
          ],
          tone: "Académico pero ameno. Habla como un profesor que domina su materia pero no quiere aburrirte. Combina ciencia con aplicación práctica.",
          toneAttributes: [
            "Académico",
            "Experto",
            "Detallado",
            "Práctico",
            "Directo",
          ],
          keyTactics: [
            "Contenido 'guía definitiva' — palabra clave SEO + percepción de valor máximo",
            "Larga duración — YouTube favorece los vídeos de +30 min para creadores educativos",
            "Timestamps en descripción — mejora retención y señal positiva al algoritmo",
            "Demo visual de errores primero — activa identificación antes de dar la solución",
            "Q&A al final — usa comentarios anteriores como contenido (engagement loop)",
            "Miniatura con palabra clave grande y cara expresiva — CTR optimizado",
          ],
          transcript: `[INTRO — 0:00]
"Llevas años haciendo sentadillas. Y hay algo que estás haciendo mal."
"No es tu culpa. Nadie te lo ha explicado bien. Hoy lo hacemos."
Presentación: "Soy Pablo, coach de fuerza desde 2018, y hoy vamos a hablar de técnica."

[PARTE 1 — 2:00: POR QUÉ LA SENTADILLA]
La sentadilla activa más del 60% de la musculatura total del cuerpo.
Estudios sobre densidad ósea, hormona de crecimiento, quema calórica.
"Es el ejercicio más funcional que existe. No tiene competencia."

[PARTE 2 — 8:00: LOS 7 ERRORES]
Error 1: Rodillas que colapsan hacia dentro (valgo dinámico)
Error 2: Talones que se levantan (limitación de tobillo)
Error 3: Torso que se inclina demasiado (ratio femur-torso y movilidad)
Error 4: No llegar a paralela
Error 5: Respiración incorrecta (sin valsalva)
Error 6: Mirada al suelo
Error 7: Grip demasiado ancho o estrecho en la barra

[PARTE 3 — 20:00: TÉCNICA PERFECTA]
Setup: posición de barra, grip, activación de lats.
Respiración y bracing antes de sacar la barra.
Descenso: control, apertura de rodillas, profundidad.
Punto de reversión: rebote elástico vs pausa.
Ascenso: drive de cadera, mantener el torso.
Paso final: racking seguro.

[PARTE 4 — 32:00: PROGRESIÓN]
Principiante: goblet squat → front squat → back squat con palo
Intermedio: trabajo de movilidad + técnica con barra
Avanzado: periodización y picos de fuerza

[OUTRO — 44:00]
Responde 5 preguntas de comentarios anteriores.
"Si quieres el PDF con la checklist de técnica, está en la descripción."`,
          replicateTips: [
            "Haz tu versión del 'vídeo guía definitiva' pero para un ejercicio más tuyo — hip thrust, peso muerto para mujeres, sentadilla sumo",
            "Los errores primero tienen un poder enorme — genera identificación antes de dar la solución",
            "Ofrecer un recurso descargable (PDF, checklist) es diferenciador y genera leads directos",
            "Responder Q&A de comentarios anteriores fideliza a la audiencia existente y reutiliza engagement",
            "YouTube SEO: título con keyword exacta + año + palabra como 'guía' o 'definitivo'",
          ],
        },
      },
      {
        id: "p02",
        competitorId: "comp-2",
        platform: "instagram",
        postType: "carousel",
        caption:
          "Los 5 errores que te están robando ganancias musculares (aunque entrenes bien) 📊",
        publishedAt: "2026-03-14",
        coverGradient: "from-blue-600 to-cyan-500",
        metrics: {
          views: 87_000,
          likes: 13_200,
          comments: 654,
          shares: 2_100,
          saves: 8_900,
        },
        engagementRate: 15.2,
        analysis: {
          hook: "Entrenas 5 días a la semana y los resultados no llegan. Aquí hay 5 razones.",
          hookType: "Pain point + Promise of explanation",
          structure: [
            "[Slide 1] Cover — título impactante con número",
            "[Slide 2] Error 1: Volumen demasiado alto — estás en sobreentrenamiento",
            "[Slide 3] Error 2: No duermes suficiente — GH se produce al dormir",
            "[Slide 4] Error 3: Déficit calórico mientras intentas ganar músculo",
            "[Slide 5] Error 4: No hay progresión de carga — mismo peso semana tras semana",
            "[Slide 6] Error 5: Proteína insuficiente — dato de 1.6-2.2g/kg",
            "[Slide 7] CTA — pregunta cuál es su error + guardar",
          ],
          tone: "Científico pero directo. Usa datos específicos para cada punto. No juzga, educa.",
          toneAttributes: [
            "Científico",
            "Específico",
            "No juzga",
            "Educativo",
          ],
          keyTactics: [
            "Número en el título — '5 errores' funciona mejor que 'los errores'",
            "Carrusel = más tiempo en la publicación = señal positiva IG",
            "Dato específico por slide — credibilidad en cada punto, no solo afirmaciones genéricas",
            "Slide de CTA al final con pregunta directa — activa comentarios",
            "Diseño consistente — mismo formato visual en todos los slides (template)",
            "Saves estratégicos — contenido de referencia que la gente guarda para volver",
          ],
          transcript: `[SLIDE 1 — COVER]
Fondo oscuro + texto grande: "5 ERRORES QUE TE ROBAN GANANCIAS"
Subtítulo: "Aunque entrenes 5 días a la semana"
Logo en esquina. Branding consistente.

[SLIDE 2 — ERROR 1]
Título: "Volumen demasiado alto"
Texto: "Más series ≠ más músculo. Por encima de 20 series semanales por grupo muscular, la recuperación colapsa."
Dato: "Estudio 2023: 10-12 series semanales = resultados óptimos para la mayoría."

[SLIDE 3 — ERROR 2]
Título: "No duermes suficiente"
Texto: "El 60-70% de la hormona de crecimiento se libera en las fases de sueño profundo."
Acción: "7-9h de sueño no es un lujo. Es parte del entrenamiento."

[SLIDE 4 — ERROR 3]
Título: "Déficit calórico + ganar músculo a la vez"
Texto: "En déficit, el cuerpo prioriza la supervivencia sobre la hipertrofia."
Excepción: "Solo funciona en principiantes o personas con mucho tejido graso."

[SLIDE 5 — ERROR 4]
Título: "Sin progresión de carga"
Texto: "Si haces lo mismo semana tras semana, tu cuerpo se adapta y deja de crecer."
Acción: "Súbe peso, reps o series cada 1-2 semanas."

[SLIDE 6 — ERROR 5]
Título: "Proteína insuficiente"
Texto: "El mínimo para hipertrofia: 1.6g por kilo de peso corporal."
Dato: "Óptimo: 2-2.2g/kg. Si pesas 65kg → 130-143g proteína al día."

[SLIDE 7 — CTA]
"¿Cuál de estos 5 es tu caso? Comenta el número."
"Guárdalo para la próxima vez que pienses en añadir más días de entreno."`,
          replicateTips: [
            "Adapta el ángulo a tu audiencia femenina: '5 errores que cometen las mujeres en el gym' — más específico = más engagement",
            "Los datos específicos por slide son lo que diferencia este tipo de carrusel de los genéricos — investiga y cita fuentes",
            "La pregunta de CTA al final debe ser fácil de responder con UN número o UNA palabra — baja el umbral de participación",
            "Diseño: usa un template fijo para todos tus carruseles informativos — ahorra tiempo y construye identidad visual",
            "Este tipo de contenido tiene alta tasa de saves → guardarlo en tu Highlights lo hace visible a nuevos seguidores",
          ],
        },
      },
      {
        id: "p03",
        competitorId: "comp-2",
        platform: "youtube",
        postType: "video",
        caption:
          "¿Cuánta proteína necesitas REALMENTE? (La ciencia vs los mitos)",
        publishedAt: "2026-03-03",
        coverGradient: "from-red-500 to-orange-500",
        metrics: {
          views: 224_000,
          likes: 14_800,
          comments: 2_200,
          shares: 5_100,
        },
        engagementRate: 9.7,
        analysis: {
          hook: "Te han dicho que necesitas 2 gramos de proteína por kilo. La ciencia dice otra cosa.",
          hookType: "Myth-busting + Controversy",
          structure: [
            "[0:00] Hook controversia — 'lo que te han dicho está mal'",
            "[1:30] El mito de los 2g/kg — de dónde viene y por qué persiste",
            "[5:00] La ciencia real — meta-análisis y estudios",
            "[12:00] Variables que modifican la cantidad: entreno, edad, déficit",
            "[20:00] Cómo calcularlo para tu caso específico — fórmula práctica",
            "[28:00] Fuentes de proteína y timing — lo que importa y lo que no",
            "[33:00] Conclusión y calculadora en descripción",
          ],
          tone: "Periodista científico + coach. Cuestiona creencias establecidas con datos. Genera debate saludable.",
          toneAttributes: [
            "Controversial",
            "Científico",
            "Honesto",
            "Analítico",
          ],
          keyTactics: [
            "Myth-busting — genera controversia positiva y shares de personas que no están de acuerdo",
            "Palabra 'REALMENTE' en mayúscula en el título — implica que lo demás es mentira",
            "Cita meta-análisis — credibilidad máxima, nadie cuestiona los meta-análisis",
            "Calculadora gratuita en descripción — lead generation + valor añadido",
            "Invita al debate en comentarios — 'dime tu duda más frecuente sobre proteína'",
          ],
          transcript: `[HOOK — 0:00]
"2 gramos de proteína por kilo. Lo has leído en todas partes."
"¿Y si te dijera que es exagerado para la mayoría de las personas?"
→ Pausa dramática. Corte a desk setup con pizarra detrás.

[EL MITO — 1:30]
Historia de dónde viene el número: estudios en culturistas en ciclo.
"Ese número viene de atletas de élite en condiciones muy específicas."
"Para alguien que entrena 3-4 días a la semana... es probablemente excesivo."

[LA CIENCIA — 5:00]
Meta-análisis Morton et al. 2018: efectos disminuyen por encima de 1.62g/kg.
"El rango que maximiza la hipertrofia en la mayoría: 1.6 a 2.2g/kg."
"Por encima de 2.2g no hay beneficio adicional demostrado."

[VARIABLES — 12:00]
"Pero no es una talla única para todos." Variables que modifican:
1. Si estás en déficit calórico → sube a 2-2.4g/kg
2. Si eres mayor de 50 → sube a 1.8-2.0g/kg
3. Si eres principiante → puedes construir con menos
4. Si estás en mantenimiento/superávit → 1.6g/kg es suficiente

[CÁLCULO PRÁCTICO — 20:00]
Ejemplo en tiempo real con calculadora en pantalla.
"Si pesas 70kg y estás en déficit: 70 × 2 = 140g. Si estás en mantenimiento: 70 × 1.6 = 112g."

[CONCLUSIÓN — 33:00]
"No necesitas obsesionarte con llegar a 2g/kg si no lo necesitas."
"Pero sí necesitas llegar a 1.6g como mínimo, eso está muy claro."
"La calculadora personalizada está en la descripción — tardas 2 minutos."`,
          replicateTips: [
            "El formato myth-busting genera más engagement que el formato educativo puro — la controversia (respetuosa) impulsa comentarios y shares",
            "Adapta el tema: 'Te han dicho que el cardio es lo mejor para quemar grasa. La ciencia dice algo diferente.'",
            "Siempre cita fuentes concretas (nombre del estudio + año) — aunque tu audiencia no las busque, añade credibilidad",
            "El recurso gratuito (calculadora, PDF) en la descripción es una táctica poderosa para convertir vistas en leads",
            "Invita activamente al debate: 'Dime cuánta proteína tomas ahora' → comentarios que amplifican el alcance",
          ],
        },
      },
      {
        id: "p04",
        competitorId: "comp-2",
        platform: "instagram",
        postType: "reel",
        caption:
          "Warm up de 5 min ANTES de pesas que cambiará tus entrenamientos ⚡",
        publishedAt: "2026-03-07",
        coverGradient: "from-cyan-600 to-blue-700",
        metrics: {
          views: 67_000,
          likes: 7_900,
          comments: 340,
          shares: 1_200,
          saves: 5_600,
        },
        engagementRate: 11.8,
        analysis: {
          hook: "Si vas directo a los pesos sin esto, estás perdiendo el 30% de tu rendimiento — y arriesgando una lesión.",
          hookType: "Warning + FOMO",
          structure: [
            "[0:00] Gancho de advertencia",
            "[0:05] Ejercicio 1: rotación torácica (30s)",
            "[0:18] Ejercicio 2: hip 90/90 movilidad",
            "[0:28] Ejercicio 3: activación glúteo con banda",
            "[0:38] Ejercicio 4: face pulls con goma",
            "[0:48] Ejercicio 5: sentadilla de caja para activación neural",
            "[0:58] CTA — guardar para antes del próximo entreno",
          ],
          tone: "Directo, práctico, funcional. Sin relleno. Cada segundo aporta valor.",
          toneAttributes: ["Práctico", "Conciso", "Técnico", "Sin relleno"],
          keyTactics: [
            "Advertencia estadística en el hook — '30% de rendimiento' crea urgencia real",
            "Formato de lista rápida — 5 ejercicios en 60s, ritmo alto mantiene atención",
            "Sin cara en muchos clips — foco en el movimiento, más profesional para contenido técnico",
            "CTA a saves antes del final — 'guárdalo para antes del próximo entreno' = intención de uso real",
            "Solución de 5 minutos — la brevedad de la solución elimina la excusa de 'no tengo tiempo'",
          ],
          transcript: `[HOOK — 0s]
"Si vas directo a los pesos sin calentar bien, pierdes el 30% de tu fuerza."
"Y te juegas una lesión. Este warm up te lleva 5 minutos."

[EJERCICIO 1 — 5s: ROTACIÓN TORÁCICA]
En cuadrupedia, mano detrás de la cabeza, rotación de codo hacia el techo.
Overlay: "10 reps c/lado | Movilidad torácica"

[EJERCICIO 2 — 18s: HIP 90/90]
Sentado en el suelo, piernas en 90/90, rotación controlada.
Overlay: "30s + presión suave | Cadera y piriforme"

[EJERCICIO 3 — 28s: ACTIVACIÓN GLÚTEA CON BANDA]
Clamshells en lateral + extensión de cadera.
Overlay: "15 reps c/lado | Activa glúteo medio antes de piernas"

[EJERCICIO 4 — 38s: FACE PULLS]
Con goma anclada, tirón hacia cara con rotación externa.
Overlay: "15 reps | Manguito rotador + postural"

[EJERCICIO 5 — 48s: SENTADILLA DE CAJA]
Sentadilla lenta con pausa, sin peso.
Overlay: "10 reps lentas | Activación neural + patrón de movimiento"

[CTA — 58s]
"Guárdalo para antes de tu próximo entreno. ¿Cuánto tiempo tardas ahora en calentar? Comenta."
→ Texto overlay: 'GUARDA → APLICA'`,
          replicateTips: [
            "Haz tu versión específica para mujeres que entrenan glúteos y piernas — 'warm up de 5 min para tu día de glúteos'",
            "El hook de advertencia + estadística funciona muy bien — busca un dato que puedas usar honestamente",
            "5 ejercicios × 12s de clip = Reel de ~60s perfecto — ese es el formato",
            "El 'sin cara' funciona para contenido técnico de ejercicios — permite al espectador ver bien la técnica",
            "CTA de guardar + pregunta simple al final — doble impacto en el algoritmo",
          ],
        },
      },
    ],
  },

  // ── Competitor 3: Diana Nutrifit ─────────────────────────────────────────────
  {
    id: "comp-3",
    handle: "@nutrifit.diana",
    name: "Diana Nutrifit",
    platforms: ["instagram", "tiktok"],
    niche: "Nutrición · Recetas fit · Macros",
    avatarGradient: "from-violet-500 to-purple-600",
    addedAt: "2026-01-20T08:00:00Z",
    lastRefreshed: "2026-03-16T14:00:00Z",
    metrics: {
      instagram: {
        followers: 198_000,
        followersGrowth: 5.1,
        avgEngagementRate: 13.8,
        postsPerWeek: 6,
        totalPosts: 420,
      },
      tiktok: {
        followers: 91_000,
        followersGrowth: 8.3,
        avgEngagementRate: 7.2,
        postsPerWeek: 4,
        totalPosts: 180,
      },
    },
    posts: [
      {
        id: "d01",
        competitorId: "comp-3",
        platform: "instagram",
        postType: "carousel",
        caption:
          "5 comidas con 30g de proteína que puedo preparar en menos de 10 minutos 🍳",
        publishedAt: "2026-03-13",
        coverGradient: "from-violet-500 to-pink-500",
        metrics: {
          views: 124_000,
          likes: 22_800,
          comments: 1_450,
          shares: 4_900,
          saves: 18_700,
        },
        engagementRate: 18.3,
        analysis: {
          hook: "5 comidas de 30g de proteína que puedo preparar en menos de 10 minutos — y que no me aburro",
          hookType: "Practical value + Relatable problem",
          structure: [
            "[Slide 1] Cover impactante con número y tiempo",
            "[Slides 2-6] Una comida por slide: foto + ingredientes + tiempo + macros",
            "[Slide 7] Lista de ingredientes de la semana (facilita la compra)",
            "[Slide 8] CTA + pregunta cuál van a hacer primero",
          ],
          tone: "Amigable, sin restricciones, inclusiva. Hace que comer sano parezca fácil y sabroso, no una penitencia.",
          toneAttributes: [
            "Amigable",
            "Práctica",
            "Sin restricciones",
            "Inclusiva",
            "Inspiradora",
          ],
          keyTactics: [
            "Combinación de 3 beneficios en un título: cantidad + proteína + tiempo — irresistible",
            "Una comida por slide — fácil de guardar y usar como referencia",
            "Foto real, no de stock — autenticidad que genera confianza",
            "Slide de lista de compra — valor añadido que hace el guardado obligatorio",
            "CTA de decisión ('cuál harás primero') — genera comentarios con respuesta corta",
            "Saves muy altos (18.7K) — contenido de referencia que la gente consulta repetidamente",
          ],
          transcript: `[SLIDE 1 — COVER]
Foto: bowl colorido y apetecible.
Texto: "5 COMIDAS CON 30G PROTEÍNA EN -10 MINUTOS"
Subtítulo: "Que realmente están buenas."

[SLIDES 2-6 — UNA COMIDA POR SLIDE]
Formato: foto grande + nombre + ingredientes + tiempo de preparación + macros
Ejemplo slide 2:
- FOTO: bowl de huevos revueltos con salmón
- Nombre: "Huevos revueltos con salmón ahumado"
- Ingredientes: 3 huevos, 50g salmón, espinacas, tostada integral
- Tiempo: 5 minutos
- Macros: 32g proteína | 28g HC | 14g grasa | 360 kcal

[SLIDE 7 — LISTA DE LA COMPRA]
Texto: "Lo que necesitas para hacer las 5 esta semana:"
Lista completa de ingredientes, organizada por categoría.
Subtítulo: "Guárdalo y llévalo al súper."

[SLIDE 8 — CTA]
"¿Cuál de las 5 vas a hacer esta semana? Comenta el número 👇"
"Y si quieres más como este, dilo en comentarios."`,
          replicateTips: [
            "Este formato de 'N recetas/comidas en X minutos' tiene el ROI más alto en tiempo de producción vs engagement — hazlo tuyo para pre/post workout",
            "El slide de lista de compra es el diferenciador — convierte tu contenido en una herramienta práctica que la gente guarda",
            "Usa fotos tuyas reales, no perfectas — la autenticidad visual funciona mejor que el stock fotográfico perfecto",
            "Adapta para tu audiencia: '5 comidas de 30g proteína perfectas para el post-entreno'",
            "La pregunta de CTA con número es la más efectiva para generar comentarios — baja el umbral al mínimo",
          ],
        },
      },
      {
        id: "d02",
        competitorId: "comp-3",
        platform: "tiktok",
        postType: "video",
        caption:
          "Lo que le pasa a tu cuerpo si no duermes lo suficiente (te va a sorprender) 😱",
        publishedAt: "2026-03-09",
        coverGradient: "from-indigo-600 to-violet-600",
        metrics: {
          views: 1_120_000,
          likes: 78_000,
          comments: 3_400,
          shares: 14_200,
          saves: 28_000,
        },
        engagementRate: 6.9,
        analysis: {
          hook: "¿Sabes lo que le pasa REALMENTE a tu cuerpo si duermes menos de 7 horas?",
          hookType: "Curiosity gap + Health scare (soft)",
          structure: [
            "[0:00] Hook — pregunta sobre consecuencias del mal sueño",
            "[0:05] Consecuencia 1 — hambre aumenta 24% (grelina)",
            "[0:18] Consecuencia 2 — grasa corporal aumenta aunque no comas más (cortisol)",
            "[0:30] Consecuencia 3 — rendimiento cognitivo: equivale a estar borracho",
            "[0:42] Consecuencia 4 — sistema inmune cae un 40%",
            "[0:52] Solución — 4 hacks para dormir mejor",
            "[1:00] CTA — 'guárdalo y duerme esta noche'",
          ],
          tone: "Urgente sin ser alarmista. Usa datos para crear conciencia, no miedo. Termina siempre en solución.",
          toneAttributes: [
            "Urgente",
            "Científico",
            "Esperanzador",
            "Práctico",
          ],
          keyTactics: [
            "Health scare suave — datos de consecuencias negativas generan atención, pero siempre terminar en solución",
            "Datos específicos con porcentajes — cada consecuencia tiene un número, no son afirmaciones vagas",
            "Estructura consecuencia + mecanismo biológico — explica el por qué, no solo el qué",
            "Solución al final — no dejar al espectador en el miedo, darle la solución práctica",
            "Tema universalmente relevante — el sueño afecta a absolutamente todo el mundo",
          ],
          transcript: `[HOOK — 0s]
"¿Sabes lo que le pasa REALMENTE a tu cuerpo si duermes menos de 7 horas?"
Pausa. "Toma nota."

[CONSECUENCIA 1 — 5s: HAMBRE]
"La grelina, la hormona del hambre, sube un 24%."
"Vas a querer comer más aunque hayas comido suficiente."
"Y el ansia por azúcar y carbohidratos se dispara."

[CONSECUENCIA 2 — 18s: GRASA]
"El cortisol elevado por falta de sueño hace que tu cuerpo almacene más grasa."
"Especialmente en el abdomen. Aunque no comas de más."

[CONSECUENCIA 3 — 30s: RENDIMIENTO]
"Con menos de 6h de sueño, tu rendimiento cognitivo equivale a estar con 0.05% de alcohol en sangre."
"¿Tomarías decisiones importantes así?"

[CONSECUENCIA 4 — 42s: INMUNIDAD]
"Las células NK del sistema inmune caen un 40% con una sola noche de 4-5h."
"Una noche. Cuarenta por ciento."

[SOLUCIÓN — 52s]
"4 cosas que puedes hacer hoy: sin pantallas 1h antes, cuarto frío (18°), misma hora todos los días, magnesio glicinato."

[CTA — 1:00]
"Guárdalo. Y esta noche — duerme." 🌙`,
          replicateTips: [
            "El formato 'consecuencias + mecanismo + solución' es el más efectivo para contenido de salud — siempre en ese orden",
            "La clave es el dato específico con mecanismo: no solo 'engordas' sino 'el cortisol hace X que causa Y' — da credibilidad sin ser académico",
            "Usa temas que conecten la nutrición/fitness con la vida diaria (sueño, estrés, productividad) — amplía tu audiencia potencial",
            "El CTA de 1 sola acción ('duerme esta noche') es más efectivo que pedir varios pasos — específico y accionable",
            "Este tipo de vídeo funciona bien en días de bajo engagement — guárdalo como backup de contenido",
          ],
        },
      },
      {
        id: "d03",
        competitorId: "comp-3",
        platform: "instagram",
        postType: "reel",
        caption: "Meal prep completo de lunes en 1 hora 🥗 (para toda la semana)",
        publishedAt: "2026-03-06",
        coverGradient: "from-green-600 to-emerald-500",
        metrics: {
          views: 89_000,
          likes: 12_200,
          comments: 780,
          shares: 2_800,
          saves: 14_400,
        },
        engagementRate: 13.7,
        analysis: {
          hook: "Una hora de domingo → 5 días de comida lista. Te muestro cómo.",
          hookType: "Time-value trade + Practical",
          structure: [
            "[0:00] Hook — la propuesta de valor en una frase",
            "[0:05] Setup — mostrar todos los ingredientes juntos antes de empezar",
            "[0:15] Proteínas — 3 fuentes distintas en preparación simultánea",
            "[0:35] Hidratos — arroz + boniato + cocción en paralelo",
            "[0:50] Verduras — corte y blanqueado rápido",
            "[1:00] Snacks — preparar botes de yogur y fruta cortada",
            "[1:10] El resultado final — todo organizado en tupper",
            "[1:20] CTA — '¿Haces meal prep? ¿Cuántas horas tardas tú?'",
          ],
          tone: "Eficiente, organizada, inspiradora. Hace que el meal prep parezca asequible y no un sacrificio.",
          toneAttributes: [
            "Eficiente",
            "Organizado",
            "Accesible",
            "Inspirador",
          ],
          keyTactics: [
            "La propuesta de valor en el hook es matemática: 1h → 5 días — el ROI es obvio e irresistible",
            "Mostrar todos los ingredientes al inicio — crea anticipación y hace la lista de compra mentalmente",
            "Cocción en paralelo — el hack de eficiencia que diferencia a quien sabe de quien no",
            "El resultado final organizado — foto mental del objetivo, genera el deseo de replicarlo",
            "Pregunta de CTA que hace al espectador reflexionar sobre su situación actual",
          ],
          transcript: `[HOOK — 0s]
"Una hora de domingo. Cinco días de comidas listas."
"Sin excusas entre semana. Te muestro cómo lo hago."

[INGREDIENTES — 5s]
Plano cenital de todos los ingredientes organizados en la encimera.
"Esto es todo lo que voy a preparar: proteínas, hidratos, verduras, snacks."

[PROTEÍNAS — 15s]
Paralelismo: pollo al horno + salmón al vapor + huevos cocidos, todo al mismo tiempo.
"El secreto del meal prep eficiente: cocinar todo a la vez."

[HIDRATOS — 35s]
Arroz en olla + boniato en horno + ya estaba puesto antes.
"Nada espera a nada. Todo va en simultáneo."

[VERDURAS — 50s]
Brócoli al vapor (5 min), judías verdes salteadas, espinacas crudas.
"Verduras de las 3 categorías: al vapor, salteadas, crudas. Variedad sin complicación."

[SNACKS — 1:00]
Botes de yogur con frutas cortadas + bolsitas de frutos secos pesadas.
"10 minutos de trabajo. Snacks para toda la semana."

[RESULTADO — 1:10]
Frigorífico organizado con todos los tupper etiquetados.
"Esto es lo que me da paz durante la semana."

[CTA — 1:20]
"¿Haces meal prep? ¿Cuántas horas tardas normalmente? Cuéntame abajo."`,
          replicateTips: [
            "La estructura de la propuesta de valor matemática en el hook funciona siempre: [tiempo invertido] → [beneficio concreto]",
            "El plano cenital de ingredientes al inicio es aspiracional — hace que el espectador quiera organizarse así",
            "Mostrar la cocción en paralelo es el insight de valor real — no todo el mundo sabe que se puede hacer todo a la vez",
            "El frigorífico organizado al final es la 'money shot' del meal prep — es lo que genera el share y el save",
            "Adapta para tu audiencia: 'Meal prep para deportistas: lo que preparo para rendir toda la semana'",
          ],
        },
      },
    ],
  },

  // ── Competitor 4: FitWithCarla ───────────────────────────────────────────────
  {
    id: "comp-4",
    handle: "@fitwithcarla_",
    name: "FitWithCarla",
    platforms: ["instagram", "tiktok", "youtube"],
    niche: "Transformación · Mentalidad · Estilo de vida",
    avatarGradient: "from-amber-500 to-orange-500",
    addedAt: "2026-02-01T08:00:00Z",
    lastRefreshed: "2026-03-17T11:00:00Z",
    metrics: {
      instagram: {
        followers: 342_000,
        followersGrowth: 6.3,
        avgEngagementRate: 18.2,
        postsPerWeek: 7,
        totalPosts: 510,
      },
      tiktok: {
        followers: 228_000,
        followersGrowth: 12.4,
        avgEngagementRate: 11.8,
        postsPerWeek: 8,
        totalPosts: 340,
      },
      youtube: {
        followers: 51_000,
        followersGrowth: 4.8,
        avgEngagementRate: 8.4,
        postsPerWeek: 1,
        totalPosts: 89,
      },
    },
    posts: [
      {
        id: "f01",
        competitorId: "comp-4",
        platform: "tiktok",
        postType: "video",
        caption:
          "30 días de transformación: todo lo que nadie te muestra del proceso 🔥 #transformation",
        publishedAt: "2026-03-15",
        coverGradient: "from-amber-500 via-orange-500 to-rose-500",
        metrics: {
          views: 8_200_000,
          likes: 780_000,
          comments: 24_500,
          shares: 142_000,
          saves: 310_000,
        },
        engagementRate: 15.8,
        analysis: {
          hook: "30 días de transformación. Pero no la que esperas.",
          hookType: "Subverted expectation + Vulnerability",
          structure: [
            "[0:00] Hook — 'no la que esperas' subvierte expectativa del formato clásico",
            "[0:04] Día 1 — duda, miedo, fotografía sin filtros real",
            "[0:15] Semana 1 — las partes difíciles: malos días, falta de energía, dudas constantes",
            "[0:28] Semana 2-3 — primeras señales de cambio, pero sin resultados visibles aún",
            "[0:42] Semana 4 — el cambio interno antes que el externo",
            "[0:55] El mensaje — lo que cambia primero no es el cuerpo",
            "[1:05] CTA — compartirlo",
          ],
          tone: "Radicalmente honesta. Vulnerabilidad como fortaleza. Rechaza el formato aspiracional perfecto a propósito.",
          toneAttributes: [
            "Vulnerable",
            "Honesta",
            "Anti-perfeccionista",
            "Empoderador",
            "Emocional",
          ],
          keyTactics: [
            "Subverted expectation en el hook — 'pero no la que esperas' genera curiosidad masiva",
            "Vulnerabilidad radical — mostrar los días malos genera 10x más conexión que solo los buenos",
            "Anti-narrative del típico 'transformation post' — diferenciarse del contenido homogéneo",
            "El mensaje del cambio interno antes que el externo — apela a la identidad, no al físico",
            "CTA de compartir agresivo — el contenido emocional viraliza por shares",
            "Duración perfecta para el mensaje: 70s — no se puede contar esto en menos",
          ],
          transcript: `[HOOK — 0s]
"30 días de transformación. Pero no la que esperas."
→ Silencio 2 segundos. Sin música. Solo cara mirando a cámara.

[DÍA 1 — 4s]
"Día uno. Sin filtros. Sin buen ángulo. Sin buena luz."
→ Fotografía real, sin glamour.
"Esto es lo que hay. Y esto es con lo que voy a trabajar."

[SEMANA 1 — 15s]
Música lenta, melancólica.
"Semana uno. Hay días que no quiero ir al gym."
"Hay días que como lo que no debería y me siento una mierda por ello."
"Hay días que me miro y pienso: ¿esto merece la pena?"
→ Texto overlay: 'nadie te muestra esto'

[SEMANA 2-3 — 28s]
Música empieza a cambiar.
"Semana dos. Algo cambia, pero no lo que crees."
"La báscula igual. El espejo igual. Pero duermo mejor."
"Semana tres. Tengo más energía a las 3 de la tarde."
"Por primera vez en años. Sin café."

[SEMANA 4 — 42s]
Música más esperanzadora.
"Semana cuatro. Ahora sí hay cambio físico. Pero eso es lo de menos."
"Lo que cambió es que empecé a tratarme bien."
"Empecé a ver el ejercicio como un regalo, no un castigo."

[MENSAJE — 55s]
"Lo que cambia primero en una transformación no es el cuerpo."
"Es cómo te hablas a ti misma."
→ Texto grande en pantalla. Música al máximo.

[CTA — 1:05]
"Envíaselo a alguien que necesita escuchar esto."
→ Fade to black con texto: 'MANDALO'`,
          replicateTips: [
            "Este formato de transformación honesta es el más poderoso actualmente — rechaza el formato perfecto a propósito",
            "La clave es la vulnerabilidad específica: no 'fue difícil' sino 'hubo días que comí mal y me sentí fatal' — el detalle específico genera identificación real",
            "El mensaje del cambio interno antes que el externo es lo que diferencia este contenido y lo hace viral — apela a la identidad",
            "CTA hacia compartir en lugar de follow/like — el contenido emocional viraliza por shares",
            "Para GabiFit: comparte tu propio proceso honesto como coach — los clientes no quieren perfección, quieren autenticidad",
          ],
        },
      },
      {
        id: "f02",
        competitorId: "comp-4",
        platform: "instagram",
        postType: "reel",
        caption:
          "Antes y ahora: 6 meses de consistencia real 💪 (lo que no ves en la foto)",
        publishedAt: "2026-03-10",
        coverGradient: "from-rose-500 to-pink-600",
        metrics: {
          views: 445_000,
          likes: 81_000,
          comments: 4_200,
          shares: 9_800,
          saves: 22_000,
        },
        engagementRate: 21.3,
        analysis: {
          hook: "6 meses. Misma persona. La diferencia no es solo física.",
          hookType: "Transformation + Depth",
          structure: [
            "[0:00] Hook — contraste visual + mensaje de profundidad",
            "[0:04] El antes — honestidad total, foto sin glamorizar",
            "[0:12] El proceso — no los highlights, sino los días normales",
            "[0:25] El después físico — brevemente, sin ser el punto central",
            "[0:32] El después mental — la transformación real y más importante",
            "[0:45] Mensaje — tu 'después' más importante no se ve en la foto",
            "[0:55] CTA — comentar dónde están en su proceso",
          ],
          tone: "Íntimo. Como si te lo contara en persona. No es un anuncio, es una conversación.",
          toneAttributes: [
            "Íntimo",
            "Personal",
            "Anti-superficial",
            "Profundo",
            "Motivador",
          ],
          keyTactics: [
            "Antes/después es el formato con mayor tasa de engagement en Instagram fitness — pero el giro emocional lo eleva",
            "La frase 'lo que no ves en la foto' genera curiosidad inmediata",
            "Minimizar el resultado físico para maximizar el mensaje emocional — diferenciador potente",
            "Formato selfie/directo a cámara — intimidad máxima con el espectador",
            "CTA de ubicación en el proceso — invita a reflexión personal y respuesta emocional",
          ],
          transcript: `[HOOK — 0s]
Split screen: antes vs ahora.
"6 meses. Misma persona. La diferencia no es solo física."

[EL ANTES — 4s]
"Este soy yo hace 6 meses."
"Sin filtros. Sin buen ángulo. Así exactamente."
"Agotada, sin energía, sin motivación para nada."

[EL PROCESO — 12s]
"Estos 6 meses no fueron perfectos."
"Hubo semanas de mierda. Hubo recaídas. Hubo días de 'para qué'."
"Nadie te muestra eso porque no es bonito. Pero es real."

[EL DESPUÉS FÍSICO — 25s]
"Sí, hay cambio físico. Es obvio."
"Pero es el cambio menos importante."

[EL DESPUÉS MENTAL — 32s]
"Lo que cambió de verdad: me levanto sin mirar el móvil primero."
"Duermo 8 horas y sé que merezco ese descanso."
"Me hablo distinto. No perfectamente, pero diferente."
"Me trato como a alguien que me importa."

[MENSAJE — 45s]
"Tu 'después' más importante no cabe en una foto."
"Es cómo te sientes a las 7 de la mañana."
"Es la relación que tienes contigo misma."

[CTA — 55s]
"¿En qué punto de tu proceso estás? Cuéntame en comentarios."`,
          replicateTips: [
            "El formato antes/después con giro emocional tiene el mayor ROI en Instagram fitness — combina el morbo del cambio físico con profundidad real",
            "La clave: mencionar el cambio físico brevemente y luego dedicar el 70% del tiempo al cambio mental/emocional",
            "La pregunta de CTA '¿en qué punto estás?' genera respuestas muy personales y largas — alto engagement de calidad",
            "Para GabiFit como coach: tu transformación personal o la de una alumna (con permiso) siguiendo este guion exacto",
            "La honestidad sobre los días malos durante el proceso es lo que diferencia este tipo de contenido del típico before/after perfecto",
          ],
        },
      },
      {
        id: "f03",
        competitorId: "comp-4",
        platform: "youtube",
        postType: "video",
        caption:
          "Mi rutina de entrenamiento COMPLETA (por fin lo muestro todo)",
        publishedAt: "2026-03-08",
        coverGradient: "from-red-600 to-amber-500",
        metrics: {
          views: 98_000,
          likes: 8_200,
          comments: 1_900,
          shares: 2_400,
        },
        engagementRate: 7.2,
        analysis: {
          hook: "Por fin. La rutina completa que me ha dado estos resultados — sin esconder nada.",
          hookType: "Transparency + Exclusivity",
          structure: [
            "[0:00] Por qué tardé en compartirlo — genera valor a la espera",
            "[3:00] Mi filosofía de entrenamiento actual — contexto antes de la rutina",
            "[8:00] División semanal — cuántos días, cuántas horas, cuándo descanso",
            "[15:00] Día de piernas: ejercicios + series + reps + RPE",
            "[25:00] Día de upper: misma estructura",
            "[35:00] Día de fullbody: misma estructura",
            "[42:00] Cómo adapto cuando viajo o no tengo tiempo",
            "[47:00] Q&A y FAQ sobre la rutina",
          ],
          tone: "Transparente y sin filtros. Como si te invitara a su vida de entrenamiento. Nada está oculto.",
          toneAttributes: [
            "Transparente",
            "Generoso",
            "Detallado",
            "Auténtico",
          ],
          keyTactics: [
            "La anticipación creada antes del vídeo — 'por fin lo muestro' implica que fue solicitado y esperado",
            "Contexto filosófico antes de la rutina — el por qué antes del qué genera comprensión y fidelidad",
            "RPE en los ejercicios — dato avanzado que muestra expertise real",
            "Sección de adaptaciones — hace la rutina accesible a quien no puede seguirla perfectamente",
            "Duración larga con valor en cada minuto — audience de YouTube busca profundidad",
          ],
          transcript: `[INTRO — 0:00]
"Lleváis meses pidiéndome que comparta mi rutina completa."
"Tardé en hacerlo porque quería compartirla cuando estuviera en el punto en que estoy ahora."
"Hoy es ese momento. Sin filtros. Sin marketing. La rutina real."

[FILOSOFÍA — 3:00]
"Antes de entrar en ejercicios, necesito explicar mi filosofía."
"Entreno para sentirme bien, no para verme bien — aunque el resultado visual también llega."
"Prioridades: 1) Salud articular, 2) Fuerza funcional, 3) Estética."
"Con esas prioridades, los programas cambian completamente."

[DIVISIÓN SEMANAL — 8:00]
"Actualmente: 4 días de entrenamiento, 3 de descanso activo."
"Lunes-Jueves-Viernes-Sábado o variación según agenda."
"Cada sesión: 50-70 minutos incluyendo warm up y vuelta a la calma."

[DÍA DE PIERNAS — 15:00]
Hip thrust: 4×8-10 RPE 8 | Bulgarian: 3×10-12 RPE 7 | Leg press: 3×12-15 | RDL: 3×10 RPE 7-8

[DÍA DE UPPER — 25:00]
Press banca: 4×6-8 | Remo con barra: 4×8 | Press militar: 3×10-12 | Remo en polea: 3×12-15

[FULLBODY — 35:00]
Sentadilla: 3×8 | Peso muerto: 3×5 | Press inclinado: 3×10 | Dominadas: 3×max

[ADAPTACIONES — 42:00]
"Cuando viajo: rutina de 30 min sin equipo que comparto en la descripción."
"Cuando estoy con poco tiempo: versión comprimida de 2 ejercicios por grupo muscular."

[Q&A — 47:00]
Responde preguntas frecuentes de comentarios anteriores sobre la rutina.`,
          replicateTips: [
            "El 'por fin lo muestro todo' funciona si primero has creado anticipación — empieza a referenciar que lo vas a compartir antes de hacerlo",
            "La sección de filosofía antes de la rutina es lo que da profundidad y te diferencia de los cientos de 'mi rutina' genéricos",
            "Incluir RPE (percepción del esfuerzo) muestra expertise y diferencia tu contenido del amateur",
            "La sección de adaptaciones para viajes/poco tiempo amplía la audiencia a quien no puede seguir la rutina al pie de la letra",
            "Para el Q&A: recopila preguntas en Stories antes de grabar — dos pájaros de un tiro, engagement + contenido",
          ],
        },
      },
      {
        id: "f04",
        competitorId: "comp-4",
        platform: "tiktok",
        postType: "video",
        caption:
          "Deja de buscar la motivación — encuentra esto en su lugar 🔑",
        publishedAt: "2026-03-03",
        coverGradient: "from-amber-600 to-yellow-500",
        metrics: {
          views: 2_140_000,
          likes: 187_000,
          comments: 8_900,
          shares: 34_000,
          saves: 78_000,
        },
        engagementRate: 12.4,
        analysis: {
          hook: "La motivación es una mentira que te han vendido. Esto es lo que realmente necesitas.",
          hookType: "Controversial claim + Bold statement",
          structure: [
            "[0:00] Bold claim — 'la motivación es una mentira'",
            "[0:05] El problema de depender de la motivación — es inconsistente por naturaleza",
            "[0:18] El concepto real: identidad vs motivación",
            "[0:32] Cómo construir identidad en lugar de buscar motivación",
            "[0:48] Ejemplo práctico — el cambio de lenguaje",
            "[0:58] CTA — ¿qué identidad quieres construir?",
          ],
          tone: "Filosófico pero práctico. Cuestionador. Genera una pequeña revolución mental.",
          toneAttributes: [
            "Filosófico",
            "Cuestionador",
            "Empoderador",
            "Práctico",
          ],
          keyTactics: [
            "Bold claim controversial — 'la motivación es mentira' garantiza engagement por acuerdo O desacuerdo",
            "Concepto de identidad vs motivación — insight de alto nivel que resuena con audiencias maduras",
            "Cambio de lenguaje como herramienta práctica — hace abstracto en concreto",
            "Saves masivos (78K) — contenido de cambio mental que la gente guarda para releer",
            "Aplica a TODA la vida, no solo al fitness — amplifica el alcance más allá de la audiencia típica",
          ],
          transcript: `[HOOK — 0s]
"La motivación es una mentira que te han vendido."
→ Pausa. Cara seria. Sin música los primeros 3 segundos.

[EL PROBLEMA — 5s]
"La motivación es un sentimiento. Los sentimientos son inconsistentes."
"Un día te sientes motivada. Tres días después, no."
"Si dependes de la motivación para entrenar, vas a fallar. Siempre."

[EL CONCEPTO — 18s]
"Lo que necesitas no es motivación. Es identidad."
"La diferencia: alguien motivada dice 'voy al gym cuando me apetece'."
"Alguien con identidad dice 'soy alguien que entrena. Punto'."

[CONSTRUIR IDENTIDAD — 32s]
"¿Cómo cambias la identidad?"
"Primer paso: cambia tu lenguaje."
"De: 'estoy intentando hacer ejercicio'"
"A: 'soy una persona que entrena'"
"Las palabras crean la realidad."

[EJEMPLO PRÁCTICO — 48s]
"Cada vez que vas al gym aunque no quieras — es evidencia de tu identidad."
"Cada vez que eliges la proteína aunque quieras el helado — es evidencia."
"Las identidades se construyen con votos pequeños, no con grandes declaraciones."

[CTA — 58s]
"¿Qué identidad quieres construir este año? Escríbela en comentarios."`,
          replicateTips: [
            "El bold claim controversial funciona para expandir alcance — genera comentarios de acuerdo y desacuerdo, ambos son buenos",
            "El concepto de identidad vs motivación es aplicable al fitness pero también a la nutrición, el sueño, todo — da un twist de aplicación al fitness",
            "El cambio de lenguaje como herramienta práctica es el 'accionable' que hace que la gente guarde el vídeo",
            "CTA que invita a escribir una identidad propia — los comentarios largos son señal muy positiva para el algoritmo",
            "Para GabiFit: esto aplica perfectamente a tu posicionamiento como coach — no vendes entrenamientos, vendes identidad",
          ],
        },
      },
    ],
  },
];
