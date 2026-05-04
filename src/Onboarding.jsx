import { useState, useEffect } from "react";

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [gender, setGender] = useState("");
  const [cycleOption, setCycleOption] = useState(""); // "track" | "none"
  const [cycleStart, setCycleStart] = useState("");
  const [cycleLength, setCycleLength] = useState(28);
  const [equipment, setEquipment] = useState(["dumbbells", "machines", "cardio"]);

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

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => Math.max(0, s - 1));

  const finish = () => {
    onComplete({
      name: name.trim() || "You",
      goal,
      gender,
      cycleTracking: cycleOption === "track" && gender === "female",
      cycleStartDate: cycleOption === "track" ? cycleStart : null,
      cycleLength: cycleOption === "track" ? cycleLength : null,
      equipment,
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

  const STEPS = [
    // Step 0: Welcome & Name
    <ScreenWrapper 
      key="welcome"
      title="Welcome to YourReset" 
      subtitle="A physiological-first approach to performance."
      eyebrow="Introduction"
    >
      <div style={{ maxWidth: 320, margin: "0 auto", width: "100%" }}>
        <div className="yr-overline" style={{ marginBottom: 8, textAlign: "left" }}>Your Name</div>
        <input 
          className="yr-input"
          style={{ fontSize: 18, padding: "16px 20px", borderRadius: 16 }}
          placeholder="How should we call you?"
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
        />
        <button 
          className="yr-hub-cta" 
          style={{ width: "100%", marginTop: 24, padding: 16, fontSize: 15 }}
          onClick={next}
        >
          Begin Journey
        </button>
      </div>
    </ScreenWrapper>,

    // Step 1: Goal
    <ScreenWrapper 
      key="goal"
      title="Define your Focus" 
      subtitle="We tailor every recommendation to this primary objective."
      eyebrow="Objective"
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
        <button className="yr-onboarding-back" onClick={back}>← Back</button>
        <button className="yr-hub-cta" onClick={next} disabled={!goal}>Continue</button>
      </div>
    </ScreenWrapper>,

    // Step 2: Gender
    <ScreenWrapper 
      key="gender"
      title="Your Physiology" 
      subtitle="Critical for hormonal and metabolic baselines."
      eyebrow="Biology"
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
        <button className="yr-onboarding-back" onClick={back}>← Back</button>
        <button className="yr-hub-cta" onClick={() => {
          if (gender === "female") next();
          else { setCycleOption("none"); setStep(step + 2); }
        }} disabled={!gender}>Continue</button>
      </div>
    </ScreenWrapper>,

    // Step 3: Cycle Tracking (Female Only)
    <ScreenWrapper 
      key="cycle"
      title="Phase Awareness" 
      subtitle="Optimizing workouts around your hormonal architecture."
      eyebrow="Optimization"
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
        <button className="yr-onboarding-back" onClick={back}>← Back</button>
        <button className="yr-hub-cta" onClick={next} disabled={!cycleOption || (cycleOption === "track" && !cycleStart)}>Continue</button>
      </div>
    </ScreenWrapper>,

    // Step 4: Equipment
    <ScreenWrapper 
      key="equip"
      title="Your Space" 
      subtitle="We'll construct your plan based on what's available."
      eyebrow="Logistics"
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
        <button className="yr-onboarding-back" onClick={() => setStep(gender === "female" ? 3 : 2)}>← Back</button>
        <button className="yr-hub-cta" onClick={finish} disabled={equipment.length === 0}>Complete Setup</button>
      </div>
    </ScreenWrapper>
  ];

  return (
    <div className="yr-onboarding-layout">
      {/* Progress Line */}
      <div className="yr-onboarding-progress">
        <div className="yr-onboarding-progress-fill" style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}></div>
      </div>

      <div className="yr-onboarding-inner">
        {STEPS[step]}
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
