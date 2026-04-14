import React, { useState, useEffect } from 'react';
import { useStore } from './store/StoreContext';
import { getGlobalCSS } from './constants/themes';
import { getMuscleGroups } from './constants/healthData';
import { LiveDot } from './components/common/UIComponents';

// Pages
import { DashboardPage } from './components/dashboard/DashboardPage';
import { WorkoutPage } from './components/workout/WorkoutPage';
import { CyclePage } from './components/cycle/CyclePage';
import { GutPage } from './components/gut/GutPage';
import { ProfilePage } from './components/profile/ProfilePage';

export default function App() {
  const { T, tab, setTab, charType, syncTime } = useStore();
  
  // Theme and Day logic for background/header
  const MUSCLE_GROUPS = getMuscleGroups(T);
  const day = MUSCLE_GROUPS[0]; // Header color typically follows the first group or a default

  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      <style>{getGlobalCSS(T)}</style>

      {/* Ambient blobs */}
      <div style={{
        position: "fixed", top: "-25%", left: "-15%", width: "55%", height: "65%",
        background: `radial-gradient(ellipse,${day.color}0e 0%,transparent 70%)`, pointerEvents: "none", zIndex: 0
      }} />
      <div style={{
        position: "fixed", bottom: "-20%", right: "-10%", width: "50%", height: "60%",
        background: `radial-gradient(ellipse,${T.teal}09 0%,transparent 70%)`, pointerEvents: "none", zIndex: 0
      }} />

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "18px 14px 80px", position: "relative", zIndex: 1 }}>

        {/* ═══ HEADER ═══ */}
        <div className="fu d0" style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          marginBottom: 18, gap: 10, flexWrap: "wrap"
        }}>
          <div>
            <h1 style={{
              fontFamily: "'Outfit',sans-serif", fontWeight: 900,
              fontSize: "clamp(1.5rem, 5vw, 2.1rem)", letterSpacing: "-0.04em", lineHeight: 1.1
            }}>
              Health <span style={{ color: day.color }}>Live</span>
            </h1>
            <p style={{
              fontSize: "0.67rem", color: T.muted, marginTop: 4,
              display: "flex", alignItems: "center", fontFamily: "'JetBrains Mono',monospace"
            }}>
              <LiveDot T={T} />Synced {syncTime?.toLocaleTimeString()} · auto-refresh 30s
            </p>
          </div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{
              background: `${T.pink}18`, border: `1px solid ${T.pink}33`,
              borderRadius: 50, padding: "5px 13px", fontSize: "0.67rem", fontWeight: 700, color: T.pink
            }}>
              🌱 Follicular · Day 7
            </div>
          </div>
        </div>

        {/* ═══ TOP TAB NAVIGATION ═══ */}
        <div className="fu d1" style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 6 }}>
          {[
            { k: "dashboard", l: "Dashboard" },
            { k: "plan", l: "Workout" },
            { k: "cycle", l: "Cycle" },
            { k: "gut", l: "Gut Health" },
            { k: "profile", l: "Profile" },
          ].map(({ k, l }) => (
            <button key={k} onClick={() => setTab(k)} style={{
              padding: "10px 18px", borderRadius: 12, border: "none",
              background: tab === k ? day.color : T.card,
              color: tab === k ? "#fff" : T.muted,
              fontSize: "0.85rem", fontWeight: 800, cursor: "pointer",
              boxShadow: tab === k ? `0 4px 18px ${day.color}44` : "none",
              transition: "all 0.2s", whiteSpace: "nowrap"
            }}>{l}</button>
          ))}
        </div>

        {/* ═══ PAGE CONTENT ═══ */}
        {tab === "dashboard" && <DashboardPage />}
        {tab === "plan" && <WorkoutPage />}
        {tab === "cycle" && <CyclePage />}
        {tab === "gut" && <GutPage />}
        {tab === "profile" && <ProfilePage />}

      </div>
    </div>
  );
}
