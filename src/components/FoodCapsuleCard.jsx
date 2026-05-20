import { useMemo, useState, useRef, useCallback } from "react";
import { getFuelLog, getTodayKey } from "../storage";

// ── Emoji mapping ─────────────────────────────────────────────────────────
const FOOD_MAP = [
  { k: ["smoothie","shake","açaí","acai"],                     e: "🥤" },
  { k: ["protein shake","protein bar","protein powder"],       e: "💪" },
  { k: ["coffee","espresso","latte","matcha"],                  e: "☕" },
  { k: ["tea","herbal","chamomile","green tea"],                e: "🍵" },
  { k: ["egg","omelette","scrambled","poached","fried egg"],   e: "🥚" },
  { k: ["oat","porridge","oatmeal","overnight oat"],           e: "🌾" },
  { k: ["granola","muesli"],                                   e: "🥣" },
  { k: ["toast","bread","bagel","croissant","sourdough"],      e: "🍞" },
  { k: ["chicken","turkey","poultry","grilled chicken"],       e: "🍗" },
  { k: ["salmon","fish","tuna","seafood","cod","tilapia"],     e: "🐟" },
  { k: ["beef","steak","meat","burger","mince"],               e: "🥩" },
  { k: ["tofu","tempeh","edamame"],                            e: "🫘" },
  { k: ["rice","grain","quinoa","barley"],                     e: "🍚" },
  { k: ["pasta","noodle","spaghetti","ramen","penne"],         e: "🍝" },
  { k: ["salad","greens","lettuce","spinach","kale","arugula"],e: "🥗" },
  { k: ["avocado","avo","guacamole"],                          e: "🥑" },
  { k: ["sweet potato","yam","butternut"],                     e: "🍠" },
  { k: ["broccoli","vegetable","veggie","zucchini","carrot"],  e: "🥦" },
  { k: ["yogurt","dairy","kefir"],                             e: "🥛" },
  { k: ["cheese","feta","cheddar","mozzarella"],               e: "🧀" },
  { k: ["soup","stew","curry","broth","chili","chilli"],       e: "🍲" },
  { k: ["strawberr","blueberr","raspberry","blackberr"],       e: "🍓" },
  { k: ["berry","fruit bowl","mixed fruit","fruit salad"],     e: "🍓" },
  { k: ["banana","plantain"],                                  e: "🍌" },
  { k: ["mango","papaya","pineapple","tropical"],              e: "🥭" },
  { k: ["apple","pear","peach","plum"],                        e: "🍎" },
  { k: ["grape","fig","date","dried fruit"],                   e: "🍇" },
  { k: ["orange","mandarin","grapefruit","citrus"],            e: "🍊" },
  { k: ["wrap","burrito","taco"],                              e: "🌯" },
  { k: ["bowl","poke","grain bowl","buddha"],                  e: "🥣" },
  { k: ["sandwich","sub","panini"],                            e: "🥪" },
  { k: ["pizza"],                                              e: "🍕" },
  { k: ["chocolate","sweet","cookie","cake","dessert","brownie"],e:"🍫"},
  { k: ["nut","almond","walnut","cashew","peanut","pistachio"],e: "🥜" },
  { k: ["hummus","dip","tahini"],                              e: "🫙" },
  { k: ["olive","olive oil"],                                  e: "🫒" },
];

function mealToEmoji(name) {
  const n = (name || "").toLowerCase();
  for (const { k, e } of FOOD_MAP) {
    if (k.some(kw => n.includes(kw))) return e;
  }
  return "🍽";
}

function buildTokens(log) {
  const tokens = [];
  for (const type of ["breakfast","lunch","dinner","snack"]) {
    const entries = (log.meals || []).filter(m => m.type === type);
    if (!entries.length) continue;
    tokens.push(mealToEmoji(entries[0].name));
    if (entries.length > 1) tokens.push(mealToEmoji(entries[1].name));
    if (entries.length > 2) tokens.push(`+${entries.length - 2}`);
  }
  const glasses = Math.min(3, Math.floor((log.water || 0) / 500));
  for (let i = 0; i < glasses; i++) tokens.push("💧");
  return tokens.slice(0, 5); // max 5 — fewer, bigger
}

