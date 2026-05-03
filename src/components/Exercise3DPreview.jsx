/**
 * Exercise3DPreview
 * Replaces the SVG stick-figure with a smooth 3D primitive mannequin.
 *
 * Approach: Option C (minimal clay 3D mannequin) — no external GLB needed,
 * instant load, fully animated, ready to swap for VRoid/GLB later.
 *
 * Joint hierarchy:
 *   root → spine → chest → (neck → head), (L/R shoulder → upper arm → elbow → forearm)
 *   root → pelvis → (L/R hip → thigh → knee → shin)
 */

import { useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MathUtils } from "three";

// ── Camera presets per animation category ────────────────────────────────
// pos: camera world position  target: lookAt point
const CAMERA_PRESETS = {
  idle:             { pos: [0,    0.78, 2.55], target: [0, 0.92, 0] },
  jumping_jacks:    { pos: [0,    0.85, 2.65], target: [0, 0.95, 0] },
  squat:            { pos: [0.5,  0.72, 2.35], target: [0, 0.70, 0] },
  squat_jump:       { pos: [0.5,  0.80, 2.35], target: [0, 0.80, 0] },
  lunge:            { pos: [0.7,  0.75, 2.25], target: [0, 0.70, 0] },
  hinge:            { pos: [0.9,  0.90, 2.20], target: [0, 0.85, 0] },
  press_horizontal: { pos: [-0.4, 1.30, 2.10], target: [0, 0.55, 0] }, // side-high: shows lying pose
  press_overhead:   { pos: [0.4,  0.80, 2.50], target: [0, 1.05, 0] }, // slight side to show arm raise
  pull_down:        { pos: [0.5,  0.92, 2.30], target: [0, 0.90, 0] },
  pushup:           { pos: [-2.4, 0.55, 1.60], target: [0, 0.48, 0] }, // side view, low
  curl:             { pos: [0.5,  0.88, 2.30], target: [0, 0.88, 0] },
  plank:            { pos: [-2.4, 0.45, 1.50], target: [0, 0.38, 0] }, // low side
  core_twist:       { pos: [-1.6, 1.00, 2.00], target: [0, 0.70, 0] },
  core_raise:       { pos: [-1.9, 0.75, 1.80], target: [0, 0.58, 0] },
  yoga_flow:        { pos: [0,    0.65, 3.10], target: [0, 0.60, 0] }, // wider full-body
  walk:             { pos: [0.8,  0.80, 2.30], target: [0, 0.82, 0] },
};

// Apply camera preset for this animation; re-runs only when animKey changes
function CameraAim({ animKey }) {
  const { camera } = useThree();
  useEffect(() => {
    const p = CAMERA_PRESETS[animKey] || CAMERA_PRESETS.idle;
    camera.position.set(...p.pos);
    camera.lookAt(...p.target);
    camera.updateProjectionMatrix();
  }, [camera, animKey]);
  return null;
}

// ── Animation → category map (covers all anim keys in workoutData.js) ────
const ANIM_MAP = {
  jumpingJacks:     "jumping_jacks",
  jumpRope:         "jumping_jacks",
  jumpSquat:        "squat_jump",
  gobletSquat:      "squat",
  squat:            "squat",
  burpee:           "squat_jump",
  lunge:            "lunge",
  stepUp:           "lunge",
  rdl:              "hinge",
  hipThrust:        "hinge",
  cableKickback:    "hinge",
  kbSwing:          "hinge",
  deadlift:         "hinge",
  chestPress:       "press_horizontal",
  chestFly:         "press_horizontal",
  inclinePress:     "press_horizontal",
  pushup:           "pushup",
  shoulderPress:    "press_overhead",
  lateralRaise:     "press_overhead",
  latPulldown:      "pull_down",
  seatedRow:        "pull_down",
  dbRow:            "pull_down",
  facePull:         "pull_down",
  rowingMachine:    "pull_down",
  bicepCurl:        "curl",
  hammerCurl:       "curl",
  tricepExtension:  "curl",
  tricepPushdown:   "curl",
  plank:            "plank",
  russianTwist:     "core_twist",
  legRaise:         "core_raise",
  mountainClimber:  "core_raise",
  catCow:           "yoga_flow",
  pigeonPose:       "yoga_flow",
  childPose:        "yoga_flow",
  inclineWalk:      "walk",
  stairmaster:      "walk",
  treadmill:        "walk",
};

