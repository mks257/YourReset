import { PHASE_EMOJI } from "../cycleEngine";

/**
 * Readiness schema — integer 1..5 for every field.
 *   energy:   1 = depleted, 5 = peak
 *   sleep:    1 = poor,     5 = great
 *   mood:     1 = low,      5 = high
 *   soreness: 1 = none,     5 = high   ← high is worse
 *   cramps:   1 = none,     5 = high   ← high is worse
 *
 * CycleTab writes the same shape (5-position sliders). cycleEngine.getReadinessScore
 * still accepts legacy string values ("poor", "high", etc.) so users who checked in
 * via the previous string-typed UI aren't broken on this release.
 */
const CHECKS = [
  { key:"energy",   label:"Energy",   opts:[
    { label:"1", value:1 }, { label:"2", value:2 }, { label:"3", value:3 }, { label:"4", value:4 }, { label:"5", value:5 },
  ]},
  { key:"sleep",    label:"Sleep",    opts:[
    { label:"Poor", value:1 }, { label:"Ok", value:3 }, { label:"Good", value:5 },
  ]},
  // For soreness/cramps, "None" is best so it maps to 1 (high=worse convention).
  { key:"soreness", label:"Soreness", opts:[
    { label:"None", value:1 }, { label:"Mild", value:3 }, { label:"High", value:5 },
  ]},
  { key:"cramps",   label:"Cramps",   opts:[
    { label:"None", value:1 }, { label:"Mild", value:3 }, { label:"High", value:5 },
  ]},
  { key:"mood",     label:"Mood",     opts:[
    { label:"Low", value:1 }, { label:"Neutral", value:3 }, { label:"High", value:5 },
  ]},
];

// Display helpers for the saved-state summary card
const SORENESS_LABEL = { 1:"None", 2:"Low", 3:"Mild", 4:"Moderate", 5:"High" };
const SLEEP_LABEL    = { 1:"Poor", 2:"Fair", 3:"Ok",   4:"Good",     5:"Great" };
function labelFor(field, val) {
  if (val == null) return "—";
  // Backwards compat: a legacy string value comes through unchanged
  if (typeof val === "string") return val.charAt(0).toUpperCase() + val.slice(1);
  if (field === "soreness" || field === "cramps") return SORENESS_LABEL[val] || String(val);
  if (field === "sleep") return SLEEP_LABEL[val] || String(val);
  return `${val}/5`;
}

export default function ReadinessCheck({ readiness, showReadiness, setReadiness, setShowReadiness, cycleState }) {
  // Validate by explicit type since 0 isn't a valid value but undefined is the "unset" signal
  const canSave = CHECKS.every(({ key }) => typeof showReadiness?.[key] === "number");

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
            {opts.map(({ label: optLabel, value }) => (
              <button key={optLabel} className={`yr-pill${showReadiness?.[key] === value ? " active" : ""}`}
                onClick={() => setShowReadiness(p => ({ ...p, [key]: value }))}>{optLabel}</button>
            ))}
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
        <div style={{ fontSize:11, color:"var(--yr-muted)" }}>
          Energy {labelFor("energy", readiness.energy)} · Sleep {labelFor("sleep", readiness.sleep)} · Soreness {labelFor("soreness", readiness.soreness)}
        </div>
      </div>
      <button onClick={() => { setReadiness(null); setShowReadiness(false); }} style={{ background:"transparent", border:"none", color:"var(--yr-muted)", cursor:"pointer", fontSize:12, fontFamily:"inherit" }}>redo</button>
    </div>
  );

  return null;
}
