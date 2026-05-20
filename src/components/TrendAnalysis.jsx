import React from "react";
import { getExerciseHistory } from "../storage";
import { T } from "../theme";

export default function TrendAnalysis({ exerciseId, exerciseName, dayColor }) {
  const history = getExerciseHistory(exerciseId);
  
  if (history.length < 2) return null;

  // Calculate volume per session
  const data = history.map(h => {
    const volume = h.data.reduce((acc, set) => {
      const w = parseFloat(set.weight) || 0;
      const r = parseInt(set.reps) || 0;
      return acc + (w * r);
    }, 0);
    return { week: h.weekKey, volume };
  });

  const maxVol = Math.max(...data.map(d => d.volume));
  const minVol = Math.min(...data.map(d => d.volume));
  const range = maxVol - minVol || 100;

  // Chart dimensions
  const width = 300;
  const height = 80;
  const padding = 10;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (width - 2 * padding) + padding;
    const y = height - ((d.volume - minVol) / range) * (height - 2 * padding) - padding;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div style={{ marginTop: 12, padding: "16px", background: "var(--yr-bg-elev)", borderRadius: 16, border: "1px solid var(--yr-border)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--yr-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Volume Trend</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{exerciseName}</div>
        </div>
        <div style={{ fontSize: 11, color: "var(--phase-accent)", fontWeight: 700 }}>
          {((data[data.length-1].volume / data[0].volume - 1) * 100).toFixed(0)}% Growth
        </div>
      </div>

      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
        {/* Trend line */}
        <polyline
          fill="none"
          stroke="var(--phase-accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
          style={{ filter: "drop-shadow(0 4px 8px var(--phase-soft))" }}
        />
        {/* Data points */}
        {data.map((d, i) => {
          const [x, y] = points.split(" ")[i].split(",");
          return (
            <circle key={i} cx={x} cy={y} r="3" fill="var(--yr-bg)" stroke="var(--phase-accent)" strokeWidth="1.5" />
          );
        })}
      </svg>
      
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 9, color: "var(--yr-muted)", fontFamily: "var(--font-mono)" }}>
        <span>{data[0].week}</span>
        <span>{data[data.length-1].week}</span>
      </div>
    </div>
  );
}
