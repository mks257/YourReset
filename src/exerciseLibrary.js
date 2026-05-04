/**
 * Exercise library — free-exercise-db integration
 *
 * Source: github.com/yuhonas/free-exercise-db (public domain, 800+ exercises)
 * JSON schema per exercise:
 *   { id, name, force, level, mechanic, equipment,
 *     primaryMuscles[], secondaryMuscles[], instructions[], category, images[] }
 *
 * Architecture:
 *   Module-scope cache so 1.5MB JSON fetches once per session.
 *   getExerciseDB() is async; all callers await it.
 *   buildDayExercises() is the main filter+convert entry point.
 */

const DB_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";

// ── Module-scope cache — fetches once, never re-fetches ───────────────────
let _cache = null;
let _loading = false;
let _listeners = [];

export async function getExerciseDB() {
  if (_cache) return _cache;
  if (_loading) {
    // Coalesce concurrent calls into one promise
    return new Promise(resolve => _listeners.push(resolve));
  }
  _loading = true;
  try {
    const res = await fetch(DB_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    _cache = await res.json();
  } catch (e) {
    console.warn("free-exercise-db fetch failed — using static fallback", e.message);
    _cache = [];
  }
  _loading = false;
  _listeners.forEach(r => r(_cache));
  _listeners = [];
  return _cache;
}

export function getExerciseDBSync() { return _cache; }
export function isDBReady() { return _cache !== null; }

// ── Equipment mapping ─────────────────────────────────────────────────────
// Maps profile.equipment IDs → db.equipment string values
const EQUIP_MAP = {
  bodyweight: ["body only", "other"],
  dumbbells:  ["dumbbell"],
  barbell:    ["barbell"],
  cable:      ["cable"],
  machines:   ["machine"],
  kettlebell: ["kettlebell"],
  bands:      ["bands"],
  cardio:     ["body only"],    // cardio exercises are mostly bodyweight in the DB
};

function resolveEquipment(profileEquipment) {
  const resolved = new Set(["body only"]); // always include bodyweight
  (profileEquipment || []).forEach(e => {
    (EQUIP_MAP[e] || []).forEach(d => resolved.add(d));
  });
  return resolved;
}

// ── Phase → exercise category preferences ─────────────────────────────────
// DB categories: strength | stretching | plyometrics | powerlifting |
//                cardio | olympic weightlifting
const PHASE_CATEGORIES = {
  menstrual:    ["stretching", "strength"],
  follicular:   ["strength", "powerlifting"],
  ovulatory:    ["strength", "plyometrics", "powerlifting"],
  luteal_early: ["strength", "cardio"],
  luteal_late:  ["stretching", "strength"],
};

const GOAL_CATEGORIES = {
  fat_loss:    ["strength", "cardio", "plyometrics"],
  strength:    ["strength", "powerlifting", "olympic weightlifting"],
  wellness:    ["strength", "stretching", "cardio"],
  endurance:   ["cardio", "strength"],
  muscle_tone: ["strength"],
  flexibility: ["stretching", "strength"],
};

// ── Animation key fuzzy mapping ───────────────────────────────────────────
// Maps from exercise properties → one of our ~25 anim keys in ExerciseAnimation
function getAnimKey(ex) {
  const n  = ex.name.toLowerCase();
  const m  = ex.primaryMuscles.join(" ").toLowerCase();
  const c  = ex.category.toLowerCase();

  if (n.includes("squat") || n.includes("goblet"))                    return "gobletSquat";
  if (n.includes("lunge") || n.includes("split squat"))               return "lunge";
  if (n.includes("deadlift") || n.includes("rdl") || n.includes("romanian")) return "rdl";
  if (n.includes("hip thrust") || n.includes("glute bridge"))         return "hipThrust";
  if (n.includes("cable kickback") || n.includes("donkey kick"))      return "cableKickback";
  if (n.includes("step-up") || n.includes("step up"))                 return "stepUp";
  if (n.includes("push-up") || n.includes("push up") || n.includes("pushup")) return "pushup";
  if (n.includes("plank") || n.includes("hollow body"))               return "plank";
  if (n.includes("mountain climber"))                                  return "mountainClimber";
  if (n.includes("burpee"))                                            return "burpee";
  if (n.includes("russian twist") || n.includes("oblique"))           return "russianTwist";
  if (n.includes("leg raise") || n.includes("leg lift"))              return "legRaise";
  if ((n.includes("press") || n.includes("fly")) && m.includes("chest")) return "chestPress";
  if (n.includes("fly") && m.includes("chest"))                       return "chestFly";
  if (n.includes("incline") && m.includes("chest"))                   return "inclinePress";
  if ((n.includes("press") || n.includes("overhead")) && m.includes("shoulder")) return "shoulderPress";
  if (n.includes("lateral raise") || n.includes("side raise"))        return "lateralRaise";
  if (n.includes("face pull"))                                         return "facePull";
  if (n.includes("pulldown") || n.includes("pull-down"))              return "latPulldown";
  if (n.includes("row") && !n.includes("dumbbell"))                   return "seatedRow";
  if (n.includes("row"))                                               return "dbRow";
  if (n.includes("curl") && m.includes("bicep"))                      return "bicepCurl";
  if (n.includes("hammer curl"))                                       return "hammerCurl";
  if (n.includes("tricep") || n.includes("skull crusher"))            return "tricepExtension";
  if (n.includes("kb swing") || n.includes("kettlebell swing"))       return "kbSwing";
  if (n.includes("jump") && n.includes("squat"))                      return "jumpSquat";
  if (c.includes("plyo") || n.includes("jump"))                       return "jumpSquat";
  if (c.includes("stretch") || n.includes("yoga") || n.includes("cat-cow")) return "catCow";
  if (n.includes("pigeon"))                                            return "pigeonPose";
  if (n.includes("child") || n.includes("cobra"))                     return "childPose";
  if (n.includes("treadmill") || n.includes("running") || n.includes("jog")) return "treadmill";
  if (n.includes("incline walk") || n.includes("incline treadmill"))  return "inclineWalk";
  if (n.includes("stairmaster") || n.includes("stair"))               return "stairmaster";
  if (n.includes("rowing machine"))                                    return "rowingMachine";
  if (n.includes("jump rope"))                                         return "jumpRope";
  if (n.includes("jumping jack"))                                      return "jumpingJacks";
  // Muscle-group fallbacks
  if (m.includes("chest"))     return "chestPress";
  if (m.includes("lats") || m.includes("back"))  return "dbRow";
  if (m.includes("quad"))      return "gobletSquat";
  if (m.includes("glute"))     return "hipThrust";
  if (m.includes("bicep"))     return "bicepCurl";
  if (m.includes("tricep"))    return "tricepExtension";
  if (m.includes("shoulder"))  return "shoulderPress";
  if (m.includes("abdom") || m.includes("core")) return "plank";
  return "gobletSquat"; // safe default
}

// ── Kcal estimation ───────────────────────────────────────────────────────
function estimateKcal(ex) {
  const c = ex.category.toLowerCase();
  const m = ex.mechanic?.toLowerCase() || "";
  if (c.includes("cardio"))                     return 90;
  if (c.includes("plyo"))                       return 75;
  if (c.includes("powerlifting") || c.includes("olympic")) return 65;
  if (c.includes("strength") && m === "compound") return 55;
  if (c.includes("strength"))                   return 35;
  if (c.includes("stretch"))                    return 10;
  return 40;
}

// ── Sets/reps generation from phase ──────────────────────────────────────
function generateSetsReps(phaseOrGoal, category) {
  if (category === "stretching") return { sets: "3 × 45s", reps: "45s" };
  if (category === "cardio")     return { sets: "15 min",  reps: "continuous" };

  // Phase intensity presets
  const presets = {
    menstrual:    { sets: 2, reps: 15 },
    follicular:   { sets: 4, reps: 8  },
    ovulatory:    { sets: 4, reps: 6  },
    luteal_early: { sets: 3, reps: 12 },
    luteal_late:  { sets: 2, reps: 15 },
    fat_loss:     { sets: 3, reps: 15 },
    strength:     { sets: 4, reps: 6  },
    wellness:     { sets: 3, reps: 12 },
    endurance:    { sets: 2, reps: 20 },
    muscle_tone:  { sets: 3, reps: 12 },
    flexibility:  { sets: 2, reps: 12 },
  };

  const p = presets[phaseOrGoal] || { sets: 3, reps: 12 };
  return { sets: `${p.sets}×${p.reps}`, reps: `${p.reps}` };
}

// ── Exercise type label ───────────────────────────────────────────────────
function getType(ex, phaseIntensity) {
  const c = ex.category.toLowerCase();
  if (c.includes("stretch"))  return "Flexibility";
  if (c.includes("cardio"))   return "Fat Burn";
  if (c.includes("plyo"))     return "Fat Burn";
  if (phaseIntensity === "peak" || phaseIntensity === "high") return "Strength";
  if (phaseIntensity === "low") return "Toning";
  return "Strength";
}

// ── Convert DB exercise to our schema ────────────────────────────────────
function toSchema(ex, phaseOrGoal, phaseIntensity) {
  const cat  = ex.category.toLowerCase();
  const sr   = generateSetsReps(phaseOrGoal, cat);
  return {
    id:     ex.id,
    name:   ex.name,
    sets:   sr.sets,
    reps:   sr.reps,
    kcal:   estimateKcal(ex),
    muscle: ex.primaryMuscles.slice(0, 2).join(", "),
    type:   getType(ex, phaseIntensity),
    anim:   getAnimKey(ex),
    tip:    (ex.instructions?.[0] || "Focus on controlled form throughout the movement.").slice(0, 160),
  };
}

// ── Main filter function ──────────────────────────────────────────────────
/**
 * Build a list of exercises for one workout day.
 *
 * @param {object} opts
 *   phase       — current cycle phase key or null
 *   goal        — profile.goal
 *   equipment   — profile.equipment array
 *   muscles     — primary muscle groups for this day (e.g. ["chest","triceps"])
 *   dayCategory — forced category override (e.g. "stretching" for recovery day)
 *   count       — target number of exercises (default 5)
 *   level       — "beginner"|"intermediate"|"expert" (default: all)
 *   seed        — integer seed for deterministic shuffle per day (default: dayIndex)
 *   excludeIds  — Set of exercise IDs already used on adjacent days
 */
export function buildDayExercises({
  phase, goal, equipment, muscles, dayCategory,
  count = 5, level = null, seed = 0, excludeIds = null,
}) {
  const db = getExerciseDBSync();
  if (!db || db.length === 0) return [];

  const preferredCats = dayCategory
    ? [dayCategory]
    : (phase ? PHASE_CATEGORIES[phase] : GOAL_CATEGORIES[goal]) || ["strength"];

  const allowedEquip = resolveEquipment(equipment);
  const phaseIntensity = phase ? (
    { menstrual:"low", follicular:"high", ovulatory:"peak", luteal_early:"moderate", luteal_late:"low" }[phase]
  ) : "moderate";

  // Filter
  let candidates = db.filter(ex => {
    // Exclude exercises already used on adjacent days
    if (excludeIds && excludeIds.has(ex.id)) return false;
    // Equipment
    if (!allowedEquip.has(ex.equipment)) return false;
    // Category match
    if (!preferredCats.some(c => ex.category.toLowerCase().includes(c))) return false;
    // Muscle group match (if specified)
    if (muscles && muscles.length > 0) {
      const hasTarget = muscles.some(m =>
        ex.primaryMuscles.some(pm => pm.toLowerCase().includes(m.toLowerCase()))
      );
      if (!hasTarget) return false;
    }
    // Level filter
    if (level && ex.level !== level) return false;
    return true;
  });

  // If exclusions left us too few, relax them (avoid empty days)
  if (candidates.length < count && excludeIds) {
    candidates = db.filter(ex => {
      if (!allowedEquip.has(ex.equipment)) return false;
      if (!preferredCats.some(c => ex.category.toLowerCase().includes(c))) return false;
      if (muscles && muscles.length > 0) {
        if (!muscles.some(m => ex.primaryMuscles.some(pm => pm.toLowerCase().includes(m.toLowerCase())))) return false;
      }
      return true;
    });
  }

  // Deterministic shuffle per day so exercises don't change on every re-render
  // (uses seeded Fisher-Yates with seed derived from day index + week key)
  candidates = deterministicShuffle(candidates, seed);

  // Take count exercises, trying to hit each muscle group at least once
  const selected = [];
  const coveredMuscles = new Set();

  // First pass: one exercise per muscle group
  if (muscles && muscles.length > 0) {
    for (const m of muscles) {
      const match = candidates.find(ex =>
        ex.primaryMuscles.some(pm => pm.toLowerCase().includes(m.toLowerCase())) &&
        !selected.includes(ex)
      );
      if (match) { selected.push(match); coveredMuscles.add(m); }
      if (selected.length >= count) break;
    }
  }

  // Second pass: fill remaining slots
  for (const ex of candidates) {
    if (selected.length >= count) break;
    if (!selected.includes(ex)) selected.push(ex);
  }

  const phaseOrGoal = phase || goal || "wellness";
  return selected.map(ex => toSchema(ex, phaseOrGoal, phaseIntensity));
}

// ── Exercise substitution ─────────────────────────────────────────────────
/**
 * Find alternative exercises for a given exercise slot.
 * Matches on same primaryMuscles + user equipment, excludes the current exercise.
 * Used by the "Find alternatives" substitution UI.
 */
export function findAlternatives({ exercise, equipment, count = 5, excludeId = null }) {
  const db = getExerciseDBSync();
  if (!db || db.length === 0) return [];

  const allowedEquip = resolveEquipment(equipment);
  const targetMuscles = exercise.primaryMuscles || [];
  const targetCat     = exercise.category?.toLowerCase() || "strength";

  const matches = db.filter(ex => {
    if (ex.id === (excludeId || exercise.id)) return false;
    if (!allowedEquip.has(ex.equipment)) return false;
    // Same or compatible category
    const catMatch = ex.category.toLowerCase() === targetCat ||
      (targetCat === "strength" && ex.category.toLowerCase() === "powerlifting");
    if (!catMatch) return false;
    // Must share at least one primary muscle
    return targetMuscles.some(m =>
      ex.primaryMuscles.some(pm => pm.toLowerCase().includes(m.toLowerCase()))
    );
  });

  // Prefer same difficulty level, then fill with others
  const same  = matches.filter(ex => ex.level === exercise.level);
  const other = matches.filter(ex => ex.level !== exercise.level);
  const pool  = [...same, ...other].slice(0, count * 4);

  // Random sample without seed (each call gives fresh options)
  const shuffled = pool.sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);

  return selected.map(ex => toSchema(ex, null, "moderate"));
}

// Seeded pseudo-random shuffle (mulberry32)
function deterministicShuffle(arr, seed) {
  const copy = [...arr];
  let s = seed + 1;
  const rand = () => { s |= 0; s = s + 0x6d2b79f5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
