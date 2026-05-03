import ExerciseAnimation from "./ExerciseAnimation";
import ReadinessCheck from "./ReadinessCheck";
import { T } from "../theme";
import { WEEK_PLAN, EQUIPMENT_MAP, SUBSTITUTIONS } from "../workoutData";
import { buildPhaseNote } from "../cycleEngine";

function PlanTab({ day, selectedDay, setSelectedDay, done, setDone, setModal, readiness, showReadiness, setReadiness, setShowReadiness, cycleState, profile, weekKey }) {
  const doneCount = day.exercises.filter(e => done[`${selectedDay}-${e.id}`]).length;
  const totalKcal = day.exercises.reduce((a, e) => a + e.kcal, 0);
  const burnedKcal = day.exercises.filter(e => done[`${selectedDay}-${e.id}`]).reduce((a, e) => a + e.kcal, 0);

  return (
    <>
      <ReadinessCheck
        readiness={readiness}
        showReadiness={showReadiness}
        setReadiness={setReadiness}
        setShowReadiness={setShowReadiness}
        cycleState={cycleState}
      />

      <div className="fu d2" style={{ display:"flex", gap:6, marginBottom:20, overflowX:"auto", paddingBottom:4 }}>
        {WEEK_PLAN.map((d,i)=>(
          <button key={i} onClick={()=>setSelectedDay(i)}
            style={{ flexShrink:0, padding:"10px 14px", borderRadius:14, border:`1px solid ${selectedDay===i ? d.color : T.border}`,
              cursor:"pointer", fontFamily:"'Outfit',sans-serif", fontWeight:700,
              background: selectedDay===i ? `${d.color}18` : T.card,
              color: selectedDay===i ? d.color : T.muted,
              boxShadow: selectedDay===i ? `0 4px 14px ${d.color}30` : "none",
              transition:"all 0.2s", textAlign:"center", minWidth:72,
            }}>
            <div style={{ fontSize:"1.2rem", marginBottom:2 }}>{d.emoji}</div>
            <div style={{ fontSize:"0.6rem", textTransform:"uppercase", letterSpacing:"0.04em" }}>{i===0 ? "TODAY" : d.name.slice(0,3)}</div>
          </button>
        ))}
      </div>

      <div className="fu d2" style={{ background:T.card, border:`1px solid ${day.color}33`, borderRadius:20, padding:"18px 20px", marginBottom:16, borderLeft:`4px solid ${day.color}` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:10 }}>
          <div>
            <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:"1.2rem", color:day.color }}>{day.emoji} {day.label}</div>
            <div style={{ fontSize:"0.72rem", color:T.muted, marginTop:3 }}>{day.focus} · {day.exercises.length} exercises</div>
            <div style={{ fontSize:"0.75rem", color:"rgba(240,238,255,0.6)", marginTop:6, lineHeight:1.5, maxWidth:380 }}>{day.tip}</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:"1.5rem", color:day.color }}>{doneCount}/{day.exercises.length}</div>
            <div style={{ fontSize:"0.62rem", color:T.muted, textTransform:"uppercase" }}>Completed</div>
            <div style={{ marginTop:6, fontFamily:"'JetBrains Mono',monospace", fontSize:"0.72rem", color:T.amber }}>🔥 {burnedKcal}/{totalKcal} kcal</div>
          </div>
        </div>
        <div style={{ marginTop:14 }}>
          <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:100, height:6, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${Math.round((doneCount/day.exercises.length)*100)}%`, background:`linear-gradient(90deg,${day.color},${T.teal})`, borderRadius:100, transition:"width 0.5s ease" }} />
          </div>
        </div>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {day.exercises.map((ex,i) => {
          const key = `${selectedDay}-${ex.id}`;
          const isDone = done[key];
          const required = EQUIPMENT_MAP[ex.id] || [];
          const missing = required.filter(e => !(profile.equipment || []).includes(e));
          const hasMissing = missing.length > 0;
          const sub = SUBSTITUTIONS[ex.id];
          return (
            <div key={ex.id}
              className="fu"
              style={{
                animationDelay:`${0.05*i}s`,
                background:T.card,
                border:`1px solid ${isDone ? T.green+"33" : hasMissing ? T.amber+"44" : T.border}`,
                borderRadius:16, padding:"14px 16px",
                display:"flex", alignItems:"center", gap:14, cursor:"pointer",
                opacity: isDone ? 0.55 : 1,
                transition:"all 0.18s",
              }}
              onClick={()=>setModal(ex)}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor=isDone?T.green+"44":hasMissing?T.amber+"66":`${day.color}44`; e.currentTarget.style.transform="translateX(4px)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor=isDone?T.green+"33":hasMissing?T.amber+"44":T.border; e.currentTarget.style.transform=""; }}
            >
              <div style={{ width:64, height:64, flexShrink:0, borderRadius:14, background:`${hasMissing ? T.amber : day.color}10`, overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <div style={{ transform:"scale(0.45)", transformOrigin:"center" }}>
                  <ExerciseAnimation type={ex.anim} color={isDone ? T.green : hasMissing ? T.amber : day.color} />
                </div>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:"0.9rem", textDecoration:isDone?"line-through":"none", marginBottom:2 }}>{ex.name}</div>
                <div style={{ fontSize:"0.7rem", color:T.muted }}>{ex.sets} · {ex.muscle}</div>
                <div style={{ display:"flex", gap:5, marginTop:5, flexWrap:"wrap" }}>
                  <span style={{ fontSize:"0.6rem", padding:"2px 7px", borderRadius:100, background:`${day.color}15`, color:day.color, fontWeight:700 }}>{ex.type}</span>
                  <span style={{ fontSize:"0.6rem", padding:"2px 7px", borderRadius:100, background:"rgba(255,179,71,0.12)", color:T.amber, fontWeight:700 }}>🔥 {ex.kcal} kcal</span>
                  {hasMissing && (
                    <span style={{ fontSize:"0.6rem", padding:"2px 7px", borderRadius:100, background:`${T.amber}18`, color:T.amber, fontWeight:700 }}>⚠️ Need {missing.join(", ")}</span>
                  )}
                </div>
                {hasMissing && sub && (
                  <div style={{ fontSize:"0.65rem", color:T.muted, marginTop:5, fontStyle:"italic" }}>💡 Swap: {sub}</div>
                )}
              </div>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
                <div style={{ width:32, height:32, borderRadius:10, background: isDone ? "rgba(94,234,212,0.15)" : hasMissing ? `${T.amber}18` : `${day.color}18`, color: isDone ? T.green : hasMissing ? T.amber : day.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.75rem", fontWeight:700, flexShrink:0 }}>
                  {isDone ? "✓" : `${i+1}`}
                </div>
                <div style={{ fontSize:"0.58rem", color:T.muted }}>tap</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default PlanTab;
