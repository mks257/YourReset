import { useState, useEffect, useRef } from "react";
import { Haptics, NotificationType, ImpactStyle } from "@capacitor/haptics";
import { Capacitor } from "@capacitor/core";
import { T } from "../theme";

/**
 * RestTimer — appears after marking a set as done.
 *
 * Auto-starts at the chosen duration (default 90s). User can pick a preset,
 * add +15s, skip to 0, or cancel.
 *
 * When the timer reaches 0:
 *   - Haptic notification on iOS (success-style double tap)
 *   - Web Audio chime (800Hz sine, 200ms, gentle envelope)
 *   - Auto-dismiss after 2s
 *
 * No setInterval-poll-once-a-second: ticks every 100ms for a smooth ring.
 */
const PRESETS = [60, 90, 120, 180];

// Resolve audio context lazily — Safari requires user gesture before constructing.
let _audioCtx = null;
function chime() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!_audioCtx) _audioCtx = new AC();
    const ctx = _audioCtx;
    const now = ctx.currentTime;

    // Two short beeps for "done" feel
    [0, 0.18].forEach(offset => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.25, now + offset + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.18);
    });
  } catch (err) {
    // Audio is best-effort; haptic still fires
    console.warn("[restTimer] chime failed:", err);
  }
}

function hapticImpact() {
  if (!Capacitor.isNativePlatform()) return;
  try { Haptics.impact({ style: ImpactStyle.Light }); } catch {}
}

function hapticComplete() {
  if (!Capacitor.isNativePlatform()) return;
  try { Haptics.notification({ type: NotificationType.Success }); } catch {}
}

export default function RestTimer({ defaultSeconds = 90, onComplete, onSkip }) {
  const [duration, setDuration] = useState(defaultSeconds);
  const [remaining, setRemaining] = useState(defaultSeconds);
  const [finished, setFinished] = useState(false);
  const startRef = useRef(performance.now());
  const rafRef = useRef(null);

  // Reset whenever duration changes (preset switch or +15s)
  useEffect(() => {
    startRef.current = performance.now();
    setFinished(false);
  }, [duration]);

  useEffect(() => {
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      const elapsedMs = performance.now() - startRef.current;
      const left = Math.max(0, duration - elapsedMs / 1000);
      setRemaining(left);
      if (left > 0) {
        rafRef.current = requestAnimationFrame(tick);
      } else if (!finished) {
        setFinished(true);
        hapticComplete();
        chime();
        // Auto-dismiss after 2s so user sees the "done" state briefly
        setTimeout(() => {
          if (!cancelled && onComplete) onComplete();
        }, 2000);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  const pct = duration > 0 ? remaining / duration : 0;
  const seconds = Math.ceil(remaining);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const display = mins > 0 ? `${mins}:${String(secs).padStart(2, "0")}` : `${secs}s`;

  // SVG ring
  const SIZE = 84;
  const STROKE = 5;
  const R = (SIZE - STROKE) / 2;
  const CIRC = 2 * Math.PI * R;
  const dashoff = CIRC * (1 - pct);

  const accentColor = finished ? T.green : "var(--phase-accent, #9bd8b4)";

  return (
    <div style={{
      marginTop: 12,
      padding: "14px 14px 12px",
      borderRadius: 16,
      background: finished
        ? "color-mix(in oklch, #5eead4 14%, var(--yr-bg-elev))"
        : "var(--yr-bg-elev)",
      border: `1px solid ${finished ? T.green : "var(--yr-border)"}`,
      transition: "background 0.25s ease, border-color 0.25s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* Circular countdown */}
        <div style={{ position: "relative", width: SIZE, height: SIZE, flexShrink: 0 }}>
          <svg width={SIZE} height={SIZE} style={{ transform: "rotate(-90deg)" }}>
            <circle
              cx={SIZE / 2} cy={SIZE / 2} r={R}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={STROKE}
            />
            <circle
              cx={SIZE / 2} cy={SIZE / 2} r={R}
              fill="none"
              stroke={accentColor}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={dashoff}
              style={{ transition: "stroke-dashoffset 0.1s linear, stroke 0.25s ease" }}
            />
          </svg>
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-mono)",
            fontSize: 18, fontWeight: 600,
            color: finished ? T.green : "var(--yr-text)",
            letterSpacing: "-0.02em",
            transition: "color 0.25s ease",
          }}>
            {finished ? "Done" : display}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em",
            color: "var(--yr-muted)", marginBottom: 6,
          }}>
            {finished ? "Rest complete" : "Resting"}
          </div>

          {/* Preset chips */}
          <div style={{ display: "flex", gap: 4, marginBottom: 6, flexWrap: "wrap" }}>
            {PRESETS.map(s => {
              const active = duration === s;
              return (
                <button
                  key={s}
                  onClick={() => { hapticImpact(); setDuration(s); }}
                  aria-pressed={active}
                  disabled={finished}
                  style={{
                    minHeight: 28, minWidth: 44,
                    padding: "4px 10px",
                    borderRadius: 8,
                    border: `1px solid ${active ? "var(--phase-accent)" : "var(--yr-border)"}`,
                    background: active ? "var(--phase-soft, transparent)" : "transparent",
                    color: active ? "var(--phase-accent)" : "var(--yr-muted)",
                    fontFamily: "inherit",
                    fontSize: 12, fontWeight: 600,
                    cursor: finished ? "not-allowed" : "pointer",
                    opacity: finished ? 0.5 : 1,
                  }}
                >
                  {s}s
                </button>
              );
            })}
          </div>

          {/* Adjust + skip row */}
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button
              onClick={() => {
                hapticImpact();
                // Bump the start ref backwards so +15s effectively adds time
                startRef.current -= 15000;
                setRemaining(r => Math.min(duration, r + 15));
              }}
              disabled={finished}
              style={smallBtn(finished)}
            >+15s</button>
            <button
              onClick={() => {
                hapticImpact();
                if (onSkip) onSkip();
              }}
              style={{ ...smallBtn(false), marginLeft: "auto", color: T.muted }}
            >Skip</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function smallBtn(disabled) {
  return {
    minHeight: 30,
    padding: "5px 12px",
    borderRadius: 8,
    border: "1px solid var(--yr-border)",
    background: "transparent",
    color: "var(--yr-text-2)",
    fontFamily: "inherit",
    fontSize: 12, fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
  };
}
