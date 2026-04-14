import React from 'react';
import { useStore } from '../../store/StoreContext';
import { Ring, Sparks } from '../common/UIComponents';
import { REAL } from '../../constants/healthData';

export function DashboardPage() {
  const { T, charType, health, setTab } = useStore();

  const stepPct = Math.min(100, Math.round((health.steps / health.stepGoal) * 100));
  const kcalPct = Math.min(100, Math.round((health.kcal / health.kcalGoal) * 100));

  // Note: in a real app, 'day' would be derived from the current day index.
  // For the dashboard preview, we use the first day's meta or a generic one.
  const color = T.pink; 

  return (
    <>
      {/* Hero Feature Card */}
      <div className="fu d2" style={{
        position: "relative", height: 240, borderRadius: 24, overflow: "hidden", marginBottom: 18,
        background: `linear-gradient(to right, ${T.card} 50%, transparent 100%)`,
        border: `1px solid ${color}33`, boxShadow: `0 10px 40px -10px ${color}30`
      }}>
        <img src={`./hero_${charType}.png`} style={{
          position: "absolute", right: "-10%", top: "-10%", height: "120%", width: "auto",
          objectFit: "contain", filter: "drop-shadow(0 0 30px rgba(0,0,0,0.5))"
        }} alt="Hero" />
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, ${T.card} 30%, transparent 100%)`, zIndex: 1 }} />
        <div style={{ position: "relative", zIndex: 2, padding: "30px 24px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: "60%" }}>
          <div style={{
            background: `${color}22`, color, fontSize: "0.65rem", fontWeight: 900,
            padding: "4px 10px", borderRadius: 50, width: "fit-content", marginBottom: 10, textTransform: "uppercase"
          }}>
            Active {charType === "female" ? "Follicular" : "Performance"} Phase
          </div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 900, lineHeight: 1.1, marginBottom: 10 }}>Ready for Your Next Session?</h2>
          <div style={{ fontSize: "0.8rem", color: T.muted, marginBottom: 20, lineHeight: 1.5 }}>
            {charType === "female" ? "Estrogen is peaking. Your body is primed for maximum fat loss and strength gains." : "Testosterone and energy levels are optimal. Focus on explosive compound movements today."}
          </div>
          <button onClick={() => setTab("plan")} style={{
            background: color, color: "#fff", border: "none", padding: "10px 22px", borderRadius: 12,
            fontWeight: 800, fontSize: "0.85rem", cursor: "pointer", width: "fit-content",
            boxShadow: `0 8px 15px ${color}44`
          }}>Start Session →</button>
        </div>
      </div>

      {/* Top stat rings */}
      <div className="fu d2" style={{
        background: T.card, border: `1px solid ${T.border}`,
        borderRadius: 20, padding: "20px", marginBottom: 14
      }}>
        <div style={{
          fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "0.85rem",
          color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16
        }}>
          Today's Metrics
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Ring T={T} pct={stepPct} color={T.amber} val={health.steps.toLocaleString()} unit="Steps" />
          <Ring T={T} pct={kcalPct} color={T.pink} val={health.kcal} unit="Active kcal" />
          <Ring T={T} pct={Math.min(100, Math.round((health.exMin / 60) * 100))} color={T.violet} val={`${health.exMin}m`} unit="Exercise" />
          <Ring T={T} pct={68} color={T.red} val={health.rhr} unit="Resting HR" />
          <Ring T={T} pct={74} color={T.teal} val={`${(health.steps * 0.000762).toFixed(1)}km`} unit="Distance" />
        </div>
      </div>

      {/* Progress bars */}
      <div className="fu d2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        {[
          { label: "Steps to Goal", val: `${Math.max(0, health.stepGoal - health.steps).toLocaleString()} left`, pct: stepPct, color: T.amber },
          { label: "Calorie Goal", val: `${health.kcal} / ${health.kcalGoal} kcal`, pct: kcalPct, color: T.pink },
        ].map(m => (
          <div key={m.label} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "14px 16px" }}>
            <div style={{ fontSize: "0.65rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>{m.label}</div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "1rem", color: m.color, marginBottom: 8 }}>{m.val}</div>
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 100, height: 6, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${m.pct}%`, background: m.color, borderRadius: 100, transition: "width 1s ease" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Step history */}
      <div className="fu d3" style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: "18px 18px 14px", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "0.88rem" }}>👣 30-Day Steps</div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.66rem", color: T.muted }}>
            avg {Math.round(REAL.stepHistory.reduce((a, b) => a + b) / REAL.stepHistory.length).toLocaleString()} · dynamic goal
          </div>
        </div>
        <Sparks T={T} vals={REAL.stepHistory} color={T.amber} goal={health.stepGoal} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, fontSize: "0.55rem", color: T.muted }}>
          <span>Mar 14</span><span style={{ color: T.amber, fontWeight: 700 }}>Today ▲</span>
        </div>
      </div>

      {/* Calorie + HR history */}
      <div className="fu d3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "16px" }}>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "0.82rem", marginBottom: 10 }}>🔥 Active kcal</div>
          <Sparks T={T} vals={REAL.kcalHistory} color={T.pink} goal={500} />
          <div style={{ fontSize: "0.58rem", color: T.muted, marginTop: 4 }}>best {Math.max(...REAL.kcalHistory)} kcal</div>
        </div>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "16px" }}>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "0.82rem", marginBottom: 10 }}>❤️ Resting HR</div>
          <Sparks T={T} vals={REAL.rhrHistory.map(v => v || 0)} color={T.red} />
          <div style={{ fontSize: "0.58rem", color: T.muted, marginTop: 4 }}>avg {Math.round(REAL.rhrHistory.filter(Boolean).reduce((a, b) => a + b) / REAL.rhrHistory.filter(Boolean).length)} bpm</div>
        </div>
      </div>

      {/* Key stats */}
      <div className="fu d4" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 12 }}>
        {[
          { icon: "⚖️", label: "Weight", val: `${health.weight} kg`, sub: "Target: 55 kg", color: T.teal },
          { icon: "🎯", label: "BMR", val: "~1,450 kcal", sub: "25F · 63.5 kg", color: T.violet },
          { icon: "📏", label: "Avg Distance", val: "4.55 km", sub: "30-day avg/day", color: T.blue },
          { icon: "🏆", label: "Best Day", val: "17,556", sub: "steps on Apr 11", color: T.green },
        ].map(m => (
          <div key={m.label} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "14px 16px" }}>
            <div style={{ fontSize: "1rem", marginBottom: 7 }}>{m.icon}</div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: "1.25rem", color: m.color }}>{m.val}</div>
            <div style={{ fontSize: "0.62rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 3 }}>{m.label}</div>
            <div style={{ fontSize: "0.62rem", color: "rgba(240,238,255,0.28)", marginTop: 3 }}>{m.sub}</div>
          </div>
        ))}
      </div>
    </>
  );
}
