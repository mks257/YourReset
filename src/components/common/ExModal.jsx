import React, { useState, useEffect } from 'react';
import { EXERCISE_DESC, EXERCISE_YT_SEARCH } from '../../constants/exercises';
import { Figure3D } from './Figure3D';

const YT_API_KEY = 'AIzaSyDV0mw54sfRc3jPyyXZwtBeAvhpb59qNcA';

export function ExModal({ T, ex, color, onClose, onDone, isDone, charType }) {
  const query    = EXERCISE_YT_SEARCH[ex.anim] || ex.name + ' proper form';
  const desc     = EXERCISE_DESC[ex.anim];

  const [videoId,   setVideoId]   = useState(null);
  const [vidLoading, setVidLoading] = useState(true);
  const [showEmbed, setShowEmbed]  = useState(false);

  useEffect(() => {
    setVideoId(null);
    setVidLoading(true);
    setShowEmbed(false);
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=1&key=${YT_API_KEY}`;
    fetch(url)
      .then(r => r.json())
      .then(data => {
        const id = data?.items?.[0]?.id?.videoId;
        if (id) setVideoId(id);
      })
      .catch(() => {})
      .finally(() => setVidLoading(false));
  }, [ex.anim, query]);

  const ytEmbed = videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`
    : null;

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)",
      zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      backdropFilter: "blur(14px)"
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: T.card, border: `1px solid ${color}55`, borderRadius: 24,
        width: "100%", maxWidth: 400, overflow: "hidden",
        boxShadow: `0 0 80px ${color}20`,
        maxHeight: "90vh", overflowY: "auto",
      }}>

        {/* Media area */}
        <div style={{ position: "relative", height: 250, background: "#000" }}>

          {showEmbed && ytEmbed ? (
            <iframe
              key={videoId}
              src={ytEmbed}
              title={ex.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ width: "100%", height: "100%", border: "none", display: "block" }}
            />
          ) : (
            <>
              <Figure3D animKey={ex.anim} color={color} height={250} charType={charType} />

              {/* Play button — shows once video ID is ready */}
              {!vidLoading && videoId && (
                <button onClick={() => setShowEmbed(true)} style={{
                  position: "absolute", top: "50%", left: "50%",
                  transform: "translate(-50%,-50%)",
                  width: 64, height: 64, borderRadius: "50%", border: "none", cursor: "pointer",
                  background: "rgba(255,0,0,0.88)",
                  boxShadow: "0 0 0 3px rgba(255,255,255,0.25), 0 0 32px rgba(255,0,0,0.4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.6rem", zIndex: 10,
                }}>▶</button>
              )}

              {vidLoading && (
                <div style={{
                  position: "absolute", top: "50%", left: "50%",
                  transform: "translate(-50%,-50%)", zIndex: 10,
                  width: 32, height: 32, borderRadius: "50%",
                  border: `3px solid ${color}44`, borderTopColor: color,
                  animation: "spin 0.8s linear infinite"
                }} />
              )}
            </>
          )}
        </div>

        <div style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: "1.4rem", lineHeight: 1.1 }}>{ex.name}</div>
              <div style={{ fontSize: "0.75rem", color: T.muted, textTransform: "uppercase", marginTop: 4, letterSpacing: "0.05em" }}>{ex.muscle || "General Movement"}</div>
            </div>
            <div style={{ background: `${color}22`, color, borderRadius: 10, padding: "6px 10px", fontSize: "0.8rem", fontWeight: 800 }}>{ex.sets}</div>
          </div>

          <div style={{ fontSize: "0.85rem", color: T.text, lineHeight: 1.5, opacity: 0.8, marginBottom: 20 }}>
            {desc || "Perform this movement with controlled form and focus on the target muscle groups."}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
            <div style={{ background: T.card2, padding: 12, borderRadius: 16, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: "0.6rem", color: T.muted, textTransform: "uppercase", marginBottom: 4 }}>Calories</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: T.teal }}>~{ex.kcal}</div>
            </div>
            <div style={{ background: T.card2, padding: 12, borderRadius: 16, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: "0.6rem", color: T.muted, textTransform: "uppercase", marginBottom: 4 }}>Focus</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: T.amber }}>{ex.muscle ? "Strength" : "Warm-up"}</div>
            </div>
          </div>

          <button
            onClick={() => { onDone(); onClose(); }}
            style={{
              width: "100%", padding: "16px", borderRadius: 16, border: "none",
              background: isDone ? T.border : `linear-gradient(135deg, ${color}, ${color}dd)`,
              color: isDone ? T.muted : "#fff", fontWeight: 900, cursor: "pointer",
              fontSize: "1rem", transition: "all 0.2s", boxShadow: isDone ? "none" : `0 8px 24px ${color}44`
            }}>
            {isDone ? "ALREADY COMPLETED ✓" : "MARK AS FINISHED"}
          </button>
        </div>
      </div>
    </div>
  );
}
