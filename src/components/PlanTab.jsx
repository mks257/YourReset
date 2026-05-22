import { useMemo, useState } from "react";
import FoodCapsuleCard from "./FoodCapsuleCard";
import ExerciseAnimation from "./ExerciseAnimation";
import ReadinessCheck from "./ReadinessCheck";
import { WEEK_PLAN, EQUIPMENT_MAP, SUBSTITUTIONS, SWAP_LIBRARY, DAY_TEMPLATES } from "../workoutData";
import { buildDayExercises, findAlternatives } from "../exerciseLibrary";
import { PHASE_EMOJI, getReadinessScore, getAdjustedIntensity, buildReadinessNote, adaptVolume, parseSets } from "../cycleEngine";
import { useCountUp } from "./MotionHooks";
import * as Storage from "../storage";

function pickAvatar(exercises) {
  return exercises.find(e => e.type === "Strength") || exercises.find(e => e.type === "Fat Burn") || exercises[0];
}

function chipDate(dayIndex) {
  const today = new Date();
  const diff = dayIndex - today.getDay();
  const d = new Date(today);
  d.setDate(today.getDate() + diff);
  return d.toLocaleDateString("en-US", { month:"short", day:"numeric" });
}

export default function PlanTab({
  day, selectedDay, setSelectedDay, done, setDone, setModal,
  readiness, showReadiness, setReadiness, setShowReadiness,
  cycleState, profile, weekKey, swapped = {}, onSwap, onUndoSwap,
  dbReady = false, motion = "full", onGoToFuel,
}) {
  const animOn = motion !== "off";
  const [subbing, setSubbing] = useState(null);

  const weekNum = useMemo(() => {
    const now = new Date();
    const jan1 = new Date(now.getFullYear(), 0, 1);
    return Math.ceil(((now - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  }, []);

  const allDynamic = useMemo(() => {
    if (!dbReady) return null;
    const result = {};
    const usedIds = new Set();
    const swapCounts = Storage.get("swap_counts", {});

    DAY_TEMPLATES.forEach((template, idx) => {
      const gen = buildDayExercises({
        phase: cycleState?.phase || null,
        goal: profile?.goal || "wellness",
        equipment: profile?.equipment || ["bodyweight"],
        muscles: template.muscles,
        dayCategory: template.dayCategory,
        count: template.count || 5,
        seed: idx * 100 + weekNum * 1000,
        excludeIds: new Set(usedIds),
        swapCounts,
      });
      gen.forEach(e => usedIds.add(e.id));
      result[idx] = gen.length >= 3 ? gen : null;
    });
    return result;
  }, [dbReady, cycleState?.phase, profile?.goal, profile?.equipment, weekNum]);

  const dynamicExercises = allDynamic?.[selectedDay] ?? null;
  const exercises = dynamicExercises || day.exercises;

  const totalEx   = exercises.length;
  const doneCount = exercises.filter(e => done[`${selectedDay}-${e.id}`]).length;
  const pct       = Math.round((doneCount / totalEx) * 100);
  const pctAnim   = useCountUp(pct, { duration:700, enabled: animOn });
  const estMin    = Math.round(totalEx * 4.5);

  const readinessScore = getReadinessScore(readiness);
  const originalIntensity = cycleState?.intensity || "moderate";
  const adjustedIntensity = getAdjustedIntensity(originalIntensity, readinessScore);
  const isAdapted = readiness && adjustedIntensity !== originalIntensity;
  const adaptationNote = readiness ? buildReadinessNote(originalIntensity, adjustedIntensity, readinessScore) : null;

  const spokes = [
    { key:"readiness", label:"Readiness",    value: readiness ? `${readiness.energy} / 5` : "—",           angle:-70 },
    { key:"phase",     label:"Cycle phase",  value: cycleState ? `Day ${cycleState.dayOfCycle}` : "—",      angle:-25 },
    { key:"workout",   label:"Today",        value: day.label,                                               angle:30  },
    { key:"progress",  label:"Done",         value: `${doneCount}/${totalEx}`,                               angle:90  },
    { key:"time",      label:"Est. time",    value: `~${estMin} min`,                                        angle:150 },
    { key:"kcal",      label:"Est. kcal",    value: `${exercises.reduce((a,e)=>a+e.kcal,0)}`,               angle:210 },
  ];

  const days = [
    { label:"Today", date: chipDate(selectedDay), active:true },
    ...WEEK_PLAN.filter((_,i) => i !== selectedDay).slice(0,6).map((d,i) => ({
      label: d.name.slice(0,3), date: chipDate(d.day), active:false,
    })),
  ];

  return (
    <div>
      {/* HUB */}
      <div className="yr-hub-wrap">
        <div className="yr-overline" style={{ textAlign:"center", display:"flex", justifyContent:"center", alignItems:"center", gap:10 }}>
          <span>Today's signal</span>
          {(() => {
            const streak = Storage.getCurrentStreak();
            if (streak < 1) return null;
            return (
              <span
                aria-label={`${streak}-day streak`}
                style={{
                  display:"inline-flex", alignItems:"center", gap:4,
                  padding:"3px 8px", borderRadius:999,
                  background:"color-mix(in oklch, var(--phase-accent) 18%, transparent)",
                  border:"1px solid color-mix(in oklch, var(--phase-accent) 35%, transparent)",
                  color:"var(--phase-accent)",
                  fontFamily:"var(--font-mono)", fontSize:10, fontWeight:700,
                  letterSpacing:"0.04em",
                  textTransform:"none",
                }}
              >
                <span aria-hidden="true">🔥</span>{streak}-day
              </span>
            );
          })()}
        </div>
        <div className="yr-hub">
          <div className="yr-hub-ring" />
          <div className="yr-hub-ring-2" />
          <div className={`yr-hub-center${motion === "full" ? " yr-bento-breathe" : ""}`}>
            <div className="yr-hub-eyebrow">
              {cycleState ? `${cycleState.setsReps}` : (day.focus || "Today's focus")}
            </div>
            <h1 className="yr-hub-title">{day.label}</h1>
            <div className="yr-hub-meta">{doneCount}/{totalEx} done · {pctAnim}% complete</div>
            {readiness && (
              <div style={{ fontSize:10, color:"var(--phase-accent)", fontFamily:"var(--font-mono)", marginBottom:8, textAlign:"center", padding:"0 20px" }}>
                {adaptationNote}
              </div>
            )}
            {!readiness && cycleState && (
              <div style={{ fontSize:10, color:"var(--phase-accent)", fontFamily:"var(--font-mono)", marginBottom:8, textAlign:"center" }}>
                {PHASE_EMOJI[cycleState.phase]} {cycleState.label}
              </div>
            )}
            <button className="yr-hub-cta" onClick={() => {
              document.querySelector('.yr-journey')?.scrollIntoView({ behavior: 'smooth' });
            }}>Begin session</button>
          </div>

          {spokes.map((s, i) => {
            const rad = (s.angle * Math.PI) / 180;
            const r = 44;
            const x = 50 + Math.cos(rad) * r;
            const y = 50 + Math.sin(rad) * r;
            return (
              <div key={s.key} className="yr-hub-node-wrap" style={{
                position:"absolute", left:`${x}%`, top:`${y}%`,
                transform:"translate(-50%,-50%)",
              }}>
                <button className={`yr-hub-node${animOn ? " yr-stagger-fade-in" : ""}`} style={{"--i": i+1}}>
                  <span className="yr-hub-node-label">{s.label}</span>
                  <span className="yr-hub-node-value">{s.value}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Readiness check */}
      {(!readiness || showReadiness) && (
        <div style={{ maxWidth:600, margin:"0 auto 24px", padding:"0 4px" }}>
          <ReadinessCheck readiness={readiness} showReadiness={showReadiness}
            setReadiness={setReadiness} setShowReadiness={setShowReadiness}
            cycleState={cycleState} />
        </div>
      )}

      {/* Food Capsule */}
      <div style={{ maxWidth: 600, margin: "0 auto 8px", padding: "0 4px" }}>
        <FoodCapsuleCard onTap={onGoToFuel} profile={profile} />
      </div>

      {/* Journey track */}
      <div className="yr-journey">
        <div className="yr-journey-header">
          <h2 className="yr-h2">Session journey</h2>
          <span className="yr-journey-meta">
            {totalEx} stations · ~{estMin} min
            {dynamicExercises && <span style={{ color:"var(--phase-accent)", marginLeft:8, fontSize:10, fontWeight:700 }}>✦ personalised</span>}
            {(() => {
               const sc = Storage.get("swap_counts", {});
               const excludedCount = Object.values(sc).filter(v => v >= 3).length;
               if (excludedCount > 0) return <span style={{ color:"var(--yr-muted)", marginLeft:8, fontSize:10 }}>· {excludedCount} excluded by history</span>;
               return null;
            })()}
          </span>
        </div>

        <div className="yr-track">
          <div className="yr-track-line" />
          {exercises.map((ex, i) => {
            const key    = `${selectedDay}-${ex.id}`;
            const isDone = !!done[key];
            const swapEx = swapped[key];
            const display = swapEx || ex;
            const isSwapped = !!swapEx;
            const required = EQUIPMENT_MAP[ex.id] || [];
            const missing = required.filter(e => !(profile?.equipment || []).includes(e));
            const hasMissing = !isSwapped && missing.length > 0;

            return (
              <div key={ex.id}
                className={`yr-step${isDone ? " done" : ""}${animOn ? " yr-stagger" : ""}`}
                style={{ "--i": i+2, cursor: "pointer" }}
                onClick={() => setModal({ ...display, _doneKey: key })}>
                <div className="yr-step-num">
                  Station {String(i+1).padStart(2,"0")}
                  {isDone && <span style={{ display:"inline-block", marginLeft:6, color:"var(--phase-accent)" }}>· logged</span>}
                  {isSwapped && <span style={{ display:"inline-block", marginLeft:6, color:"var(--phase-accent)" }}>· swapped</span>}
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div className="yr-step-title">{display.name}</div>
                  {isAdapted && <span style={{ fontSize:8, background:"var(--phase-soft)", color:"var(--phase-accent)", padding:"1px 4px", borderRadius:4, fontWeight:700 }}>ADAPTED</span>}
                </div>
                <div className="yr-step-meta">
                  {(() => {
                    const baseSets = parseSets(display.sets) || 3;
                    const adapted = adaptVolume(baseSets, adjustedIntensity, readiness);
                    return `${adapted} sets`;
                  })()} · {display.reps} · {display.muscle}
                </div>
                <div>
                  <span className="yr-step-tag">{display.type}</span>
                  <span className="yr-step-tag">{display.kcal} kcal</span>
                  {hasMissing && <span className="yr-step-tag yr-step-warn">No {missing.join(", ")}</span>}
                </div>
                {hasMissing && SWAP_LIBRARY[ex.id] && (
                  <button style={{
                    marginTop:6, background:"transparent", border:"1px solid var(--phase-accent)",
                    borderRadius:999, padding:"3px 10px", color:"var(--phase-accent)",
                    fontSize:10, cursor:"pointer", fontFamily:"inherit"
                  }} onClick={e => { e.stopPropagation(); onSwap(ex.id); }}>Swap</button>
                )}
                {isSwapped && (
                  <button style={{
                    marginTop:6, background:"transparent", border:"1px solid var(--yr-border)",
                    borderRadius:999, padding:"3px 10px", color:"var(--yr-muted)",
                    fontSize:10, cursor:"pointer", fontFamily:"inherit"
                  }} onClick={e => { e.stopPropagation(); onUndoSwap(ex.id); }}>Restore</button>
                )}
                {dbReady && !isDone && !isSwapped && (
                  <button style={{
                    marginTop:6, background:"transparent", border:"none",
                    color:"var(--yr-faint)", fontSize:11, cursor:"pointer", fontFamily:"inherit", padding:0
                  }} onClick={e => {
                    e.stopPropagation();
                    const alts = findAlternatives({ exercise:{ ...ex, primaryMuscles: ex.muscle?.split(", ")||[] }, equipment:profile?.equipment||["bodyweight"], count:5, excludeId:ex.id });
                    setSubbing({ slotId:key, originalEx:ex, alternatives:alts });
                  }}>⟳ alternatives</button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Week strip */}
      <div className="yr-divider" />
      <div className="yr-overline">Week ahead</div>
      <div style={{ display:"flex", gap:24, overflow:"auto", paddingBottom:8 }}>
        {WEEK_PLAN.map((d, i) => (
          <button key={d.day} onClick={() => setSelectedDay(i)} style={{
            background:"transparent", border:"none", color: selectedDay===i ? "var(--yr-text)" : "var(--yr-muted)",
            padding:"4px 0", fontFamily:"inherit", cursor:"pointer", display:"flex", flexDirection:"column",
            gap:4, position:"relative", minWidth:52, textAlign:"left"
          }}>
            <span style={{ fontSize:11, fontFamily:"var(--font-mono)", letterSpacing:"0.08em", textTransform:"uppercase" }}>
              {chipDate(d.day)}
            </span>
            <span style={{ fontSize:15, fontWeight:500 }}>{i===selectedDay ? "Today" : d.name.slice(0,3)}</span>
            {selectedDay===i && <span style={{ position:"absolute", left:0, bottom:-6, width:20, height:2, background:"var(--phase-accent)" }} />}
          </button>
        ))}
      </div>

      {/* Substitution picker */}
      {subbing && (
        <div onClick={() => setSubbing(null)} style={{
          position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:200,
          display:"flex", alignItems:"flex-end", backdropFilter:"blur(6px)",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            width:"100%", maxWidth:430, margin:"0 auto",
            background:"var(--yr-bg-elev)", borderRadius:"24px 24px 0 0",
            padding:"20px 16px 32px", border:"1px solid var(--yr-border)",
          }}>
            <div style={{ fontWeight:700, fontSize:15, color:"var(--yr-text)", marginBottom:4 }}>Find an alternative</div>
            <div style={{ fontSize:12, color:"var(--yr-muted)", marginBottom:14 }}>Replacing: <em>{subbing.originalEx?.name}</em></div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {subbing.alternatives.map(alt => (
                <button key={alt.id} onClick={() => { onSwap(subbing.originalEx.id, alt); setSubbing(null); }}
                  style={{ textAlign:"left", padding:"12px 14px", borderRadius:14, border:"1px solid var(--yr-border)", background:"var(--yr-surface)", cursor:"pointer" }}>
                  <div style={{ fontWeight:600, fontSize:14, color:"var(--yr-text)", marginBottom:2 }}>{alt.name}</div>
                  <div style={{ fontSize:11, color:"var(--yr-muted)", fontFamily:"var(--font-mono)" }}>{alt.sets} · {alt.muscle}</div>
                </button>
              ))}
            </div>
            <button onClick={() => setSubbing(null)} style={{ width:"100%", marginTop:12, padding:"10px", background:"transparent", border:"1px solid var(--yr-border)", borderRadius:12, color:"var(--yr-muted)", cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
