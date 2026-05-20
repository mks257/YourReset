import { useState, useEffect } from "react";

/**
 * Destructive confirmation sheet for "Delete account & data".
 *
 * iOS pattern:
 *  - Full-screen dim overlay
 *  - Bottom sheet that slides up
 *  - Red destructive primary button at the bottom
 *  - "Cancel" secondary
 *  - Requires typing "DELETE" to enable the confirm button (defence against
 *    accidental taps on the most destructive action in the app)
 *
 * Safe areas: the sheet pads its bottom by env(safe-area-inset-bottom)
 * so the destructive button never sits under the home indicator.
 */
const REQUIRED_PHRASE = "DELETE";

export default function DeleteAccountSheet({ open, onCancel, onConfirm }) {
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);

  // Reset the typed phrase whenever the sheet reopens
  useEffect(() => {
    if (open) { setTyped(""); setBusy(false); }
  }, [open]);

  if (!open) return null;

  const canConfirm = typed.trim().toUpperCase() === REQUIRED_PHRASE && !busy;

  const handleConfirm = async () => {
    if (!canConfirm) return;
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      // onConfirm typically navigates away (back to onboarding) so we
      // rarely re-render, but reset busy if it doesn't.
      setBusy(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes da-fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes da-slide-up {
          from { opacity: 0; transform: translateY(24px) }
          to   { opacity: 1; transform: translateY(0) }
        }
      `}</style>

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="da-title"
        onClick={busy ? undefined : onCancel}
        style={{
          position: "fixed", inset: 0, zIndex: 1500,
          background: "rgba(4,4,14,0.78)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          animation: "da-fade-in 0.18s ease both",
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            width: "100%", maxWidth: 480,
            background: "var(--yr-bg-elev)",
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            border: "1px solid var(--yr-border)",
            borderBottom: "none",
            padding: "20px 22px calc(24px + env(safe-area-inset-bottom))",
            animation: "da-slide-up 0.22s cubic-bezier(0.22,1,0.36,1) both",
            boxShadow: "0 -16px 64px rgba(0,0,0,0.5)",
          }}
        >
          {/* Drag handle */}
          <div style={{
            width: 40, height: 4, borderRadius: 2,
            background: "rgba(255,255,255,0.18)",
            margin: "0 auto 18px",
          }} />

          <div style={{ fontSize: 36, textAlign: "center", marginBottom: 8 }}>⚠️</div>

          <h2 id="da-title" style={{
            margin: "0 0 8px",
            fontFamily: "var(--font-display, 'Fraunces', serif)",
            fontSize: 22, fontWeight: 600, textAlign: "center",
            color: "var(--yr-text)", letterSpacing: "-0.01em",
          }}>
            Delete account & all data?
          </h2>

          <p style={{
            margin: "0 0 18px",
            fontSize: 13, color: "var(--yr-muted)", lineHeight: 1.55,
            textAlign: "center", maxWidth: "40ch", marginLeft: "auto", marginRight: "auto",
          }}>
            This permanently removes your profile, cycle data, workout history,
            nutrition logs, daily check-ins, gut tracker entries, and friends
            list from this device. <strong style={{ color: "#fc8181" }}>This cannot be undone.</strong>
          </p>

          <div style={{
            background: "var(--yr-surface)", border: "1px solid var(--yr-border)",
            borderRadius: 12, padding: "12px 14px", marginBottom: 16,
            fontSize: 12, color: "var(--yr-text-2)", lineHeight: 1.55,
          }}>
            If you have a paid subscription, deleting your account here will
            <strong> not </strong> cancel it. Manage your subscription in
            Settings → Manage Subscription, or in iOS Settings → Apple ID →
            Subscriptions.
          </div>

          <label htmlFor="da-confirm" style={{
            display: "block", fontFamily: "var(--font-mono)",
            fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em",
            color: "var(--yr-muted)", marginBottom: 8,
          }}>
            Type <span style={{ color: "#fc8181", fontWeight: 700 }}>{REQUIRED_PHRASE}</span> to confirm
          </label>
          <input
            id="da-confirm"
            type="text"
            inputMode="text"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck="false"
            value={typed}
            onChange={e => setTyped(e.target.value)}
            placeholder={REQUIRED_PHRASE}
            disabled={busy}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 12,
              border: `1px solid ${canConfirm ? "#fc8181" : "var(--yr-border)"}`,
              background: "var(--yr-bg)",
              color: "var(--yr-text)",
              fontSize: 15,
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.04em",
              outline: "none",
              marginBottom: 16,
              boxSizing: "border-box",
            }}
          />

          {/* Buttons: Cancel (secondary) + Delete (destructive primary) */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onCancel}
              disabled={busy}
              style={{
                flex: 1,
                padding: "14px 0",
                borderRadius: 12,
                border: "1px solid var(--yr-border)",
                background: "transparent",
                color: "var(--yr-text)",
                fontFamily: "inherit",
                fontSize: 14, fontWeight: 600,
                cursor: busy ? "not-allowed" : "pointer",
                minHeight: 48,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!canConfirm}
              style={{
                flex: 1,
                padding: "14px 0",
                borderRadius: 12,
                border: "none",
                background: canConfirm ? "#fc8181" : "var(--yr-surface-2)",
                color: canConfirm ? "#0a0a0a" : "var(--yr-muted)",
                fontFamily: "inherit",
                fontSize: 14, fontWeight: 700,
                cursor: canConfirm ? "pointer" : "not-allowed",
                transition: "background 0.18s ease, color 0.18s ease",
                minHeight: 48,
              }}
            >
              {busy ? "Deleting…" : "Delete forever"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
