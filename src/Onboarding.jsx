import { useState, useEffect } from "react";

/**
 * Onboarding flow graph — explicit so we don't end up with fragile
 * `setStep(step + 2)` jumps as the step list grows.
 *
 * Each entry declares next/back for the canonical case. Conditional
 * branches (e.g. gender == "female" -> include cycle step) live as
 * functions of the live form state, not as arithmetic on indices.
 */
const FLOW = {
  welcome:   { next: () => "goal",      back: null },
  goal:      { next: () => "gender",    back: () => "welcome" },
  gender:    {
    next: (s) => s.gender === "female" ? "cycle" : "equipment",
    back: () => "goal",
  },
  cycle:     { next: () => "equipment", back: () => "gender" },
  equipment: {
    next: () => "metrics",
    back: (s) => s.gender === "female" ? "cycle" : "gender",
  },
  metrics:   { next: null,              back: () => "equipment" },
};

// Walk FLOW from welcome with the current state to compute the progress-bar
// position. We can't precompute since the path depends on the gender branch.
function pathFromWelcome(state) {
  const path = ["welcome"];
  let cur = "welcome";
  while (cur) {
    const next = FLOW[cur].next?.(state);
    if (!next) break;
    path.push(next);
    cur = next;
    if (path.length > 20) break; // safety against cycles
  }
  return path;
}

