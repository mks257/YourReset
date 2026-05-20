/**
 * Cycle engine — phase calculation, phase content, and adaptation rules.
 *
 * Phase window logic:
 *   Ovulation estimated at cycleLength - 14 (luteal is consistently ~14 days).
 *   For 28-day cycle: ovulation day 14, follicular 6–13, ovulatory 14–16.
 *   For 32-day cycle: ovulation day 18, follicular 6–17, ovulatory 18–20.
 *   Menstrual is fixed at days 1–5.
 *
 * Science sourcing:
 *   - Follicular performance edge: evidence suggests benefit; 2025 McMaster
 *     study found no difference in MPS between phases — honest caveat included.
 *   - ACL risk: estrogen → ligament laxity with 2–3 day delay (Frontiers 2022).
 *   - Luteal late BMR: progesterone elevates BMR +200–500 kcal (PMC7916245).
 *   - PMS exercise: aerobic 20–30 min reduces negative affect (SMD=-0.81, PMC12874746).
 *   - Magnesium for PMS: best evidence base among nutritional interventions.
 *   - PCOS: HIIT + combined training best-evidenced (PMC7358428).
 */

// ── Variable phase windows ────────────────────────────────────────────────
export function getPhaseWindows(cycleLength) {
  const ovDay = Math.max(10, cycleLength - 14); // estimated ovulation day
  return {
    menstrual:    [1,         5],
    follicular:   [6,         ovDay - 1],
    ovulatory:    [ovDay,     ovDay + 2],
    luteal_early: [ovDay + 3, ovDay + 9],
    luteal_late:  [ovDay + 10, cycleLength],
  };
}

