import { useState, useEffect } from "react";
import * as Storage from "../storage";
import { getPrevWeekKey } from "../storage";
import { parseSets } from "../cycleEngine";
import { T } from "../theme";

function WorkoutLogger({ ex, selectedDay, weekKey, dayColor }) {
  const logKey  = `log_${weekKey}_${selectedDay}_${ex.id}`;
  const prevKey = `log_${getPrevWeekKey()}_${selectedDay}_${ex.id}`;
  const numSets = parseSets(ex.sets) || 3;

  const [sets, setSets] = useState(() => {
    const saved = Storage.get(logKey, null);
    if (saved && saved.length === numSets) return saved;
    return Array.from({ length: numSets }, (_, i) => ({ set: i + 1, reps: "", weight: "", rpe: "", done: false }));
  });

  // previous week's log for progressive overload reference
  const prevLog = Storage.get(prevKey, null);
  const prevHasData = prevLog?.some(s => s.weight || s.reps);

  // suggest load increase if last week all sets were RPE <= 7 and completed
  const prevAvgRpe = prevHasData
    ? prevLog.filter(s => s.rpe).reduce((a, s) => a + Number(s.rpe), 0) / prevLog.filter(s => s.rpe).length
    : null;
  const suggestIncrease = prevAvgRpe !== null && prevAvgRpe <= 7 && prevLog.every(s => s.done);

  useEffect(() => { Storage.set(logKey, sets); }, [sets, logKey]);

  const update = (i, field, val) =>
    setSets(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));

  const completedSets = sets.filter(s => s.done).length;

  if (!parseSets(ex.sets)) return null;

  return (
    <div style={{ background: T.card2, borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontSize: "0.65rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>📝 Log Your Sets</div>
        <div style={{ fontSize: "0.65rem", color: completedSets === numSets ? T.green : T.muted, fontWeight: 700 }}>{completedSets}/{numSets} done</div>
      </div>

      {/* Previous week reference */}
      {prevHasData && (
        <div style={{ background: `${T.violet}10`, border: `1px solid ${T.violet}22`, borderRadius: 8, padding: "6px 10px", marginBottom: 10, fontSize: "0.68rem", color: T.muted }}>
          <span style={{ color: T.violet, fontWeight: 700 }}>Last week: </span>
          {prevLog.map((s, i) => (
            <span key={i}>{s.weight || "—"} × {s.reps || "—"}{s.rpe ? ` @${s.rpe}` : ""}{i < prevLog.length - 1 ? "  ·  " : ""}</span>
          ))}
          {suggestIncrease && (
            <span style={{ color: T.green, fontWeight: 700, marginLeft: 6 }}>↑ Try more load today</span>
          )}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr 44px", gap: 6, marginBottom: 6 }}>
        {["", "Weight", `Reps (×${ex.reps})`, "RPE"].map((h, i) => (
          <div key={i} style={{ fontSize: "0.58rem", color: T.muted, textAlign: i > 0 ? "center" : "left" }}>{h}</div>
        ))}
      </div>
      {sets.map((s, i) => {
        const prev = prevLog?.[i];
        return (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr 44px", gap: 6, marginBottom: 6, alignItems: "center" }}>
            <button onClick={() => update(i, "done", !s.done)} style={{
              width: 24, height: 24, borderRadius: 7, border: `1px solid ${s.done ? T.green : T.border}`,
              background: s.done ? `${T.green}20` : "transparent", color: s.done ? T.green : T.muted,
              cursor: "pointer", fontSize: "0.68rem", display: "flex", alignItems: "center", justifyContent: "center",
            }}>{s.done ? "✓" : i + 1}</button>
            <input
              placeholder={prev?.weight ? `Last: ${prev.weight}` : "kg / lb"}
              value={s.weight} onChange={e => update(i, "weight", e.target.value)}
              style={{ padding: "6px 8px", borderRadius: 8, border: `1px solid ${s.done ? T.green + "44" : T.border}`, background: "#080912", color: T.text, fontSize: "0.8rem", outline: "none", width: "100%" }} />
            <input
              placeholder={prev?.reps ? `Last: ${prev.reps}` : ex.reps}
              value={s.reps} onChange={e => update(i, "reps", e.target.value)}
              style={{ padding: "6px 8px", borderRadius: 8, border: `1px solid ${s.done ? T.green + "44" : T.border}`, background: "#080912", color: T.text, fontSize: "0.8rem", outline: "none", width: "100%" }} />
            <select value={s.rpe} onChange={e => update(i, "rpe", e.target.value)}
              style={{ padding: "5px 2px", borderRadius: 8, border: `1px solid ${T.border}`, background: "#080912", color: T.text, fontSize: "0.72rem", outline: "none" }}>
              <option value="">—</option>
              {[5, 6, 7, 8, 9, 10].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        );
      })}
      <div style={{ fontSize: "0.6rem", color: T.muted, marginTop: 6 }}>
        RPE 5 = easy · 7 = challenging · 10 = max · Saved automatically
      </div>
    </div>
  );
}

export default WorkoutLogger;
