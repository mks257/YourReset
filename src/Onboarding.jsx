import { useState } from "react";

const T = {
  bg: "#080912", card: "#0f1020", card2: "#141528", border: "rgba(255,255,255,0.07)",
  pink: "#ff6b9d", teal: "#38d9c0", amber: "#ffb347", violet: "#b48bfa",
  green: "#5eead4", text: "#f0eeff", muted: "#6b6a88",
};

const GOALS = [
  { id: "fat_loss", label: "Lose fat", icon: "🔥" },
  { id: "strength", label: "Build strength", icon: "💪" },
  { id: "wellness", label: "General wellness", icon: "🌿" },
  { id: "endurance", label: "Improve endurance", icon: "🏃" },
];

const EQUIPMENT_OPTIONS = [
  { id: "bodyweight", label: "Bodyweight only", icon: "🤸" },
  { id: "dumbbells", label: "Dumbbells", icon: "🏋️" },
  { id: "barbell", label: "Barbell", icon: "⚖️" },
  { id: "bands", label: "Resistance bands", icon: "🔁" },
  { id: "kettlebell", label: "Kettlebell", icon: "🫙" },
  { id: "machines", label: "Gym machines", icon: "🏟️" },
  { id: "cable", label: "Cable machine", icon: "🔗" },
  { id: "cardio", label: "Cardio equipment", icon: "🚴" },
];

const inp = {
  width: "100%", padding: "11px 14px", borderRadius: 12,
  border: `1px solid ${T.border}`, background: T.card2,
  color: T.text, fontFamily: "'Outfit',sans-serif", fontSize: "0.9rem",
  outline: "none", boxSizing: "border-box",
};

