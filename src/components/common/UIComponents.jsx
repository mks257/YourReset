import React from 'react';

export const LiveDot = ({ T }) => (
  <span style={{ position: "relative", display: "inline-block", width: 8, height: 8, marginRight: 6 }}>
    <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: T.green, animation: "ping 2s ease infinite", opacity: .55 }} />
    <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: T.green }} />
  </span>
);

export const Ring = ({ T, pct, size = 92, stroke = 7, color, val, unit }) => {
  const r = (size - stroke) / 2, circ = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
          style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
        <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: "0.88rem", color, lineHeight: 1 }}>{val}</div>
        <div style={{ fontSize: "0.48rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 1 }}>{unit}</div>
      </div>
    </div>
  );
};

export const Sparks = ({ T, vals, color, goal }) => {
  const mx = Math.max(...vals, goal || 0);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 40 }}>
      {vals.map((v, i) => (
        <div key={i} title={v.toLocaleString()} style={{
          flex: 1, height: Math.max(2, (v / mx) * 40), borderRadius: "2px 2px 0 0",
          background: i === vals.length - 1 ? color : goal && v >= goal ? T.teal : T.border,
          transition: "height 0.4s",
        }} />
      ))}
    </div>
  );
};
