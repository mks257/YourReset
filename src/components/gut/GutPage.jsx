import React, { useState } from 'react';
import { useStore } from '../../store/StoreContext';
import { MicrobiomeCanvas } from './MicrobiomeCanvas';
import { GutVideoCard } from './GutVideoCard';
import { RecipeCard } from './RecipeCard';
import { GUT_STEPS, GUT_SIGNS, GUT_RECIPES, DAILY_CHECKLIST, SYMPTOM_OPTIONS } from '../../constants/gutData';

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MOOD_EMOJIS = ["", "😩", "😕", "😐", "🙂", "😄"];

export function GutPage() {
  const { T, gutWeekLog, setGutWeekLog } = useStore();
  const [activeDay, setActiveDay] = useState((new Date().getDay() + 6) % 7);
  const [expandedStep, setExpandedStep] = useState(null);

  const todayIdx = (new Date().getDay() + 6) % 7;
  const dayData = gutWeekLog[activeDay] || { checked: {}, mood: 0, symptoms: {} };
  const checked = dayData.checked;
  const moodRating = dayData.mood;
  const symptoms = dayData.symptoms;

  const toggleChecked = (itemId) =>
    setGutWeekLog(prev => {
      const cur = prev[activeDay] || { checked: {}, mood: 0, symptoms: {} };
      return { ...prev, [activeDay]: { ...cur, checked: { ...cur.checked, [itemId]: !cur.checked[itemId] } } };
    });

  const setMoodRating = (val) =>
    setGutWeekLog(prev => {
      const cur = prev[activeDay] || { checked: {}, mood: 0, symptoms: {} };
      return { ...prev, [activeDay]: { ...cur, mood: cur.mood === val ? 0 : val } };
    });

  const toggleSymptom = (symId) =>
    setGutWeekLog(prev => {
      const cur = prev[activeDay] || { checked: {}, mood: 0, symptoms: {} };
      return { ...prev, [activeDay]: { ...cur, symptoms: { ...cur.symptoms, [symId]: !cur.symptoms[symId] } } };
    });

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const checkPct = Math.round((checkedCount / DAILY_CHECKLIST.length) * 100);

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); const m = new Date(d);
    m.setDate(d.getDate() - todayIdx + i); return m;
  });

  const ac = T.teal;

  return (
    <div>
      {/* HERO with Three.js */}
      <div className="fu d1" style={{
        position: "relative", overflow: "hidden", borderRadius: 24,
        marginBottom: 16, height: 200,
        background: `linear-gradient(145deg,#050912 0%,#0d0a20 60%,#040e18 100%)`,
        border: `1px solid ${ac}30`,
      }}>
        <MicrobiomeCanvas accent={ac} violet={T.violet} />
        <div style={{ position: "relative", zIndex: 1, padding: "22px 22px 0" }}>
          <div style={{
            fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: "1.5rem",
            background: `linear-gradient(90deg,${ac},${T.violet})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            marginBottom: 6
          }}>Gut Health Reset</div>
          <div style={{
            fontSize: "0.75rem", color: "rgba(200,210,255,0.65)", lineHeight: 1.6,
            maxWidth: 280
          }}>
            Rebalance your microbiome in 3–4 weeks through diet, lifestyle and mindfulness.
          </div>
        </div>
        <div style={{
          position: "absolute", bottom: 14, left: 22, right: 22, zIndex: 1,
          display: "flex", gap: 8, flexWrap: "wrap"
        }}>
          {[ [ "⏱️", "3–4 wks" ], [ "🌿", "30 plants/wk" ], [ "💧", "64 oz/day" ] ].map(([ ico, lbl ]) => (
            <div key={lbl} style={{
              background: "rgba(255,255,255,0.07)", backdropFilter: "blur(8px)",
              border: `1px solid ${ac}30`, borderRadius: 30, padding: "4px 11px",
              fontSize: "0.67rem", color: ac, fontWeight: 700, display: "flex", gap: 4, alignItems: "center"
            }}>
              {ico} {lbl}
            </div>
          ))}
        </div>
      </div>

      {/* WEEKLY TRACKER */}
      <div className="fu d2" style={{
        background: T.card, border: `1px solid ${T.border}`,
        borderRadius: 22, padding: "18px 16px", marginBottom: 16
      }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "0.92rem" }}>
              📅 Weekly Tracker
            </div>
            <div style={{ fontSize: "0.68rem", color: T.muted, marginTop: 2 }}>
              Tap a day · log mood, checklist & symptoms
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {(() => {
              const moods = Array.from({ length: todayIdx + 1 }, (_, i) => gutWeekLog[i]?.mood || 0).filter(m => m > 0);
              const avg = moods.length ? MOOD_EMOJIS[Math.round(moods.reduce((a, b) => a + b, 0) / moods.length)] : "—";
              const logged = Array.from({ length: 7 }, (_, i) => gutWeekLog[i]).filter(d => d && (d.mood > 0 || Object.values(d.checked || {}).some(Boolean))).length;
              return [
                { val: avg, lbl: "avg mood", color: T.violet },
                { val: `${logged}/7`, lbl: "logged", color: ac },
              ].map(s => (
                <div key={s.lbl} style={{
                  textAlign: "center", background: `${s.color}12`,
                  border: `1px solid ${s.color}25`, borderRadius: 10, padding: "5px 9px"
                }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 800, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: "0.55rem", color: T.muted, textTransform: "uppercase" }}>{s.lbl}</div>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* 7-day grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5, marginBottom: 14 }}>
          {weekDates.map((date, i) => {
            const log = gutWeekLog[i] || {};
            const ckCount = Object.values(log.checked || {}).filter(Boolean).length;
            const pct = Math.round((ckCount / DAILY_CHECKLIST.length) * 100);
            const mood = log.mood || 0;
            const isToday = i === todayIdx;
            const isActive = i === activeDay;
            const isFuture = i > todayIdx;
            const mc = mood >= 4 ? T.green : mood === 3 ? ac : mood === 2 ? T.amber : mood === 1 ? T.red : T.border;
            return (
              <div key={i} onClick={() => setActiveDay(i)} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                cursor: "pointer", padding: "9px 3px", borderRadius: 14,
                border: `1.5px solid ${isActive ? ac : isToday ? ac + '55' : T.border}`,
                background: isActive ? `${ac}18` : isToday ? `${ac}09` : "transparent",
                opacity: isFuture ? 0.4 : 1, transition: "all 0.18s",
                boxShadow: isActive ? `0 0 14px ${ac}30` : "none",
              }}>
                <div style={{
                  fontSize: "0.55rem", fontWeight: 700, textTransform: "uppercase",
                  color: isActive ? ac : T.muted
                }}>{DAY_LABELS[i]}</div>
                <div style={{
                  fontSize: "0.78rem", fontWeight: 900,
                  color: isToday ? ac : T.text
                }}>{date.getDate()}</div>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: mood > 0 ? `${mc}28` : "transparent",
                  border: `2px solid ${mood > 0 ? mc : T.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.62rem"
                }}>{mood > 0 ? MOOD_EMOJIS[mood] : ""}</div>
                <div style={{ width: "85%", height: 3, borderRadius: 4, background: `${ac}20`, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, borderRadius: 4,
                    background: pct === 100 ? T.green : ac, transition: "width 0.3s" }} />
                </div>
                <div style={{
                  fontSize: "0.52rem", fontWeight: 700,
                  color: pct > 0 ? ac : T.muted
                }}>{pct > 0 ? `${pct}%` : "·"}</div>
              </div>
            );
          })}
        </div>

        {/* Active day summary */}
        <div style={{
          background: `${ac}0a`, border: `1px solid ${ac}20`,
          borderRadius: 14, padding: "12px 14px",
          display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8
        }}>
          {[
            { lbl: "Day", val: `${DAY_LABELS[activeDay]}${activeDay === todayIdx ? " ·today" : ""}`, color: ac },
            { lbl: "Checklist", val: `${checkedCount}/${DAILY_CHECKLIST.length}`, color: T.text },
            { lbl: "Mood", val: moodRating > 0 ? MOOD_EMOJIS[moodRating] : "—", color: T.text },
            { lbl: "Symptoms", val: `${Object.values(symptoms).filter(Boolean).length} logged`, color: T.muted },
          ].map(s => (
            <div key={s.lbl} style={{ textAlign: "center" }}>
              <div style={{
                fontSize: "0.62rem", color: T.muted, textTransform: "uppercase",
                fontWeight: 600, marginBottom: 3
              }}>{s.lbl}</div>
              <div style={{
                fontSize: "0.82rem", fontWeight: 800, color: s.color,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
              }}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SIGNS YOU NEED A RESET */}
      <div className="fu d2" style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "0.9rem", marginBottom: 10 }}>🚨 Signs You May Need a Reset</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {GUT_SIGNS.map(s => (
            <div key={s.title} style={{
              background: T.card,
              border: `1px solid ${s.color}28`, borderRadius: 18, padding: "14px 13px",
              borderTop: `3px solid ${s.color}`
            }}>
              <div style={{ fontSize: "1.5rem", marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontWeight: 700, fontSize: "0.75rem", color: s.color, marginBottom: 4 }}>{s.title}</div>
              <div style={{ fontSize: "0.67rem", color: T.muted, lineHeight: 1.5 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* DAILY CHECKLIST */}
      <div className="fu d2" style={{
        background: T.card, border: `1px solid ${T.border}`,
        borderRadius: 22, padding: "18px", marginBottom: 16
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "0.9rem" }}>
            ✅ Daily Checklist
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: "0.7rem", color: ac, fontWeight: 700 }}>{checkedCount}/{DAILY_CHECKLIST.length}</div>
            {checkPct === 100 && <span style={{ fontSize: "0.75rem" }}>🎉</span>}
          </div>
        </div>

        <div style={{ height: 6, background: `${ac}18`, borderRadius: 10, marginBottom: 16, overflow: "hidden", position: "relative" }}>
          <div style={{
            height: "100%", width: `${checkPct}%`, borderRadius: 10,
            background: `linear-gradient(90deg,${ac},${T.violet})`,
            transition: "width 0.4s ease",
            boxShadow: checkPct > 0 ? `0 0 8px ${ac}66` : "none"
          }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {DAILY_CHECKLIST.map(item => {
            const isDone = !!checked[item.id];
            return (
              <div key={item.id} onClick={() => toggleChecked(item.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                  borderRadius: 14, cursor: "pointer",
                  border: `1px solid ${isDone ? ac + '44' : T.border}`,
                  background: isDone ? `${ac}12` : "transparent",
                  transition: "all 0.18s"
                }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                  border: `2px solid ${isDone ? ac : T.border}`,
                  background: isDone ? ac : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.18s"
                }}>
                  {isDone && <span style={{ color: "#000", fontSize: "0.6rem", fontWeight: 900 }}>✓</span>}
                </div>
                <div style={{
                  fontSize: "0.7rem", color: isDone ? T.text : T.muted,
                  textDecoration: isDone ? "line-through" : "none",
                  transition: "all 0.2s", lineHeight: 1.3
                }}>
                  <span style={{ marginRight: 4 }}>{item.icon}</span>{item.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP-BY-STEP PROTOCOL */}
      <div className="fu d3" style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "0.9rem", marginBottom: 10 }}>📋 Step-by-Step Reset Protocol</div>
        {GUT_STEPS.map((step, i) => {
          const open = expandedStep === i;
          return (
            <div key={i} style={{
              background: T.card,
              border: `1px solid ${open ? ac + '55' : T.border}`,
              borderRadius: 18, marginBottom: 8,
              transition: "border 0.2s",
              overflow: "hidden",
              boxShadow: open ? `0 0 20px ${ac}18` : "none",
            }}>
              <div onClick={() => setExpandedStep(open ? null : i)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", cursor: "pointer" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 12, flexShrink: 0,
                  background: open ? `${ac}28` : `${ac}12`,
                  border: `1px solid ${open ? ac + '55' : ac + '22'}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.1rem", transition: "all 0.2s"
                }}>{step.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: "0.6rem", color: ac, fontWeight: 700,
                    letterSpacing: "0.05em", marginBottom: 2
                  }}>STEP {i + 1}</div>
                  <div style={{ fontSize: "0.83rem", fontWeight: 700, color: T.text }}>{step.title}</div>
                </div>
                <div style={{ color: T.muted, fontSize: "0.8rem",
                  transform: open ? "rotate(180deg)" : "none", transition: "transform 0.25s" }}>▾</div>
              </div>
              {open && (
                <div style={{ padding: "0 16px 16px 16px", borderTop: `1px solid ${T.border}` }}>
                  <div style={{
                    fontSize: "0.77rem", color: T.muted, lineHeight: 1.7,
                    paddingTop: 12, marginBottom: 4
                  }}>{step.body}</div>
                  <GutVideoCard query={step.ytQuery} color={ac} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* SYMPTOM & MOOD LOG */}
      <div className="fu d3" style={{
        background: T.card, border: `1px solid ${T.border}`,
        borderRadius: 22, padding: "18px", marginBottom: 16
      }}>
        <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "0.9rem", marginBottom: 4 }}>📓 Symptom & Mood Log</div>
        <div style={{ fontSize: "0.72rem", color: T.muted, marginBottom: 14 }}>
          Logging for <span style={{ color: ac, fontWeight: 700 }}>
            {DAY_LABELS[activeDay]}{activeDay === todayIdx ? " (Today)" : ""}
          </span>
        </div>

        {/* Mood */}
        <div style={{ fontSize: "0.72rem", color: T.muted, fontWeight: 600, marginBottom: 8 }}>Overall Mood</div>
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {[ "😩", "😕", "😐", "🙂", "😄" ].map((emoji, i) => {
            const val = i + 1;
            const active = moodRating === val;
            return (
              <button key={val} onClick={() => setMoodRating(val)} style={{
                flex: 1, padding: "11px 0", borderRadius: 14,
                border: `2px solid ${active ? ac : T.border}`,
                background: active ? `${ac}22` : "transparent",
                fontSize: "1.4rem", cursor: "pointer", transition: "all 0.15s",
                boxShadow: active ? `0 0 12px ${ac}44` : "none",
              }}>{emoji}</button>
            );
          })}
        </div>

        {/* Symptoms */}
        <div style={{ fontSize: "0.72rem", color: T.muted, fontWeight: 600, marginBottom: 8 }}>Symptoms / Feelings</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {SYMPTOM_OPTIONS.map(s => {
            const active = !!symptoms[s.id];
            return (
              <button key={s.id} onClick={() => toggleSymptom(s.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 9, padding: "11px 12px",
                  borderRadius: 13, border: `1.5px solid ${active ? s.color + '66' : T.border}`,
                  background: active ? `${s.color}18` : "transparent",
                  cursor: "pointer", transition: "all 0.15s", textAlign: "left",
                  boxShadow: active ? `0 0 10px ${s.color}22` : "none"
                }}>
                <span style={{ fontSize: "1.2rem" }}>{s.icon}</span>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: active ? s.color : T.muted }}>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* RECIPES */}
      <div className="fu d4" style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "0.9rem", marginBottom: 4 }}>🍽️ Gut-Friendly Recipes</div>
        <div style={{ fontSize: "0.68rem", color: T.muted, marginBottom: 12 }}>Tap "View Full Recipe" for ingredients, method & pro tips.</div>
        {GUT_RECIPES.map(r => <RecipeCard key={r.title} r={r} T={T} />)}
      </div>

      {/* TIMELINE */}
      <div className="fu d5" style={{
        background: T.card, border: `1px solid ${T.border}`,
        borderRadius: 22, padding: "18px", marginBottom: 16
      }}>
        <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "0.9rem", marginBottom: 16 }}>📈 What to Expect</div>
        {[
          { week: "Week 1–2", color: T.amber, icon: "💧", desc: "Less bloating, better hydration, improved stool regularity." },
          { week: "Week 3–4", color: ac, icon: "⚡", desc: "Clearer thinking, more stable energy, reduced inflammation." },
          { week: "Month 2–3", color: T.violet, icon: "🌿", desc: "Significant microbiome diversity, fewer IBS symptoms, better mood." },
        ].map((m, i, arr) => (
          <div key={m.week} style={{ display: "flex", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{
                width: 38, height: 38, borderRadius: 12, background: `${m.color}18`,
                border: `2px solid ${m.color}55`, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "1.1rem", flexShrink: 0
              }}>{m.icon}</div>
              {i < arr.length - 1 && (
                <div style={{ width: 2, height: 28, background: `linear-gradient(${m.color}44,${arr[i + 1].color}22)`, margin: "4px 0" }} />
              )}
            </div>
            <div style={{ paddingBottom: i < arr.length - 1 ? 20 : 0, paddingTop: 4 }}>
              <div style={{ fontWeight: 800, fontSize: "0.8rem", color: m.color, marginBottom: 4 }}>{m.week}</div>
              <div style={{ fontSize: "0.74rem", color: T.muted, lineHeight: 1.55 }}>{m.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: "0.63rem", color: T.muted, lineHeight: 1.5, textAlign: "center", padding: "0 16px 24px", opacity: 0.55 }}>
        Always consult your doctor before making major dietary changes, especially if you have existing health conditions.
      </div>
    </div>
  );
}
