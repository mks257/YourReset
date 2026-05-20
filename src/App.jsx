import { useState, useEffect, useMemo } from "react";
import * as Storage from "./storage";
import { getCycleState, buildPhaseNote } from "./cycleEngine";
import { WEEK_PLAN, HEALTH_SNAPSHOT, SWAP_LIBRARY, SWAP_LIBRARY_BANDS } from "./workoutData";
import { getExerciseDB, isDBReady } from "./exerciseLibrary";
import Onboarding from "./Onboarding";
import PlanTab from "./components/PlanTab";
import MetricsTab from "./components/MetricsTab";
import CycleTab from "./components/CycleTab";
import NutritionTab from "./components/NutritionTab";
import GutResetTab from "./components/GutResetTab";
import SettingsPage from "./components/SettingsPage";
import ExerciseModal from "./components/ExerciseModal";
import BackgroundAtmosphere from "./components/BackgroundAtmosphere";
import FriendsTab from "./components/FriendsTab";
import { useTweaks } from "./components/MotionHooks";

const TWEAK_DEFAULTS = {
  direction: "editorial",
  theme: "dark",
  density: "balanced",
  phase: "follicular",
  motion: "full",
};

const PHASE_ACCENT_MAP = {
  menstrual:    "#d98aa8",
  follicular:   "#9bd8b4",
  ovulatory:    "#f2bd73",
  luteal:       "#b79cff",
  luteal_early: "#b79cff",
  luteal_late:  "#b79cff",
  other:        "#8cc8ff",
};

const TABS = [
  { id:"today",    letter:"T", label:"Today" },
  { id:"progress", letter:"P", label:"Progress" },
  { id:"cycle",    letter:"C", label:"Cycle" },
  { id:"fuel",     letter:"F", label:"Fuel" },
  { id:"gut",      letter:"G", label:"Gut" },
  { id:"friends",  letter:"Fd", label:"Friends" },
  { id:"you",      letter:"Y", label:"You" },
];

