import { useState, useEffect, useRef } from "react";
import { PHASES, PHASE_EMOJI, PCOS_GUIDANCE, getPhaseWindows } from "../cycleEngine";
import { useCountUp } from "./MotionHooks";

export default function CycleTab({ cycleState, profile, onResetProfile, onUpdateProfile, motion = "full" }) {
  const [showPcos, setShowPcos] = useState(false);
  const animOn = motion !== "off";
  const fullMotion = motion === "full";

  const cycleLength = cycleState?.cycleLength || profile?.cycleLength || 28;
  const today       = cycleState?.dayOfCycle || 1;
  const ovulationDay = cycleLength - 14;
  const todayAnim   = useCountUp(today, { duration:800, enabled:animOn });

  function phaseColorOf(d) {
    if (d <= 5) return "var(--phase-menstrual)";
    if (d < ovulationDay) return "var(--phase-follicular)";
    if (d <= ovulationDay + 2) return "var(--phase-ovulatory)";
    return "var(--phase-luteal)";
  }

  const phaseWindows = cycleState?.windows || getPhaseWindows(cycleLength);
  const phaseList = [
    { label:"Menstrual",    range:`Days 1–5`,                         color:"var(--phase-menstrual)" },
    { label:"Follicular",   range:`Days 6–${ovulationDay-1}`,         color:"var(--phase-follicular)" },
    { label:"Ovulatory",    range:`Days ${ovulationDay}–${ovulationDay+2}`, color:"var(--phase-ovulatory)" },
    { label:"Luteal early", range:`Days ${ovulationDay+3}–${ovulationDay+9}`, color:"var(--phase-luteal)" },
    { label:"Luteal late",  range:`Days ${ovulationDay+10}–${cycleLength}`,    color:"var(--phase-luteal)" },
  ];

  // Cycle length stepper
  const cur = useRef(cycleLength);
  const [displayed, setDisplayed] = useState(cycleLength);
  useEffect(() => { cur.current = cycleLength; setDisplayed(cycleLength); }, [cycleLength]);
  const step = (delta) => {
    const next = Math.min(45, Math.max(21, cur.current + delta));
    cur.current = next; setDisplayed(next);
    if (onUpdateProfile) {
      const current = JSON.parse(localStorage.getItem("yr_profile") || "{}");
      const p = { ...current, cycleLength: next };
      localStorage.setItem("yr_profile", JSON.stringify(p));
      onUpdateProfile({ cycleLength: next });
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
    <div className="yr-stack-lg">
      <div>
        <div className="yr-overline">{cycleState.label}</div>
        <h1 className="yr-display" style={{ fontSize:"clamp(32px,5vw,52px)", fontWeight:500, letterSpacing:"-0.03em", margin:0 }}>
          {cycleState.phase === "follicular" ? "A strong window." :
           cycleState.phase === "ovulatory"  ? "Peak power." :
           cycleState.phase === "menstrual"  ? "Restore and rest." : "Stabilize your gains."}
        </h1>
        <p style={{ color:"var(--yr-muted)", fontSize:14, maxWidth:"60ch", marginTop:8, lineHeight:1.6 }}>
          {cycleState.tip}
        </p>
        <div style={{ marginTop:10, fontSize:11, color:"var(--yr-faint)", fontFamily:"var(--font-mono)" }}>
          Calendar estimate · may vary ±2–4 days
        </div>
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

        {/* Phase list + stepper */}
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

      {/* PCOS toggle */}
      <div style={{ borderTop:"1px solid var(--yr-border)", paddingTop:20, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
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

      {/* Research disclaimer */}
      <div style={{ fontSize:11, color:"var(--yr-faint)", lineHeight:1.6, borderTop:"1px solid var(--yr-border)", paddingTop:16 }}>
        Phase-based programming is based on current evidence, which is still evolving. Individual responses vary significantly. Not medical advice. For PCOS, endometriosis, or PMDD, consult a healthcare provider.
      </div>
    </div>
  );
}
