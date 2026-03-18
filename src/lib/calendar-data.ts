// ─── Platform definitions ─────────────────────────────────────────────────────
export type PlatformKey = "instagram" | "tiktok" | "youtube" | "twitter" | "linkedin";
export type ContentTypeKey = "informativo" | "ventas" | "viralidad";
export type PostStatusKey  = "published" | "scheduled" | "draft";

export interface Platform {
  key:       PlatformKey;
  label:     string;
  abbr:      string;
  color:     string;   // Tailwind text class
  bg:        string;   // Tailwind bg class (low opacity)
  border:    string;   // Tailwind border class
  dot:       string;   // hex for the chip left dot
}

export interface ContentType {
  key:    ContentTypeKey;
  label:  string;
  color:  string;   // Tailwind text class
  bg:     string;
  dot:    string;   // hex
}

export const PLATFORMS: Record<PlatformKey, Platform> = {
  instagram: {
    key:    "instagram",
    label:  "Instagram",
    abbr:   "IG",
    color:  "text-pink-400",
    bg:     "bg-pink-500/15",
    border: "border-pink-500/30",
    dot:    "#f472b6",
  },
  tiktok: {
    key:    "tiktok",
    label:  "TikTok",
    abbr:   "TT",
    color:  "text-cyan-400",
    bg:     "bg-cyan-500/15",
    border: "border-cyan-500/30",
    dot:    "#22d3ee",
  },
  youtube: {
    key:    "youtube",
    label:  "YouTube",
    abbr:   "YT",
    color:  "text-red-400",
    bg:     "bg-red-500/15",
    border: "border-red-500/30",
    dot:    "#f87171",
  },
  twitter: {
    key:    "twitter",
    label:  "Twitter / X",
    abbr:   "TW",
    color:  "text-sky-400",
    bg:     "bg-sky-500/15",
    border: "border-sky-500/30",
    dot:    "#38bdf8",
  },
  linkedin: {
    key:    "linkedin",
    label:  "LinkedIn",
    abbr:   "LN",
    color:  "text-indigo-400",
    bg:     "bg-indigo-500/15",
    border: "border-indigo-500/30",
    dot:    "#818cf8",
  },
};

export const CONTENT_TYPES: Record<ContentTypeKey, ContentType> = {
  informativo: {
    key:   "informativo",
    label: "Informativo",
    color: "text-violet-400",
    bg:    "bg-violet-500/15",
    dot:   "#a78bfa",
  },
  ventas: {
    key:   "ventas",
    label: "Ventas",
    color: "text-amber-400",
    bg:    "bg-amber-500/15",
    dot:   "#fbbf24",
  },
  viralidad: {
    key:   "viralidad",
    label: "Viralidad",
    color: "text-emerald-400",
    bg:    "bg-emerald-500/15",
    dot:   "#34d399",
  },
};

// ─── Calendar post ────────────────────────────────────────────────────────────
export interface CalendarPost {
  id:          string;
  date:        string;          // "YYYY-MM-DD"
  time:        string;          // "HH:MM"
  platform:    PlatformKey;
  type:        ContentTypeKey;
  status:      PostStatusKey;
  caption:     string;
  format:      string;          // "Reel" | "Post" | "Story" | "Video" | "Tweet"
  hashtags?:   string;
  engagement?: { likes: number; comments: number; shares: number } | null;
}