// ── Per-animation joint driver functions ──────────────────────────────────
// Each fn receives (t, refs) and mutates ref.current.rotation / position.
// t = elapsed seconds * speed multiplier.
const DRIVERS = {
  idle(t, R) {
    set(R.spine, "z", Math.sin(t * 0.8) * 0.015);
    set(R.root,  "y", Math.sin(t * 1.2) * 0.01);
  },
  jumping_jacks(t, R) {
    const p = (Math.sin(t * 3) + 1) / 2;   // 0→1 oscillation
    set(R.lShoulder, "z", -p * 1.45);
    set(R.rShoulder, "z",  p * 1.45);
    set(R.lHip,  "z", -p * 0.55);
    set(R.rHip,  "z",  p * 0.55);
    set(R.root,  "y",  Math.abs(Math.sin(t * 3)) * 0.12);
  },
  squat(t, R) {
    const p = (Math.sin(t * 2) + 1) / 2;
    const bend = p * 1.1;
    set(R.lHip,  "x", -bend);   set(R.rHip,  "x", -bend);
    set(R.lKnee, "x",  bend * 1.5); set(R.rKnee, "x",  bend * 1.5);
    set(R.spine, "x", -p * 0.18);
    set(R.root,  "y", -p * 0.24);
  },
  squat_jump(t, R) {
    const p = (Math.sin(t * 2.5) + 1) / 2;
    set(R.lHip,  "x", -p * 1.0);  set(R.rHip,  "x", -p * 1.0);
    set(R.lKnee, "x",  p * 1.4);  set(R.rKnee, "x",  p * 1.4);
    set(R.root,  "y", (1 - p) * 0.3 - 0.15);
    set(R.lShoulder, "x", -p * 0.6); set(R.rShoulder, "x", -p * 0.6);
  },
  lunge(t, R) {
    const p = (Math.sin(t * 2) + 1) / 2;
    set(R.lHip,  "x", -p * 0.9);   set(R.lKnee, "x",  p * 1.3);
    set(R.rHip,  "x",  p * 0.5);   set(R.rKnee, "x", -p * 0.7);
    set(R.root,  "y", -p * 0.2);
    set(R.spine, "x", -0.08);
  },
  hinge(t, R) {
    const p = (Math.sin(t * 2) + 1) / 2;
    set(R.spine, "x",  p * 0.7);   // hinge at hip
    set(R.lHip,  "x",  p * 0.6);   set(R.rHip,  "x",  p * 0.6);
    set(R.lKnee, "x", -p * 0.25);  set(R.rKnee, "x", -p * 0.25);
    set(R.lShoulder, "x", p * 0.4); set(R.rShoulder, "x", p * 0.4);
  },
  press_horizontal(t, R) {
    // Lying chest press — body angled back, arms pressing
    const p = (Math.sin(t * 2) + 1) / 2;
    set(R.spine, "x", -0.7);        // lying back
    set(R.root,  "y", -0.35);
    set(R.lShoulder, "x", -0.6 - p * 0.8);
    set(R.rShoulder, "x", -0.6 - p * 0.8);
    set(R.lElbow, "x", p * 1.0);
    set(R.rElbow, "x", p * 1.0);
  },
  press_overhead(t, R) {
    const p = (Math.sin(t * 2) + 1) / 2;
    set(R.lShoulder, "x", -(p * 1.6 + 0.3));
    set(R.rShoulder, "x", -(p * 1.6 + 0.3));
    set(R.lElbow, "x",  (1 - p) * 1.0);
    set(R.rElbow, "x",  (1 - p) * 1.0);
    set(R.root, "y", Math.sin(t * 2) * 0.02);
  },
  pull_down(t, R) {
    const p = (Math.sin(t * 2) + 1) / 2;
    set(R.lShoulder, "x", -p * 1.3 - 0.3);
    set(R.rShoulder, "x", -p * 1.3 - 0.3);
    set(R.lShoulder, "z", -0.35);
    set(R.rShoulder, "z",  0.35);
    set(R.lElbow, "x", p * 1.4);
    set(R.rElbow, "x", p * 1.4);
    set(R.spine, "x",  p * 0.08);
  },
  pushup(t, R) {
    const p = (Math.sin(t * 2) + 1) / 2;
    set(R.spine, "x", -0.1);           // plank-ish angle
    set(R.root,  "y", -0.5);
    set(R.lHip, "x", 0.9); set(R.rHip, "x", 0.9);
    set(R.lKnee,"x",-0.9); set(R.rKnee,"x",-0.9);
    set(R.lShoulder, "x", -(0.2 + p * 0.6));
    set(R.rShoulder, "x", -(0.2 + p * 0.6));
    set(R.lElbow, "x", p * 1.1);
    set(R.rElbow, "x", p * 1.1);
  },
  curl(t, R) {
    const p = (Math.sin(t * 2.5) + 1) / 2;
    set(R.lShoulder, "z", -0.12);
    set(R.rShoulder, "z",  0.12);
    set(R.lElbow, "x", -p * 2.2);
    set(R.rElbow, "x", -(1 - p) * 2.2);
  },
  plank(t, R) {
    set(R.spine, "x", -0.1);
    set(R.root,  "y", -0.5);
    set(R.lHip, "x", 0.95); set(R.rHip, "x", 0.95);
    set(R.lKnee,"x",-0.95); set(R.rKnee,"x",-0.95);
    // subtle core engagement pulse
    set(R.spine, "z", Math.sin(t * 0.8) * 0.02);
  },
  core_twist(t, R) {
    set(R.spine, "x", -0.55);   // seated lean back
    set(R.root,  "y", -0.28);
    set(R.lHip,  "x", -0.5); set(R.rHip, "x", -0.5);
    set(R.chest, "y", Math.sin(t * 2.5) * 0.7);  // rotation twist
    set(R.lShoulder, "z", -0.5); set(R.rShoulder, "z", 0.5);
  },
  core_raise(t, R) {
    const p = (Math.sin(t * 2) + 1) / 2;
    set(R.spine, "x", -0.3);
    set(R.root, "y", -0.35);
    set(R.lHip, "x", -(p * 1.4));  set(R.rHip, "x", -(p * 1.4));
    set(R.lKnee,"x",  p * 0.5);    set(R.rKnee,"x",  p * 0.5);
  },
  yoga_flow(t, R) {
    const p = (Math.sin(t * 0.8) + 1) / 2;
    set(R.spine, "x",  p * 0.6 - 0.3);
    set(R.chest, "x", -p * 0.3);
    set(R.lShoulder, "x", -p * 0.4);
    set(R.rShoulder, "x", -p * 0.4);
    set(R.root, "y", -0.1 - p * 0.1);
  },
  walk(t, R) {
    const s = Math.sin(t * 3);
    set(R.lHip, "x", -s * 0.5);   set(R.rHip, "x",  s * 0.5);
    set(R.lKnee,"x",  Math.max(0, s) * 0.9);
    set(R.rKnee,"x",  Math.max(0, -s) * 0.9);
    set(R.lShoulder, "x",  s * 0.35);
    set(R.rShoulder, "x", -s * 0.35);
    set(R.spine, "y", Math.abs(s) * 0.02);
  },
};

