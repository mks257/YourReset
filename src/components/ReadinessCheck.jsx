import { T } from "../theme";
import { PHASE_EMOJI } from "../cycleEngine";

function ReadinessCheck({ readiness, showReadiness, setReadiness, setShowReadiness, cycleState }) {
  return (
    <>
      {!readiness && !showReadiness && (
        <div className="fu d1" style={{ background: T.card, border: `1px solid ${T.teal}33`, borderRadius: 16, padding: "14px 18px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "0.88rem", color: T.teal }}>🌤 How are you feeling today?</div>
            <div style={{ fontSize: "0.7rem", color: T.muted, marginTop: 2 }}>Takes 10 seconds · adapts your workout</div>
          </div>
          <button onClick={() => setShowReadiness(true)} style={{ background: `${T.teal}20`, border: `1px solid ${T.teal}44`, borderRadius: 10, padding: "8px 14px", color: T.teal, fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>Check in</button>
        </div>
      )}
      {showReadiness && !readiness && (
        <div className="fu d1" style={{ background: T.card, border: `1px solid ${T.teal}44`, borderRadius: 18, padding: "18px 20px", marginBottom: 16 }}>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "0.9rem", color: T.teal, marginBottom: 14 }}>🌤 Today's check-in</div>
          {[
            { key: "energy", label: "Energy", options: ["😴 1", "😐 2", "🙂 3", "😊 4", "⚡ 5"] },
            { key: "sleep", label: "Sleep", options: ["💀 Bad", "😐 OK", "😴 Good"] },
            { key: "soreness", label: "Soreness", options: ["✅ None", "😬 Some", "🔥 High"] },
          ].map(({ key, label, options }) => (
            <div key={key} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: "0.68rem", color: T.muted, marginBottom: 6 }}>{label}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {options.map((opt, idx) => {
                  const val = key === "energy" ? idx + 1 : opt.split(" ")[1].toLowerCase();
                  return (
                    <button key={opt} onClick={() => setShowReadiness(prev => ({ ...prev, [key]: val }))}
                      style={{ padding: "6px 10px", borderRadius: 9, border: `1px solid ${showReadiness?.[key] === val ? T.teal : T.border}`, background: showReadiness?.[key] === val ? `${T.teal}20` : T.card2, color: showReadiness?.[key] === val ? T.teal : T.muted, fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: "0.75rem", cursor: "pointer" }}>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <button
            disabled={!showReadiness?.energy || !showReadiness?.sleep || !showReadiness?.soreness}
            onClick={() => { setReadiness(showReadiness); setShowReadiness(false); }}
            style={{ width: "100%", padding: "10px 0", borderRadius: 12, border: "none", cursor: (showReadiness?.energy && showReadiness?.sleep && showReadiness?.soreness) ? "pointer" : "not-allowed", background: (showReadiness?.energy && showReadiness?.sleep && showReadiness?.soreness) ? `linear-gradient(135deg,${T.teal},${T.violet})` : T.card2, color: "#fff", fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: "0.85rem", marginTop: 4 }}>
            Save & adapt plan ✓
          </button>
        </div>
      )}
      {readiness && cycleState && (
        <div className="fu d1" style={{ background: `${cycleState.color}10`, border: `1px solid ${cycleState.color}33`, borderRadius: 14, padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: cycleState.color }}>{PHASE_EMOJI[cycleState.phase]} {cycleState.label} · {cycleState.setsReps}</div>
            <div style={{ fontSize: "0.68rem", color: T.muted, marginTop: 2 }}>Energy {readiness.energy}/5 · Sleep {readiness.sleep} · Soreness {readiness.soreness}</div>
          </div>
          <button onClick={() => { setReadiness(null); setShowReadiness(false); }} style={{ fontSize: "0.6rem", color: T.muted, background: "transparent", border: "none", cursor: "pointer" }}>redo</button>
        </div>
      )}
    </>
  );
}

export default ReadinessCheck;
