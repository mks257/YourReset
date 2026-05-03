import { T } from "../theme";
import { PHASES, PHASE_EMOJI } from "../cycleEngine";
import * as Storage from "../storage";

function CycleTab({ cycleState, profile, onResetProfile }) {
  return (
    <div className="fu d2">
      {cycleState ? (
        <div style={{ background:T.card, border:`1px solid ${cycleState.color}33`, borderRadius:20, padding:"22px", marginBottom:16, borderLeft:`4px solid ${cycleState.color}` }}>
          <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:"1rem", color:cycleState.color, marginBottom:8 }}>
            {PHASE_EMOJI[cycleState.phase]} {cycleState.label} · Day {cycleState.dayOfCycle} of {cycleState.cycleLength}
          </div>
          <div style={{ fontSize:"0.78rem", color:"rgba(240,238,255,0.65)", lineHeight:1.6, marginBottom:10 }}>{cycleState.tip}</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {[["Intensity", cycleState.intensity], ["Sets/Reps", cycleState.setsReps], ["Cardio", cycleState.cardio]].map(([l,v])=>(
              <div key={l} style={{ background:`${cycleState.color}12`, border:`1px solid ${cycleState.color}22`, borderRadius:10, padding:"6px 12px", fontSize:"0.68rem" }}>
                <span style={{ color:T.muted }}>{l}: </span><span style={{ color:cycleState.color, fontWeight:700 }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop:12, fontSize:"0.72rem", color:T.amber }}>🍽 {cycleState.nutrition}</div>
        </div>
      ) : (
        <div style={{ background:T.card, border:`1px solid ${T.violet}33`, borderRadius:20, padding:"22px", marginBottom:16, borderLeft:`4px solid ${T.violet}` }}>
          <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:"1rem", color:T.violet, marginBottom:8 }}>⚡ Adaptive Training Mode</div>
          <div style={{ fontSize:"0.78rem", color:"rgba(240,238,255,0.65)", lineHeight:1.6 }}>Your plan adapts based on your readiness check-in and selected equipment. Update your profile to enable cycle-aware programming.</div>
          <button onClick={onResetProfile} style={{ marginTop:12, padding:"8px 16px", borderRadius:10, border:`1px solid ${T.violet}44`, background:`${T.violet}12`, color:T.violet, fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:"0.75rem", cursor:"pointer" }}>Update profile →</button>
        </div>
      )}

      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:20, padding:"20px", marginBottom:16 }}>
        <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:"0.9rem", marginBottom:14 }}>28-Day Cycle Map</div>
        <div style={{ display:"flex", gap:3 }}>
          {Array.from({length: cycleState?.cycleLength || 28},(_,i)=>i+1).map(d=>{
            const phase = d<=5?"menstrual":d<=13?"follicular":d<=16?"ovulatory":d<=23?"luteal_early":"luteal_late";
            const cols = { menstrual:T.pink, follicular:T.teal, ovulatory:T.amber, luteal_early:T.violet, luteal_late:T.muted };
            const col = cols[phase];
            const isNow = cycleState ? d===cycleState.dayOfCycle : d===7;
            return (
              <div key={d} title={`Day ${d}`} style={{
                flex:1, height:36, borderRadius:6, background:`${col}22`,
                border:`2px solid ${isNow?col:"transparent"}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"0.5rem", color:col, fontWeight:700,
                transform:isNow?"scaleY(1.25)":"scaleY(1)",
                boxShadow:isNow?`0 0 14px ${col}88`:"none",
                transition:"transform 0.2s", cursor:"default",
              }}>
                {isNow ? "▲" : ""}
              </div>
            );
          })}
        </div>
        <div style={{ display:"flex", gap:16, marginTop:12, flexWrap:"wrap" }}>
          {[["menstrual","🌑","Menstrual","1–5",T.pink],["follicular","🌱","Follicular","6–13",T.teal],
            ["ovulatory","⚡","Ovulatory","14–16",T.amber],["luteal_early","🍂","Luteal","17–28",T.violet]].map(([,ico,name,days,col])=>(
            <div key={name} style={{ display:"flex", alignItems:"center", gap:5, fontSize:"0.68rem", color:T.muted }}>
              <div style={{ width:8, height:8, borderRadius:2, background:col }} />
              {ico} {name} <span style={{ color:"rgba(255,255,255,0.25)" }}>({days})</span>
            </div>
          ))}
        </div>
      </div>

      {[
        { key:"menstrual", phase:"Menstrual", days:"Days 1–5", color:T.pink, icon:"🌑", workouts:["Gentle yoga", "10-min walks", "Breathwork", "Light stretching"] },
        { key:"follicular", phase:"Follicular", days:"Days 6–13", color:T.teal, icon:"🌱", workouts:["Heavy lifting", "HIIT", "PR attempts", "Long runs"] },
        { key:"ovulatory", phase:"Ovulatory", days:"Days 14–16", color:T.amber, icon:"⚡", workouts:["Max effort", "Full body", "Plyometrics", "Sprint intervals"] },
        { key:"luteal_early", phase:"Luteal (early)", days:"Days 17–23", color:T.violet, icon:"🍂", workouts:["Moderate strength", "Steady-state cardio", "Pilates", "Technique work"] },
        { key:"luteal_late", phase:"Luteal (late)", days:"Days 24–28", color:T.muted, icon:"🌙", workouts:["Mobility", "Low-impact cardio", "Deload", "Restorative strength"] },
      ].map(p=>(
        <div key={p.phase} style={{ background:T.card, border:`1px solid ${p.color}22`, borderRadius:16, padding:"16px 18px", marginBottom:10, borderLeft:`3px solid ${p.color}`, opacity: cycleState && cycleState.phase === p.key ? 1 : 0.75 }}>
          <div style={{ marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, color:p.color, fontSize:"0.88rem" }}>{p.icon} {p.phase} {cycleState && cycleState.phase === p.key ? "← you're here" : ""}</div>
              <div style={{ fontSize:"0.65rem", color:T.muted }}>{p.days} · {PHASES[p.key]?.setsReps}</div>
            </div>
          </div>
          <div style={{ fontSize:"0.75rem", color:"rgba(240,238,255,0.6)", lineHeight:1.5, marginBottom:10 }}>{PHASES[p.key]?.tip}</div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {p.workouts.map(w=>(
              <span key={w} style={{ fontSize:"0.62rem", padding:"3px 9px", borderRadius:100, background:`${p.color}15`, color:p.color, fontWeight:700 }}>{w}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default CycleTab;
