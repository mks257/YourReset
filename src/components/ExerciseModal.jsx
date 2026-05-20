import { useState } from "react";
import WorkoutLogger from "./WorkoutLogger";
import TrendAnalysis from "./TrendAnalysis";
import { T } from "../theme";
import * as Storage from "../storage";

function ExerciseModal({ ex, dayColor, onClose, onToggleDone, isDone, selectedDay, weekKey, phaseNote }) {
  const [ytLoaded, setYtLoaded] = useState(false);

  const ytQuery = encodeURIComponent(`${ex.name} ${ex.muscle} proper form`);
  const ytSearchUrl = `https://www.youtube.com/results?search_query=${ytQuery}`;

  const formCues = ex.formCues?.length ? ex.formCues : [ex.tip].filter(Boolean);

  return (
    <>
      <style>{`
        @keyframes modal-slide-up {
          from { opacity: 0; transform: translateY(24px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .em-scroll::-webkit-scrollbar { width: 0; }
      `}</style>

      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(4,4,14,0.92)",
          backdropFilter: "blur(16px)",
          display: "flex", alignItems: "flex-end", justifyContent: "center",
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          className="em-scroll"
          style={{
            width: "100%", maxWidth: 480,
            maxHeight: "94vh", overflowY: "auto",
            background: T.card,
            borderRadius: "28px 28px 0 0",
            animation: "modal-slide-up 0.3s cubic-bezier(0.22,1,0.36,1) both",
            boxShadow: `0 -8px 80px ${dayColor}18, 0 -2px 0 ${dayColor}33`,
          }}
        >
          {/* Drag handle */}
          <div style={{
            width: 40, height: 4, borderRadius: 2,
            background: "rgba(255,255,255,0.12)",
            margin: "12px auto 0",
          }} />

          <div style={{ padding: "24px 22px 100px" }}>

            {/* Name + tags */}
            <div style={{ marginBottom: 20 }}>
              <h2 style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontStyle: "italic", fontWeight: 800,
                fontSize: "1.75rem", color: T.text,
                margin: "0 0 12px", lineHeight: 1.1,
                letterSpacing: "-0.01em",
              }}>{ex.name}</h2>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <Tag color={dayColor} bg={`${dayColor}1a`}>{ex.muscle}</Tag>
                <Tag color={T.muted} bg="rgba(255,255,255,0.06)">{ex.type}</Tag>
                <Tag color={T.amber} bg="rgba(255,179,71,0.12)">🔥 ~{ex.kcal} kcal</Tag>
              </div>
            </div>

            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
              {[["SETS", ex.sets], ["REPS", ex.reps]].map(([label, val]) => (
                <div key={label} style={{
                  background: T.card2, border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: 16, padding: "14px 18px",
                }}>
                  <div style={{ fontSize: "0.6rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{label}</div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: "1.5rem", color: dayColor, lineHeight: 1 }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Phase note */}
            {phaseNote && (
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                background: "rgba(94,234,212,0.06)", border: "1px solid rgba(94,234,212,0.18)",
                borderRadius: 14, padding: "11px 14px", marginBottom: 16,
              }}>
                <span style={{ fontSize: "1rem", lineHeight: 1 }}>🌿</span>
                <span style={{ fontSize: "0.75rem", color: T.green, lineHeight: 1.55 }}>{phaseNote}</span>
              </div>
            )}

            {/* Form cues */}
            <div style={{ marginBottom: 18, borderRadius: 16, overflow: "hidden", border: `1px solid ${dayColor}1e` }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "12px 15px", background: `${dayColor}0c`,
                borderBottom: `1px solid ${dayColor}14`,
              }}>
                <span style={{ fontSize: "0.95rem" }}>📋</span>
                <span style={{ fontSize: "0.65rem", color: dayColor, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Form Cues</span>
              </div>

              <div style={{ padding: "12px 15px", background: `${dayColor}06` }}>
                {formCues.map((cue, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: 10,
                    marginBottom: i < formCues.length - 1 ? 10 : 0,
                  }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                      background: `${dayColor}22`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.6rem", fontWeight: 800, color: dayColor, marginTop: 1,
                    }}>{i + 1}</div>
                    <span style={{ fontSize: "0.82rem", lineHeight: 1.6, color: "rgba(240,238,255,0.85)" }}>{cue}</span>
                  </div>
                ))}
              </div>

              {ex.commonMistake && (
                <div style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "11px 15px",
                  borderTop: `1px solid ${dayColor}14`,
                  background: "rgba(252,129,129,0.05)",
                }}>
                  <span style={{ fontSize: "0.88rem", flexShrink: 0 }}>⚠️</span>
                  <div>
                    <div style={{ fontSize: "0.58rem", color: "#fc8181", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Common mistake</div>
                    <div style={{ fontSize: "0.8rem", lineHeight: 1.55, color: "rgba(240,238,255,0.75)" }}>{ex.commonMistake}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Substitution note */}
            {Storage.getSubstitutionCount(ex.id) > 0 && (
              <div style={{
                background: "rgba(242,189,115,0.07)", border: "1px solid rgba(242,189,115,0.18)",
                borderRadius: 12, padding: "9px 13px", marginBottom: 14,
                fontSize: "0.73rem", color: "#f2bd73",
              }}>
                ⟳ You've swapped this exercise {Storage.getSubstitutionCount(ex.id)}× previously.
              </div>
            )}

            <TrendAnalysis exerciseId={ex.id} exerciseName={ex.name} dayColor={dayColor} />

            <WorkoutLogger ex={ex} selectedDay={selectedDay} weekKey={weekKey} dayColor={dayColor} />

            {/* YouTube */}
            <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
              {!ytLoaded ? (
                <button
                  onClick={() => setYtLoaded(true)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 12,
                    padding: "14px 16px", background: T.card2,
                    border: "none", cursor: "pointer", textAlign: "left",
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: "rgba(255,0,0,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1rem", color: "#ff6b6b",
                  }}>▶</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: "0.85rem", color: T.text }}>
                      Watch on YouTube
                    </div>
                    <div style={{ fontSize: "0.62rem", color: T.muted, marginTop: 2 }}>
                      "{ex.name} proper form" · tap to search
                    </div>
                  </div>
                  <span style={{ fontSize: "0.7rem", color: T.muted }}>↗</span>
                </button>
              ) : (
                <div style={{ background: T.card2, padding: "12px 16px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ fontSize: "0.7rem", color: T.muted }}>Opens in YouTube</div>
                    <button onClick={() => setYtLoaded(false)} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: "0.8rem" }}>✕</button>
                  </div>
                  <a
                    href={ytSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "block", padding: "10px 0", borderRadius: 10,
                      textAlign: "center",
                      background: "rgba(255,0,0,0.15)",
                      color: "#ff6b6b", fontFamily: "'Outfit',sans-serif",
                      fontWeight: 700, fontSize: "0.82rem",
                      textDecoration: "none",
                      border: "1px solid rgba(255,0,0,0.2)",
                    }}
                  >
                    ▶ Open YouTube search
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Sticky footer */}
          <div style={{
            position: "sticky", bottom: 0,
            padding: "12px 22px 28px",
            background: `linear-gradient(to bottom, transparent, ${T.card} 30%)`,
            display: "flex", gap: 10,
          }}>
            <button onClick={onClose} style={{
              width: 48, height: 48, borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.09)",
              background: "rgba(255,255,255,0.04)", color: T.muted,
              fontSize: "1rem", cursor: "pointer", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>✕</button>

            <button onClick={onToggleDone} style={{
              flex: 1, height: 48, borderRadius: 14,
              border: "none", cursor: "pointer",
              background: isDone ? "rgba(94,234,212,0.13)" : `linear-gradient(135deg, ${dayColor}, ${dayColor}bb)`,
              color: isDone ? T.green : "#fff",
              fontFamily: "'Outfit',sans-serif", fontWeight: 800,
              fontSize: "0.92rem", letterSpacing: "0.01em",
              transition: "all 0.2s",
              boxShadow: isDone ? "none" : `0 6px 24px ${dayColor}38`,
            }}>
              {isDone ? "✓ Completed — Tap to Undo" : "Mark as Done ✓"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Tag({ color, bg, children }) {
  return (
    <span style={{
      fontSize: "0.68rem", padding: "4px 11px", borderRadius: 99,
      background: bg, color, fontWeight: 700, letterSpacing: "0.02em",
    }}>{children}</span>
  );
}

export default ExerciseModal;
