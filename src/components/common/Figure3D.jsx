import React from 'react';
import { EXERCISE_IMAGE_MAP, FEMALE_HERO, MALE_HERO } from '../../constants/exercises';

export function Figure3D({ animKey, color, height = 220, charType = 'female' }) {
  const imgSrc = EXERCISE_IMAGE_MAP[animKey] || (charType === 'female' ? FEMALE_HERO : MALE_HERO);

  return (
    <div style={{
      width: "100%", height, borderRadius: 16, overflow: "hidden",
      background: `linear-gradient(160deg, #05060f 0%, #0d0820 100%)`,
      position: "relative",
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      {/* Neon floor glow */}
      <div style={{
        position: "absolute", bottom: 0, left: "10%", right: "10%", height: "40%",
        background: `radial-gradient(ellipse at 50% 100%, ${color}33 0%, transparent 70%)`,
        pointerEvents: "none"
      }} />
      {/* Rim light top */}
      <div style={{
        position: "absolute", top: 0, left: "20%", right: "20%", height: "30%",
        background: `radial-gradient(ellipse at 50% 0%, ${color}18 0%, transparent 70%)`,
        pointerEvents: "none"
      }} />
      {/* Character image with float animation */}
      <img
        key={imgSrc}
        src={imgSrc}
        alt={animKey}
        style={{
          height: height > 150 ? "95%" : "85%",
          width: "auto",
          objectFit: "contain",
          position: "relative",
          zIndex: 1,
          animation: "figFloat 3s ease-in-out infinite",
          filter: `drop-shadow(0 0 18px ${color}88) drop-shadow(0 6px 20px rgba(0,0,0,0.8))`,
        }}
      />
      {/* Neon trim line at bottom */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
      }} />
      <style>{`
        @keyframes figFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
