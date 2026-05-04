import { useState, useEffect } from "react";
import * as Storage from "../storage";
import { CHECK_IN_FIELDS, TRIGGERS, calcGutScore, getScoreLabel, getDailyGutNudge, GUT_CONTENT, RED_FLAGS } from "../gutEngine";
import { useCountUp } from "./MotionHooks";

const todayKey = () => `gut_${Storage.getTodayKey()}`;

export default function GutResetTab({ profile, cycleState, motion = "full" }) {
  const [log, setLog]           = useState(() => Storage.get(todayKey(), {}));
  const [triggers, setTriggers] = useState(() => Storage.get(todayKey()+"_triggers", []));
  const [note, setNote]         = useState(() => Storage.get(todayKey()+"_note", ""));
  const animOn = motion !== "off";

  useEffect(() => { Storage.set(todayKey(), log); }, [log]);
  useEffect(() => { Storage.set(todayKey()+"_triggers", triggers); }, [triggers]);
  useEffect(() => { Storage.set(todayKey()+"_note", note); }, [note]);

  const score = calcGutScore(log);
  const scoreInfo = getScoreLabel(score);
  const filled = Object.keys(log).length;
  const scoreAnim = useCountUp(score || 0, { duration:700, enabled: animOn && !!score });

  return (
    <div className="yr-stack-lg">
      {/* Hero */}
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
        <div>
          <div className="yr-overline">Gut reset</div>
          <h1 className="yr-display" style={{ fontSize:"clamp(32px,5vw,52px)", fontWeight:500, letterSpacing:"-0.03em", margin:0, lineHeight:1.05, maxWidth:"14ch" }}>
            How does today feel?
          </h1>
          <p style={{ fontSize:13, color:"var(--yr-muted)", marginTop:8, maxWidth:"44ch", lineHeight:1.5 }}>
            {getDailyGutNudge()}
          </p>
        </div>
        <div style={{ textAlign:"right" }}>
          <div className="yr-overline">Today's score</div>
          <div style={{ fontFamily:"var(--font-mono)", fontSize:56, fontWeight:500, color: score ? (scoreInfo?.color || "var(--phase-accent)") : "var(--yr-faint)", letterSpacing:"-0.04em", lineHeight:1 }}>
            {score ? scoreAnim : "—"}
          </div>
          <div style={{ fontSize:11, color:"var(--yr-muted)", fontFamily:"var(--font-mono)" }}>{filled}/6 logged</div>
          {score && scoreInfo && <div style={{ fontSize:12, color:scoreInfo.color, marginTop:4 }}>{scoreInfo.label}</div>}
        </div>
      </div>

      {/* Check-in quadrants */}
      <div className="yr-quad">
        {CHECK_IN_FIELDS.map((f, i) => (
          <div className={`yr-quad-row${animOn ? " yr-anim-ledger-row" : ""}`} key={f.key} style={{"--i":i}}>
            <div className="yr-quad-label">
              <div className="yr-quad-label-key">{f.label}</div>
              <div className="yr-quad-label-val">{log[f.key] || "—"}</div>
            </div>
            <div className="yr-pills">
              {f.options.map(o => {
                const val = f.key === "energy" ? (f.options.indexOf(o)+1) : o.toLowerCase();
                return (
                  <button key={o} className={`yr-pill${log[f.key] === val || log[f.key] === o ? " active" : ""}`}
                    onClick={() => setLog(p => ({ ...p, [f.key]: val }))}>
                    {o}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Triggers */}
      <div>
        <div className="yr-overline">Possible triggers</div>
        <div className="yr-pills" style={{ marginTop:12 }}>
          {TRIGGERS.map(t => (
            <button key={t} className={`yr-pill${triggers.includes(t) ? " active" : ""}`}
              onClick={() => setTriggers(prev => prev.includes(t) ? prev.filter(x=>x!==t) : [...prev, t])}>
              {t}
            </button>
          ))}
        </div>
        <textarea value={note} onChange={e => setNote(e.target.value)}
          placeholder="Anything else you noticed today..."
          rows={2}
          style={{ width:"100%", marginTop:12, padding:"10px 12px", borderRadius:10, border:"1px solid var(--yr-border)", background:"var(--yr-surface)", color:"var(--yr-text)", fontFamily:"inherit", fontSize:13, outline:"none", resize:"vertical" }}
        />
      </div>

      {/* Content cards */}
      <div>
        <div className="yr-overline">Gut health basics</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", borderTop:"1px solid var(--yr-border)" }}>
          {GUT_CONTENT.slice(0,3).map((card, i) => (
            <div key={card.id} style={{ borderBottom:"1px solid var(--yr-border)", padding:"16px 16px 16px 0" }}>
              <div className="yr-overline" style={{ color:"var(--phase-accent)" }}>{card.title}</div>
              <div style={{ fontSize:13, color:"var(--yr-text-2)", lineHeight:1.55, marginTop:4 }}>{card.summary}</div>
              {card.caution && <div style={{ fontSize:11, color:"var(--yr-muted)", marginTop:6, fontStyle:"italic" }}>{card.caution}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Red flags */}
      <div style={{ padding:"16px", borderRadius:14, background:"rgba(248,113,113,0.06)", border:"1px solid rgba(248,113,113,0.22)" }}>
        <div style={{ fontWeight:700, fontSize:14, color:"#f87171", marginBottom:8 }}>When to get medical help</div>
        <p style={{ fontSize:12, color:"var(--yr-muted)", lineHeight:1.6, marginBottom:12 }}>
          Talk to a clinician if symptoms are severe, persistent, worsening, or include any of the following:
        </p>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {RED_FLAGS.map(flag => (
            <div key={flag} style={{ display:"flex", gap:8 }}>
              <span style={{ color:"#f87171", fontSize:11 }}>!</span>
              <span style={{ fontSize:12, color:"var(--yr-muted)" }}>{flag}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
