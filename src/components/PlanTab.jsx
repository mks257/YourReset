import { lazy, Suspense } from "react";
import ExerciseAnimation from "./ExerciseAnimation"; // used for exercise-card thumbnails

// Three.js chunk — lazy so it doesn't inflate initial JS parse time
const Exercise3DPreview = lazy(() => import("./Exercise3DPreview"));

// Slim placeholder matching the avatar-preview column while Three.js loads
function AvatarSkeleton({ color }) {
  return (
    <div style={{
      width: "100%", height: "100%", minHeight: 160,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: `color-mix(in srgb, ${color} 8%, transparent)`,
      borderRadius: 20,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        border: `2px solid ${color}33`, borderTopColor: color,
        animation: "avatar-spin 0.7s linear infinite",
      }} />
      <style>{`@keyframes avatar-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
import ReadinessCheck from "./ReadinessCheck";
import { WEEK_PLAN, EQUIPMENT_MAP, SUBSTITUTIONS, SWAP_LIBRARY } from "../workoutData";
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
  swapped = {}, onSwap, onUndoSwap,
}) {
  const doneCount  = day.exercises.filter(e => done[`${selectedDay}-${e.id}`]).length;
  const totalKcal  = day.exercises.reduce((a, e) => a + e.kcal, 0);
  const burnedKcal = day.exercises.filter(e => done[`${selectedDay}-${e.id}`]).reduce((a, e) => a + e.kcal, 0);
  const pct        = Math.round((doneCount / day.exercises.length) * 100);
  const estMin     = Math.round(day.exercises.length * 4.5);
  const avatarEx   = pickAvatar(day.exercises);

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

        {/* 3D avatar — lazy so Three.js only loads after first interaction */}
        <div className="avatar-preview" style={{ overflow:"hidden", borderRadius:20 }}>
          <Suspense fallback={<AvatarSkeleton color={theme.accent} />}>
            <Exercise3DPreview type={avatarEx.anim} color={theme.accent} height={200} />
          </Suspense>
        </div>
      </section>

      {/* ── Inline stat strip — no boxes ── */}
      <div className="stats-strip fade-in">
        <strong>{doneCount}/{day.exercises.length}</strong>
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
          <span style={{ fontSize:12, color:"var(--yr-muted)" }}>{day.exercises.length} exercises · ~{estMin} min</span>
        </div>

        <div className="exercise-list" style={{ marginTop:10 }}>
          {day.exercises.map((ex, i) => {
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

                <div className="exercise-status">
                  {isDone ? "Done" : "›"}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
