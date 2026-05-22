/**
 * FoodCapsuleCard — premium minimal nutrition summary for the Today tab.
 *
 * Replaces the cat-mascot version with a data-forward glass capsule card:
 *   Left   — big kcal number (logged today / target if available)
 *   Centre — meal emoji chips for each logged meal
 *   Right  — three small SVG macro rings (Protein · Carbs · Fat)
 *
 * Props:
 *   onTap   — tap handler, routes to Fuel tab
 *   profile — optional; used to compute calorie target for progress bar
 */
import { useMemo } from "react";
import { getFuelLog, getTodayKey } from "../storage";
import { computeMaintenanceTDEE, hasBodyMetrics } from "../nutritionEngine";

// ── Emoji lookup ───────────────────────────────────────────────────────────
const FOOD_MAP = [
  { k: ["smoothie","shake","açaí","acai"],                     e: "🥤" },
  { k: ["protein shake","protein bar","protein powder"],       e: "💪" },
  { k: ["coffee","espresso","latte","matcha"],                  e: "☕" },
  { k: ["tea","herbal","chamomile","green tea"],                e: "🍵" },
  { k: ["egg","omelette","scrambled","poached","fried egg"],   e: "🥚" },
  { k: ["oat","porridge","oatmeal","overnight oat"],           e: "🌾" },
  { k: ["granola","muesli"],                                   e: "🥣" },
  { k: ["toast","bread","bagel","croissant","sourdough"],      e: "🍞" },
  { k: ["chicken","turkey","poultry","grilled chicken"],       e: "🍗" },
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
  { k: ["strawberr","blueberr","raspberry","blackberr"],       e: "🍓" },
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
  for (const { k, e } of FOOD_MAP) {
    if (k.some(kw => n.includes(kw))) return e;
  }
  return "🍽";
}

