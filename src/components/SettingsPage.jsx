import { useState } from "react";
import * as Storage from "../storage";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import DeleteAccountSheet from "./DeleteAccountSheet";

// External URLs. Replace with real hosting when ready. The Manage Subscription
// link uses the itms-apps scheme on iOS which opens the Subscriptions screen
// directly in Settings; on web/Android we fall back to the App Store URL.
const PRIVACY_URL = "https://yourreset.app/privacy";
const TERMS_URL   = "https://yourreset.app/terms";
const SUBSCRIPTION_DEEP_LINK_IOS = "itms-apps://apps.apple.com/account/subscriptions";
const SUBSCRIPTION_WEB_FALLBACK  = "https://apps.apple.com/account/subscriptions";

// Toggle this once a real paywall ships. Until then we still show the row
// (App Store reviewers expect it) but it links to the App Store account
// subscriptions page, which is harmless if the user has no active subscription.
const SHOW_MANAGE_SUBSCRIPTION = true;

async function openExternal(url) {
  try {
    await Browser.open({ url, presentationStyle: "popover" });
  } catch (err) {
    // Web fallback
    if (typeof window !== "undefined") window.open(url, "_blank", "noopener,noreferrer");
  }
}

async function openManageSubscription() {
  if (Capacitor.getPlatform() === "ios") {
    // itms-apps must be opened via window.location (Browser plugin filters it).
    // WKWebView passes the scheme through to UIApplication.openURL on iOS.
    if (typeof window !== "undefined") window.location.href = SUBSCRIPTION_DEEP_LINK_IOS;
    return;
  }
  await openExternal(SUBSCRIPTION_WEB_FALLBACK);
}

const GOALS      = ["fat loss","muscle tone","endurance","strength","flexibility","wellness"];
const EQUIPMENT  = ["bodyweight","dumbbells","barbell","bands","kettlebell","machines","cable","cardio"];
const GENDERS    = ["female","male","non-binary","prefer not to say"];
const ACTIVITIES = [
  { id:"sedentary",   label:"Sedentary",   sub:"desk job, no exercise" },
  { id:"light",       label:"Light",       sub:"1–3 days/week" },
  { id:"moderate",    label:"Moderate",    sub:"3–5 days/week" },
  { id:"active",      label:"Active",      sub:"6–7 days/week" },
  { id:"very_active", label:"Very Active", sub:"2× daily / hard labour" },
];

