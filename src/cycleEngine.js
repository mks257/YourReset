export const PHASES = {
  menstrual: {
    label: "Restore & Renew", color: "#ff6b9d", intensity: "low",
    setsReps: "2–3 × 12–15 at 40–60% effort", cardio: "Zone 1–2",
    tip: "Honor your body. Gentle movement reduces cramps and keeps energy steady. Prioritize iron-rich foods and hydration.",
    nutrition: "Iron, omega-3s, magnesium, hydration. Limit caffeine.",
  },
  follicular: {
    label: "Build & Challenge", color: "#38d9c0", intensity: "high",
    setsReps: "3–5 × 4–8 at 70–85% effort", cardio: "Zone 3–5",
    tip: "Estrogen is rising — this is your best window for heavy lifting, HIIT, and hard cardio. Push it.",
    nutrition: "Carbohydrates and pre/post-workout fueling. Great time for PRs.",
  },
  ovulatory: {
    label: "Peak & Power", color: "#ffb347", intensity: "peak",
    setsReps: "3–5 × 3–6 at 80–90% effort", cardio: "Zone 4–5",
    tip: "Peak strength window. Warm up thoroughly — ACL risk is elevated mid-cycle. Great for power and sprints.",
    nutrition: "Protein, calcium, magnesium, light pre-workout fueling.",
  },
  luteal_early: {
    label: "Sustain & Stabilize", color: "#b48bfa", intensity: "moderate",
    setsReps: "3–4 × 10–15 at 60–75% effort", cardio: "Zone 2–3",
    tip: "Maintain your gains. Progesterone rises — steady-state cardio and technique work feel great now.",
    nutrition: "Protein, complex carbs, magnesium, omega-3s, electrolytes.",
  },
  luteal_late: {
    label: "Wind Down & Recover", color: "#6b6a88", intensity: "low",
    setsReps: "2–3 × 12–15 at 50–65% effort", cardio: "Zone 1–2",
    tip: "Deload if symptoms rise. Appetite increase is normal — +200–500 kcal may be physiologically driven. Rest is training.",
    nutrition: "Honor hunger. Hydration, electrolytes, magnesium.",
  },
};

export const PHASE_EMOJI = {
  menstrual: "🌑", follicular: "🌱", ovulatory: "⚡",
  luteal_early: "🍂", luteal_late: "🌙",
};

export function getCycleState(cycleStartDate, cycleLength = 28) {
  if (!cycleStartDate) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const start = new Date(cycleStartDate); start.setHours(0, 0, 0, 0);
  const elapsed = Math.floor((today - start) / 86400000);
  if (elapsed < 0) return null;
  const dayOfCycle = (elapsed % cycleLength) + 1;

  let phase;
  if (dayOfCycle <= 5) phase = 'menstrual';
  else if (dayOfCycle <= 13) phase = 'follicular';
  else if (dayOfCycle <= 16) phase = 'ovulatory';
  else if (dayOfCycle <= 23) phase = 'luteal_early';
  else phase = 'luteal_late';

  return { dayOfCycle, phase, cycleLength, ...PHASES[phase] };
}

// Returns how many sets to suggest based on phase + readiness
export function adaptVolume(parsedSets, intensity, readiness) {
  let mod = 1;
  if (readiness) {
    if (readiness.energy <= 2 || readiness.soreness === 'high') mod = 0.7;
    else if (readiness.energy >= 4 && (intensity === 'high' || intensity === 'peak')) mod = 1.1;
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
  if (intensity === 'peak' && exType === 'Strength') return "Peak window — attempt a PR if you feel ready";
  if (intensity === 'low' && exType === 'Fat Burn') return "Keep cardio in Zone 1–2 today";
  return null;
}
