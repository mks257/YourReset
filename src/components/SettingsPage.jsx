import { useState } from "react";
import * as Storage from "../storage";
import { getCycleState } from "../cycleEngine";

const GOALS     = ["fat loss","muscle tone","endurance","strength","flexibility","wellness"];
const EQUIPMENT = ["bodyweight","dumbbells","barbell","bands","kettlebell","machines","cable","cardio"];

export default function SettingsPage({ profile, onSave }) {
  const [name,    setName]    = useState(profile.name || "");
  const [goal,    setGoal]    = useState(profile.goal || "fat_loss");
  const [cycling, setCycling] = useState(profile.cycleTracking || false);
  const [cycleStart, setCycleStart] = useState(profile.cycleStartDate || "");
  const [cycleLen,   setCycleLen]   = useState(profile.cycleLength || 28);
  const [equipment, setEquipment]   = useState(profile.equipment || []);
  const [saved, setSaved] = useState(false);
  const [demoCleared, setDemoCleared] = useState(null);
  const [clearConfirm, setClearConfirm] = useState(false);

  const toggleEquip = (eq) => setEquipment(prev => prev.includes(eq) ? prev.filter(e=>e!==eq) : [...prev, eq]);

  const handleSave = () => {
    const p = { ...profile, name, goal, cycleTracking:cycling, cycleStartDate:cycleStart, cycleLength:cycleLen, equipment };
    Storage.set("profile", p);
    onSave(p);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("yr_")) { try { data[key] = JSON.parse(localStorage.getItem(key)); } catch { data[key] = localStorage.getItem(key); } }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type:"application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `yourreset-data-${new Date().toISOString().slice(0,10)}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const handleClearDemos = () => {
    let count = 0;
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k?.startsWith("yr_hf_vid_")) keys.push(k); }
    keys.forEach(k => { localStorage.removeItem(k); count++; });
    setDemoCleared(count);
    setTimeout(() => setDemoCleared(null), 3000);
  };

  const handleClearAll = () => {
    if (!clearConfirm) { setClearConfirm(true); return; }
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k?.startsWith("yr_")) keys.push(k); }
    keys.forEach(k => localStorage.removeItem(k));
    window.location.reload();
  };

  const row = { borderTop:"1px solid var(--yr-border)", paddingTop:18, paddingBottom:8 };
  const lkey = { fontFamily:"var(--font-mono)", fontSize:11, textTransform:"uppercase", letterSpacing:"0.14em", color:"var(--yr-text)" };
  const lval = { fontSize:12, color:"var(--phase-accent)", fontFamily:"var(--font-mono)" };

  return (
    <div className="yr-stack-lg">
      <div>
        <div className="yr-overline">Profile</div>
        <h1 className="yr-display" style={{ fontSize:"clamp(32px,5vw,52px)", fontWeight:500, letterSpacing:"-0.03em", margin:0 }}>
          {name || "You"}.
        </h1>
      </div>

      <div className="yr-quad">
        {/* Name */}
        <div className="yr-quad-row" style={row}>
          <div className="yr-quad-label"><div style={lkey}>Display name</div></div>
          <input className="yr-input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
        </div>

        {/* Goal */}
        <div className="yr-quad-row" style={row}>
          <div className="yr-quad-label">
            <div style={lkey}>Primary goal</div>
            <div style={lval}>{goal.replace("_"," ")}</div>
          </div>
          <div className="yr-pills">
            {GOALS.map(g => (
              <button key={g} className={`yr-pill${goal === g.replace(" ","_") ? " active" : ""}`}
                onClick={() => setGoal(g.replace(" ","_"))}>{g}</button>
            ))}
          </div>
        </div>

        {/* Cycle */}
        <div className="yr-quad-row" style={row}>
          <div className="yr-quad-label">
            <div style={lkey}>Cycle-aware training</div>
            <div style={lval}>{cycling ? "on" : "off"}</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button onClick={() => setCycling(c => !c)} style={{
              width:52, height:30, borderRadius:999, border:"1px solid var(--yr-border)",
              background: cycling ? "var(--phase-accent)" : "var(--yr-surface-2)", position:"relative", cursor:"pointer",
            }}>
              <div style={{ position:"absolute", top:3, left: cycling ? 25 : 3, width:22, height:22, borderRadius:"50%", background:"#fff", transition:"left 0.18s" }} />
            </button>
            <span style={{ fontSize:12, color:"var(--yr-muted)" }}>Adapts workouts to your phase</span>
          </div>
        </div>

        {cycling && (
          <div className="yr-quad-row" style={row}>
            <div className="yr-quad-label"><div style={lkey}>Last period start</div></div>
            <input type="date" className="yr-input" value={cycleStart} onChange={e => setCycleStart(e.target.value)} />
          </div>
        )}

        {/* Equipment */}
        <div className="yr-quad-row" style={row}>
          <div className="yr-quad-label">
            <div style={lkey}>Available equipment</div>
            <div style={lval}>{equipment.length} selected</div>
          </div>
          <div className="yr-pills">
            {EQUIPMENT.map(eq => (
              <button key={eq} className={`yr-pill${equipment.includes(eq) ? " active" : ""}`}
                onClick={() => toggleEquip(eq)}>{eq}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Save */}
      <button onClick={handleSave} style={{
        width:"100%", padding:"14px", border:"none", borderRadius:12, cursor:"pointer",
        background: saved ? "var(--yr-surface-2)" : "var(--phase-accent)",
        color: saved ? "var(--yr-text-2)" : "#0a0a0a",
        fontFamily:"inherit", fontWeight:700, fontSize:14,
      }}>
        {saved ? "Saved" : "Save changes"}
      </button>

      {/* Data */}
      <div style={{ borderTop:"1px solid var(--yr-border)", paddingTop:20 }}>
        <div className="yr-overline">Data & privacy</div>
        <p style={{ fontSize:12, color:"var(--yr-muted)", margin:"8px 0 16px", lineHeight:1.6 }}>
          All data is stored on this device only. Nothing is sent to any server.
        </p>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <button onClick={handleExport} style={{ padding:"9px 16px", borderRadius:10, border:"1px solid var(--yr-border)", background:"transparent", color:"var(--yr-text-2)", cursor:"pointer", fontFamily:"inherit", fontSize:13 }}>
            Export data
          </button>
          <button onClick={handleClearDemos} style={{ padding:"9px 16px", borderRadius:10, border:"1px solid var(--yr-border)", background:"transparent", color: demoCleared !== null ? "var(--phase-accent)" : "var(--yr-text-2)", cursor:"pointer", fontFamily:"inherit", fontSize:13 }}>
            {demoCleared !== null ? `Cleared ${demoCleared} demos` : "Clear demo videos"}
          </button>
          <button onClick={handleClearAll} style={{ padding:"9px 16px", borderRadius:10, border:`1px solid ${clearConfirm ? "#f87171" : "var(--yr-border)"}`, background: clearConfirm ? "rgba(248,113,113,0.1)" : "transparent", color: clearConfirm ? "#f87171" : "var(--yr-muted)", cursor:"pointer", fontFamily:"inherit", fontSize:13 }}>
            {clearConfirm ? "Confirm clear all" : "Clear all data"}
          </button>
          {clearConfirm && <button onClick={() => setClearConfirm(false)} style={{ padding:"9px 16px", borderRadius:10, border:"none", background:"transparent", color:"var(--yr-muted)", cursor:"pointer", fontFamily:"inherit", fontSize:13 }}>Cancel</button>}
        </div>
        <div style={{ marginTop:16, fontSize:11, color:"var(--yr-faint)", lineHeight:1.6 }}>
          Medical disclaimer: YourReset provides wellness guidance for informational purposes only. Not a substitute for professional medical advice. Always consult a qualified healthcare provider before starting any new fitness or nutrition program.
        </div>
      </div>
    </div>
  );
}
