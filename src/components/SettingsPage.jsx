import { useState } from "react";
import * as Storage from "../storage";

const GOALS      = ["fat loss","muscle tone","endurance","strength","flexibility","wellness"];
const EQUIPMENT  = ["bodyweight","dumbbells","barbell","bands","kettlebell","machines","cable","cardio"];
const GENDERS    = ["female","male","non-binary","prefer not to say"];
const ACTIVITIES = [
  { id:"sedentary",   label:"Sedentary",   sub:"desk job, no exercise" },
  { id:"light",       label:"Light",       sub:"1–3 days/week" },
  { id:"moderate",    label:"Moderate",    sub:"3–5 days/week" },
  { id:"active",      label:"Active",      sub:"6–7 days/week" },
  { id:"very_active", label:"Very Active", sub:"2× daily / hard labour" },
];

export default function SettingsPage({ profile, onSave }) {
  // Existing fields
  const [name,      setName]      = useState(profile.name || "");
  const [goal,      setGoal]      = useState(profile.goal || "fat_loss");
  const [cycling,   setCycling]   = useState(profile.cycleTracking || false);
  const [cycleStart,setCycleStart]= useState(profile.cycleStartDate || "");
  const [cycleLen,  setCycleLen]  = useState(profile.cycleLength || 28);
  const [equipment, setEquipment] = useState(profile.equipment || []);

  // Body metrics
  const [gender,        setGender]        = useState(profile.gender        || "female");
  const [age,           setAge]           = useState(profile.age           || "");
  const [weight,        setWeight]        = useState(profile.weight        || "");
  const [weightUnit,    setWeightUnit]    = useState(profile.weightUnit    || "kg");
  const [goalWeight,    setGoalWeight]    = useState(profile.goalWeight    || "");
  const [heightUnit,    setHeightUnit]    = useState(profile.heightUnit    || "cm");
  // Height stored as cm (if cm mode) or total inches (if ft mode), via two sub-fields
  const [heightCm,  setHeightCm]  = useState(() =>
    profile.heightUnit === "ft" ? "" : (profile.height || "")
  );
  const [heightFt,  setHeightFt]  = useState(() =>
    profile.heightUnit === "ft" ? Math.floor((profile.height || 0) / 12) || "" : ""
  );
  const [heightIn,  setHeightIn]  = useState(() =>
    profile.heightUnit === "ft" ? (profile.height || 0) % 12 || "" : ""
  );

  // Activity
  const [activityLevel, setActivityLevel] = useState(profile.activityLevel || "moderate");

  const [saved,        setSaved]        = useState(false);
  const [demoCleared,  setDemoCleared]  = useState(null);
  const [clearConfirm, setClearConfirm] = useState(false);

  const toggleEquip = (eq) =>
    setEquipment(prev => prev.includes(eq) ? prev.filter(e => e !== eq) : [...prev, eq]);

  const handleSave = () => {
    const height = heightUnit === "ft"
      ? parseInt(heightFt || 0) * 12 + parseInt(heightIn || 0)
      : parseFloat(heightCm || 0);
    const p = {
      ...profile,
      name, goal,
      cycleTracking: cycling, cycleStartDate: cycleStart, cycleLength: cycleLen,
      equipment,
      gender, age: parseFloat(age) || null,
      weight: parseFloat(weight) || null, weightUnit,
      height: height || null, heightUnit,
      goalWeight: parseFloat(goalWeight) || null,
      activityLevel,
    };
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
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `yourreset-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const handleClearAll = () => {
    if (!clearConfirm) { setClearConfirm(true); return; }
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k?.startsWith("yr_")) keys.push(k); }
    keys.forEach(k => localStorage.removeItem(k));
    window.location.reload();
  };

  const row  = { borderTop: "1px solid var(--yr-border)", paddingTop: 18, paddingBottom: 8 };
  const lkey = { fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--yr-text)" };
  const lval = { fontSize: 12, color: "var(--phase-accent)", fontFamily: "var(--font-mono)" };
  const numInput = (val, onChange, placeholder, width = 90) => (
    <input
      className="yr-input" type="number" value={val}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ width }}
    />
  );

  return (
    <div className="yr-stack-lg">
      <div>
        <div className="yr-overline">Profile</div>
        <h1 className="yr-display" style={{ fontSize: "clamp(32px,5vw,52px)", fontWeight: 500, letterSpacing: "-0.03em", margin: 0 }}>
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
            <div style={lval}>{goal.replace("_", " ")}</div>
          </div>
          <div className="yr-pills">
            {GOALS.map(g => (
              <button key={g} className={`yr-pill${goal === g.replace(" ", "_") ? " active" : ""}`}
                onClick={() => setGoal(g.replace(" ", "_"))}>{g}</button>
            ))}
          </div>
        </div>

        {/* ── Body metrics ──────────────────────────────────────── */}
        <div className="yr-quad-row" style={row}>
          <div className="yr-quad-label">
            <div style={lkey}>Gender</div>
            <div style={lval}>{gender}</div>
          </div>
          <div className="yr-pills">
            {GENDERS.map(g => (
              <button key={g} className={`yr-pill${gender === g ? " active" : ""}`}
                onClick={() => setGender(g)}>{g}</button>
            ))}
          </div>
        </div>

        <div className="yr-quad-row" style={row}>
          <div className="yr-quad-label">
            <div style={lkey}>Age</div>
            {age && <div style={lval}>{age} yrs</div>}
          </div>
          {numInput(age, setAge, "e.g. 28", 80)}
        </div>

        <div className="yr-quad-row" style={row}>
          <div className="yr-quad-label">
            <div style={lkey}>Weight</div>
            {weight && <div style={lval}>{weight} {weightUnit}</div>}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {numInput(weight, setWeight, weightUnit === "kg" ? "e.g. 65" : "e.g. 143")}
            <div className="yr-pills">
              {["kg", "lb"].map(u => (
                <button key={u} className={`yr-pill${weightUnit === u ? " active" : ""}`}
                  onClick={() => setWeightUnit(u)}>{u}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="yr-quad-row" style={row}>
          <div className="yr-quad-label">
            <div style={lkey}>Goal weight</div>
            {goalWeight && <div style={lval}>{goalWeight} {weightUnit}</div>}
          </div>
          {numInput(goalWeight, setGoalWeight, weightUnit === "kg" ? "e.g. 58" : "e.g. 128")}
        </div>

        <div className="yr-quad-row" style={row}>
          <div className="yr-quad-label">
            <div style={lkey}>Height</div>
            {heightUnit === "cm" && heightCm && <div style={lval}>{heightCm} cm</div>}
            {heightUnit === "ft" && heightFt && <div style={lval}>{heightFt}′{heightIn || 0}″</div>}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {heightUnit === "cm" ? (
              numInput(heightCm, setHeightCm, "e.g. 165")
            ) : (
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {numInput(heightFt, setHeightFt, "ft", 52)}
                <span style={{ fontSize: 12, color: "var(--yr-muted)" }}>ft</span>
                {numInput(heightIn, setHeightIn, "in", 52)}
                <span style={{ fontSize: 12, color: "var(--yr-muted)" }}>in</span>
              </div>
            )}
            <div className="yr-pills">
              {["cm", "ft"].map(u => (
                <button key={u} className={`yr-pill${heightUnit === u ? " active" : ""}`}
                  onClick={() => setHeightUnit(u)}>{u}</button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Activity level ────────────────────────────────────── */}
        <div className="yr-quad-row" style={row}>
          <div className="yr-quad-label">
            <div style={lkey}>Activity level</div>
            <div style={lval}>{ACTIVITIES.find(a => a.id === activityLevel)?.label || activityLevel}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {ACTIVITIES.map(a => (
              <button
                key={a.id}
                onClick={() => setActivityLevel(a.id)}
                style={{
                  display: "flex", gap: 10, alignItems: "center",
                  padding: "8px 12px", borderRadius: 10, cursor: "pointer",
                  border: `1px solid ${activityLevel === a.id ? "var(--phase-accent)" : "var(--yr-border)"}`,
                  background: activityLevel === a.id ? "var(--phase-soft)" : "transparent",
                  textAlign: "left",
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: activityLevel === a.id ? "var(--phase-accent)" : "var(--yr-border)", flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: activityLevel === a.id ? "var(--phase-accent)" : "var(--yr-text)" }}>{a.label}</div>
                  <div style={{ fontSize: 11, color: "var(--yr-muted)" }}>{a.sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Cycle ─────────────────────────────────────────────── */}
        <div className="yr-quad-row" style={row}>
          <div className="yr-quad-label">
            <div style={lkey}>Cycle-aware training</div>
            <div style={lval}>{cycling ? "on" : "off"}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setCycling(c => !c)} style={{
              width: 52, height: 30, borderRadius: 999, border: "1px solid var(--yr-border)",
              background: cycling ? "var(--phase-accent)" : "var(--yr-surface-2)", position: "relative", cursor: "pointer",
            }}>
              <div style={{ position: "absolute", top: 3, left: cycling ? 25 : 3, width: 22, height: 22, borderRadius: "50%", background: "#fff", transition: "left 0.18s" }} />
            </button>
            <span style={{ fontSize: 12, color: "var(--yr-muted)" }}>Adapts workouts to your phase</span>
          </div>
        </div>

        {cycling && (
          <div className="yr-quad-row" style={row}>
            <div className="yr-quad-label"><div style={lkey}>Last period start</div></div>
            <input type="date" className="yr-input" value={cycleStart} onChange={e => setCycleStart(e.target.value)} />
          </div>
        )}

        {/* ── Equipment ─────────────────────────────────────────── */}
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
        width: "100%", padding: "14px", border: "none", borderRadius: 12, cursor: "pointer",
        background: saved ? "var(--yr-surface-2)" : "var(--phase-accent)",
        color: saved ? "var(--yr-text-2)" : "#0a0a0a",
        fontFamily: "inherit", fontWeight: 700, fontSize: 14,
      }}>
        {saved ? "Saved ✓" : "Save changes"}
      </button>

      {/* Data & privacy */}
      <div style={{ borderTop: "1px solid var(--yr-border)", paddingTop: 20 }}>
        <div className="yr-overline">Data & privacy</div>
        <p style={{ fontSize: 12, color: "var(--yr-muted)", margin: "8px 0 16px", lineHeight: 1.6 }}>
          All data is stored on this device only. Nothing is sent to any server.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={handleExport} style={{ padding: "9px 16px", borderRadius: 10, border: "1px solid var(--yr-border)", background: "transparent", color: "var(--yr-text-2)", cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>
            Export data
          </button>
          <button onClick={handleClearAll} style={{ padding: "9px 16px", borderRadius: 10, border: `1px solid ${clearConfirm ? "#f87171" : "var(--yr-border)"}`, background: clearConfirm ? "rgba(248,113,113,0.1)" : "transparent", color: clearConfirm ? "#f87171" : "var(--yr-muted)", cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>
            {clearConfirm ? "Confirm clear all" : "Clear all data"}
          </button>
          {clearConfirm && <button onClick={() => setClearConfirm(false)} style={{ padding: "9px 16px", borderRadius: 10, border: "none", background: "transparent", color: "var(--yr-muted)", cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>Cancel</button>}
        </div>
        <div style={{ marginTop: 16, fontSize: 11, color: "var(--yr-faint)", lineHeight: 1.6 }}>
          Medical disclaimer: YourReset provides wellness guidance for informational purposes only. Not a substitute for professional medical advice.
        </div>
      </div>
    </div>
  );
}
