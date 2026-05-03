import { useState, useEffect } from "react";
import * as Storage from "../storage";
import {
  CHECK_IN_FIELDS, TRIGGERS, GUT_CONTENT, RED_FLAGS,
  calcGutScore, getScoreLabel, getDailyGutNudge,
} from "../gutEngine";

const todayKey = () => `gut_${Storage.getTodayKey()}`;

// ── Small section header ──────────────────────────────────────────────────
function SectionHead({ title, sub }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div className="section-title">{title}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--yr-muted)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ── Horizontal chip group ─────────────────────────────────────────────────
function ChipGroup({ options, selected, onSelect, multi = false }) {
  return (
    <div className="row" style={{ flexWrap: "wrap", gap: 6 }}>
      {options.map(opt => {
        const active = multi
          ? (selected || []).includes(opt)
          : selected === opt.toLowerCase();
        return (
          <button key={opt}
            className={`chip${active ? " active" : ""}`}
            style={{ padding: "6px 12px", fontSize: 12, borderRadius: 99 }}
            onClick={() => {
              if (multi) {
                const cur = selected || [];
                onSelect(cur.includes(opt) ? cur.filter(x => x !== opt) : [...cur, opt]);
              } else {
                onSelect(opt.toLowerCase());
              }
            }}>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ── Score ring ────────────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const info = getScoreLabel(score);
  const r = 36, stroke = 5, circ = 2 * Math.PI * r;
  const dash = circ * (score / 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ position: "relative", width: 88, height: 88, flexShrink: 0 }}>
        <svg width={88} height={88} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={44} cy={44} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
          <circle cx={44} cy={44} r={r} fill="none" stroke={info.color} strokeWidth={stroke}
            strokeLinecap="round" strokeDasharray={circ}
            strokeDashoffset={circ - dash}
            style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.03em", color: info.color }}>{score}</span>
          <span style={{ fontSize: 9, color: "var(--yr-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>/ 100</span>
        </div>
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, color: info.color, marginBottom: 3 }}>{info.label}</div>
        <div style={{ fontSize: 12, color: "var(--yr-muted)", lineHeight: 1.5 }}>
          Based on bloating, comfort, bathroom pattern, hydration, and stress.
          <span style={{ display: "block", marginTop: 4, opacity: 0.7 }}>This is a wellness indicator, not a medical score.</span>
        </div>
      </div>
    </div>
  );
}

// ── Content card (collapsible) ────────────────────────────────────────────
function ContentCard({ card }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      borderRadius: "var(--r-lg)", border: "1px solid var(--yr-border)",
      background: "var(--yr-card)", overflow: "hidden",
    }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: "100%", padding: "14px 16px", background: "transparent", border: 0,
        cursor: "pointer", display: "flex", alignItems: "center", gap: 10, textAlign: "left",
      }}>
        <span style={{ fontSize: 20 }}>{card.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--yr-text)" }}>{card.title}</div>
          <div style={{ fontSize: 12, color: "var(--yr-muted)", marginTop: 2 }}>{card.summary}</div>
        </div>
        <span style={{ fontSize: 12, color: "var(--yr-muted)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
      </button>

      {open && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--yr-border-soft)" }}>
          <p style={{ fontSize: 13, color: "var(--yr-muted)", lineHeight: 1.6, margin: "12px 0 10px" }}>
            {card.detail}
          </p>
          {card.chips.length > 0 && (
            <div className="row" style={{ flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
              {card.chips.map(c => (
                <span key={c} style={{
                  padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                  background: "var(--phase-soft)", color: "var(--phase-accent)",
                  border: "1px solid var(--phase-border)",
                }}>{c}</span>
              ))}
            </div>
          )}
          {card.caution && (
            <div style={{
              padding: "8px 12px", borderRadius: 8, fontSize: 11, color: "var(--yr-muted)",
              background: card.isCaution ? "rgba(216,107,138,0.08)" : "rgba(242,189,115,0.08)",
              border: `1px solid ${card.isCaution ? "rgba(216,107,138,0.22)" : "rgba(242,189,115,0.22)"}`,
              lineHeight: 1.5,
            }}>
              {card.caution}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export default function GutResetTab({ profile, cycleState }) {
  const [log, setLog]         = useState(() => Storage.get(todayKey(), {}));
  const [triggers, setTriggers] = useState(() => Storage.get(todayKey() + "_triggers", []));
  const [note, setNote]         = useState(() => Storage.get(todayKey() + "_note", ""));

  // Persist on every change
  useEffect(() => { Storage.set(todayKey(), log); },           [log]);
  useEffect(() => { Storage.set(todayKey() + "_triggers", triggers); }, [triggers]);
  useEffect(() => { Storage.set(todayKey() + "_note", note); }, [note]);

  const score     = calcGutScore(log);
  const checkedIn = Object.keys(log).length >= 4;
  const nudge     = getDailyGutNudge();

  const isFemaleCycle = profile?.cycleTracking && cycleState;

  return (
    <div className="screen-stack" style={{ paddingTop: 4 }}>

      {/* ── Header ── */}
      <div className="phase-card fade-in" style={{ "--phase-accent":"var(--yr-sage)" }}>
        <div className="phase-eyebrow" style={{ color: "var(--yr-sage)" }}>Gut Reset</div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--yr-text)", margin: "6px 0 6px" }}>
          Track how your body feels today
        </h2>
        <p style={{ fontSize: 13, color: "var(--yr-muted)", lineHeight: 1.5, marginBottom: 10 }}>
          Find patterns across food, stress, sleep, training, and{isFemaleCycle ? " cycle phase" : " daily habits"}.
        </p>
        <div style={{
          padding: "10px 12px", borderRadius: 10,
          background: "rgba(155,216,180,0.1)", border: "1px solid rgba(155,216,180,0.22)",
          fontSize: 12, color: "var(--yr-sage)", lineHeight: 1.55,
        }}>
          💡 {nudge}
        </div>
      </div>

      {/* ── Gut comfort score (shows after partial check-in) ── */}
      {score !== null && (
        <div className="card fade-in" style={{ padding: 16 }}>
          <div className="section-title" style={{ marginBottom: 12 }}>Gut comfort score</div>
          <ScoreRing score={score} />
        </div>
      )}

      {/* ── Daily check-in ── */}
      <div className="card fade-in">
        <SectionHead
          title="Daily check-in"
          sub={checkedIn ? "Logged · tap any row to update" : "Select all to see your score"}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {CHECK_IN_FIELDS.map(field => (
            <div key={field.key}>
              <div className="field-label" style={{ marginBottom: 6 }}>{field.label}</div>
              <ChipGroup
                options={field.options}
                selected={log[field.key]}
                onSelect={val => setLog(p => ({ ...p, [field.key]: val }))}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Trigger tracker ── */}
      <div className="card fade-in">
        <SectionHead
          title="Possible triggers today"
          sub="Optional · helps you spot patterns over time"
        />
        <ChipGroup
          options={TRIGGERS}
          selected={triggers}
          onSelect={setTriggers}
          multi
        />
        <div style={{ marginTop: 12 }}>
          <div className="field-label" style={{ marginBottom: 6 }}>Trigger note (optional)</div>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Anything else you noticed today…"
            rows={2}
            style={{
              width: "100%", padding: "10px 12px", borderRadius: 10,
              border: "1px solid var(--yr-border)", background: "rgba(255,255,255,0.04)",
              color: "var(--yr-text)", fontFamily: "inherit", fontSize: 13,
              outline: "none", resize: "vertical", lineHeight: 1.5,
            }}
          />
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: "var(--yr-faint)" }}>
          Triggers like carbonated drinks, alcohol, caffeine, spicy food, and raw vegetables
          affect digestion differently for everyone. Log without judgment.
        </div>
      </div>

      {/* ── Cycle gut note ── */}
      {isFemaleCycle && (
        <div style={{
          padding: "12px 14px", borderRadius: 14,
          background: "var(--phase-soft)", border: "1px solid var(--phase-border)",
          fontSize: 13, color: "var(--yr-muted)", lineHeight: 1.55,
        }}>
          <span style={{ color: "var(--phase-accent)", fontWeight: 700 }}>
            Cycle + gut connection:
          </span>{" "}
          Gut symptoms often change across cycle phases. Bloating, constipation, and
          appetite shifts are common in the luteal phase. Logging over time can help you
          distinguish hormonal patterns from food triggers.
        </div>
      )}

      {/* ── Content cards ── */}
      <div>
        <SectionHead title="Gut health basics" sub="Tap any card to expand" />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {GUT_CONTENT.map(card => <ContentCard key={card.id} card={card} />)}
        </div>
      </div>

      {/* ── Red flag safety card ── */}
      <div style={{
        padding: "16px",
        borderRadius: "var(--r-lg)",
        background: "rgba(248, 113, 113, 0.07)",
        border: "1px solid rgba(248, 113, 113, 0.24)",
      }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--yr-red)", marginBottom: 8 }}>
          When to get medical help
        </div>
        <p style={{ fontSize: 12, color: "var(--yr-muted)", lineHeight: 1.6, marginBottom: 12 }}>
          This page is for wellness tracking, not diagnosis. Talk to a clinician if symptoms are
          severe, persistent, worsening, or come with any of the following:
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {RED_FLAGS.map(flag => (
            <div key={flag} className="row" style={{ gap: 8 }}>
              <span style={{ color: "var(--yr-red)", fontSize: 11, flexShrink: 0 }}>!</span>
              <span style={{ fontSize: 12, color: "var(--yr-muted)" }}>{flag}</span>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: 12, padding: "8px 12px", borderRadius: 8,
          background: "rgba(248,113,113,0.06)", fontSize: 11, color: "var(--yr-faint)", lineHeight: 1.5,
        }}>
          Rectal bleeding, black/tarry stool, severe abdominal pain, unexplained weight loss,
          or persistent changes in bowel habits should be evaluated by a clinician, not tracked as
          routine wellness data.
        </div>
      </div>

    </div>
  );
}