// ─── Seed data — March 2026 ───────────────────────────────────────────────────
// Posts up to Mar 17 = published; from Mar 18+ = scheduled
export const CALENDAR_POSTS: CalendarPost[] = [
  // ── Week 1 ──────────────────────────────────────────────────────────────────
  {
    id: "c01", date: "2026-03-01", time: "18:00",
    platform: "tiktok", type: "viralidad", status: "published", format: "Video",
    caption: "Leg day challenge en serio 💀 ¿Quién se apunta? #legday #challenge",
    hashtags: "#legday #fitness #gabifit",
    engagement: { likes: 2840, comments: 312, shares: 180 },
  },
  {
    id: "c02", date: "2026-03-03", time: "09:00",
    platform: "instagram", type: "informativo", status: "published", format: "Carousel",
    caption: "5 hábitos de sueño que mejorarán tu rendimiento 🌙 Guarda este post para cuando lo necesites.",
    hashtags: "#sleep #recovery #gabifit",
    engagement: { likes: 980, comments: 94, shares: 140 },
  },
  {
    id: "c03", date: "2026-03-03", time: "14:00",
    platform: "youtube", type: "informativo", status: "published", format: "Video",
    caption: "Tutorial full body workout — 45 min sin equipo, para cualquier nivel.",
    hashtags: "#workout #tutorial #gabifit",
    engagement: { likes: 1420, comments: 231, shares: 88 },
  },
  {
    id: "c04", date: "2026-03-05", time: "10:00",
    platform: "instagram", type: "ventas", status: "published", format: "Post",
    caption: "🚀 Lanzamiento del Programa de Entrenamiento Primavera. Plazas limitadas.",
    hashtags: "#programa #entrenamiento #gabifit",
    engagement: { likes: 740, comments: 215, shares: 60 },
  },
  {
    id: "c05", date: "2026-03-06", time: "19:30",
    platform: "tiktok", type: "viralidad", status: "published", format: "Video",
    caption: "POV: el día después de pierna 😂 Tag a tu compañero de entreno.",
    hashtags: "#legday #funny #gabifit",
    engagement: { likes: 5200, comments: 640, shares: 920 },
  },
  {
    id: "c06", date: "2026-03-07", time: "08:00",
    platform: "instagram", type: "informativo", status: "published", format: "Story",
    caption: "Mi rutina matutina completa: de levantarme a estar lista para entrenar en 30 min ⏱",
    engagement: { likes: 310, comments: 28, shares: 15 },
  },
  // ── Week 2 ──────────────────────────────────────────────────────────────────
  {
    id: "c07", date: "2026-03-08", time: "12:00",
    platform: "linkedin", type: "informativo", status: "published", format: "Post",
    caption: "Por qué la consistencia supera a la intensidad. Reflexión después de 5 años como coach.",
    hashtags: "#coaching #fitness #consistency",
    engagement: { likes: 430, comments: 67, shares: 112 },
  },
  {
    id: "c08", date: "2026-03-10", time: "17:00",
    platform: "instagram", type: "viralidad", status: "published", format: "Reel",
    caption: "5 movimientos para esculpir el core en menos de 10 minutos 💪 ¡Guárdalo!",
    hashtags: "#core #workout #gabifit",
    engagement: { likes: 1420, comments: 184, shares: 310 },
  },
  {
    id: "c09", date: "2026-03-10", time: "20:00",
    platform: "tiktok", type: "ventas", status: "published", format: "Video",
    caption: "🔥 Quedan 3 plazas de coaching 1:1 para abril. Enlace en bio.",
    hashtags: "#coaching #gabifit",
    engagement: { likes: 890, comments: 178, shares: 65 },
  },
  {
    id: "c10", date: "2026-03-12", time: "09:30",
    platform: "instagram", type: "informativo", status: "published", format: "Carousel",
    caption: "Guía honesta de suplementos: lo que SÍ funciona y lo que NO. Sin sponsors.",
    hashtags: "#suplementos #nutrition #gabifit",
    engagement: { likes: 1180, comments: 205, shares: 280 },
  },
  {
    id: "c11", date: "2026-03-13", time: "11:00",
    platform: "twitter", type: "viralidad", status: "published", format: "Tweet",
    caption: "Hot take: los días de descanso son tan importantes como los de entrenamiento. Unpopular opinion o realidad?",
    engagement: { likes: 640, comments: 98, shares: 220 },
  },
  {
    id: "c12", date: "2026-03-14", time: "16:00",
    platform: "youtube", type: "informativo", status: "published", format: "Video",
    caption: "Q&A: Todo sobre coaching de fitness — cómo empecé, mis errores, mis aprendizajes.",
    hashtags: "#qanda #coaching #gabifit",
    engagement: { likes: 980, comments: 312, shares: 45 },
  },
  // ── Week 3 ──────────────────────────────────────────────────────────────────
  {
    id: "c13", date: "2026-03-15", time: "10:00",
    platform: "instagram", type: "ventas", status: "published", format: "Post",
    caption: "🌸 OFERTA PRIMAVERA — 30% dto en el programa completo solo este finde.",
    hashtags: "#oferta #programa #gabifit",
    engagement: { likes: 520, comments: 143, shares: 88 },
  },
  {
    id: "c14", date: "2026-03-15", time: "20:00",
    platform: "tiktok", type: "viralidad", status: "published", format: "Video",
    caption: "POV: llevas 3 meses entrenando y ya no reconoces tu cuerpo 🔥",
    hashtags: "#transformation #gabifit",
    engagement: { likes: 7800, comments: 890, shares: 1240 },
  },
  {
    id: "c15", date: "2026-03-17", time: "08:00",
    platform: "instagram", type: "informativo", status: "published", format: "Carousel",
    caption: "Guía de meal prep semanal: todo lo que como para rendir en el entreno.",
    hashtags: "#mealprep #nutrition #gabifit",
    engagement: { likes: 1240, comments: 167, shares: 340 },
  },
  {
    id: "c16", date: "2026-03-17", time: "13:00",
    platform: "twitter", type: "viralidad", status: "published", format: "Tweet",
    caption: "El problema de la cultura fitness en 2026: todo el mundo quiere resultados en 30 días pero nadie quiere cambiar sus hábitos.",
    engagement: { likes: 1840, comments: 234, shares: 580 },
  },
  // ── Week 3–4 scheduled ──────────────────────────────────────────────────────
  {
    id: "c17", date: "2026-03-19", time: "08:00",
    platform: "instagram", type: "viralidad", status: "scheduled", format: "Reel",
    caption: "Morning workout: el ritual que cambió mi día completamente 🌅",
    hashtags: "#morning #workout #gabifit",
  },
  {
    id: "c18", date: "2026-03-19", time: "18:00",
    platform: "tiktok", type: "informativo", status: "scheduled", format: "Video",
    caption: "Los 3 errores más comunes al hacer sentadillas (y cómo corregirlos).",
    hashtags: "#squats #form #gabifit",
  },
  {
    id: "c19", date: "2026-03-20", time: "10:00",
    platform: "instagram", type: "ventas", status: "scheduled", format: "Post",
    caption: "🚨 Últimas plazas para la cohorte de abril. No te quedes fuera.",
    hashtags: "#coaching #abril #gabifit",
  },
  {
    id: "c20", date: "2026-03-21", time: "15:00",
    platform: "linkedin", type: "ventas", status: "scheduled", format: "Post",
    caption: "Abriendo 5 plazas para coaching ejecutivo online. ¿Eres tú?",
    hashtags: "#coaching #ejecutivo #gabifit",
  },
  {
    id: "c21", date: "2026-03-22", time: "17:00",
    platform: "youtube", type: "informativo", status: "scheduled", format: "Video",
    caption: "Mitos de nutrición que sigues creyendo (desmontándolos con ciencia).",
    hashtags: "#nutrition #myths #gabifit",
  },
  {
    id: "c22", date: "2026-03-22", time: "20:00",
    platform: "tiktok", type: "viralidad", status: "scheduled", format: "Video",
    caption: "Trend: si tu entrenadora te dijera la verdad 😅 #honestidad",
    hashtags: "#trend #funny #gabifit",
  },
  {
    id: "c23", date: "2026-03-24", time: "09:00",
    platform: "instagram", type: "informativo", status: "scheduled", format: "Story",
    caption: "Behind the scenes del shoot de contenido de esta semana 📸",
  },
  {
    id: "c24", date: "2026-03-25", time: "18:30",
    platform: "tiktok", type: "viralidad", status: "scheduled", format: "Video",
    caption: "Resultados del challenge de 30 días — INCREÍBLE transformación 🔥",
    hashtags: "#30days #transformation #gabifit",
  },
  {
    id: "c25", date: "2026-03-26", time: "12:00",
    platform: "instagram", type: "informativo", status: "scheduled", format: "Carousel",
    caption: "Plan de entrenamiento semanal gratuito — 5 días, sin excusas.",
    hashtags: "#workoutplan #free #gabifit",
  },
  {
    id: "c26", date: "2026-03-27", time: "11:00",
    platform: "twitter", type: "informativo", status: "scheduled", format: "Tweet",
    caption: "Thread: todo lo que aprendí en mis primeros 3 años como fitness coach 🧵",
  },
  {
    id: "c27", date: "2026-03-28", time: "10:00",
    platform: "instagram", type: "ventas", status: "scheduled", format: "Post",
    caption: "Programa de abril ABIERTO — plazas muy limitadas. Enlace en bio.",
    hashtags: "#programa #abril #gabifit",
  },
  {
    id: "c28", date: "2026-03-29", time: "20:00",
    platform: "tiktok", type: "ventas", status: "scheduled", format: "Video",
    caption: "Por qué invertir en un coach cambia todo. Historia real de una alumna.",
    hashtags: "#coaching #resultado #gabifit",
  },
  {
    id: "c29", date: "2026-03-30", time: "09:00",
    platform: "youtube", type: "viralidad", status: "scheduled", format: "Video",
    caption: "Resumen del mes de marzo: retos, victorias y lo que viene 📹",
    hashtags: "#recap #march #gabifit",
  },
  {
    id: "c30", date: "2026-03-31", time: "19:00",
    platform: "tiktok", type: "viralidad", status: "scheduled", format: "Video",
    caption: "Recap de marzo en 60 segundos ✨ El mes más intenso del año.",
    hashtags: "#recap #gabifit",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function getPostsForDate(date: string): CalendarPost[] {
  return CALENDAR_POSTS.filter((p) => p.date === date);
}

export function getPostsByMonth(year: number, month: number): CalendarPost[] {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  return CALENDAR_POSTS.filter((p) => p.date.startsWith(prefix));
}

/** Build a 42-cell array (6 rows × 7 cols, Mon-first) for a given year/month */
export function buildCalendarGrid(year: number, month: number): (string | null)[] {
  const firstDay  = new Date(year, month - 1, 1);
  const lastDay   = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();

  // Convert getDay() (0=Sun) → Monday-first index (0=Mon … 6=Sun)
  const startDow = (firstDay.getDay() + 6) % 7; // 0=Mon
  const cells: (string | null)[] = [];

  // Padding from previous month
  for (let i = 0; i < startDow; i++) {
    const d = new Date(year, month - 1, -startDow + i + 1);
    cells.push(d.toISOString().slice(0, 10));
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }

  // Pad to next 7-multiple (up to 42)
  while (cells.length < 42) {
    const d = new Date(year, month, cells.length - startDow - daysInMonth + 1);
    cells.push(d.toISOString().slice(0, 10));
  }

  return cells;
}

export const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
export const DAY_NAMES = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
