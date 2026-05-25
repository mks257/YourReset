import { useMemo, useState } from "react";
import ReadinessCheck from "./ReadinessCheck";
import { WEEK_PLAN, EQUIPMENT_MAP, SUBSTITUTIONS, SWAP_LIBRARY, DAY_TEMPLATES } from "../workoutData";
import { buildDayExercises, findAlternatives } from "../exerciseLibrary";
import { PHASE_EMOJI, getReadinessScore, getAdjustedIntensity, buildReadinessNote, adaptVolume, parseSets } from "../cycleEngine";
import { useCountUp } from "./MotionHooks";
import * as Storage from "../storage";

// ── Helpers ───────────────────────────────────────────────────────────────

// Readiness band → label + chip color. Mirrors the Stitch design's
// "Optimal" pill at the top-right of the readiness card.
function readinessBand(score10) {
  if (score10 == null) return { label: "Check in", tone: "muted" };
  if (score10 >= 8)   return { label: "Optimal",  tone: "good"  };
  if (score10 >= 6)   return { label: "Steady",   tone: "ok"    };
  if (score10 >= 4)   return { label: "Reduced",  tone: "warn"  };
  return { label: "Low energy", tone: "warn" };
}

// Type → unicode glyph for the exercise card thumbnail. Pure CSS, no images
// (the Stitch mockup uses photo thumbnails we don't have rights to).
function typeGlyph(type) {
  const t = (type || "").toLowerCase();
  if (t.includes("strength")) return "◆";
  if (t.includes("fat"))      return "▲";
  if (t.includes("cardio"))   return "❍";
  if (t.includes("toning"))   return "◇";
  if (t.includes("flex"))     return "≈";
  if (t.includes("recovery")) return "○";
  return "●";
}

// ── Component ─────────────────────────────────────────────────────────────

