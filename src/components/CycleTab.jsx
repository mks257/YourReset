import { useState } from "react";
import { PHASES, PHASE_EMOJI, PCOS_GUIDANCE, getPhaseWindows, phaseLabel } from "../cycleEngine";

// ── Phase card — expanded with science-honest content ─────────────────────
function PhaseCard({ phaseKey, isNow, windows, cycleLength }) {
  const [open, setOpen] = useState(isNow);
  const p = PHASES[phaseKey];
  const dayRange = phaseLabel(windows, phaseKey, cycleLength);
  if (!p) return null;

  return (
    <div
      onClick={() => setOpen(o => !o)}
      style={{
        borderRadius: 16, padding: "14px 16px", marginBottom: 8, cursor: "pointer",
        background: `${p.color}0f`,
        border: `1px solid ${p.color}${isNow ? "55" : "30"}`,
        borderLeft: `3px solid ${p.color}`,
        opacity: isNow ? 1 : 0.78,
        transition: "opacity 0.15s",
      }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontWeight:800, fontSize:"0.88rem", color: p.color }}>
            {PHASE_EMOJI[phaseKey]} {p.label}
            {isNow && <span style={{ marginLeft:8, fontSize:"0.65rem", fontWeight:600, opacity:0.7 }}>← you're here</span>}
          </div>
          <div style={{ fontSize:"0.65rem", color:"var(--yr-muted)", marginTop:2 }}>
            {dayRange} · {p.setsReps}
          </div>
        </div>
        <span style={{ fontSize:11, color:"var(--yr-muted)", marginTop:2 }}>{open ? "▲" : "▾"}</span>
      </div>

      {open && (
        <div style={{ marginTop:10 }}>
          {/* Main tip */}
          <p style={{ fontSize:"0.78rem", lineHeight:1.6, color:"rgba(245,240,240,0.82)", marginBottom:10 }}>
            {p.tip}
          </p>

          {/* Honest caveat (follicular) */}
          {p.honestCaveat && (
            <div style={{ padding:"8px 12px", borderRadius:8, marginBottom:10,
              background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
              fontSize:"0.72rem", color:"var(--yr-muted)", lineHeight:1.55 }}>
              📊 {p.honestCaveat}
            </div>
          )}

          {/* ACL note (ovulatory) */}
          {p.aclNote && (
            <div style={{ padding:"8px 12px", borderRadius:8, marginBottom:10,
              background:"rgba(242,189,115,0.08)", border:"1px solid rgba(242,189,115,0.22)",
              fontSize:"0.72rem", color:"var(--yr-amber)", lineHeight:1.55 }}>
              ⚠️ {p.aclNote}
            </div>
          )}

          {/* Deload note (luteal late) */}
          {p.deloadNote && (
            <div style={{ padding:"8px 12px", borderRadius:8, marginBottom:10,
              background:"rgba(139,127,168,0.1)", border:"1px solid rgba(139,127,168,0.24)",
              fontSize:"0.72rem", color:"#c4b8e0", lineHeight:1.55 }}>
              💡 {p.deloadNote}
            </div>
          )}

          {/* Workout chips */}
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
            {p.workouts.map(w => (
              <span key={w} style={{ fontSize:"0.62rem", padding:"3px 9px", borderRadius:99,
                background:`${p.color}25`,
                color: p.color, fontWeight:700 }}>{w}</span>
            ))}
          </div>

          {/* Nutrition */}
          <div style={{ fontSize:"0.72rem", color:"var(--yr-amber)", lineHeight:1.5, marginBottom:8 }}>
            🍽 {p.nutrition}
          </div>

          {/* Science source — brief */}
          <div style={{ fontSize:"0.62rem", color:"var(--yr-faint)", lineHeight:1.5, fontStyle:"italic" }}>
            {p.science}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export default function CycleTab({ cycleState, profile, onResetProfile }) {
  const [showPcos, setShowPcos] = useState(false);

  const cycleLength = cycleState?.cycleLength || profile?.cycleLength || 28;
  const windows     = cycleState?.windows || getPhaseWindows(cycleLength);
  const isOnContraception = profile?.cycleOption === "none" ||
    (profile?.cycleTracking === false && profile?.gender === "female");

  const PHASE_KEYS = ["menstrual","follicular","ovulatory","luteal_early","luteal_late"];
  const phaseColors = {
    menstrual: PHASES.menstrual.color, follicular: PHASES.follicular.color,
    ovulatory: PHASES.ovulatory.color, luteal_early: PHASES.luteal_early.color,
    luteal_late: PHASES.luteal_late.color,
  };

  return (
    <div className="screen-stack" style={{ paddingTop:4 }}>

      {/* ── Current phase hero ── */}
      {cycleState ? (
        <div className="phase-card fade-in" style={{
          background:`${cycleState.color}16`,
          border:`1px solid ${cycleState.color}44`,
        }}>
          <div className="phase-eyebrow" style={{ color: cycleState.color }}>
            {PHASE_EMOJI[cycleState.phase]} You're in {cycleState.label}
          </div>
          <h2 style={{ fontSize:18, fontWeight:700, color:"var(--yr-text)", margin:"6px 0 6px" }}>
            Day {cycleState.dayOfCycle} of {cycleLength}
          </h2>
          <p style={{ fontSize:13, color:"var(--yr-muted)", lineHeight:1.5, marginBottom:10 }}>
            {cycleState.tip}
          </p>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {[["Intensity", cycleState.intensity],["Sets/Reps", cycleState.setsReps],["Cardio", cycleState.cardio]].map(([l,v])=>(
              <div key={l} style={{ background:`${cycleState.color}1e`,
                border:`1px solid ${cycleState.color}38`,
                borderRadius:10, padding:"5px 10px", fontSize:"0.68rem" }}>
                <span style={{ color:"var(--yr-muted)" }}>{l}: </span>
                <span style={{ color: cycleState.color, fontWeight:700 }}>{v}</span>
              </div>
            ))}
          </div>
          {/* Phase confidence — calendar estimate */}
          <div style={{ marginTop:10, fontSize:"0.62rem", color:"var(--yr-faint)", display:"flex", alignItems:"center", gap:5 }}>
            <span>📅</span>
            <span>Calendar estimate · based on your reported start date · may vary ±2–4 days</span>
          </div>
        </div>
      ) : (
        <div className="phase-card fade-in">
          <div className="phase-eyebrow" style={{ color:"var(--yr-blue)" }}>⚡ Training Focus</div>
          <h2 style={{ fontSize:18, fontWeight:700, color:"var(--yr-text)", margin:"6px 0 6px" }}>Adaptive Mode</h2>
          <p style={{ fontSize:13, color:"var(--yr-muted)", lineHeight:1.5, marginBottom:10 }}>
            Your plan adapts from readiness check-ins and equipment. Enable cycle tracking to unlock phase-aware programming.
          </p>
          <button className="btn-secondary" onClick={onResetProfile}>Update profile →</button>
        </div>
      )}

      {/* ── Contraception note ── */}
      {isOnContraception && (
        <div style={{ padding:"12px 14px", borderRadius:14,
          background:"rgba(140,200,255,0.08)", border:"1px solid rgba(140,200,255,0.22)",
          fontSize:13, color:"var(--yr-muted)", lineHeight:1.6 }}>
          <span style={{ color:"var(--yr-blue)", fontWeight:700 }}>Using hormonal contraception: </span>
          Hormonal contraception changes your hormone profile — the natural phase-based intensity shifts are less applicable. Consistent training load and readiness-based adjustments work well.
        </div>
      )}

      {/* ── PCOS / irregular cycle toggle ── */}
      <div style={{ padding:"12px 14px", borderRadius:14,
        background:"var(--yr-card)", border:"1px solid var(--yr-border)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontWeight:700, fontSize:13, color:"var(--yr-text)" }}>PCOS or irregular cycle?</div>
            <div style={{ fontSize:11, color:"var(--yr-muted)", marginTop:2 }}>Different guidance applies</div>
          </div>
          <button onClick={() => setShowPcos(o => !o)} style={{
            padding:"6px 12px", borderRadius:99, fontSize:11, fontWeight:700, cursor:"pointer",
            border:`1px solid ${showPcos ? "rgba(155,216,180,0.4)" : "var(--yr-border)"}`,
            background: showPcos ? "rgba(155,216,180,0.12)" : "transparent",
            color: showPcos ? "var(--yr-sage)" : "var(--yr-muted)",
          }}>{showPcos ? "Hide ▲" : "Show ▾"}</button>
        </div>

        {showPcos && (
          <div style={{ marginTop:12 }}>
            <p style={{ fontSize:13, color:"var(--yr-muted)", lineHeight:1.6, marginBottom:10 }}>
              {PCOS_GUIDANCE.tip}
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:10 }}>
              {PCOS_GUIDANCE.recommendations.map((r,i) => (
                <div key={i} className="row" style={{ gap:8, alignItems:"flex-start" }}>
                  <span style={{ color:"var(--yr-sage)", fontSize:11, flexShrink:0, marginTop:1 }}>✓</span>
                  <span style={{ fontSize:12, color:"rgba(245,240,240,0.8)", lineHeight:1.5 }}>{r}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize:11, color:"var(--yr-amber)", lineHeight:1.5 }}>🍽 {PCOS_GUIDANCE.nutrition}</p>
          </div>
        )}
      </div>

      {/* ── Your cycle map — dynamic length ── */}
      <div style={{ background:"var(--yr-card)", border:"1px solid var(--yr-border)", borderRadius:20, padding:"16px 18px" }}>
        <div style={{ fontWeight:800, fontSize:"0.9rem", color:"var(--yr-text)", marginBottom:12 }}>
          Your cycle map
          <span style={{ fontWeight:400, fontSize:"0.7rem", color:"var(--yr-muted)", marginLeft:8 }}>
            {cycleLength}-day cycle
          </span>
        </div>

        {/* Day strip */}
        <div style={{ display:"flex", gap:2 }}>
          {Array.from({ length: cycleLength }, (_, i) => i + 1).map(d => {
            const phase = PHASE_KEYS.find(pk => {
              const [lo, hi] = windows[pk] || [0, 0];
              return d >= lo && d <= hi;
            }) || "luteal_late";
            const col = phaseColors[phase];
            const isNow = cycleState ? d === cycleState.dayOfCycle : false;
            return (
              <div key={d} title={`Day ${d}`} style={{
                flex:1, height:34, borderRadius:5,
                background:`${isNow ? col + "8c" : col + "33"}`,
                border:`1.5px solid ${isNow ? col : "transparent"}`,
                transform: isNow ? "scaleY(1.22)" : "scaleY(1)",
                boxShadow: isNow ? `0 0 12px ${col}88` : "none",
                transition:"transform 0.2s",
              }} />
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display:"flex", gap:12, marginTop:10, flexWrap:"wrap" }}>
          {[
            ["menstrual","🌑","Menstrual"],
            ["follicular","🌱","Follicular"],
            ["ovulatory","⚡","Ovulatory"],
            ["luteal_early","🍂","Luteal early"],
            ["luteal_late","🌙","Luteal late"],
          ].map(([key,ico,name]) => (
            <div key={key} style={{ display:"flex", alignItems:"center", gap:4, fontSize:"0.65rem", color:"var(--yr-muted)" }}>
              <div style={{ width:7, height:7, borderRadius:2, background: phaseColors[key] }} />
              {ico} {name}
              <span style={{ color:"var(--yr-faint)" }}>({phaseLabel(windows, key, cycleLength)})</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Phase cards — expandable ── */}
      <div>
        <div style={{ fontWeight:700, fontSize:13, color:"var(--yr-text)", marginBottom:8 }}>
          Phase guide
        </div>
        {PHASE_KEYS.map(key => (
          <PhaseCard
            key={key}
            phaseKey={key}
            isNow={cycleState?.phase === key}
            windows={windows}
            cycleLength={cycleLength}
          />
        ))}
      </div>

      {/* ── Research disclaimer ── */}
      <div style={{ padding:"12px 14px", borderRadius:12,
        background:"rgba(255,255,255,0.03)", border:"1px solid var(--yr-border-soft)",
        fontSize:"0.65rem", color:"var(--yr-faint)", lineHeight:1.6 }}>
        <span style={{ color:"var(--yr-muted)", fontWeight:600 }}>Research note: </span>
        Phase-based programming is based on current evidence, which is still evolving. Individual
        responses vary significantly — your own tracking and readiness data are the most reliable guide.
        This is general wellness information, not medical advice. For PCOS, endometriosis, PMDD,
        or irregular cycles, consult a healthcare provider.
      </div>

    </div>
  );
}
