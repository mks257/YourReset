import { useState, useMemo } from "react";
import { getFuelLog, setFuelLog, getTodayKey } from "../storage";
import { NUTRITION_PHASES, getDailyNudge, GOAL_NUTRITION, GOAL_NUTRITION_EXTRA, getGoalNudge } from "../nutritionEngine";
import { PHASE_EMOJI } from "../cycleEngine";
import { useCountUp } from "./MotionHooks";

// ── TDEE calculation (Mifflin-St Jeor) ───────────────────────────────────
const ACTIVITY_FACTORS = {
  sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
};
const GOAL_ADJUSTMENTS = {
  fat_loss: 0.80, muscle_tone: 1.0, strength: 1.10,
  endurance: 1.05, wellness: 1.0, flexibility: 1.0,
};
const PHASE_KCAL_DELTA = {
  luteal_late: { delta: 250, note: "Late luteal phase increases energy needs. +250 kcal added to your budget." },
  menstrual:   { delta: 0,   note: null },
};
const PHASE_MEAL_GUIDANCE = {
  follicular:   "High protein + complex carbs — your body absorbs nutrients efficiently now.",
  ovulatory:    "Lean protein and whole foods — peak energy, keep it clean.",
  luteal_early: "Complex carbs to sustain energy as progesterone rises.",
  luteal_late:  "Magnesium-rich foods + higher carbs help ease cravings and support mood.",
  menstrual:    "Warming, iron-rich foods — prioritise replenishment over restriction.",
};
const PHASE_WATER_NOTE = {
  menstrual: "Increase hydration during menstruation — aim for an extra 500 ml today.",
  luteal_late: "Higher progesterone can cause water retention — keep sipping consistently.",
};
const MEAL_META = {
  breakfast: { emoji: "☀️", label: "Breakfast" },
  lunch:     { emoji: "🌿", label: "Lunch" },
  dinner:    { emoji: "🌙", label: "Dinner" },
  snack:     { emoji: "🫐", label: "Snacks" },
};

function computeTDEE(profile) {
  const weight = Number(profile.weight) || 65;
  const height = Number(profile.height) || 165;
  const age    = Number(profile.age)    || 28;
  const gender = profile.gender || "female";

  // Clamp to prevent impossible TDEE from unit mismatches
  const wKg = Math.min(300, profile.weightUnit === "lb" ? weight * 0.453592 : weight);
  const hCm = Math.min(250, profile.heightUnit === "ft" ? height * 2.54 : height);

  let bmr;
  if (gender === "male")        bmr = 10 * wKg + 6.25 * hCm - 5 * age + 5;
  else if (gender === "female") bmr = 10 * wKg + 6.25 * hCm - 5 * age - 161;
  else                          bmr = 10 * wKg + 6.25 * hCm - 5 * age - 78; // non-binary avg

  const factor = ACTIVITY_FACTORS[profile.activityLevel] || 1.55;
  const goalAdj = GOAL_ADJUSTMENTS[profile.goal] || 1.0;

  return Math.max(1200, Math.round(bmr * factor * goalAdj));
}

// Build conic-gradient from macro pct array (e.g. [{pct:"35%", c:"..."}, ...])
function buildConicGradient(macros) {
  let cum = 0;
  const stops = macros.map(m => {
    const pct = parseFloat(m.pct) || 0;
    const stop = `${m.c} ${cum}% ${cum + pct}%`;
    cum += pct;
    return stop;
  });
  if (cum < 100) stops.push(`transparent ${cum}% 100%`);
  return `conic-gradient(${stops.join(", ")})`;
}

// Small SVG ring for water progress
function WaterRing({ current, target }) {
  const pct  = Math.min(1, current / Math.max(target, 1));
  const r    = 11;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, marginTop: 8 }}>
      <svg width="30" height="30" viewBox="0 0 30 30">
        <circle cx="15" cy="15" r={r} fill="none" stroke="rgba(96,165,250,0.18)" strokeWidth="2.5" />
        <circle cx="15" cy="15" r={r} fill="none"
          stroke="#60a5fa" strokeWidth="2.5"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round"
          transform="rotate(-90 15 15)"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <span style={{ fontSize: 9, color: "#60a5fa", fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>
        {(current / 1000).toFixed(1)} L
      </span>
    </div>
  );
}

function computeWaterTargetMl(profile) {
  const wKg = profile.weightUnit === "lb"
    ? (profile.weight || 65) * 0.453592
    : (profile.weight || 65);
  return Math.round(wKg * 35);
}