// Lerp rotation toward target — gives organic body-weight feel
// factor ~0.13 ≈ 160ms settle at 60fps, which reads as natural inertia
function set(ref, axis, target, factor = 0.13) {
  if (ref?.current) {
    ref.current.rotation[axis] = MathUtils.lerp(
      ref.current.rotation[axis],
      target,
      factor
    );
  }
}

// ── Material palette ─────────────────────────────────────────────────────
const SKIN  = { color: "#c8906a", roughness: 0.88, metalness: 0 };
const SHOE  = { color: "#e8e8e6", roughness: 0.82, metalness: 0.04 };
const DARK  = { color: "#16182a", roughness: 0.78, metalness: 0.06 }; // dark gymwear
const HAIR_F = { color: "#1e120a", roughness: 0.92, metalness: 0 };   // deep brown
const HAIR_M = { color: "#141010", roughness: 0.92, metalness: 0 };   // near black

// ── Mesh helpers ──────────────────────────────────────────────────────────
function C({ r, h, mat })       { return <mesh><capsuleGeometry args={[r, h, 6, 14]} /><meshStandardMaterial {...mat} /></mesh>; }
function S({ r, mat, pos = [0,0,0] }) { return <mesh position={pos}><sphereGeometry args={[r, 14, 14]} /><meshStandardMaterial {...mat} /></mesh>; }
function Shoe({ mat }) {
  return (
    <group>
      <mesh position={[0, -0.04, 0.02]}><boxGeometry args={[0.08, 0.045, 0.15]} /><meshStandardMaterial {...mat} /></mesh>
    </group>
  );
}

