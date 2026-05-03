import { T } from "../theme";

const FREE_FEATURES = [
  "Cycle calendar preview",
  "3 sample workout days",
  "Daily readiness check-in",
  "Equipment filtering",
  "Step & calorie metrics",
  "Basic nutrition tips",
];

const PLUS_FEATURES = [
  "Full 7-day adaptive workout plans",
  "Cycle-synced training intensity",
  "Workout logging + progressive overload",
  "Cycle-aware nutrition guidance",
  "Equipment substitutions",
  "AI video demos (Higgsfield)",
  "All future features included",
];

const TRUST_SIGNALS = [
  { icon: "🚫", label: "Cancel anytime" },
  { icon: "✅", label: "No hidden fees" },
  { icon: "🔔", label: "Renewal reminders" },
  { icon: "📱", label: "Data stays on your device" },
];

function PricingPage({ profile }) {
  const handleCTA = () => alert("Coming soon! We're still building this. Sign up is free for now — enjoy full access.");

  return (
    <div className="fu d2">
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: "clamp(1.4rem,5vw,1.8rem)", letterSpacing: "-0.03em", marginBottom: 8 }}>
          Simple, honest pricing
        </div>
        <div style={{ fontSize: "0.82rem", color: T.muted, lineHeight: 1.6, maxWidth: 360, margin: "0 auto" }}>
          No credit card required to start. No dark patterns. We'll remind you 3 days before any renewal.
        </div>
      </div>

      {/* Plan cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        {/* Free plan */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: "20px 16px" }}>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: "1rem", color: T.text, marginBottom: 4 }}>Free</div>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: "1.6rem", color: T.teal, marginBottom: 4 }}>$0</div>
          <div style={{ fontSize: "0.65rem", color: T.muted, marginBottom: 16 }}>Forever free</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {FREE_FEATURES.map(f => (
              <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: "0.75rem", color: "rgba(240,238,255,0.75)" }}>
                <span style={{ color: T.teal, flexShrink: 0, marginTop: 1 }}>✓</span>
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Plus plan */}
        <div style={{ background: `linear-gradient(145deg,${T.card},rgba(180,139,250,0.06))`, border: `1px solid ${T.violet}44`, borderRadius: 20, padding: "20px 16px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 10, right: 10, background: `linear-gradient(135deg,${T.pink},${T.violet})`, borderRadius: 100, padding: "3px 10px", fontSize: "0.58rem", fontWeight: 800, color: "#fff" }}>POPULAR</div>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: "1rem", color: T.violet, marginBottom: 4 }}>Reset Plus</div>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: "1.6rem", color: T.violet, marginBottom: 2 }}>$9.99<span style={{ fontSize: "0.75rem", fontWeight: 400, color: T.muted }}>/mo</span></div>
          <div style={{ fontSize: "0.65rem", color: T.muted, marginBottom: 16 }}>or $79/yr — save 34%</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {PLUS_FEATURES.map(f => (
              <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: "0.75rem", color: "rgba(240,238,255,0.85)" }}>
                <span style={{ color: T.violet, flexShrink: 0, marginTop: 1 }}>✓</span>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <button onClick={handleCTA} style={{
        width: "100%", padding: "14px 0", borderRadius: 14, border: "none", cursor: "pointer",
        background: `linear-gradient(135deg,${T.pink},${T.violet})`,
        color: "#fff", fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "0.95rem",
        boxShadow: `0 6px 24px ${T.pink}44`, marginBottom: 20,
      }}>
        Start free — no card required ✨
      </button>

      {/* Trust signals */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        {TRUST_SIGNALS.map(s => (
          <div key={s.label} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "1rem" }}>{s.icon}</span>
            <span style={{ fontSize: "0.75rem", color: "rgba(240,238,255,0.75)", fontWeight: 600 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Pricing note */}
      <div style={{ background: T.card, border: `1px solid ${T.teal}22`, borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: "0.75rem", color: "rgba(240,238,255,0.65)", lineHeight: 1.6 }}>
        <span style={{ color: T.teal, fontWeight: 700 }}>Renewal transparency: </span>
        We'll send you a reminder 3 days before any subscription renewal. No surprise charges. Cancel in one tap from Settings.
      </div>

      {/* Fine print */}
      <div style={{ fontSize: "0.65rem", color: T.muted, lineHeight: 1.6, textAlign: "center", padding: "0 10px" }}>
        YourReset provides general wellness and fitness guidance. It is not a medical service and does not provide medical advice, diagnosis, or treatment. Consult a qualified healthcare professional before starting any fitness or nutrition program. Pricing in USD. Subscriptions auto-renew until cancelled.
      </div>
    </div>
  );
}

export default PricingPage;
