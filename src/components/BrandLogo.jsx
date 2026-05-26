/**
 * BrandLogo — Pacific Deep editorial logomark.
 *
 * Serif Y rendered as inline SVG with a subtle foam-white gradient stroke
 * and a soft phase-accent glow. Pure SVG = sharp at any scale, no PNG.
 * For the App Store icon we still use the premium_ios_logo PNG (added to
 * /public); this component is for in-app header use.
 *
 * Props
 *   size      — outer pixel size (default 28)
 *   showWordmark — render the "YourReset" word next to the mark
 *   muted     — render in low-contrast variant (for inactive states)
 */
export default function BrandLogo({ size = 28, showWordmark = true, muted = false }) {
  const fill   = muted ? "var(--yr-muted)" : "var(--yr-text)";
  const accent = muted ? "var(--yr-muted)" : "var(--phase-accent)";

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <svg
        width={size} height={size} viewBox="0 0 32 32"
        aria-label="YourReset logo"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="yr-y-stroke" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%"   stopColor={accent} stopOpacity="0.9" />
            <stop offset="50%"  stopColor={fill}   stopOpacity="0.95" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.6" />
          </linearGradient>
          {!muted && (
            <radialGradient id="yr-y-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%"  stopColor={accent} stopOpacity="0.30" />
              <stop offset="60%" stopColor={accent} stopOpacity="0.05" />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </radialGradient>
          )}
        </defs>

        {/* Glow disc behind the Y */}
        {!muted && (
          <circle cx="16" cy="16" r="14" fill="url(#yr-y-glow)" />
        )}

        {/* Serif Y — geometric, modeled after Playfair Display */}
        {/* Left diagonal: 8,6 → 16,16   Right diagonal: 24,6 → 16,16 */}
        {/* Stem: 16,16 → 16,26 */}
        <g
          fill="none"
          stroke="url(#yr-y-stroke)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M 8 6 L 16 16" />
          <path d="M 24 6 L 16 16" />
          <path d="M 16 16 L 16 26" />
        </g>
        {/* Serif foot details */}
        <g fill={fill} fillOpacity={muted ? 0.4 : 0.75}>
          <rect x="6.6" y="5.4" width="3" height="1.2" rx="0.5" />
          <rect x="22.4" y="5.4" width="3" height="1.2" rx="0.5" />
          <rect x="13" y="25.4" width="6" height="1.2" rx="0.5" />
        </g>
      </svg>

      {showWordmark && (
        <span style={{
          fontFamily: "var(--font-display)",
          fontSize: 18, fontWeight: 600,
          letterSpacing: "-0.01em",
          color: fill,
          lineHeight: 1,
        }}>
          YourReset
        </span>
      )}
    </div>
  );
}