const btn = (active, color = T.pink) => ({
  padding: "10px 14px", borderRadius: 12, cursor: "pointer",
  border: `1px solid ${active ? color : T.border}`,
  background: active ? `${color}18` : T.card2,
  color: active ? color : T.muted,
  fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: "0.82rem",
  transition: "all 0.15s", display: "flex", alignItems: "center", gap: 6,
});

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [gender, setGender] = useState("");
  const [cycleOption, setCycleOption] = useState(""); // "track" | "none"
  const [cycleStart, setCycleStart] = useState("");
  const [cycleLength, setCycleLength] = useState(28);
  const [equipment, setEquipment] = useState(["dumbbells", "machines", "cardio"]);

  const toggleEquip = (id) =>
    setEquipment(e => e.includes(id) ? e.filter(x => x !== id) : [...e, id]);

  const next = () => setStep(s => s + 1);

  const finish = () => {
    onComplete({
      name: name.trim() || "You",
      goal,
      gender,
      cycleTracking: cycleOption === "track" && gender === "female",
      cycleStartDate: cycleOption === "track" ? cycleStart : null,
      cycleLength: cycleOption === "track" ? cycleLength : null,
      equipment,
    });
  };

  const STEPS = [
    // Step 0: Name + Goal
    <div key="step0">
      <div style={{ fontSize: "2rem", marginBottom: 8 }}>👋</div>
      <h2 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: "1.5rem", marginBottom: 6 }}>
        Welcome to <span style={{ color: T.pink }}>YourReset</span>
      </h2>
      <p style={{ color: T.muted, fontSize: "0.85rem", marginBottom: 24, lineHeight: 1.6 }}>
        Let's personalize your experience. Takes about 30 seconds.
      </p>
      <label style={{ fontSize: "0.72rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Your name</label>
      <input
        style={{ ...inp, marginTop: 6, marginBottom: 20 }}
        placeholder="e.g. Kavya"
        value={name}
        onChange={e => setName(e.target.value)}
        autoFocus
      />
      <label style={{ fontSize: "0.72rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Primary goal</label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
        {GOALS.map(g => (
          <button key={g.id} style={btn(goal === g.id)} onClick={() => setGoal(g.id)}>
            <span>{g.icon}</span> {g.label}
          </button>
        ))}
      </div>
      <button
        onClick={next}
        disabled={!goal}
        style={{ marginTop: 24, width: "100%", padding: "13px 0", borderRadius: 14, border: "none", cursor: goal ? "pointer" : "not-allowed", background: goal ? `linear-gradient(135deg,${T.pink},${T.violet})` : T.card2, color: goal ? "#fff" : T.muted, fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "0.95rem", transition: "all 0.2s" }}
      >Continue →</button>
    </div>,

    // Step 1: Gender
    <div key="step1">
      <div style={{ fontSize: "2rem", marginBottom: 8 }}>🧑</div>
      <h2 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: "1.4rem", marginBottom: 6 }}>
        What's your gender?
      </h2>
      <p style={{ color: T.muted, fontSize: "0.82rem", marginBottom: 20, lineHeight: 1.6 }}>
        This helps us tailor your health tracking and physiological baselines.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {[
          { id: "female", label: "Female", icon: "👩" },
          { id: "male", label: "Male", icon: "👨" },
          { id: "other", label: "Non-binary / Other", icon: "🧑" },
        ].map(opt => (
          <button key={opt.id} onClick={() => setGender(opt.id)} style={{
            ...btn(gender === opt.id), justifyContent: "flex-start", padding: "14px 16px",
          }}>
            <span style={{ fontSize: "1.2rem" }}>{opt.icon}</span> {opt.label}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setStep(0)} style={{ flex: 1, padding: "12px 0", borderRadius: 14, border: `1px solid ${T.border}`, background: "transparent", color: T.muted, fontFamily: "'Outfit',sans-serif", fontWeight: 700, cursor: "pointer" }}>← Back</button>
        <button
          onClick={() => {
            if (gender === "female") setStep(2);
            else { setCycleOption("none"); setStep(3); }
          }}
          disabled={!gender}
          style={{ flex: 2, padding: "12px 0", borderRadius: 14, border: "none", cursor: gender ? "pointer" : "not-allowed", background: gender ? `linear-gradient(135deg,${T.pink},${T.violet})` : T.card2, color: gender ? "#fff" : T.muted, fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "0.95rem", transition: "all 0.2s" }}
        >Continue →</button>
      </div>
    </div>,

    // Step 2: Cycle info
    <div key="step2">
      <div style={{ fontSize: "2rem", marginBottom: 8 }}>🌸</div>
      <h2 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: "1.4rem", marginBottom: 6 }}>
        Cycle-aware training
      </h2>
      <p style={{ color: T.muted, fontSize: "0.82rem", marginBottom: 20, lineHeight: 1.6 }}>
        YourReset adapts your workouts to your hormonal cycle. No mainstream app does this — it's your moat.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {[
          { id: "track", label: "Yes, I track my cycle", sub: "We'll adapt workouts to your phase", icon: "🌱" },
          { id: "none", label: "No / I use hormonal contraception", sub: "You'll get standard adaptive plans", icon: "⚡" },
        ].map(opt => (
          <button key={opt.id} onClick={() => setCycleOption(opt.id)} style={{
            ...btn(cycleOption === opt.id), flexDirection: "column", alignItems: "flex-start",
            padding: "14px 16px", gap: 4,
          }}>
            <span style={{ display: "flex", gap: 8, alignItems: "center" }}>{opt.icon} {opt.label}</span>
            <span style={{ fontSize: "0.72rem", color: T.muted, fontWeight: 400 }}>{opt.sub}</span>
          </button>
        ))}
      </div>

      {cycleOption === "track" && (
        <div style={{ background: T.card2, borderRadius: 14, padding: "16px", marginBottom: 16 }}>
          <label style={{ fontSize: "0.72rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            First day of last period
          </label>
          <input type="date" value={cycleStart} onChange={e => setCycleStart(e.target.value)}
            style={{ ...inp, marginTop: 8, marginBottom: 14 }} />
          <label style={{ fontSize: "0.72rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Cycle length: <strong style={{ color: T.pink }}>{cycleLength} days</strong>
          </label>
          <input type="range" min={21} max={40} value={cycleLength} onChange={e => setCycleLength(+e.target.value)}
            style={{ width: "100%", marginTop: 8, accentColor: T.pink }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.62rem", color: T.muted, marginTop: 2 }}>
            <span>21 days</span><span>40 days</span>
          </div>
          <p style={{ fontSize: "0.68rem", color: T.muted, marginTop: 10, lineHeight: 1.5 }}>
            ⚕️ All suggestions are general wellness guidance, not medical advice. PCOS, endometriosis, or irregular cycles? You can always override any recommendation.
          </p>
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setStep(1)} style={{ flex: 1, padding: "12px 0", borderRadius: 14, border: `1px solid ${T.border}`, background: "transparent", color: T.muted, fontFamily: "'Outfit',sans-serif", fontWeight: 700, cursor: "pointer" }}>← Back</button>
        <button
          onClick={next}
          disabled={!cycleOption || (cycleOption === "track" && !cycleStart)}
          style={{ flex: 2, padding: "12px 0", borderRadius: 14, border: "none", cursor: (cycleOption && !(cycleOption === "track" && !cycleStart)) ? "pointer" : "not-allowed", background: (cycleOption && !(cycleOption === "track" && !cycleStart)) ? `linear-gradient(135deg,${T.pink},${T.violet})` : T.card2, color: (cycleOption && !(cycleOption === "track" && !cycleStart)) ? "#fff" : T.muted, fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "0.95rem", transition: "all 0.2s" }}
        >Continue →</button>
      </div>
    </div>,

    // Step 3: Equipment
    <div key="step3">
      <div style={{ fontSize: "2rem", marginBottom: 8 }}>🏋️</div>
      <h2 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: "1.4rem", marginBottom: 6 }}>
        What equipment do you have?
      </h2>
      <p style={{ color: T.muted, fontSize: "0.82rem", marginBottom: 20, lineHeight: 1.6 }}>
        Select everything available to you. We'll build plans around what you have.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }}>
        {EQUIPMENT_OPTIONS.map(eq => (
          <button key={eq.id} style={btn(equipment.includes(eq.id), T.teal)} onClick={() => toggleEquip(eq.id)}>
            <span>{eq.icon}</span> {eq.label}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setStep(gender === "female" ? 2 : 1)} style={{ flex: 1, padding: "12px 0", borderRadius: 14, border: `1px solid ${T.border}`, background: "transparent", color: T.muted, fontFamily: "'Outfit',sans-serif", fontWeight: 700, cursor: "pointer" }}>← Back</button>
        <button
          onClick={finish}
          disabled={equipment.length === 0}
          style={{ flex: 2, padding: "12px 0", borderRadius: 14, border: "none", cursor: equipment.length > 0 ? "pointer" : "not-allowed", background: equipment.length > 0 ? `linear-gradient(135deg,${T.teal},${T.violet})` : T.card2, color: equipment.length > 0 ? "#fff" : T.muted, fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "0.95rem", transition: "all 0.2s" }}
        >Let's go 🚀</button>
      </div>
    </div>,
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap'); *{box-sizing:border-box;margin:0;padding:0} body{background:${T.bg};color:${T.text}}`}</style>
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Progress dots */}
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 28 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{ width: i === step ? 20 : 8, height: 8, borderRadius: 100, background: i <= step ? T.pink : T.card2, transition: "all 0.3s" }} />
          ))}
        </div>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 24, padding: "28px 24px" }}>
          {STEPS[step]}
        </div>
      </div>
    </div>
  );
}
