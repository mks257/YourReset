import { T } from "../theme";
import { NUTRITION_PHASES, getDailyNudge } from "../nutritionEngine";
import { PHASE_EMOJI } from "../cycleEngine";

const GENERAL_TIPS = {
  protein: "Aim for 1.6–2.0 g/kg bodyweight daily to support muscle building and recovery. Distribute protein across 3–4 meals throughout the day.",
  carbs: "Choose complex carbohydrates — oats, sweet potato, brown rice, legumes — to fuel training and maintain steady energy throughout the day.",
  hydration: "Aim for 2–2.5 L of water daily, adding 400–600 ml for every hour of exercise. Electrolytes matter if you sweat heavily.",
  keyNutrients: [
    { name: "Protein", why: "Essential for muscle repair, hormone production, and satiety.", foods: ["Chicken", "Eggs", "Greek yogurt", "Lentils", "Tofu"] },
    { name: "Iron", why: "Active women are often iron-deficient, leading to fatigue and poor performance.", foods: ["Lean red meat", "Spinach", "Lentils", "Pumpkin seeds", "Dark chocolate"] },
    { name: "Omega-3s", why: "Reduce inflammation, support joint health, and improve recovery.", foods: ["Salmon", "Sardines", "Walnuts", "Flaxseed", "Chia seeds"] },
    { name: "Magnesium", why: "Involved in 300+ enzymatic reactions. Supports sleep, muscle function, and mood.", foods: ["Dark leafy greens", "Almonds", "Avocado", "Banana", "Dark chocolate"] },
  ],
  cravings: "Cravings are often signals from your body, not failures of willpower. Consistent meals with protein, fat, and fiber reduce cravings naturally. When they hit, aim for a nutrient-dense version first — dark chocolate over milk chocolate, fruit over candy.",
  mealIdeas: [
    "Scrambled eggs with spinach and sourdough toast",
    "Grilled chicken salad with avocado and quinoa",
    "Salmon rice bowl with edamame and sesame dressing",
    "Lentil soup with crusty bread",
    "Greek yogurt with berries, granola, and chia seeds",
    "Banana + almond butter pre-workout snack",
  ],
};

function NutritionTab({ cycleState, profile }) {
  const phase = cycleState?.phase;
  const data = phase ? NUTRITION_PHASES[phase] : null;
  const nudge = phase ? getDailyNudge(phase) : null;
  const d = data || GENERAL_TIPS;
  const phaseColor = cycleState?.color || T.teal;
  const phaseEmoji = phase ? PHASE_EMOJI[phase] : "🥗";
  const phaseLabel = cycleState?.label || "General Wellness";

  return (
    <div className="fu d2">
      {/* Hero card */}
      <div style={{ background: T.card, border: `1px solid ${phaseColor}33`, borderRadius: 20, padding: "20px 22px", marginBottom: 16, borderLeft: `4px solid ${phaseColor}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: "1.5rem" }}>{phaseEmoji}</span>
          <div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: "1rem", color: phaseColor }}>{phaseLabel} Nutrition</div>
            {cycleState && <div style={{ fontSize: "0.68rem", color: T.muted, marginTop: 2 }}>Day {cycleState.dayOfCycle} of {cycleState.cycleLength}</div>}
          </div>
        </div>
        {nudge && (
          <div style={{ fontSize: "0.82rem", color: "rgba(240,238,255,0.85)", lineHeight: 1.6, padding: "10px 14px", background: `${phaseColor}0d`, borderRadius: 10, fontStyle: "italic" }}>
            "{nudge}"
          </div>
        )}
        {!phase && (
          <div style={{ fontSize: "0.78rem", color: "rgba(240,238,255,0.65)", lineHeight: 1.6 }}>
            Enable cycle tracking in your profile to get personalized, phase-synced nutrition guidance. For now, here are evidence-based guidelines for active women.
          </div>
        )}
      </div>

      {/* 2x2 macro grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        {[
          { icon: "🥩", title: "Protein", content: d.protein, color: T.pink },
          { icon: "🍠", title: "Carbs", content: d.carbs, color: T.amber },
          { icon: "💧", title: "Hydration", content: d.hydration, color: T.teal },
          { icon: "✨", title: "Key Nutrients", content: null, color: T.violet, isNutrients: true },
        ].map(card => (
          <div key={card.title} style={{ background: T.card, border: `1px solid ${card.color}22`, borderRadius: 16, padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: "1rem" }}>{card.icon}</span>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "0.82rem", color: card.color }}>{card.title}</div>
            </div>
            {card.isNutrients ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {d.keyNutrients.map(n => (
                  <div key={n.name} style={{ fontSize: "0.68rem" }}>
                    <span style={{ color: T.violet, fontWeight: 700 }}>{n.name}</span>
                    <span style={{ color: T.muted }}> — {n.why}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: "0.72rem", color: "rgba(240,238,255,0.7)", lineHeight: 1.55 }}>{card.content}</div>
            )}
          </div>
        ))}
      </div>

      {/* Key nutrients detail */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: "18px 20px", marginBottom: 16 }}>
        <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "0.9rem", marginBottom: 14 }}>✨ Key Nutrients — Food Sources</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {d.keyNutrients.map(n => (
            <div key={n.name} style={{ borderLeft: `3px solid ${phaseColor}`, paddingLeft: 12 }}>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: "0.82rem", color: phaseColor, marginBottom: 3 }}>{n.name}</div>
              <div style={{ fontSize: "0.7rem", color: "rgba(240,238,255,0.65)", lineHeight: 1.5, marginBottom: 5 }}>{n.why}</div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {n.foods.map(f => (
                  <span key={f} style={{ fontSize: "0.62rem", padding: "2px 8px", borderRadius: 100, background: `${phaseColor}15`, color: phaseColor, fontWeight: 600 }}>{f}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cravings card */}
      <div style={{ background: T.card, border: `1px solid ${T.pink}22`, borderRadius: 16, padding: "16px 18px", marginBottom: 16 }}>
        <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "0.88rem", color: T.pink, marginBottom: 8 }}>🍫 Cravings & Appetite</div>
        <div style={{ fontSize: "0.78rem", color: "rgba(240,238,255,0.75)", lineHeight: 1.6 }}>{d.cravings}</div>
      </div>

      {/* Meal ideas */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: "18px 20px" }}>
        <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "0.9rem", marginBottom: 14 }}>🍽 Meal Ideas for This Phase</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {d.mealIdeas.map((meal, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: T.card2, borderRadius: 10 }}>
              <div style={{ width: 24, height: 24, borderRadius: 8, background: `${phaseColor}20`, color: phaseColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
              <div style={{ fontSize: "0.78rem", color: "rgba(240,238,255,0.85)" }}>{meal}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, padding: "10px 14px", background: `${T.amber}0d`, borderRadius: 10, fontSize: "0.68rem", color: T.muted, lineHeight: 1.5 }}>
          <span style={{ color: T.amber, fontWeight: 700 }}>Note: </span>These are suggestions, not prescriptions. Listen to your body, adjust for allergies and preferences, and consult a registered dietitian for personalized medical nutrition advice.
        </div>
      </div>
    </div>
  );
}

export default NutritionTab;
