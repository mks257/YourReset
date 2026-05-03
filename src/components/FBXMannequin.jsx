/**
 * FBXMannequin — real Mixamo character with 5 exercise animation clips.
 *
 * Source files (public/models/animations/):
 *   bicep-curl.fbx   → "BicepCurl"   covers: curl, hammer_curl, tricep
 *   burpee.fbx       → "Burpee"      covers: squat_jump, burpee
 *   jogging.fbx      → "Jogging"     covers: walk, jumping_jacks, cardio
 *   situp.fbx        → "Situp"       covers: core_raise, core_twist, hinge
 *   start-plank.fbx  → "Plank"       covers: plank, pushup, press_horizontal
 *
 * All other animKeys fall through to "BicepCurl" (standing pose) as default.
 *
 * Replace this component's internals with a better GLB when available.
 * Everything in Exercise3DPreview.jsx above this stays unchanged.
 */

import { useRef, useEffect, useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import { useAnimations } from "@react-three/drei";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { LoopRepeat } from "three";

// ── animKey → clip name ───────────────────────────────────────────────────
const CLIP_MAP = {
  // Curl family
  curl:             "BicepCurl",
  bicep_curl:       "BicepCurl",
  hammer_curl:      "BicepCurl",
  tricep_ext:       "BicepCurl",
  tricep_push:      "BicepCurl",
  press_overhead:   "BicepCurl",
  // Burpee / explosive
  squat_jump:       "Burpee",
  burpee:           "Burpee",
  squat:            "Burpee",
  lunge:            "Burpee",
  // Cardio / locomotion
  walk:             "Jogging",
  jumping_jacks:    "Jogging",
  // Core / floor
  core_raise:       "Situp",
  core_twist:       "Situp",
  hinge:            "Situp",
  pull_down:        "Situp",
  // Plank / floor pressing
  plank:            "Plank",
  pushup:           "Plank",
  press_horizontal: "Plank",
};

const DEFAULT_CLIP = "BicepCurl";

function FBXMannequin({ animKey, accent, gender }) {
  const group = useRef();

  // Load all 5 FBX files — each contains Xbot character + one clip named "Take 001"
  const curlFbx  = useLoader(FBXLoader, "/models/animations/bicep-curl.fbx");
  const burpeeFbx= useLoader(FBXLoader, "/models/animations/burpee.fbx");
  const jogFbx   = useLoader(FBXLoader, "/models/animations/jogging.fbx");
  const situpFbx = useLoader(FBXLoader, "/models/animations/situp.fbx");
  const plankFbx = useLoader(FBXLoader, "/models/animations/start-plank.fbx");

  // Rename "Take 001" clips so we can address them by meaningful names
  const allClips = useMemo(() => {
    const pairs = [
      [curlFbx,   "BicepCurl"],
      [burpeeFbx, "Burpee"],
      [jogFbx,    "Jogging"],
      [situpFbx,  "Situp"],
      [plankFbx,  "Plank"],
    ];
    return pairs
      .map(([fbx, name]) => {
        const clip = fbx.animations[0];
        if (!clip) return null;
        clip.name = name;   // rename in-place (safe — each FBX is cached once)
        return clip;
      })
      .filter(Boolean);
  }, [curlFbx, burpeeFbx, jogFbx, situpFbx, plankFbx]);

  // Wire all clips to the base character's skeleton
  const { actions } = useAnimations(allClips, group);

  // Material override — apply phase accent rim tint + gender tone
  useEffect(() => {
    curlFbx.traverse((obj) => {
      if (!obj.isMesh) return;
      obj.castShadow = true;
      // Keep Xbot's base material but boost emissive with phase accent
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach(m => {
          if (m.name?.toLowerCase().includes("body") || m.name?.toLowerCase().includes("joints")) {
            m.emissive?.setStyle(accent);
            m.emissiveIntensity = 0.18;
          }
        });
      }
    });
  }, [curlFbx, accent]);

  // Switch animation clips with crossfade
  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) return;
    const clipName = CLIP_MAP[animKey] || DEFAULT_CLIP;
    const action   = actions[clipName] || actions[DEFAULT_CLIP] || Object.values(actions)[0];
    if (!action) return;

    action.setLoop(LoopRepeat, Infinity);
    action.reset().fadeIn(0.3).play();
    return () => { action.fadeOut(0.2); };
  }, [animKey, actions]);

  // Mixamo FBX is in centimetres — scale to metres for Three.js world space
  // Position slightly below world origin so feet land at y=0
  return (
    <primitive
      ref={group}
      object={curlFbx}
      scale={0.011}
      position={[0, -0.92, 0]}
    />
  );
}

export default FBXMannequin;
