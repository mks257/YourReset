import { useState, useEffect } from "react";
import * as Storage from "./storage";
import { getCycleState, PHASE_EMOJI, buildPhaseNote } from "./cycleEngine";
import { WEEK_PLAN, HEALTH_SNAPSHOT, SWAP_LIBRARY, SWAP_LIBRARY_BANDS, DAY_TEMPLATES } from "./workoutData";
import { getExerciseDB, isDBReady } from "./exerciseLibrary";
import Onboarding from "./Onboarding";
import PlanTab from "./components/PlanTab";
import MetricsTab from "./components/MetricsTab";
import CycleTab from "./components/CycleTab";
import NutritionTab from "./components/NutritionTab";
import SettingsPage from "./components/SettingsPage";
import GutResetTab from "./components/GutResetTab";
import ExerciseModal from "./components/ExerciseModal";

// Warm, muted phase themes — not neon
export const PHASE_THEME = {
  menstrual:    { accent:"#d98aa8", soft:"rgba(217,138,168,0.14)", border:"rgba(217,138,168,0.26)", label:"Restore & Renew" },
  follicular:   { accent:"#9bd8b4", soft:"rgba(155,216,180,0.13)", border:"rgba(155,216,180,0.25)", label:"Build & Challenge" },
  ovulatory:    { accent:"#f2bd73", soft:"rgba(242,189,115,0.14)", border:"rgba(242,189,115,0.27)", label:"Peak & Power" },
  luteal_early: { accent:"#b79cff", soft:"rgba(183,156,255,0.13)", border:"rgba(183,156,255,0.25)", label:"Stabilize & Sustain" },
  luteal_late:  { accent:"#b79cff", soft:"rgba(183,156,255,0.11)", border:"rgba(183,156,255,0.22)", label:"Wind Down" },
  nonCycle:     { accent:"#8cc8ff", soft:"rgba(140,200,255,0.13)", border:"rgba(140,200,255,0.25)", label:"Training Focus" },
};

// Phase-aware coaching copy — no "Push it", readiness-aware
const PHASE_COPY = {
  menstrual:    "Honor your body this phase. Gentle movement reduces discomfort and keeps energy steady.",
  follicular:   "Energy often rises here. If readiness feels good, this is a strong day for progressive overload.",
  ovulatory:    "Warm up thoroughly. If you feel strong, peak-effort work is well-supported right now.",
  luteal_early: "Maintain your training. Steady-state work and technique sessions feel natural this phase.",
  luteal_late:  "Adjust intensity if symptoms rise. Rest is part of the plan — not a setback.",
  nonCycle:     "Today is built around your goal, equipment, and recent training log.",
};

const NAV = [
  { id:"plan",      icon:"◈",  label:"Today" },
  { id:"metrics",   icon:"↗",  label:"Progress" },
  { id:"cycle",     icon:"◎",  label:"Cycle" },
  { id:"nutrition", icon:"✦",  label:"Fuel" },
  { id:"gut",       icon:"○",  label:"Gut" },
  { id:"settings",  icon:"≡",  label:"You" },
];

function LiveDot() {
  return (
    <span style={{ position:"relative", display:"inline-flex", width:6, height:6, flexShrink:0 }}>
      <span style={{ position:"absolute", inset:0, borderRadius:"50%", background:"var(--yr-sage)", animation:"ping 2.5s ease infinite", opacity:0.4 }} />
      <span style={{ position:"absolute", inset:0, borderRadius:"50%", background:"var(--yr-sage)" }} />
    </span>
  );
}