// ── MealSection ───────────────────────────────────────────────────────────
function MealSection({ type, entries, onAdd, onRemove, accent }) {
  const [open,   setOpen]   = useState(false);
  const [form,   setForm]   = useState({ name: "", calories: "", protein: "", carbs: "", fat: "" });
  const [showMacros, setShowMacros] = useState(false);
  const meta  = MEAL_META[type];
  const total = entries.reduce((s, e) => s + (parseFloat(e.calories) || 0), 0);

  const submit = () => {
    if (!form.name || !form.calories) return;
    onAdd(type, { ...form, calories: parseFloat(form.calories) });
    setForm({ name: "", calories: "", protein: "", carbs: "", fat: "" });
    setShowMacros(false);
  };

  const inp = (field, placeholder, width = "100%", type = "text") => (
    <input
      type={type} value={form[field]} placeholder={placeholder}
      onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
      onKeyDown={e => e.key === "Enter" && submit()}
      style={{
        width, padding: "7px 10px", borderRadius: 8, fontSize: 13,
        border: "1px solid var(--yr-border)", background: "var(--yr-bg)",
        color: "var(--yr-text)", outline: "none",
      }}
    />
  );

  return (
    <div style={{ borderBottom: "1px solid var(--yr-border)" }}>
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10,
          padding: "12px 0", background: "none", border: "none", cursor: "pointer", textAlign: "left",
        }}
      >
        <span style={{ fontSize: "1.1rem" }}>{meta.emoji}</span>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "var(--yr-text)" }}>{meta.label}</span>
        {total > 0 && (
          <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: accent, fontWeight: 700 }}>
            {Math.round(total)} kcal
          </span>
        )}
        <span style={{ fontSize: 10, color: "var(--yr-muted)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
      </button>

      {open && (
        <div style={{ paddingBottom: 14 }}>
          {/* Entry list */}
          {entries.map(e => (
            <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderTop: "1px solid var(--yr-border)" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: "var(--yr-text)" }}>{e.name}</div>
                {(e.protein || e.carbs || e.fat) && (
                  <div style={{ fontSize: 11, color: "var(--yr-muted)", marginTop: 2 }}>
                    {e.protein ? `P ${e.protein}g` : ""}{e.carbs ? `  C ${e.carbs}g` : ""}{e.fat ? `  F ${e.fat}g` : ""}
                  </div>
                )}
              </div>
              <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--yr-text-2)", minWidth: 52, textAlign: "right" }}>
                {Math.round(e.calories)} kcal
              </span>
              <button onClick={() => onRemove(e.id)} style={{ background: "none", border: "none", color: "var(--yr-muted)", cursor: "pointer", fontSize: 14, padding: "0 4px" }}>×</button>
            </div>
          ))}

          {/* Add form */}
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {inp("name", "Food name", "1fr")}
              {inp("calories", "kcal", 70, "number")}
            </div>
            {showMacros && (
              <div style={{ display: "flex", gap: 6 }}>
                {inp("protein", "P (g)", "1fr", "number")}
                {inp("carbs",   "C (g)", "1fr", "number")}
                {inp("fat",     "F (g)", "1fr", "number")}
              </div>
            )}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                onClick={submit}
                style={{
                  flex: 1, padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer",
                  background: accent, color: "#0a0a0a", fontWeight: 700, fontSize: 13,
                }}
              >+ Add</button>
              <button
                onClick={() => setShowMacros(m => !m)}
                style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--yr-border)", background: "transparent", color: "var(--yr-muted)", fontSize: 12, cursor: "pointer" }}
              >{showMacros ? "− macros" : "+ macros"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main tab ─────────────────────────────────────────────────────────────
export default function NutritionTab({ cycleState, profile, onProfileUpdate, motion = "full" }) {
  const animOn    = motion !== "off";
  const fullMotion = motion === "full";
  const today = getTodayKey();
  const [log, setLog] = useState(() => getFuelLog(today));
  const [customWater, setCustomWater] = useState("");

  const updateLog = (newLog) => { setLog(newLog); setFuelLog(today, newLog); };

  const phase = profile?.cycleTracking && cycleState ? cycleState?.phase : null;
  const goal  = profile?.goal || "wellness";

  const hasMetrics = profile?.weight && profile?.height;

  const calorieBase   = useMemo(() => hasMetrics ? computeTDEE(profile) : null, [profile]);
  const phaseAdj      = PHASE_KCAL_DELTA[phase] || { delta: 0, note: null };
  const calorieTarget = calorieBase ? (Number(calorieBase) + Number(phaseAdj.delta)) : null;

  const waterTargetMl = hasMetrics ? computeWaterTargetMl(profile) : 2500;
  const waterNote     = PHASE_WATER_NOTE[phase] || null;

  const totalLogged = log.meals.reduce((s, m) => s + (parseFloat(m.calories) || 0), 0);
  const totalWater  = log.water || 0;
  const progress    = calorieTarget ? (totalLogged / calorieTarget) : 0;
  const remaining   = calorieTarget ? (calorieTarget - totalLogged) : null;

  const kcalAnim    = useCountUp(calorieTarget || 2000, { duration: 1100, enabled: animOn });
  const loggedAnim  = useCountUp(totalLogged, { duration: 900, enabled: animOn });
  const leftAnim    = useCountUp(remaining || 0, { duration: 900, enabled: animOn });

  // Meal suggestion
  const hour           = new Date().getHours();
  const mealsLeft      = hour < 8 ? 3 : hour < 12 ? 2 : hour < 16 ? 1 : 0;
  const suggestedSize  = remaining && mealsLeft > 0 ? Math.round(remaining / mealsLeft) : null;
  const mealGuidance   = phase ? PHASE_MEAL_GUIDANCE[phase] : null;

  // Existing phase/goal guidance data (kept at bottom)
  const data  = phase ? NUTRITION_PHASES[phase] : (GOAL_NUTRITION[goal] || GOAL_NUTRITION_EXTRA?.[goal]);
  const nudge = phase ? getDailyNudge?.(phase) : getGoalNudge?.(goal);
  const phaseLabel = phase
    ? `${PHASE_EMOJI[phase]} ${cycleState?.label} Nutrition`
    : `${goal.replace("_", " ")} Nutrition`;

  const accent = "var(--phase-accent)";

  const macros = data?.macros || [
    { key: "protein", label: "Protein", val: "—", pct: "35%", c: "var(--phase-accent)" },
    { key: "carbs",   label: "Carbs",   val: "—", pct: "25%", c: "color-mix(in oklch, var(--phase-accent) 50%, transparent)" },
    { key: "fat",     label: "Fat",     val: "—", pct: "20%", c: "var(--yr-text-2)" },
    { key: "fiber",   label: "Fiber",   val: "—", pct: "20%", c: "var(--yr-surface-2)" },
  ];

  const addMeal   = (type, entry) => updateLog({ ...log, meals: [...log.meals, { ...entry, id: Date.now(), type }] });
  const removeMeal = (id)          => updateLog({ ...log, meals: log.meals.filter(m => m.id !== id) });
  const addWater  = (ml)           => updateLog({ ...log, water: totalWater + ml });

  const macroTotals = useMemo(() => ({
    protein: log.meals.reduce((s, m) => s + (parseFloat(m.protein) || 0), 0),
    carbs:   log.meals.reduce((s, m) => s + (parseFloat(m.carbs)   || 0), 0),
    fat:     log.meals.reduce((s, m) => s + (parseFloat(m.fat)     || 0), 0),
  }), [log.meals]);

  return (
    <div className="yr-stack-lg">

      {/* Header */}
      <div>
        <div className="yr-overline">{phaseLabel}</div>
        <h1 className="yr-display" style={{ fontSize: "clamp(24px,4vw,40px)", fontWeight: 500, letterSpacing: "-0.03em", margin: 0, lineHeight: 1.1, maxWidth: "24ch" }}>
          {nudge || "Fuel your training well."}
        </h1>
      </div>

      {/* Plate wheel */}
      <div className={`yr-plate${animOn ? " yr-anim-plate" : ""}`}>
        <div className="yr-plate-disc" />
        <div
          className={`yr-plate-slice${fullMotion ? " yr-bento-breathe" : ""}`}
          style={{ background: buildConicGradient(macros) }}
        />
        <div className="yr-plate-hole">
          <div className="yr-overline">Target</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 32, fontWeight: 500, color: "var(--phase-accent)", letterSpacing: "-0.03em" }}>
            {calorieTarget ? kcalAnim.toLocaleString() : "—"}
          </div>
          <div style={{ fontSize: 11, color: "var(--yr-muted)", fontFamily: "var(--font-mono)" }}>kcal · today</div>
          <WaterRing current={totalWater} target={waterTargetMl} />
        </div>
      </div>

      {/* Macro legend */}
      <div className="yr-plate-legend">
        {macros.map((m, i) => (
          <div
            key={m.key}
            className={`yr-plate-legend-item${animOn ? " yr-stagger" : ""}`}
            style={{ "--c": m.c, "--i": i + 2 }}
          >
            <div className="yr-plate-legend-key">{m.label}</div>
            <div className="yr-plate-legend-val">
              {m.val}
              <span style={{ color: "var(--yr-muted)", fontSize: 12, fontFamily: "var(--font-mono)", marginLeft: 6 }}>{m.pct}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Profile incomplete prompt */}
      {!hasMetrics && (
        <div style={{ background: "var(--phase-soft)", border: "1px solid var(--phase-accent)", borderRadius: 12, padding: "12px 16px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: accent, marginBottom: 4 }}>Add your body metrics</div>
          <div style={{ fontSize: 12, color: "var(--yr-text-2)", lineHeight: 1.55 }}>
            Set your weight, height, and gender in the <strong>You</strong> tab to unlock your personalised calorie target.
          </div>
        </div>
      )}

      {/* ── Calorie KPI ─────────────────────────────────────────────── */}
      {calorieTarget && (
        <div style={{ background: "var(--yr-surface-2)", borderRadius: 16, padding: "18px 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
            {[
              ["Target",   calorieTarget ? `${Math.round(calorieTarget).toLocaleString()} kcal` : "—", accent],
              ["Logged",   `${Math.round(loggedAnim).toLocaleString()} kcal`, "var(--yr-text)"],
              ["Left",     remaining !== null ? `${Math.round(leftAnim).toLocaleString()} kcal` : "—", remaining < 0 ? "#f87171" : "var(--yr-text-2)"],
            ].map(([label, val, col]) => (
              <div key={label}>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--yr-muted)", marginBottom: 4, fontFamily: "var(--font-mono)" }}>{label}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: col, fontFamily: "var(--font-mono)", letterSpacing: "-0.02em" }}>{val}</div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div style={{ height: 6, borderRadius: 999, background: "var(--yr-border)", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 999,
              width: `${progress * 100}%`,
              background: progress >= 1 ? "#f87171" : accent,
              transition: "width 0.4s ease",
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
            <span style={{ fontSize: 10, color: "var(--yr-muted)" }}>{Math.round(progress * 100)}% of daily target</span>
            {remaining < 0 && <span style={{ fontSize: 10, color: "#f87171", fontWeight: 600 }}>Over by {Math.abs(Math.round(remaining))} kcal</span>}
          </div>

          {/* Macro summary (only if any logged) */}
          {totalLogged > 0 && (macroTotals.protein > 0 || macroTotals.carbs > 0 || macroTotals.fat > 0) && (
            <div style={{ display: "flex", gap: 12, marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--yr-border)" }}>
              {[["P", macroTotals.protein, accent], ["C", macroTotals.carbs, "var(--yr-text-2)"], ["F", macroTotals.fat, "var(--yr-muted)"]].map(([l, v, c]) => (
                <div key={l} style={{ fontSize: 12, color: c }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{Math.round(v)}g</span>
                  <span style={{ marginLeft: 4, opacity: 0.7 }}>{l}</span>
                </div>
              ))}
            </div>
          )}

          {/* Phase kcal adjustment note */}
          {phaseAdj.note && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--yr-border)", fontSize: 12, color: accent, lineHeight: 1.5 }}>
              🌙 {phaseAdj.note}
            </div>
          )}
        </div>
      )}

      {/* ── Meal tracker ────────────────────────────────────────────── */}
      <div>
        <div className="yr-overline">Today's meals</div>
        <div style={{ marginTop: 8, borderTop: "1px solid var(--yr-border)" }}>
          {["breakfast", "lunch", "dinner", "snack"].map(type => (
            <MealSection
              key={type}
              type={type}
              entries={log.meals.filter(m => m.type === type)}
              onAdd={addMeal}
              onRemove={removeMeal}
              accent={accent}
            />
          ))}
        </div>
      </div>

      {/* ── Meal suggestion card ─────────────────────────────────────── */}
      {suggestedSize && suggestedSize > 0 && (
        <div style={{ background: "var(--phase-soft)", border: "1px solid var(--phase-accent)", borderRadius: 14, padding: "14px 16px" }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: accent, fontFamily: "var(--font-mono)", marginBottom: 6 }}>
            Next meal suggestion
          </div>
          <div style={{ fontSize: 13, color: "var(--yr-text)", lineHeight: 1.6 }}>
            You have <strong style={{ color: accent }}>{Math.round(remaining).toLocaleString()} kcal</strong> left across {mealsLeft} meal{mealsLeft !== 1 ? "s" : ""} — aim for ~<strong style={{ color: accent }}>{suggestedSize} kcal</strong> per meal.
          </div>
          {mealGuidance && (
            <div style={{ marginTop: 8, fontSize: 12, color: "var(--yr-text-2)", lineHeight: 1.55 }}>
              {phase && PHASE_EMOJI[phase]} {mealGuidance}
            </div>
          )}
        </div>
      )}

      {/* ── Water tracker ────────────────────────────────────────────── */}
      <div>
        <div className="yr-overline">Hydration</div>
        <div style={{ background: "var(--yr-surface-2)", borderRadius: 16, padding: "16px 18px", marginTop: 8 }}>
          {/* Target + progress */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--yr-text)" }}>
              {(totalWater / 1000).toFixed(2).replace(/\.?0+$/, "")} L
            </span>
            <span style={{ fontSize: 11, color: "var(--yr-muted)", fontFamily: "var(--font-mono)" }}>
              of {(waterTargetMl / 1000).toFixed(1)} L target
            </span>
          </div>
          <div style={{ height: 6, borderRadius: 999, background: "var(--yr-border)", overflow: "hidden", marginBottom: 14 }}>
            <div style={{
              height: "100%", borderRadius: 999,
              width: `${Math.min(100, (totalWater / waterTargetMl) * 100)}%`,
              background: "var(--phase-accent)",
              transition: "width 0.4s ease",
            }} />
          </div>

          {/* Quick-add chips */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[150, 250, 500].map(ml => (
              <button key={ml} onClick={() => addWater(ml)} style={{
                padding: "7px 14px", borderRadius: 99, border: "1px solid var(--yr-border)",
                background: "transparent", color: "var(--yr-text-2)", fontSize: 12, cursor: "pointer", fontFamily: "var(--font-mono)",
              }}>+{ml} ml</button>
            ))}
            <div style={{ display: "flex", gap: 4 }}>
              <input
                type="number" value={customWater} placeholder="ml"
                onChange={e => setCustomWater(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && customWater) { addWater(parseInt(customWater)); setCustomWater(""); } }}
                style={{ width: 60, padding: "7px 8px", borderRadius: 8, border: "1px solid var(--yr-border)", background: "var(--yr-bg)", color: "var(--yr-text)", fontSize: 12, outline: "none" }}
              />
              <button
                onClick={() => { if (customWater) { addWater(parseInt(customWater)); setCustomWater(""); } }}
                style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid var(--yr-border)", background: "transparent", color: "var(--yr-muted)", fontSize: 12, cursor: "pointer" }}
              >+</button>
            </div>
            {totalWater > 0 && (
              <button onClick={() => updateLog({ ...log, water: 0 })} style={{
                padding: "7px 10px", borderRadius: 8, border: "none", background: "transparent", color: "var(--yr-muted)", fontSize: 11, cursor: "pointer",
              }}>reset</button>
            )}
          </div>

          {waterNote && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--yr-border)", fontSize: 12, color: accent, lineHeight: 1.5 }}>
              💧 {waterNote}
            </div>
          )}
        </div>
      </div>

      {/* ── Phase / goal guidance (existing content, preserved) ──────── */}
      {data && (
        <div>
          <div className="yr-overline">{phase ? "Phase guidance" : "Goal guidance"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", borderTop: "1px solid var(--yr-border)" }}>
            {(data.keyNutrients ? data.keyNutrients.slice(0, 4).map(n => ({ key: n.name, title: n.name, body: n.why })) : [
              { key: "protein",   title: "Protein",   body: data.protein   || "Consistent protein across meals." },
              { key: "carbs",     title: "Carbs",     body: data.carbs     || "Focus on complex carbohydrates." },
              { key: "hydration", title: "Hydration", body: data.hydration || "Aim for 2–2.5 L per day." },
              { key: "timing",    title: "Timing",    body: "Pre/post-workout nutrition matters most on training days." },
            ]).map((c, i) => (
              <div key={c.key} className="yr-anim-ledger-row" style={{ borderBottom: "1px solid var(--yr-border)", padding: "16px 16px 16px 0", "--i": i }}>
                <div className="yr-overline" style={{ color: accent }}>{c.title}</div>
                <div style={{ fontSize: 13, color: "var(--yr-text-2)", lineHeight: 1.55, marginTop: 4 }}>{c.body}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Meal ideas */}
      {data?.mealIdeas?.length > 0 && (
        <div>
          <div className="yr-overline">Meal ideas</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            {data.mealIdeas.slice(0, 5).map((meal, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--yr-border)" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--yr-muted)", minWidth: 24 }}>{String(i + 1).padStart(2, "0")}</div>
                <div style={{ fontSize: 13, color: "var(--yr-text-2)" }}>{meal}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ fontSize: 11, color: "var(--yr-faint)", lineHeight: 1.6 }}>
        Calorie estimates use the Mifflin-St Jeor equation. These are wellness suggestions, not prescriptions. Consult a registered dietitian for personalised nutrition advice.
      </div>
    </div>
  );
}
