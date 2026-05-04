import React from "react";

export default function BackgroundAtmosphere() {
  return (
    <div className="yr-atmosphere">
      {/* Base: Vignette and subtle glow */}
      <div className="yr-atmo-vignette" />
      <div className="yr-atmo-halo" />

      {/* Middle: Orbital geometry */}
      <div className="yr-atmo-orbits">
        <svg className="yr-atmo-orbit-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          <circle className="yr-atmo-orbit-ring ring-slow" cx="50" cy="50" r="48" />
          <circle className="yr-atmo-orbit-ring ring-mid" cx="50" cy="50" r="35" strokeDasharray="2 6" />
          <circle className="yr-atmo-orbit-ring ring-fast" cx="50" cy="50" r="22" strokeDasharray="1 8" />
        </svg>
      </div>

      {/* Top: Film grain shimmer */}
      <div className="yr-atmo-grain" />
    </div>
  );
}
