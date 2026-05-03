import { PHASE_EMOJI } from "../cycleEngine";

const CHECKS = [
  { key:"energy",   label:"Energy",   opts:["1","2","3","4","5"] },
  { key:"sleep",    label:"Sleep",    opts:["Poor","Ok","Good"] },
  { key:"soreness", label:"Soreness", opts:["None","Mild","High"] },
];

export default function ReadinessCheck({ readiness, showReadiness, setReadiness, setShowReadiness, cycleState }) {
  const canSave = showReadiness?.energy && showReadiness?.sleep && showReadiness?.soreness;

  // Compact prompt
  if (!readiness && !showReadiness) return (
    <div className="readiness-card fade-in d3">
      <div>
        <h3>Check in before training</h3>
        <p>Energy · Sleep · Soreness</p>
      </div>
      <button className="btn-ghost" onClick={() => setShowReadiness(true)}>Check in</button>
    </div>
  );

  // Expanded form
  if (showReadiness && !readiness) return (
    <div className="readiness-form fade-in">
      <p style={{ fontWeight:700, fontSize:"14px", color:"var(--yr-text)", marginBottom:14 }}>
        Today's check-in
      </p>
      {CHECKS.map(({ key, label, opts }) => (
        <div key={key} style={{ marginBottom:12 }}>
          <div className="field-label">{label}</div>
          <div className="row" style={{ flexWrap:"wrap", gap:6 }}>
            {opts.map((opt, idx) => {
              const val = key === "energy" ? idx + 1 : opt.toLowerCase();
              const active = showReadiness?.[key] === val;
              return (
                <button key={opt}
                  className={`chip${active ? " active" : ""}`}
                  style={{ padding:"6px 10px", fontSize:"12px", borderRadius:8 }}
                  onClick={() => setShowReadiness(p => ({ ...p, [key]: val }))}>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <button className="btn-primary-full" disabled={!canSave} style={{ marginTop:8 }}
        onClick={() => { setReadiness(showReadiness); setShowReadiness(false); }}>
        Save &amp; adapt plan
      </button>
    </div>
  );

  // Saved summary
  if (readiness) return (
    <div className="row-between fade-in" style={{
      padding:"11px 14px", borderRadius:18,
      background:"var(--yr-card)", border:"1px solid var(--yr-border)",
    }}>
      <div>
        <p style={{ fontSize:"12px", color:"var(--phase-accent)", fontWeight:600, marginBottom:2 }}>
          Readiness logged · plan adjusted
        </p>
        <p style={{ fontSize:"11px", color:"var(--yr-muted)" }}>
          Energy {readiness.energy}/5 · Sleep {readiness.sleep} · Soreness {readiness.soreness}
          {cycleState && ` · ${cycleState.setsReps}`}
        </p>
      </div>
      <button className="btn-ghost" style={{ padding:"5px 10px", fontSize:"12px" }}
        onClick={() => { setReadiness(null); setShowReadiness(false); }}>
        Redo
      </button>
    </div>
  );

  return null;
}
