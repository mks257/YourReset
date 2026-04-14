import React, { useState } from 'react';
import { useStore } from '../../store/StoreContext';
import { getMuscleGroups } from '../../constants/healthData';
import { Figure3D } from '../common/Figure3D';
import { ExModal } from '../common/ExModal';

export function WorkoutPage() {
  const { T, charType, done, toggleDone } = useStore();
  const MUSCLE_GROUPS = getMuscleGroups(T);
  const [dayIdx, setDayIdx] = useState(0);
  const [section, setSection] = useState("warmUp");
  const [modal, setModal] = useState(null);

  const day = MUSCLE_GROUPS[dayIdx];
  const sectionExs = day[section] || [];
  const allExs = [...day.warmUp, ...day.main, ...day.coolDown];
  const totalDone = allExs.filter(e => done[`${dayIdx}-${e.id}`]).length;
  const totalPct = Math.round((totalDone / allExs.length) * 100);

  const modalEx = modal ? sectionExs.find(e => e.id === modal) : null;

  const SECTION_META = {
    warmUp: { label: "🔥 Warm-Up", color: T.amber, desc: "Raises core temp, primes joints. Never skip." },
    main: { label: "💪 Main Work", color: day.color, desc: "Today's focused training block." },
    coolDown: { label: "🧘 Cool-Down", color: T.teal, desc: "Reduces injury risk & speeds recovery." },
  };

  return (
    <>
      {/* Day strip */}
      <div className="fu d2" style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
        {MUSCLE_GROUPS.map((d, i) => (
          <button key={i} onClick={() => { setDayIdx(i); setSection("warmUp"); }}
            style={{
              flexShrink: 0, minWidth: 70, padding: "9px 8px", borderRadius: 14,
              border: `1px solid ${dayIdx === i ? d.color : T.border}`,
              background: dayIdx === i ? `${d.color}18` : T.card,
              color: dayIdx === i ? d.color : T.muted, cursor: "pointer",
              fontFamily: "'Outfit',sans-serif", fontWeight: 700,
              boxShadow: dayIdx === i ? `0 4px 14px ${d.color}30` : "none",
              transition: "all 0.2s", textAlign: "center"
            }}>
            <div style={{ fontSize: "1.1rem", marginBottom: 2 }}>{d.emoji}</div>
            <div style={{ fontSize: "0.57rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {d.name}
            </div>
          </button>
        ))}
      </div>

      {/* Day info */}
      <div className="fu d2" style={{
        background: T.card, border: `1px solid ${day.color}33`,
        borderRadius: 20, padding: "16px 18px", marginBottom: 14, borderLeft: `4px solid ${day.color}`
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: "1.05rem", color: day.color }}>
              {day.emoji} {day.label}
            </div>
            <div style={{ fontSize: "0.68rem", color: T.muted, marginTop: 2 }}>
              {day.focus} · {allExs.length} total exercises
            </div>
            <div style={{ fontSize: "0.73rem", color: "rgba(240,238,255,0.5)", marginTop: 6, lineHeight: 1.55, maxWidth: 370 }}>{day.tip}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: day.color, lineHeight: 1 }}>{totalPct}%</div>
            <div style={{ fontSize: "0.5rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 4 }}>Completed</div>
          </div>
        </div>
      </div>

      {/* Section selector */}
      <div className="fu d2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
        {Object.entries(SECTION_META).map(([k, m]) => (
          <button key={k} onClick={() => setSection(k)} style={{
            padding: "12px 0", borderRadius: 16, border: `1px solid ${section === k ? m.color : T.border}`,
            background: section === k ? `${m.color}15` : T.card,
            color: section === k ? m.color : T.muted,
            cursor: "pointer", fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "0.78rem",
            transition: "all 0.2s"
          }}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Section info */}
      <div className="fu d2" style={{ marginBottom: 14, padding: "0 4px" }}>
        <div style={{ fontSize: "0.74rem", color: T.muted, lineHeight: 1.5 }}>
          <strong style={{ color: SECTION_META[section].color }}>{SECTION_META[section].label}:</strong> {SECTION_META[section].desc}
        </div>
      </div>

      {/* Exercise list */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10, paddingBottom: 20 }}>
        {sectionExs.map((ex, i) => {
          const isDone = !!done[`${dayIdx}-${ex.id}`];
          return (
            <div key={ex.id} className="fu" style={{ animationDelay: `${i * 0.05}s` }}>
              <div onClick={() => setModal(ex.id)} style={{
                background: T.card, border: `1px solid ${isDone ? SECTION_META[section].color + '44' : T.border}`,
                borderRadius: 20, padding: 12, display: "flex", gap: 14, alignItems: "center",
                cursor: "pointer", transition: "all 0.2s", position: "relative", overflow: "hidden"
              }}>
                <div style={{ width: 80, height: 80, borderRadius: 14, overflow: "hidden", flexShrink: 0, border: `1px solid ${T.border}` }}>
                  <Figure3D animKey={ex.anim} color={SECTION_META[section].color} height={80} charType={charType} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: "0.92rem", marginBottom: 4, color: isDone ? T.muted : T.text }}>{ex.name}</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{ fontSize: "0.68rem", color: T.muted }}>{ex.sets}</div>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: T.border }} />
                    <div style={{ fontSize: "0.68rem", color: SECTION_META[section].color, fontWeight: 700 }}>~{ex.kcal} kcal</div>
                  </div>
                </div>
                <div style={{
                  width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                  border: `2px solid ${isDone ? SECTION_META[section].color : T.border}`,
                  background: isDone ? SECTION_META[section].color : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem"
                }}>
                  {isDone ? "✓" : "→"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Exercise Modal */}
      {modal && modalEx && (
        <ExModal
          T={T}
          ex={modalEx}
          color={SECTION_META[section].color}
          onClose={() => setModal(null)}
          isDone={!!done[`${dayIdx}-${modalEx.id}`]}
          onDone={() => toggleDone(dayIdx, modalEx.id)}
          charType={charType}
        />
      )}
    </>
  );
}
