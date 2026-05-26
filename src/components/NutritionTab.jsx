import { useState, useMemo } from "react";
import { getFuelLog, setFuelLog, getTodayKey } from "../storage";
import {
  computeTargetCalories, hasBodyMetrics,
} from "../nutritionEngine";
import { PHASE_EMOJI } from "../cycleEngine";

// ── Phase content (preserved from previous version) ──────────────────────
const PHASE_KCAL_DELTA = {
  luteal_late: { delta: 250, note: "Late luteal phase increases energy needs. +250 kcal added to your budget." },
  menstrual:   { delta: 0,   note: null },
};
const PHASE_INSIGHT_HEADLINE = {
  follicular:   "High protein for follicular recovery.",
  ovulatory:    "Antioxidants and lean protein for peak power.",
  luteal_early: "Steady complex carbs to sustain energy.",
  luteal_late:  "Magnesium and warm grains to ease cravings.",
  menstrual:    "Iron-rich foods to replenish.",
};
const PHASE_INSIGHT_BODY = {
  follicular:   "Support muscle repair and hormonal synthesis as your energy begins to rise.",
  ovulatory:    "Estrogen peak means peak strength — fuel performance and ACL-protective nutrients.",
  luteal_early: "Insulin sensitivity drops slightly. Complex carbs and protein at every meal keep things steady.",
  luteal_late:  "Progesterone raises core temp. Magnesium, complex carbs and an honest +250 kcal.",
  menstrual:    "Iron + vitamin C for absorption. Omega-3s and warm liquids for cramp relief.",
};
const PHASE_WATER_NOTE = {
  menstrual:   "Add ~500 ml today — replace what you lose.",
  luteal_late: "Progesterone causes retention — sip consistently.",
};
const MEAL_TYPES = [
  { id: "breakfast", label: "Breakfast", icon: "☀️" },
  { id: "lunch",     label: "Lunch",     icon: "🌿" },
  { id: "dinner",    label: "Dinner",    icon: "🌙" },
  { id: "snack",     label: "Snack",     icon: "🫐" },
];
const MEAL_META = MEAL_TYPES.reduce((acc, m) => ({ ...acc, [m.id]: m }), {});

// ── Food-name → emoji (subset for thumbnails) ────────────────────────────
const FOOD_EMOJI_MAP = [
  { k: ["smoothie","shake","açaí","acai"],                     e: "🥤" },
  { k: ["protein shake","protein bar","protein powder"],       e: "💪" },
  { k: ["coffee","espresso","latte","matcha"],                 e: "☕" },
  { k: ["tea","chamomile","green tea"],                        e: "🍵" },
  { k: ["egg","omelette","scrambled","poached","fried egg"],   e: "🥚" },
  { k: ["oat","porridge","oatmeal","overnight oat"],           e: "🌾" },
  { k: ["granola","muesli"],                                   e: "🥣" },
  { k: ["toast","bread","bagel","croissant","sourdough"],      e: "🍞" },
  { k: ["chicken","turkey","poultry"],                         e: "🍗" },
  { k: ["salmon","fish","tuna","seafood","cod","tilapia"],     e: "🐟" },
  { k: ["beef","steak","meat","burger","mince"],               e: "🥩" },
  { k: ["tofu","tempeh","edamame"],                            e: "🫘" },
  { k: ["rice","grain","quinoa","barley"],                     e: "🍚" },
  { k: ["pasta","noodle","spaghetti","ramen","penne"],         e: "🍝" },
  { k: ["salad","greens","lettuce","spinach","kale","arugula"],e: "🥗" },
  { k: ["avocado","avo","guacamole"],                          e: "🥑" },
  { k: ["sweet potato","yam","butternut"],                     e: "🍠" },
  { k: ["broccoli","vegetable","veggie","zucchini","carrot"],  e: "🥦" },
  { k: ["yogurt","dairy","kefir"],                             e: "🥛" },
  { k: ["cheese","feta","cheddar","mozzarella"],               e: "🧀" },
  { k: ["soup","stew","curry","broth","chili","chilli"],       e: "🍲" },
  { k: ["strawberr","blueberr","raspberry","blackberr","berry"],e:"🍓" },
  { k: ["banana","plantain"],                                  e: "🍌" },
  { k: ["mango","papaya","pineapple"],                         e: "🥭" },
  { k: ["apple","pear","peach","plum"],                        e: "🍎" },
  { k: ["orange","mandarin","grapefruit","citrus"],            e: "🍊" },
  { k: ["wrap","burrito","taco"],                              e: "🌯" },
  { k: ["bowl","poke","grain bowl","buddha"],                  e: "🥣" },
  { k: ["sandwich","sub","panini"],                            e: "🥪" },
  { k: ["pizza"],                                              e: "🍕" },
  { k: ["chocolate","sweet","cookie","cake","dessert"],        e: "🍫" },
  { k: ["nut","almond","walnut","cashew","peanut"],            e: "🥜" },
];
function foodEmoji(name) {
  const n = (name || "").toLowerCase();
  for (const { k, e } of FOOD_EMOJI_MAP) {
    if (k.some(kw => n.includes(kw))) return e;
  }
  return "🍽";
}

