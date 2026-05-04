import { useMemo, useState } from "react";
import ExerciseAnimation from "./ExerciseAnimation";
import ReadinessCheck from "./ReadinessCheck";
import { WEEK_PLAN, EQUIPMENT_MAP, SUBSTITUTIONS, SWAP_LIBRARY, DAY_TEMPLATES } from "../workoutData";
import { buildDayExercises, findAlternatives } from "../exerciseLibrary";
import { PHASE_EMOJI } from "../cycleEngine";

function chipDate(dayIndex) {
  const today = new Date();
  const diff  = dayIndex - today.getDay();
  const d     = new Date(today);
  d.setDate(today.getDate() + diff);
  return d.toLocaleDateString("en-US", { month:"short", day:"numeric" });
}

// Pick best exercise for avatar — prefer a strength or compound movement
function pickAvatar(exercises) {
  return (
    exercises.find(e => e.type === "Strength") ||
    exercises.find(e => e.type === "Fat Burn")  ||
    exercises[1] || exercises[0]
  );
}

export default function PlanTab({
  day, selectedDay, setSelectedDay, done, setDone, setModal,
  readiness, showReadiness, setReadiness, setShowReadiness,
  cycleState, profile, weekKey, theme, phaseCopy,
  swapped = {}, onSwap, onUndoSwap, dbReady = false,
}) {
  // Substitution state — user-selected alternative for a specific exercise slot
  const [subbing, setSubbing]       = useState(null);   // { slotId, alternatives[] }
  const [subSwapped, setSubSwapped] = useState({});     // { slotId: swapExercise }

  // Week number for cross-week exercise variety
  const weekNum = useMemo(() => {
    const now = new Date();
    const jan1 = new Date(now.getFullYear(), 0, 1);
    return Math.ceil(((now - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  }, []);

  // Dynamic exercises from free-exercise-db when ready; static WEEK_PLAN as fallback
  // Build all 7 days together so we can exclude adjacent-day exercises
  const allDynamicExercises = useMemo(() => {
    if (!dbReady) return null;
    const result = {};
    const usedIds = new Set();

    DAY_TEMPLATES.forEach((template, idx) => {
      const generated = buildDayExercises({
        phase:       cycleState?.phase || null,
        goal:        profile?.goal || "wellness",
        equipment:   profile?.equipment || ["bodyweight"],
        muscles:     template.muscles,
        dayCategory: template.dayCategory,
        count:       template.count || 5,
        seed:        idx * 100 + weekNum * 1000, // different each week
        excludeIds:  new Set(usedIds),           // exclude all previous days
      });
      generated.forEach(ex => usedIds.add(ex.id));
      result[idx] = generated.length >= 3 ? generated : null;
    });
    return result;
  }, [dbReady, cycleState?.phase, profile?.goal, profile?.equipment, weekNum]);

  const dynamicExercises = allDynamicExercises?.[selectedDay] ?? null;

  const exercises  = dynamicExercises || day.exercises;
  const doneCount  = exercises.filter(e => done[`${selectedDay}-${e.id}`]).length;
  const totalKcal  = exercises.reduce((a, e) => a + e.kcal, 0);
  const burnedKcal = exercises.filter(e => done[`${selectedDay}-${e.id}`]).reduce((a, e) => a + e.kcal, 0);
  const pct        = Math.round((doneCount / exercises.length) * 100);
  const estMin     = Math.round(exercises.length * 4.5);
  const avatarEx   = pickAvatar(exercises);

  return (
    <div className="screen-stack">

      {/* ── Today card: workout + phase merged ── */}
      <section className="today-card fade-in">
        <div className="today-copy">
          <div className="today-label">Today's workout</div>
          <h1>{day.label}</h1>

          {/* Phase info merged in — no separate card */}
          {cycleState ? (
            <p className="today-meta">
              {PHASE_EMOJI[cycleState.phase]} {theme.label} · Day {cycleState.dayOfCycle}
            </p>
          ) : (
            <p className="today-meta">{day.focus}</p>
          )}

          <p style={{ fontSize:13, color:"var(--yr-muted)", lineHeight:1.5, margin:"8px 0 10px" }}>
            {phaseCopy}
          </p>

          {cycleState && (
            <p style={{ fontSize:12, color:"var(--phase-accent)", fontWeight:600, marginBottom:14 }}>
              {cycleState.setsReps}
            </p>
          )}

          <button className="primary-action">Start workout</button>
        </div>

        {/* 2D exercise animation — instant, no Three.js overhead */}
        <div className="avatar-preview" style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>
          <ExerciseAnimation type={avatarEx.anim} color={theme.accent} />
        </div>
      </section>

      {/* ── Inline stat strip — no boxes ── */}
      <div className="stats-strip fade-in">
        <strong>{doneCount}/{exercises.length}</strong>
        <span>exercises</span>
        <span className="sep">·</span>
        <strong style={{ color:"var(--yr-amber)" }}>{burnedKcal}</strong>
        <span>/ {totalKcal} kcal</span>
        <span className="sep">·</span>
        <strong>{pct}%</strong>
        <span>complete</span>
      </div>

      {/* ── Readiness compact ── */}
      <ReadinessCheck
        readiness={readiness} showReadiness={showReadiness}
        setReadiness={setReadiness} setShowReadiness={setShowReadiness}
        cycleState={cycleState}
      />

      {/* ── Week selector ── */}
      <div className="week-scroll fade-in">
        {WEEK_PLAN.map((d, i) => (
          <button key={i} className={`week-day${selectedDay === i ? " active" : ""}`}
            onClick={() => setSelectedDay(i)}>
            <strong>{i === 0 ? "Today" : d.name.slice(0,3)}</strong>
            <span>{chipDate(d.day)}</span>
          </button>
        ))}
      </div>

      {/* ── Exercise list ── */}
      <div>
        <div className="section-header">
          <h2 className="section-title">Up next</h2>
          <span style={{ fontSize:12, color:"var(--yr-muted)" }}>
            {exercises.length} exercises · ~{estMin} min
            {dynamicExercises && <span style={{ color:"var(--phase-accent)", marginLeft:6, fontSize:10, fontWeight:700 }}>✦ personalised</span>}
          </span>
        </div>

        <div className="exercise-list" style={{ marginTop:10 }}>
          {exercises.map((ex, i) => {
            const key      = `${selectedDay}-${ex.id}`;
            const isDone   = !!done[key];
            const swapEx   = swapped[key];           // replacement exercise if swapped
            const display  = swapEx || ex;           // what to render
            const isSwapped = !!swapEx;

            // Equipment check always runs on original exercise
            const required   = EQUIPMENT_MAP[ex.id] || [];
            const missing    = required.filter(e => !(profile?.equipment || []).includes(e));
            const hasMissing = !isSwapped && missing.length > 0;
            const sub        = SUBSTITUTIONS[ex.id];
            const canSwap    = !isSwapped && hasMissing && !!SWAP_LIBRARY[ex.id];
            const num        = String(i + 1).padStart(2, "0");

            return (
              <article key={ex.id}
                className={`exercise-row fade-in${isDone ? " ex-done" : isSwapped ? "" : hasMissing ? " ex-warn" : ""}`}
                style={{ animationDelay:`${0.025 * i}s` }}
                onClick={() => setModal({ ...display, _doneKey: key })}>

                <div className={`exercise-index${isDone ? " done" : ""}`}>
                  {isDone ? "✓" : num}
                </div>

                <div className="exercise-main">
                  <h3 style={{ textDecoration: isDone ? "line-through" : "none" }}>
                    {display.name}
                  </h3>
                  <p>{display.sets} · {display.muscle}</p>
                  <div className="tag-row">
                    <span>{display.type}</span>
                    <span style={{ color:"var(--yr-amber)", background:"rgba(242,189,115,0.1)" }}>
                      {display.kcal} kcal
                    </span>
                    {hasMissing && (
                      <span className="tag-warn">No {missing.join(", ")}</span>
                    )}
                    {isSwapped && (
                      <span style={{ fontSize:10, padding:"3px 8px", borderRadius:99, fontWeight:700,
                        color:"var(--phase-accent)", background:"var(--phase-soft)", border:"1px solid var(--phase-border)" }}>
                        Swapped
                      </span>
                    )}
                  </div>

                  {/* Equipment warning + one-tap Swap button */}
                  {hasMissing && sub && !canSwap && (
                    <p className="equipment-warning">Try: {sub}</p>
                  )}
                  {canSwap && (
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:5 }}>
                      <p className="equipment-warning" style={{ margin:0 }}>Try: {sub}</p>
                      <button
                        onClick={(e) => { e.stopPropagation(); onSwap(ex.id); }}
                        style={{
                          padding:"4px 10px", borderRadius:99, fontSize:11, fontWeight:700,
                          border:"1px solid var(--phase-border)", background:"var(--phase-soft)",
                          color:"var(--phase-accent)", cursor:"pointer", whiteSpace:"nowrap", flexShrink:0,
                        }}>
                        Swap →
                      </button>
                    </div>
                  )}

                  {/* Undo swap */}
                  {isSwapped && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onUndoSwap(ex.id); }}
                      style={{
                        marginTop:5, padding:"3px 8px", borderRadius:99, fontSize:10, fontWeight:600,
                        border:"1px solid var(--yr-border)", background:"transparent",
                        color:"var(--yr-muted)", cursor:"pointer",
                      }}>
                      ↩ Restore original
                    </button>
                  )}
                </div>

                {/* Alternatives button — shown on dynamic exercises when DB is ready */}
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                  <div className="exercise-status">{isDone ? "Done" : "›"}</div>
                  {dbReady && !isDone && !isSwapped && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const alts = findAlternatives({
                          exercise: { ...ex, primaryMuscles: ex.muscle?.split(", ") || [] },
                          equipment: profile?.equipment || ["bodyweight"],
                          count: 5,
                          excludeId: ex.id,
                        });
                        setSubbing({ slotId: key, originalEx: ex, alternatives: alts });
                      }}
                      title="Find alternatives"
                      style={{
                        width:20, height:20, borderRadius:6, border:"1px solid var(--yr-border-soft)",
                        background:"transparent", color:"var(--yr-faint)", fontSize:11,
                        cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                        transition:"color 0.12s",
                      }}>
                      ⟳
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* ── Substitution picker sheet ── */}
      {subbing && (
        <div onClick={() => setSubbing(null)} style={{
          position:"fixed", inset:0, background:"rgba(0,0,0,0.7)",
          zIndex:200, display:"flex", alignItems:"flex-end",
          backdropFilter:"blur(6px)",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            width:"100%", maxWidth:430, margin:"0 auto",
            background:"var(--yr-bg-soft)", borderRadius:"24px 24px 0 0",
            padding:"20px 16px 32px", border:"1px solid var(--yr-border)",
          }}>
            <div style={{ fontWeight:800, fontSize:15, color:"var(--yr-text)", marginBottom:4 }}>
              Find an alternative
            </div>
            <div style={{ fontSize:12, color:"var(--yr-muted)", marginBottom:14 }}>
              Replacing: <em>{subbing.originalEx?.name}</em>
            </div>

            {subbing.alternatives.length === 0 ? (
              <p style={{ fontSize:13, color:"var(--yr-muted)", textAlign:"center", padding:"20px 0" }}>
                No alternatives found for your equipment. Try adjusting your equipment in Settings.
              </p>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {subbing.alternatives.map(alt => (
                  <button key={alt.id}
                    onClick={() => { onSwap(subbing.originalEx.id, alt); setSubbing(null); }}
                    style={{
                      textAlign:"left", padding:"12px 14px", borderRadius:14,
                      border:"1px solid var(--yr-border)", background:"var(--yr-card)",
                      cursor:"pointer", transition:"background 0.13s",
                    }}>
                    <div style={{ fontWeight:700, fontSize:14, color:"var(--yr-text)", marginBottom:3 }}>{alt.name}</div>
                    <div style={{ fontSize:12, color:"var(--yr-muted)" }}>{alt.sets} · {alt.muscle}</div>
                    <div style={{ display:"flex", gap:6, marginTop:5 }}>
                      <span style={{ fontSize:10, padding:"2px 7px", borderRadius:99,
                        background:"var(--phase-soft)", color:"var(--phase-accent)", fontWeight:700 }}>
                        {alt.type}
                      </span>
                      <span style={{ fontSize:10, padding:"2px 7px", borderRadius:99,
                        background:"rgba(242,189,115,0.12)", color:"var(--yr-amber)", fontWeight:700 }}>
                        {alt.kcal} kcal
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <button className="btn-ghost" onClick={() => setSubbing(null)}
              style={{ width:"100%", marginTop:12, textAlign:"center" }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
