export default function PricingPage({ T }) {
  const PRICING_TIERS = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      cadence: "forever",
      description: "Start with cycle-aware movement and basic tracking.",
      cta: "Current plan",
      highlighted: false,
      features: [
        "Cycle phase overview",
        "Sample workouts",
        "Basic equipment profile",
        "Limited workout history",
        "Health snapshot preview"
      ]
    },
    {
      id: "plus",
      name: "Reset Plus",
      price: "$9.99",
      cadence: "per month",
      description: "Adaptive workouts, progress tracking, and deeper cycle guidance.",
      cta: "Start free trial",
      highlighted: true,
      features: [
        "Full adaptive workout plans",
        "Equipment-aware exercise filtering",
        "Progressive overload tracker",
        "Cycle-aware sets, reps, and intensity guidance",
        "Readiness check-ins",
        "Nutrition nudges by phase",
        "Apple Health / Google Fit sync",
        "Unlimited workout history"
      ]
    }
  ];

  const TRUST_POINTS = [
    "Clear renewal date before you subscribe",
    "Cancel anytime in Settings",
    "Reminder before annual renewal",
    "No hidden equipment or coaching fees",
    "Your health data stays under your control"
  ];

  const subscriptionStatus = {
    plan: "Free",
    trialStatus: "Not started",
    renewalDate: "—",
    canCancel: false
  };

  return (
    <section style={{ display: "grid", gap: 18 }}>
      <div>
        <div style={{ opacity: 0.7, fontSize: 13 }}>Subscription</div>
        <h1 style={{ margin: "6px 0 8px" }}>Choose your reset</h1>
        <p style={{ margin: 0, opacity: 0.75, lineHeight: 1.5 }}>
          Start free, then upgrade when you want adaptive plans, deeper tracking,
          and phase-aware coaching.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 14
        }}
      >
        {PRICING_TIERS.map((tier) => (
          <PricingCard key={tier.id} tier={tier} T={T} />
        ))}
      </div>

      <SubscriptionStatusCard T={T} status={subscriptionStatus} />

      <TrustBillingCard T={T} points={TRUST_POINTS} />
    </section>
  );
}

function PricingCard({ tier, T }) {
  return (
    <div
      style={{
        padding: 18,
        borderRadius: 26,
        background: tier.highlighted
          ? `linear-gradient(135deg, ${T.violet}26, ${T.green}16)`
          : T.card,
        border: `1px solid ${tier.highlighted ? T.violet + "66" : T.border}`
      }}
    >
      {tier.highlighted && (
        <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>
          Best for progress
        </div>
      )}

      <h2 style={{ margin: 0 }}>{tier.name}</h2>

      <div style={{ marginTop: 10 }}>
        <span style={{ fontSize: 34, fontWeight: 800 }}>{tier.price}</span>
        <span style={{ opacity: 0.65 }}> / {tier.cadence}</span>
      </div>

      <p style={{ opacity: 0.75, lineHeight: 1.45, marginTop: 12 }}>{tier.description}</p>

      <button
        style={{
          width: "100%",
          padding: "12px 14px",
          borderRadius: 16,
          border: "none",
          marginTop: 16,
          background: tier.highlighted ? T.violet : T.card2,
          color: tier.highlighted ? "#fff" : T.text,
          fontWeight: 700,
          cursor: "pointer"
        }}
      >
        {tier.cta}
      </button>

      <ul style={{ paddingLeft: 18, lineHeight: 1.8, marginTop: 24 }}>
        {tier.features.map((feature) => (
          <li key={feature} style={{ fontSize: 14, color: "rgba(255,255,255,0.85)" }}>{feature}</li>
        ))}
      </ul>
    </div>
  );
}

function SubscriptionStatusCard({ T, status }) {
  return (
    <div
      style={{
        padding: 18,
        borderRadius: 24,
        background: T.card,
        border: `1px solid ${T.border}`
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 16 }}>Subscription status</h3>

      <div style={{ display: "grid", gap: 10, fontSize: 14 }}>
        <Row label="Current plan" value={status.plan} />
        <Row label="Trial status" value={status.trialStatus} />
        <Row label="Renewal date" value={status.renewalDate} />
      </div>

      <button
        style={{
          width: "100%",
          marginTop: 20,
          padding: "11px 14px",
          borderRadius: 14,
          border: `1px solid ${T.border}`,
          background: T.card2,
          color: T.text,
          cursor: "pointer",
          fontWeight: 600
        }}
      >
        Manage subscription
      </button>
      {status.plan === "Free" && (
        <div style={{ fontSize: 12, opacity: 0.6, marginTop: 14, textAlign: "center" }}>
          No active paid subscription.
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <span style={{ opacity: 0.65 }}>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function TrustBillingCard({ T, points }) {
  return (
    <div
      style={{
        padding: 18,
        borderRadius: 24,
        background: `${T.green}14`,
        border: `1px solid ${T.green}44`
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 12 }}>Billing should feel calm.</h3>
      <p style={{ opacity: 0.78, lineHeight: 1.5, fontSize: 14, margin: 0 }}>
        YourReset is designed to avoid the subscription traps users complain
        about in other fitness apps. You’ll always see your plan, renewal date,
        and cancel option clearly.
      </p>

      <div style={{ display: "grid", gap: 10, fontSize: 14, marginTop: 18 }}>
        {points.map((point) => (
          <div key={point} style={{ display: "flex", gap: 8 }}>
            <span style={{ color: T.green }}>✓</span> {point}
          </div>
        ))}
      </div>
    </div>
  );
}
