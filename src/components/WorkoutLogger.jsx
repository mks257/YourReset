import { useState, useEffect, useMemo } from "react";
import * as Storage from "../storage";
import { getExerciseHistory } from "../storage";
import { parseSets } from "../cycleEngine";
import { T } from "../theme";
import RestTimer from "./RestTimer";

function WorkoutLogger({ ex, selectedDay, weekKey, dayColor }) {
  const logKey  = `log_${weekKey}_${selectedDay}_${ex.id}`;
  const numSets = parseSets(ex.sets) || 3;

  // Rest timer state — bumped each time a set is marked done so the timer
  // remounts with a fresh countdown. null when no timer is showing.
  // The shared restTimerKey forces React to give us a new RestTimer
  // instance (and therefore a fresh 90s countdown) for each new set.
  const [restTimerKey, setRestTimerKey] = useState(null);

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

      {/* Column headers — RPE moved out of the input grid into a per-set
          pill row below (native iOS pickers wheel poorly inside modals). */}
      <div style={{ display: "grid", gridTemplateColumns: "44px 1fr 1fr", gap: 6, marginBottom: 6 }}>
        {["", "Weight", `Reps (×${ex.reps})`].map((h, i) => (
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
          <div key={i} style={{ marginBottom: i < sets.length - 1 ? 14 : 6 }}>
            {/* Input row — set-done button is 44pt outer tap area with a
                visible 24px inner circle, matching iOS HIG (44pt minimum). */}
            <div style={{ display: "grid", gridTemplateColumns: "44px 1fr 1fr", gap: 6, alignItems: "center" }}>
              <button
                onClick={() => {
                  const wasNotDone = !s.done;
                  update(i, "done", !s.done);
                  // Record today as a completed-workout day for the
                  // streak counter (idempotent within the day).
                  if (wasNotDone) Storage.recordWorkoutDay();
                  // Auto-start the rest timer only on the transition
                  // not-done → done (not when toggling back off), and only
                  // if this isn't the very last set of the exercise.
                  if (wasNotDone && i < sets.length - 1) {
                    setRestTimerKey(Date.now());
                  }
                }}
                aria-label={s.done ? `Mark set ${i + 1} not done` : `Mark set ${i + 1} done`}
                aria-pressed={s.done}
                style={{
                  width: 44, height: 44,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "transparent", border: "none", padding: 0,
                  cursor: "pointer",
                }}
              >
                <span style={{
                  width: 24, height: 24, borderRadius: 7,
                  border: `1px solid ${s.done ? T.green : T.border}`,
                  background: s.done ? `${T.green}20` : "transparent",
                  color: s.done ? T.green : T.muted,
                  fontSize: "0.68rem",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {s.done ? "✓" : i + 1}
                </span>
              </button>

              <input
                type="number"
                inputMode="decimal"
                step="0.5"
                placeholder="kg / lb"
                value={s.weight}
                onChange={e => update(i, "weight", e.target.value)}
                style={{
                  padding: "10px 8px", borderRadius: 8,
                  border: `1px solid ${s.done ? T.green + "44" : T.border}`,
                  background: T.bg, color: T.text, fontSize: "0.9rem",
                  outline: "none", width: "100%", minHeight: 36,
                  boxSizing: "border-box",
                }}
              />
              <input
                type="number"
                inputMode="numeric"
                placeholder={ex.reps}
                value={s.reps}
                onChange={e => update(i, "reps", e.target.value)}
                style={{
                  padding: "10px 8px", borderRadius: 8,
                  border: `1px solid ${s.done ? T.green + "44" : T.border}`,
                  background: T.bg, color: T.text, fontSize: "0.9rem",
                  outline: "none", width: "100%", minHeight: 36,
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* RPE pills — replaces the native <select> wheel picker which
                was a tiny gym-hostile UX inside a modal. */}
            <div style={{
              display: "flex", gap: 4, marginTop: 8,
              paddingLeft: 44, // align with input columns (past the 44pt done button)
              alignItems: "center",
            }}>
              <span style={{ fontSize: "0.55rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 4 }}>RPE</span>
              {[5, 6, 7, 8, 9, 10].map(r => {
                const isActive = String(s.rpe) === String(r);
                return (
                  <button
                    key={r}
                    onClick={() => update(i, "rpe", isActive ? "" : String(r))}
                    aria-label={`RPE ${r}`}
                    aria-pressed={isActive}
                    style={{
                      flex: 1, minHeight: 32, minWidth: 32,
                      borderRadius: 8,
                      border: `1px solid ${isActive ? T.green : T.border}`,
                      background: isActive ? `${T.green}1f` : "transparent",
                      color: isActive ? T.green : T.muted,
                      fontFamily: "inherit", fontSize: "0.72rem", fontWeight: 600,
                      cursor: "pointer", padding: 0,
                    }}
                  >
                    {r}
                  </button>
                );
              })}
            </div>

            {/* Per-set last session line */}
            {(prevStr || showBump) && (
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                paddingLeft: 44, marginTop: 4,
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

      {/* Rest timer — auto-mounts after marking a set done (except last).
          key change forces a fresh 90s countdown each time. */}
      {restTimerKey && (
        <RestTimer
          key={restTimerKey}
          defaultSeconds={90}
          onComplete={() => setRestTimerKey(null)}
          onSkip={() => setRestTimerKey(null)}
        />
      )}
    </div>
  );
}

export default WorkoutLogger;
