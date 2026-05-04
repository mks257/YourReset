import React, { useState } from 'react';

const YT_API_KEY = 'AIzaSyDV0mw54sfRc3jPyyXZwtBeAvhpb59qNcA';

export function GutVideoCard({ query, color }) {
  const [videoId, setVideoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const [fetched, setFetched] = useState(false);

  const load = () => {
    if (fetched) { setShowEmbed(true); return; }
    setLoading(true);
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=1&key=${YT_API_KEY}`;
    fetch(url).then(r => r.json()).then(d => {
      const id = d?.items?.[0]?.id?.videoId;
      if (id) { setVideoId(id); setShowEmbed(true); }
    }).catch(() => { }).finally(() => { setLoading(false); setFetched(true); });
  };

  const ytSearch = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

  if (showEmbed && videoId) return (
    <div style={{ borderRadius: 12, overflow: "hidden", marginTop: 12, position: "relative" }}>
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
        title="Gut health video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ width: "100%", height: 200, border: "none", display: "block" }}
      />
      <button onClick={() => setShowEmbed(false)} style={{
        position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.6)",
        border: "none", borderRadius: "50%", width: 26, height: 26, cursor: "pointer",
        color: "#fff", fontSize: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center"
      }}>✕</button>
    </div>
  );

  return (
    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
      <button onClick={load} disabled={loading} style={{
        flex: 1, padding: "8px 12px", borderRadius: 10, border: `1px solid ${color}44`,
        background: `${color}12`, color, fontWeight: 700, fontSize: "0.72rem",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        opacity: loading ? 0.6 : 1
      }}>
        {loading
          ? <span style={{
            width: 14, height: 14, borderRadius: "50%", border: `2px solid ${color}44`,
            borderTopColor: color, animation: "spin 0.8s linear infinite", display: "inline-block"
          }} />
          : "▶"}
        {loading ? "Loading…" : "Watch Video"}
      </button>
      <a href={ytSearch} target="_blank" rel="noreferrer" style={{
        padding: "8px 12px", borderRadius: 10, border: `1px solid rgba(255,0,0,0.3)`,
        background: "rgba(255,0,0,0.08)", color: "#ff4444", fontWeight: 700, fontSize: "0.72rem",
        textDecoration: "none", display: "flex", alignItems: "center", gap: 5
      }}>
        YT ↗
      </a>
    </div>
  );
}
