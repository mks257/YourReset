import { useState } from "react";
import { T } from "../theme";
import * as Storage from "../storage";
import { getCycleState } from "../cycleEngine";

const GOALS = [
  { id: "fat_loss", label: "Fat Loss", icon: "🔥" },
  { id: "muscle_tone", label: "Muscle Tone", icon: "💪" },
  { id: "endurance", label: "Endurance", icon: "🏃" },
  { id: "strength", label: "Strength", icon: "🏋️" },
  { id: "flexibility", label: "Flexibility", icon: "🧘" },
];

const EQUIPMENT_OPTIONS = [
  { id: "dumbbells", label: "Dumbbells", icon: "🏋️" },
  { id: "barbell", label: "Barbell", icon: "🏗" },
  { id: "cable", label: "Cable Machine", icon: "🔗" },
  { id: "machines", label: "Gym Machines", icon: "⚙️" },
  { id: "kettlebell", label: "Kettlebell", icon: "🫙" },
  { id: "cardio", label: "Cardio Equipment", icon: "🚴" },
  { id: "bands", label: "Resistance Bands", icon: "🪢" },
  { id: "bodyweight", label: "Bodyweight Only", icon: "🤸" },
];

function SettingsPage({ profile, onSave }) {
  const [name, setName] = useState(profile.name || "");
  const [goal, setGoal] = useState(profile.goal || "fat_loss");
  const [cycleTracking, setCycleTracking] = useState(profile.cycleTracking || false);
  const [cycleStartDate, setCycleStartDate] = useState(profile.cycleStartDate || "");
  const [cycleLength, setCycleLength] = useState(profile.cycleLength || 28);
  const [equipment, setEquipment] = useState(profile.equipment || []);
  const [units, setUnits] = useState(profile.units || "metric");
  const [healthSync, setHealthSync] = useState(profile.healthSync || false);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  const currentCycle = cycleTracking && cycleStartDate
    ? getCycleState(cycleStartDate, cycleLength)
    : null;

  const toggleEquipment = (id) => {
    setEquipment(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    const updated = { ...profile, name, goal, cycleTracking, cycleStartDate, cycleLength, equipment, units, healthSync };
    Storage.set('profile', updated);
    onSave(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('yr_')) {
        try { data[key] = JSON.parse(localStorage.getItem(key)); } catch { data[key] = localStorage.getItem(key); }
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yourreset-data-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (!clearConfirm) { setClearConfirm(true); return; }
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('yr_')) keysToRemove.push(key);
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    window.location.reload();
  };

  const sectionStyle = { background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: "18px 20px", marginBottom: 14 };
  const labelStyle = { fontSize: "0.68rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 };
  const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.border}`, background: "#080912", color: T.text, fontSize: "0.88rem", outline: "none", fontFamily: "'Outfit',sans-serif" };

  return (
    <div className="fu d2">
      {/* Section 1: Profile */}
      <div style={sectionStyle}>
        <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "0.95rem", marginBottom: 16 }}>👤 Profile</div>
        <div style={{ marginBottom: 14 }}>
          <div style={labelStyle}>Your Name</div>
          <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="Your name" />
        </div>
        <div>
          <div style={labelStyle}>Primary Goal</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {GOALS.map(g => (
              <button key={g.id} onClick={() => setGoal(g.id)} style={{
                padding: "8px 14px", borderRadius: 10, border: `1px solid ${goal === g.id ? T.pink : T.border}`,
                background: goal === g.id ? `${T.pink}20` : T.card2, color: goal === g.id ? T.pink : T.muted,
                fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer",
              }}>{g.icon} {g.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Section 2: Cycle */}
      {profile.gender === "female" && (
        <div style={sectionStyle}>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "0.95rem", marginBottom: 16 }}>🌸 Cycle Tracking</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>Enable cycle-aware training</div>
              <div style={{ fontSize: "0.68rem", color: T.muted, marginTop: 2 }}>Adapts workouts to your menstrual cycle phase</div>
            </div>
            <button onClick={() => setCycleTracking(p => !p)} style={{
              width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
              background: cycleTracking ? T.teal : T.border,
              position: "relative", transition: "background 0.2s",
            }}>
              <div style={{
                position: "absolute", top: 2, left: cycleTracking ? 22 : 2, width: 20, height: 20,
                borderRadius: "50%", background: "#fff", transition: "left 0.2s",
              }} />
            </button>
          </div>
          {cycleTracking && (
            <>
              <div style={{ marginBottom: 12 }}>
                <div style={labelStyle}>Last Period Start Date</div>
                <input type="date" value={cycleStartDate} onChange={e => setCycleStartDate(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={labelStyle}>Cycle Length (days)</div>
                <input type="number" min={21} max={40} value={cycleLength} onChange={e => setCycleLength(Number(e.target.value))} style={{ ...inputStyle, width: 100 }} />
              </div>
              {currentCycle && (
                <div style={{ padding: "10px 14px", background: `${currentCycle.color}12`, border: `1px solid ${currentCycle.color}33`, borderRadius: 10, fontSize: "0.75rem" }}>
                  <span style={{ color: currentCycle.color, fontWeight: 700 }}>Current phase: </span>
                  <span style={{ color: "rgba(240,238,255,0.8)" }}>{currentCycle.label} · Day {currentCycle.dayOfCycle}</span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Section 3: Equipment */}
      <div style={sectionStyle}>
        <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "0.95rem", marginBottom: 16 }}>🏋️ Available Equipment</div>
        <div style={labelStyle}>Select everything you have access to</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {EQUIPMENT_OPTIONS.map(e => (
            <button key={e.id} onClick={() => toggleEquipment(e.id)} style={{
              padding: "8px 14px", borderRadius: 10, border: `1px solid ${equipment.includes(e.id) ? T.teal : T.border}`,
              background: equipment.includes(e.id) ? `${T.teal}20` : T.card2,
              color: equipment.includes(e.id) ? T.teal : T.muted,
              fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer",
            }}>{e.icon} {e.label}</button>
          ))}
        </div>
      </div>

      {/* Section X: Preferences */}
      <div style={sectionStyle}>
        <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "0.95rem", marginBottom: 16 }}>⚙️ Preferences</div>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>Units</div>
            <div style={{ fontSize: "0.68rem", color: T.muted, marginTop: 2 }}>Choose between metric (kg/cm) and imperial (lb/in)</div>
          </div>
          <div style={{ display: "flex", background: T.card2, borderRadius: 10, padding: 2, border: `1px solid ${T.border}` }}>
            <button onClick={() => setUnits("metric")} style={{
              padding: "4px 12px", borderRadius: 8, border: "none", cursor: "pointer",
              background: units === "metric" ? T.teal : "transparent",
              color: units === "metric" ? "#fff" : T.muted, fontSize: "0.75rem", fontWeight: 700, transition: "all 0.2s"
            }}>Metric</button>
            <button onClick={() => setUnits("imperial")} style={{
              padding: "4px 12px", borderRadius: 8, border: "none", cursor: "pointer",
              background: units === "imperial" ? T.teal : "transparent",
              color: units === "imperial" ? "#fff" : T.muted, fontSize: "0.75rem", fontWeight: 700, transition: "all 0.2s"
            }}>Imperial</button>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>Health Sync</div>
            <div style={{ fontSize: "0.68rem", color: T.muted, marginTop: 2 }}>Connect Apple Health / Google Fit to sync steps & calories</div>
          </div>
          <button onClick={() => setHealthSync(p => !p)} style={{
            width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
            background: healthSync ? T.teal : T.border,
            position: "relative", transition: "background 0.2s", flexShrink: 0
          }}>
            <div style={{
              position: "absolute", top: 2, left: healthSync ? 22 : 2, width: 20, height: 20,
              borderRadius: "50%", background: "#fff", transition: "left 0.2s",
            }} />
          </button>
        </div>
      </div>

      {/* Section 4: Data & Privacy */}
      <div style={sectionStyle}>
        <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "0.95rem", marginBottom: 16 }}>🔒 Data & Privacy</div>
        <div style={{ fontSize: "0.75rem", color: "rgba(240,238,255,0.6)", lineHeight: 1.6, marginBottom: 16 }}>
          All your data is stored exclusively on this device using localStorage. Nothing is sent to any server. You own your data completely.
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
          <button onClick={handleExport} style={{
            padding: "10px 16px", borderRadius: 10, border: `1px solid ${T.teal}44`,
            background: `${T.teal}12`, color: T.teal, fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer",
          }}>⬇ Export my data</button>
          <button onClick={handleClearData} style={{
            padding: "10px 16px", borderRadius: 10, border: `1px solid ${clearConfirm ? T.red : T.border}`,
            background: clearConfirm ? `${T.red}20` : "transparent", color: clearConfirm ? T.red : T.muted,
            fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer",
          }}>{clearConfirm ? "⚠️ Confirm — this cannot be undone" : "🗑 Clear all data"}</button>
        </div>
        {clearConfirm && (
          <button onClick={() => setClearConfirm(false)} style={{ fontSize: "0.72rem", color: T.muted, background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>Cancel</button>
        )}
        <div style={{ padding: "12px 14px", background: `${T.amber}0a`, border: `1px solid ${T.amber}20`, borderRadius: 10, fontSize: "0.68rem", color: T.muted, lineHeight: 1.6 }}>
          <span style={{ color: T.amber, fontWeight: 700 }}>Medical disclaimer: </span>
          YourReset provides wellness and fitness guidance for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider before starting any new fitness or nutrition program.
        </div>
      </div>

      {/* Save button */}
      <button onClick={handleSave} style={{
        width: "100%", padding: "14px 0", borderRadius: 14, border: "none", cursor: "pointer",
        background: saved ? `${T.green}30` : `linear-gradient(135deg,${T.pink},${T.violet})`,
        color: saved ? T.green : "#fff",
        fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "0.95rem",
        boxShadow: saved ? "none" : `0 6px 20px ${T.pink}44`,
        transition: "all 0.2s",
      }}>
        {saved ? "✓ Saved!" : "Save changes"}
      </button>
    </div>
  );
}

export default SettingsPage;
