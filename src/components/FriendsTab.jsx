import { useState, useMemo } from "react";
import { get, set } from "../storage";

const FRIEND_COLORS = [
  "#f2bd73", "#9bd8b4", "#d98aa8", "#b79cff",
  "#60a5fa", "#fb923c", "#34d399", "#f87171",
];

function getColor(i) { return FRIEND_COLORS[i % FRIEND_COLORS.length]; }

function initFriends() {
  return get("friends", []);
}

function saveFriends(list) {
  set("friends", list);
}

function Medal({ rank }) {
  if (rank === 1) return <span style={{ fontSize: "1.1rem" }}>🥇</span>;
  if (rank === 2) return <span style={{ fontSize: "1.1rem" }}>🥈</span>;
  if (rank === 3) return <span style={{ fontSize: "1.1rem" }}>🥉</span>;
  return <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--yr-muted)", minWidth: 20, display: "inline-block", textAlign: "center" }}>{rank}</span>;
}

export default function FriendsTab({ mySteps = 0, myName = "You" }) {
  const [friends, setFriends] = useState(initFriends);
  const [form, setForm] = useState({ name: "", steps: "" });
  const [editingId, setEditingId] = useState(null);
  const [editSteps, setEditSteps] = useState("");

  const updateFriends = (list) => { setFriends(list); saveFriends(list); };

  const addFriend = () => {
    if (!form.name.trim()) return;
    const newFriend = {
      id: Date.now(),
      name: form.name.trim(),
      steps: parseInt(form.steps) || 0,
      addedAt: Date.now(),
    };
    updateFriends([...friends, newFriend]);
    setForm({ name: "", steps: "" });
  };

  const removeFriend = (id) => updateFriends(friends.filter(f => f.id !== id));

  const updateSteps = (id) => {
    updateFriends(friends.map(f => f.id === id ? { ...f, steps: parseInt(editSteps) || 0 } : f));
    setEditingId(null);
    setEditSteps("");
  };

  // Build leaderboard: you + all friends, sorted by steps desc
  const leaderboard = useMemo(() => {
    const everyone = [
      { id: "me", name: myName, steps: mySteps, isMe: true },
      ...friends.map((f, i) => ({ ...f, isMe: false, colorIndex: i })),
    ].sort((a, b) => b.steps - a.steps);
    return everyone;
  }, [friends, mySteps, myName]);

  const leader = leaderboard[0];
  const myRank = leaderboard.findIndex(e => e.isMe) + 1;
  const myEntry = leaderboard.find(e => e.isMe);
  const ahead = myRank > 1 ? leaderboard[myRank - 2] : null;
  const stepsToLead = ahead ? ahead.steps - mySteps + 1 : 0;

  const accent = "var(--phase-accent)";

  return (
    <div className="yr-stack-lg">

      {/* Header */}
      <div>
        <div className="yr-overline">Step challenge</div>
        <h1 className="yr-display" style={{ fontSize: "clamp(28px,5vw,48px)", fontWeight: 500, letterSpacing: "-0.03em", margin: 0, lineHeight: 1.1 }}>
          {myRank === 1
            ? "You're leading. Keep moving."
            : `${stepsToLead.toLocaleString()} steps to take the lead.`}
        </h1>
      </div>

      {/* Your step count + rank card */}
      <div style={{
        background: "var(--yr-surface-2)", borderRadius: 16,
        padding: "18px 20px",
        border: `1px solid var(--phase-accent)`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--yr-muted)", fontFamily: "var(--font-mono)", marginBottom: 4 }}>Your steps today</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 34, fontWeight: 700, color: accent, letterSpacing: "-0.03em", lineHeight: 1 }}>
            {mySteps.toLocaleString()}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--yr-muted)", fontFamily: "var(--font-mono)", marginBottom: 4 }}>Rank</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
            <Medal rank={myRank} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 700, color: "var(--yr-text)" }}>
              #{myRank}
            </span>
          </div>
          <div style={{ fontSize: 11, color: "var(--yr-muted)", marginTop: 2 }}>of {leaderboard.length}</div>
        </div>
      </div>

      {/* Leaderboard */}
      <div>
        <div className="yr-overline">Leaderboard</div>
        <div style={{ marginTop: 8, borderTop: "1px solid var(--yr-border)" }}>
          {leaderboard.map((entry, i) => {
            const rank = i + 1;
            const pct  = leader.steps > 0 ? (entry.steps / leader.steps) * 100 : 0;
            const color = entry.isMe ? accent : getColor(entry.colorIndex ?? i);
            return (
              <div key={entry.id} style={{
                padding: "14px 0",
                borderBottom: "1px solid var(--yr-border)",
                background: entry.isMe ? "var(--phase-soft)" : "transparent",
                borderRadius: entry.isMe ? 10 : 0,
                paddingLeft: entry.isMe ? 12 : 0,
                paddingRight: entry.isMe ? 12 : 0,
                margin: entry.isMe ? "4px -12px" : 0,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <Medal rank={rank} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: entry.isMe ? 700 : 500, color: entry.isMe ? accent : "var(--yr-text)" }}>
                      {entry.name} {entry.isMe && <span style={{ fontSize: 10, opacity: 0.7 }}>(you)</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {/* Edit steps for friends */}
                    {!entry.isMe && (
                      editingId === entry.id ? (
                        <div style={{ display: "flex", gap: 4 }}>
                          <input
                            type="number"
                            value={editSteps}
                            onChange={e => setEditSteps(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && updateSteps(entry.id)}
                            autoFocus
                            style={{ width: 80, padding: "4px 8px", borderRadius: 6, border: "1px solid var(--yr-border)", background: "var(--yr-bg)", color: "var(--yr-text)", fontSize: 12, outline: "none" }}
                          />
                          <button onClick={() => updateSteps(entry.id)} style={{ padding: "4px 8px", borderRadius: 6, border: "none", background: accent, color: "#0a0a0a", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>✓</button>
                          <button onClick={() => setEditingId(null)} style={{ padding: "4px 6px", borderRadius: 6, border: "1px solid var(--yr-border)", background: "transparent", color: "var(--yr-muted)", fontSize: 11, cursor: "pointer" }}>✕</button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditingId(entry.id); setEditSteps(String(entry.steps)); }}
                          style={{ padding: "3px 8px", borderRadius: 6, border: "1px solid var(--yr-border)", background: "transparent", color: "var(--yr-muted)", fontSize: 11, cursor: "pointer" }}>
                          update
                        </button>
                      )
                    )}
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700, color, minWidth: 70, textAlign: "right" }}>
                      {entry.steps.toLocaleString()}
                    </div>
                    {!entry.isMe && (
                      <button onClick={() => removeFriend(entry.id)}
                        style={{ background: "none", border: "none", color: "var(--yr-muted)", cursor: "pointer", fontSize: 13, padding: "0 2px", opacity: 0.5 }}>
                        ×
                      </button>
                    )}
                  </div>
                </div>
                {/* Step bar */}
                <div style={{ height: 3, borderRadius: 999, background: "var(--yr-border)", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 999,
                    width: `${pct}%`, background: color,
                    transition: "width 0.5s ease",
                  }} />
                </div>
                {/* Gap to leader */}
                {rank > 1 && (
                  <div style={{ fontSize: 10, color: "var(--yr-muted)", marginTop: 4, fontFamily: "var(--font-mono)" }}>
                    {(leader.steps - entry.steps).toLocaleString()} behind {leader.name}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add friend */}
      <div>
        <div className="yr-overline">Add a friend</div>
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              placeholder="Friend's name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && addFriend()}
              style={{
                flex: 1, padding: "10px 12px", borderRadius: 10,
                border: "1px solid var(--yr-border)", background: "var(--yr-bg)",
                color: "var(--yr-text)", fontSize: 13, outline: "none",
              }}
            />
            <input
              type="number"
              placeholder="Steps today"
              value={form.steps}
              onChange={e => setForm(f => ({ ...f, steps: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && addFriend()}
              style={{
                width: 110, padding: "10px 12px", borderRadius: 10,
                border: "1px solid var(--yr-border)", background: "var(--yr-bg)",
                color: "var(--yr-text)", fontSize: 13, outline: "none",
              }}
            />
          </div>
          <button
            onClick={addFriend}
            style={{
              padding: "11px 0", borderRadius: 10, border: "none", cursor: "pointer",
              background: accent, color: "#0a0a0a",
              fontFamily: "inherit", fontWeight: 700, fontSize: 13,
            }}
          >+ Add friend</button>
        </div>
      </div>

      {/* Step tips */}
      <div style={{ borderTop: "1px solid var(--yr-border)", paddingTop: 16 }}>
        <div className="yr-overline">Keep moving</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
          {[
            "Take the stairs — 2 flights = ~150 steps.",
            "A 10-minute walk adds ~1,200 steps.",
            "Park further away or get off a stop early.",
            "Walk during calls — it adds up fast.",
          ].map((tip, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ color: accent, fontFamily: "var(--font-mono)", fontSize: 11, marginTop: 1 }}>—</span>
              <span style={{ fontSize: 13, color: "var(--yr-text-2)", lineHeight: 1.55 }}>{tip}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