export default function PlanTab({
  day, selectedDay, setSelectedDay, done, setDone, setModal,
  readiness, showReadiness, setReadiness, setShowReadiness,
  cycleState, profile, weekKey, swapped = {}, onSwap, onUndoSwap,
  dbReady = false, motion = "full", onGoToFuel,
}) {
  const animOn = motion !== "off";
  const [subbing, setSubbing] = useState(null);

  // ── Data hydration (preserved from previous version) ────────────────
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
  const pct       = totalEx > 0 ? Math.round((doneCount / totalEx) * 100) : 0;
  const pctAnim   = useCountUp(pct, { duration:700, enabled: animOn });
  const estMin    = Math.round(totalEx * 4.5);
  const totalKcal = exercises.reduce((a,e)=>a+(e.kcal||0), 0);

  const readinessScore = getReadinessScore(readiness);   // 1..10 scale
  const readinessPct   = readinessScore != null ? readinessScore * 10 : null; // 0..100 for display
  const originalIntensity = cycleState?.intensity || "moderate";
  const adjustedIntensity = getAdjustedIntensity(originalIntensity, readinessScore);
  const isAdapted = readiness && adjustedIntensity !== originalIntensity;
  const adaptationNote = readiness ? buildReadinessNote(originalIntensity, adjustedIntensity, readinessScore) : null;
  const band = readinessBand(readinessScore);

  // ── Today's logged kcal (for Fuel bento tile) ───────────────────────
  const todayFuel = Storage.getFuelLog(Storage.getTodayKey());
  const loggedKcal = (todayFuel?.meals || []).reduce((s, m) => s + (parseFloat(m.calories) || 0), 0);
  const fuelHasData = (todayFuel?.meals || []).length > 0;

  // ── Streak (for Streak bento tile) ──────────────────────────────────
  const streak = Storage.getCurrentStreak();

  // Phase headline parts — matches the Stitch design's
  // "Luteal Phase: / Strength & Flow" stacked headline
  const phaseHeadline = cycleState?.label || null;     // e.g. "Build & Challenge"
  const workoutHeadline = day.label || day.focus || "Today's session";

  // Day X of Y badge — hidden when cycle tracking is off
  const cycleProgress = cycleState
    ? { day: cycleState.dayOfCycle, total: cycleState.cycleLength }
    : null;
  const cycleProgressPct = cycleProgress
    ? Math.min(1, cycleProgress.day / cycleProgress.total)
    : 0;

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <div className="yr-plan-tab" style={{ display: "flex", flexDirection: "column", gap: 32 }}>

      {/* ── 1. Today's Focus header ──────────────────────────────────── */}
      <section style={{ position: "relative" }}>
        {/* Atmospheric blue glow behind the headline */}
        <div aria-hidden="true" style={{
          position: "absolute", top: -28, left: -28,
          width: 160, height: 160, borderRadius: "50%",
          background: "color-mix(in oklch, var(--phase-accent) 10%, transparent)",
          filter: "blur(60px)",
          pointerEvents: "none",
          zIndex: 0,
        }} />

        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{
            fontFamily: "var(--font-body)",
            fontSize: 12, fontWeight: 600,
            letterSpacing: "0.14em", textTransform: "uppercase",
            color: "var(--phase-accent)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span>Today's Focus</span>
            {streak >= 1 && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "2px 7px", borderRadius: 999,
                background: "color-mix(in oklch, var(--phase-accent) 14%, transparent)",
                border: "1px solid color-mix(in oklch, var(--phase-accent) 28%, transparent)",
                fontFamily: "var(--font-mono)",
                fontSize: 10, fontWeight: 700,
                letterSpacing: "0.04em", textTransform: "none",
              }}>
                <span aria-hidden="true">🔥</span>{streak}-day
              </span>
            )}
          </div>

          <h1 style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontSize: "clamp(28px, 7vw, 36px)",
            fontWeight: 600, lineHeight: 1.15,
            color: "var(--yr-text)",
            letterSpacing: "-0.01em",
          }}>
            {phaseHeadline ? (
              <>{phaseHeadline}:<br />{workoutHeadline}</>
            ) : (
              workoutHeadline
            )}
          </h1>
        </div>

        {/* Phase progress bar + Day X of Y */}
        {cycleProgress && (
          <div style={{
            marginTop: 18, display: "flex", alignItems: "center", gap: 14,
            position: "relative", zIndex: 1,
          }}>
            <div style={{
              flex: 1, height: 2, borderRadius: 999,
              background: "var(--yr-border)",
              overflow: "hidden",
            }}>
              <div style={{
                height: "100%", width: `${cycleProgressPct * 100}%`,
                background: "var(--phase-accent)",
                boxShadow: "0 0 10px color-mix(in oklch, var(--phase-accent) 50%, transparent)",
                transition: "width 0.8s cubic-bezier(0.22,1,0.36,1)",
              }} />
            </div>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11, fontWeight: 600,
              color: "var(--yr-text-2)",
              letterSpacing: "0.04em",
              whiteSpace: "nowrap",
            }}>
              Day {cycleProgress.day} of {cycleProgress.total}
            </span>
          </div>
        )}
      </section>

      {/* ── 2. Readiness Score card (glass) ──────────────────────────── */}
      <section
        onClick={() => !readiness && setShowReadiness(true)}
        style={{
          padding: 18,
          borderRadius: 16,
          background: "color-mix(in oklch, var(--yr-bg-elev) 70%, var(--phase-accent))",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid color-mix(in oklch, var(--yr-text) 8%, transparent)",
          boxShadow: "0 0 40px -10px color-mix(in oklch, var(--phase-accent) 16%, transparent)",
          cursor: !readiness ? "pointer" : "default",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <div style={{
              fontFamily: "var(--font-body)",
              fontSize: 12, fontWeight: 600,
              letterSpacing: "0.08em", textTransform: "uppercase",
              color: "var(--yr-text-2)",
            }}>
              Readiness Score
            </div>
            <div style={{
              fontFamily: "var(--font-display)",
              fontSize: 40, fontWeight: 600, lineHeight: 1,
              color: "var(--phase-accent)",
              marginTop: 4,
            }}>
              {readinessPct != null ? readinessPct : "—"}
            </div>
          </div>
          <div style={{
            padding: "5px 12px", borderRadius: 999,
            background: band.tone === "good"  ? "color-mix(in oklch, var(--phase-accent) 22%, transparent)" :
                       band.tone === "ok"     ? "color-mix(in oklch, var(--yr-info) 18%, transparent)" :
                       band.tone === "warn"   ? "rgba(248,113,113,0.16)" :
                                                "var(--yr-surface-2)",
            color: band.tone === "good"  ? "var(--phase-accent)" :
                   band.tone === "ok"    ? "var(--yr-info)" :
                   band.tone === "warn"  ? "#ffb4ab" :
                                           "var(--yr-muted)",
            fontFamily: "var(--font-body)",
            fontSize: 12, fontWeight: 600,
            letterSpacing: "0.03em",
          }}>
            {band.label}
          </div>
        </div>
        <p style={{
          margin: 0,
          fontFamily: "var(--font-body)",
          fontSize: 15, lineHeight: 1.55,
          color: "var(--yr-text-2)",
        }}>
          {readiness
            ? (adaptationNote || "Your check-in is logged. Plan adapted to match your signals.")
            : "Tap to log how you're feeling — energy, sleep, soreness, cramps, mood. We'll adapt today's volume to match."}
        </p>
      </section>

      {/* ReadinessCheck — appears inline when triggered */}
      {(!readiness || showReadiness) && (
        <ReadinessCheck
          readiness={readiness}
          showReadiness={showReadiness}
          setReadiness={setReadiness}
          setShowReadiness={setShowReadiness}
          cycleState={cycleState}
        />
      )}

      {/* ── 3. Recommended Movement ──────────────────────────────────── */}
      <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <h2 style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontSize: 22, fontWeight: 500,
            color: "var(--yr-text)",
            letterSpacing: "-0.01em",
          }}>
            Recommended Movement
          </h2>
          <span style={{
            fontFamily: "var(--font-body)",
            fontSize: 12, fontWeight: 600,
            color: "var(--phase-accent)",
            letterSpacing: "0.04em",
          }}>
            {doneCount}/{totalEx} · {pctAnim}%
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {exercises.map((ex, i) => {
            const key      = `${selectedDay}-${ex.id}`;
            const isDone   = !!done[key];
            const swapEx   = swapped[key];
            const display  = swapEx || ex;
            const isSwapped = !!swapEx;
            const required = EQUIPMENT_MAP[ex.id] || [];
            const missing  = required.filter(e => !(profile?.equipment || []).includes(e));
            const hasMissing = !isSwapped && missing.length > 0;
            const baseSets = parseSets(display.sets) || 3;
            const adaptedSets = adaptVolume(baseSets, adjustedIntensity, readiness);

            return (
              <div
                key={ex.id}
                onClick={() => setModal({ ...display, _doneKey: key })}
                style={{
                  padding: 14,
                  borderRadius: 16,
                  background: "color-mix(in oklch, var(--yr-bg-elev) 70%, transparent)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: isSwapped
                    ? "1px solid color-mix(in oklch, var(--phase-accent) 40%, transparent)"
                    : "1px solid var(--yr-border)",
                  borderLeft: isSwapped ? "2px solid var(--phase-accent)" : undefined,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  cursor: "pointer",
                  transition: "transform 0.15s ease, border-color 0.2s ease",
                  WebkitTapHighlightColor: "transparent",
                  opacity: isDone ? 0.55 : 1,
                }}
              >
                {/* Glyph thumbnail (no photos — uses type) */}
                <div style={{
                  width: 56, height: 56, borderRadius: 12,
                  flexShrink: 0,
                  background: "color-mix(in oklch, var(--phase-accent) 14%, var(--yr-bg))",
                  border: "1px solid color-mix(in oklch, var(--phase-accent) 20%, transparent)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-display)",
                  fontSize: 24, fontWeight: 500,
                  color: "var(--phase-accent)",
                }}>
                  {isDone ? "✓" : typeGlyph(display.type)}
                </div>

                {/* Body */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 15, fontWeight: 600,
                    color: "var(--yr-text)",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {display.name}
                    {isAdapted && (
                      <span style={{
                        marginLeft: 8,
                        fontSize: 9, fontWeight: 700,
                        background: "var(--phase-soft)",
                        color: "var(--phase-accent)",
                        padding: "1px 5px", borderRadius: 4,
                      }}>
                        ADAPTED
                      </span>
                    )}
                  </div>
                  <div style={{
                    marginTop: 3,
                    fontFamily: "var(--font-body)",
                    fontSize: 12,
                    color: "var(--yr-text-2)",
                    letterSpacing: "0.01em",
                  }}>
                    {adaptedSets} sets · {display.reps} · {display.muscle}
                    {display.kcal != null && (
                      <span style={{ color: "var(--yr-muted)" }}> · ~{display.kcal} kcal</span>
                    )}
                  </div>
                  {hasMissing && (
                    <div style={{ marginTop: 6, display: "flex", gap: 6, alignItems: "center" }}>
                      <span style={{
                        fontSize: 10,
                        color: "var(--yr-muted)",
                        fontFamily: "var(--font-mono)",
                      }}>
                        Missing: {missing.join(", ")}
                      </span>
                      {SWAP_LIBRARY[ex.id] && (
                        <button
                          onClick={e => { e.stopPropagation(); onSwap(ex.id); }}
                          style={{
                            background: "transparent",
                            border: "1px solid var(--phase-accent)",
                            borderRadius: 999,
                            padding: "2px 9px",
                            color: "var(--phase-accent)",
                            fontFamily: "var(--font-body)",
                            fontSize: 10, fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Swap
                        </button>
                      )}
                    </div>
                  )}
                  {isSwapped && (
                    <div style={{ marginTop: 4, fontSize: 10, color: "var(--phase-accent)", fontFamily: "var(--font-mono)" }}>
                      ✦ swapped · <button
                        onClick={e => { e.stopPropagation(); onUndoSwap(ex.id); }}
                        style={{
                          background: "transparent", border: "none", padding: 0,
                          color: "var(--yr-muted)", cursor: "pointer", fontSize: 10, textDecoration: "underline",
                        }}
                      >restore</button>
                    </div>
                  )}
                </div>

                {/* Trailing chevron / done state */}
                <span aria-hidden="true" style={{
                  fontSize: 18, color: isDone ? "var(--phase-accent)" : "var(--yr-muted)",
                  fontFamily: "var(--font-body)",
                  flexShrink: 0,
                }}>
                  {isDone ? "✓" : "›"}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10, color: "var(--yr-muted)",
          letterSpacing: "0.06em",
          textAlign: "center",
        }}>
          {totalEx} stations · ~{estMin} min · {totalKcal} kcal estimated
          {dynamicExercises && <span style={{ color: "var(--phase-accent)", marginLeft: 8 }}>✦ personalised</span>}
        </div>
      </section>

      {/* ── 4. Insights bento (Fuel + Streak/Phase tiles) ────────────── */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Fuel tile — taps to Fuel tab */}
        <button
          onClick={onGoToFuel}
          aria-label="Open Fuel tab"
          style={{
            padding: 14, borderRadius: 16,
            background: "color-mix(in oklch, var(--yr-bg-elev) 70%, transparent)",
            backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
            border: "1px solid var(--yr-border)",
            display: "flex", flexDirection: "column", gap: 6,
            textAlign: "left", cursor: "pointer",
            WebkitTapHighlightColor: "transparent",
            fontFamily: "inherit", color: "inherit",
            minHeight: 44,
          }}
        >
          <span style={{
            fontSize: 20, color: "var(--phase-accent)", lineHeight: 1,
          }} aria-hidden="true">🥗</span>
          <span style={{
            fontFamily: "var(--font-body)",
            fontSize: 11, fontWeight: 600,
            letterSpacing: "0.08em", textTransform: "uppercase",
            color: "var(--yr-text-2)",
          }}>
            Fuel
          </span>
          <span style={{
            fontFamily: "var(--font-body)",
            fontSize: 15, fontWeight: 600,
            color: "var(--yr-text)",
          }}>
            {fuelHasData ? `${Math.round(loggedKcal).toLocaleString()} kcal` : "Log a meal"}
          </span>
        </button>

        {/* Streak tile (replaces Sleep — we don't have HealthKit on personal team) */}
        <div style={{
          padding: 14, borderRadius: 16,
          background: "color-mix(in oklch, var(--yr-bg-elev) 70%, transparent)",
          backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
          border: "1px solid var(--yr-border)",
          display: "flex", flexDirection: "column", gap: 6,
        }}>
          <span style={{
            fontSize: 20, color: "var(--phase-accent)", lineHeight: 1,
          }} aria-hidden="true">🔥</span>
          <span style={{
            fontFamily: "var(--font-body)",
            fontSize: 11, fontWeight: 600,
            letterSpacing: "0.08em", textTransform: "uppercase",
            color: "var(--yr-text-2)",
          }}>
            Streak
          </span>
          <span style={{
            fontFamily: "var(--font-body)",
            fontSize: 15, fontWeight: 600,
            color: "var(--yr-text)",
          }}>
            {streak >= 1 ? `${streak} day${streak > 1 ? "s" : ""}` : "Start today"}
          </span>
        </div>
      </section>

      {/* ── 5. Substitution picker (preserved, restyled lightly) ────── */}
      {subbing && (
        <div
          onClick={() => setSubbing(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(4, 8, 18, 0.72)",
            backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
            display: "flex", alignItems: "flex-end",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 480, margin: "0 auto",
              background: "var(--yr-bg-elev)",
              borderRadius: "24px 24px 0 0",
              padding: "20px 18px calc(32px + env(safe-area-inset-bottom))",
              border: "1px solid var(--yr-border)",
              borderBottom: "none",
            }}
          >
            <div style={{
              width: 40, height: 4, borderRadius: 2,
              background: "rgba(215,227,249,0.18)",
              margin: "0 auto 18px",
            }} />
            <div style={{
              fontFamily: "var(--font-display)",
              fontSize: 20, fontWeight: 500,
              color: "var(--yr-text)",
              marginBottom: 4,
            }}>
              Find an alternative
            </div>
            <div style={{
              fontSize: 13, color: "var(--yr-muted)",
              marginBottom: 16, fontStyle: "italic",
            }}>
              Replacing {subbing.originalEx?.name}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {subbing.alternatives.map(alt => (
                <button
                  key={alt.id}
                  onClick={() => { onSwap(subbing.originalEx.id, alt); setSubbing(null); }}
                  style={{
                    textAlign: "left",
                    padding: "14px 16px",
                    borderRadius: 14,
                    border: "1px solid var(--yr-border)",
                    background: "var(--yr-surface)",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    minHeight: 56,
                  }}
                >
                  <div style={{
                    fontWeight: 600, fontSize: 15,
                    color: "var(--yr-text)", marginBottom: 2,
                  }}>
                    {alt.name}
                  </div>
                  <div style={{
                    fontSize: 12, color: "var(--yr-muted)",
                    fontFamily: "var(--font-mono)",
                  }}>
                    {alt.sets} · {alt.muscle}
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setSubbing(null)}
              style={{
                width: "100%", marginTop: 14,
                padding: "12px", borderRadius: 12,
                background: "transparent",
                border: "1px solid var(--yr-border)",
                color: "var(--yr-muted)",
                cursor: "pointer",
                fontFamily: "inherit",
                minHeight: 44,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
