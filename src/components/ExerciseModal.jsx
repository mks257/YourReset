import { useState, useEffect, useRef, useCallback } from "react";
import { createVideoGeneration, pollGeneration } from "../higgsfieldApi";
import ExerciseAnimation from "./ExerciseAnimation";
import WorkoutLogger from "./WorkoutLogger";
import { T } from "../theme";

function ExerciseModal({ ex, dayColor, onClose, onToggleDone, isDone, selectedDay, weekKey, phaseNote }) {
  const [vidState, setVidState] = useState("idle"); // idle | loading | ready | error
  const [videoUrl, setVideoUrl] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");
  const pollRef = useRef(null);

  useEffect(() => () => clearInterval(pollRef.current), []);

  const handleGenerate = useCallback(async () => {
    setVidState("loading");
    setStatusMsg("Submitting to Higgsfield AI...");
    try {
      const data = await createVideoGeneration(ex.name);
      const genId = data.generation_id || data.request_id;
      setStatusMsg("Generating your video...");

      pollRef.current = setInterval(async () => {
        try {
          const poll = await pollGeneration(genId);
          if (poll.status === "completed") {
            clearInterval(pollRef.current);
            const url = poll.results?.raw?.url ?? poll.results?.url ?? poll.url;
            setVideoUrl(url);
            setVidState("ready");
          } else if (poll.status === "failed" || poll.status === "nsfw") {
            clearInterval(pollRef.current);
            setVidState("error");
            setStatusMsg("Generation failed. Please try again.");
          } else {
            setStatusMsg(`Status: ${poll.status}…`);
          }
        } catch {
          clearInterval(pollRef.current);
          setVidState("error");
          setStatusMsg("Lost connection. Please try again.");
        }
      }, 4000);
    } catch (err) {
      setVidState("error");
      setStatusMsg(err.message || "Failed to connect to Higgsfield API.");
    }
  }, [ex.name]);

  const CSS_SPIN = `
    @keyframes hf-spin { to { transform: rotate(360deg); } }
    @keyframes hf-pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
    @keyframes hf-shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
  `;

  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center", padding:16,
      backdropFilter:"blur(10px)",
    }}>
      <style>{CSS_SPIN}</style>
      <div onClick={e=>e.stopPropagation()} style={{
        background:T.card, border:`1px solid ${dayColor}44`, borderRadius:28,
        padding:28, maxWidth:440, width:"100%", position:"relative",
        boxShadow:`0 0 80px ${dayColor}1a, 0 24px 48px rgba(0,0,0,0.6)`,
        maxHeight:"90vh", overflowY:"auto",
      }}>
        <button onClick={onClose} style={{
          position:"absolute", top:16, right:16, background:"rgba(255,255,255,0.06)",
          border:"none", borderRadius:"50%", width:32, height:32, cursor:"pointer",
          color:T.muted, fontSize:"1rem", display:"flex", alignItems:"center", justifyContent:"center"
        }}>✕</button>

        <div style={{ display:"flex", justifyContent:"center", marginBottom:20, background:`${dayColor}0a`, borderRadius:16, padding:"12px 0" }}>
          <ExerciseAnimation type={ex.anim} color={dayColor} />
        </div>

        <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:"1.15rem", fontWeight:800, marginBottom:6 }}>{ex.name}</div>
        <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
          <span style={{ fontSize:"0.7rem", padding:"3px 10px", borderRadius:100, background:`${dayColor}20`, color:dayColor, fontWeight:700 }}>{ex.muscle}</span>
          <span style={{ fontSize:"0.7rem", padding:"3px 10px", borderRadius:100, background:"rgba(255,255,255,0.06)", color:T.muted, fontWeight:600 }}>{ex.type}</span>
          <span style={{ fontSize:"0.7rem", padding:"3px 10px", borderRadius:100, background:"rgba(255,179,71,0.15)", color:T.amber, fontWeight:700 }}>🔥 ~{ex.kcal} kcal</span>
        </div>

        {phaseNote && (
          <div style={{ background: `rgba(94,234,212,0.08)`, border: `1px solid rgba(94,234,212,0.2)`, borderRadius: 10, padding: "8px 12px", marginBottom: 12, fontSize: "0.75rem", color: T.green }}>
            🌿 {phaseNote}
          </div>
        )}

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
          {[["Sets", ex.sets], ["Reps", ex.reps]].map(([l,v])=>(
            <div key={l} style={{ background:T.card2, borderRadius:12, padding:"10px 14px" }}>
              <div style={{ fontSize:"0.65rem", color:T.muted, textTransform:"uppercase", letterSpacing:"0.05em" }}>{l}</div>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:"1rem", color:dayColor, marginTop:2 }}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{ background:`${dayColor}0d`, border:`1px solid ${dayColor}22`, borderRadius:12, padding:"12px 14px", marginBottom:18 }}>
          <div style={{ fontSize:"0.65rem", color:T.muted, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:5 }}>💡 Coach Tip</div>
          <div style={{ fontSize:"0.82rem", lineHeight:1.6, color:"rgba(240,238,255,0.85)" }}>{ex.tip}</div>
        </div>

        <WorkoutLogger ex={ex} selectedDay={selectedDay} weekKey={weekKey} dayColor={dayColor} />

        {/* Higgsfield AI Video Section */}
        <div style={{
          background:"linear-gradient(135deg,rgba(180,139,250,0.06),rgba(56,217,192,0.06))",
          border:`1px solid rgba(180,139,250,0.2)`,
          borderRadius:16, padding:"16px", marginBottom:16,
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <div style={{
              width:28, height:28, borderRadius:8,
              background:"linear-gradient(135deg,#b48bfa,#38d9c0)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.75rem", flexShrink:0,
            }}>▶</div>
            <div>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:"0.85rem", color:T.text }}>AI Video Demo</div>
              <div style={{ fontSize:"0.62rem", color:T.muted }}>Powered by Higgsfield</div>
            </div>
          </div>

          {vidState === "idle" && (
            <button onClick={handleGenerate} style={{
              width:"100%", padding:"12px 0", borderRadius:12, border:"none", cursor:"pointer",
              background:"linear-gradient(135deg,#b48bfa,#38d9c0,#b48bfa)",
              backgroundSize:"200% auto",
              animation:"hf-shimmer 3s linear infinite",
              color:"#fff", fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:"0.88rem",
              boxShadow:"0 4px 20px rgba(180,139,250,0.35)",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            }}>
              ✨ Generate AI Video
            </button>
          )}

          {vidState === "loading" && (
            <div style={{ textAlign:"center", padding:"12px 0" }}>
              <div style={{
                width:32, height:32, borderRadius:"50%",
                border:"3px solid rgba(180,139,250,0.2)",
                borderTopColor:"#b48bfa",
                animation:"hf-spin 0.8s linear infinite",
                margin:"0 auto 10px",
              }} />
              <div style={{ fontSize:"0.78rem", color:"#b48bfa", fontWeight:600, animation:"hf-pulse 1.5s ease infinite" }}>
                {statusMsg}
              </div>
              <div style={{ fontSize:"0.62rem", color:T.muted, marginTop:4 }}>This takes ~30–90 seconds</div>
            </div>
          )}

          {vidState === "ready" && videoUrl && (
            <div>
              <video
                src={videoUrl}
                controls
                autoPlay
                loop
                playsInline
                style={{
                  width:"100%", borderRadius:12, display:"block",
                  border:"1px solid rgba(180,139,250,0.3)",
                  maxHeight:320, objectFit:"cover",
                }}
              />
              <button onClick={()=>{ setVidState("idle"); setVideoUrl(null); }} style={{
                marginTop:8, width:"100%", padding:"8px 0", borderRadius:10, border:"1px solid rgba(255,255,255,0.08)",
                background:"transparent", color:T.muted, fontSize:"0.7rem", cursor:"pointer", fontFamily:"'Outfit',sans-serif",
              }}>
                ↺ Regenerate
              </button>
            </div>
          )}

          {vidState === "error" && (
            <div style={{ textAlign:"center", padding:"8px 0" }}>
              <div style={{ fontSize:"0.78rem", color:T.red, marginBottom:10 }}>{statusMsg}</div>
              <button onClick={()=>setVidState("idle")} style={{
                padding:"8px 20px", borderRadius:10, border:`1px solid ${T.red}44`,
                background:`${T.red}12`, color:T.red, fontSize:"0.75rem", cursor:"pointer", fontFamily:"'Outfit',sans-serif", fontWeight:700,
              }}>Try Again</button>
            </div>
          )}
        </div>

        <button onClick={onToggleDone} style={{
          width:"100%", padding:"13px 0", borderRadius:14, border:"none", cursor:"pointer",
          background: isDone ? "rgba(94,234,212,0.15)" : `linear-gradient(135deg,${dayColor},${dayColor}bb)`,
          color: isDone ? T.green : "#fff",
          fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:"0.95rem",
          transition:"all 0.2s",
          boxShadow: isDone ? "none" : `0 6px 20px ${dayColor}44`,
        }}>
          {isDone ? "✓ Completed — Tap to Undo" : "Mark as Done ✓"}
        </button>
      </div>
    </div>
  );
}

export default ExerciseModal;