// Five well-spaced slots inside the belly oval
const TOKEN_SLOTS = [
  { x: 20, y: 18, delay: 0.0, dur: 3.6 },
  { x: 62, y: 14, delay: 0.8, dur: 4.8 },
  { x: 14, y: 58, delay: 1.4, dur: 4.2 },
  { x: 56, y: 58, delay: 0.4, dur: 3.9 },
  { x: 38, y: 36, delay: 1.1, dur: 5.0 },
];

export default function FoodCapsuleCard({ onTap }) {
  const log    = getFuelLog(getTodayKey());
  const tokens = useMemo(() => buildTokens(log), [log]);
  const isEmpty = tokens.length === 0;

  const cardRef = useRef(null);
  const [eyeOff,  setEyeOff]  = useState({ x: 0, y: 0 });
  const [foodTilt, setFoodTilt] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);

  // Desktop-only: (hover: none) = touch device, skip tracking
  const canHover = () =>
    typeof window !== "undefined" && !window.matchMedia("(hover: none)").matches;

  const handleMouseMove = useCallback((e) => {
    if (!canHover() || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();

    // Eye tracking: offset relative to head center (head is ~top:14, 148×138, centred)
    const headCX = rect.left + rect.width  / 2;
    const headCY = rect.top  + 14 + 138 / 2; // approx head centre in viewport
    const dx = e.clientX - headCX;
    const dy = e.clientY - headCY;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const cap  = 3; // max 3px travel
    setEyeOff({
      x: (dx / dist) * Math.min(cap, dist * 0.06),
      y: (dy / dist) * Math.min(cap * 0.6, dist * 0.04),
    });

    // Food tilt: gentle drift toward cursor (normalised –0.5..0.5 of card)
    const fx = (e.clientX - rect.left - rect.width  / 2) / rect.width;
    const fy = (e.clientY - rect.top  - rect.height / 2) / rect.height;
    setFoodTilt({ x: fx * 5, y: fy * 4 }); // max ±2.5 / ±2 px
  }, []);

  const handleMouseLeave = useCallback(() => {
    setEyeOff({ x: 0, y: 0 });
    setFoodTilt({ x: 0, y: 0 });
    setHovering(false);
  }, []);

  const totalMeals = new Set((log.meals || []).map(m => m.type)).size;
  const totalKcal  = (log.meals || []).reduce((s, m) => s + (parseFloat(m.calories) || 0), 0);
  const waterL     = ((log.water || 0) / 1000).toFixed(1);

  const caption = isEmpty
    ? "Log your first meal in Fuel →"
    : `${totalMeals} meal${totalMeals !== 1 ? "s" : ""} · ${Math.round(totalKcal)} kcal · ${waterL} L water`;

  // Skin: soft accent tint. Dark: deeper for ears/paws.
  const skin  = "color-mix(in oklch, var(--phase-accent) 20%, var(--yr-bg-elev))";
  const dark  = "color-mix(in oklch, var(--phase-accent) 55%, var(--yr-text))";
  const mid   = "color-mix(in oklch, var(--phase-accent) 35%, var(--yr-bg-elev))";
  const blush = "color-mix(in oklch, var(--phase-accent) 50%, #ffb3c6)";
  const acc   = "var(--phase-accent)";

  return (
    <>
      <style>{`
        @keyframes capsule-float {
          0%, 100% { transform: translateY(0px) rotate(0deg)   scale(1);    }
          40%       { transform: translateY(-7px) rotate(4deg)  scale(1.04); }
          70%       { transform: translateY(-4px) rotate(-3deg) scale(1.01); }
        }
        @keyframes sparkle-pulse {
          0%, 100% { opacity: 0.25; transform: scale(0.75); }
          50%       { opacity: 0.75; transform: scale(1.15); }
        }
        @keyframes cat-blink {
          0%, 88%, 100% { transform: scaleY(1); }
          93%            { transform: scaleY(0.06); }
          96%            { transform: scaleY(1); }
        }
        .cat-eye {
          display: inline-block;
          transform-origin: center;
          animation: cat-blink 4s ease-in-out infinite;
        }
        .cat-eye-right { animation-delay: 0.05s; }
        @media (prefers-reduced-motion: reduce) {
          .capsule-token, .capsule-sparkle, .cat-eye { animation: none !important; }
        }
      `}</style>

      <div
        ref={cardRef}
        onClick={onTap}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => canHover() && setHovering(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: 14, padding: "20px 16px 18px",
          background: "var(--yr-surface-2)",
          borderRadius: 24,
          border: "1px solid var(--yr-border)",
          userSelect: "none",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <div className="yr-overline" style={{ alignSelf: "flex-start" }}>Food Capsule</div>

        {/* ── Character canvas ── */}
        <div style={{ position: "relative", width: 220, height: 300 }}>

          {/* Background radial glow */}
          <div style={{
            position: "absolute", top: "15%", left: "50%",
            transform: "translateX(-50%)",
            width: 220, height: 220, borderRadius: "50%",
            background: `radial-gradient(circle, color-mix(in oklch, var(--phase-accent) 32%, transparent) 0%, transparent 65%)`,
            filter: "blur(22px)",
            zIndex: 0, pointerEvents: "none",
          }} />

          {/* ── Left ear ── */}
          <div style={{
            position: "absolute", left: 20, top: 4,
            width: 48, height: 56, borderRadius: "50% 50% 40% 40%",
            background: dark, zIndex: 1,
          }}>
            {/* inner ear */}
            <div style={{
              position: "absolute", top: 7, left: 7, right: 7, bottom: 12,
              borderRadius: "50% 50% 40% 40%",
              background: blush, opacity: 0.55,
            }} />
          </div>

          {/* ── Right ear ── */}
          <div style={{
            position: "absolute", right: 20, top: 4,
            width: 48, height: 56, borderRadius: "50% 50% 40% 40%",
            background: dark, zIndex: 1,
          }}>
            <div style={{
              position: "absolute", top: 7, left: 7, right: 7, bottom: 12,
              borderRadius: "50% 50% 40% 40%",
              background: blush, opacity: 0.55,
            }} />
          </div>

          {/* ── Head ── */}
          <div style={{
            position: "absolute", left: "50%", top: 14,
            transform: "translateX(-50%)",
            width: 148, height: 138,
            background: skin,
            border: `2px solid color-mix(in oklch, var(--phase-accent) 30%, transparent)`,
            borderRadius: "50%",
            boxShadow: `0 4px 20px color-mix(in oklch, var(--phase-accent) 14%, transparent), inset 0 -6px 16px rgba(0,0,0,0.06)`,
            zIndex: 2,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 5,
          }}>
            {/* 3 plush fur tuft strands — warm rose, not dark */}
            <svg
              width="28" height="13" viewBox="0 0 28 13"
              style={{
                position: "absolute", top: -11, left: "50%",
                transform: "translateX(-50%)",
                color: "color-mix(in oklch, var(--phase-accent) 68%, #b06070)",
                overflow: "visible",
              }}
            >
              <path d="M 5 12 Q 3 6 5 1"  stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.62"/>
              <path d="M 14 12 Q 14 5 14 1" stroke="currentColor" strokeWidth="1.9" fill="none" strokeLinecap="round" opacity="0.70"/>
              <path d="M 23 12 Q 25 6 23 1" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.62"/>
            </svg>

            {/* Forehead highlight — slightly stronger */}
            <div style={{
              position: "absolute", top: 10, left: "18%",
              width: "42%", height: "26%",
              background: "rgba(255,255,255,0.30)",
              borderRadius: "50%", filter: "blur(5px)",
            }} />

            {/* Eyes — round open circles, blink via scaleY */}
            <div style={{
              display: "flex", gap: 20, marginTop: 22,
              transform: `translate(${eyeOff.x}px, ${eyeOff.y}px)`,
              transition: hovering ? "transform 0.08s ease-out" : "transform 0.5s ease-out",
              willChange: "transform",
            }}>
              {["cat-eye", "cat-eye cat-eye-right"].map((cls, i) => (
                <span key={i} className={cls} style={{ position: "relative", display: "inline-block" }}>
                  {/* Iris */}
                  <div style={{
                    width: 13, height: 13, borderRadius: "50%",
                    background: "var(--yr-text)",
                  }} />
                  {/* Shine */}
                  <div style={{
                    position: "absolute", top: 2, right: 2,
                    width: 4, height: 4, borderRadius: "50%",
                    background: "rgba(255,255,255,0.72)",
                    pointerEvents: "none",
                  }} />
                </span>
              ))}
            </div>

            {/* Nose */}
            <div style={{
              width: 8, height: 6,
              background: acc,
              borderRadius: "50%", opacity: 0.70,
              marginLeft: 2,
            }} />

            {/* Mouth — slightly asymmetric smile */}
            <svg width="22" height="10" viewBox="0 0 22 10" style={{ marginTop: -2 }}>
              <path d="M 4 3 Q 12 10 18 4" stroke="var(--yr-text)" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.50"/>
            </svg>

            {/* Blush cheeks — radial gradient, softer fade */}
            <div style={{
              position: "absolute",
              display: "flex", gap: 58,
              top: "58%", transform: "translateY(-50%)",
            }}>
              {[0, 1].map(i => (
                <div key={i} style={{
                  width: 30, height: 18,
                  background: `radial-gradient(ellipse at center, ${blush} 0%, color-mix(in oklch, ${blush} 60%, transparent) 55%, transparent 100%)`,
                  borderRadius: "50%", opacity: 0.72,
                }} />
              ))}
            </div>
          </div>

          {/* ── Collar ── */}
          <div style={{
            position: "absolute", left: "50%", top: 134,
            transform: "translateX(-50%)",
            width: 96, height: 16,
            background: `linear-gradient(135deg, ${mid}, color-mix(in oklch, var(--phase-accent) 45%, transparent))`,
            borderRadius: 999, zIndex: 4,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 2px 8px color-mix(in oklch, var(--phase-accent) 20%, transparent)`,
          }}>
            <span style={{ fontSize: 11 }}>🤍</span>
          </div>

          {/* ── Left arm ── */}
          <div style={{
            position: "absolute", left: 4, top: 150,
            width: 36, height: 62,
            background: skin,
            border: `2px solid color-mix(in oklch, var(--phase-accent) 25%, transparent)`,
            borderRadius: "50% 20% 50% 50%",
            zIndex: 2,
          }}>
            <div style={{
              position: "absolute", top: 6, left: 6, right: 6,
              height: "40%",
              background: "rgba(255,255,255,0.14)",
              borderRadius: "50%", filter: "blur(3px)",
            }} />
          </div>

          {/* ── Right arm ── */}
          <div style={{
            position: "absolute", right: 4, top: 150,
            width: 36, height: 62,
            background: skin,
            border: `2px solid color-mix(in oklch, var(--phase-accent) 25%, transparent)`,
            borderRadius: "20% 50% 50% 50%",
            zIndex: 2,
          }}>
            <div style={{
              position: "absolute", top: 6, left: 6, right: 6,
              height: "40%",
              background: "rgba(255,255,255,0.14)",
              borderRadius: "50%", filter: "blur(3px)",
            }} />
          </div>

          {/* ── Body / glassy belly ── */}
          <div style={{
            position: "absolute", left: "50%", top: 144,
            transform: "translateX(-50%)",
            width: 162, height: 146,
            borderRadius: "50%",
            background: [
              "radial-gradient(ellipse at 28% 20%, rgba(255,255,255,0.52) 0%, transparent 45%)",
              "radial-gradient(ellipse at 72% 78%, rgba(255,255,255,0.14) 0%, transparent 40%)",
              isEmpty
                ? "rgba(255,255,255,0.09)"
                : `radial-gradient(ellipse at 60% 70%, color-mix(in oklch, var(--phase-accent) 26%, transparent) 0%, transparent 52%), rgba(255,255,255,0.10)`,
            ].join(", "),
            border: "2px solid rgba(255,255,255,0.44)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            boxShadow: [
              `inset 0 2px 18px rgba(255,255,255,0.30)`,
              `inset 0 0 50px color-mix(in oklch, var(--phase-accent) 22%, transparent)`,
              `0 10px 44px color-mix(in oklch, var(--phase-accent) 28%, transparent)`,
              `0 0 0 1px rgba(255,255,255,0.12)`,
            ].join(", "),
            zIndex: 3,
            overflow: "hidden",
          }}>
            {/* Top-left gloss arc */}
            <div style={{
              position: "absolute", top: 10, left: "12%",
              width: "52%", height: "30%",
              background: "rgba(255,255,255,0.30)",
              borderRadius: "50%",
              filter: "blur(7px)",
              transform: "rotate(-12deg)",
            }} />
            {/* Bottom right glow */}
            <div style={{
              position: "absolute", bottom: 8, right: "10%",
              width: "35%", height: "22%",
              background: `color-mix(in oklch, var(--phase-accent) 22%, rgba(255,255,255,0.1))`,
              borderRadius: "50%",
              filter: "blur(10px)",
            }} />

            {/* Sparkles when empty */}
            {isEmpty && [
              { x: 22, y: 18, s: 1.1, d: 0.0 },
              { x: 58, y: 15, s: 0.7, d: 0.9 },
              { x: 72, y: 52, s: 1.0, d: 0.5 },
              { x: 28, y: 62, s: 0.8, d: 1.4 },
              { x: 50, y: 38, s: 0.9, d: 0.3 },
            ].map((sp, i) => (
              <div key={i} className="capsule-sparkle" style={{
                position: "absolute",
                left: `${sp.x}%`, top: `${sp.y}%`,
                fontSize: 10 * sp.s,
                animation: `sparkle-pulse ${2.2 + sp.d}s ease-in-out ${sp.d}s infinite`,
                color: acc, opacity: 0.4,
              }}>✦</div>
            ))}

            {/* Food tokens: outer = cursor tilt, inner = float animation */}
            {tokens.map((token, i) => {
              const slot   = TOKEN_SLOTS[i];
              const isText = token.startsWith("+");
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: `${slot.x}%`, top: `${slot.y}%`,
                    transform: hovering
                      ? `translate(${foodTilt.x * 0.55}px, ${foodTilt.y * 0.5}px) rotate(${foodTilt.x * 1.8}deg)`
                      : "none",
                    transition: hovering
                      ? "transform 0.14s ease-out"
                      : "transform 0.55s ease-out",
                    willChange: "transform",
                  }}
                >
                  <div
                    className="capsule-token"
                    style={{
                      fontSize: isText ? 11 : 22,
                      lineHeight: 1,
                      animation: `capsule-float ${slot.dur}s ease-in-out ${slot.delay}s infinite`,
                      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.18))",
                      fontWeight: isText ? 800 : "normal",
                      color: isText ? "var(--yr-text-2)" : undefined,
                      background: isText ? "rgba(255,255,255,0.2)" : undefined,
                      borderRadius: isText ? 99 : 0,
                      padding: isText ? "2px 6px" : 0,
                    }}
                  >
                    {token}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Left paw ── */}
          <div style={{
            position: "absolute", left: 4, bottom: 0,
            width: 68, height: 48,
            background: `radial-gradient(ellipse at 40% 30%, color-mix(in oklch, ${dark} 80%, rgba(255,255,255,0.2)) 0%, ${dark} 60%)`,
            borderRadius: "50%",
            boxShadow: `0 5px 14px color-mix(in oklch, var(--phase-accent) 24%, transparent), inset 0 2px 6px rgba(255,255,255,0.12)`,
            zIndex: 4,
            display: "flex", alignItems: "flex-end", justifyContent: "center",
            paddingBottom: 7, gap: 4,
          }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                position: "relative", width: 11, height: 11, borderRadius: "50%",
                background: `radial-gradient(circle at 38% 35%, color-mix(in oklch, ${blush} 90%, white) 0%, ${blush} 70%)`,
                boxShadow: "inset 0 1px 2px rgba(255,255,255,0.35), inset 0 -1px 2px rgba(0,0,0,0.12)",
                opacity: 0.88,
              }}>
                <div style={{ position:"absolute", top:2, left:2, width:3, height:3, borderRadius:"50%", background:"rgba(255,255,255,0.5)" }} />
              </div>
            ))}
          </div>

          {/* ── Right paw ── */}
          <div style={{
            position: "absolute", right: 4, bottom: 0,
            width: 68, height: 48,
            background: `radial-gradient(ellipse at 40% 30%, color-mix(in oklch, ${dark} 80%, rgba(255,255,255,0.2)) 0%, ${dark} 60%)`,
            borderRadius: "50%",
            boxShadow: `0 5px 14px color-mix(in oklch, var(--phase-accent) 24%, transparent), inset 0 2px 6px rgba(255,255,255,0.12)`,
            zIndex: 4,
            display: "flex", alignItems: "flex-end", justifyContent: "center",
            paddingBottom: 7, gap: 4,
          }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                position: "relative", width: 11, height: 11, borderRadius: "50%",
                background: `radial-gradient(circle at 38% 35%, color-mix(in oklch, ${blush} 90%, white) 0%, ${blush} 70%)`,
                boxShadow: "inset 0 1px 2px rgba(255,255,255,0.35), inset 0 -1px 2px rgba(0,0,0,0.12)",
                opacity: 0.88,
              }}>
                <div style={{ position:"absolute", top:2, left:2, width:3, height:3, borderRadius:"50%", background:"rgba(255,255,255,0.5)" }} />
              </div>
            ))}
          </div>

          {/* ── Floating bubbles around torso ── */}
          {[
            { left:  8, top: 180, size: 7,  delay: 0.0, dur: 4.2 },
            { left: 196, top: 194, size: 5,  delay: 0.9, dur: 3.8 },
            { left: 18, top: 230, size: 9,  delay: 1.6, dur: 5.0 },
            { left: 188, top: 158, size: 6,  delay: 0.4, dur: 4.6 },
            { left: 200, top: 240, size: 4,  delay: 1.2, dur: 3.5 },
          ].map((b, i) => (
            <div key={i} className="capsule-sparkle" style={{
              position: "absolute", left: b.left, top: b.top,
              width: b.size, height: b.size, borderRadius: "50%",
              background: "rgba(255,255,255,0.35)",
              border: `1px solid color-mix(in oklch, var(--phase-accent) 30%, rgba(255,255,255,0.4))`,
              animation: `capsule-float ${b.dur}s ease-in-out ${b.delay}s infinite`,
              zIndex: 5,
            }} />
          ))}
        </div>

        {/* Caption */}
        <div style={{
          fontSize: 12,
          color: isEmpty ? acc : "var(--yr-muted)",
          textAlign: "center", lineHeight: 1.5,
          fontWeight: isEmpty ? 600 : 400,
        }}>
          {caption}
        </div>
      </div>
    </>
  );
}