function computeWaterTargetMl(profile) {
  const wKg = profile?.weightUnit === "lb"
    ? (profile.weight || 65) * 0.453592
    : (profile?.weight || 65);
  return Math.round(wKg * 35);
}

// ── Style helpers ────────────────────────────────────────────────────────
const overline = () => ({
  fontFamily: "var(--font-body)",
  fontSize: 12, fontWeight: 600,
  letterSpacing: "0.14em", textTransform: "uppercase",
  color: "var(--phase-accent)",
});
const glassCard = (extra = {}) => ({
  background: "color-mix(in oklch, var(--yr-bg-elev) 60%, transparent)",
  backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
  borderRadius: 16, border: "1px solid var(--yr-border)",
  ...extra,
});

// ── Component ────────────────────────────────────────────────────────────
export default function NutritionTab({ cycleState, profile, onProfileUpdate, motion = "full" }) {
  const today = getTodayKey();
  const [log, setLog] = useState(() => getFuelLog(today));
  const [showAdd, setShowAdd] = useState(false);

  const updateLog = (newLog) => { setLog(newLog); setFuelLog(today, newLog); };

  const phase = profile?.cycleTracking && cycleState ? cycleState?.phase : null;
  const hasMetrics = hasBodyMetrics(profile);

  // Calorie target (from nutritionEngine — uses goal-adjusted TDEE)
  const calorieBase   = useMemo(() => hasMetrics ? computeTargetCalories(profile) : null, [profile, hasMetrics]);
  const phaseAdj      = PHASE_KCAL_DELTA[phase] || { delta: 0, note: null };
  const calorieTarget = calorieBase ? (calorieBase + phaseAdj.delta) : null;

  const waterTargetMl = hasMetrics ? computeWaterTargetMl(profile) : 2500;
  const waterNote     = PHASE_WATER_NOTE[phase] || null;
  const totalWater    = log.water || 0;
  const waterPct      = Math.min(1, totalWater / waterTargetMl);

  // Macro + kcal totals
  const stats = useMemo(() => ({
    kcal:    (log.meals || []).reduce((s, m) => s + (parseFloat(m.calories) || 0), 0),
    protein: (log.meals || []).reduce((s, m) => s + (parseFloat(m.protein)  || 0), 0),
    carbs:   (log.meals || []).reduce((s, m) => s + (parseFloat(m.carbs)    || 0), 0),
    fat:     (log.meals || []).reduce((s, m) => s + (parseFloat(m.fat)      || 0), 0),
  }), [log.meals]);

  const goalPct = calorieTarget ? Math.min(1, stats.kcal / calorieTarget) : 0;

  // Macro proportions of CALORIE total (for the segmented bar)
  // Protein/Carbs = 4 kcal/g, Fat = 9 kcal/g
  const kcalProtein = stats.protein * 4;
  const kcalCarbs   = stats.carbs   * 4;
  const kcalFat     = stats.fat     * 9;
  const kcalSum     = kcalProtein + kcalCarbs + kcalFat;
  const pctP = kcalSum > 0 ? kcalProtein / kcalSum : 0;
  const pctC = kcalSum > 0 ? kcalCarbs   / kcalSum : 0;
  const pctF = kcalSum > 0 ? kcalFat     / kcalSum : 0;

  // Insight headline + body — falls back to neutral copy without phase
  const insightHeadline = phase ? PHASE_INSIGHT_HEADLINE[phase] : "Fuel today's session.";
  const insightBody     = phase ? PHASE_INSIGHT_BODY[phase]     : "Protein at every meal, complex carbs around training, hydration consistently.";

  // Sort meals newest first within each meal type bucket, then by added-time
  const mealsSorted = useMemo(() => {
    return (log.meals || []).slice().sort((a, b) => (a.id || 0) - (b.id || 0));
  }, [log.meals]);

  const removeMeal = (id) => updateLog({ ...log, meals: (log.meals || []).filter(m => m.id !== id) });
  const addMeal = (type, entry) => updateLog({ ...log, meals: [...(log.meals || []), { ...entry, id: Date.now(), type }] });
  const addWater = (ml) => updateLog({ ...log, water: totalWater + ml });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* ── 1. Phase Insight ─────────────────────────────────────── */}
      <section style={{ ...glassCard({ padding: 20, position: "relative", overflow: "hidden" }) }}>
        <div aria-hidden="true" style={{
          position: "absolute", top: 12, right: 12,
          fontSize: 60, opacity: 0.08, lineHeight: 1,
          color: "var(--yr-info)",
        }}>💡</div>
        <div style={{ ...overline(), marginBottom: 8 }}>Phase Insight</div>
        <h3 style={{
          margin: 0,
          fontFamily: "var(--font-display)",
          fontSize: "clamp(22px, 5.5vw, 28px)",
          fontWeight: 500, lineHeight: 1.25,
          color: "var(--yr-text)",
          letterSpacing: "-0.01em",
          maxWidth: "30ch",
        }}>
          {insightHeadline}
        </h3>
        <p style={{
          margin: "8px 0 0",
          fontFamily: "var(--font-body)",
          fontSize: 15, lineHeight: 1.55,
          color: "var(--yr-text-2)",
          opacity: 0.9,
        }}>
          {insightBody}
        </p>
      </section>

      {/* ── 2. Total Fuel hero ───────────────────────────────────── */}
      <section style={glassCard({ padding: 22 })}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
          <div>
            <div style={{
              fontFamily: "var(--font-body)",
              fontSize: 12, fontWeight: 600,
              letterSpacing: "0.08em", textTransform: "uppercase",
              color: "var(--yr-text-2)",
              marginBottom: 4,
            }}>
              Total Fuel
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(40px, 11vw, 56px)",
                fontWeight: 600, lineHeight: 1,
                color: "var(--yr-text)",
                letterSpacing: "-0.04em",
              }}>
                {Math.round(stats.kcal).toLocaleString()}
              </span>
              <span style={{
                fontFamily: "var(--font-body)",
                fontSize: 14, color: "var(--yr-text-2)",
              }}>
                {calorieTarget ? `/ ${Math.round(calorieTarget).toLocaleString()} kcal` : "kcal"}
              </span>
            </div>
          </div>
          {calorieTarget && (
            <div style={{
              fontFamily: "var(--font-body)",
              fontSize: 13, fontWeight: 600,
              color: "var(--phase-accent)",
              paddingBottom: 4,
            }}>
              {Math.round(goalPct * 100)}% Goal
            </div>
          )}
        </div>

        {/* Tri-color macro bar */}
        <div style={{
          display: "flex", height: 8, width: "100%",
          background: "var(--yr-surface-2)", borderRadius: 999,
          overflow: "hidden", gap: 2,
        }}>
          <div style={{ height: "100%", background: "var(--phase-accent)", width: `${pctP * 100}%`, transition: "width 0.6s ease" }} title="Protein" />
          <div style={{ height: "100%", background: "var(--yr-info)",       width: `${pctC * 100}%`, transition: "width 0.6s ease" }} title="Carbs"   />
          <div style={{ height: "100%", background: "var(--yr-faint)",      width: `${pctF * 100}%`, transition: "width 0.6s ease" }} title="Fats"    />
        </div>

        {/* Macro breakdown */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", marginTop: 16, gap: 8 }}>
          {[
            { label: "Protein", grams: stats.protein, color: "var(--phase-accent)" },
            { label: "Carbs",   grams: stats.carbs,   color: "var(--yr-info)"      },
            { label: "Fats",    grams: stats.fat,     color: "var(--yr-faint)"     },
          ].map(m => (
            <div key={m.label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{
                fontFamily: "var(--font-body)",
                fontSize: 11, fontWeight: 600,
                letterSpacing: "0.06em", textTransform: "uppercase",
                color: m.color,
              }}>
                {m.label}
              </span>
              <span style={{
                fontFamily: "var(--font-body)",
                fontSize: 16, fontWeight: 500,
                color: "var(--yr-text)",
              }}>
                {Math.round(m.grams)}<span style={{ fontSize: 11, color: "var(--yr-muted)", marginLeft: 2 }}>g</span>
              </span>
            </div>
          ))}
        </div>

        {phaseAdj.note && (
          <div style={{
            marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--yr-border)",
            fontFamily: "var(--font-body)",
            fontSize: 12, lineHeight: 1.5,
            color: "var(--phase-accent)",
          }}>
            🌙 {phaseAdj.note}
          </div>
        )}

        {!hasMetrics && (
          <div style={{
            marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--yr-border)",
            fontFamily: "var(--font-body)",
            fontSize: 12, lineHeight: 1.5,
            color: "var(--yr-muted)",
          }}>
            Add age, weight and height in Settings to unlock your personalised calorie target.
          </div>
        )}
      </section>

      {/* ── 3. Water + Highlight (2-col) ─────────────────────────── */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Water ring */}
        <div style={glassCard({
          padding: 18, aspectRatio: "1 / 1",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 12,
        })}>
          <div style={{ position: "relative", width: 96, height: 96 }}>
            <svg width="96" height="96" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="48" cy="48" r="44" fill="none"
                stroke="var(--yr-surface-2)" strokeWidth="5" />
              <circle cx="48" cy="48" r="44" fill="none"
                stroke="var(--yr-info)" strokeWidth="6" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 44}
                strokeDashoffset={2 * Math.PI * 44 * (1 - waterPct)}
                style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(0.22,1,0.36,1)" }}
              />
            </svg>
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
            }}>
              <span style={{
                fontFamily: "var(--font-display)",
                fontSize: 24, fontWeight: 500,
                color: "var(--yr-text)",
              }}>
                {(totalWater / 1000).toFixed(1)}
              </span>
              <span style={{
                fontFamily: "var(--font-body)",
                fontSize: 10, fontWeight: 600,
                letterSpacing: "0.14em", textTransform: "uppercase",
                color: "var(--yr-muted)",
              }}>
                Liters
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[250, 500].map(ml => (
              <button key={ml} onClick={() => addWater(ml)} aria-label={`Add ${ml}ml water`}
                style={{
                  minHeight: 32, padding: "4px 12px",
                  borderRadius: 999,
                  border: "1px solid var(--yr-border)",
                  background: "transparent",
                  color: "var(--yr-info)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11, fontWeight: 600,
                  cursor: "pointer",
                }}>
                +{ml}ml
              </button>
            ))}
          </div>
        </div>

        {/* Right tile: water hydration note OR helpful default */}
        <div style={glassCard({
          padding: 18, aspectRatio: "1 / 1",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
        })}>
          <span style={{ fontSize: 20, color: "var(--yr-info)" }} aria-hidden="true">💧</span>
          <div>
            <div style={{
              fontFamily: "var(--font-body)",
              fontSize: 11, fontWeight: 600,
              letterSpacing: "0.08em", textTransform: "uppercase",
              color: "var(--yr-text-2)",
              marginBottom: 4,
            }}>
              Hydration
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{
                fontFamily: "var(--font-display)",
                fontSize: 22, fontWeight: 500,
                color: "var(--yr-text)",
              }}>
                {Math.round(waterPct * 100)}
              </span>
              <span style={{ fontSize: 10, color: "var(--yr-muted)" }}>% of target</span>
            </div>
            <div style={{
              width: "100%", height: 4, marginTop: 8,
              background: "var(--yr-surface-2)",
              borderRadius: 999, overflow: "hidden",
            }}>
              <div style={{
                height: "100%", width: `${waterPct * 100}%`,
                background: "var(--yr-info)",
                transition: "width 0.6s ease",
              }} />
            </div>
            {waterNote && (
              <div style={{
                marginTop: 8,
                fontFamily: "var(--font-body)",
                fontSize: 10, lineHeight: 1.4,
                color: "var(--yr-text-2)",
              }}>
                {waterNote}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 4. Meal Log ──────────────────────────────────────────── */}
      <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <h2 style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontSize: 22, fontWeight: 500,
            color: "var(--yr-text)",
            letterSpacing: "-0.01em",
          }}>
            Meal Log
          </h2>
          <button onClick={() => setShowAdd(o => !o)} style={{
            background: "transparent", border: "none",
            color: "var(--phase-accent)",
            fontFamily: "var(--font-body)",
            fontSize: 14, fontWeight: 600,
            cursor: "pointer",
            display: "flex", alignItems: "center", gap: 4,
            minHeight: 32, padding: "0 4px",
          }}>
            {showAdd ? "Cancel" : "+ Add Entry"}
          </button>
        </div>

        {showAdd && (
          <AddMealForm
            onSave={(entry) => { addMeal(entry.type, entry); setShowAdd(false); }}
            onCancel={() => setShowAdd(false)}
          />
        )}

        {mealsSorted.length === 0 && !showAdd ? (
          <EmptyMealRow onTap={() => setShowAdd(true)} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {mealsSorted.map(meal => (
              <MealRow key={meal.id} meal={meal} onRemove={() => removeMeal(meal.id)} />
            ))}

            {/* Suggest the next un-logged meal type */}
            {(() => {
              const loggedTypes = new Set(mealsSorted.map(m => m.type));
              const next = MEAL_TYPES.find(t => !loggedTypes.has(t.id));
              if (!next || showAdd) return null;
              return (
                <EmptyMealRow
                  label={`Log ${next.label}`}
                  icon={next.icon}
                  onTap={() => setShowAdd(true)}
                />
              );
            })()}
          </div>
        )}
      </section>

      {/* Disclaimer */}
      <div style={{
        fontFamily: "var(--font-body)",
        fontSize: 11, lineHeight: 1.6,
        color: "var(--yr-faint)",
        paddingTop: 16, borderTop: "1px solid var(--yr-border)",
      }}>
        Calorie estimates use the Mifflin–St Jeor equation. Wellness suggestions,
        not prescriptions. Consult a registered dietitian for personalised advice.
      </div>
    </div>
  );
}

