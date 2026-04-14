import React from 'react';
import { useStore } from '../../store/StoreContext';
import { THEMES } from '../../constants/themes';

export function ProfilePage() {
  const { T, charType, setCharType, themeIdx, setThemeIdx, health } = useStore();

  return (
    <>
      <div className="fu d2" style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: "20px", marginBottom: 14, textAlign: "center" }}>
        <div style={{ width: 80, height: 80, margin: "0 auto", borderRadius: "50%", background: `linear-gradient(135deg, ${T.pink}, ${T.teal})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", marginBottom: 12 }}>
          👤
        </div>
        <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: "1.2rem" }}>Profile Settings</div>
        <div style={{ fontSize: "0.75rem", color: T.muted, marginTop: 4 }}>Premium Access</div>
      </div>

      <div className="fu d3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 12, marginBottom: 14 }}>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "16px", textAlign: "center" }}>
          <div style={{ fontSize: "1.4rem", color: T.teal, fontWeight: 800 }}>{health.age || 25}</div>
          <div style={{ fontSize: "0.6rem", color: T.muted, textTransform: "uppercase", marginTop: 4 }}>Age</div>
        </div>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "16px", textAlign: "center" }}>
          <div style={{ fontSize: "1.4rem", color: T.pink, fontWeight: 800 }}>{health.weight}</div>
          <div style={{ fontSize: "0.6rem", color: T.muted, textTransform: "uppercase", marginTop: 4 }}>Weight (kg)</div>
        </div>
        <div onClick={() => setCharType(charType === "female" ? "male" : "female")} style={{ background: T.card, border: `1px solid ${charType === "female" ? T.pink : T.amber}`, borderRadius: 16, padding: "16px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}>
          <div style={{ fontSize: "1.4rem", color: charType === "female" ? T.pink : T.amber, fontWeight: 800 }}>{charType === "female" ? "F" : "M"}</div>
          <div style={{ fontSize: "0.6rem", color: T.muted, textTransform: "uppercase", marginTop: 4 }}>Style Toggle</div>
        </div>
      </div>

      <div className="fu d4" style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: "18px 18px", marginBottom: 14 }}>
        <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "0.86rem", marginBottom: 13 }}>Data Integrations</div>
        <div style={{ display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "space-between", padding: "12px", background: `${T.red}11`, border: `1px solid ${T.red}33`, borderRadius: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "1.2rem" }}>❤️</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.8rem", color: T.red }}>Apple Health</div>
              <div style={{ fontSize: "0.65rem", color: T.muted, marginTop: 2 }}>Synced: Just now</div>
            </div>
          </div>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: T.green }}>Connected ✓</div>
        </div>
      </div>

      <div className="fu d5" style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: "18px 18px", marginBottom: 14 }}>
        <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "0.86rem", marginBottom: 13 }}>App Themes</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          {THEMES.map((theme, i) => (
            <button key={theme.id} onClick={() => setThemeIdx(i)} style={{
              padding: "12px", borderRadius: 12, border: `2px solid ${themeIdx === i ? T.pink : T.border}`,
              background: theme.card, color: theme.text, cursor: "pointer",
              textAlign: "left", fontWeight: 600, fontSize: "0.8rem", transition: "all 0.2s"
            }}>
              <div style={{ display: "flex", gap: 5, marginBottom: 6 }}>
                {[ theme.pink, theme.teal, theme.amber ].map(c => (
                  <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
                ))}
              </div>
              {theme.name}
            </button>
          ))}
        </div>
        <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "0.86rem", marginBottom: 13, marginTop: 18 }}>App Settings</div>
        {[
          { l: "Push Notifications", v: true },
          { l: "Auto-Detect Workouts", v: true },
          { l: "Dark Mode", v: true },
        ].map(s => (
          <div key={s.l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ fontSize: "0.8rem" }}>{s.l}</div>
            <div style={{ width: 40, height: 22, background: s.v ? T.green : T.border, borderRadius: 20, position: "relative", transition: "all 0.2s" }}>
              <div style={{ width: 18, height: 18, background: "#fff", borderRadius: "50%", position: "absolute", top: 2, left: s.v ? 20 : 2, transition: "all 0.2s" }} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
