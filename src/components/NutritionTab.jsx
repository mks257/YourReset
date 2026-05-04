import { NUTRITION_PHASES, getDailyNudge, GOAL_NUTRITION, GOAL_NUTRITION_EXTRA, getGoalNudge } from "../nutritionEngine";
import { PHASE_EMOJI } from "../cycleEngine";
import { useCountUp } from "./MotionHooks";

export default function NutritionTab({ cycleState, profile, motion = "full" }) {
  const animOn = motion !== "off";
  const fullMotion = motion === "full";

  const isFemaleCycle = profile?.cycleTracking && cycleState;
  const phase = isFemaleCycle ? cycleState?.phase : null;
  const goal = profile?.goal || "wellness";

  const data = phase
    ? NUTRITION_PHASES[phase]
    : (GOAL_NUTRITION[goal] || GOAL_NUTRITION_EXTRA?.[goal]);

  const nudge = phase ? getDailyNudge?.(phase) : getGoalNudge?.(goal);
  const d = data || {};

  const phaseLabel = phase
    ? `${PHASE_EMOJI[phase]} ${cycleState?.label} Nutrition`
    : `${goal.replace("_"," ")} Nutrition`;

  const kcalTarget = phase === "luteal_late" ? 2050 : 1820;
  const kcalAnim = useCountUp(kcalTarget, { duration:1100, enabled:animOn });

  const macros = [
    { key:"protein",  label:"Protein",  val:"128g", pct:"35%", c:"var(--phase-accent)" },
    { key:"carbs",    label:"Carbs",    val:"215g", pct:"25%", c:"color-mix(in oklch, var(--phase-accent) 50%, transparent)" },
    { key:"fat",      label:"Fat",      val:"62g",  pct:"20%", c:"var(--yr-text-2)" },
    { key:"fiber",    label:"Fiber",    val:"32g",  pct:"20%", c:"var(--yr-surface-2)" },
  ];

  const cards = d.keyNutrients ? d.keyNutrients.slice(0,4).map(n => ({
    key: n.name, title: n.name, body: n.why,
  })) : [
    { key:"protein",  title:"Protein",   body: d.protein || "Aim for consistent protein across meals." },
    { key:"carbs",    title:"Carbs",     body: d.carbs   || "Focus on complex carbohydrates." },
    { key:"hydration",title:"Hydration", body: d.hydration || "Aim for 2–2.5L per day." },
    { key:"timing",   title:"Timing",    body: "Pre/post-workout nutrition matters most on training days." },
  ];

  return (
    <div className="yr-stack-lg">
      <div>
        <div className="yr-overline">{phaseLabel}</div>
        <h1 className="yr-display" style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:500, letterSpacing:"-0.03em", margin:0, maxWidth:"22ch", lineHeight:1.1 }}>
          {nudge || "Fuel your training well."}
        </h1>
      </div>

      {/* Plate */}
      <div className={`yr-plate${animOn ? " yr-anim-plate" : ""}`}>
        <div className="yr-plate-disc" />
        <div className={`yr-plate-slice${fullMotion ? " yr-bento-breathe" : ""}`} />
        <div className="yr-plate-hole">
          <div className="yr-overline">Target</div>
          <div style={{ fontFamily:"var(--font-mono)", fontSize:32, fontWeight:500, color:"var(--phase-accent)", letterSpacing:"-0.03em" }}>
            {kcalAnim.toLocaleString()}
          </div>
          <div style={{ fontSize:11, color:"var(--yr-muted)", fontFamily:"var(--font-mono)" }}>kcal · today</div>
        </div>
      </div>

      {/* Macro legend */}
      <div className="yr-plate-legend">
        {macros.map((m, i) => (
          <div className={`yr-plate-legend-item${animOn ? " yr-stagger" : ""}`} key={m.key} style={{ "--c":m.c, "--i":i+2 }}>
            <div className="yr-plate-legend-key">{m.label}</div>
            <div className="yr-plate-legend-val">
              {m.val} <span style={{ color:"var(--yr-muted)", fontSize:12, fontFamily:"var(--font-mono)", marginLeft:6 }}>{m.pct}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Phase guidance */}
      <div>
        <div className="yr-overline">Phase guidance</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", borderTop:"1px solid var(--yr-border)" }}>
          {cards.map((c, i) => (
            <div key={c.key} className={animOn ? "yr-anim-ledger-row" : ""} style={{ borderBottom:"1px solid var(--yr-border)", padding:"16px 16px 16px 0", "--i":i }}>
              <div className="yr-overline" style={{ color:"var(--phase-accent)" }}>{c.title}</div>
              <div style={{ fontSize:13, color:"var(--yr-text-2)", lineHeight:1.55, marginTop:4 }}>{c.body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Meal ideas */}
      {d.mealIdeas && d.mealIdeas.length > 0 && (
        <div>
          <div className="yr-overline">Meal ideas</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:8 }}>
            {d.mealIdeas.slice(0,5).map((meal, i) => (
              <div key={i} style={{ display:"flex", gap:12, padding:"10px 0", borderBottom:"1px solid var(--yr-border)" }}>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--yr-muted)", minWidth:24 }}>{String(i+1).padStart(2,"0")}</div>
                <div style={{ fontSize:13, color:"var(--yr-text-2)" }}>{meal}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ fontSize:11, color:"var(--yr-faint)", lineHeight:1.6 }}>
        These are general wellness suggestions, not prescriptions. Consult a registered dietitian for personalised nutrition advice.
      </div>
    </div>
  );
}