// ── Phase content — science-grounded, honest framing ─────────────────────
export const PHASES = {
  menstrual: {
    label: "Restore & Renew",
    color: "#d98aa8",
    intensity: "low",
    setsReps: "2–3 × 12–15 at 40–60% effort",
    cardio: "Zone 1–2",
    tip: "Light aerobic activity — 10–20 min walks or gentle yoga — can actively reduce cramp severity by lowering prostaglandin activity. Honor symptoms; rest is also valid.",
    nutrition: "Iron + vitamin C (enhances absorption) if bleeding is heavy. Omega-3s and magnesium have the best evidence for reducing cramp severity. Limit caffeine.",
    science: "Exercise reduces prostaglandin activity → less cramping. Iron + vit C absorption is evidence-based for heavy periods.",
    workouts: ["Gentle yoga", "10-min walks", "Breathwork", "Light stretching"],
  },
  follicular: {
    label: "Build & Challenge",
    color: "#9bd8b4",
    intensity: "high",
    setsReps: "3–5 × 4–8 at 70–85% effort",
    cardio: "Zone 3–5",
    tip: "Research suggests this may be your best window for strength — rising estrogen supports neuromuscular efficiency and muscle protein synthesis. Individual responses vary significantly. Track your own readiness over time.",
    honestCaveat: "A 2025 McMaster study found no measurable difference in muscle protein synthesis between cycle phases. The performance edge is real for many — but not universal. Your readiness signals matter most.",
    nutrition: "Pre/post-workout protein and complex carbs are well-timed here. Cruciferous vegetables support estrogen balance.",
    science: "Late follicular (high E2, low P4) is the strongest phase for strength — but evidence is mixed. Readiness-based training outperforms rigid phase rules.",
    workouts: ["Heavy lifting", "HIIT", "PR attempts", "Long runs"],
  },
  ovulatory: {
    label: "Peak & Power",
    color: "#f2bd73",
    intensity: "peak",
    setsReps: "3–5 × 3–6 at 80–90% effort",
    cardio: "Zone 4–5",
    tip: "Strong window for peak efforts — if readiness is high. Warm up thoroughly: estrogen peaks trigger ligament laxity with a 2–3 day delay, increasing ACL injury risk. Dynamic warm-up is your main protection.",
    aclNote: "Estrogen surge → ligament laxity increases → elevated ACL risk around days 13–15. This is well-evidenced. A thorough dynamic warm-up (hip circles, leg swings, controlled squats) significantly reduces that risk.",
    nutrition: "Antioxidant-rich foods (berries, leafy greens) and zinc-rich foods (pumpkin seeds) support this phase. Moderate salt and hydrate well.",
    science: "Estrogen → knee laxity with 2–3 day delay (Frontiers Physiology 2022). Dynamic warm-up reduces ACL injury risk.",
    workouts: ["Max effort", "Full body", "Plyometrics", "Sprint intervals"],
  },
  luteal_early: {
    label: "Sustain & Stabilize",
    color: "#b79cff",
    intensity: "moderate",
    setsReps: "3–4 × 10–15 at 60–75% effort",
    cardio: "Zone 2–3",
    tip: "Progesterone rises — fat oxidation increases, making Zone 2 steady-state feel natural. Protein timing matters more now; progesterone can promote muscle breakdown, so pre/post-workout protein is especially important.",
    nutrition: "Protein every 3–4 hours matters more here. Complex carbs and fiber for stable serotonin. Magnesium and omega-3s.",
    science: "Progesterone elevates fat oxidation → Zone 2 feels good. Protein catabolism increases → protein timing matters more.",
    workouts: ["Moderate strength", "Steady-state cardio", "Pilates", "Technique work"],
  },
  luteal_late: {
    label: "Wind Down & Recover",
    color: "#8b7fa8",
    intensity: "low",
    setsReps: "2–3 × 12–15 at 50–65% effort",
    cardio: "Zone 1–2",
    tip: "Progesterone raises your BMR — appetite increase of +200–500 kcal is physiologically driven, not a willpower failure. Aerobic exercise (even 20–30 min) has strong evidence for reducing PMS mood symptoms and physical discomfort.",
    deloadNote: "Deload is active recovery, not skipping — mobility and low-load strength maintain neural patterns and exercise habits without taxing your recovery system.",
    nutrition: "Magnesium-rich foods (dark chocolate, nuts, seeds, dark leafy greens) have the best evidence for reducing PMS cramping and mood shifts. Honor hunger — the calorie increase is real.",
    science: "Aerobic exercise reduces PMS negative affect (SMD=−0.81, p<0.01 meta-analysis). Magnesium: strongest nutritional evidence for PMS cramping.",
    workouts: ["Mobility", "Low-impact cardio", "Deload strength", "Restorative yoga"],
  },
};

export const PHASE_EMOJI = {
  menstrual: "🌑", follicular: "🌱", ovulatory: "⚡",
  luteal_early: "🍂", luteal_late: "🌙",
};

// PCOS-specific guidance
export const PCOS_GUIDANCE = {
  title: "PCOS & Irregular Cycle Mode",
  tip: "For PCOS and irregular cycles, phase-based programming is less applicable. Consistency matters more than phase timing.",
  recommendations: [
    "HIIT and combined (strength + aerobic) training have the best evidence for improving hormonal balance and menstrual regularity in PCOS.",
    "A minimum of 120 min/week of vigorous exercise is supported for favorable metabolic outcomes.",
    "Resistance training improves insulin sensitivity — prioritize it over cardio-only approaches.",
    "Track symptoms rather than phases: energy, cramps, mood, and soreness guide your intensity each day.",
  ],
  nutrition: "Lower glycemic index carbs, adequate protein, and omega-3s are best-evidenced for PCOS symptom management.",
};

// ── Phase calculation ─────────────────────────────────────────────────────
export function getCycleState(cycleStartDate, cycleLength = 28) {
  if (!cycleStartDate) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const start = new Date(cycleStartDate); start.setHours(0, 0, 0, 0);
  const elapsed = Math.floor((today - start) / 86400000);
  if (elapsed < 0) return null;

  const dayOfCycle = (elapsed % cycleLength) + 1;
  const windows = getPhaseWindows(cycleLength);

  let phase = 'luteal_late';
  for (const [p, [lo, hi]] of Object.entries(windows)) {
    if (dayOfCycle >= lo && dayOfCycle <= hi) { phase = p; break; }
  }

  return { dayOfCycle, phase, cycleLength, windows, ...PHASES[phase] };
}