export default function Onboarding({ onComplete }) {
  const [stepKey, setStepKey] = useState("welcome");
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [gender, setGender] = useState("");
  const [cycleOption, setCycleOption] = useState(""); // "track" | "none"
  const [cycleStart, setCycleStart] = useState("");
  const [cycleLength, setCycleLength] = useState(28);
  const [equipment, setEquipment] = useState(["dumbbells", "machines", "cardio"]);

  // Body metrics — feed TDEE in NutritionTab and goal-weight progress in
  // MetricsTab. Optional in onboarding (skippable) but strongly nudged
  // since they unlock the personalised calorie target immediately.
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [heightUnit, setHeightUnit] = useState("cm");
  const [heightCm, setHeightCm] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");

  const GOALS = [
    { id: "fat_loss", label: "Fat Loss", icon: "🔥", desc: "Sustainable deficit & preservation" },
    { id: "strength", label: "Strength", icon: "💪", desc: "Hypertrophy & metabolic power" },
    { id: "wellness", label: "Wellness", icon: "🌿", desc: "Longevity & hormonal balance" },
    { id: "endurance", label: "Endurance", icon: "🏃", desc: "Aerobic base & efficiency" },
  ];

  const EQUIPMENT_OPTIONS = [
    { id: "bodyweight", label: "Bodyweight", icon: "🤸" },
    { id: "dumbbells", label: "Dumbbells", icon: "🏋️" },
    { id: "barbell", label: "Barbell", icon: "⚖️" },
    { id: "bands", label: "Bands", icon: "🔁" },
    { id: "kettlebell", label: "Kettlebell", icon: "🫙" },
    { id: "machines", label: "Gym Machines", icon: "🏟️" },
    { id: "cable", label: "Cable", icon: "🔗" },
    { id: "cardio", label: "Cardio", icon: "🚴" },
  ];

  const toggleEquip = (id) =>
    setEquipment(e => e.includes(id) ? e.filter(x => x !== id) : [...e, id]);

  // Form state snapshot used by FLOW conditional branches (gender → cycle vs equipment)
  const formState = { gender };

  const goNext = () => {
    const target = FLOW[stepKey]?.next?.(formState);
    if (target) setStepKey(target);
    else finish();
  };
  const goBack = () => {
    const target = FLOW[stepKey]?.back?.(formState);
    if (target) setStepKey(target);
  };
  // Side-effect helper: when gender step advances and user is not female,
  // we still want to honour their implicit "no cycle tracking" decision.
  const advanceGender = () => {
    if (gender !== "female") setCycleOption("none");
    goNext();
  };

  const finish = () => {
    // Normalise height into a single numeric field matching SettingsPage's
    // existing schema: cm if heightUnit === "cm", total inches otherwise.
    let height = null;
    if (heightUnit === "cm" && heightCm) {
      height = parseFloat(heightCm);
    } else if (heightUnit === "ft") {
      const ft = parseInt(heightFt || 0);
      const inches = parseInt(heightIn || 0);
      if (ft || inches) height = ft * 12 + inches;
    }

    onComplete({
      name: name.trim() || "You",
      goal,
      gender,
      cycleTracking: cycleOption === "track" && gender === "female",
      cycleStartDate: cycleOption === "track" ? cycleStart : null,
      cycleLength: cycleOption === "track" ? cycleLength : null,
      equipment,
      // Body metrics — null if skipped; SettingsPage already handles missing
      // values and NutritionTab gates TDEE on hasMetrics (weight && height).
      age: age ? parseFloat(age) : null,
      weight: weight ? parseFloat(weight) : null,
      weightUnit,
      height,
      heightUnit,
      // Default activity level — user can refine later in Settings.
      activityLevel: "moderate",
    });
  };

  // Render helpers for the premium aesthetic
  const ScreenWrapper = ({ children, title, subtitle, eyebrow }) => (
    <div className="yr-onboarding-screen yr-tab-fade">
      <div className="yr-onboarding-content">
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          {eyebrow && <div className="yr-overline" style={{ marginBottom: 12 }}>{eyebrow}</div>}
          <h1 className="yr-display" style={{ 
            fontSize: "clamp(32px, 8vw, 56px)", 
            lineHeight: 1, 
            marginBottom: 16,
            fontStyle: "italic" 
          }}>
            {title}
          </h1>
          {subtitle && <p style={{ color: "var(--yr-muted)", fontSize: 16, maxWidth: "36ch", margin: "0 auto" }}>{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );

  const STEPS = {
    // Welcome — Pacific Deep editorial hero: glass orbital ring, Playfair
    // wordmark, italic tagline, privacy reassurance card, name input + CTA.
    welcome: (
    <div key="welcome" className="yr-onboarding-screen yr-tab-fade" style={{
      flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
      padding: "20px 24px 40px",
      gap: 28,
    }}>

      {/* Animated visual anchor — orbital glass ring */}
      <div style={{
        position: "relative",
        width: "min(260px, 60vw)", height: "min(260px, 60vw)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginTop: 24,
      }}>
        {/* Outer glass ring */}
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: "1px solid color-mix(in oklch, var(--phase-accent) 18%, transparent)",
          background: "linear-gradient(135deg, color-mix(in oklch, var(--phase-accent) 8%, transparent), transparent 60%)",
          backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
        }} />
        {/* Inner glow */}
        <div style={{
          position: "absolute",
          width: "60%", height: "60%", borderRadius: "50%",
          background: "color-mix(in oklch, var(--phase-accent) 18%, transparent)",
          filter: "blur(40px)",
        }} />
        {/* Centerpiece — Playfair Y mark */}
        <div style={{
          position: "relative", zIndex: 1,
          width: "50%", height: "50%", borderRadius: "50%",
          background: "color-mix(in oklch, var(--phase-accent) 12%, var(--yr-bg))",
          border: "1px solid color-mix(in oklch, var(--phase-accent) 24%, transparent)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-display)",
          fontSize: "clamp(48px, 18vw, 80px)",
          color: "var(--phase-accent)",
          letterSpacing: "-0.04em",
          lineHeight: 1,
        }}>
          Y
        </div>
      </div>

      {/* Editorial typography section */}
      <div style={{
        textAlign: "center", maxWidth: 360, width: "100%",
        display: "flex", flexDirection: "column", gap: 12,
      }}>
        <h1 style={{
          margin: 0,
          fontFamily: "var(--font-display)",
          fontSize: "clamp(40px, 11vw, 56px)",
          fontWeight: 700, lineHeight: 1.05,
          color: "var(--yr-text)",
          letterSpacing: "-0.04em",
        }}>
          YourReset
        </h1>
        <p style={{
          margin: 0,
          fontFamily: "var(--font-display)",
          fontSize: "clamp(18px, 5vw, 22px)",
          fontWeight: 400, fontStyle: "italic",
          color: "var(--phase-accent)",
          letterSpacing: "-0.01em",
        }}>
          Your cycle, your rhythm.
        </p>
        <p style={{
          margin: 0,
          fontFamily: "var(--font-body)",
          fontSize: 15, lineHeight: 1.55,
          color: "var(--yr-text-2)",
          padding: "0 12px",
        }}>
          A restorative companion that aligns your training and nutrition with your unique biological tempo.
        </p>
      </div>

      {/* Name input */}
      <div style={{ width: "100%", maxWidth: 320 }}>
        <div style={{
          fontFamily: "var(--font-body)",
          fontSize: 11, fontWeight: 600,
          letterSpacing: "0.14em", textTransform: "uppercase",
          color: "var(--yr-muted)",
          marginBottom: 8, textAlign: "left",
        }}>
          Your name
        </div>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="How should we call you?"
          style={{
            width: "100%",
            padding: "14px 18px",
            fontSize: 16,  // ≥16 to skip iOS auto-zoom
            fontFamily: "var(--font-body)",
            borderRadius: 14,
            border: "1px solid var(--yr-border)",
            background: "var(--yr-surface)",
            color: "var(--yr-text)",
            outline: "none",
            boxSizing: "border-box",
            minHeight: 48,
          }}
        />
      </div>

      {/* Primary CTA */}
      <button
        onClick={goNext}
        style={{
          width: "100%", maxWidth: 320,
          minHeight: 48,
          padding: "14px 24px",
          background: "var(--phase-accent)",
          color: "var(--yr-bg)",
          border: "none",
          borderRadius: 14,
          fontFamily: "var(--font-body)",
          fontSize: 15, fontWeight: 700,
          letterSpacing: "0.02em",
          cursor: "pointer",
          boxShadow: "0 8px 32px color-mix(in oklch, var(--phase-accent) 20%, transparent)",
        }}
      >
        Get Started
      </button>

      {/* Privacy reassurance card */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 16px",
        background: "color-mix(in oklch, var(--yr-bg-elev) 60%, transparent)",
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        border: "1px solid var(--yr-border)",
        borderRadius: 14,
        maxWidth: 320, width: "100%",
      }}>
        <span style={{ fontSize: 18, color: "var(--phase-accent)" }} aria-hidden="true">🛡</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "var(--font-body)",
            fontSize: 13, fontWeight: 600,
            color: "var(--yr-text)",
          }}>
            Your data stays on device
          </div>
          <div style={{
            fontFamily: "var(--font-body)",
            fontSize: 11,
            color: "var(--yr-muted)",
            marginTop: 1,
          }}>
            No cloud sync. Total privacy by design.
          </div>
        </div>
      </div>
    </div>
    ),

    // Goal — primary intent. Used to tailor the plan and adjust calorie target.
    goal: (
    <ScreenWrapper
      key="goal"
      title="Pick your focus"
      subtitle="We'll tailor your plan around this."
      eyebrow="Focus"
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxWidth: 500, margin: "0 auto" }}>
        {GOALS.map(g => (
          <button 
            key={g.id} 
            className={`yr-onboarding-tile ${goal === g.id ? "active" : ""}`}
            onClick={() => setGoal(g.id)}
          >
            <div className="yr-onboarding-tile-icon">{g.icon}</div>
            <div className="yr-onboarding-tile-label">{g.label}</div>
            <div className="yr-onboarding-tile-desc">{g.desc}</div>
          </button>
        ))}
      </div>
      <div className="yr-onboarding-footer">
        <button className="yr-onboarding-back" onClick={goBack}>← Back</button>
        <button className="yr-hub-cta" onClick={goNext} disabled={!goal}>Continue</button>
      </div>
    </ScreenWrapper>
    ),

    // Gender — branches cycle inclusion in the next step.
    gender: (
    <ScreenWrapper
      key="gender"
      title="About you"
      subtitle="Sets the baseline for hormone and metabolism calculations."
      eyebrow="About you"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 400, margin: "0 auto", width: "100%" }}>
        {[
          { id: "female", label: "Female", icon: "👩" },
          { id: "male", label: "Male", icon: "👨" },
          { id: "other", label: "Non-binary / Other", icon: "🧑" },
        ].map(opt => (
          <button 
            key={opt.id} 
            className={`yr-onboarding-row ${gender === opt.id ? "active" : ""}`}
            onClick={() => setGender(opt.id)}
          >
            <span style={{ fontSize: 20 }}>{opt.icon}</span>
            <span style={{ fontSize: 16, fontWeight: 500 }}>{opt.label}</span>
            <div style={{ marginLeft: "auto", opacity: gender === opt.id ? 1 : 0 }}>
               <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--phase-accent)" }} />
            </div>
          </button>
        ))}
      </div>
      <div className="yr-onboarding-footer">
        <button className="yr-onboarding-back" onClick={goBack}>← Back</button>
        <button className="yr-hub-cta" onClick={advanceGender} disabled={!gender}>Continue</button>
      </div>
    </ScreenWrapper>
    ),

    // Cycle — only reachable when gender === "female" per FLOW.
    cycle: (
    <ScreenWrapper
      key="cycle"
      title="Cycle tracking"
      subtitle="Adapt workouts to your hormonal phase."
      eyebrow="Cycle"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 460, margin: "0 auto", width: "100%" }}>
        {[
          { id: "track", label: "Track my Cycle", sub: "Dynamic adjustment based on phase", icon: "🌱" },
          { id: "none", label: "Standard Plan", sub: "Consistent adaptive progression", icon: "⚡" },
        ].map(opt => (
          <button 
            key={opt.id} 
            className={`yr-onboarding-row ${cycleOption === opt.id ? "active" : ""}`}
            style={{ padding: "20px 24px", height: "auto", textAlign: "left", alignItems: "flex-start", flexDirection: "column", gap: 4 }}
            onClick={() => setCycleOption(opt.id)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
              <span style={{ fontSize: 18 }}>{opt.icon}</span>
              <span style={{ fontSize: 16, fontWeight: 600 }}>{opt.label}</span>
              <div style={{ marginLeft: "auto", opacity: cycleOption === opt.id ? 1 : 0 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--phase-accent)" }} />
              </div>
            </div>
            <div style={{ fontSize: 12, color: "var(--yr-muted)", marginLeft: 28 }}>{opt.sub}</div>
          </button>
        ))}

        {cycleOption === "track" && (
          <div className="yr-onboarding-subpanel">
            <div style={{ marginBottom: 16 }}>
              <div className="yr-overline" style={{ marginBottom: 8 }}>Last Period Start</div>
              <input type="date" className="yr-input" value={cycleStart} onChange={e => setCycleStart(e.target.value)} />
            </div>
            <div>
              <div className="yr-overline" style={{ marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                <span>Cycle Length</span>
                <span style={{ color: "var(--phase-accent)" }}>{cycleLength} Days</span>
              </div>
              <input type="range" min={21} max={40} value={cycleLength} onChange={e => setCycleLength(+e.target.value)} 
                     style={{ width: "100%", accentColor: "var(--phase-accent)" }} />
            </div>
          </div>
        )}
      </div>
      <div className="yr-onboarding-footer">
        <button className="yr-onboarding-back" onClick={goBack}>← Back</button>
        <button className="yr-hub-cta" onClick={goNext} disabled={!cycleOption || (cycleOption === "track" && !cycleStart)}>Continue</button>
      </div>
    </ScreenWrapper>
    ),

    // Equipment — selects which exercises the plan can include.
    equipment: (
    <ScreenWrapper
      key="equip"
      title="Your space"
      subtitle="We'll build the plan around what you have."
      eyebrow="Equipment"
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10, maxWidth: 640, margin: "0 auto" }}>
        {EQUIPMENT_OPTIONS.map(eq => (
          <button
            key={eq.id}
            className={`yr-onboarding-chip ${equipment.includes(eq.id) ? "active" : ""}`}
            onClick={() => toggleEquip(eq.id)}
          >
            <span>{eq.icon}</span> {eq.label}
          </button>
        ))}
      </div>
      <div className="yr-onboarding-footer">
        <button className="yr-onboarding-back" onClick={goBack}>← Back</button>
        <button className="yr-hub-cta" onClick={goNext} disabled={equipment.length === 0}>Continue</button>
      </div>
    </ScreenWrapper>
    ),

    // Metrics (skippable). Powers Mifflin–St Jeor TDEE in NutritionTab.
    metrics: (
    <ScreenWrapper
      key="metrics"
      title="Your numbers"
      subtitle="Optional — unlocks your personalised calorie target."
      eyebrow="Body"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 420, margin: "0 auto", width: "100%" }}>

        {/* Age */}
        <div>
          <div className="yr-overline" style={{ marginBottom: 8 }}>Age</div>
          <input
            className="yr-input"
            type="number"
            inputMode="numeric"
            min="13"
            max="120"
            placeholder="e.g. 28"
            value={age}
            onChange={e => setAge(e.target.value)}
            style={{ fontSize: 16, padding: "14px 16px", borderRadius: 12, width: "100%", boxSizing: "border-box" }}
          />
        </div>

        {/* Weight + unit toggle */}
        <div>
          <div className="yr-overline" style={{ marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
            <span>Weight</span>
            <div style={{ display: "flex", gap: 6 }}>
              {["kg", "lb"].map(u => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setWeightUnit(u)}
                  className={`yr-onboarding-chip ${weightUnit === u ? "active" : ""}`}
                  style={{ padding: "4px 10px", fontSize: 11 }}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
          <input
            className="yr-input"
            type="number"
            inputMode="decimal"
            min="20"
            max="500"
            step="0.1"
            placeholder={weightUnit === "kg" ? "e.g. 65" : "e.g. 143"}
            value={weight}
            onChange={e => setWeight(e.target.value)}
            style={{ fontSize: 16, padding: "14px 16px", borderRadius: 12, width: "100%", boxSizing: "border-box" }}
          />
        </div>

        {/* Height + unit toggle */}
        <div>
          <div className="yr-overline" style={{ marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
            <span>Height</span>
            <div style={{ display: "flex", gap: 6 }}>
              {["cm", "ft"].map(u => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setHeightUnit(u)}
                  className={`yr-onboarding-chip ${heightUnit === u ? "active" : ""}`}
                  style={{ padding: "4px 10px", fontSize: 11 }}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
          {heightUnit === "cm" ? (
            <input
              className="yr-input"
              type="number"
              inputMode="numeric"
              min="100"
              max="250"
              placeholder="e.g. 165"
              value={heightCm}
              onChange={e => setHeightCm(e.target.value)}
              style={{ fontSize: 16, padding: "14px 16px", borderRadius: 12, width: "100%", boxSizing: "border-box" }}
            />
          ) : (
            <div style={{ display: "flex", gap: 10 }}>
              <input
                className="yr-input"
                type="number"
                inputMode="numeric"
                min="3"
                max="8"
                placeholder="ft"
                value={heightFt}
                onChange={e => setHeightFt(e.target.value)}
                style={{ flex: 1, fontSize: 16, padding: "14px 16px", borderRadius: 12, boxSizing: "border-box", minWidth: 0 }}
              />
              <input
                className="yr-input"
                type="number"
                inputMode="numeric"
                min="0"
                max="11"
                placeholder="in"
                value={heightIn}
                onChange={e => setHeightIn(e.target.value)}
                style={{ flex: 1, fontSize: 16, padding: "14px 16px", borderRadius: 12, boxSizing: "border-box", minWidth: 0 }}
              />
            </div>
          )}
        </div>

        <p style={{ fontSize: 11, color: "var(--yr-muted)", lineHeight: 1.5, marginTop: 4 }}>
          Used locally for calorie estimates. Never sent to a server. You can
          update or remove these later in Settings.
        </p>
      </div>

      <div className="yr-onboarding-footer">
        <button className="yr-onboarding-back" onClick={goBack}>← Back</button>
        <button className="yr-onboarding-back" onClick={finish}>Skip for now</button>
        <button className="yr-hub-cta" onClick={finish}>Complete setup</button>
      </div>
    </ScreenWrapper>
    ),
  };

  // Progress bar: position along the path the user has actually taken so
  // far, which differs per gender (cycle step is conditional). Re-derived
  // every render so changing gender mid-flow updates the bar correctly.
  const path = pathFromWelcome(formState);
  const stepIndex = Math.max(0, path.indexOf(stepKey));
  const progressPct = path.length > 1 ? (stepIndex / (path.length - 1)) * 100 : 0;

  return (
    <div className="yr-onboarding-layout">
      {/* Progress Line — clamped to the reachable path, not the static step count */}
      <div className="yr-onboarding-progress">
        <div className="yr-onboarding-progress-fill" style={{ width: `${progressPct}%` }}></div>
      </div>

      <div className="yr-onboarding-inner">
        {STEPS[stepKey]}
      </div>

      <style>{`
        .yr-onboarding-layout {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: transparent;
          color: var(--yr-text);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          font-family: var(--font-body);
        }
        
        .yr-onboarding-progress {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: var(--yr-surface);
          z-index: 10;
        }
        .yr-onboarding-progress-fill {
          height: 100%;
          background: var(--phase-accent);
          transition: width 0.6s cubic-bezier(0.2, 1, 0.3, 1);
        }

        .yr-onboarding-inner {
          position: relative;
          z-index: 5;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .yr-onboarding-screen {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
        }

        .yr-onboarding-content {
          width: 100%;
          max-width: 800px;
          margin-bottom: 60px;
        }

        /* Component: Tiles */
        .yr-onboarding-tile {
          background: var(--yr-bg-elev);
          border: 1px solid var(--yr-border);
          border-radius: 20px;
          padding: 24px;
          text-align: left;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 8px;
          cursor: pointer;
        }
        .yr-onboarding-tile:hover { border-color: var(--yr-border-strong); transform: translateY(-2px); }
        .yr-onboarding-tile.active { border-color: var(--phase-accent); background: var(--yr-surface-2); }
        .yr-onboarding-tile-icon { fontSize: 24px; margin-bottom: 4px; }
        .yr-onboarding-tile-label { fontSize: 16px; font-weight: 600; color: var(--yr-text); }
        .yr-onboarding-tile-desc { fontSize: 12px; color: var(--yr-muted); line-height: 1.4; }

        /* Component: Rows */
        .yr-onboarding-row {
          background: var(--yr-bg-elev);
          border: 1px solid var(--yr-border);
          border-radius: 16px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .yr-onboarding-row:hover { border-color: var(--yr-border-strong); }
        .yr-onboarding-row.active { border-color: var(--phase-accent); background: var(--yr-surface-2); }

        /* Component: Chips */
        .yr-onboarding-chip {
          background: var(--yr-bg-elev);
          border: 1px solid var(--yr-border);
          border-radius: 99px;
          padding: 12px 20px;
          font-size: 13px;
          font-weight: 500;
          color: var(--yr-text-2);
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .yr-onboarding-chip:hover { border-color: var(--yr-border-strong); }
        .yr-onboarding-chip.active { border-color: var(--phase-accent); color: var(--phase-accent); background: var(--yr-surface-2); }

        /* Component: Subpanel */
        .yr-onboarding-subpanel {
          margin-top: 12px;
          padding: 24px;
          background: var(--yr-surface);
          border: 1px solid var(--yr-border);
          border-radius: 20px;
        }

        /* Footer */
        .yr-onboarding-footer {
          margin-top: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
        }
        .yr-onboarding-back {
          background: transparent;
          border: none;
          color: var(--yr-muted);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }
        .yr-onboarding-back:hover { color: var(--yr-text-2); }

        .yr-hub-cta:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          filter: grayscale(1);
        }
      `}</style>
    </div>
  );
}
