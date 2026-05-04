import { PHASE_EMOJI } from "../cycleEngine";

const CHECKS = [
  { key:"energy",   label:"Energy",   opts:["1","2","3","4","5"] },
  { key:"sleep",    label:"Sleep",    opts:["Poor","Ok","Good"] },
  { key:"soreness", label:"Soreness", opts:["None","Mild","High"] },
];

export default function ReadinessCheck({ readiness, showReadiness, setReadiness, setShowReadiness, cycleState }) {
  const canSave = showReadiness?.energy && showReadiness?.sleep && showReadiness?.soreness;

  if (!readiness && !showReadiness) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, padding:"14px 16px", borderRadius:14, border:"1px solid var(--yr-border)", background:"var(--yr-surface)" }}>
      <div>
        <div style={{ fontWeight:600, fontSize:13, color:"var(--yr-text)", marginBottom:2 }}>Check in before training</div>
        <div style={{ fontSize:11, color:"var(--yr-muted)" }}>Energy · Sleep · Soreness</div>
      </div>
      <button onClick={() => setShowReadiness(true)} style={{ padding:"8px 14px", borderRadius:999, border:"1px solid var(--yr-border-strong)", background:"var(--yr-surface-2)", color:"var(--yr-text)", cursor:"pointer", fontFamily:"inherit", fontSize:12, fontWeight:600 }}>
        Check in
      </button>
    </div>
  );

  if (showReadiness && !readiness) return (
    <div style={{ padding:16, borderRadius:14, border:"1px solid var(--yr-border)", background:"var(--yr-surface)" }}>
      <div style={{ fontWeight:700, fontSize:13, color:"var(--yr-text)", marginBottom:14 }}>Today's check-in</div>
      {CHECKS.map(({ key, label, opts }) => (
        <div key={key} style={{ marginBottom:12 }}>
          <div style={{ fontFamily:"var(--font-mono)", fontSize:10, textTransform:"uppercase", letterSpacing:"0.14em", color:"var(--yr-muted)", marginBottom:8 }}>{label}</div>
          <div className="yr-pills">
            {opts.map((opt, idx) => {
              const val = key === "energy" ? idx+1 : opt.toLowerCase();
              return (
                <button key={opt} className={`yr-pill${showReadiness?.[key] === val ? " active" : ""}`}
                  onClick={() => setShowReadiness(p => ({ ...p, [key]: val }))}>{opt}</button>
              );
            })}
          </div>
        </div>
      ))}
      <button disabled={!canSave} onClick={() => { setReadiness(showReadiness); setShowReadiness(false); }}
        style={{ width:"100%", padding:"11px", border:"none", borderRadius:10, cursor:canSave?"pointer":"not-allowed", background:canSave?"var(--phase-accent)":"var(--yr-surface-2)", color:canSave?"#0a0a0a":"var(--yr-muted)", fontFamily:"inherit", fontWeight:700, fontSize:13, marginTop:4 }}>
        Save &amp; adapt plan
      </button>
    </div>
  );

  if (readiness) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, padding:"12px 16px", borderRadius:14, border:"1px solid var(--yr-border)", background:"var(--yr-surface)" }}>
      <div>
        {cycleState && <div style={{ fontSize:12, color:"var(--phase-accent)", fontWeight:600, marginBottom:2 }}>{PHASE_EMOJI[cycleState.phase]} {cycleState.setsReps}</div>}
        <div style={{ fontSize:11, color:"var(--yr-muted)" }}>Energy {readiness.energy}/5 · Sleep {readiness.sleep} · Soreness {readiness.soreness}</div>
      </div>
      <button onClick={() => { setReadiness(null); setShowReadiness(false); }} style={{ background:"transparent", border:"none", color:"var(--yr-muted)", cursor:"pointer", fontSize:12, fontFamily:"inherit" }}>redo</button>
    </div>
  );

  return null;
}