// ── MealRow ──────────────────────────────────────────────────────────────
function MealRow({ meal, onRemove }) {
  const meta = MEAL_META[meal.type] || MEAL_TYPES[3];
  const time = meal.id ? new Date(meal.id).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
  const emoji = foodEmoji(meal.name);

  return (
    <div style={glassCard({
      padding: 14,
      display: "flex", alignItems: "center", gap: 14,
      minHeight: 80,
    })}>
      {/* Thumbnail (emoji on tinted square) */}
      <div style={{
        width: 56, height: 56, borderRadius: 12,
        flexShrink: 0,
        background: "color-mix(in oklch, var(--phase-accent) 12%, var(--yr-bg))",
        border: "1px solid color-mix(in oklch, var(--phase-accent) 18%, transparent)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 26,
      }}>
        {emoji}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <h4 style={{
            margin: 0,
            fontFamily: "var(--font-body)",
            fontSize: 14, fontWeight: 600,
            color: "var(--yr-text)",
          }}>
            {meta.label}
          </h4>
          {time && (
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10, color: "var(--yr-muted)",
              flexShrink: 0,
            }}>
              {time}
            </span>
          )}
        </div>
        <p style={{
          margin: "3px 0 0",
          fontFamily: "var(--font-body)",
          fontSize: 13, color: "var(--yr-text-2)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {meal.name}
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center", flexWrap: "wrap" }}>
          {meal.protein && (
            <span style={{
              fontFamily: "var(--font-body)",
              fontSize: 10, fontWeight: 600,
              padding: "2px 8px", borderRadius: 999,
              background: "color-mix(in oklch, var(--phase-accent) 18%, transparent)",
              color: "var(--phase-accent)",
            }}>
              {Math.round(parseFloat(meal.protein))}g Protein
            </span>
          )}
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10, color: "var(--yr-muted)",
          }}>
            {Math.round(parseFloat(meal.calories) || 0)} kcal
          </span>
        </div>
      </div>

      <button onClick={onRemove} aria-label="Remove meal" style={{
        background: "transparent", border: "none",
        color: "var(--yr-muted)",
        fontSize: 18, cursor: "pointer",
        padding: "8px 4px", flexShrink: 0,
        minHeight: 32, minWidth: 32,
      }}>
        ×
      </button>
    </div>
  );
}

