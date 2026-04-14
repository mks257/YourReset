import React from 'react';
import { useStore } from '../../store/StoreContext';

export function CyclePage() {
  const { T } = useStore();

  return (
    <>
      <div className="fu d2" style={{
        background: T.card, border: `1px solid ${T.pink}33`,
        borderRadius: 20, padding: "18px 20px", marginBottom: 14, borderLeft: `4px solid ${T.pink}`
      }}>
        <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: "0.95rem", color: T.pink, marginBottom: 7 }}>
          🌸 Currently: Follicular Phase · Day 7 of 28
        </div>
        <div style={{ fontSize: "0.77rem", color: "rgba(240,238,255,0.58)", lineHeight: 1.65 }}>
          Estrogen rising — BEST window for heavy lifting, HIIT, and intense cardio.
          Recovery is fastest and fat oxidation peaks. Make the most of days 6–13!
        </div>
      </div>

      {/* 28-day strip */}
      <div className="fu d2" style={{
        background: T.card, border: `1px solid ${T.border}`,
        borderRadius: 20, padding: "18px 18px 16px", marginBottom: 14
      }}>
        <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "0.86rem", marginBottom: 13 }}>28-Day Cycle Map</div>
        <div style={{ display: "flex", gap: 3 }}>
          {Array.from({ length: 28 }, (_, i) => i + 1).map(d => {
            const c = d <= 5 ? T.pink : d <= 13 ? T.teal : d <= 16 ? T.amber : T.violet;
            const now = d === 7;
            return (
              <div key={d} title={`Day ${d}`} style={{
                flex: 1, height: 30, borderRadius: 5, background: `${c}22`,
                border: `2px solid ${now ? c : "transparent"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.46rem", color: c, fontWeight: 700,
                transform: now ? "scaleY(1.3)" : "scaleY(1)",
                boxShadow: now ? `0 0 12px ${c}99` : "none",
                transition: "transform 0.2s", cursor: "default",
              }}>{now ? "▲" : ""}</div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 11, flexWrap: "wrap" }}>
          {[[ T.pink, "🌑", "Menstrual", "1–5" ], [ T.teal, "🌱", "Follicular", "6–13 ← Now" ], [ T.amber, "☀️", "Ovulation", "14–16" ], [ T.violet, "🌙", "Luteal", "17–28" ]].map(([ c, ico, n, d ]) => (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.65rem" }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
              <span style={{ color: n.includes("Follicular") ? c : T.muted, fontWeight: n.includes("Follicular") ? 700 : 400 }}>{ico} {n} <span style={{ opacity: 0.38 }}>({d})</span></span>
            </div>
          ))}
        </div>
      </div>

      {/* Phase cards */}
      {[
        { c: T.pink, ico: "🌑", n: "Menstrual", d: "1–5", note: "Rest is medicine. Gentle walks, yoga, stretching only. Body is recovering.", ex: [ "Yoga", "Short walks", "Stretching", "Breathing" ] },
        { c: T.teal, ico: "🌱", n: "Follicular", d: "6–13", note: "Push hard here. Heavy lifts, HIIT, long cardio. Fastest recovery of the month.", ex: [ "Heavy lifting", "HIIT", "Chest/Back", "Long runs" ] },
        { c: T.amber, ico: "☀️", n: "Ovulation", d: "14–16", note: "Peak power output. Absolute hardest workouts. Full body compound movements.", ex: [ "Max effort", "Full body", "Plyometrics", "Sprints" ] },
        { c: T.violet, ico: "🌙", n: "Luteal", d: "17–28", note: "Energy dips. Swap HIIT for steady-state. Weights ok but go lighter.", ex: [ "Incline walks", "Yoga", "Light weights", "Swimming" ] },
      ].map(p => (
        <div key={p.n} className="fu d3" style={{
          background: T.card, border: `1px solid ${p.c}22`,
          borderRadius: 16, padding: "15px 18px", marginBottom: 10, borderLeft: `3px solid ${p.c}`
        }}>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, color: p.c, fontSize: "0.86rem", marginBottom: 5 }}>
            {p.ico} {p.n} <span style={{ opacity: 0.45, fontWeight: 500 }}>· Days {p.d}</span>
          </div>
          <div style={{ fontSize: "0.73rem", color: "rgba(240,238,255,0.5)", lineHeight: 1.55, marginBottom: 9 }}>{p.note}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {p.ex.map(w => (
              <span key={w} style={{
                fontSize: "0.6rem", padding: "2px 9px", borderRadius: 100,
                background: `${p.c}14`, color: p.c, fontWeight: 700
              }}>{w}</span>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