// ── Tweaks panel ─────────────────────────────────────────────────────────
function TweaksPanel({ tweaks, setTweak }) {
  const [open, setOpen] = useState(false);
  const directions = [
    { key:"editorial", label:"Editorial" },
    { key:"bento",     label:"Bento" },
    { key:"calm",      label:"Calm" },
    { key:"brutalist", label:"Brutalist" },
    { key:"phase",     label:"Phase-First" },
  ];
  const phases = [
    { value:"menstrual",  label:"Menstrual" },
    { value:"follicular", label:"Follicular" },
    { value:"ovulatory",  label:"Ovulatory" },
    { value:"luteal",     label:"Luteal" },
  ];
  const tw = { color:"var(--yr-muted)", fontSize:11, fontFamily:"var(--font-mono)", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:6 };
  const pill = (active) => ({
    border:`1px solid ${active ? "var(--phase-accent)" : "var(--yr-border)"}`,
    background: active ? "var(--phase-soft)" : "transparent",
    color: active ? "var(--phase-accent)" : "var(--yr-text-2)",
    borderRadius:999, padding:"5px 12px", fontSize:12, cursor:"pointer",
  });

  return (
    <>
      <button onClick={() => setOpen(o => !o)} style={{
        position:"fixed", bottom:72, right:16, zIndex:60,
        background:"var(--yr-bg-elev)", border:"1px solid var(--yr-border)",
        borderRadius:999, padding:"7px 14px", color:"var(--yr-text-2)",
        fontSize:11, fontFamily:"var(--font-mono)", cursor:"pointer",
        backdropFilter:"blur(12px)",
      }}>tweaks</button>
      {open && (
        <div style={{
          position:"fixed", bottom:110, right:16, zIndex:60,
          background:"var(--yr-bg-elev)", border:"1px solid var(--yr-border)",
          borderRadius:16, padding:20, width:260, display:"flex", flexDirection:"column", gap:16,
          boxShadow:"0 16px 48px rgba(0,0,0,0.4)",
        }}>
          <div>
            <div style={tw}>Direction</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {directions.map(d => (
                <button key={d.key} style={pill(tweaks.direction === d.key)} onClick={() => setTweak("direction", d.key)}>{d.label}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={tw}>Theme</div>
            <div style={{ display:"flex", gap:6 }}>
              {["dark","light"].map(t => (
                <button key={t} style={pill(tweaks.theme === t)} onClick={() => setTweak("theme", t)}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={tw}>Phase accent</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {phases.map(p => (
                <button key={p.value} style={pill(tweaks.phase === p.value)} onClick={() => setTweak("phase", p.value)}>{p.label}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={tw}>Motion</div>
            <div style={{ display:"flex", gap:6 }}>
              {["off","reduced","full"].map(m => (
                <button key={m} style={pill(tweaks.motion === m)} onClick={() => setTweak("motion", m)}>{m}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [profile, setProfile] = useState(() => Storage.get("profile", null));
  const [tab, setTab]         = useState("today");
  const weekKey = Storage.getWeekKey();
  const [done, setDone]       = useState(() => Storage.get(`done_${weekKey}`, {}));
  const [swapped, setSwapped] = useState(() => Storage.get(`swaps_${weekKey}`, {}));
  const [modal, setModal]     = useState(null);
  const [liveData, setLiveData] = useState(HEALTH_SNAPSHOT);
  const [readiness, setReadiness]           = useState(() => Storage.get(`readiness_${Storage.getTodayKey()}`, null));
  const [showReadiness, setShowReadiness]   = useState(false);
  const [dbReady, setDbReady] = useState(false);

  const cycleState = profile?.cycleTracking
    ? getCycleState(profile.cycleStartDate, profile.cycleLength)
    : null;

  // Apply design system tokens to root
  useEffect(() => {
    const r = document.documentElement;
    r.setAttribute("data-theme",     tweaks.theme);
    r.setAttribute("data-direction", tweaks.direction);
    r.setAttribute("data-density",   tweaks.density);
    r.setAttribute("data-motion",    tweaks.motion || "full");
    const phaseKey = tweaks.phase || cycleState?.phase || "follicular";
    const accent = PHASE_ACCENT_MAP[phaseKey] || PHASE_ACCENT_MAP.follicular;
    r.style.setProperty("--phase-accent", accent);
    r.style.setProperty("--phase-soft", `color-mix(in oklch, ${accent} 14%, transparent)`);
  }, [tweaks, cycleState?.phase]);

  useEffect(() => { Storage.set(`done_${weekKey}`,  done);    }, [done,    weekKey]);
  useEffect(() => { Storage.set(`swaps_${weekKey}`, swapped); }, [swapped, weekKey]);
  useEffect(() => { if (readiness) Storage.set(`readiness_${Storage.getTodayKey()}`, readiness); }, [readiness]);

  useEffect(() => {
    const id = setInterval(() => {
      setLiveData(p => ({ ...p, steps: p.steps + Math.floor(Math.random() * 55), kcal: p.kcal + Math.floor(Math.random() * 7) }));
    }, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (isDBReady()) { setDbReady(true); return; }
    getExerciseDB().then(() => setDbReady(true));
  }, []);

  const handleOnboardingComplete = (p) => { Storage.set("profile", p); setProfile(p); };


  const day = WEEK_PLAN[new Date().getDay()];
  const visibleTabs = TABS.filter(t => t.id !== "cycle" || profile?.cycleTracking);
  const phaseNote = modal && cycleState ? buildPhaseNote(modal.type, cycleState.intensity) : null;

  const onSwap = (exId, explicitSwap) => {
    const hasBands = (profile?.equipment || []).includes("bands");
    const swap = explicitSwap || (hasBands && SWAP_LIBRARY_BANDS?.[exId]) || SWAP_LIBRARY[exId];
    if (swap) {
      setSwapped(p => ({ ...p, [`${new Date().getDay()}-${exId}`]: swap }));
      Storage.pushHistory({ id: exId, type: "swap", name: swap.name, originalId: exId });
      Storage.recordSubstitution(exId);
    }
  };
  const onUndoSwap = (exId) => setSwapped(p => { const n = {...p}; delete n[`${new Date().getDay()}-${exId}`]; return n; });
  const onUpdateProfile = (updates) => {
    const current = Storage.get("profile", {});
    const p = { ...current, ...updates };
    Storage.set("profile", p);
    setProfile(p);
  };

  const replayKey = `${tab}:${tweaks.direction}:${tweaks.motion}`;

  return (
    <div className="yr-app">
      <BackgroundAtmosphere />
      {/* Header */}
      <header className="yr-header">
        <div className="yr-header-inner">
          <div className="yr-brand">
            <div className="yr-brand-mark">YR</div>
            <div className="yr-brand-name"><b>{profile?.name || "YourReset"}</b>{profile ? <span>'s Reset</span> : null}</div>
          </div>
          <button className="yr-theme-toggle" onClick={() => setTweak("theme", tweaks.theme === "dark" ? "light" : "dark")}>
            {tweaks.theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>
        {/* Desktop tab bar */}
        <div className="yr-tabbar">
          <div className="yr-tabbar-inner">
            {visibleTabs.map(t => (
              <button key={t.id} className={`yr-tab${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="yr-shell">
        <main className="yr-main yr-tab-fade" key={replayKey}>
  {!profile ? (
    <Onboarding onComplete={handleOnboardingComplete} />
  ) : (
    <>
      {tab === "today" && (
        <PlanTab
          day={day}
          selectedDay={new Date().getDay()}
          setSelectedDay={() => {}}
          done={done}
          setDone={setDone}
          setModal={setModal}
          readiness={readiness}
          showReadiness={showReadiness}
          setReadiness={setReadiness}
          setShowReadiness={setShowReadiness}
          cycleState={cycleState}
          profile={profile}
          weekKey={weekKey}
          swapped={swapped}
          onSwap={onSwap}
          onUndoSwap={onUndoSwap}
          dbReady={dbReady}
          motion={tweaks.motion}
          onGoToFuel={() => setTab("fuel")}
        />
      )}
      {tab === "progress" && (
        <MetricsTab liveData={liveData} motion={tweaks.motion} />
      )}
      {tab === "cycle" && profile?.cycleTracking && (
        <CycleTab
          cycleState={cycleState}
          profile={profile}
          readiness={readiness}
          setReadiness={setReadiness}
          onResetProfile={() => { Storage.set("profile", null); setProfile(null); }}
          onUpdateProfile={onUpdateProfile}
          motion={tweaks.motion}
        />
      )}
      {tab === "fuel" && (
        <NutritionTab cycleState={cycleState} profile={profile} motion={tweaks.motion} onProfileUpdate={onUpdateProfile} />
      )}
      {tab === "gut" && (
        <GutResetTab profile={profile} cycleState={cycleState} motion={tweaks.motion} />
      )}
      {tab === "friends" && (
        <FriendsTab mySteps={liveData.steps} myName={profile?.name || "You"} />
      )}
      {tab === "you" && (
        <SettingsPage profile={profile} onSave={(p) => { Storage.set("profile", p); setProfile(p); }} />
      )}
    </>
  )}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="yr-mobile-nav">
        {visibleTabs.map(t => (
          <button key={t.id} className={`yr-mnav-btn${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>
            <span className="yr-mnav-letter">{t.letter}</span>
            <span className="yr-mnav-label">{t.label}</span>
          </button>
        ))}
      </nav>

      {/* Tweaks */}
      <TweaksPanel tweaks={tweaks} setTweak={setTweak} />

      {/* Exercise modal */}
      {modal && (() => {
        const doneKey = modal._doneKey || `${new Date().getDay()}-${modal.id}`;
        return (
          <ExerciseModal ex={modal} dayColor="var(--phase-accent)" onClose={() => setModal(null)}
            isDone={!!done[doneKey]} 
            onToggleDone={() => {
              const newState = !done[doneKey];
              setDone(p => ({ ...p, [doneKey]: newState }));
              if (newState) {
                Storage.pushHistory({ id: modal.id, name: modal.name, type: "completion", kcal: modal.kcal });
              }
            }}
            selectedDay={new Date().getDay()} weekKey={weekKey} phaseNote={phaseNote}
            gender={profile?.gender || "female"} />
        );
      })()}
    </div>
  );
}
