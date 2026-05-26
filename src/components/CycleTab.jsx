import { useState, useMemo } from "react";
import { PHASES, PHASE_EMOJI, PCOS_GUIDANCE } from "../cycleEngine";

// ── Helpers ───────────────────────────────────────────────────────────────

/** Phase Highlights content — keyed by phase. Three cards each. */
const PHASE_HIGHLIGHTS = {
  menstrual: [
    { icon: "🌑", title: "Restore",        body: "Iron- and magnesium-rich foods help replenish what you lose." },
    { icon: "🧘", title: "Gentle Movement", body: "Light yoga or 10-min walks ease cramps without taxing recovery." },
    { icon: "💤", title: "Sleep Quality",   body: "Core temperature is low — prime conditions for deep rest." },
  ],
  follicular: [
    { icon: "🧠", title: "Mental Clarity",  body: "Optimal time for complex problem solving and learning." },
    { icon: "✨", title: "Skin Health",     body: "Estrogen improves hydration and natural glow." },
    { icon: "⚡", title: "Energy Peak",     body: "Steady rise in physical stamina — push the harder sessions." },
  ],
  ovulatory: [
    { icon: "🔥", title: "Peak Power",      body: "Maximal strength window. Time PRs and explosive work." },
    { icon: "⚠️", title: "ACL Caution",     body: "Ligament laxity is elevated — warm up thoroughly before intensity." },
    { icon: "💧", title: "Hydration",       body: "Slightly higher fluid needs — aim for 2.5–3 L today." },
  ],
  luteal_early: [
    { icon: "🔋", title: "Steady State",    body: "Zone 2 cardio feels natural. Great for endurance gains." },
    { icon: "🥩", title: "Protein Timing",  body: "Progesterone increases protein breakdown — spread intake across meals." },
    { icon: "🌿", title: "Magnesium",       body: "Supports mood and reduces early PMS symptoms." },
  ],
  luteal_late: [
    { icon: "🌙", title: "Wind Down",       body: "Honor cravings within reason. Recovery sleep is training." },
    { icon: "🍫", title: "+250 kcal",       body: "Late luteal phase increases energy needs — eat to support, not restrict." },
    { icon: "🧘", title: "Lower Intensity", body: "Deload week if symptoms rise. Mobility and walks over HIIT." },
  ],
};

/** Build calendar weeks (Sun-first) for the month containing `targetDate`. */
function buildMonthWeeks(targetDate) {
  const year  = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const firstWeekday = firstOfMonth.getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const lead = [];
  for (let i = firstWeekday; i > 0; i--) {
    lead.push({ date: new Date(year, month, 1 - i), inMonth: false });
  }
  const main = [];
  for (let d = 1; d <= daysInMonth; d++) {
    main.push({ date: new Date(year, month, d), inMonth: true });
  }
  const trail = [];
  const used = lead.length + main.length;
  const trailCount = (7 - (used % 7)) % 7;
  for (let i = 1; i <= trailCount; i++) {
    trail.push({ date: new Date(year, month + 1, i), inMonth: false });
  }
  const flat = [...lead, ...main, ...trail];
  const weeks = [];
  for (let i = 0; i < flat.length; i += 7) weeks.push(flat.slice(i, i + 7));
  return weeks;
}

const WEEKDAY_INITIALS = ["S", "M", "T", "W", "T", "F", "S"];

// ── Component ─────────────────────────────────────────────────────────────