export default function App() {
  const [profile, setProfile]   = useState(() => Storage.get('profile', null));
  const [tab, setTab]           = useState("plan");
  const [selectedDay, setSelectedDay] = useState(0);
  const weekKey = Storage.getWeekKey();
  const [done, setDone]         = useState(() => Storage.get(`done_${weekKey}`, {}));
  const [swapped, setSwapped]   = useState(() => Storage.get(`swaps_${weekKey}`, {}));
  const [modal, setModal]       = useState(null);
  const [liveData, setLiveData] = useState(HEALTH_SNAPSHOT);
  const [readiness, setReadiness]         = useState(() => Storage.get(`readiness_${Storage.getTodayKey()}`, null));
  const [showReadiness, setShowReadiness] = useState(false);

  const cycleState = profile?.cycleTracking
    ? getCycleState(profile.cycleStartDate, profile.cycleLength)
    : null;

  const theme = cycleState ? (PHASE_THEME[cycleState.phase] || PHASE_THEME.nonCycle) : PHASE_THEME.nonCycle;
  const phaseCopy = cycleState ? (PHASE_COPY[cycleState.phase] || PHASE_COPY.nonCycle) : PHASE_COPY.nonCycle;

  // Push phase tokens to CSS root
  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty("--phase-accent", theme.accent);
    r.style.setProperty("--phase-soft",   theme.soft);
    r.style.setProperty("--phase-border", theme.border);
  }, [theme.accent]);

  useEffect(() => { Storage.set(`done_${weekKey}`,  done);    }, [done,    weekKey]);
  useEffect(() => { Storage.set(`swaps_${weekKey}`, swapped); }, [swapped, weekKey]);
  useEffect(() => { if (readiness) Storage.set(`readiness_${Storage.getTodayKey()}`, readiness); }, [readiness]);

  // Kick off DB fetch in background on mount — module cache means this only runs once
  const [dbReady, setDbReady] = useState(false);
  useEffect(() => {
    if (isDBReady()) { setDbReady(true); return; }
    getExerciseDB().then(() => setDbReady(true));
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setLiveData(p => ({
        ...p,
        steps: p.steps + Math.floor(Math.random() * 55),
        kcal:  p.kcal  + Math.floor(Math.random() * 7),
      }));
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const handleOnboardingComplete = (p) => { Storage.set('profile', p); setProfile(p); };
  if (!profile) return <Onboarding onComplete={handleOnboardingComplete} />;

  const day = WEEK_PLAN[selectedDay];
  const navItems = NAV.filter(n => n.id !== "cycle" || profile?.cycleTracking);
  const phaseNote = modal && cycleState ? buildPhaseNote(modal.type, cycleState.intensity) : null;

  const today = new Date().toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" });
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <div className="app-shell">

        {/* ── Header: name + date, day pill ── */}
        <header className="yr-header fade-in">
          <div>
            <h1 className="yr-title">
              {profile.name}<span style={{ color:"var(--phase-accent)" }}>'s</span> Reset
            </h1>
            <p className="yr-date">{today}</p>
          </div>
          {cycleState && (
            <div className="yr-day-pill">Day {cycleState.dayOfCycle}</div>
          )}
        </header>

        {/* ── Tab content ── */}
        {tab === "plan" && (
          <PlanTab
            day={day} selectedDay={selectedDay} setSelectedDay={setSelectedDay}
            done={done} setDone={setDone} setModal={setModal}
            readiness={readiness} showReadiness={showReadiness}
            setReadiness={setReadiness} setShowReadiness={setShowReadiness}
            cycleState={cycleState} profile={profile} weekKey={weekKey}
            theme={theme} phaseCopy={phaseCopy} liveData={liveData}
            gender={profile?.gender || "female"}
            dbReady={dbReady}
            swapped={swapped}
            onSwap={(exId, explicitSwap) => {
              // explicitSwap: user-chosen alternative from substitution picker
              // otherwise: equipment-based swap from SWAP_LIBRARY
              const hasBands = (profile?.equipment || []).includes("bands");
              const swap = explicitSwap
                || (hasBands && SWAP_LIBRARY_BANDS[exId])
                || SWAP_LIBRARY[exId];
              if (swap) setSwapped(p => ({ ...p, [`${selectedDay}-${exId}`]: swap }));
            }}
            onUndoSwap={(exId) => setSwapped(p => {
              const next = { ...p };
              delete next[`${selectedDay}-${exId}`];
              return next;
            })}
          />
        )}
        {tab === "metrics"   && <MetricsTab liveData={liveData} />}
        {tab === "cycle"     && <CycleTab
            cycleState={cycleState}
            profile={profile}
            onResetProfile={() => { Storage.set('profile', null); setProfile(null); }}
            onUpdateProfile={(updates) => {
              // Read latest from localStorage so rapid calls chain correctly
              // (React state is async; localStorage is synchronous)
              const current = Storage.get('profile', {});
              const p = { ...current, ...updates };
              Storage.set('profile', p);
              setProfile(p);
            }}
          />}
        {tab === "nutrition" && <NutritionTab cycleState={cycleState} profile={profile} />}
        {tab === "gut"       && <GutResetTab profile={profile} cycleState={cycleState} />}
        {tab === "settings"  && <SettingsPage profile={profile} onSave={(p) => { Storage.set('profile', p); setProfile(p); }} />}
      </div>

      {/* ── Bottom nav ── */}
      <nav className="bottom-nav" style={{ gridTemplateColumns:`repeat(${navItems.length}, 1fr)` }}>
        {navItems.map(n => (
          <button key={n.id} className={`nav-btn${tab === n.id ? " active" : ""}`} onClick={() => setTab(n.id)}>
            <span className="nav-icon">{n.icon}</span>
            {n.label}
          </button>
        ))}
      </nav>

      {/* ── Exercise modal ── */}
      {modal && (() => {
        const doneKey = modal._doneKey || `${selectedDay}-${modal.id}`;
        return (
          <ExerciseModal
            ex={modal} dayColor={theme.accent}
            onClose={() => setModal(null)}
            isDone={!!done[doneKey]}
            onToggleDone={() => setDone(p => ({ ...p, [doneKey]: !p[doneKey] }))}
            selectedDay={selectedDay} weekKey={weekKey} phaseNote={phaseNote}
            gender={profile?.gender || "female"}
          />
        );
      })()}
    </>
  );
}
