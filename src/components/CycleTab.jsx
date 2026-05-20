import { useState, useEffect, useRef } from "react";
import { PHASES, PHASE_EMOJI, PCOS_GUIDANCE, getPhaseWindows, getCycleState } from "../cycleEngine";
import { useCountUp } from "./MotionHooks";
import * as Storage from "../storage";

export default function CycleTab({ cycleState, profile, readiness, setReadiness, onResetProfile, onUpdateProfile, motion = "full" }) {
  const [showPcos, setShowPcos] = useState(false);
  const [isHormonalBc, setIsHormonalBc] = useState(profile?.isHormonalBc || false);
  const [opkConfirmed, setOpkConfirmed] = useState(false);
  const [showNextPhaseDetails, setShowNextPhaseDetails] = useState(false);
  
  // Local readiness state for immediate slider response, synced to global
  const [localReadiness, setLocalReadiness] = useState(readiness || {
    energy: 3,
    mood: 3,
    cramps: 1,
    sleep: 3,
    soreness: 1
  });

  // Sync global readiness to local if changed elsewhere
  useEffect(() => {
    if (readiness) {
      setLocalReadiness(prev => {
        // Only update if actually different to avoid loops
        if (JSON.stringify(prev) !== JSON.stringify(readiness)) return readiness;
        return prev;
      });
    }
  }, [readiness]);

  const animOn = motion !== "off";
  const fullMotion = motion === "full";

  const cycleLength = cycleState?.cycleLength || profile?.cycleLength || 28;
  const today       = cycleState?.dayOfCycle || 1;
  const ovulationDay = cycleLength - 14;
  const todayAnim   = useCountUp(today, { duration:800, enabled:animOn });

  // 1 — Readiness calculation
  // energy: 1-5, mood: 1-5, sleep: 1-5 (higher is better)
  // cramps: 1-5, soreness: 1-5 (higher is worse, so we invert)
  const scoreRaw = localReadiness.energy + localReadiness.mood + localReadiness.sleep + (6 - localReadiness.cramps) + (6 - localReadiness.soreness);
  const readinessPercentage = Math.min(100, Math.round((scoreRaw / 25) * 100));
  
  const getReadinessLabel = (score) => {
    if (score >= 80) return { label: "Optimal", color: "var(--phase-follicular)", bg: "rgba(155, 216, 180, 0.15)" };
    if (score >= 60) return { label: "Steady", color: "var(--phase-ovulatory)", bg: "rgba(242, 189, 115, 0.15)" };
    return { label: "Reduced", color: "var(--phase-menstrual)", bg: "rgba(217, 138, 168, 0.15)" };
  };
  const rStatus = getReadinessLabel(readinessPercentage);

  function phaseColorOf(d) {
    if (d <= 5) return "var(--phase-menstrual)";
    if (d < ovulationDay) return "var(--phase-follicular)";
    if (d <= ovulationDay + 2) return "var(--phase-ovulatory)";
    return "var(--phase-luteal)";
  }

  const phaseWindows = cycleState?.windows || getPhaseWindows(cycleLength);
  const phaseList = [
    { key: "menstrual",    label:"Menstrual",    range:`Days 1–5`,                         color:"var(--phase-menstrual)" },
    { key: "follicular",   label:"Follicular",   range:`Days 6–${ovulationDay-1}`,         color:"var(--phase-follicular)" },
    { key: "ovulatory",    label:"Ovulatory",    range:`Days ${ovulationDay}–${ovulationDay+2}`, color:"var(--phase-ovulatory)" },
    { key: "luteal_early", label:"Luteal early", range:`Days ${ovulationDay+3}–${ovulationDay+9}`, color:"var(--phase-luteal)" },
    { key: "luteal_late",  label:"Luteal late",  range:`Days ${ovulationDay+10}–${cycleLength}`,    color:"var(--phase-luteal)" },
  ];

  // Next phase logic
  const currentPhaseIndex = phaseList.findIndex(p => {
    const window = phaseWindows[p.key];
    return today >= window[0] && today <= window[1];
  });
  const nextPhaseIndex = (currentPhaseIndex + 1) % phaseList.length;
  const nextPhaseInfo = phaseList[nextPhaseIndex];
  const nextPhaseData = PHASES[nextPhaseInfo.key];
  const daysUntilNext = phaseWindows[nextPhaseInfo.key][0] > today 
    ? phaseWindows[nextPhaseInfo.key][0] - today 
    : (cycleLength - today) + phaseWindows[nextPhaseInfo.key][0];

  // Cycle length stepper
  const cur = useRef(cycleLength);
  const [displayed, setDisplayed] = useState(cycleLength);
  useEffect(() => { cur.current = cycleLength; setDisplayed(cycleLength); }, [cycleLength]);
  const step = (delta) => {
    const next = Math.min(45, Math.max(21, cur.current + delta));
    cur.current = next; setDisplayed(next);
    if (onUpdateProfile) {
      // Route through Storage so Capacitor Preferences receives the write.
      // onUpdateProfile in App.jsx already calls Storage.set("profile", ...)
      // so we just hand it the diff.
      onUpdateProfile({ cycleLength: next });
    }
  };

  const updateReadiness = (key, val) => {
    const numericVal = parseInt(val);
    const updated = { ...localReadiness, [key]: numericVal };
    setLocalReadiness(updated);
    setReadiness(updated); // Feed to global state
  };

  const handleBcToggle = () => {
    const newVal = !isHormonalBc;
    setIsHormonalBc(newVal);
    if (onUpdateProfile) {
      onUpdateProfile({ isHormonalBc: newVal });
    }
  };

  if (!cycleState) {
    return (
      <div className="yr-stack-lg">
        <div>
          <div className="yr-overline">Cycle tracking</div>
          <h1 className="yr-display" style={{ fontSize:"clamp(32px,5vw,52px)", fontWeight:500, letterSpacing:"-0.03em", margin:0 }}>
            Not enabled.
          </h1>
          <p style={{ color:"var(--yr-muted)", fontSize:14, marginTop:8, maxWidth:"50ch" }}>
            Cycle-aware programming adapts your workouts to your hormonal phase. Update your profile to enable it.
          </p>
          <button onClick={onResetProfile} style={{ marginTop:16, background:"transparent", border:"1px solid var(--yr-border)", borderRadius:999, padding:"10px 20px", color:"var(--yr-text)", cursor:"pointer", fontFamily:"inherit" }}>
            Update profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="yr-stack-lg" style={{ paddingBottom: 40 }}>
      {/* 1 — Daily Symptom Check-in */}
      <section style={{ background: "var(--yr-bg-elev)", border: "1px solid var(--yr-border)", borderRadius: 24, padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div className="yr-overline">Morning Check-in</div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>Daily readiness</h2>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ background: rStatus.bg, color: rStatus.color, padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {rStatus.label} {readinessPercentage}%
            </div>
            <div style={{ width: 120, height: 4, background: "var(--yr-surface-2)", borderRadius: 2, marginTop: 8, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: "0 auto 0 0", width: `${readinessPercentage}%`, background: rStatus.color, borderRadius: 2, transition: "width 0.8s var(--ease-house)" }} />
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 20 }}>
          {[
            { key: "energy", label: "Energy", icon: "⚡" },
            { key: "mood", label: "Mood", icon: "🧠" },
            { key: "cramps", label: "Cramps", icon: "🩸" },
            { key: "sleep", label: "Sleep", icon: "🌙" },
            { key: "soreness", label: "Soreness", icon: "💪" }
          ].map(s => (
            <div key={s.key}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--yr-muted)", marginBottom: 8 }}>
                <span>{s.icon} {s.label}</span>
                <span style={{ fontFamily: "var(--font-mono)" }}>{localReadiness[s.key]}</span>
              </div>
              <input 
                type="range" min="1" max="5" step="1" 
                value={localReadiness[s.key]} 
                onChange={(e) => updateReadiness(s.key, e.target.value)}
                style={{ width: "100%", accentColor: rStatus.color, cursor: "pointer" }}
              />
            </div>
          ))}
        </div>
        
        <div style={{ marginTop: 20, padding: "12px 16px", borderRadius: 12, background: "var(--yr-surface)", border: "1px solid var(--yr-border)", fontSize: 13, color: "var(--yr-text-2)", display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 16 }}>🎯</span>
          <span>Today's intensity adjusted to <b>{readinessPercentage >= 80 ? "100%" : readinessPercentage >= 60 ? "85%" : "70%"}</b> based on your signals.</span>
        </div>
      </section>

      {/* Header section */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div className="yr-overline">{cycleState.label}</div>
          {opkConfirmed && (
             <div style={{ fontSize: 10, color: "var(--phase-follicular)", background: "rgba(155, 216, 180, 0.1)", padding: "2px 8px", borderRadius: 999, border: "1px solid rgba(155, 216, 180, 0.3)", display: "flex", alignItems: "center", gap: 4 }}>
               <span style={{ fontSize: 12 }}>✓</span> OPK confirmed
             </div>
          )}
        </div>
        <h1 className="yr-display" style={{ fontSize:"clamp(32px,5vw,52px)", fontWeight:500, letterSpacing:"-0.03em", margin:0 }}>
          {cycleState.phase === "follicular" ? "A strong window." :
           cycleState.phase === "ovulatory"  ? "Peak power." :
           cycleState.phase === "menstrual"  ? "Restore and rest." : "Stabilize your gains."}
        </h1>
        <p style={{ color:"var(--yr-muted)", fontSize:14, maxWidth:"60ch", marginTop:8, lineHeight:1.6 }}>
          {cycleState.tip}
        </p>
        <div style={{ marginTop:12, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize:11, color:"var(--yr-faint)", fontFamily:"var(--font-mono)" }}>
            Calendar estimate · may vary ±2–4 days
          </div>
          <button 
            onClick={() => setOpkConfirmed(!opkConfirmed)}
            style={{ background: "transparent", border: "1px solid var(--yr-border)", borderRadius: 999, padding: "4px 10px", fontSize: 10, color: "var(--yr-text-2)", cursor: "pointer", fontFamily: "var(--font-mono)" }}
          >
            {opkConfirmed ? "Edit log" : "Log OPK+"}
          </button>
        </div>
        {opkConfirmed && (
          <div style={{ marginTop: 8, fontSize: 11, color: "var(--phase-follicular)", fontStyle: "italic" }}>
            Phase accuracy improved based on your LH surge signal.
          </div>
        )}
      </div>

      <div className="yr-clock-wrap">
        {/* Clock face */}
        <div className="yr-clock">
          {Array.from({ length: cycleLength }).map((_, i) => {
            const d = i + 1;
            const angle = (d / cycleLength) * 360 - 90;
            const isToday = d === today;
            return (
              <div key={d}
                className={`yr-clock-day${animOn ? " yr-anim-clock-day" : ""}${isToday && fullMotion ? " yr-anim-clock-today" : ""}`}
                style={{
                  left:"calc(50% - 4px)", top:0,
                  transform:`rotate(${angle}deg) translateY(0px)`,
                  background: phaseColorOf(d),
                  opacity: isToday ? 1 : 0.4,
                  height: isToday ? 32 : 16,
                  width: isToday ? 4 : 6,
                  boxShadow: isToday ? `0 0 16px ${phaseColorOf(d)}` : "none",
                  "--i": i,
                }}
                title={`Day ${d}`}
              />
            );
          })}
          <div className="yr-clock-center">
            <div className="yr-overline">Day</div>
            <div className="yr-clock-num">{todayAnim}</div>
            <div className="yr-clock-of">of {cycleLength}</div>
          </div>
        </div>

        {/* 2 — Hormone Curve SVG & Phase list */}
        <div className="yr-stack-lg">
          <div>
             <div className="yr-overline">Hormone Landscape</div>
             <div style={{ height: 120, width: "100%", background: "var(--yr-surface)", borderRadius: 16, padding: "16px 12px 8px", position: "relative", overflow: "hidden", border: "1px solid var(--yr-border)" }}>
                <svg viewBox={`0 0 ${cycleLength} 100`} preserveAspectRatio="none" style={{ width: "100%", height: "100%", overflow: "visible" }}>
                   {/* Background bands */}
                   <rect x="0" y="0" width="5" height="100" fill="var(--phase-menstrual)" fillOpacity="0.05" />
                   <rect x="5" y="0" width={ovulationDay - 5} height="100" fill="var(--phase-follicular)" fillOpacity="0.05" />
                   <rect x={ovulationDay} y="0" width="3" height="100" fill="var(--phase-ovulatory)" fillOpacity="0.05" />
                   <rect x={ovulationDay + 3} y="0" width={cycleLength - (ovulationDay + 3)} height="100" fill="var(--phase-luteal)" fillOpacity="0.05" />
                   
                   {/* Current day marker */}
                   <line x1={today} y1="0" x2={today} y2="100" stroke="var(--yr-text)" strokeWidth="0.5" strokeDasharray="2 2" />

                   {/* Estrogen Curve (Amber) */}
                   <path 
                      d={`M 0 80 Q ${ovulationDay * 0.8} 80, ${ovulationDay} 20 Q ${ovulationDay + 4} 80, ${ovulationDay + 7} 60 Q ${cycleLength * 0.8} 50, ${cycleLength} 85`}
                      fill="none" stroke="#f2bd73" strokeWidth="2.5" strokeLinecap="round"
                   />
                   
                   {/* Progesterone Curve (Lavender) */}
                   <path 
                      d={`M 0 95 L ${ovulationDay} 95 Q ${ovulationDay + 7} 20, ${cycleLength - 3} 60 L ${cycleLength} 90`}
                      fill="none" stroke="#b79cff" strokeWidth="2.5" strokeLinecap="round"
                   />
                </svg>
                <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                   <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: "#f2bd73", fontFamily: "var(--font-mono)" }}>
                      <div style={{ width: 6, height: 6, borderRadius: 1, background: "#f2bd73" }} /> Estrogen
                   </div>
                   <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: "#b79cff", fontFamily: "var(--font-mono)" }}>
                      <div style={{ width: 6, height: 6, borderRadius: 1, background: "#b79cff" }} /> Progesterone
                   </div>
                </div>
             </div>
          </div>

          <div>
            <div className="yr-overline">Phase windows</div>
            {phaseList.map((p, i) => (
              <div key={p.label} className={animOn ? "yr-anim-ledger-row" : ""}
                style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 0", borderTop:"1px solid var(--yr-border)", "--i":i }}>
                <div style={{ width:4, height:28, borderRadius:2, background:p.color, flexShrink:0 }} />
                <div>
                  <div style={{ fontSize:14, fontWeight:500 }}>{p.label}</div>
                  <div style={{ fontSize:11, color:"var(--yr-muted)", fontFamily:"var(--font-mono)" }}>{p.range}</div>
                </div>
              </div>
            ))}

            {/* Cycle length stepper */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", borderTop:"1px solid var(--yr-border-strong)", padding:"20px 0", marginTop:8 }}>
              <div>
                <div className="yr-overline">Cycle length</div>
                <div style={{ fontSize:12, color:"var(--yr-muted)" }}>Typical 21–45 days</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <button onClick={() => step(-1)} style={{ width:40, height:40, borderRadius:999, border:"1px solid var(--yr-border)", background:"transparent", color:"var(--yr-text)", cursor:"pointer", fontSize:18 }}>−</button>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:24, fontWeight:500, minWidth:80, textAlign:"center", letterSpacing:"-0.02em" }}>
                  {displayed}<span style={{ fontSize:12, color:"var(--yr-muted)", marginLeft:6 }}>days</span>
                </div>
                <button onClick={() => step(+1)} style={{ width:40, height:40, borderRadius:999, border:"1px solid var(--yr-border)", background:"transparent", color:"var(--yr-text)", cursor:"pointer", fontSize:18 }}>+</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 — Next-phase countdown */}
      <section style={{ background: "var(--yr-bg-elev)", border: "1px solid var(--yr-border)", borderRadius: 20, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="yr-overline">Upcoming</div>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 500 }}>{nextPhaseData.label}</h3>
            <div style={{ fontSize: 12, color: "var(--yr-muted)", marginTop: 4 }}>
              Starting in <b>{daysUntilNext} {daysUntilNext === 1 ? "day" : "days"}</b>
            </div>
          </div>
          <button 
            onClick={() => setShowNextPhaseDetails(!showNextPhaseDetails)}
            style={{ background: "transparent", border: "none", color: "var(--phase-accent)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
          >
            {showNextPhaseDetails ? "Collapse" : "What changes →"}
          </button>
        </div>
        
        {showNextPhaseDetails && (
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--yr-border)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
             <div>
                <div style={{ fontSize: 10, textTransform: "uppercase", color: "var(--yr-muted)", letterSpacing: "0.05em", marginBottom: 6 }}>Training</div>
                <div style={{ fontSize: 13, color: "var(--yr-text)" }}>{nextPhaseData.setsReps}</div>
             </div>
             <div>
                <div style={{ fontSize: 10, textTransform: "uppercase", color: "var(--yr-muted)", letterSpacing: "0.05em", marginBottom: 6 }}>Nutrition nudge</div>
                <div style={{ fontSize: 13, color: "var(--yr-text)", lineHeight: 1.4 }}>{nextPhaseData.nutrition.split('.')[0]}.</div>
             </div>
             <div>
                <div style={{ fontSize: 10, textTransform: "uppercase", color: "var(--yr-muted)", letterSpacing: "0.05em", marginBottom: 6 }}>Recovery tip</div>
                <div style={{ fontSize: 13, color: "var(--yr-text)", lineHeight: 1.4 }}>{nextPhaseData.tip.split('.')[0]}.</div>
             </div>
          </div>
        )}
      </section>

      {/* 4 — Hormonal BC Toggle & PCOS */}
      <div className="yr-stack-lg" style={{ borderTop:"1px solid var(--yr-border)", paddingTop:24 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontWeight:600, fontSize:14 }}>Hormonal Contraception</div>
            <div style={{ fontSize:12, color:"var(--yr-muted)", marginTop:2 }}>Adapts recommendations for suppressed cycles</div>
          </div>
          <button 
            onClick={handleBcToggle}
            style={{ 
              background: isHormonalBc ? "var(--yr-text)" : "transparent", 
              border: "1px solid var(--yr-border)", 
              borderRadius: 999, 
              padding: "6px 14px", 
              color: isHormonalBc ? "var(--yr-bg)" : "var(--yr-text-2)", 
              cursor: "pointer", 
              fontFamily: "inherit", 
              fontSize: 12,
              fontWeight: isHormonalBc ? 600 : 400,
              transition: "all 0.2s"
            }}
          >
            {isHormonalBc ? "ON" : "OFF"}
          </button>
        </div>
        
        {isHormonalBc && (
          <div style={{ background: "rgba(140, 200, 255, 0.08)", border: "1px solid rgba(140, 200, 255, 0.2)", borderRadius: 16, padding: 16, marginTop: -8 }}>
             <p style={{ fontSize: 13, color: "var(--yr-text-2)", lineHeight: 1.6, margin: 0 }}>
               Hormonal contraception suppresses natural hormone fluctuations. Phase-based training is less applicable; please use the <b>Daily Symptom Check-in</b> at the top of the page for intensity guidance instead.
             </p>
          </div>
        )}

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontWeight:600, fontSize:14 }}>PCOS or irregular cycle?</div>
            <div style={{ fontSize:12, color:"var(--yr-muted)", marginTop:2 }}>Different programming applies</div>
          </div>
          <button onClick={() => setShowPcos(o=>!o)} style={{ background:"transparent", border:"1px solid var(--yr-border)", borderRadius:999, padding:"6px 14px", color:"var(--yr-text-2)", cursor:"pointer", fontFamily:"inherit", fontSize:12 }}>
            {showPcos ? "Hide" : "Show"}
          </button>
        </div>
        {showPcos && (
          <div style={{ paddingBottom:8 }}>
            <p style={{ fontSize:13, color:"var(--yr-muted)", lineHeight:1.6, margin:"0 0 12px" }}>{PCOS_GUIDANCE.tip}</p>
            {PCOS_GUIDANCE.recommendations.map((r,i) => (
              <div key={i} style={{ display:"flex", gap:10, marginBottom:8 }}>
                <span style={{ color:"var(--phase-accent)", fontFamily:"var(--font-mono)", fontSize:12 }}>—</span>
                <span style={{ fontSize:13, color:"var(--yr-text-2)", lineHeight:1.5 }}>{r}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6 — Phase-specific recovery tip */}
      <section style={{ 
        background: `color-mix(in oklch, ${cycleState.color} 10%, transparent)`, 
        border: `1px solid color-mix(in oklch, ${cycleState.color} 30%, transparent)`, 
        borderRadius: 20, 
        padding: 24,
        marginTop: 12
      }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: cycleState.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
             <span style={{ margin: "auto" }}>{PHASE_EMOJI[cycleState.phase] || "✨"}</span>
          </div>
          <div>
            <div className="yr-overline" style={{ color: cycleState.color, opacity: 0.8 }}>Phase Protocol</div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{cycleState.label} Recovery</h3>
          </div>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
           <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--yr-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Sleep & Hydration</div>
              <p style={{ fontSize: 13, color: "var(--yr-text-2)", lineHeight: 1.5, margin: 0 }}>
                {cycleState.phase === 'menstrual' ? 'Aim for 8+ hours. Warm liquids (ginger tea) support pelvic circulation.' :
                 cycleState.phase === 'follicular' ? 'Core temperature is lower; sleep quality is typically peak. Hydrate for intensity.' :
                 cycleState.phase === 'ovulatory'  ? 'Estrogen may slightly disrupt sleep; prioritize a cool room (18°C) and magnesium.' :
                 'Progesterone raises core temp; you may need more water and an earlier bedtime for same recovery.'}
              </p>
           </div>
           <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--yr-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Mobility Focus</div>
              <p style={{ fontSize: 13, color: "var(--yr-text-2)", lineHeight: 1.5, margin: 0 }}>
                {cycleState.phase === 'ovulatory' ? 'Focus on dynamic stability rather than deep passive stretching (ACL caution).' :
                 cycleState.phase === 'menstrual' ? 'Gentle hip openers and spinal twists to relieve lower back tension.' :
                 'Full range of motion work. Rising hormones support connective tissue repair.'}
              </p>
           </div>
        </div>
      </section>

      {/* Research disclaimer */}
      <div style={{ fontSize:11, color:"var(--yr-faint)", lineHeight:1.6, borderTop:"1px solid var(--yr-border)", paddingTop:24 }}>
        Phase-based programming is based on current evidence, which is still evolving. Individual responses vary significantly. Not medical advice. For PCOS, endometriosis, or PMDD, consult a healthcare provider.
      </div>

      {/* ACL Warning - Preserved feature */}
      {cycleState.phase === 'ovulatory' && (
        <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 12, background: "rgba(248, 113, 113, 0.1)", border: "1px solid rgba(248, 113, 113, 0.2)", color: "#f87171", fontSize: 12, display: "flex", gap: 10, alignItems: "center" }}>
           <span style={{ fontSize: 16 }}>⚠️</span>
           <span><b>ACL Safety:</b> Estrogen peak increases ligament laxity. Prioritize a 10-min dynamic warm-up before intensity.</span>
        </div>
      )}
    </div>
  );
}