export default function CycleTab({
  cycleState, profile, readiness, setReadiness,
  onResetProfile, onUpdateProfile, motion = "full",
}) {
  const [monthOffset, setMonthOffset] = useState(0);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [isHormonalBc, setIsHormonalBc] = useState(profile?.isHormonalBc || false);
  const [showPcos, setShowPcos] = useState(false);

  // No cycle tracking — empty state
  if (!cycleState) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: "8px 0" }}>
        <div style={{
          fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600,
          letterSpacing: "0.18em", textTransform: "uppercase",
          color: "var(--phase-accent)",
        }}>
          Cycle tracking
        </div>
        <h1 style={{
          margin: 0,
          fontFamily: "var(--font-display)",
          fontSize: 32, fontWeight: 600, lineHeight: 1.15,
          color: "var(--yr-text)", letterSpacing: "-0.01em",
        }}>
          Not enabled.
        </h1>
        <p style={{
          margin: 0,
          fontFamily: "var(--font-body)",
          fontSize: 16, lineHeight: 1.55,
          color: "var(--yr-text-2)", maxWidth: "44ch",
        }}>
          Cycle-aware programming adapts your workouts to your hormonal phase.
          Update your profile in Settings to enable it.
        </p>
        <button onClick={onResetProfile} style={{
          alignSelf: "flex-start",
          background: "var(--phase-accent)", color: "var(--yr-bg)",
          border: "none", borderRadius: 999,
          padding: "12px 22px",
          fontFamily: "var(--font-body)",
          fontSize: 14, fontWeight: 600,
          cursor: "pointer", minHeight: 44,
        }}>
          Update profile
        </button>
      </div>
    );
  }

  // ── State derivation ────────────────────────────────────────────────
  const cycleLength = cycleState.cycleLength || 28;
  const today       = cycleState.dayOfCycle;
  const ovDay       = Math.max(10, cycleLength - 14);
  const phaseLabel  = cycleState.label || cycleState.phase;
  const phaseMeta   = PHASES[cycleState.phase] || {};

  // Hormone curve geometry — single aggregate sine wave with gradient stroke
  const CURVE_W = 400;
  const CURVE_H = 100;
  const dayToX = (d) => (d / cycleLength) * CURVE_W;
  const todayX = dayToX(today);
  const curvePath = useMemo(() => (
    `M 0 80 Q ${dayToX(ovDay * 0.5)} 75 ${dayToX(ovDay * 0.95)} 30 ` +
    `Q ${dayToX(ovDay + 1.5)} 22 ${dayToX(ovDay + 3)} 35 ` +
    `Q ${dayToX(ovDay + 8)} 50 ${dayToX(cycleLength * 0.85)} 55 ` +
    `T ${CURVE_W} 80`
  ), [cycleLength, ovDay]);

  // Calendar
  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);
  baseDate.setMonth(baseDate.getMonth() + monthOffset);
  const monthLabel = baseDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const weeks = useMemo(() => buildMonthWeeks(baseDate), [monthOffset]);

  // Menstrual dates set for dot-marking calendar days
  const menstrualDates = useMemo(() => {
    if (!profile?.cycleStartDate) return new Set();
    const start = new Date(profile.cycleStartDate);
    start.setHours(0, 0, 0, 0);
    const dates = new Set();
    for (let cyc = -1; cyc < 6; cyc++) {
      for (let d = 0; d < 5; d++) {
        const dt = new Date(start);
        dt.setDate(start.getDate() + cyc * cycleLength + d);
        dates.add(dt.toDateString());
      }
    }
    return dates;
  }, [profile?.cycleStartDate, cycleLength]);

  const todayDateStr = new Date().toDateString();
  const highlights = PHASE_HIGHLIGHTS[cycleState.phase] || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>

      {/* ── 1. Phase Overview ─────────────────────────────────────── */}
      <section style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <span style={overline()}>Current Phase</span>
            <h1 style={{
              margin: "6px 0 0",
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 7vw, 36px)",
              fontWeight: 600, lineHeight: 1.1,
              color: "var(--yr-text)", letterSpacing: "-0.01em",
            }}>
              {phaseLabel.split(" ")[0]}
            </h1>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{
              fontFamily: "var(--font-body)",
              fontSize: 12, fontWeight: 600,
              color: "var(--yr-text-2)",
            }}>
              Day
            </div>
            <div style={{
              fontFamily: "var(--font-display)",
              fontSize: 28, fontWeight: 500, lineHeight: 1,
              color: "var(--yr-text)",
            }}>
              {String(today).padStart(2, "0")}
            </div>
          </div>
        </div>

        {/* Hormone Curve */}
        <div style={{
          position: "relative", width: "100%", height: 128,
          background: "color-mix(in oklch, var(--yr-bg) 60%, var(--phase-accent) 4%)",
          borderRadius: 16, border: "1px solid var(--yr-border)",
          overflow: "hidden",
        }}>
          <svg viewBox={`0 0 ${CURVE_W} ${CURVE_H}`} preserveAspectRatio="none"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <defs>
              <linearGradient id="hormone-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"  stopColor="var(--phase-menstrual)"  stopOpacity="0.55" />
                <stop offset="30%" stopColor="var(--phase-follicular)" stopOpacity="1" />
                <stop offset="55%" stopColor="var(--phase-ovulatory)"  stopOpacity="1" />
                <stop offset="100%" stopColor="var(--phase-luteal)"    stopOpacity="0.6" />
              </linearGradient>
            </defs>
            <path d={curvePath} fill="none" stroke="url(#hormone-grad)" strokeWidth="2" strokeLinecap="round" />
            <line x1={todayX} y1="0" x2={todayX} y2="100"
              stroke="var(--yr-text)" strokeOpacity="0.18"
              strokeWidth="1" strokeDasharray="2 3" />
            <circle cx={todayX} cy="50" r="4" fill="var(--phase-accent)"
              style={{ filter: "drop-shadow(0 0 8px color-mix(in oklch, var(--phase-accent) 70%, transparent))" }}>
              {motion === "full" && (
                <animate attributeName="r" values="4;6;4" dur="2.4s" repeatCount="indefinite" />
              )}
            </circle>
          </svg>
          <div style={{
            position: "absolute", bottom: 10, left: 16, right: 16,
            display: "flex", justifyContent: "space-between",
            fontFamily: "var(--font-body)",
            fontSize: 9, fontWeight: 600,
            letterSpacing: "0.14em", textTransform: "uppercase",
            color: "var(--yr-muted)",
          }}>
            <span style={{ color: cycleState.phase === "menstrual" ? "var(--phase-accent)" : undefined }}>Menstrual</span>
            <span style={{ color: cycleState.phase === "follicular" ? "var(--phase-accent)" : undefined }}>Follicular</span>
            <span style={{ color: cycleState.phase === "ovulatory" ? "var(--phase-accent)" : undefined }}>Ovulation</span>
            <span style={{ color: (cycleState.phase === "luteal_early" || cycleState.phase === "luteal_late") ? "var(--phase-accent)" : undefined }}>Luteal</span>
          </div>
        </div>
      </section>

      {/* ── 2. Calendar ───────────────────────────────────────────── */}
      <section style={glassCard({ padding: 20 })}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{
            margin: 0,
            fontFamily: "var(--font-body)",
            fontSize: 16, fontWeight: 600,
            color: "var(--yr-text)",
          }}>{monthLabel}</h3>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => setMonthOffset(o => o - 1)} aria-label="Previous month" style={navBtn()}>‹</button>
            <button onClick={() => setMonthOffset(0)} aria-label="This month" style={navBtn(monthOffset === 0)}>·</button>
            <button onClick={() => setMonthOffset(o => o + 1)} aria-label="Next month" style={navBtn()}>›</button>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8, textAlign: "center" }}>
          {WEEKDAY_INITIALS.map((d, i) => (
            <div key={i} style={{
              fontFamily: "var(--font-body)",
              fontSize: 11, fontWeight: 600,
              letterSpacing: "0.08em",
              color: "var(--yr-muted)",
            }}>{d}</div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "10px 4px" }}>
          {weeks.flat().map(({ date, inMonth }, idx) => {
            const dateStr = date.toDateString();
            const isToday = dateStr === todayDateStr;
            const isMenstrual = menstrualDates.has(dateStr);
            return (
              <div key={idx} style={{
                position: "relative",
                fontFamily: "var(--font-body)",
                fontSize: 14,
                color: isToday   ? "var(--yr-bg)" :
                       !inMonth  ? "color-mix(in oklch, var(--yr-muted) 50%, transparent)" :
                                   "var(--yr-text)",
                background: isToday ? "var(--phase-accent)" : "transparent",
                borderRadius: "50%",
                width: 32, height: 32,
                margin: "0 auto",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: isToday ? 700 : 400,
                boxShadow: isToday ? "0 0 16px color-mix(in oklch, var(--phase-accent) 40%, transparent)" : "none",
              }}>
                {date.getDate()}
                {isMenstrual && !isToday && (
                  <span aria-hidden="true" style={{
                    position: "absolute", bottom: -3, left: "50%",
                    transform: "translateX(-50%)",
                    width: 4, height: 4, borderRadius: "50%",
                    background: "var(--phase-menstrual)",
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 3. Check-in CTA ──────────────────────────────────────── */}
      <button onClick={() => setShowCheckIn(o => !o)} style={{
        minHeight: 48,
        background: "var(--phase-accent)", color: "var(--yr-bg)",
        border: "none", borderRadius: 999,
        padding: "12px 22px",
        fontFamily: "var(--font-body)",
        fontSize: 14, fontWeight: 700,
        letterSpacing: "0.03em",
        cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        boxShadow: "0 4px 24px color-mix(in oklch, var(--phase-accent) 20%, transparent)",
      }}>
        <span aria-hidden="true">+</span>
        {readiness ? "Update Check-in" : "Daily Check-in"}
      </button>

      {showCheckIn && (
        <InlineCheckIn
          readiness={readiness}
          setReadiness={setReadiness}
          onClose={() => setShowCheckIn(false)}
        />
      )}

      {/* ── 4. Daily Insight ─────────────────────────────────────── */}
      <section style={glassCard({ padding: 22 })}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={overline()}>Daily Insight</div>
            <h4 style={{
              margin: "4px 0 8px",
              fontFamily: "var(--font-display)",
              fontSize: 22, fontWeight: 500, lineHeight: 1.2,
              color: "var(--yr-text)", letterSpacing: "-0.01em",
            }}>
              {phaseMeta.intensity === "peak"     ? "Peak Power Window" :
               phaseMeta.intensity === "high"     ? "Focus on Strength" :
               phaseMeta.intensity === "moderate" ? "Maintain Steady Volume" :
                                                    "Honor Recovery"}
            </h4>
            <p style={{
              margin: 0,
              fontFamily: "var(--font-body)",
              fontSize: 15, lineHeight: 1.55,
              color: "var(--yr-text-2)",
            }}>
              {phaseMeta.tip || "Adapt your training to where your body is today."}
            </p>
          </div>
          <div style={{
            flexShrink: 0,
            background: "color-mix(in oklch, var(--phase-accent) 14%, transparent)",
            padding: 10, borderRadius: 12, fontSize: 22,
          }}>
            {PHASE_EMOJI[cycleState.phase] || "✨"}
          </div>
        </div>
      </section>

      {/* ACL warning — only during ovulation */}
      {cycleState.phase === "ovulatory" && (
        <div style={{
          padding: "12px 16px", borderRadius: 12,
          background: "rgba(248, 113, 113, 0.08)",
          border: "1px solid rgba(248, 113, 113, 0.22)",
          color: "#ffb4ab",
          fontFamily: "var(--font-body)",
          fontSize: 13, lineHeight: 1.5,
          display: "flex", gap: 10, alignItems: "flex-start",
        }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
          <span><strong>ACL safety:</strong> Estrogen peak increases ligament laxity. Prioritise a 10-min dynamic warm-up before intensity.</span>
        </div>
      )}

      {/* ── 5. Phase Highlights ──────────────────────────────────── */}
      <section>
        <h3 style={{ ...overline(), margin: "0 0 14px", color: "var(--yr-text-2)" }}>
          Phase Highlights
        </h3>
        <div style={{
          display: "flex", gap: 12,
          overflowX: "auto", paddingBottom: 4,
          scrollbarWidth: "none",
          marginInline: "-20px",
          paddingInline: 20,
        }}>
          {highlights.map((h, i) => (
            <div key={i} style={{
              flexShrink: 0, width: 180, padding: 18,
              background: "color-mix(in oklch, var(--yr-bg-elev) 60%, transparent)",
              backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
              borderRadius: 16, border: "1px solid var(--yr-border)",
              display: "flex", flexDirection: "column", gap: 10,
            }}>
              <span style={{ fontSize: 22 }}>{h.icon}</span>
              <h5 style={{
                margin: 0,
                fontFamily: "var(--font-body)",
                fontSize: 14, fontWeight: 600,
                color: "var(--yr-text)",
              }}>{h.title}</h5>
              <p style={{
                margin: 0,
                fontFamily: "var(--font-body)",
                fontSize: 12, lineHeight: 1.55,
                color: "var(--yr-text-2)",
              }}>{h.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. Cycle Settings ────────────────────────────────────── */}
      <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h3 style={{ ...overline(), margin: "0 0 4px", color: "var(--yr-text-2)" }}>
          Cycle Settings
        </h3>

        <CycleLengthRow
          value={cycleLength}
          onChange={(next) => { if (onUpdateProfile) onUpdateProfile({ cycleLength: next }); }}
        />

        <ToggleRow
          label="Hormonal Contraception"
          helper="Adapts recommendations for suppressed cycles"
          checked={isHormonalBc}
          onToggle={() => {
            const next = !isHormonalBc;
            setIsHormonalBc(next);
            if (onUpdateProfile) onUpdateProfile({ isHormonalBc: next });
          }}
        />

        {isHormonalBc && (
          <div style={{
            padding: "12px 14px", borderRadius: 12,
            background: "color-mix(in oklch, var(--yr-info) 8%, var(--yr-bg-elev))",
            border: "1px solid color-mix(in oklch, var(--yr-info) 22%, transparent)",
            fontFamily: "var(--font-body)",
            fontSize: 13, lineHeight: 1.5,
            color: "var(--yr-text-2)",
          }}>
            Hormonal contraception suppresses natural hormone fluctuations.
            Phase-based training is less applicable; use the daily check-in above for intensity guidance instead.
          </div>
        )}

        <ToggleRow
          label="PCOS or irregular cycle?"
          helper="Different programming applies"
          checked={showPcos}
          onToggle={() => setShowPcos(o => !o)}
          textOnly
        />
        {showPcos && PCOS_GUIDANCE && (
          <div style={{
            padding: "12px 14px", borderRadius: 12,
            background: "var(--yr-surface)",
            border: "1px solid var(--yr-border)",
          }}>
            <p style={{
              margin: "0 0 8px",
              fontFamily: "var(--font-body)",
              fontSize: 13, lineHeight: 1.55,
              color: "var(--yr-text-2)",
            }}>{PCOS_GUIDANCE.tip}</p>
            {PCOS_GUIDANCE.recommendations?.map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <span style={{ color: "var(--phase-accent)", fontFamily: "var(--font-mono)", fontSize: 12 }}>—</span>
                <span style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 13, lineHeight: 1.5,
                  color: "var(--yr-text-2)",
                }}>{r}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Disclaimer */}
      <div style={{
        fontFamily: "var(--font-body)",
        fontSize: 11, lineHeight: 1.6,
        color: "var(--yr-faint)",
        paddingTop: 16, borderTop: "1px solid var(--yr-border)",
      }}>
        Phase-based programming is based on current evidence, which is still
        evolving. Individual responses vary significantly. Not medical advice.
        For PCOS, endometriosis, or PMDD, consult a healthcare provider.
      </div>
    </div>
  );
}

// ── Style helpers ─────────────────────────────────────────────────────────

const overline = () => ({
  fontFamily: "var(--font-body)",
  fontSize: 12, fontWeight: 600,
  letterSpacing: "0.14em", textTransform: "uppercase",
  color: "var(--phase-accent)",
});

const glassCard = (extra = {}) => ({
  background: "color-mix(in oklch, var(--yr-bg-elev) 60%, transparent)",
  backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
  borderRadius: 16, border: "1px solid var(--yr-border)",
  ...extra,
});

const navBtn = (isActive = false) => ({
  width: 32, height: 32,
  background: isActive ? "var(--phase-soft)" : "transparent",
  border: "1px solid var(--yr-border)",
  borderRadius: 8,
  color: isActive ? "var(--phase-accent)" : "var(--yr-muted)",
  fontFamily: "var(--font-body)",
  fontSize: 16, fontWeight: 600,
  cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
});

// ── Subcomponents ─────────────────────────────────────────────────────────

function ToggleRow({ label, helper, checked, onToggle, textOnly = false }) {
  return (
    <div style={glassCard({
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 16px", gap: 14, minHeight: 56,
    })}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 500, color: "var(--yr-text)" }}>
          {label}
        </div>
        {helper && (
          <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--yr-muted)", marginTop: 2 }}>
            {helper}
          </div>
        )}
      </div>
      {textOnly ? (
        <button onClick={onToggle} aria-pressed={checked} style={{
          background: "transparent", border: "1px solid var(--yr-border)",
          borderRadius: 999, padding: "5px 14px",
          color: checked ? "var(--phase-accent)" : "var(--yr-muted)",
          fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600,
          cursor: "pointer", minHeight: 32,
        }}>{checked ? "Hide" : "Show"}</button>
      ) : (
        <button onClick={onToggle} aria-pressed={checked} style={{
          width: 52, height: 30, borderRadius: 999,
          border: "1px solid var(--yr-border)",
          background: checked ? "var(--phase-accent)" : "var(--yr-surface-2)",
          position: "relative", cursor: "pointer",
          flexShrink: 0, padding: 0, outline: "none",
        }}>
          <span style={{
            position: "absolute", top: 3,
            left: checked ? 25 : 3,
            width: 22, height: 22, borderRadius: "50%",
            background: "#fff", transition: "left 0.18s",
          }} />
        </button>
      )}
    </div>
  );
}

function CycleLengthRow({ value, onChange }) {
  return (
    <div style={glassCard({
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 16px", gap: 14, minHeight: 56,
    })}>
      <div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 500, color: "var(--yr-text)" }}>
          Cycle length
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--yr-muted)", marginTop: 2 }}>
          Typical range 21–45 days
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={() => onChange(Math.max(21, value - 1))} aria-label="Decrease cycle length" style={stepperBtn()}>−</button>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: 18, fontWeight: 500, minWidth: 56,
          textAlign: "center", color: "var(--yr-text)",
          letterSpacing: "-0.02em",
        }}>
          {value}<span style={{ fontSize: 11, color: "var(--yr-muted)", marginLeft: 4 }}>d</span>
        </span>
        <button onClick={() => onChange(Math.min(45, value + 1))} aria-label="Increase cycle length" style={stepperBtn()}>+</button>
      </div>
    </div>
  );
}

const stepperBtn = () => ({
  width: 32, height: 32, borderRadius: 999,
  border: "1px solid var(--yr-border)",
  background: "transparent", color: "var(--yr-text)",
  cursor: "pointer", fontSize: 16,
});

function InlineCheckIn({ readiness, setReadiness, onClose }) {
  const [local, setLocal] = useState(readiness || {
    energy: 3, mood: 3, sleep: 3, cramps: 1, soreness: 1,
  });
  const fields = [
    { key: "energy",   label: "Energy",   icon: "⚡" },
    { key: "mood",     label: "Mood",     icon: "🧠" },
    { key: "sleep",    label: "Sleep",    icon: "🌙" },
    { key: "cramps",   label: "Cramps",   icon: "🩸" },
    { key: "soreness", label: "Soreness", icon: "💪" },
  ];

  return (
    <section style={glassCard({ padding: 20, display: "flex", flexDirection: "column", gap: 18 })}>
      <div>
        <div style={overline()}>Daily Check-in</div>
        <h3 style={{
          margin: "4px 0 0",
          fontFamily: "var(--font-display)",
          fontSize: 22, fontWeight: 500,
          color: "var(--yr-text)",
        }}>How are you feeling?</h3>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {fields.map(f => (
          <div key={f.key}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              fontFamily: "var(--font-body)",
              fontSize: 12, color: "var(--yr-text-2)", marginBottom: 6,
            }}>
              <span>{f.icon} {f.label}</span>
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--phase-accent)" }}>
                {local[f.key]}
              </span>
            </div>
            <input type="range" min="1" max="5" step="1"
              value={local[f.key]}
              onChange={e => setLocal(p => ({ ...p, [f.key]: parseInt(e.target.value) }))}
              style={{ width: "100%", accentColor: "var(--phase-accent)" }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onClose} style={{
          flex: 1, padding: "12px", borderRadius: 12,
          border: "1px solid var(--yr-border)", background: "transparent",
          color: "var(--yr-text-2)",
          fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600,
          cursor: "pointer", minHeight: 44,
        }}>Cancel</button>
        <button onClick={() => { setReadiness(local); onClose(); }} style={{
          flex: 1, padding: "12px", borderRadius: 12, border: "none",
          background: "var(--phase-accent)", color: "var(--yr-bg)",
          fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700,
          cursor: "pointer", minHeight: 44,
        }}>Save</button>
      </div>
    </section>
  );
}