// ── Empty meal placeholder (dashed) ──────────────────────────────────────
function EmptyMealRow({ label = "Log a meal", icon = "🍽", onTap }) {
  return (
    <button onClick={onTap} aria-label={label} style={{
      padding: 14,
      borderRadius: 16,
      border: "1.5px dashed var(--yr-border)",
      background: "transparent",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      color: "var(--yr-muted)",
      fontFamily: "var(--font-body)",
      fontSize: 14, fontWeight: 600,
      cursor: "pointer",
      minHeight: 56,
      transition: "border-color 0.2s ease, background 0.2s ease",
    }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      {label}
    </button>
  );
}

// ── Add Meal form (inline, expands when "+ Add Entry" tapped) ────────────
function AddMealForm({ onSave, onCancel }) {
  const [form, setForm] = useState({
    type: "breakfast",
    name: "", calories: "", protein: "", carbs: "", fat: "",
  });
  const [showMacros, setShowMacros] = useState(false);

  const canSave = form.name.trim() && form.calories;

  const submit = () => {
    if (!canSave) return;
    onSave({
      type: form.type,
      name: form.name.trim(),
      calories: parseFloat(form.calories),
      protein: form.protein || undefined,
      carbs:   form.carbs   || undefined,
      fat:     form.fat     || undefined,
    });
  };

  return (
    <div style={glassCard({ padding: 16, display: "flex", flexDirection: "column", gap: 12 })}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {MEAL_TYPES.map(t => {
          const active = form.type === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setForm(f => ({ ...f, type: t.id }))}
              aria-pressed={active}
              style={{
                minHeight: 32, padding: "5px 12px",
                borderRadius: 999,
                border: `1px solid ${active ? "var(--phase-accent)" : "var(--yr-border)"}`,
                background: active ? "color-mix(in oklch, var(--phase-accent) 16%, transparent)" : "transparent",
                color: active ? "var(--phase-accent)" : "var(--yr-text-2)",
                fontFamily: "var(--font-body)",
                fontSize: 12, fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 4,
              }}>
              <span>{t.icon}</span> {t.label}
            </button>
          );
        })}
      </div>

      <input
        type="text"
        placeholder="Food name (e.g. Salmon & Avocado Bowl)"
        value={form.name}
        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        style={inputStyle()}
      />

      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="number" inputMode="decimal"
          placeholder="kcal"
          value={form.calories}
          onChange={e => setForm(f => ({ ...f, calories: e.target.value }))}
          style={{ ...inputStyle(), flex: 1 }}
        />
        <button
          onClick={() => setShowMacros(m => !m)}
          style={{
            minHeight: 44, padding: "0 14px",
            borderRadius: 10,
            border: "1px solid var(--yr-border)",
            background: "transparent",
            color: "var(--yr-muted)",
            fontFamily: "var(--font-body)",
            fontSize: 12, fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}>
          {showMacros ? "− macros" : "+ macros"}
        </button>
      </div>

      {showMacros && (
        <div style={{ display: "flex", gap: 6 }}>
          <input type="number" inputMode="decimal" placeholder="P (g)" value={form.protein}
            onChange={e => setForm(f => ({ ...f, protein: e.target.value }))} style={{ ...inputStyle(), flex: 1 }} />
          <input type="number" inputMode="decimal" placeholder="C (g)" value={form.carbs}
            onChange={e => setForm(f => ({ ...f, carbs: e.target.value }))} style={{ ...inputStyle(), flex: 1 }} />
          <input type="number" inputMode="decimal" placeholder="F (g)" value={form.fat}
            onChange={e => setForm(f => ({ ...f, fat: e.target.value }))} style={{ ...inputStyle(), flex: 1 }} />
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onCancel} style={{
          flex: 1, minHeight: 44,
          borderRadius: 12,
          border: "1px solid var(--yr-border)",
          background: "transparent",
          color: "var(--yr-text-2)",
          fontFamily: "var(--font-body)",
          fontSize: 14, fontWeight: 600,
          cursor: "pointer",
        }}>
          Cancel
        </button>
        <button onClick={submit} disabled={!canSave} style={{
          flex: 2, minHeight: 44,
          borderRadius: 12, border: "none",
          background: canSave ? "var(--phase-accent)" : "var(--yr-surface-2)",
          color: canSave ? "var(--yr-bg)" : "var(--yr-muted)",
          fontFamily: "var(--font-body)",
          fontSize: 14, fontWeight: 700,
          cursor: canSave ? "pointer" : "not-allowed",
        }}>
          Save meal
        </button>
      </div>
    </div>
  );
}

function inputStyle() {
  return {
    padding: "11px 14px",
    minHeight: 44,
    borderRadius: 10,
    border: "1px solid var(--yr-border)",
    background: "var(--yr-bg)",
    color: "var(--yr-text)",
    fontFamily: "var(--font-body)",
    fontSize: 16,  // ≥16 to avoid iOS auto-zoom
    outline: "none",
    boxSizing: "border-box",
  };
}
