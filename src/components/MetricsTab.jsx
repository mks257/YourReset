import { useEffect, useState } from "react";
import { useCountUp } from "./MotionHooks";
import * as Storage from "../storage";
import * as HealthService from "../healthService";

// Goals are user-configurable in Settings (fallbacks if not set yet).
const DEFAULT_STEP_GOAL = 10000;
const DEFAULT_KCAL_GOAL = 500;
const DEFAULT_EX_GOAL   = 30;

// Healthy resting heart rate is broadly 50–80 bpm. We map 50→1.0, 100→0
// for the progress bar — lower is better. Skip the bar entirely when
// rhr is unavailable.
function rhrProgress(rhr) {
  if (!rhr || rhr <= 0) return null;
  return Math.max(0, Math.min(1, (100 - rhr) / 50));
}

function weightProgress(weight, goalWeight) {
  if (!weight) return null;
  if (!goalWeight) return null;
  // Progress = how close current is to goal, 0 = far, 1 = at goal.
  // Symmetric: bigger of (goal/weight, weight/goal) approaches 1 as they converge.
  const ratio = weight > goalWeight ? goalWeight / weight : weight / goalWeight;
  return Math.max(0, Math.min(1, ratio));
}

function formatDateShort(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
}

export default function MetricsTab({ liveData, profile, motion = "full" }) {
  const animOn = motion !== "off";
  const today = new Date().toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" });
  const history = Storage.get("history", []);

  // 30-day step history from HealthKit. Null until fetched / when sync is off.
  const [stepHistory, setStepHistory] = useState(null);
  useEffect(() => {
    let cancelled = false;
    if (!Storage.isHealthSyncEnabled()) { setStepHistory(null); return; }
    HealthService.fetch30DayStepHistory().then(arr => {
      if (!cancelled) setStepHistory(arr);
    });
    return () => { cancelled = true; };
  }, [liveData]); // re-fetch whenever liveData refreshes

  const syncEnabled = Storage.isHealthSyncEnabled();
  const hasLiveData = liveData && Object.keys(liveData).length > 0;

  // Goals from profile (with sensible fallbacks)
  const stepGoal = profile?.stepGoal || DEFAULT_STEP_GOAL;
  const kcalGoal = profile?.kcalGoal || DEFAULT_KCAL_GOAL;
  const exGoal   = profile?.exMinGoal || DEFAULT_EX_GOAL;
  const goalWeight = profile?.goalWeight;

  // Animated values — only animate when we have a real number to animate to
  const stepsAnim = useCountUp(liveData?.steps ?? 0, { duration:1100, enabled: animOn && hasLiveData });
  const kcalAnim  = useCountUp(liveData?.kcal  ?? 0, { duration:900,  delay:60, enabled: animOn && hasLiveData });

  // Build rows. Each row may have a null value if the underlying data isn't
  // available — we render "—" instead of fake numbers.
  const rows = [
    {
      label:"Steps",
      value: liveData?.steps != null ? (animOn ? stepsAnim.toLocaleString() : liveData.steps.toLocaleString()) : null,
      unit:"", goal: stepGoal,
      pct: liveData?.steps != null ? liveData.steps / stepGoal : null,
    },
    {
      label:"Active kcal",
      value: liveData?.kcal != null ? (animOn ? kcalAnim : liveData.kcal) : null,
      unit:"kcal", goal: kcalGoal,
      pct: liveData?.kcal != null ? liveData.kcal / kcalGoal : null,
    },
    {
      label:"Resting HR",
      value: liveData?.rhr ?? null,
      unit:"bpm", goal: 60,
      pct: rhrProgress(liveData?.rhr),
    },
    {
      label:"Weight",
      value: liveData?.weight ?? null,
      unit: profile?.weightUnit === "lb" ? "lb" : "kg",
      goal: goalWeight,
      pct: weightProgress(liveData?.weight, goalWeight),
    },
  ];

  // 30-day step trend
  const trendData = stepHistory || [];
  const maxBar = trendData.length ? Math.max(...trendData, 1) : 1;
  const avgSteps = trendData.length
    ? Math.round(trendData.reduce((a, b) => a + b, 0) / trendData.length * 1000)
    : null;

  const trendStartDate = new Date();
  trendStartDate.setDate(trendStartDate.getDate() - (trendData.length || 30));

  return (
    <div className="yr-stack-lg">
      <div className={animOn ? "yr-stagger" : ""} style={{"--i":0}}>
        <div className="yr-overline">{today}</div>
        <h1 className="yr-display" style={{ fontSize:"clamp(32px,5vw,56px)", fontWeight:500, letterSpacing:"-0.03em", margin:0, lineHeight:1.05 }}>
          {!syncEnabled ? "Connect to begin." : !hasLiveData ? "Waiting for Health…" : "A measured day."}
        </h1>
        <p style={{ color:"var(--yr-muted)", fontSize:14, maxWidth:"52ch", marginTop:8 }}>
          {!syncEnabled
            ? "Enable Apple Health Sync in Settings to see your live steps, active calories, resting heart rate, and weight here."
            : !hasLiveData
              ? "Your iPhone is sharing health data with YourReset. Numbers will appear once the first read completes."
              : "Live from Apple Health. Tap-to-refresh and visibility-change refresh keep things current."}
        </p>
      </div>

      <div className="yr-ledger">
        {rows.map((r, i) => (
          <div className={`yr-ledger-row${animOn ? " yr-anim-ledger-row" : ""}`} key={r.label} style={{"--i":i}}>
            <div className="yr-ledger-label">{r.label}</div>
            <div>
              <div className="yr-ledger-value">
                {r.value != null ? r.value : <span style={{ color: "var(--yr-faint)" }}>—</span>}
                {r.value != null && <span className="yr-ledger-value-unit">{r.unit}</span>}
              </div>
              <div className="yr-ledger-bar">
                <div className={`yr-ledger-bar-fill${animOn ? " yr-anim-bar" : ""}`}
                  style={{
                    width: r.pct != null ? `${Math.min(100, r.pct * 100)}%` : "0%",
                    "--i":i,
                  }} />
              </div>
            </div>
            <div className="yr-ledger-meta">
              {r.goal ? <>goal <b style={{ color:"var(--yr-text)" }}>{r.goal}</b></> : "—"}
            </div>
          </div>
        ))}
      </div>

      {/* Activity History */}
      <div className={animOn ? "yr-stagger" : ""} style={{"--i":7}}>
        <div className="yr-overline">Activity Journal</div>
        <div style={{ marginTop:16, borderTop:"1px solid var(--yr-border)", display:"flex", flexDirection:"column" }}>
          {history.length === 0 ? (
            <div style={{ padding:"24px 0", color:"var(--yr-muted)", fontSize:13 }}>No entries for this period. Session completions will appear here.</div>
          ) : (
            history.map((h, idx) => (
              <div key={idx} style={{
                display:"flex", alignItems:"center", justifyContent:"space-between",
                padding:"14px 0", borderBottom:"1px solid var(--yr-border)",
                gap: 16
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{
                    width:32, height:32, borderRadius:"50%",
                    background: h.type === "swap" ? "var(--yr-surface-2)" : "var(--phase-soft)",
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:14
                  }}>
                    {h.type === "swap" ? "⟳" : "✓"}
                  </div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:500 }}>{h.name}</div>
                    <div style={{ fontSize:11, color:"var(--yr-muted)", fontFamily:"var(--font-mono)" }}>
                      {h.type === "swap" ? "Substituted exercise" : "Completed station"}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:12, fontWeight:500 }}>{h.kcal ? `${h.kcal} kcal` : "—"}</div>
                  <div style={{ fontSize:10, color:"var(--yr-muted)", fontFamily:"var(--font-mono)", textTransform:"uppercase" }}>
                    {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 30-day step trend — only render if we have real history */}
      {trendData.length > 0 && (
        <div className={animOn ? "yr-stagger" : ""} style={{"--i":8}}>
          <div className="yr-overline" style={{ display:"flex", justifyContent:"space-between" }}>
            <span>30-day step trend</span>
          </div>
          <div style={{ display:"flex", alignItems:"flex-end", gap:3, height:100, margin:"12px 0" }}>
            {trendData.map((v, i) => (
              <div key={i}
                className={animOn ? "yr-anim-spark-bar" : ""}
                style={{
                  flex:1, height:`${(v/maxBar)*100}%`, minHeight:3,
                  background: i===trendData.length-1 ? "var(--phase-accent)" : "var(--yr-text-2)",
                  opacity: i===trendData.length-1 ? 1 : (v>7 ? 0.5 : 0.2),
                  borderRadius:1, "--i":i,
                }}
                title={`${(v*1000).toFixed(0)} steps`}
              />
            ))}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"var(--yr-muted)", fontFamily:"var(--font-mono)" }}>
            <span>{formatDateShort(trendStartDate)}</span>
            <span>AVG {avgSteps?.toLocaleString() ?? "—"}</span>
            <span style={{ color:"var(--phase-accent)" }}>TODAY</span>
          </div>
        </div>
      )}
    </div>
  );
}
