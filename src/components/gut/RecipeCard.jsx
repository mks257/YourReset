import React, { useState } from 'react';

export function RecipeCard({ r, T }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{
      background: T.card, border: `1px solid ${open ? r.color + '44' : T.border}`,
      borderRadius: 20, marginBottom: 12, overflow: "hidden",
      boxShadow: open ? `0 0 24px ${r.color}18` : "none",
      transition: "border 0.2s, box-shadow 0.2s"
    }}>

      {/* Card header */}
      <div style={{ padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14, background: `${r.color}18`,
          border: `1.5px solid ${r.color}30`, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: "1.6rem", flexShrink: 0
        }}>{r.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 800, fontSize: "0.85rem", color: T.text }}>{r.title}</span>
            <span style={{
              fontSize: "0.58rem", padding: "2px 8px", borderRadius: 20,
              background: `${r.color}18`, color: r.color, fontWeight: 700
            }}>{r.tag}</span>
          </div>
          <div style={{ fontSize: "0.71rem", color: T.muted, lineHeight: 1.5, marginBottom: 8 }}>{r.desc}</div>
          {/* Meta row */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[[ "⏱️", r.time ], [ "🔥", r.calories ], [ "🍽️", r.servings + " serving" ]].map(([ ico, val ]) => (
              <span key={val} style={{ fontSize: "0.63rem", color: T.muted, display: "flex", gap: 3, alignItems: "center" }}>
                {ico} {val}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits strip */}
      <div style={{ padding: "0 16px 12px", display: "flex", gap: 6, flexWrap: "wrap" }}>
        {r.benefits.map(b => (
          <span key={b} style={{
            fontSize: "0.62rem", padding: "3px 9px", borderRadius: 20,
            background: `${r.color}10`, border: `1px solid ${r.color}22`, color: r.color, fontWeight: 600
          }}>
            {b}
          </span>
        ))}
      </div>

      {/* View Recipe button */}
      <div style={{ padding: "0 16px 14px" }}>
        <button onClick={() => setOpen(o => !o)} style={{
          width: "100%", padding: "10px 16px", borderRadius: 12, cursor: "pointer",
          border: `1.5px solid ${r.color}55`,
          background: open ? `${r.color}20` : `${r.color}10`,
          color: r.color, fontWeight: 800, fontSize: "0.78rem",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          transition: "all 0.18s",
        }}>
          <span style={{ fontSize: "1rem" }}>{open ? "🔼" : "📖"}</span>
          {open ? "Hide Recipe" : "View Full Recipe"}
        </button>
      </div>

      {/* Expanded recipe detail */}
      {open && (
        <div style={{ borderTop: `1px solid ${r.color}22`, padding: "18px 16px 20px" }}>

          {/* Ingredients */}
          <div style={{ marginBottom: 18 }}>
            <div style={{
              fontWeight: 800, fontSize: "0.82rem", color: T.text, marginBottom: 10,
              display: "flex", alignItems: "center", gap: 6
            }}>
              <span style={{
                background: `${r.color}18`, border: `1px solid ${r.color}30`,
                borderRadius: 8, padding: "3px 8px", fontSize: "0.7rem", color: r.color
              }}>INGREDIENTS</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
              {r.ingredients.map((ing, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: `${r.color}08`, border: `1px solid ${r.color}15`,
                  borderRadius: 10, padding: "8px 10px"
                }}>
                  <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{ing.emoji}</span>
                  <span style={{ fontSize: "0.69rem", color: T.muted, lineHeight: 1.4 }}>{ing.item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 800, fontSize: "0.82rem", color: T.text, marginBottom: 10 }}>
              <span style={{
                background: `${r.color}18`, border: `1px solid ${r.color}30`,
                borderRadius: 8, padding: "3px 8px", fontSize: "0.7rem", color: r.color
              }}>METHOD</span>
            </div>
            {r.steps.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%", background: `${r.color}22`,
                  border: `1.5px solid ${r.color}44`, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "0.65rem", fontWeight: 800, color: r.color,
                  flexShrink: 0, marginTop: 1
                }}>{i + 1}</div>
                <div style={{ fontSize: "0.75rem", color: T.muted, lineHeight: 1.6 }}>{step}</div>
              </div>
            ))}
          </div>

          {/* Pro tip */}
          <div style={{
            background: `${r.color}10`, border: `1px solid ${r.color}25`,
            borderRadius: 12, padding: "11px 13px",
            fontSize: "0.73rem", color: T.text, lineHeight: 1.55
          }}>
            {r.tip}
          </div>
        </div>
      )}
    </div>
  );
}