export default function SettingsPage({ profile, onSave, onClearAll, theme, onSetTheme }) {
  // Existing fields
  const [name,      setName]      = useState(profile.name || "");
  const [goal,      setGoal]      = useState(profile.goal || "fat_loss");
  const [cycling,   setCycling]   = useState(profile.cycleTracking || false);
  const [cycleStart,setCycleStart]= useState(profile.cycleStartDate || "");
  const [cycleLen,  setCycleLen]  = useState(profile.cycleLength || 28);
  const [equipment, setEquipment] = useState(profile.equipment || []);

  // Body metrics
  const [gender,        setGender]        = useState(profile.gender        || "female");
  const [age,           setAge]           = useState(profile.age           || "");
  const [weight,        setWeight]        = useState(profile.weight        || "");
  const [weightUnit,    setWeightUnit]    = useState(profile.weightUnit    || "kg");
  const [goalWeight,    setGoalWeight]    = useState(profile.goalWeight    || "");
  const [heightUnit,    setHeightUnit]    = useState(profile.heightUnit    || "cm");
  // Height stored as cm (if cm mode) or total inches (if ft mode), via two sub-fields
  const [heightCm,  setHeightCm]  = useState(() =>
    profile.heightUnit === "ft" ? "" : (profile.height || "")
  );
  const [heightFt,  setHeightFt]  = useState(() =>
    profile.heightUnit === "ft" ? Math.floor((profile.height || 0) / 12) || "" : ""
  );
  const [heightIn,  setHeightIn]  = useState(() =>
    profile.heightUnit === "ft" ? (profile.height || 0) % 12 || "" : ""
  );

  // Activity
  const [activityLevel, setActivityLevel] = useState(profile.activityLevel || "moderate");

  const [saved,        setSaved]        = useState(false);
  const [deleteSheetOpen, setDeleteSheetOpen] = useState(false);

  const toggleEquip = (eq) =>
    setEquipment(prev => prev.includes(eq) ? prev.filter(e => e !== eq) : [...prev, eq]);

  const handleSave = () => {
    const height = heightUnit === "ft"
      ? parseInt(heightFt || 0) * 12 + parseInt(heightIn || 0)
      : parseFloat(heightCm || 0);
    const p = {
      ...profile,
      name, goal,
      cycleTracking: cycling, cycleStartDate: cycleStart, cycleLength: cycleLen,
      equipment,
      gender, age: parseFloat(age) || null,
      weight: parseFloat(weight) || null, weightUnit,
      height: height || null, heightUnit,
      goalWeight: parseFloat(goalWeight) || null,
      activityLevel,
    };
    Storage.set("profile", p);
    onSave(p);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = async () => {
    const data = Storage.exportAll();
    const json = JSON.stringify(data, null, 2);
    const fileName = `yourreset-data-${new Date().toISOString().slice(0, 10)}.json`;

    // Native (iOS/Android): write to Cache directory then open share sheet
    if (Capacitor.isNativePlatform()) {
      try {
        const written = await Filesystem.writeFile({
          path: fileName,
          data: json,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        });
        await Share.share({
          title: "YourReset data export",
          url: written.uri,
          dialogTitle: "Export YourReset data",
        });
        return;
      } catch (err) {
        console.warn("[settings] native export failed, falling back:", err);
        // fall through to web download
      }
    }

    // Web fallback (Vite dev, browser preview)
    const blob = new Blob([json], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = fileName;
    a.click(); URL.revokeObjectURL(url);
  };

  // Single destructive action. Triggered by the bottom-sheet confirm,
  // which itself requires the user to type DELETE. After clearing, App.jsx
  // resets React state and routes back to onboarding (no window.reload).
  const handleDeleteAccount = async () => {
    await Storage.clearAll();
    if (onClearAll) onClearAll();
  };

  const row  = { borderTop: "1px solid var(--yr-border)", paddingTop: 18, paddingBottom: 8 };
  const lkey = { fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--yr-text)" };
  const lval = { fontSize: 12, color: "var(--phase-accent)", fontFamily: "var(--font-mono)" };
  const numInput = (val, onChange, placeholder, width = 90) => (
    <input
      className="yr-input" type="number" value={val}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ width }}
    />
  );

  return (
    <div className="yr-stack-lg">
      <div>
        <div className="yr-overline">Profile</div>
        <h1 className="yr-display" style={{ fontSize: "clamp(32px,5vw,52px)", fontWeight: 500, letterSpacing: "-0.03em", margin: 0 }}>
          {name || "You"}.
        </h1>
      </div>

      <div className="yr-quad">
        {/* Name */}
        <div className="yr-quad-row" style={row}>
          <div className="yr-quad-label"><div style={lkey}>Display name</div></div>
          <input className="yr-input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
        </div>

        {/* Goal */}
        <div className="yr-quad-row" style={row}>
          <div className="yr-quad-label">
            <div style={lkey}>Primary goal</div>
            <div style={lval}>{goal.replace("_", " ")}</div>
          </div>
          <div className="yr-pills">
            {GOALS.map(g => (
              <button key={g} className={`yr-pill${goal === g.replace(" ", "_") ? " active" : ""}`}
                onClick={() => setGoal(g.replace(" ", "_"))}>{g}</button>
            ))}
          </div>
        </div>

        {/* ── Body metrics ──────────────────────────────────────── */}
        <div className="yr-quad-row" style={row}>
          <div className="yr-quad-label">
            <div style={lkey}>Gender</div>
            <div style={lval}>{gender}</div>
          </div>
          <div className="yr-pills">
            {GENDERS.map(g => (
              <button key={g} className={`yr-pill${gender === g ? " active" : ""}`}
                onClick={() => setGender(g)}>{g}</button>
            ))}
          </div>
        </div>

        <div className="yr-quad-row" style={row}>
          <div className="yr-quad-label">
            <div style={lkey}>Age</div>
            {age && <div style={lval}>{age} yrs</div>}
          </div>
          {numInput(age, setAge, "e.g. 28", 80)}
        </div>

        <div className="yr-quad-row" style={row}>
          <div className="yr-quad-label">
            <div style={lkey}>Weight</div>
            {weight && <div style={lval}>{weight} {weightUnit}</div>}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {numInput(weight, setWeight, weightUnit === "kg" ? "e.g. 65" : "e.g. 143")}
            <div className="yr-pills">
              {["kg", "lb"].map(u => (
                <button key={u} className={`yr-pill${weightUnit === u ? " active" : ""}`}
                  onClick={() => setWeightUnit(u)}>{u}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="yr-quad-row" style={row}>
          <div className="yr-quad-label">
            <div style={lkey}>Goal weight</div>
            {goalWeight && <div style={lval}>{goalWeight} {weightUnit}</div>}
          </div>
          {numInput(goalWeight, setGoalWeight, weightUnit === "kg" ? "e.g. 58" : "e.g. 128")}
        </div>

        <div className="yr-quad-row" style={row}>
          <div className="yr-quad-label">
            <div style={lkey}>Height</div>
            {heightUnit === "cm" && heightCm && <div style={lval}>{heightCm} cm</div>}
            {heightUnit === "ft" && heightFt && <div style={lval}>{heightFt}′{heightIn || 0}″</div>}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {heightUnit === "cm" ? (
              numInput(heightCm, setHeightCm, "e.g. 165")
            ) : (
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {numInput(heightFt, setHeightFt, "ft", 52)}
                <span style={{ fontSize: 12, color: "var(--yr-muted)" }}>ft</span>
                {numInput(heightIn, setHeightIn, "in", 52)}
                <span style={{ fontSize: 12, color: "var(--yr-muted)" }}>in</span>
              </div>
            )}
            <div className="yr-pills">
              {["cm", "ft"].map(u => (
                <button key={u} className={`yr-pill${heightUnit === u ? " active" : ""}`}
                  onClick={() => setHeightUnit(u)}>{u}</button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Activity level ────────────────────────────────────── */}
        <div className="yr-quad-row" style={row}>
          <div className="yr-quad-label">
            <div style={lkey}>Activity level</div>
            <div style={lval}>{ACTIVITIES.find(a => a.id === activityLevel)?.label || activityLevel}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {ACTIVITIES.map(a => (
              <button
                key={a.id}
                onClick={() => setActivityLevel(a.id)}
                style={{
                  display: "flex", gap: 10, alignItems: "center",
                  padding: "8px 12px", borderRadius: 10, cursor: "pointer",
                  border: `1px solid ${activityLevel === a.id ? "var(--phase-accent)" : "var(--yr-border)"}`,
                  background: activityLevel === a.id ? "var(--phase-soft)" : "transparent",
                  textAlign: "left",
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: activityLevel === a.id ? "var(--phase-accent)" : "var(--yr-border)", flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: activityLevel === a.id ? "var(--phase-accent)" : "var(--yr-text)" }}>{a.label}</div>
                  <div style={{ fontSize: 11, color: "var(--yr-muted)" }}>{a.sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Cycle ─────────────────────────────────────────────── */}
        <div className="yr-quad-row" style={row}>
          <div className="yr-quad-label">
            <div style={lkey}>Cycle-aware training</div>
            <div style={lval}>{cycling ? "on" : "off"}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setCycling(c => !c)} style={{
              width: 52, height: 30, borderRadius: 999, border: "1px solid var(--yr-border)",
              background: cycling ? "var(--phase-accent)" : "var(--yr-surface-2)", position: "relative", cursor: "pointer",
            }}>
              <div style={{ position: "absolute", top: 3, left: cycling ? 25 : 3, width: 22, height: 22, borderRadius: "50%", background: "#fff", transition: "left 0.18s" }} />
            </button>
            <span style={{ fontSize: 12, color: "var(--yr-muted)" }}>Adapts workouts to your phase</span>
          </div>
        </div>

        {cycling && (
          <div className="yr-quad-row" style={row}>
            <div className="yr-quad-label"><div style={lkey}>Last period start</div></div>
            <input type="date" className="yr-input" value={cycleStart} onChange={e => setCycleStart(e.target.value)} />
          </div>
        )}

        {/* ── Equipment ─────────────────────────────────────────── */}
        <div className="yr-quad-row" style={row}>
          <div className="yr-quad-label">
            <div style={lkey}>Available equipment</div>
            <div style={lval}>{equipment.length} selected</div>
          </div>
          <div className="yr-pills">
            {EQUIPMENT.map(eq => (
              <button key={eq} className={`yr-pill${equipment.includes(eq) ? " active" : ""}`}
                onClick={() => toggleEquip(eq)}>{eq}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Save */}
      <button onClick={handleSave} style={{
        width: "100%", padding: "14px", border: "none", borderRadius: 12, cursor: "pointer",
        background: saved ? "var(--yr-surface-2)" : "var(--phase-accent)",
        color: saved ? "var(--yr-text-2)" : "#0a0a0a",
        fontFamily: "inherit", fontWeight: 700, fontSize: 14,
      }}>
        {saved ? "Saved ✓" : "Save changes"}
      </button>

      {/* Appearance — theme toggle, moved here from the header to free up
          top-bar space on mobile. */}
      {onSetTheme && (
        <div style={{ borderTop: "1px solid var(--yr-border)", paddingTop: 20 }}>
          <div className="yr-overline">Appearance</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "var(--yr-text)" }}>Theme</div>
              <div style={{ fontSize: 12, color: "var(--yr-muted)", marginTop: 2 }}>
                {theme === "dark" ? "Dark mode for low light" : "Light mode for daytime"}
              </div>
            </div>
            <div className="yr-pills">
              {["dark", "light"].map(t => (
                <button
                  key={t}
                  className={`yr-pill${theme === t ? " active" : ""}`}
                  onClick={() => onSetTheme(t)}
                  aria-pressed={theme === t}
                >
                  {t === "dark" ? "🌙 Dark" : "☀️ Light"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Account & privacy — App Store-required actions live here. */}
      <div style={{ borderTop: "1px solid var(--yr-border)", paddingTop: 20 }}>
        <div className="yr-overline">Account & privacy</div>
        <p style={{ fontSize: 12, color: "var(--yr-muted)", margin: "8px 0 16px", lineHeight: 1.6 }}>
          All data is stored on this device only. Nothing is sent to any server.
        </p>

        {/* Action rows — iOS-style list, full-width tappable rows */}
        <div className="yr-settings-rows">
          <SettingsRow
            label="Privacy Policy"
            helper="How your data is handled"
            trailing="→"
            onTap={() => openExternal(PRIVACY_URL)}
          />
          <SettingsRow
            label="Terms of Service"
            helper="Conditions of use"
            trailing="→"
            onTap={() => openExternal(TERMS_URL)}
          />
          {SHOW_MANAGE_SUBSCRIPTION && (
            <SettingsRow
              label="Manage Subscription"
              helper="Opens iOS Settings → Subscriptions"
              trailing="→"
              onTap={openManageSubscription}
            />
          )}
          <SettingsRow
            label="Export my data"
            helper="Save a JSON copy via the share sheet"
            trailing="↗"
            onTap={handleExport}
          />
          <SettingsRow
            label="Delete account & all data"
            helper="Permanently remove everything from this device"
            trailing="⚠︎"
            destructive
            onTap={() => setDeleteSheetOpen(true)}
          />
        </div>

        <div style={{ marginTop: 20, fontSize: 11, color: "var(--yr-faint)", lineHeight: 1.6 }}>
          Medical disclaimer: YourReset provides wellness and fitness guidance for
          informational purposes only. It is not a medical service and does not
          provide medical advice, diagnosis, or treatment. Consult a qualified
          healthcare professional before starting any fitness or nutrition program.
        </div>
      </div>

      <DeleteAccountSheet
        open={deleteSheetOpen}
        onCancel={() => setDeleteSheetOpen(false)}
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
}

/**
 * iOS-style settings row. Full-width tap target, label + helper text,
 * trailing glyph. Destructive variant tints the label red.
 */
function SettingsRow({ label, helper, trailing, onTap, destructive = false }) {
  return (
    <button
      onClick={onTap}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        width: "100%", padding: "14px 16px",
        background: "var(--yr-surface)",
        border: "1px solid var(--yr-border)",
        borderRadius: 14,
        marginBottom: 8,
        cursor: "pointer",
        fontFamily: "inherit",
        textAlign: "left",
        minHeight: 56,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 500,
          color: destructive ? "#fc8181" : "var(--yr-text)",
        }}>{label}</div>
        {helper && (
          <div style={{
            fontSize: 11, color: "var(--yr-muted)",
            marginTop: 2,
          }}>{helper}</div>
        )}
      </div>
      <span aria-hidden="true" style={{
        fontSize: 16,
        color: destructive ? "#fc8181" : "var(--yr-muted)",
        fontFamily: "var(--font-mono)",
      }}>{trailing}</span>
    </button>
  );
}
