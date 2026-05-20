/**
 * Gut Reset engine
 *
 * Content is grounded in guidance from Harvard Health, Mayo Clinic,
 * American Gastroenterological Association (AGA), and Cleveland Clinic.
 *
 * IMPORTANT: Nothing here constitutes medical advice or diagnosis.
 * All language is wellness-framing. Red-flag symptoms always direct
 * users to a clinician, never to the app.
 */

// ── Daily rotating nudge ──────────────────────────────────────────────────
export const GUT_NUDGES = [
  "Add one fiber food today — oats, beans, berries, lentils, or vegetables.",
  "Try one fermented food if it works for you — yogurt, kefir, kimchi, miso, or sauerkraut.",
  "Hydrate before adding more fiber so your digestion has support.",
  "A 10-minute walk after a meal can help digestion. Notice how your stomach feels.",
  "If bloating is high today, keep meals simple and log triggers without judgment.",
  "Garlic, onions, oats, and green bananas are prebiotic foods that feed helpful gut bacteria.",
  "Aim for 25–30g of fiber from whole foods before reaching for supplements.",
  "Stress directly affects gut function. Check in on how you're feeling today beyond the physical.",
];

export function getDailyGutNudge() {
  const idx = new Date().getDay();
  return GUT_NUDGES[idx % GUT_NUDGES.length];
}

// ── Check-in options ──────────────────────────────────────────────────────
export const CHECK_IN_FIELDS = [
  {
    key: "bloating",
    label: "Bloating",
    options: ["None", "Mild", "Moderate", "High"],
  },
  {
    key: "comfort",
    label: "Stomach comfort",
    options: ["Calm", "Heavy", "Crampy", "Gassy"],
  },
  {
    key: "bathroom",
    label: "Bathroom pattern",
    options: ["Normal", "Constipation", "Loose", "Skipped"],
  },
  {
    key: "energy",
    label: "Energy after meals",
    options: ["Steady", "Sleepy", "Uncomfortable"],
  },
  {
    key: "hydration",
    label: "Hydration",
    options: ["Low", "Okay", "Good"],
  },
  {
    key: "stress",
    label: "Stress level",
    options: ["Low", "Medium", "High"],
  },
];

// ── Trigger options ───────────────────────────────────────────────────────
// Source: Mayo Clinic bloating/gas guide; AGA IBS guidance
export const TRIGGERS = [
  "High stress", "Poor sleep", "Large meal", "Spicy food", "High-fat meal",
  "Carbonated drink", "Alcohol", "Caffeine", "Dairy", "Gluten/wheat",
  "Beans or legumes", "Raw vegetables", "Artificial sweeteners",
  "Cycle symptoms", "Hard workout",
];

// ── Gut comfort score ─────────────────────────────────────────────────────
// Soft wellness indicator — NOT a medical score, not diagnostic.
const PENALTIES = {
  bloating:  { none:0, mild:8, moderate:18, high:28 },
  comfort:   { calm:0, heavy:10, crampy:18, gassy:12 },
  bathroom:  { normal:0, constipation:12, loose:12, skipped:8 },
  stress:    { low:0, medium:8, high:16 },
};
const BONUSES = {
  hydration: { low:0, okay:5, good:10 },
};

export function calcGutScore(log) {
  if (!log || Object.keys(log).length < 4) return null;
  const lower = (v) => (v || "").toLowerCase();
  const penalty =
    (PENALTIES.bloating[lower(log.bloating)]  ?? 10) +
    (PENALTIES.comfort[lower(log.comfort)]     ?? 8)  +
    (PENALTIES.bathroom[lower(log.bathroom)]   ?? 6)  +
    (PENALTIES.stress[lower(log.stress)]       ?? 6);
  const bonus = BONUSES.hydration[lower(log.hydration)] ?? 0;
  return Math.max(0, Math.min(100, 100 - penalty + bonus));
}

export function getScoreLabel(score) {
  if (score === null) return null;
  if (score >= 80) return { label: "Feeling comfortable",   color: "#9bd8b4" };
  if (score >= 65) return { label: "Mild discomfort",       color: "#f2bd73" };
  if (score >= 45) return { label: "Noticeable symptoms",   color: "#f2bd73" };
  return              { label: "High discomfort today",    color: "#d98aa8" };
}

// ── Core content cards ────────────────────────────────────────────────────
// Grounded in Harvard Health, Mayo Clinic, AGA, Cleveland Clinic guidance.
export const GUT_CONTENT = [
  {
    id: "fiber",
    icon: "🌾",
    title: "Fiber",
    summary: "Fiber feeds your gut ecosystem. Add it gradually through whole foods.",
    detail: "Vegetables, whole grains, oats, beans, lentils, berries, and chia seeds support digestion, LDL cholesterol, and microbiome diversity. Supplements are optional — whole foods should come first.",
    chips: ["Oats", "Lentils", "Beans", "Berries", "Chia", "Vegetables", "Whole grains"],
    caution: "Increase fiber gradually. A sudden large increase can worsen gas or bloating, especially for those with IBS-like symptoms.",
  },
  {
    id: "fermented",
    icon: "🫙",
    title: "Fermented foods",
    summary: "Fermented foods can support microbiome diversity.",
    detail: "Yogurt, kefir, kimchi, sauerkraut, miso, and tempeh contain live bacteria and can support a healthy gut microbiome. Food-first is generally a better starting point than probiotic supplements.",
    chips: ["Yogurt", "Kefir", "Kimchi", "Sauerkraut", "Miso", "Tempeh"],
    caution: "\"Try if it works for your body\" is the right framing — some people are sensitive to fermented foods.",
  },
  {
    id: "prebiotic",
    icon: "🧅",
    title: "Prebiotic foods",
    summary: "Prebiotics are fibers that feed helpful gut bacteria.",
    detail: "Apples, artichokes, green bananas, oats, beans, garlic, onions, asparagus, and leeks are all prebiotic-rich. Add them gradually if you're sensitive to bloating.",
    chips: ["Garlic", "Onions", "Green banana", "Artichoke", "Asparagus", "Oats", "Leeks"],
    caution: "Go slow if you notice bloating — your gut bacteria need time to adapt.",
  },
  {
    id: "probiotics",
    icon: "🔬",
    title: "Probiotic reality check",
    summary: "Probiotics are strain-specific and not one-size-fits-all.",
    detail: "The American Gastroenterological Association (AGA) notes that most probiotic strains lack enough clinical evidence for specific conditions. Food-first is a safer starting point. Talk to a clinician before using supplements for ongoing symptoms.",
    chips: [],
    caution: "The app does not recommend specific probiotic supplements. If you have ongoing digestive symptoms, speak with a clinician.",
    isCaution: true,
  },
];

// ── Red flag content ──────────────────────────────────────────────────────
export const RED_FLAGS = [
  "Blood in stool",
  "Black or tarry stool",
  "Unexplained weight loss",
  "Severe abdominal pain",
  "Persistent diarrhea",
  "Persistent constipation",
  "Vomiting blood",
  "Symptoms that wake you at night",
];