// ── Readiness & Adaptation ────────────────────────────────────────────────
export function getReadinessScore(r) {
  if (!r) return null;
  const map = { 
    poor: 1, ok: 3, good: 5, 
    none: 5, mild: 3, high: 1, 
    low: 1, neutral: 3,
    // Handle numeric strings or numbers directly
    "1": 1, "2": 2, "3": 3, "4": 4, "5": 5
  };
  
  const energy = Number(r.energy) || 1;
  const sleep = (typeof r.sleep === 'number' ? r.sleep : map[r.sleep?.toLowerCase()]) || 3;
  const sore = (typeof r.soreness === 'number' ? 6 - r.soreness : map[r.soreness?.toLowerCase()]) || 3;
  const cramps = (typeof r.cramps === 'number' ? 6 - r.cramps : map[r.cramps?.toLowerCase()]) || 5;
  const mood = (typeof r.mood === 'number' ? r.mood : map[r.mood?.toLowerCase()]) || 3;
  
  // Normalize to a 1-5 scale for each where 5 is best
  // energy: 1-5 (5 is high energy)
  // sleep: 1-5 (5 is good sleep)
  // sore: if number 1-5 (1 is none, 5 is high), so 6-value makes it 5 is none.
  // cramps: if number 1-5 (1 is none, 5 is high), so 6-value makes it 5 is none.
  // mood: 1-5 (5 is high/good mood)
  
  const raw = energy + sleep + sore + cramps + mood;
  return Math.round((raw / 25) * 10); // 1–10 scale
}

export function getAdjustedIntensity(original, score) {
  const levels = ["low", "moderate", "high", "peak"];
  const idx = levels.indexOf(original);
  if (idx === -1) return original;

  if (score <= 4) return levels[Math.max(0, idx - 2)];
  if (score <= 6) return levels[Math.max(0, idx - 1)];
  if (score >= 9 && idx < levels.length - 1) return levels[idx + 1];
  return original;
}

export function buildReadinessNote(original, adjusted, score) {
  if (score <= 4) return "Readiness is low. Plan significantly dialed back for recovery.";
  if (score <= 6) return "Energy is modest. Intensity reduced to match your signals.";
  if (adjusted !== original && score >= 9) return "Readiness is peak. Today is a great day to push harder.";
  if (score >= 8) return "Strong readiness today. You're clear for the full plan.";
  return "Plan balanced based on your morning check-in.";
}

export function adaptVolume(parsedSets, intensity, readiness) {
  let mod = 1;
  const score = getReadinessScore(readiness);
  
  if (score !== null) {
    if (score <= 4) mod = 0.6;
    else if (score <= 6) mod = 0.8;
    else if (score >= 9) mod = 1.1;
  }
  
  if (intensity === 'low') mod = Math.min(mod, 0.8);
  return Math.max(1, Math.round(parsedSets * mod));
}

export function parseSets(setsStr) {
  const m = setsStr.match(/^(\d+)[×x]/);
  return m ? parseInt(m[1]) : null;
}

export function buildPhaseNote(exType, intensity) {
  if (intensity === 'low' && exType === 'Strength') return "Lighter weight today — focus on form over load";
  if (intensity === 'peak' && exType === 'Strength') return "Peak window — attempt a PR if readiness is high";
  if (intensity === 'low' && exType === 'Fat Burn') return "Keep cardio in Zone 1–2 today";
  return null;
}

// Format day range from windows for display
export function phaseLabel(windows, phase, cycleLength) {
  const w = windows[phase];
  if (!w) return "";
  const [lo, hi] = w;
  return lo === hi ? `Day ${lo}` : `Days ${lo}–${Math.min(hi, cycleLength)}`;
}
