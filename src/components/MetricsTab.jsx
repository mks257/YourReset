import { useCountUp } from "./MotionHooks";

const STEP_HISTORY = [3.2,4.1,5.5,6.8,3.9,7.2,8.1,4.5,5.6,3.8,4.4,7.5,2.9,4.1,5.8,3.3,5.0,7.1,8.5,4.2,5.0,6.1,3.7,4.8,5.5,7.9,3.4,4.7,5.3,4.0,9.2,5.9];

export default function MetricsTab({ liveData, motion = "full" }) {
  const animOn = motion !== "off";
  const today = new Date().toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" });

  const stepsAnim  = useCountUp(liveData?.steps || 0,  { duration:1100, enabled:animOn });
  const kcalAnim   = useCountUp(liveData?.kcal  || 0,  { duration:900,  delay:60, enabled:animOn });

  const rows = [
    { label:"Steps",          value: animOn ? stepsAnim.toLocaleString() : (liveData?.steps||0).toLocaleString(), unit:"", goal: liveData?.stepGoal||10000, pct: (liveData?.steps||0)/(liveData?.stepGoal||10000) },
    { label:"Active kcal",    value: animOn ? kcalAnim : (liveData?.kcal||0), unit:"kcal", goal:liveData?.kcalGoal||500, pct:(liveData?.kcal||0)/(liveData?.kcalGoal||500) },
    { label:"Exercise",       value: liveData?.exMin||22, unit:"min", goal:30, pct:(liveData?.exMin||22)/30 },
    { label:"Resting HR",     value: liveData?.rhr||70,   unit:"bpm", goal:75, pct: 0.82 },
    { label:"Weight",         value: liveData?.weight||63.5, unit:"kg", goal:liveData?.weightGoal||60, pct: 0.78 },
    { label:"Energy deficit", value: Math.max(0, (liveData?.kcal||0) - 150), unit:"kcal", goal:"", pct: 0.35 },
  ];

  const maxBar = Math.max(...STEP_HISTORY);
  const avgSteps = Math.round(STEP_HISTORY.reduce((a,b)=>a+b,0)/STEP_HISTORY.length * 1000);

  return (
    <div className="yr-stack-lg">
      <div className={animOn ? "yr-stagger" : ""} style={{"--i":0}}>
        <div className="yr-overline">{today}</div>
        <h1 className="yr-display" style={{ fontSize:"clamp(32px,5vw,56px)", fontWeight:500, letterSpacing:"-0.03em", margin:0, lineHeight:1.05 }}>
          A measured day.
        </h1>
        <p style={{ color:"var(--yr-muted)", fontSize:14, maxWidth:"52ch", marginTop:8 }}>
          You're tracking close to baseline. Steps trending up, resting HR steady.
        </p>
      </div>

      <div className="yr-ledger">
        {rows.map((r, i) => (
          <div className={`yr-ledger-row${animOn ? " yr-anim-ledger-row" : ""}`} key={r.label} style={{"--i":i}}>
            <div className="yr-ledger-label">{r.label}</div>
            <div>
              <div className="yr-ledger-value">
                {r.value}<span className="yr-ledger-value-unit">{r.unit}</span>
              </div>
              <div className="yr-ledger-bar">
                <div className={`yr-ledger-bar-fill${animOn ? " yr-anim-bar" : ""}`}
                  style={{ width:`${Math.min(100, r.pct * 100)}%`, "--i":i }} />
              </div>
            </div>
            <div className="yr-ledger-meta">
              {r.goal ? <>goal <b style={{ color:"var(--yr-text)" }}>{r.goal}</b></> : "—"}
            </div>
          </div>
        ))}
      </div>

      <div className={animOn ? "yr-stagger" : ""} style={{"--i":8}}>
        <div className="yr-overline" style={{ display:"flex", justifyContent:"space-between" }}>
          <span>30-day step trend</span>
        </div>
        <div style={{ display:"flex", alignItems:"flex-end", gap:3, height:100, margin:"12px 0" }}>
          {STEP_HISTORY.map((v, i) => (
            <div key={i}
              className={animOn ? "yr-anim-spark-bar" : ""}
              style={{
                flex:1, height:`${(v/maxBar)*100}%`, minHeight:3,
                background: i===STEP_HISTORY.length-1 ? "var(--phase-accent)" : "var(--yr-text-2)",
                opacity: i===STEP_HISTORY.length-1 ? 1 : (v>7 ? 0.5 : 0.2),
                borderRadius:1, "--i":i,
              }}
              title={`${(v*1000).toFixed(0)} steps`}
            />
          ))}
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"var(--yr-muted)", fontFamily:"var(--font-mono)" }}>
          <span>MAR 14</span>
          <span>AVG {avgSteps.toLocaleString()}</span>
          <span style={{ color:"var(--phase-accent)" }}>TODAY</span>
        </div>
      </div>
    </div>
  );
}