// ── Small SVG macro ring ───────────────────────────────────────────────────
function MacroRing({ label, grams, targetG, color, size = 44, stroke = 3.5 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const hasData = grams > 0;
  const pct = hasData && targetG > 0 ? Math.min(1, grams / targetG) : 0;
  const dashoff = circ * (1 - pct);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {/* Track */}
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={stroke}
          />
          {/* Fill */}
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke={hasData ? color : "rgba(255,255,255,0.12)"}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={hasData ? dashoff : circ}
            style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(0.22,1,0.36,1)" }}
          />
        </svg>
        {/* Centre value */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-mono)",
          fontSize: hasData && grams >= 100 ? 9 : 11,
          fontWeight: 700, lineHeight: 1,
          color: hasData ? color : "var(--yr-faint)",
        }}>
          {hasData ? Math.round(grams) : "—"}
        </div>
      </div>
      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
        color: "var(--yr-muted)", textTransform: "uppercase",
      }}>
        {label}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function FoodCapsuleCard({ onTap, profile }) {
  const log   = getFuelLog(getTodayKey());
  const meals = log.meals || [];

  const stats = useMemo(() => ({
    kcal:    meals.reduce((s, m) => s + (parseFloat(m.calories) || 0), 0),
    protein: meals.reduce((s, m) => s + (parseFloat(m.protein)  || 0), 0),
    carbs:   meals.reduce((s, m) => s + (parseFloat(m.carbs)    || 0), 0),
    fat:     meals.reduce((s, m) => s + (parseFloat(m.fat)      || 0), 0),
  }), [meals]);

  const isEmpty = meals.length === 0;

  // Maintenance TDEE as calorie ceiling (simpler than goal-adjusted target)
  const targetKcal = useMemo(() => {
    if (!hasBodyMetrics(profile)) return null;
    return computeMaintenanceTDEE(profile);
  }, [profile]);

  const kcalPct = targetKcal ? Math.min(1, stats.kcal / targetKcal) : null;

  // Default daily macro targets (grams). Phase-aware upgrade possible later.
  const macroTargets = { protein: 130, carbs: 180, fat: 60 };

  // Collect up to 6 food emojis from logged meals, in meal-type order
  const mealEmojis = useMemo(() => {
    const chips = [];
    for (const type of ["breakfast", "lunch", "dinner", "snack"]) {
      const entries = meals.filter(m => m.type === type);
      entries.slice(0, 2).forEach(e => chips.push({ type: "emoji", val: foodEmoji(e.name) }));
      if (entries.length > 2) chips.push({ type: "count", val: `+${entries.length - 2}` });
    }
    return chips.slice(0, 7);
  }, [meals]);

  const hasMacros = stats.protein > 0 || stats.carbs > 0 || stats.fat > 0;

  return (
    <button
      onClick={onTap}
      aria-label={
        isEmpty
          ? "No meals logged yet. Tap to open Fuel tab."
          : `${Math.round(stats.kcal)} kcal logged today. Tap to open Fuel tab.`
      }
      style={{
        // Layout
        width: "100%", display: "flex", flexDirection: "column", gap: 14,
        padding: "18px 20px",
        // Shape
        borderRadius: 24,
        // Glass surface — tints with phase accent when food is logged
        background: isEmpty
          ? "var(--yr-surface)"
          : "color-mix(in oklch, var(--yr-bg-elev) 80%, var(--phase-accent))",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        // Border — phase-accent glow when active
        border: isEmpty
          ? "1px solid var(--yr-border)"
          : "1px solid color-mix(in oklch, var(--phase-accent) 30%, var(--yr-border))",
        boxShadow: isEmpty
          ? "none"
          : "0 4px 28px color-mix(in oklch, var(--phase-accent) 12%, transparent)",
        // Reset button styles
        cursor: "pointer", textAlign: "left",
        transition: "background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease",
        WebkitTapHighlightColor: "transparent",
        minHeight: 44,
        fontFamily: "inherit",
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="yr-overline">Food today</div>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase",
          color: isEmpty ? "var(--yr-muted)" : "var(--phase-accent)",
        }}>
          Fuel →
        </div>
      </div>

      {isEmpty ? (
        /* ── Empty state ──────────────────────────────────────────────── */
        <div style={{
          display: "flex", alignItems: "center",
          gap: 12, padding: "8px 0",
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14, flexShrink: 0,
            border: "1.5px dashed var(--yr-border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20,
          }}>
            🍽
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: "var(--yr-text-2)" }}>
              Log your first meal
            </div>
            <div style={{ fontSize: 11, color: "var(--yr-muted)", marginTop: 3 }}>
              Tap to add breakfast, lunch or snacks
            </div>
          </div>
        </div>
      ) : (
        /* ── Data row ─────────────────────────────────────────────────── */
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

          {/* Left — kcal + bar + emojis */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Big kcal number */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: 36, fontWeight: 700, lineHeight: 1,
                letterSpacing: "-0.04em",
                color: "var(--phase-accent)",
              }}>
                {Math.round(stats.kcal).toLocaleString()}
              </span>
              <span style={{
                fontSize: 12, fontFamily: "var(--font-mono)",
                color: "var(--yr-muted)", lineHeight: 1,
              }}>
                {targetKcal
                  ? `/ ${Math.round(targetKcal).toLocaleString()} kcal`
                  : "kcal today"}
              </span>
            </div>

            {/* Thin progress bar */}
            <div style={{
              height: 3, borderRadius: 999, overflow: "hidden",
              background: "rgba(255,255,255,0.08)",
              margin: "9px 0 11px",
            }}>
              <div style={{
                height: "100%", borderRadius: 999,
                width: kcalPct !== null ? `${kcalPct * 100}%` : "0%",
                background: kcalPct !== null && kcalPct >= 1
                  ? "#f87171"
                  : "var(--phase-accent)",
                transition: "width 0.7s cubic-bezier(0.22,1,0.36,1)",
              }} />
            </div>

            {/* Meal emoji strip */}
            <div style={{
              display: "flex", gap: 6, alignItems: "center",
              flexWrap: "nowrap", overflowX: "auto",
              scrollbarWidth: "none", WebkitScrollbarWidth: "none",
            }}>
              {mealEmojis.map((item, i) =>
                item.type === "emoji" ? (
                  <span key={i} style={{ fontSize: 20, flexShrink: 0, lineHeight: 1 }}>
                    {item.val}
                  </span>
                ) : (
                  <span key={i} style={{
                    fontSize: 11, flexShrink: 0,
                    fontFamily: "var(--font-mono)",
                    color: "var(--yr-muted)",
                  }}>
                    {item.val}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Right — three macro rings */}
          <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <MacroRing
                label="P" grams={stats.protein} targetG={macroTargets.protein}
                color="var(--phase-accent)"
              />
              <MacroRing
                label="C" grams={stats.carbs} targetG={macroTargets.carbs}
                color="color-mix(in oklch, var(--phase-accent) 55%, #60a5fa)"
              />
              <MacroRing
                label="F" grams={stats.fat} targetG={macroTargets.fat}
                color="color-mix(in oklch, var(--phase-accent) 45%, #f87171)"
              />
            </div>
            {!hasMacros && (
              <div style={{
                fontSize: 9, color: "var(--yr-faint)",
                fontFamily: "var(--font-mono)", textAlign: "center",
                maxWidth: 140, lineHeight: 1.4,
              }}>
                add P/C/F when logging meals
              </div>
            )}
          </div>
        </div>
      )}
    </button>
  );
}
