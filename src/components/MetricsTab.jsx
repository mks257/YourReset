import { T } from "../theme";

const Ring = ({ pct, size=110, stroke=9, color, val, unit }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - pct/100)}
          style={{ transition:"stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)" }} />
      </svg>
      <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center" }}>
        <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:"1.1rem", color, lineHeight:1 }}>{val}</div>
        <div style={{ fontSize:"0.55rem", color:T.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginTop:2 }}>{unit}</div>
      </div>
    </div>
  );
};

const SparkBars = ({ vals, color, goal }) => {
  const mx = Math.max(...vals, goal || 0);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:2, height:48, width:"100%" }}>
      {vals.map((v,i) => {
        const h = Math.max(2, (v/mx)*48);
        const isLast = i === vals.length-1;
        const hit = goal && v >= goal;
        return (
          <div key={i} title={v.toLocaleString()}
            style={{ flex:1, height:h, borderRadius:"2px 2px 0 0",
              background: isLast ? color : hit ? T.teal : "rgba(255,255,255,0.08)",
              transition:"height 0.4s ease", cursor:"default" }} />
        );
      })}
    </div>
  );
};

function MetricsTab({ liveData }) {
  const stepPct = Math.min(100, Math.round((liveData.steps / liveData.stepGoal) * 100));
  const kcalPct = Math.min(100, Math.round((liveData.kcal / liveData.kcalGoal) * 100));

  return (
    <div className="fu d2">
      <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap", background:T.card, border:`1px solid ${T.border}`, borderRadius:20, padding:"22px", marginBottom:16 }}>
        <Ring pct={stepPct} color={T.amber} val={liveData.steps.toLocaleString()} unit="Steps" />
        <Ring pct={kcalPct} color={T.pink} val={liveData.kcal} unit="Active kcal" />
        <Ring pct={Math.round((liveData.exMin/60)*100)} color={T.violet} val={liveData.exMin+"m"} unit="Exercise" />
        <Ring pct={68} color={T.red} val={liveData.rhr} unit="Resting HR" />
      </div>

      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:20, padding:"20px", marginBottom:16 }}>
        <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:"0.9rem", marginBottom:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span>👣 Step History</span>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.7rem", color:T.muted }}>
            avg {Math.round([3752,5755,6843,3890,11607,9595,10067,5694,3144,5659,4273,11707,12390,7322].reduce((a,b)=>a+b)/14).toLocaleString()}
          </span>
        </div>
        <SparkBars vals={[3752,5755,6843,3890,11607,9595,10067,5694,3144,5659,4273,11707,12390,7322,1006,11642,8662,4124,1066,1123,536,435,2784,9194,10731,3364,3575,3449,17556,liveData.steps]} color={T.amber} goal={10000} />
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:6, fontSize:"0.58rem", color:T.muted }}>
          <span>Mar 14</span><span style={{ color:T.amber, fontWeight:700 }}>Today</span>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        {[
          { label:"Weight", val:"63.5 kg", color:T.teal, icon:"⚖️", sub:"Goal: 60 kg" },
          { label:"Resting HR", val:`${liveData.rhr} bpm`, color:"#fc8181", icon:"❤️", sub:"30d avg: 75" },
          { label:"BMR Estimate", val:"~1,450 kcal", color:T.violet, icon:"⚡", sub:"25F, 63.5 kg" },
          { label:"Deficit Today", val:`~${Math.max(0, liveData.kcal-150)} kcal`, color:T.green, icon:"📉", sub:"Keep going!" },
        ].map(m=>(
          <div key={m.label} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"16px 18px" }}>
            <div style={{ fontSize:"1rem", marginBottom:8 }}>{m.icon}</div>
            <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:"1.5rem", color:m.color }}>{m.val}</div>
            <div style={{ fontSize:"0.65rem", color:T.muted, textTransform:"uppercase", letterSpacing:"0.05em", marginTop:3 }}>{m.label}</div>
            <div style={{ fontSize:"0.68rem", color:"rgba(240,238,255,0.35)", marginTop:4 }}>{m.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MetricsTab;
