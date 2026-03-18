export type NewsCategoryKey = "fitness" | "nutricion" | "marketing" | "tendencias" | "postparto";

export interface NewsCategory {
  key: NewsCategoryKey;
  label: string;
  emoji: string;
  color: string;
  bg: string;
  border: string;
  dot: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  keyInsight: string;
  source: string;
  sourceUrl: string;
  category: NewsCategoryKey;
  publishedAt: string;
  readTimeMin: number;
  tags: string[];
  trendScore: number;
  weekBatch: number;
}

export const NEWS_CATEGORIES: Record<NewsCategoryKey, NewsCategory> = {
  fitness: {
    key: "fitness",
    label: "Fitness",
    emoji: "💪",
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/30",
    dot: "#34d399",
  },
  nutricion: {
    key: "nutricion",
    label: "Nutrición",
    emoji: "🥑",
    color: "text-amber-400",
    bg: "bg-amber-500/15",
    border: "border-amber-500/30",
    dot: "#fbbf24",
  },
  marketing: {
    key: "marketing",
    label: "Marketing",
    emoji: "📱",
    color: "text-violet-400",
    bg: "bg-violet-500/15",
    border: "border-violet-500/30",
    dot: "#a78bfa",
  },
  tendencias: {
    key: "tendencias",
    label: "Tendencias",
    emoji: "🔥",
    color: "text-pink-400",
    bg: "bg-pink-500/15",
    border: "border-pink-500/30",
    dot: "#f472b6",
  },
  postparto: {
    key: "postparto",
    label: "Post Parto",
    emoji: "🤱",
    color: "text-sky-400",
    bg: "bg-sky-500/15",
    border: "border-sky-500/30",
    dot: "#38bdf8",
  },
};