// Female hair: sphere cap + swept ponytail
function FemaleHair({ hr }) {
  return (
    <group>
      <mesh position={[0, hr * 0.28, 0]}>
        <sphereGeometry args={[hr * 0.9, 14, 14, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
        <meshStandardMaterial {...HAIR_F} />
      </mesh>
      {/* Ponytail anchor */}
      <S r={hr * 0.22} mat={HAIR_F} pos={[0, hr * 0.58, -hr * 0.72]} />
      {/* Ponytail sweep */}
      <mesh position={[0, hr * 0.2, -hr * 1.15]} rotation={[0.45, 0, 0]}>
        <capsuleGeometry args={[hr * 0.13, hr * 1.3, 6, 10]} />
        <meshStandardMaterial {...HAIR_F} />
      </mesh>
    </group>
  );
}

// Male hair: tight hemisphere cap
function MaleHair({ hr }) {
  return (
    <mesh position={[0, hr * 0.32, 0]}>
      <sphereGeometry args={[hr * 0.85, 14, 14, 0, Math.PI * 2, 0, Math.PI * 0.44]} />
      <meshStandardMaterial {...HAIR_M} />
    </mesh>
  );
}

// ── Gender-aware Mannequin ────────────────────────────────────────────────
// Swap only this component for a GLB/VRM when the model file is ready.
// All animation drivers, camera presets, and lazy-loading stay unchanged.
function Mannequin({ animKey, accent, gender = "female" }) {
  const root = useRef(), spine = useRef(), chest = useRef();
  const lShoulder = useRef(), rShoulder = useRef();
  const lElbow    = useRef(), rElbow    = useRef();
  const lHip      = useRef(), rHip      = useRef();
  const lKnee     = useRef(), rKnee     = useRef();

  const refs = { root, spine, chest, lShoulder, rShoulder, lElbow, rElbow, lHip, rHip, lKnee, rKnee };
  useFrame(({ clock }) => (DRIVERS[animKey] || DRIVERS.idle)(clock.getElapsedTime() * 1.8, refs));

  const isFemale = gender !== "male";

  // Phase accent as sports bra / outfit trim colour (female) or ignored (male dark outfit)
  const TOP  = isFemale
    ? { color: accent, roughness: 0.72, metalness: 0.08 }   // sports bra = phase accent
    : DARK;                                                   // tank = dark

  const JOINT = isFemale
    ? { color: accent, roughness: 0.55, metalness: 0.18 }    // glowing joints for female
    : { color: "#222238", roughness: 0.6, metalness: 0.12 }; // dark joints for male

  // Proportions — female: narrower shoulders, wider hips, slimmer arms
  //               male:   wider shoulders, narrower hips, heavier build
  const p = isFemale ? {
    sw: 0.185, hw: 0.128, tw: 0.116, aw: 0.105, pelR: 0.112,
    armR: 0.046, foreR: 0.038, thighR: 0.065, shinR: 0.051, hr: 0.105,
  } : {
    sw: 0.225, hw: 0.112, tw: 0.135, aw: 0.118, pelR: 0.106,
    armR: 0.059, foreR: 0.048, thighR: 0.075, shinR: 0.062, hr: 0.116,
  };

  return (
    <group ref={root}>

      {/* ── Hips / pelvis ── */}
      <group position={[0, 0.80, 0]}>
        <C r={p.pelR} h={0.12} mat={DARK} />

        {[[-1, lHip, lKnee], [1, rHip, rKnee]].map(([side, hipRef, kneeRef]) => (
          <group key={side} ref={hipRef} position={[side * p.hw, -0.04, 0]}>
            <S r={0.072} mat={JOINT} />
            {/* Thigh */}
            <mesh position={[0, -0.19, 0]}>
              <capsuleGeometry args={[p.thighR, 0.23, 6, 14]} />
              <meshStandardMaterial {...DARK} />
            </mesh>
            <group ref={kneeRef} position={[0, -0.38, 0]}>
              <S r={0.062} mat={JOINT} />
              {/* Shin */}
              <mesh position={[0, -0.18, 0]}>
                <capsuleGeometry args={[p.shinR, 0.22, 6, 14]} />
                {/* Female: leggings all the way. Male: bare shins below shorts */}
                <meshStandardMaterial {...(isFemale ? DARK : SKIN)} />
              </mesh>
              {/* Shoe */}
              <group position={[0, -0.36, 0]}><Shoe mat={SHOE} /></group>
            </group>
          </group>
        ))}
      </group>

      {/* ── Spine ── */}
      <group ref={spine} position={[0, 0.94, 0]}>
        {/* Abdomen — female shows midriff skin, male has tank covering it */}
        <mesh position={[0, 0.08, 0]}>
          <capsuleGeometry args={[p.aw, 0.16, 6, 14]} />
          <meshStandardMaterial {...(isFemale ? SKIN : DARK)} />
        </mesh>

        <group ref={chest} position={[0, 0.27, 0]}>
          {/* Upper torso */}
          <mesh position={[0, 0.07, 0]}>
            <capsuleGeometry args={[p.tw, 0.21, 6, 14]} />
            <meshStandardMaterial {...TOP} />
          </mesh>

          {/* Neck */}
          <mesh position={[0, 0.29, 0.01]}>
            <capsuleGeometry args={[0.042, 0.06, 6, 12]} />
            <meshStandardMaterial {...SKIN} />
          </mesh>

          {/* Head */}
          <group position={[0, 0.44, 0]}>
            <mesh>
              <sphereGeometry args={[p.hr, 16, 16]} />
              <meshStandardMaterial {...SKIN} />
            </mesh>
            {isFemale ? <FemaleHair hr={p.hr} /> : <MaleHair hr={p.hr} />}
          </group>

          {/* Arms */}
          {[[-1, lShoulder, lElbow], [1, rShoulder, rElbow]].map(([side, shouldRef, elbowRef]) => (
            <group key={side} ref={shouldRef} position={[side * p.sw, 0.17, 0]}>
              <S r={0.065} mat={JOINT} />
              {/* Upper arm */}
              <mesh position={[0, -0.14, 0]}>
                <capsuleGeometry args={[p.armR, 0.19, 6, 14]} />
                <meshStandardMaterial {...SKIN} />
              </mesh>
              <group ref={elbowRef} position={[0, -0.28, 0]}>
                <S r={0.050} mat={JOINT} />
                {/* Forearm */}
                <mesh position={[0, -0.12, 0]}>
                  <capsuleGeometry args={[p.foreR, 0.16, 6, 14]} />
                  <meshStandardMaterial {...SKIN} />
                </mesh>
                <S r={0.038} mat={JOINT} pos={[0, -0.22, 0]} />
              </group>
            </group>
          ))}
        </group>
      </group>
    </group>
  );
}

// ── Public component ──────────────────────────────────────────────────────
export default function Exercise3DPreview({ type = "idle", color = "#9bd8b4", height = 220, gender = "female" }) {
  const animKey = ANIM_MAP[type] || "idle";

  return (
    <div style={{ width: "100%", height, position: "relative", borderRadius: 16, overflow: "hidden" }}>
      <Canvas
        camera={{ position: [0, 0.78, 2.55], fov: 46 }}
        style={{ width: "100%", height: "100%" }}
        gl={{ antialias: true, alpha: true }}
      >
        <CameraAim animKey={animKey} />

        {/* Studio lighting — neutral fill + phase accent rim */}
        <ambientLight intensity={0.55} />
        <directionalLight position={[2.5, 5, 2]} intensity={0.95} castShadow={false} />
        <directionalLight position={[-2, 3, -1]} intensity={0.3} color="#c8b0ff" />

        {/* Phase accent rim light — wraps the figure in the current phase colour */}
        <pointLight position={[-1.8, 2.5, -1.2]} intensity={1.2} color={color} distance={4} />

        <Mannequin animKey={animKey} accent={color} gender={gender} />
      </Canvas>
    </div>
  );
}
