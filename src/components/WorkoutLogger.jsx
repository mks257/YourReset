import { useState, useEffect, useMemo } from "react";
import * as Storage from "../storage";
import { getExerciseHistory } from "../storage";
import { parseSets } from "../cycleEngine";
import { T } from "../theme";

function WorkoutLogger({ ex, selectedDay, weekKey, dayColor }) {
  const logKey  = `log_${weekKey}_${selectedDay}_${ex.id}`;
  const numSets = parseSets(ex.sets) || 3;

  const fullHistory = useMemo(() => getExerciseHistory(ex.id), [ex.id]);
  const prevLog = fullHistory[fullHistory.length - 1]?.data;

  // Suggest load increase if last 2 sessions were all done at RPE ≤ 7
  const suggestIncrease = useMemo(() => {
    if (fullHistory.length < 1) return false;
    return fullHistory.slice(-2).every(h => {
      const validRpes = h.data.filter(s => s.rpe);
      if (!validRpes.length) return false;
      const avg = validRpes.reduce((a, s) => a + Number(s.rpe), 0) / validRpes.length;
      return avg <= 7 && h.data.every(s => s.done);
    });
  }, [fullHistory]);

  const [sets, setSets] = useState(() => {
    const saved = Storage.get(logKey, null);
    if (saved && saved.length === numSets) return saved;
    return Array.from({ length: numSets }, (_, i) => ({ set: i + 1, reps: "", weight: "", rpe: "", done: false }));
  });

  useEffect(() => { Storage.set(logKey, sets); }, [sets, logKey]);

  const update = (i, field, val) =>
    setSets(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));

  const completedSets = sets.filter(s => s.done).length;

  if (!parseSets(ex.sets)) return null;

  return (
    <div style={{ background: T.card2, borderRadius: 16, padding: "14px 16px", marginBottom: 16 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: "0.65rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>📝 Log Your Sets</div>
        <div style={{
          fontSize: "0.65rem", fontWeight: 700,
          color: completedSets === numSets ? T.green : T.muted,
        }}>{completedSets}/{numSets} done</div>
      </div>

      {/* Column headers */}
      <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr 44px", gap: 6, marginBottom: 6 }}>
        {["", "Weight", `Reps (×${ex.reps})`, "RPE"].map((h, i) => (
          <div key={i} style={{ fontSize: "0.58rem", color: T.muted, textAlign: i > 0 ? "center" : "left" }}>{h}</div>
        ))}
      </div>

      {/* Set rows */}
      {sets.map((s, i) => {
        const prev = prevLog?.[i];
        const hasPrev = prev?.weight || prev?.reps;
        const prevStr = hasPrev
          ? [prev.weight, prev.reps ? `× ${prev.reps}` : null, prev.rpe ? `@ RPE ${prev.rpe}` : null].filter(Boolean).join(" ")
          : null;
        // Show ↑ prompt only on first set when suggestIncrease is active
        const showBump = suggestIncrease && i === 0;

        return (
          <div key={i} style={{ marginBottom: i < sets.length - 1 ? 10 : 6 }}>
            {/* Input row */}
            <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr 44px", gap: 6, alignItems: "center" }}>
              <button onClick={() => update(i, "done", !s.done)} style={{
                width: 24, height: 24, borderRadius: 7,
                border: `1px solid ${s.done ? T.green : T.border}`,
                background: s.done ? `${T.green}20` : "transparent",
                color: s.done ? T.green : T.muted,
                cursor: "pointer", fontSize: "0.68rem",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{s.done ? "✓" : i + 1}</button>

              <input
                placeholder="kg / lb"
                value={s.weight}
                onChange={e => update(i, "weight", e.target.value)}
                style={{
                  padding: "7px 8px", borderRadius: 8,
                  border: `1px solid ${s.done ? T.green + "44" : T.border}`,
                  background: T.bg, color: T.text, fontSize: "0.8rem",
                  outline: "none", width: "100%",
                }}
              />
              <input
                placeholder={ex.reps}
                value={s.reps}
                onChange={e => update(i, "reps", e.target.value)}
                style={{
                  padding: "7px 8px", borderRadius: 8,
                  border: `1px solid ${s.done ? T.green + "44" : T.border}`,
                  background: T.bg, color: T.text, fontSize: "0.8rem",
                  outline: "none", width: "100%",
                }}
              />
              <select
                value={s.rpe}
                onChange={e => update(i, "rpe", e.target.value)}
                style={{
                  padding: "6px 2px", borderRadius: 8,
                  border: `1px solid ${T.border}`,
                  background: T.bg, color: T.text,
                  fontSize: "0.72rem", outline: "none",
                }}
              >
                <option value="">—</option>
                {[5, 6, 7, 8, 9, 10].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Per-set last session line */}
            {(prevStr || showBump) && (
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                paddingLeft: 34, marginTop: 4,
              }}>
                {prevStr && (
                  <span style={{ fontSize: "0.67rem", color: T.muted }}>
                    last: <span style={{ color: "rgba(240,238,255,0.5)" }}>{prevStr}</span>
                  </span>
                )}
                {showBump && (
                  <span style={{
                    fontSize: "0.6rem", fontWeight: 700,
                    color: T.green, letterSpacing: "0.02em",
                  }}>↑ bump load</span>
                )}
              </div>
            )}
          </div>
        );
      })}

      <div style={{ fontSize: "0.6rem", color: T.muted, marginTop: 4 }}>
        RPE 5 = easy · 7 = challenging · 10 = max · Saved automatically
      </div>
    </div>
  );
}

export default WorkoutLogger;