export const NEWS_ARTICLES: NewsArticle[] = [
  // ─── FITNESS (7 articles, batches 1–5) ───────────────────────────────────────
  {
    id: "fit-001",
    title: "Los 5 mitos del entrenamiento de sobrecarga progresiva que frenan tu progreso",
    summary:
      "La sobrecarga progresiva es el principio más importante para ganar fuerza y músculo, pero muchos entrenadores la aplican de forma incorrecta. El error más común es aumentar solo el peso, ignorando variables como volumen, densidad y tempo. Un estudio reciente del Journal of Strength & Conditioning confirma que alternar variables cada 3–4 semanas maximiza la adaptación muscular.",
    keyInsight:
      "💡 Variar el tipo de sobrecarga (peso, reps, tempo, densidad) cada mes previene la adaptación y multiplica los resultados a largo plazo.",
    source: "Journal of Strength & Conditioning",
    sourceUrl: "https://journals.lww.com/nsca-jscr/progressive-overload-myths-2026",
    category: "fitness",
    publishedAt: "2026-02-03",
    readTimeMin: 5,
    tags: ["sobrecarga progresiva", "hipertrofia", "fuerza", "periodización"],
    trendScore: 87,
    weekBatch: 1,
  },
  {
    id: "fit-002",
    title: "HIIT vs cardio de baja intensidad: qué dice la ciencia en 2026",
    summary:
      "Una revisión meta-analítica publicada en Sports Medicine evalúa 42 estudios comparando HIIT y cardio de estado estacionario para pérdida de grasa y salud cardiovascular. Ambos métodos producen resultados similares en reducción de grasa corporal a largo plazo, pero el HIIT mejora más la sensibilidad a la insulina. Sin embargo, el cardio de baja intensidad preserva mejor el tejido muscular en personas con déficit calórico.",
    keyInsight:
      "💡 Si estás en déficit calórico, combina 2 sesiones de HIIT con 1-2 sesiones de cardio suave por semana para preservar masa muscular mientras pierdes grasa.",
    source: "Sports Medicine",
    sourceUrl: "https://link.springer.com/sportsmedicine/hiit-vs-liss-meta-analysis-2026",
    category: "fitness",
    publishedAt: "2026-02-10",
    readTimeMin: 6,
    tags: ["HIIT", "cardio", "quema grasa", "ciencia del ejercicio"],
    trendScore: 91,
    weekBatch: 1,
  },
  {
    id: "fit-003",
    title: "Sueño y recuperación muscular: cómo optimizar tus horas de descanso para crecer más",
    summary:
      "El 70% de la hormona del crecimiento se libera durante el sueño profundo (fase N3), lo que hace del descanso una herramienta anabólica tan importante como el entrenamiento mismo. Investigadores de la Universidad de Stanford demostraron que atletas que dormían 10 horas reportaron un 20% más de fuerza en press banca tras 5 semanas. La calidad del sueño, medida por la continuidad de las fases REM, impacta directamente la síntesis proteica.",
    keyInsight:
      "💡 Dormir menos de 7 horas reduce la síntesis de proteína muscular en un 18%: el sueño es literalmente parte de tu programa de entrenamiento.",
    source: "Sleep Research Society",
    sourceUrl: "https://academic.oup.com/sleep/sleep-muscle-recovery-2026",
    category: "fitness",
    publishedAt: "2026-02-18",
    readTimeMin: 4,
    tags: ["sueño", "recuperación", "hormona del crecimiento", "descanso"],
    trendScore: 78,
    weekBatch: 2,
  },
  {
    id: "fit-004",
    title: "Zona 2: el entrenamiento de resistencia que los élites guardan como secreto",
    summary:
      "El entrenamiento en Zona 2 (60–70% de la frecuencia cardíaca máxima) ha resurgido como la modalidad favorita de atletas de ultra-resistencia por su capacidad para aumentar la densidad mitocondrial sin sobrecargar el sistema nervioso central. El Dr. Inigo San Millán, del Team UAE Emirates, sostiene que 3–4 horas semanales en Zona 2 transforman la capacidad oxidativa incluso en no atletas. Esta zona también promueve la oxidación de grasas como combustible principal.",
    keyInsight:
      "💡 Tres sesiones de 45 minutos en Zona 2 por semana mejoran la salud metabólica más eficientemente que cualquier otro protocolo de cardio a intensidad moderada-alta.",
    source: "Journal of Physiology",
    sourceUrl: "https://physoc.onlinelibrary.wiley.com/zone2-training-2026",
    category: "fitness",
    publishedAt: "2026-02-25",
    readTimeMin: 7,
    tags: ["zona 2", "mitocondrias", "cardio aeróbico", "resistencia"],
    trendScore: 94,
    weekBatch: 2,
  },
  {
    id: "fit-005",
    title: "Movilidad para levantadores: la rutina de 15 minutos que previene el 80% de las lesiones",
    summary:
      "Un análisis de fisioterapeutas del ACE Fitness Institute revela que los levantadores que dedican 15 minutos de trabajo de movilidad antes del entrenamiento reducen el riesgo de lesión en un 83% respecto a los que solo hacen calentamiento dinámico. La cadena posterior (isquiotibiales, glúteos, espalda baja) y la movilidad torácica son los puntos más críticos en levantadores recreativos. El trabajo con foam roller, seguido de movilidad articular activa, es la combinación más efectiva.",
    keyInsight:
      "💡 Prioriza la movilidad de cadera y columna torácica antes de entrenar para mantener patrones de movimiento saludables y rendir al máximo.",
    source: "ACE Fitness",
    sourceUrl: "https://www.acefitness.org/education-and-resources/mobility-injury-prevention-2026",
    category: "fitness",
    publishedAt: "2026-03-03",
    readTimeMin: 3,
    tags: ["movilidad", "lesiones", "flexibilidad", "calentamiento"],
    trendScore: 72,
    weekBatch: 3,
  },
  {
    id: "fit-006",
    title: "VO2máx: el biomarcador de longevidad más poderoso según la medicina moderna",
    summary:
      "El VO2 máximo ha sido catalogado por el Dr. Peter Attia como el predictor número uno de mortalidad por todas las causas, superando incluso al colesterol y la presión arterial. Datos del NHANES muestran que pasar del quintil más bajo al siguiente en VO2máx reduce el riesgo de muerte prematura en un 45%. La buena noticia: mejorar el VO2máx es posible a cualquier edad con entrenamiento aeróbico consistente.",
    keyInsight:
      "💡 Mejorar tu VO2máx de 'bajo' a 'promedio' tiene más impacto en tu esperanza de vida saludable que cualquier medicamento preventivo disponible hoy.",
    source: "JAMA Internal Medicine",
    sourceUrl: "https://jamanetwork.com/journals/jamainternalmedicine/vo2max-longevity-2026",
    category: "fitness",
    publishedAt: "2026-03-10",
    readTimeMin: 5,
    tags: ["VO2máx", "longevidad", "salud cardiovascular", "biomarcadores"],
    trendScore: 96,
    weekBatch: 4,
  },
  {
    id: "fit-007",
    title: "Periodización ondulante: cómo estructurar tus mesociclos para resultados máximos",
    summary:
      "La periodización ondulante diaria (DUP) permite entrenar fuerza, hipertrofia y resistencia muscular dentro de la misma semana, maximizando adaptaciones múltiples simultáneamente. Un estudio de la NSCA comparó DUP con periodización lineal en 60 sujetos durante 12 semanas y encontró 23% más de ganancia de fuerza en el grupo DUP. Este modelo es especialmente efectivo para entrenadores intermedios que han estancado su progreso.",
    keyInsight:
      "💡 Alternar días de fuerza (3-5 reps), hipertrofia (8-12 reps) y resistencia (15-20 reps) en la misma semana desbloqueará un progreso que la periodización lineal no puede ofrecer.",
    source: "NSCA Strength & Conditioning Journal",
    sourceUrl: "https://journals.lww.com/nsca-scj/daily-undulating-periodization-2026",
    category: "fitness",
    publishedAt: "2026-03-14",
    readTimeMin: 6,
    tags: ["periodización", "mesociclos", "planificación", "fuerza"],
    trendScore: 81,
    weekBatch: 5,
  },

  // ─── NUTRICIÓN (7 articles, batches 1–5) ─────────────────────────────────────
  {
    id: "nut-001",
    title: "El timing de la proteína: ¿importa cuándo comes, no solo cuánto?",
    summary:
      "Durante años, la ventana anabólica de 30 minutos post-entreno fue el dogma del culturismo. Meta-análisis recientes en el International Journal of Sport Nutrition demuestran que la distribución de proteína a lo largo del día importa más que el timing exacto. Consumir 0.4g/kg de proteína en 4 comidas distribuidas produce mayor síntesis proteica que concentrar la misma cantidad en 2 ingestas grandes.",
    keyInsight:
      "💡 Distribuir la proteína en 4 comidas de 30–40g cada una optimiza la síntesis muscular mejor que una sola comida grande post-entrenamiento.",
    source: "International Journal of Sport Nutrition",
    sourceUrl: "https://journals.humankinetics.com/ijsnem/protein-timing-distribution-2026",
    category: "nutricion",
    publishedAt: "2026-02-05",
    readTimeMin: 4,
    tags: ["proteína", "timing", "síntesis muscular", "nutrición deportiva"],
    trendScore: 85,
    weekBatch: 1,
  },
  {
    id: "nut-002",
    title: "Creatina para mujeres: los beneficios que nadie te está contando",
    summary:
      "La creatina es el suplemento más estudiado en nutrición deportiva, pero su adopción entre mujeres sigue siendo baja por mitos sobre retención de agua y 'ponerse demasiado grande'. Una revisión en Nutrients de 2026 confirma que las mujeres responden igual de bien a la creatina en términos de fuerza y recuperación, con beneficios adicionales: mejora cognitiva, reducción de síntomas del síndrome premenstrual y mayor densidad ósea. La dosis efectiva es 3-5g diarios sin necesidad de fase de carga.",
    keyInsight:
      "💡 La creatina monohidrato (3-5g/día) es el suplemento más respaldado por la ciencia para mujeres activas: mejora fuerza, cognición y salud ósea sin efectos secundarios.",
    source: "Nutrients MDPI",
    sourceUrl: "https://www.mdpi.com/nutrients/creatine-women-benefits-2026",
    category: "nutricion",
    publishedAt: "2026-02-12",
    readTimeMin: 5,
    tags: ["creatina", "suplementos", "mujeres", "fuerza"],
    trendScore: 93,
    weekBatch: 1,
  },
  {
    id: "nut-003",
    title: "Microbioma intestinal y rendimiento deportivo: la conexión que cambia todo",
    summary:
      "Investigaciones de la Universidad de Harvard identificaron que ciertos perfiles del microbioma intestinal se asocian con mayor VO2máx y recuperación más rápida tras el ejercicio intenso. Las bacterias del género Veillonella transforman el lactato muscular en propionato, un ácido graso de cadena corta que actúa como combustible adicional. Una dieta rica en fibra diversa (30+ tipos de plantas por semana) favorece el microbioma óptimo para el rendimiento.",
    keyInsight:
      "💡 Comer 30 tipos distintos de plantas por semana diversifica tu microbioma intestinal y puede mejorar tu resistencia y recuperación tan efectivamente como un suplemento ergogénico.",
    source: "Nature Medicine",
    sourceUrl: "https://www.nature.com/articles/microbiome-exercise-performance-2026",
    category: "nutricion",
    publishedAt: "2026-02-20",
    readTimeMin: 7,
    tags: ["microbioma", "intestino", "rendimiento", "fibra"],
    trendScore: 89,
    weekBatch: 2,
  },
  {
    id: "nut-004",
    title: "Dieta mediterránea y equilibrio hormonal femenino: evidencia actualizada",
    summary:
      "Un estudio longitudinal de 5 años en 1,200 mujeres publicado en la revista Hormones encontró que adherirse a un patrón mediterráneo (aceite de oliva, legumbres, pescado, vegetales de hoja verde) se asocia con ciclos menstruales más regulares, menor severidad del síndrome premenstrual y niveles de estradiol más estables. El impacto es especialmente notable en mujeres de 25–40 años con síndrome de ovario poliquístico. Los omega-3 del pescado son el componente más determinante.",
    keyInsight:
      "💡 Incorporar 3 porciones semanales de pescado azul y aceite de oliva virgen extra como grasa principal puede mejorar significativamente el equilibrio hormonal femenino.",
    source: "Hormones Journal",
    sourceUrl: "https://link.springer.com/journal/hormones/mediterranean-hormones-women-2026",
    category: "nutricion",
    publishedAt: "2026-02-28",
    readTimeMin: 5,
    tags: ["dieta mediterránea", "hormonas", "SOP", "omega-3"],
    trendScore: 76,
    weekBatch: 2,
  },
  {
    id: "nut-005",
    title: "Ventana post-entreno en 2026: lo que la evidencia dice sobre carbohidratos y proteínas",
    summary:
      "La nutrición post-entreno sigue siendo uno de los temas más debatidos. Un protocolo de consenso de la Sociedad Internacional de Nutrición Deportiva recomienda consumir 0.3g/kg de proteína + 0.5g/kg de carbohidratos de índice glucémico moderado dentro de las 2 horas post-ejercicio para optimizar la resíntesis de glucógeno y la síntesis proteica. Los carbohidratos no son opcionales si tu objetivo incluye rendimiento y no solo pérdida de peso.",
    keyInsight:
      "💡 Combinar proteína con carbohidratos post-entrenamiento (no solo proteína) acelera la recuperación muscular y la resíntesis de glucógeno de forma sinérgica.",
    source: "ISSN Position Stand",
    sourceUrl: "https://jissn.biomedcentral.com/post-workout-nutrition-consensus-2026",
    category: "nutricion",
    publishedAt: "2026-03-05",
    readTimeMin: 4,
    tags: ["post-entreno", "carbohidratos", "recuperación", "glucógeno"],
    trendScore: 82,
    weekBatch: 3,
  },
  {
    id: "nut-006",
    title: "Ayuno intermitente y hormonas femeninas: lo que debes saber antes de empezar",
    summary:
      "El ayuno intermitente puede ser contraproducente para mujeres premenopáusicas si no se aplica correctamente. Una revisión en Frontiers in Endocrinology advierte que protocolos agresivos (OMAD, 20:4) pueden elevar el cortisol, disrumpir el eje hipotálamo-hipófisis-ovario y causar irregularidades menstruales. El protocolo 16:8, limitado a 3–4 días por semana, muestra beneficios metabólicos sin impacto negativo en ciclos hormonales cuando la ingesta calórica total es adecuada.",
    keyInsight:
      "💡 Si eres mujer en edad fértil, el ayuno intermitente funciona mejor en protocolos moderados (16:8, máximo 4 días/semana) respetando siempre la ingesta calórica mínima.",
    source: "Frontiers in Endocrinology",
    sourceUrl: "https://www.frontiersin.org/journals/endocrinology/intermittent-fasting-women-2026",
    category: "nutricion",
    publishedAt: "2026-03-09",
    readTimeMin: 6,
    tags: ["ayuno intermitente", "hormonas", "mujeres", "cortisol"],
    trendScore: 88,
    weekBatch: 4,
  },
  {
    id: "nut-007",
    title: "Alimentos antiinflamatorios para deportistas: la lista definitiva actualizada",
    summary:
      "La inflamación crónica de bajo grado es uno de los principales limitantes del rendimiento y la recuperación en deportistas recreativos. Investigadores del Linus Pauling Institute actualizaron la lista de alimentos con mayor poder antiinflamatorio respaldado por ensayos clínicos: cúrcuma con pimienta negra, arándanos, salmón, espinacas, nueces, aceite de oliva y jengibre encabezan la lista. La clave está en la consistencia y la diversidad, no en megadosis de un solo alimento.",
    keyInsight:
      "💡 Incluir al menos 3 alimentos antiinflamatorios en cada comida principal reduce los marcadores de inflamación (IL-6, PCR) hasta un 30% en 8 semanas de adherencia.",
    source: "Linus Pauling Institute",
    sourceUrl: "https://lpi.oregonstate.edu/anti-inflammatory-foods-athletes-2026",
    category: "nutricion",
    publishedAt: "2026-03-13",
    readTimeMin: 4,
    tags: ["antiinflamatorios", "recuperación", "alimentos funcionales", "curcuma"],
    trendScore: 74,
    weekBatch: 5,
  },

  // ─── MARKETING (7 articles, batches 1–5) ─────────────────────────────────────
  {
    id: "mkt-001",
    title: "El algoritmo de Instagram en 2026: los cambios que afectan a los creadores de fitness",
    summary:
      "Meta anunció en febrero de 2026 una actualización mayor al algoritmo de Instagram que prioriza el 'tiempo de calidad en pantalla' por encima del engagement superficial (likes, comentarios cortos). Los Reels con retención superior al 70% reciben distribución orgánica 3x mayor que el año anterior. Además, el nuevo sistema de 'interest graph' amplifica contenido a audiencias que nunca te han seguido si el engagement de los primeros 500 seguidores es sólido.",
    keyInsight:
      "💡 En 2026, el dato más importante para el algoritmo de Instagram es la retención de tu Reel: superar el 70% de retención activa la distribución masiva a nuevas audiencias.",
    source: "Marketing Directo",
    sourceUrl: "https://www.marketingdirecto.com/digital-general/instagram-algoritmo-2026",
    category: "marketing",
    publishedAt: "2026-02-07",
    readTimeMin: 5,
    tags: ["Instagram", "algoritmo", "Reels", "alcance orgánico"],
    trendScore: 97,
    weekBatch: 1,
  },
  {
    id: "mkt-002",
    title: "Cómo los creadores de fitness generan 6 cifras sin millones de seguidores",
    summary:
      "Un informe de Creator IQ revela que los creadores de fitness con 15,000–80,000 seguidores (micro-influencers) están generando ingresos promedio de $8,000–15,000 USD/mes combinando membresías digitales, coaching grupal, afiliados y una línea de productos propios. La clave es la 'super-audiencia comprometida' sobre la audiencia masiva pasiva. Las plataformas más rentables en 2026 son YouTube (AdSense + membresías), Instagram (colaboraciones) y sus propios newsletters.",
    keyInsight:
      "💡 Con 20,000 seguidores altamente comprometidos y un producto digital de $50, puedes generar $10,000/mes: el tamaño de audiencia importa menos que la confianza y la oferta.",
    source: "Creator IQ Report",
    sourceUrl: "https://creatoriq.com/reports/fitness-creator-monetization-2026",
    category: "marketing",
    publishedAt: "2026-02-14",
    readTimeMin: 6,
    tags: ["monetización", "creadores de contenido", "ingresos", "micro-influencers"],
    trendScore: 92,
    weekBatch: 1,
  },
  {
    id: "mkt-003",
    title: "TikTok para marcas fitness en 2026: estrategia, formatos y errores comunes",
    summary:
      "TikTok supera los 2 mil millones de usuarios activos mensuales y su vertical de fitness (#FitTok) acumula más de 400 mil millones de visualizaciones. Las marcas fitness que más crecen en TikTok combinan contenido educativo (60%) con entretenimiento (30%) y venta directa (10%). Los videos de 45–90 segundos con gancho en los primeros 3 segundos y texto on-screen tienen tasas de completado 2.3x superiores. TikTok Shop está mostrando conversión directa de contenido orgánico superior a Instagram Shopping.",
    keyInsight:
      "💡 La fórmula ganadora en TikTok Fitness es: educa o entretiene en los primeros 10 segundos, o tu video muere antes de que tu audiencia vea el mensaje.",
    source: "Social Media Examiner",
    sourceUrl: "https://www.socialmediaexaminer.com/tiktok-fitness-brands-strategy-2026",
    category: "marketing",
    publishedAt: "2026-02-22",
    readTimeMin: 5,
    tags: ["TikTok", "fitness brands", "estrategia", "content marketing"],
    trendScore: 90,
    weekBatch: 2,
  },
  {
    id: "mkt-004",
    title: "Content batching: el método que duplicó la productividad de los creadores top",
    summary:
      "El content batching (producir todo el contenido de la semana o mes en 1-2 sesiones intensas) es adoptado por el 78% de los creadores con ingresos superiores a $100K anuales, según el estudio State of Creator Economy 2026. Grabar 10-15 videos en un día reduce el tiempo total de producción en un 60% y mejora la consistencia de publicación. La preparación previa (guiones, outfits, setups) es la diferencia entre una sesión productiva y una frustrante.",
    keyInsight:
      "💡 Producir todo tu contenido de la semana en una sola sesión de 4-6 horas es más eficiente que grabar un video por día: elimina el 'friction' diario y acelera tu flujo creativo.",
    source: "State of Creator Economy",
    sourceUrl: "https://www.influencermarketinghub.com/creator-economy-batching-2026",
    category: "marketing",
    publishedAt: "2026-03-01",
    readTimeMin: 4,
    tags: ["content batching", "productividad", "planificación de contenido", "creadores"],
    trendScore: 84,
    weekBatch: 3,
  },
  {
    id: "mkt-005",
    title: "UGC y prueba social: por qué el contenido de tus clientes convierte más que tu propio contenido",
    summary:
      "El contenido generado por usuarios (UGC) tiene tasas de conversión 4.5x superiores al contenido de marca en campañas de fitness, según datos de Hootsuite 2026. Las reseñas en video de clientes reales, testimonios antes/después y stories mencionando productos generan confianza que ningún copy profesional puede replicar. Las marcas fitness que incluyen UGC en sus campañas de paid ads reportan un 30% de reducción en el costo por adquisición.",
    keyInsight:
      "💡 Pedir activamente a tus clientes que compartan su transformación en redes y repostear ese contenido es la estrategia de conversión más poderosa y económica disponible.",
    source: "Hootsuite Digital Trends",
    sourceUrl: "https://blog.hootsuite.com/ugc-fitness-conversion-rates-2026",
    category: "marketing",
    publishedAt: "2026-03-06",
    readTimeMin: 5,
    tags: ["UGC", "prueba social", "conversión", "testimonios"],
    trendScore: 86,
    weekBatch: 3,
  },
  {
    id: "mkt-006",
    title: "Construir una lista de email como coach fitness: la guía que nadie comparte",
    summary:
      "A diferencia de las redes sociales, el email marketing tiene un ROI promedio de 42:1 y pertenece completamente al creador. Los coaches fitness que construyen listas de email de 3,000+ suscriptores calificados reportan ingresos más estables y mayor tasa de apertura de lanzamientos que aquellos con el triple de seguidores en Instagram. Los lead magnets más efectivos en fitness son: plan de entrenamiento descargable (72%), recetario (68%) y masterclass gratuita (61%).",
    keyInsight:
      "💡 Una lista de email de 2,000 suscriptores comprometidos vale más que 20,000 seguidores en Instagram: nadie puede quitarte tu lista ni cambiarle el algoritmo.",
    source: "HubSpot Marketing Blog",
    sourceUrl: "https://blog.hubspot.com/marketing/fitness-coach-email-list-building-2026",
    category: "marketing",
    publishedAt: "2026-03-11",
    readTimeMin: 6,
    tags: ["email marketing", "lead magnets", "lista de suscriptores", "coaching"],
    trendScore: 79,
    weekBatch: 4,
  },
  {
    id: "mkt-007",
    title: "YouTube Shorts vs TikTok vs Reels: dónde poner tu energía en 2026",
    summary:
      "Un análisis comparativo de Later Media evalúa el alcance orgánico, monetización y crecimiento de audiencia en los tres formatos de video corto en 2026. TikTok sigue liderando en viralidad y descubrimiento para audiencias nuevas. YouTube Shorts ofrece la monetización más robusta vía AdSense y membresías. Instagram Reels muestra la mejor conversión a ventas directas para creadores con audiencias establecidas. La estrategia óptima: crear en uno y republicar en los otros dos.",
    keyInsight:
      "💡 Graba una vez y publica en TikTok, Reels y Shorts: el 80% del trabajo es crear el video, el 20% restante es adaptarlo a cada plataforma.",
    source: "Later Media",
    sourceUrl: "https://later.com/blog/youtube-shorts-vs-tiktok-vs-reels-2026",
    category: "marketing",
    publishedAt: "2026-03-15",
    readTimeMin: 5,
    tags: ["YouTube Shorts", "TikTok", "Reels", "video corto", "multiplataforma"],
    trendScore: 95,
    weekBatch: 5,
  },

  // ─── TENDENCIAS (7 articles, batches 1–5) ────────────────────────────────────
  {
    id: "ten-001",
    title: "Wearables de fitness en 2026: los dispositivos que monitorean lo que antes era imposible",
    summary:
      "La generación más reciente de wearables ya no solo mide pasos y frecuencia cardíaca: el Apple Watch Series 11, Whoop 5.0 y Oura Ring Gen 4 miden glucosa intersticial en tiempo real, variabilidad del ritmo cardíaco avanzada y hasta métricas de composición corporal. Los datos del wearable se están convirtiendo en el punto de partida para programas de entrenamiento y nutrición verdaderamente personalizados. El mercado de wearables fitness alcanza $95 mil millones USD en 2026.",
    keyInsight:
      "💡 Los wearables de nueva generación que miden glucosa en sangre en tiempo real están revolucionando la nutrición deportiva personalizada, sin necesidad de pruebas de laboratorio.",
    source: "TechCrunch",
    sourceUrl: "https://techcrunch.com/2026/fitness-wearables-glucose-monitoring-guide",
    category: "tendencias",
    publishedAt: "2026-02-04",
    readTimeMin: 5,
    tags: ["wearables", "tecnología fitness", "glucosa", "monitoreo"],
    trendScore: 93,
    weekBatch: 1,
  },
  {
    id: "ten-002",
    title: "Entrenadores personales con IA: el boom que está redefiniendo el mercado del fitness",
    summary:
      "Aplicaciones como Future, Caliber y Fitted integran IA generativa para ofrecer planes de entrenamiento adaptativos en tiempo real que rivalizan con coaches humanos en resultados medibles. Un ensayo controlado de 6 meses con 240 usuarios mostró que los programas guiados por IA produjeron mejoras comparables en composición corporal a los guiados por entrenadores humanos, a una fracción del costo. Sin embargo, la adherencia a largo plazo sigue siendo mayor con entrenadores humanos que ofrecen conexión emocional.",
    keyInsight:
      "💡 La IA no reemplazará a los coaches fitness, pero los coaches que usen IA reemplazarán a los que no lo hagan: la tecnología amplifica, no sustituye, la conexión humana.",
    source: "Forbes Health",
    sourceUrl: "https://www.forbes.com/health/fitness/ai-personal-trainers-market-2026",
    category: "tendencias",
    publishedAt: "2026-02-16",
    readTimeMin: 6,
    tags: ["inteligencia artificial", "entrenadores personales", "apps fitness", "tecnología"],
    trendScore: 98,
    weekBatch: 1,
  },
  {
    id: "ten-003",
    title: "Fitness funcional: la tendencia que domina los gimnasios en 2026",
    summary:
      "El fitness funcional —entrenamiento que replica los movimientos de la vida cotidiana— supera por tercer año consecutivo al levantamiento de pesas tradicional en tasas de nueva membresía en gimnasios. Los estudios muestran que el entrenamiento funcional mejora la calidad de vida percibida, la movilidad diaria y la prevención de lesiones de forma más efectiva que el entrenamiento de máquinas. La popularidad de metodologías como el kettlebell training, TRX y el entrenamiento de suelo refleja este viraje cultural.",
    keyInsight:
      "💡 El fitness funcional está ganando la guerra del fitness masivo porque la gente quiere moverse mejor en su vida, no solo verse bien: es un mensaje de marketing poderoso.",
    source: "IHRSA Global Report",
    sourceUrl: "https://www.ihrsa.org/publications/functional-fitness-trends-2026",
    category: "tendencias",
    publishedAt: "2026-02-23",
    readTimeMin: 4,
    tags: ["fitness funcional", "tendencias gym", "movimiento", "bienestar"],
    trendScore: 80,
    weekBatch: 2,
  },
  {
    id: "ten-004",
    title: "El reto 12-3-30: por qué este workout de caminadora viral sigue siendo tendencia en 2026",
    summary:
      "El workout 12-3-30 (12% de inclinación, 3 mph de velocidad, 30 minutos) viralizado por TikToker Lauren Giraldo sigue siendo uno de los ejercicios cardiovasculares más buscados cuatro años después de su popularización. Investigadores de la Universidad de Auburn determinaron que quema entre 250-400 calorías por sesión, mejora la fuerza de los glúteos e isquiotibiales y tiene menor impacto articular que correr. Su popularidad se mantiene porque es accesible, reproducible y 'verificable' en cualquier caminadora.",
    keyInsight:
      "💡 El 12-3-30 sigue viral porque cumple las tres condiciones del contenido perdurable: es simple de explicar, fácil de probar y produce resultados visibles en 4 semanas.",
    source: "Runners World",
    sourceUrl: "https://www.runnersworld.com/training/12-3-30-treadmill-workout-science-2026",
    category: "tendencias",
    publishedAt: "2026-03-02",
    readTimeMin: 3,
    tags: ["12-3-30", "caminadora", "cardio", "viral", "TikTok fitness"],
    trendScore: 91,
    weekBatch: 3,
  },
  {
    id: "ten-005",
    title: "Baño de hielo y respiración consciente: la ciencia detrás del biohacking de recuperación",
    summary:
      "La exposición al frío (crioterapia, baños de hielo) y los protocolos de respiración como el método Wim Hof han pasado de ser prácticas de nicho a mainstream gracias a la popularización en redes sociales. Un metaanálisis en Sports Medicine 2026 confirma que la inmersión en agua fría (10-15°C, 10-15 min) reduce la inflamación muscular post-ejercicio y el dolor de agujetas en un 20%. La respiración cíclica hiperventilatoria mejora la tolerancia al estrés y la variabilidad del ritmo cardíaco.",
    keyInsight:
      "💡 Combinar 10 minutos de baño frío con 5 minutos de respiración profunda post-entrenamiento es una de las intervenciones de recuperación más costo-efectivas disponibles.",
    source: "Sports Medicine",
    sourceUrl: "https://link.springer.com/sportsmedicine/cold-exposure-recovery-2026",
    category: "tendencias",
    publishedAt: "2026-03-07",
    readTimeMin: 5,
    tags: ["baño de hielo", "respiración", "biohacking", "recuperación", "Wim Hof"],
    trendScore: 87,
    weekBatch: 4,
  },
  {
    id: "ten-006",
    title: "Entrenamiento de fuerza para la longevidad: el cambio de paradigma en la medicina preventiva",
    summary:
      "La medicina preventiva está experimentando un giro radical: el entrenamiento de fuerza ya no es recomendado solo para la estética, sino como la intervención preventiva más poderosa para enfermedades metabólicas, osteoporosis, sarcopenia y demencia. Las guías actualizadas de la OMS recomiendan 2-3 sesiones de entrenamiento de fuerza por semana para adultos de todas las edades. En personas mayores de 40, el entrenamiento de fuerza reduce el riesgo de mortalidad por todas las causas en un 34%.",
    keyInsight:
      "💡 El entrenamiento de fuerza es la 'pastilla mágica' de la longevidad: 150 minutos semanales reducen el riesgo de diabetes tipo 2, sarcopenia y deterioro cognitivo de forma simultánea.",
    source: "New England Journal of Medicine",
    sourceUrl: "https://www.nejm.org/strength-training-longevity-2026",
    category: "tendencias",
    publishedAt: "2026-03-12",
    readTimeMin: 6,
    tags: ["longevidad", "fuerza", "medicina preventiva", "sarcopenia", "OMS"],
    trendScore: 96,
    weekBatch: 4,
  },
  {
    id: "ten-007",
    title: "La economía del fitness influencer: cifras, tendencias y el futuro del sector",
    summary:
      "El mercado de influencers fitness supera los $12 mil millones USD globales en 2026, con una tasa de crecimiento anual del 18%. Los modelos de negocio están evolucionando: el coaching 1:1 cede terreno a membresías de grupo, programas de 12 semanas autoguiados y apps propias. El promedio de ingresos de un fitness influencer con más de 100K seguidores activos es $180,000 USD/año, con los top 10% superando el millón. Los nichos más rentables son postparto, transformación femenina y performance atlético.",
    keyInsight:
      "💡 El mercado de fitness digital está en plena maduración: los creadores que sobrevivirán serán los que construyan activos propios (app, email list, comunidad) en lugar de depender de algoritmos.",
    source: "Business of Apps",
    sourceUrl: "https://www.businessofapps.com/data/fitness-influencer-economy-2026",
    category: "tendencias",
    publishedAt: "2026-03-16",
    readTimeMin: 7,
    tags: ["fitness influencer", "economía creadora", "monetización", "tendencias digitales"],
    trendScore: 94,
    weekBatch: 5,
  },

  // ─── POSTPARTO (7 articles, batches 1–5) ─────────────────────────────────────
  {
    id: "post-001",
    title: "Diástasis abdominal postparto: los ejercicios seguros y los que debes evitar",
    summary:
      "La diástasis de rectos (separación de los músculos abdominales) afecta al 60–70% de las mujeres durante el embarazo y persiste en el 30% a los 12 meses postparto. La fisioterapeuta especializada en suelo pélvico Sinéad Dolan advierte que ejercicios como crunches, plancha o levantamiento de piernas pueden empeorar la diástasis si se realizan antes de rehabilitar la musculatura profunda. El protocolo de rehabilitación basado en el transverso abdominal, diafragma y suelo pélvico como unidad funcional es el estándar de oro en 2026.",
    keyInsight:
      "💡 Antes de retomar ejercicios de core postparto, evalúa tu diástasis con un fisioterapeuta especializado: los ejercicios incorrectos en el momento equivocado pueden retrasar la recuperación meses.",
    source: "Pelvic Health & Rehabilitation Center",
    sourceUrl: "https://www.pelvicrehab.com/diastasis-recti-postpartum-guide-2026",
    category: "postparto",
    publishedAt: "2026-02-06",
    readTimeMin: 5,
    tags: ["diástasis", "abdomen postparto", "recuperación", "suelo pélvico"],
    trendScore: 88,
    weekBatch: 1,
  },
  {
    id: "post-002",
    title: "Rehabilitación del suelo pélvico: la guía que toda mamá necesita leer",
    summary:
      "El suelo pélvico soporta el peso de los órganos internos y sufre un enorme estrés durante el embarazo y el parto. Una encuesta de la Asociación Americana de Fisioterapia revela que el 80% de las mujeres no recibe información sobre rehabilitación del suelo pélvico durante su seguimiento postparto. Los síntomas de disfunción incluyen incontinencia urinaria, dolor pélvico, y sensación de pesadez, y son completamente tratables con fisioterapia especializada. El inicio de la rehabilitación puede comenzar tan pronto como las 6 semanas post-parto con ejercicios seguros.",
    keyInsight:
      "💡 La rehabilitación del suelo pélvico no es opcional ni un lujo: es atención médica básica que previene incontinencia crónica y prolapso de órganos en el futuro.",
    source: "American Physical Therapy Association",
    sourceUrl: "https://www.apta.org/patient-care/pelvic-floor-postpartum-rehabilitation-2026",
    category: "postparto",
    publishedAt: "2026-02-13",
    readTimeMin: 6,
    tags: ["suelo pélvico", "fisioterapia", "postparto", "incontinencia"],
    trendScore: 90,
    weekBatch: 1,
  },
  {
    id: "post-003",
    title: "Volver a correr después del parto: el protocolo de 12 semanas basado en evidencia",
    summary:
      "Las guías internacionales para el retorno al running postparto (Groom, Donnelly & Brockwell, 2019, actualizadas en 2025) recomiendan un proceso gradual de 12 semanas que incluye caminar, fortalecer el core y el suelo pélvico, y pruebas de carga antes de retomar el trote. Correr antes de las 12 semanas postparto sin completar los pasos previos aumenta significativamente el riesgo de prolapso y lesiones de rodilla. La clave es pasar las pruebas de salto y carga del suelo pélvico antes de trotar.",
    keyInsight:
      "💡 Retomar el running antes de las 12 semanas postparto y sin fortalecer el suelo pélvico triplica el riesgo de prolapso de órganos pélvicos: la paciencia aquí no es opcional.",
    source: "British Journal of Sports Medicine",
    sourceUrl: "https://bjsm.bmj.com/content/return-to-running-postpartum-guidelines-2026",
    category: "postparto",
    publishedAt: "2026-02-21",
    readTimeMin: 5,
    tags: ["running postparto", "retorno al deporte", "suelo pélvico", "guías clínicas"],
    trendScore: 85,
    weekBatch: 2,
  },
  {
    id: "post-004",
    title: "Lactancia y ejercicio: todo lo que la ciencia dice sobre entrenar mientras das el pecho",
    summary:
      "Un metaanálisis de 2026 en Maternal & Child Nutrition confirma que el ejercicio moderado no afecta negativamente la calidad ni cantidad de leche materna. La intensidad moderada (hasta el 70% VO2máx) no modifica significativamente el sabor de la leche por acumulación de ácido láctico, contrariamente al mito extendido. Las madres lactantes que hacen ejercicio regularmente reportan mayor vínculo con sus bebés, mejor humor y menos síntomas de depresión postparto. Se recomiendan 30g extra de proteína y adecuada hidratación en días de entrenamiento.",
    keyInsight:
      "💡 El ejercicio moderado durante la lactancia es seguro y beneficioso tanto para la madre como para el bebé: la única precaución es mantenerse bien hidratada y alimentada.",
    source: "Maternal & Child Nutrition",
    sourceUrl: "https://onlinelibrary.wiley.com/journal/mcn/exercise-breastfeeding-2026",
    category: "postparto",
    publishedAt: "2026-02-27",
    readTimeMin: 4,
    tags: ["lactancia", "ejercicio", "leche materna", "postparto activo"],
    trendScore: 83,
    weekBatch: 2,
  },
  {
    id: "post-005",
    title: "Cambios hormonales postparto: lo que nadie te explica sobre tu cuerpo en el primer año",
    summary:
      "El primer año postparto es una montaña rusa hormonal que impacta directamente el estado de ánimo, la energía, la composición corporal y la recuperación al ejercicio. La caída abrupta de estrógeno y progesterona tras el parto, combinada con el aumento de prolactina en madres lactantes, crea un perfil hormonal único. Las mujeres con disfunción tiroidea postparto (afecta al 5–7%) son frecuentemente maldiagnosticadas como 'depresión postparto'. Conocer estos cambios permite adaptar el entrenamiento y la nutrición de forma inteligente.",
    keyInsight:
      "💡 Si sientes fatiga extrema, caída de cabello o cambios de humor intensos en el primer año postparto, pide a tu médico que evalúe tiroides y hormonas, no solo hemograma.",
    source: "Obstetrics & Gynecology",
    sourceUrl: "https://journals.lww.com/greenjournal/postpartum-hormonal-changes-2026",
    category: "postparto",
    publishedAt: "2026-03-04",
    readTimeMin: 6,
    tags: ["hormonas postparto", "prolactina", "tiroides", "estrógeno", "recuperación"],
    trendScore: 91,
    weekBatch: 3,
  },
  {
    id: "post-006",
    title: "Nutrición postparto para sanar: los nutrientes críticos en los primeros 6 meses",
    summary:
      "El postparto impone demandas nutricionales únicas: hierro (reposición de pérdidas del parto), colina (desarrollo cerebral del bebé vía leche), omega-3 DHA y yodo son los nutrientes más frecuentemente deficientes en madres recientes. Una revisión en American Journal of Clinical Nutrition de 2026 concluye que la densidad nutricional de la dieta postparto impacta directamente la velocidad de recuperación de tejidos, la energía disponible y la salud mental. Las madres que siguen una dieta 'antiinflamatoria' muestran marcadores de recuperación superiores a las 8 semanas.",
    keyInsight:
      "💡 Los primeros 6 meses postparto son una ventana crítica de reparación: hierro, colina, DHA y vitamina D son los cuatro nutrientes que más frecuentemente necesitan suplementación.",
    source: "American Journal of Clinical Nutrition",
    sourceUrl: "https://academic.oup.com/ajcn/postpartum-nutrition-recovery-2026",
    category: "postparto",
    publishedAt: "2026-03-08",
    readTimeMin: 5,
    tags: ["nutrición postparto", "hierro", "colina", "DHA", "recuperación"],
    trendScore: 86,
    weekBatch: 4,
  },
  {
    id: "post-007",
    title: "Salud mental postparto y ejercicio: la conexión neurobiológica que salva vidas",
    summary:
      "La depresión postparto afecta al 15–20% de las madres y el ejercicio emerge como una intervención terapéutica de primera línea, no complementaria. Una revisión Cochrane de 2026 encontró que programas de ejercicio supervisado reducen los síntomas depresivos postparto tan efectivamente como la psicoterapia cognitivo-conductual en casos leves-moderados. El mecanismo neurobiológico involucra aumento de BDNF (factor neurotrófico), regulación del cortisol y liberación de endorfinas. Tres sesiones semanales de 30 minutos son suficientes para producir efectos medibles.",
    keyInsight:
      "💡 El ejercicio regular es tan efectivo como la terapia psicológica para la depresión postparto leve-moderada: tres sesiones de 30 minutos por semana pueden transformar el estado mental de una nueva mamá.",
    source: "Cochrane Library",
    sourceUrl: "https://www.cochranelibrary.com/cdsr/exercise-postpartum-depression-2026",
    category: "postparto",
    publishedAt: "2026-03-16",
    readTimeMin: 6,
    tags: ["depresión postparto", "salud mental", "ejercicio terapéutico", "BDNF"],
    trendScore: 95,
    weekBatch: 5,
  },
];

export const ALL_ARTICLES: NewsArticle[] = NEWS_ARTICLES;

export function getArticlesByBatch(batch: number): NewsArticle[] {
  return NEWS_ARTICLES.filter((a) => a.weekBatch === batch);
}

export function getArticlesByCategory(cat: NewsCategoryKey): NewsArticle[] {
  return NEWS_ARTICLES.filter((a) => a.category === cat);
}
