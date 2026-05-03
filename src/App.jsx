import { useState, useEffect, useRef, useCallback } from "react";
import { createVideoGeneration, pollGeneration } from "./higgsfieldApi";
import * as Storage from "./storage";
// re-export getPrevWeekKey into local scope for WorkoutLogger
const getPrevWeekKey = Storage.getPrevWeekKey;
import { getCycleState, PHASES, PHASE_EMOJI, parseSets, buildPhaseNote } from "./cycleEngine";
import Onboarding from "./Onboarding";
import SettingsPage from "./components/SettingsPage";

// ── Theme ──────────────────────────────────────────────────────────────────
const T = {
  bg: "#080912", card: "#0f1020", card2: "#141528", border: "rgba(255,255,255,0.07)",
  pink: "#ff6b9d", teal: "#38d9c0", amber: "#ffb347", violet: "#b48bfa",
  green: "#5eead4", red: "#fc8181", text: "#f0eeff", muted: "#6b6a88",
};

// ── Equipment requirements per exercise ────────────────────────────────────
// Values map to profile.equipment ids: dumbbells|barbell|cable|machines|kettlebell|cardio|bands
const EQUIPMENT_MAP = {
  chest_press: ["dumbbells"], chest_fly: ["dumbbells"], incline_press: ["dumbbells"],
  tricep_push: ["cable"], finisher_stairs: ["cardio"],
  squat_goblet: ["dumbbells"], rdl: ["dumbbells"], cable_kick: ["cable"], stairs_leg: ["cardio"],
  lat_pull: ["machines"], seated_row: ["cable"], db_row: ["dumbbells"], face_pull: ["cable"], row_machine: ["cardio"],
  incline_walk: ["cardio"],
  shoulder_press: ["dumbbells"], lat_raise: ["dumbbells"], bicep_curl: ["dumbbells"],
  hammer_curl: ["dumbbells"], tricep_ext: ["dumbbells"],
  hiit_sprint: ["cardio"],
  deadlift: ["dumbbells"], push_pull: ["dumbbells"], kb_swing: ["kettlebell"],
};

const SUBSTITUTIONS = {
  tricep_push:    "Diamond push-ups (bodyweight)",
  cable_kick:     "Donkey kicks or glute bridges (bodyweight)",
  lat_pull:       "Bodyweight rows under a table or door pull-ups",
  seated_row:     "Band rows or bent-over dumbbell row",
  face_pull:      "Band pull-aparts or rear delt fly",
  row_machine:    "Jump rope, burpees, or outdoor intervals",
  finisher_stairs:"Box step-ups or walking lunges",
  stairs_leg:     "Bulgarian split squats (bodyweight)",
  incline_walk:   "Outdoor hill walk or stair climbing",
  hiit_sprint:    "Outdoor sprints or burpee intervals",
  kb_swing:       "Dumbbell swings — identical motion",
};

// ── Live health data ───────────────────────────────────────────────────────
const HEALTH_SNAPSHOT = {
  steps: 5943, stepGoal: 10000,
  kcal: 210, kcalGoal: 500,
  rhr: 70, exMin: 22,
  weight: 63.5, age: 25,
};

// ── 7-Day Workout Plan ─────────────────────────────────────────────────────
const WEEK_PLAN = [
  {
    day: 0, name: "Sunday", label: "Chest & Upper Body",
    emoji: "🏋️", color: T.pink, focus: "Toning + Fat Loss",
    phase: "follicular",
    tip: "Follicular phase peak! Estrogen rising — push harder today. Best window for chest work.",
    exercises: [
      { id: "warmup_jj", name: "Jumping Jacks Warm-Up", sets: "3 min", reps: "continuous", kcal: 20, muscle: "Full Body", type: "Cardio", anim: "jumpingJacks", tip: "Warm up joints before lifting. Swing arms fully and land softly." },
      { id: "chest_press", name: "Dumbbell Chest Press", sets: "3×15", reps: "15", kcal: 55, muscle: "Chest, Triceps", type: "Strength", anim: "chestPress", tip: "Lie flat, press dumbbells from chest level straight up. Squeeze chest at top." },
      { id: "chest_fly", name: "Dumbbell Chest Fly", sets: "3×15", reps: "15", kcal: 45, muscle: "Chest", type: "Toning", anim: "chestFly", tip: "Open arms wide like a hug in reverse. Feel the chest stretch — don't go too heavy." },
      { id: "incline_press", name: "Incline Dumbbell Press", sets: "3×12", reps: "12", kcal: 50, muscle: "Upper Chest", type: "Strength", anim: "inclinePress", tip: "30–45° bench angle. Targets upper chest for lift and toning." },
      { id: "pushup", name: "Push-Ups", sets: "3×15", reps: "15", kcal: 40, muscle: "Chest, Core", type: "Toning", anim: "pushup", tip: "Wide hands for chest focus. Keep core tight and body in a straight line." },
      { id: "tricep_push", name: "Tricep Rope Pushdown", sets: "3×15", reps: "15", kcal: 30, muscle: "Triceps", type: "Toning", anim: "tricepPushdown", tip: "Cable machine. Elbows pinned to sides. Full extension at bottom — feel the squeeze." },
      { id: "finisher_stairs", name: "Stairmaster Finisher", sets: "10 min", reps: "Level 8–10", kcal: 90, muscle: "Full Body", type: "Fat Burn", anim: "stairmaster", tip: "Hands off rails. Full steps, not just toes. Keep chest up." },
    ],
  },
  {
    day: 1, name: "Monday", label: "Legs & Glutes",
    emoji: "🦵", color: "#f472b6", focus: "Toning + Fat Loss",
    phase: "follicular",
    tip: "Leg day on follicular phase = GOLD. Pain tolerance is elevated — go heavier!",
    exercises: [
      { id: "squat_goblet", name: "Goblet Squat", sets: "4×15", reps: "15", kcal: 75, muscle: "Quads, Glutes", type: "Strength", anim: "gobletSquat", tip: "Hold dumbbell at chest. Deep squat — thighs parallel or below. Drive heels into floor." },
      { id: "hip_thrust", name: "Hip Thrust", sets: "4×15", reps: "15", kcal: 65, muscle: "Glutes", type: "Toning", anim: "hipThrust", tip: "Back on bench, drive hips up. Squeeze glutes HARD at top. Best exercise for glute shape." },
      { id: "rdl", name: "Romanian Deadlift", sets: "3×12", reps: "12", kcal: 65, muscle: "Hamstrings", type: "Strength", anim: "rdl", tip: "Hinge at hips, not knees. Feel hamstring stretch. Neutral spine — don't round back." },
      { id: "lunge", name: "Reverse Lunges", sets: "3×12 each", reps: "12", kcal: 55, muscle: "Quads, Glutes", type: "Toning", anim: "lunge", tip: "Step backward, lower back knee toward floor. Keep front shin vertical." },
      { id: "cable_kick", name: "Cable Kickbacks", sets: "3×15 each", reps: "15", kcal: 40, muscle: "Glutes", type: "Toning", anim: "cableKickback", tip: "Hinge forward slightly. Drive heel straight back. Squeeze glute at full extension." },
      { id: "stairs_leg", name: "Stairmaster", sets: "15 min", reps: "Level 9–12", kcal: 130, muscle: "Full Body", type: "Fat Burn", anim: "stairmaster", tip: "Hands off rails! Full steps. This crushes calories AND shapes glutes." },
    ],
  },
  {
    day: 2, name: "Tuesday", label: "Back & Posture",
    emoji: "💪", color: T.teal, focus: "Toning + Fat Loss",
    phase: "follicular",
    tip: "Strong back = better posture and faster metabolism. Pull movements are great for fat burn.",
    exercises: [
      { id: "lat_pull", name: "Lat Pulldown (Wide)", sets: "3×12", reps: "12", kcal: 55, muscle: "Lats", type: "Strength", anim: "latPulldown", tip: "Grip wider than shoulders. Pull bar to upper chest. Lean back slightly. Squeeze lats." },
      { id: "seated_row", name: "Seated Cable Row", sets: "3×15", reps: "15", kcal: 45, muscle: "Mid Back", type: "Toning", anim: "seatedRow", tip: "Neutral grip. Full extension then row to navel. Keep chest tall." },
      { id: "db_row", name: "Single-Arm Dumbbell Row", sets: "3×12 each", reps: "12", kcal: 60, muscle: "Mid Back", type: "Strength", anim: "dbRow", tip: "Place knee and hand on bench. Drive elbow straight up to hip. Heavy is okay here." },
      { id: "face_pull", name: "Face Pulls", sets: "3×15", reps: "15", kcal: 25, muscle: "Rear Delts", type: "Toning", anim: "facePull", tip: "Cable at eye level, rope attachment. Pull to forehead with external rotation. Posture saver!" },
      { id: "row_machine", name: "Rowing Machine Intervals", sets: "10 min", reps: "1min hard/1min easy", kcal: 110, muscle: "Full Body", type: "Fat Burn", anim: "rowingMachine", tip: "Drive with legs first, then pull with arms. Tall posture. Best full-body fat burner." },
    ],
  },
  {
    day: 3, name: "Wednesday", label: "Active Recovery",
    emoji: "🧘", color: T.green, focus: "Recovery + Flexibility",
    phase: "follicular",
    tip: "Recovery is where the magic happens. Gentle movement keeps metabolism active.",
    exercises: [
      { id: "yoga_cat", name: "Cat-Cow Stretch", sets: "3 min", reps: "slow", kcal: 10, muscle: "Spine", type: "Flexibility", anim: "catCow", tip: "Inhale arch (cow), exhale round (cat). Move with your breath. Releases spine tension." },
      { id: "pigeon", name: "Pigeon Pose", sets: "90s each side", reps: "hold", kcal: 8, muscle: "Hip Flexors, Glutes", type: "Flexibility", anim: "pigeonPose", tip: "Square hips. Breathe into the tension. Glutes get tight from training — this releases them." },
      { id: "incline_walk", name: "Incline Treadmill Walk", sets: "30 min", reps: "12–15% incline", kcal: 180, muscle: "Full Body", type: "Fat Burn", anim: "inclineWalk", tip: "3.5–4 mph. Hands off rails. Burns fat without stressing joints — perfect recovery cardio." },
      { id: "child_pose", name: "Child's Pose + Cobra", sets: "3 min", reps: "flow", kcal: 8, muscle: "Back, Hips", type: "Flexibility", anim: "childPose", tip: "Child's pose stretches spine. Cobra opens chest. Flow slowly between the two." },
    ],
  },
  {
    day: 4, name: "Thursday", label: "Shoulders & Arms",
    emoji: "🔺", color: T.amber, focus: "Toning + Fat Loss",
    phase: "follicular",
    tip: "Nearing ovulation — energy is building. Great day to push shoulders and arms!",
    exercises: [
      { id: "shoulder_press", name: "Dumbbell Shoulder Press", sets: "3×12", reps: "12", kcal: 55, muscle: "Shoulders", type: "Strength", anim: "shoulderPress", tip: "Seated or standing. Press dumbbells overhead. Full extension without locking elbows." },
      { id: "lat_raise", name: "Lateral Raises", sets: "3×15", reps: "15", kcal: 35, muscle: "Side Delts", type: "Toning", anim: "lateralRaise", tip: "Lead with elbows, not wrists. Slight forward lean. Control the descent." },
      { id: "bicep_curl", name: "Dumbbell Bicep Curl", sets: "3×15", reps: "15", kcal: 30, muscle: "Biceps", type: "Toning", anim: "bicepCurl", tip: "Supinate wrist at top (turn palm up). Slow 3-second lower. Don't swing elbows." },
      { id: "hammer_curl", name: "Hammer Curl", sets: "3×12", reps: "12", kcal: 25, muscle: "Biceps, Forearms", type: "Toning", anim: "hammerCurl", tip: "Neutral grip (thumbs up). Hits brachialis for full arm definition." },
      { id: "tricep_ext", name: "Overhead Tricep Extension", sets: "3×15", reps: "15", kcal: 30, muscle: "Triceps", type: "Toning", anim: "tricepExtension", tip: "Hold one dumbbell with both hands overhead. Elbows close to head. Lower behind head." },
      { id: "jump_rope", name: "Jump Rope HIIT", sets: "10 min", reps: "45s on / 15s off", kcal: 120, muscle: "Full Body", type: "Fat Burn", anim: "jumpRope", tip: "Stay on toes. Wrists do the turning, not arms." },
    ],
  },
  {
    day: 5, name: "Friday", label: "Core & HIIT",
    emoji: "⚡", color: T.violet, focus: "Fat Burn + Core",
    phase: "ovulation",
    tip: "Ovulation incoming! Peak energy & strength day. Crush this HIIT session.",
    exercises: [
      { id: "plank", name: "Plank Hold", sets: "3×45s", reps: "45s", kcal: 15, muscle: "Core", type: "Toning", anim: "plank", tip: "Elbows under shoulders. Squeeze abs, glutes, quads all at once. Don't hold breath." },
      { id: "russian_twist", name: "Russian Twist", sets: "3×20", reps: "20", kcal: 25, muscle: "Obliques", type: "Toning", anim: "russianTwist", tip: "Hold weight. Lean back 45°. Rotate side to side — touch floor each rep. Great for waist." },
      { id: "leg_raise", name: "Lying Leg Raises", sets: "3×15", reps: "15", kcal: 20, muscle: "Lower Abs", type: "Toning", anim: "legRaise", tip: "Flat on back. Keep legs straight. Don't let feet touch floor. Lower abs fire hard." },
      { id: "mountain_climber", name: "Mountain Climbers", sets: "3×30s", reps: "30s", kcal: 35, muscle: "Core, Full Body", type: "Fat Burn", anim: "mountainClimber", tip: "Keep hips level. Drive knees to chest fast. This is cardio AND core in one." },
      { id: "burpee", name: "Burpees", sets: "4×10", reps: "10", kcal: 80, muscle: "Full Body", type: "Fat Burn", anim: "burpee", tip: "Squat down, jump back to plank, push-up, jump in, jump up, clap overhead. Best fat burner." },
      { id: "hiit_sprint", name: "Treadmill Sprint Intervals", sets: "12 min", reps: "30s sprint / 90s walk", kcal: 130, muscle: "Full Body", type: "Fat Burn", anim: "treadmill", tip: "Sprint at 80% effort. Walk to recover. 8–10 rounds. Post-exercise burn lasts hours." },
    ],
  },
  {
    day: 6, name: "Saturday", label: "Full Body Burn",
    emoji: "🔥", color: "#fb7185", focus: "Fat Loss + Full Body",
    phase: "ovulation",
    tip: "Peak power day! Full body compound moves = maximum calorie burn. You've got this!",
    exercises: [
      { id: "deadlift", name: "Dumbbell Deadlift", sets: "4×12", reps: "12", kcal: 80, muscle: "Hamstrings, Glutes, Back", type: "Strength", anim: "rdl", tip: "Feet hip-width. Hinge and lower, keeping back straight. Drive through heels to stand." },
      { id: "squat_jump", name: "Jump Squats", sets: "3×15", reps: "15", kcal: 70, muscle: "Quads, Glutes", type: "Fat Burn", anim: "jumpSquat", tip: "Squat down then explode up. Soft landing back into squat. Elevates heart rate fast." },
      { id: "push_pull", name: "Push-Up to Renegade Row", sets: "3×10", reps: "10", kcal: 60, muscle: "Chest, Back, Core", type: "Fat Burn", anim: "pushup", tip: "Do a push-up, then row each dumbbell up. Planks the whole time. Compound burn." },
      { id: "kb_swing", name: "Kettlebell Swings", sets: "4×20", reps: "20", kcal: 90, muscle: "Glutes, Core, Back", type: "Fat Burn", anim: "kbSwing", tip: "Hinge aggressively. Drive hips forward to swing KB to shoulder height. Hips — not arms!" },
      { id: "box_step", name: "Box Step-Ups", sets: "3×15 each", reps: "15", kcal: 55, muscle: "Glutes, Quads", type: "Toning", anim: "stepUp", tip: "Full foot on box. Drive through heel of the stepping foot. Add dumbbells to progress." },
      { id: "cool_stretch", name: "Full Body Stretch", sets: "10 min", reps: "hold each", kcal: 15, muscle: "Full Body", type: "Recovery", anim: "childPose", tip: "Chest, hip flexors, hamstrings, quads. You've earned it — recovery is part of the plan." },
    ],
  },
];

// ── SVG Exercise Animations ────────────────────────────────────────────────
const ExerciseAnimation = ({ type, color = T.pink }) => {
  const [frame, setFrame] = useState(0);
  const raf = useRef();

  useEffect(() => {
    let t = 0;
    const tick = () => { t += 0.03; setFrame(t); raf.current = requestAnimationFrame(tick); };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const s = Math.sin(frame);
  const s2 = Math.sin(frame * 0.7);
  const pulse = 0.5 + 0.5 * s;

  const common = { stroke: color, strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" };
  const bodyColor = "rgba(255,255,255,0.15)";
  const W = 140, H = 140, cx = 70;

  const anims = {
    jumpingJacks: (
      <g>
        <circle cx={cx} cy={30 + s * 4} r={10} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx} y1={40 + s * 4} x2={cx} y2={80 + s * 4} {...common} />
        <line x1={cx} y1={55 + s * 4} x2={cx - 25 - pulse * 15} y2={40 + s * 4 - pulse * 15} {...common} />
        <line x1={cx} y1={55 + s * 4} x2={cx + 25 + pulse * 15} y2={40 + s * 4 - pulse * 15} {...common} />
        <line x1={cx} y1={80 + s * 4} x2={cx - 20 - pulse * 15} y2={110 + s * 4} {...common} />
        <line x1={cx} y1={80 + s * 4} x2={cx + 20 + pulse * 15} y2={110 + s * 4} {...common} />
      </g>
    ),
    chestPress: (
      <g>
        <rect x={20} y={90} width={100} height={8} rx={3} fill={bodyColor} stroke={color} strokeWidth={1.5} />
        <ellipse cx={cx} cy={84} rx={35} ry={7} fill={bodyColor} stroke={color} strokeWidth={1.5} />
        <circle cx={cx + 30} cy={80} r={9} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx - 15} y1={80} x2={cx - 30} y2={60 - pulse * 18} {...common} />
        <line x1={cx + 5} y1={80} x2={cx + 20} y2={60 - pulse * 18} {...common} />
        <rect x={cx - 38} y={52 - pulse * 18} width={14} height={5} rx={2} fill={color} opacity={0.8} />
        <rect x={cx + 20} y={52 - pulse * 18} width={14} height={5} rx={2} fill={color} opacity={0.8} />
      </g>
    ),
    chestFly: (
      <g>
        <rect x={20} y={90} width={100} height={8} rx={3} fill={bodyColor} stroke={color} strokeWidth={1.5} />
        <ellipse cx={cx} cy={84} rx={35} ry={7} fill={bodyColor} stroke={color} strokeWidth={1.5} />
        <circle cx={cx + 30} cy={80} r={9} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx - 15} y1={80} x2={cx - 35 - pulse * 15} y2={72 - pulse * 8} {...common} />
        <line x1={cx + 5} y1={80} x2={cx + 40 + pulse * 15} y2={72 - pulse * 8} {...common} />
        <circle cx={cx - 37 - pulse * 15} cy={70 - pulse * 8} r={5} fill={color} opacity={0.8} />
        <circle cx={cx + 42 + pulse * 15} cy={70 - pulse * 8} r={5} fill={color} opacity={0.8} />
      </g>
    ),
    inclinePress: (
      <g>
        <line x1={15} y1={110} x2={90} y2={70} stroke={color} strokeWidth={2} opacity={0.5} />
        <line x1={90} y1={70} x2={120} y2={70} stroke={color} strokeWidth={2} opacity={0.5} />
        <ellipse cx={55} cy={88} rx={32} ry={7} fill={bodyColor} stroke={color} strokeWidth={1.5} transform="rotate(-25 55 88)" />
        <circle cx={82} cy={68} r={9} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={45} y1={82} x2={30} y2={60 - pulse * 16} {...common} />
        <line x1={62} y1={78} x2={77} y2={58 - pulse * 16} {...common} />
        <rect x={22} y={52 - pulse * 16} width={13} height={4} rx={2} fill={color} opacity={0.8} />
        <rect x={77} y={52 - pulse * 16} width={13} height={4} rx={2} fill={color} opacity={0.8} />
      </g>
    ),
    pushup: (
      <g>
        <line x1={20} y1={90 - pulse * 20} x2={110} y2={75 - pulse * 5} {...common} strokeWidth={10} stroke={bodyColor} />
        <line x1={20} y1={90 - pulse * 20} x2={110} y2={75 - pulse * 5} stroke={color} strokeWidth={2} />
        <circle cx={112} cy={70 - pulse * 5} r={10} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={40} y1={86 - pulse * 18} x2={40} y2={105} {...common} />
        <line x1={85} y1={77 - pulse * 12} x2={85} y2={95} {...common} />
        <circle cx={40} cy={107} r={4} fill={color} opacity={0.7} />
        <circle cx={85} cy={97} r={4} fill={color} opacity={0.7} />
      </g>
    ),
    tricepPushdown: (
      <g>
        <circle cx={cx} cy={20} r={6} fill={color} opacity={0.5} />
        <line x1={cx} y1={26} x2={cx} y2={55} stroke={color} strokeWidth={1.5} strokeDasharray="3,3" opacity={0.5} />
        <line x1={cx} y1={55} x2={cx - 12} y2={62} {...common} />
        <line x1={cx} y1={55} x2={cx + 12} y2={62} {...common} />
        <circle cx={cx} cy={42} r={10} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx} y1={52} x2={cx} y2={85} {...common} />
        <line x1={cx} y1={60} x2={cx - 14} y2={62} {...common} />
        <line x1={cx} y1={60} x2={cx + 14} y2={62} {...common} />
        <line x1={cx - 14} y1={62} x2={cx - 12} y2={75 + pulse * 12} {...common} />
        <line x1={cx + 14} y1={62} x2={cx + 12} y2={75 + pulse * 12} {...common} />
        <line x1={cx} y1={85} x2={cx - 15} y2={110} {...common} />
        <line x1={cx} y1={85} x2={cx + 15} y2={110} {...common} />
      </g>
    ),
    stairmaster: (
      <g>
        {[0,1,2,3].map(i => (
          <rect key={i} x={20 + i * 22} y={75 - i * 12} width={22} height={35 + i * 12} rx={2} fill={bodyColor} stroke={color} strokeWidth={1.5} opacity={0.5} />
        ))}
        <circle cx={65} cy={38} r={10} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={65} y1={48} x2={65} y2={70} {...common} />
        <line x1={65} y1={60} x2={50} y2={72} {...common} />
        <line x1={65} y1={60} x2={78} y2={68} {...common} />
        <line x1={65} y1={70} x2={50} y2={85 - pulse * 10} {...common} />
        <line x1={65} y1={70} x2={80} y2={85 + pulse * 8} {...common} />
      </g>
    ),
    gobletSquat: (
      <g>
        <rect x={cx - 8} y={45 + pulse * 10} width={16} height={8} rx={3} fill={color} opacity={0.8} />
        <circle cx={cx} cy={32 + pulse * 10} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx} y1={43 + pulse * 10} x2={cx} y2={70 + pulse * 6} {...common} />
        <line x1={cx} y1={58 + pulse * 10} x2={cx - 10} y2={53 + pulse * 10} {...common} />
        <line x1={cx} y1={58 + pulse * 10} x2={cx + 10} y2={53 + pulse * 10} {...common} />
        <line x1={cx} y1={70 + pulse * 6} x2={cx - 22} y2={95 - pulse * 12} {...common} />
        <line x1={cx} y1={70 + pulse * 6} x2={cx + 22} y2={95 - pulse * 12} {...common} />
        <line x1={cx - 22} y1={95 - pulse * 12} x2={cx - 28} y2={115} {...common} />
        <line x1={cx + 22} y1={95 - pulse * 12} x2={cx + 28} y2={115} {...common} />
      </g>
    ),
    hipThrust: (
      <g>
        <rect x={15} y={70} width={50} height={10} rx={3} fill={bodyColor} stroke={color} strokeWidth={1.5} />
        <line x1={40} y1={60 - pulse * 20} x2={115} y2={60 - pulse * 20} stroke={color} strokeWidth={3} opacity={0.8} />
        <line x1={35} y1={68} x2={80} y2={60 - pulse * 20} {...common} strokeWidth={12} stroke={bodyColor} />
        <line x1={35} y1={68} x2={80} y2={60 - pulse * 20} stroke={color} strokeWidth={2} />
        <circle cx={85} cy={68} r={10} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={35} y1={68} x2={25} y2={100} {...common} />
        <line x1={55} y1={70} x2={65} y2={100} {...common} />
        <line x1={25} y1={100} x2={28} y2={115} {...common} />
        <line x1={65} y1={100} x2={62} y2={115} {...common} />
      </g>
    ),
    rdl: (
      <g>
        <line x1={15} y1={118} x2={125} y2={118} stroke={color} strokeWidth={1.5} opacity={0.3} />
        <line x1={25} y1={110} x2={115} y2={110} stroke={color} strokeWidth={3} opacity={0.6} />
        <circle cx={25} cy={110} r={8} fill="none" stroke={color} strokeWidth={2} opacity={0.5} />
        <circle cx={115} cy={110} r={8} fill="none" stroke={color} strokeWidth={2} opacity={0.5} />
        <circle cx={cx} cy={30 + pulse * 12} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx} y1={41 + pulse * 12} x2={cx - 10} y2={90 - pulse * 18} {...common} />
        <line x1={cx - 5} y1={75 - pulse * 12} x2={cx - 20} y2={108 - pulse * 20} {...common} />
        <line x1={cx - 5} y1={75 - pulse * 12} x2={cx + 10} y2={108 - pulse * 20} {...common} />
        <line x1={cx - 10} y1={90 - pulse * 18} x2={cx - 20} y2={118} {...common} />
        <line x1={cx - 10} y1={90 - pulse * 18} x2={cx + 10} y2={118} {...common} />
      </g>
    ),
    lunge: (
      <g>
        <line x1={15} y1={118} x2={125} y2={118} stroke={color} strokeWidth={1.5} opacity={0.3} />
        <circle cx={cx} cy={30} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx} y1={41} x2={cx} y2={75} {...common} />
        <line x1={cx} y1={58} x2={cx - 18} y2={68} {...common} />
        <line x1={cx} y1={58} x2={cx + 18} y2={68} {...common} />
        <line x1={cx} y1={75} x2={cx + 28} y2={90 + pulse * 10} {...common} />
        <line x1={cx + 28} y1={90 + pulse * 10} x2={cx + 32} y2={118} {...common} />
        <line x1={cx} y1={75} x2={cx - 28} y2={95 - pulse * 10} {...common} />
        <line x1={cx - 28} y1={95 - pulse * 10} x2={cx - 15} y2={118} {...common} />
      </g>
    ),
    cableKickback: (
      <g>
        <circle cx={cx - 10} cy={40} r={10} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx - 10} y1={50} x2={cx - 10} y2={75} {...common} />
        <line x1={cx - 10} y1={50} x2={cx + 35} y2={72} {...common} />
        <line x1={cx + 5} y1={60} x2={cx - 10} y2={78} {...common} />
        <line x1={cx - 10} y1={75} x2={cx - 25} y2={118} {...common} />
        <line x1={cx - 10} y1={75} x2={cx + 10 + pulse * 25} y2={90 - pulse * 20} {...common} />
      </g>
    ),
    latPulldown: (
      <g>
        <line x1={30} y1={20} x2={110} y2={20} stroke={color} strokeWidth={3} opacity={0.5} />
        <line x1={cx} y1={20} x2={cx} y2={32} stroke={color} strokeWidth={1.5} strokeDasharray="3,3" opacity={0.5} />
        <line x1={cx - 28} y1={32 + pulse * 20} x2={cx + 28} y2={32 + pulse * 20} stroke={color} strokeWidth={3} opacity={0.8} />
        <circle cx={cx} cy={42 + pulse * 5} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx} y1={53 + pulse * 5} x2={cx} y2={80} {...common} />
        <line x1={cx} y1={60 + pulse * 3} x2={cx - 28} y2={32 + pulse * 20} {...common} />
        <line x1={cx} y1={60 + pulse * 3} x2={cx + 28} y2={32 + pulse * 20} {...common} />
        <rect x={cx - 25} y={80} width={50} height={8} rx={3} fill={bodyColor} stroke={color} strokeWidth={1.5} opacity={0.5} />
        <line x1={cx} y1={88} x2={cx - 18} y2={112} {...common} />
        <line x1={cx} y1={88} x2={cx + 18} y2={112} {...common} />
      </g>
    ),
    seatedRow: (
      <g>
        <line x1={10} y1={75} x2={cx - 20 - pulse * 15} y2={75} stroke={color} strokeWidth={1.5} strokeDasharray="4,3" opacity={0.5} />
        <circle cx={10} cy={75} r={5} fill={color} opacity={0.5} />
        <circle cx={cx + 10} cy={48} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx + 10} y1={59} x2={cx + 10} y2={80} {...common} />
        <rect x={cx - 15} y={80} width={55} height={8} rx={3} fill={bodyColor} stroke={color} strokeWidth={1.5} opacity={0.5} />
        <line x1={cx + 5} y1={68} x2={cx - 20 - pulse * 15} y2={72} {...common} />
        <line x1={cx + 5} y1={68} x2={cx - 15 - pulse * 15} y2={78} {...common} />
        <line x1={cx + 10} y1={88} x2={cx - 10} y2={112} {...common} />
        <line x1={cx + 10} y1={88} x2={cx + 30} y2={112} {...common} />
      </g>
    ),
    dbRow: (
      <g>
        <rect x={45} y={80} width={70} height={10} rx={3} fill={bodyColor} stroke={color} strokeWidth={1.5} />
        <circle cx={100} cy={55} r={10} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={100} y1={65} x2={75} y2={80} {...common} />
        <line x1={75} y1={80} x2={45} y2={90 + pulse * 18} {...common} />
        <rect x={25} y={85 + pulse * 18} width={18} height={6} rx={2} fill={color} opacity={0.8} />
        <line x1={75} y1={80} x2={55} y2={82} {...common} />
        <line x1={75} y1={80} x2={80} y2={90} {...common} />
        <line x1={100} y1={65} x2={100} y2={90} {...common} />
        <line x1={100} y1={90} x2={105} y2={118} {...common} />
      </g>
    ),
    facePull: (
      <g>
        <circle cx={10} cy={60} r={7} fill={color} opacity={0.5} />
        <line x1={17} y1={60} x2={cx - 15 - pulse * 10} y2={55} stroke={color} strokeWidth={1.5} strokeDasharray="3,3" opacity={0.5} />
        <line x1={17} y1={60} x2={cx - 15 - pulse * 10} y2={65} stroke={color} strokeWidth={1.5} strokeDasharray="3,3" opacity={0.5} />
        <circle cx={cx + 10} cy={42} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx + 10} y1={53} x2={cx + 10} y2={85} {...common} />
        <line x1={cx + 10} y1={65} x2={cx - 15 - pulse * 10} y2={55} {...common} />
        <line x1={cx + 10} y1={65} x2={cx - 15 - pulse * 10} y2={65} {...common} />
        <line x1={cx + 10} y1={85} x2={cx - 5} y2={112} {...common} />
        <line x1={cx + 10} y1={85} x2={cx + 25} y2={112} {...common} />
      </g>
    ),
    rowingMachine: (
      <g>
        <line x1={10} y1={100} x2={130} y2={90} stroke={color} strokeWidth={2} opacity={0.4} />
        <rect x={cx - 10} y={82} width={22} height={8} rx={3} fill={bodyColor} stroke={color} strokeWidth={1.5} />
        <circle cx={cx - 5 + pulse * 8} cy={58} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx - 5 + pulse * 8} y1={69} x2={cx - 5 + pulse * 5} y2={82} {...common} />
        <line x1={15} y1={82} x2={cx - 10 - pulse * 15} y2={68} stroke={color} strokeWidth={2} strokeDasharray="4,3" opacity={0.5} />
        <line x1={cx - 5 + pulse * 8} y1={72} x2={cx - 10 - pulse * 15} y2={68} {...common} />
        <line x1={cx - 5 + pulse * 5} y1={82} x2={cx - 20 - pulse * 10} y2={100} {...common} />
        <line x1={cx - 5 + pulse * 5} y1={82} x2={cx + 15 + pulse * 10} y2={100} {...common} />
      </g>
    ),
    catCow: (
      <g>
        <line x1={15} y1={108} x2={125} y2={108} stroke={color} strokeWidth={1.5} opacity={0.3} />
        <circle cx={cx + 30} cy={68} r={10} fill={bodyColor} stroke={color} strokeWidth={2} />
        <path d={`M ${cx - 20} 88 Q ${cx} ${70 - s * 15} ${cx + 20} 80`} {...common} strokeWidth={8} stroke={bodyColor} />
        <path d={`M ${cx - 20} 88 Q ${cx} ${70 - s * 15} ${cx + 20} 80`} stroke={color} strokeWidth={2} fill="none" />
        <line x1={cx - 20} y1={88} x2={cx - 22} y2={108} {...common} />
        <line x1={cx - 5} y1={86} x2={cx - 7} y2={108} {...common} />
        <line x1={cx + 18} y1={80} x2={cx + 18} y2={108} {...common} />
        <line x1={cx + 35} y1={82} x2={cx + 35} y2={108} {...common} />
      </g>
    ),
    pigeonPose: (
      <g>
        <line x1={15} y1={118} x2={125} y2={118} stroke={color} strokeWidth={1.5} opacity={0.3} />
        <circle cx={cx} cy={35} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx} y1={46} x2={cx - 5} y2={85} {...common} />
        <line x1={cx - 5} y1={85} x2={cx - 30} y2={105} {...common} />
        <line x1={cx - 30} y1={105} x2={cx + 5} y2={115} {...common} />
        <line x1={cx - 5} y1={85} x2={cx + 40} y2={100} {...common} />
        <line x1={cx} y1={60} x2={cx - 30} y2={80 + pulse * 12} {...common} />
        <line x1={cx} y1={60} x2={cx + 20} y2={75} {...common} />
      </g>
    ),
    inclineWalk: (
      <g>
        <rect x={10} y={85} width={120} height={15} rx={5} fill={bodyColor} stroke={color} strokeWidth={1.5} transform="rotate(-12 70 92)" opacity={0.6} />
        {[0,1,2].map(i => (
          <circle key={i} cx={25 + i * 35 + (frame * 20 % 35)} cy={88 - (25 + i * 35 + (frame * 20 % 35)) * 0.22} r={3} fill={color} opacity={0.5} />
        ))}
        <circle cx={cx + 5} cy={48} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx + 5} y1={59} x2={cx + 5} y2={80} {...common} />
        <line x1={cx + 5} y1={68} x2={cx - 14} y2={74} {...common} />
        <line x1={cx + 5} y1={68} x2={cx + 20} y2={72} {...common} />
        <line x1={cx + 5} y1={80} x2={cx - 10} y2={100 - pulse * 8} {...common} />
        <line x1={cx + 5} y1={80} x2={cx + 18} y2={100 + pulse * 8} {...common} />
      </g>
    ),
    childPose: (
      <g>
        <line x1={15} y1={118} x2={125} y2={118} stroke={color} strokeWidth={1.5} opacity={0.3} />
        <path d={`M 30 ${100 + s * 3} Q 70 ${70 - s * 5} 110 ${95 + s * 2}`} stroke={color} strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.3} />
        <path d={`M 30 ${100 + s * 3} Q 70 ${70 - s * 5} 110 ${95 + s * 2}`} stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" />
        <circle cx={110} cy={90 + s * 2} r={10} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={55} y1={75 - s * 3} x2={25} y2={90 + s * 3} {...common} />
        <line x1={55} y1={75 - s * 3} x2={30} y2={110} {...common} />
      </g>
    ),
    shoulderPress: (
      <g>
        <circle cx={cx} cy={30} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx} y1={41} x2={cx} y2={80} {...common} />
        <line x1={cx} y1={55} x2={cx - 22} y2={48} {...common} />
        <line x1={cx} y1={55} x2={cx + 22} y2={48} {...common} />
        <line x1={cx - 22} y1={48} x2={cx - 22} y2={30 - pulse * 18} {...common} />
        <line x1={cx + 22} y1={48} x2={cx + 22} y2={30 - pulse * 18} {...common} />
        <rect x={cx - 30} y={22 - pulse * 18} width={16} height={5} rx={2} fill={color} opacity={0.8} />
        <rect x={cx + 15} y={22 - pulse * 18} width={16} height={5} rx={2} fill={color} opacity={0.8} />
        <line x1={cx} y1={80} x2={cx - 18} y2={112} {...common} />
        <line x1={cx} y1={80} x2={cx + 18} y2={112} {...common} />
      </g>
    ),
    lateralRaise: (
      <g>
        <circle cx={cx} cy={32} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx} y1={43} x2={cx} y2={80} {...common} />
        <line x1={cx} y1={58} x2={cx - 30 - pulse * 15} y2={55 - pulse * 18} {...common} />
        <line x1={cx} y1={58} x2={cx + 30 + pulse * 15} y2={55 - pulse * 18} {...common} />
        <circle cx={cx - 33 - pulse * 15} cy={53 - pulse * 18} r={5} fill={color} opacity={0.8} />
        <circle cx={cx + 33 + pulse * 15} cy={53 - pulse * 18} r={5} fill={color} opacity={0.8} />
        <line x1={cx} y1={80} x2={cx - 18} y2={112} {...common} />
        <line x1={cx} y1={80} x2={cx + 18} y2={112} {...common} />
      </g>
    ),
    bicepCurl: (
      <g>
        <circle cx={cx} cy={32} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx} y1={43} x2={cx} y2={80} {...common} />
        <line x1={cx} y1={80} x2={cx - 18} y2={112} {...common} />
        <line x1={cx} y1={80} x2={cx + 18} y2={112} {...common} />
        <line x1={cx} y1={58} x2={cx + 20} y2={68} {...common} />
        <line x1={cx + 20} y1={68} x2={cx + 22} y2={95} {...common} />
        <rect x={cx + 15} y={90} width={14} height={5} rx={2} fill={color} opacity={0.8} />
        <line x1={cx} y1={58} x2={cx - 20} y2={65} {...common} />
        <line x1={cx - 20} y1={65} x2={cx - 22} y2={65 - pulse * 30} {...common} />
        <rect x={cx - 30} y={60 - pulse * 30} width={14} height={5} rx={2} fill={color} opacity={0.8} />
      </g>
    ),
    hammerCurl: (
      <g>
        <circle cx={cx} cy={32} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx} y1={43} x2={cx} y2={80} {...common} />
        <line x1={cx} y1={80} x2={cx - 18} y2={112} {...common} />
        <line x1={cx} y1={80} x2={cx + 18} y2={112} {...common} />
        <line x1={cx} y1={58} x2={cx - 22} y2={65} {...common} />
        <line x1={cx - 22} y1={65} x2={cx - 22} y2={90 - pulse * 28} {...common} />
        <rect x={cx - 28} y={85 - pulse * 28} width={6} height={14} rx={2} fill={color} opacity={0.8} />
        <line x1={cx} y1={58} x2={cx + 22} y2={65} {...common} />
        <line x1={cx + 22} y1={65} x2={cx + 22} y2={68 + pulse * 18} {...common} />
        <rect x={cx + 20} y={62 + pulse * 18} width={6} height={14} rx={2} fill={color} opacity={0.8} />
      </g>
    ),
    tricepExtension: (
      <g>
        <circle cx={cx} cy={32} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx} y1={43} x2={cx} y2={80} {...common} />
        <line x1={cx} y1={80} x2={cx - 18} y2={112} {...common} />
        <line x1={cx} y1={80} x2={cx + 18} y2={112} {...common} />
        <line x1={cx} y1={55} x2={cx - 15} y2={40} {...common} />
        <line x1={cx} y1={55} x2={cx + 15} y2={40} {...common} />
        <line x1={cx - 15} y1={40} x2={cx - 8} y2={40 + pulse * 28} {...common} />
        <line x1={cx + 15} y1={40} x2={cx + 8} y2={40 + pulse * 28} {...common} />
        <rect x={cx - 10} y={38 + pulse * 28} width={20} height={7} rx={3} fill={color} opacity={0.8} />
      </g>
    ),
    jumpRope: (
      <g>
        <circle cx={cx} cy={30 - pulse * 8} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx} y1={41 - pulse * 8} x2={cx} y2={78 - pulse * 6} {...common} />
        <path d={`M ${cx - 22} ${65 - pulse * 6} Q ${cx} ${95 + s2 * 12} ${cx + 22} ${65 - pulse * 6}`} stroke={color} strokeWidth={2} fill="none" />
        <line x1={cx} y1={58 - pulse * 8} x2={cx - 22} y2={65 - pulse * 6} {...common} />
        <line x1={cx} y1={58 - pulse * 8} x2={cx + 22} y2={65 - pulse * 6} {...common} />
        <line x1={cx} y1={78 - pulse * 6} x2={cx - 18} y2={105 - pulse * 10} {...common} />
        <line x1={cx} y1={78 - pulse * 6} x2={cx + 18} y2={105 - pulse * 10} {...common} />
      </g>
    ),
    plank: (
      <g>
        <line x1={15} y1={118} x2={125} y2={118} stroke={color} strokeWidth={1.5} opacity={0.3} />
        <line x1={18} y1={95} x2={115} y2={82} {...common} strokeWidth={10} stroke={bodyColor} />
        <line x1={18} y1={95} x2={115} y2={82} stroke={color} strokeWidth={2} />
        <circle cx={118} cy={78} r={10} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={35} y1={92} x2={35} y2={110} {...common} />
        <line x1={75} y1={85} x2={75} y2={103} {...common} />
        <line x1={18} y1={95} x2={15} y2={110} {...common} />
        <circle cx={70} cy={86} r={3 + pulse * 2} fill={color} opacity={0.3} />
      </g>
    ),
    russianTwist: (
      <g>
        <line x1={15} y1={118} x2={125} y2={118} stroke={color} strokeWidth={1.5} opacity={0.3} />
        <circle cx={cx} cy={55} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx} y1={66} x2={cx - 5} y2={95} {...common} />
        <line x1={cx - 5} y1={95} x2={cx - 25} y2={108} {...common} />
        <line x1={cx - 5} y1={95} x2={cx + 20} y2={105} {...common} />
        <line x1={cx} y1={72} x2={cx - 20 + s * 30} y2={68 + s * 8} {...common} />
        <circle cx={cx - 25 + s * 30} cy={65 + s * 8} r={7} fill="none" stroke={color} strokeWidth={2} opacity={0.8} />
      </g>
    ),
    legRaise: (
      <g>
        <line x1={15} y1={85} x2={125} y2={85} stroke={color} strokeWidth={1.5} opacity={0.3} />
        <line x1={25} y1={78} x2={85} y2={78} {...common} strokeWidth={8} stroke={bodyColor} />
        <circle cx={92} cy={78} r={10} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={25} y1={78} x2={28} y2={78 - pulse * 40} {...common} />
        <line x1={45} y1={78} x2={48} y2={78 - pulse * 40} {...common} />
        <line x1={28} y1={78 - pulse * 40} x2={48} y2={78 - pulse * 40} {...common} />
      </g>
    ),
    mountainClimber: (
      <g>
        <line x1={15} y1={118} x2={125} y2={118} stroke={color} strokeWidth={1.5} opacity={0.3} />
        <circle cx={110} cy={55} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={20} y1={92} x2={100} y2={65} {...common} strokeWidth={8} stroke={bodyColor} />
        <line x1={20} y1={92} x2={100} y2={65} stroke={color} strokeWidth={2} />
        <line x1={40} y1={87} x2={40} y2={108} {...common} />
        <line x1={80} y1={74} x2={80} y2={95} {...common} />
        <line x1={20} y1={92} x2={45 + pulse * 25} y2={80 - pulse * 18} {...common} />
        <line x1={20} y1={92} x2={25} y2={110} {...common} />
      </g>
    ),
    burpee: (
      <g>
        {pulse > 0.5 ? (
          <g>
            <circle cx={cx} cy={20} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
            <line x1={cx} y1={31} x2={cx} y2={65} {...common} />
            <line x1={cx} y1={48} x2={cx - 20} y2={38} {...common} />
            <line x1={cx} y1={48} x2={cx + 20} y2={38} {...common} />
            <line x1={cx} y1={65} x2={cx - 20} y2={90} {...common} />
            <line x1={cx} y1={65} x2={cx + 20} y2={90} {...common} />
            {[-1,1].map(d => <line key={d} x1={cx + d * 25} y1={82} x2={cx + d * 35} y2={68} stroke={color} strokeWidth={2} opacity={0.6} />)}
          </g>
        ) : (
          <g>
            <circle cx={110} cy={55} r={10} fill={bodyColor} stroke={color} strokeWidth={2} />
            <line x1={15} y1={90} x2={100} y2={64} {...common} strokeWidth={8} stroke={bodyColor} />
            <line x1={15} y1={90} x2={100} y2={64} stroke={color} strokeWidth={2} />
            <line x1={35} y1={85} x2={35} y2={108} {...common} />
            <line x1={75} y1={71} x2={75} y2={94} {...common} />
            <line x1={15} y1={90} x2={12} y2={112} {...common} />
            <line x1={15} y1={90} x2={30} y2={110} {...common} />
          </g>
        )}
      </g>
    ),
    treadmill: (
      <g>
        <rect x={10} y={88} width={120} height={14} rx={5} fill={bodyColor} stroke={color} strokeWidth={1.5} opacity={0.6} />
        {[0,1,2,3].map(i => (
          <line key={i} x1={20 + i * 28 - (frame * 25 % 28)} y1={88} x2={20 + i * 28 - (frame * 25 % 28)} y2={102} stroke={color} strokeWidth={1} opacity={0.4} />
        ))}
        <circle cx={cx} cy={40} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx} y1={51} x2={cx} y2={78} {...common} />
        <line x1={cx} y1={65} x2={cx - 18} y2={70} {...common} />
        <line x1={cx} y1={65} x2={cx + 18} y2={70} {...common} />
        <line x1={cx} y1={78} x2={cx - 15} y2={100 - pulse * 10} {...common} />
        <line x1={cx} y1={78} x2={cx + 15} y2={100 + pulse * 8} {...common} />
      </g>
    ),
    jumpSquat: (
      <g>
        <circle cx={cx} cy={25 - pulse * 20} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx} y1={36 - pulse * 20} x2={cx} y2={72 - pulse * 15} {...common} />
        <line x1={cx} y1={55 - pulse * 18} x2={cx - 18} y2={48 - pulse * 16} {...common} />
        <line x1={cx} y1={55 - pulse * 18} x2={cx + 18} y2={48 - pulse * 16} {...common} />
        <line x1={cx} y1={72 - pulse * 15} x2={cx - 22} y2={95 + pulse * 8} {...common} />
        <line x1={cx} y1={72 - pulse * 15} x2={cx + 22} y2={95 + pulse * 8} {...common} />
        <line x1={cx - 22} y1={95 + pulse * 8} x2={cx - 25} y2={115} {...common} />
        <line x1={cx + 22} y1={95 + pulse * 8} x2={cx + 25} y2={115} {...common} />
      </g>
    ),
    kbSwing: (
      <g>
        <line x1={15} y1={118} x2={125} y2={118} stroke={color} strokeWidth={1.5} opacity={0.3} />
        <circle cx={cx} cy={90 - pulse * 55} r={9} fill="none" stroke={color} strokeWidth={2.5} />
        <rect x={cx - 6} y={83 - pulse * 55} width={12} height={5} rx={2} fill="none" stroke={color} strokeWidth={2} />
        <circle cx={cx} cy={35 + pulse * 8} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx} y1={46 + pulse * 8} x2={cx} y2={80 + pulse * 5} {...common} />
        <line x1={cx} y1={62 + pulse * 6} x2={cx - 12} y2={75 - pulse * 15} {...common} />
        <line x1={cx} y1={62 + pulse * 6} x2={cx + 12} y2={75 - pulse * 15} {...common} />
        <line x1={cx} y1={80 + pulse * 5} x2={cx - 22} y2={105 - pulse * 8} {...common} />
        <line x1={cx} y1={80 + pulse * 5} x2={cx + 22} y2={105 - pulse * 8} {...common} />
        <line x1={cx - 22} y1={105 - pulse * 8} x2={cx - 25} y2={118} {...common} />
        <line x1={cx + 22} y1={105 - pulse * 8} x2={cx + 25} y2={118} {...common} />
      </g>
    ),
    stepUp: (
      <g>
        <rect x={50} y={88} width={75} height={28} rx={4} fill={bodyColor} stroke={color} strokeWidth={1.5} opacity={0.6} />
        <circle cx={cx} cy={38} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx} y1={49} x2={cx} y2={75} {...common} />
        <line x1={cx} y1={62} x2={cx - 18} y2={68} {...common} />
        <line x1={cx} y1={62} x2={cx + 18} y2={68} {...common} />
        <line x1={cx} y1={75} x2={cx + 22} y2={88 - pulse * 15} {...common} />
        <line x1={cx} y1={75} x2={cx - 15} y2={105 + pulse * 8} {...common} />
        <line x1={cx - 15} y1={105 + pulse * 8} x2={cx - 18} y2={118} {...common} />
      </g>
    ),
  };

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display:"block", filter:`drop-shadow(0 0 8px ${color}44)` }}>
      <circle cx={cx} cy={H/2} r={60} fill={`${color}08`} />
      {anims[type] || anims.jumpingJacks}
    </svg>
  );
};

// ── Live Dot ──────────────────────────────────────────────────────────────
const LiveDot = () => (
  <span style={{ position:"relative", display:"inline-block", width:8, height:8, marginRight:6 }}>
    <span style={{ position:"absolute", inset:0, borderRadius:"50%", background:T.green, animation:"ping 2s ease infinite", opacity:0.5 }} />
    <span style={{ position:"absolute", inset:0, borderRadius:"50%", background:T.green }} />
    <style>{`@keyframes ping{0%{transform:scale(1);opacity:.5}80%,100%{transform:scale(2.5);opacity:0}}`}</style>
  </span>
);

// ── Ring ──────────────────────────────────────────────────────────────────
const Ring = ({ pct, size=110, stroke=9, color, val, unit }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - pct/100)}
          style={{ transition:"stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)" }} />
      </svg>
      <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center" }}>
        <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:"1.1rem", color, lineHeight:1 }}>{val}</div>
        <div style={{ fontSize:"0.55rem", color:T.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginTop:2 }}>{unit}</div>
      </div>
    </div>
  );
};

// ── Spark Bars ────────────────────────────────────────────────────────────
const SparkBars = ({ vals, color, goal }) => {
  const mx = Math.max(...vals, goal || 0);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:2, height:48, width:"100%" }}>
      {vals.map((v,i) => {
        const h = Math.max(2, (v/mx)*48);
        const isLast = i === vals.length-1;
        const hit = goal && v >= goal;
        return (
          <div key={i} title={v.toLocaleString()}
            style={{ flex:1, height:h, borderRadius:"2px 2px 0 0",
              background: isLast ? color : hit ? T.teal : "rgba(255,255,255,0.08)",
              transition:"height 0.4s ease", cursor:"default" }} />
        );
      })}
    </div>
  );
};

// ── Workout Logger ────────────────────────────────────────────────────────
function WorkoutLogger({ ex, selectedDay, weekKey, dayColor }) {
  const logKey  = `log_${weekKey}_${selectedDay}_${ex.id}`;
  const prevKey = `log_${getPrevWeekKey()}_${selectedDay}_${ex.id}`;
  const numSets = parseSets(ex.sets) || 3;

  const [sets, setSets] = useState(() => {
    const saved = Storage.get(logKey, null);
    if (saved && saved.length === numSets) return saved;
    return Array.from({ length: numSets }, (_, i) => ({ set: i + 1, reps: "", weight: "", rpe: "", done: false }));
  });

  // previous week's log for progressive overload reference
  const prevLog = Storage.get(prevKey, null);
  const prevHasData = prevLog?.some(s => s.weight || s.reps);

  // suggest load increase if last week all sets were RPE ≤ 7 and completed
  const prevAvgRpe = prevHasData
    ? prevLog.filter(s => s.rpe).reduce((a, s) => a + Number(s.rpe), 0) / prevLog.filter(s => s.rpe).length
    : null;
  const suggestIncrease = prevAvgRpe !== null && prevAvgRpe <= 7 && prevLog.every(s => s.done);

  useEffect(() => { Storage.set(logKey, sets); }, [sets, logKey]);

  const update = (i, field, val) =>
    setSets(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));

  const completedSets = sets.filter(s => s.done).length;

  if (!parseSets(ex.sets)) return null;

  return (
    <div style={{ background: T.card2, borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontSize: "0.65rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>📝 Log Your Sets</div>
        <div style={{ fontSize: "0.65rem", color: completedSets === numSets ? T.green : T.muted, fontWeight: 700 }}>{completedSets}/{numSets} done</div>
      </div>

      {/* ── Previous week reference ── */}
      {prevHasData && (
        <div style={{ background: `${T.violet}10`, border: `1px solid ${T.violet}22`, borderRadius: 8, padding: "6px 10px", marginBottom: 10, fontSize: "0.68rem", color: T.muted }}>
          <span style={{ color: T.violet, fontWeight: 700 }}>Last week: </span>
          {prevLog.map((s, i) => (
            <span key={i}>{s.weight || "—"} × {s.reps || "—"}{s.rpe ? ` @${s.rpe}` : ""}{i < prevLog.length - 1 ? "  ·  " : ""}</span>
          ))}
          {suggestIncrease && (
            <span style={{ color: T.green, fontWeight: 700, marginLeft: 6 }}>↑ Try more load today</span>
          )}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr 44px", gap: 6, marginBottom: 6 }}>
        {["", "Weight", `Reps (×${ex.reps})`, "RPE"].map((h, i) => (
          <div key={i} style={{ fontSize: "0.58rem", color: T.muted, textAlign: i > 0 ? "center" : "left" }}>{h}</div>
        ))}
      </div>
      {sets.map((s, i) => {
        const prev = prevLog?.[i];
        return (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr 44px", gap: 6, marginBottom: 6, alignItems: "center" }}>
            <button onClick={() => update(i, "done", !s.done)} style={{
              width: 24, height: 24, borderRadius: 7, border: `1px solid ${s.done ? T.green : T.border}`,
              background: s.done ? `${T.green}20` : "transparent", color: s.done ? T.green : T.muted,
              cursor: "pointer", fontSize: "0.68rem", display: "flex", alignItems: "center", justifyContent: "center",
            }}>{s.done ? "✓" : i + 1}</button>
            <input
              placeholder={prev?.weight ? `Last: ${prev.weight}` : "kg / lb"}
              value={s.weight} onChange={e => update(i, "weight", e.target.value)}
              style={{ padding: "6px 8px", borderRadius: 8, border: `1px solid ${s.done ? T.green + "44" : T.border}`, background: "#080912", color: T.text, fontSize: "0.8rem", outline: "none", width: "100%" }} />
            <input
              placeholder={prev?.reps ? `Last: ${prev.reps}` : ex.reps}
              value={s.reps} onChange={e => update(i, "reps", e.target.value)}
              style={{ padding: "6px 8px", borderRadius: 8, border: `1px solid ${s.done ? T.green + "44" : T.border}`, background: "#080912", color: T.text, fontSize: "0.8rem", outline: "none", width: "100%" }} />
            <select value={s.rpe} onChange={e => update(i, "rpe", e.target.value)}
              style={{ padding: "5px 2px", borderRadius: 8, border: `1px solid ${T.border}`, background: "#080912", color: T.text, fontSize: "0.72rem", outline: "none" }}>
              <option value="">—</option>
              {[5, 6, 7, 8, 9, 10].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        );
      })}
      <div style={{ fontSize: "0.6rem", color: T.muted, marginTop: 6 }}>
        RPE 5 = easy · 7 = challenging · 10 = max · Saved automatically
      </div>
    </div>
  );
}

// ── Exercise Modal ────────────────────────────────────────────────────────
function ExerciseModal({ ex, dayColor, onClose, onToggleDone, isDone, selectedDay, weekKey, phaseNote }) {
  const [vidState, setVidState] = useState("idle"); // idle | loading | ready | error
  const [videoUrl, setVideoUrl] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");
  const pollRef = useRef(null);

  useEffect(() => () => clearInterval(pollRef.current), []);

  const handleGenerate = useCallback(async () => {
    setVidState("loading");
    setStatusMsg("Submitting to Higgsfield AI...");
    try {
      const data = await createVideoGeneration(ex.name);
      const genId = data.generation_id || data.request_id;
      setStatusMsg("Generating your video...");

      pollRef.current = setInterval(async () => {
        try {
          const poll = await pollGeneration(genId);
          if (poll.status === "completed") {
            clearInterval(pollRef.current);
            const url = poll.results?.raw?.url ?? poll.results?.url ?? poll.url;
            setVideoUrl(url);
            setVidState("ready");
          } else if (poll.status === "failed" || poll.status === "nsfw") {
            clearInterval(pollRef.current);
            setVidState("error");
            setStatusMsg("Generation failed. Please try again.");
          } else {
            setStatusMsg(`Status: ${poll.status}…`);
          }
        } catch {
          clearInterval(pollRef.current);
          setVidState("error");
          setStatusMsg("Lost connection. Please try again.");
        }
      }, 4000);
    } catch (err) {
      setVidState("error");
      setStatusMsg(err.message || "Failed to connect to Higgsfield API.");
    }
  }, [ex.name]);

  const CSS_SPIN = `
    @keyframes hf-spin { to { transform: rotate(360deg); } }
    @keyframes hf-pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
    @keyframes hf-shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
  `;

  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center", padding:16,
      backdropFilter:"blur(10px)",
    }}>
      <style>{CSS_SPIN}</style>
      <div onClick={e=>e.stopPropagation()} style={{
        background:T.card, border:`1px solid ${dayColor}44`, borderRadius:28,
        padding:28, maxWidth:440, width:"100%", position:"relative",
        boxShadow:`0 0 80px ${dayColor}1a, 0 24px 48px rgba(0,0,0,0.6)`,
        maxHeight:"90vh", overflowY:"auto",
      }}>
        <button onClick={onClose} style={{
          position:"absolute", top:16, right:16, background:"rgba(255,255,255,0.06)",
          border:"none", borderRadius:"50%", width:32, height:32, cursor:"pointer",
          color:T.muted, fontSize:"1rem", display:"flex", alignItems:"center", justifyContent:"center"
        }}>✕</button>

        <div style={{ display:"flex", justifyContent:"center", marginBottom:20, background:`${dayColor}0a`, borderRadius:16, padding:"12px 0" }}>
          <ExerciseAnimation type={ex.anim} color={dayColor} />
        </div>

        <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:"1.15rem", fontWeight:800, marginBottom:6 }}>{ex.name}</div>
        <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
          <span style={{ fontSize:"0.7rem", padding:"3px 10px", borderRadius:100, background:`${dayColor}20`, color:dayColor, fontWeight:700 }}>{ex.muscle}</span>
          <span style={{ fontSize:"0.7rem", padding:"3px 10px", borderRadius:100, background:"rgba(255,255,255,0.06)", color:T.muted, fontWeight:600 }}>{ex.type}</span>
          <span style={{ fontSize:"0.7rem", padding:"3px 10px", borderRadius:100, background:"rgba(255,179,71,0.15)", color:T.amber, fontWeight:700 }}>🔥 ~{ex.kcal} kcal</span>
        </div>

        {phaseNote && (
          <div style={{ background: `rgba(94,234,212,0.08)`, border: `1px solid rgba(94,234,212,0.2)`, borderRadius: 10, padding: "8px 12px", marginBottom: 12, fontSize: "0.75rem", color: T.green }}>
            🌿 {phaseNote}
          </div>
        )}

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
          {[["Sets", ex.sets], ["Reps", ex.reps]].map(([l,v])=>(
            <div key={l} style={{ background:T.card2, borderRadius:12, padding:"10px 14px" }}>
              <div style={{ fontSize:"0.65rem", color:T.muted, textTransform:"uppercase", letterSpacing:"0.05em" }}>{l}</div>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:"1rem", color:dayColor, marginTop:2 }}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{ background:`${dayColor}0d`, border:`1px solid ${dayColor}22`, borderRadius:12, padding:"12px 14px", marginBottom:18 }}>
          <div style={{ fontSize:"0.65rem", color:T.muted, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:5 }}>💡 Coach Tip</div>
          <div style={{ fontSize:"0.82rem", lineHeight:1.6, color:"rgba(240,238,255,0.85)" }}>{ex.tip}</div>
        </div>

        <WorkoutLogger ex={ex} selectedDay={selectedDay} weekKey={weekKey} dayColor={dayColor} />

        {/* ── Higgsfield AI Video Section ── */}
        <div style={{
          background:"linear-gradient(135deg,rgba(180,139,250,0.06),rgba(56,217,192,0.06))",
          border:`1px solid rgba(180,139,250,0.2)`,
          borderRadius:16, padding:"16px", marginBottom:16,
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <div style={{
              width:28, height:28, borderRadius:8,
              background:"linear-gradient(135deg,#b48bfa,#38d9c0)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.75rem", flexShrink:0,
            }}>▶</div>
            <div>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:"0.85rem", color:T.text }}>AI Video Demo</div>
              <div style={{ fontSize:"0.62rem", color:T.muted }}>Powered by Higgsfield</div>
            </div>
          </div>

          {vidState === "idle" && (
            <button onClick={handleGenerate} style={{
              width:"100%", padding:"12px 0", borderRadius:12, border:"none", cursor:"pointer",
              background:"linear-gradient(135deg,#b48bfa,#38d9c0,#b48bfa)",
              backgroundSize:"200% auto",
              animation:"hf-shimmer 3s linear infinite",
              color:"#fff", fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:"0.88rem",
              boxShadow:"0 4px 20px rgba(180,139,250,0.35)",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            }}>
              ✨ Generate AI Video
            </button>
          )}

          {vidState === "loading" && (
            <div style={{ textAlign:"center", padding:"12px 0" }}>
              <div style={{
                width:32, height:32, borderRadius:"50%",
                border:"3px solid rgba(180,139,250,0.2)",
                borderTopColor:"#b48bfa",
                animation:"hf-spin 0.8s linear infinite",
                margin:"0 auto 10px",
              }} />
              <div style={{ fontSize:"0.78rem", color:"#b48bfa", fontWeight:600, animation:"hf-pulse 1.5s ease infinite" }}>
                {statusMsg}
              </div>
              <div style={{ fontSize:"0.62rem", color:T.muted, marginTop:4 }}>This takes ~30–90 seconds</div>
            </div>
          )}

          {vidState === "ready" && videoUrl && (
            <div>
              <video
                src={videoUrl}
                controls
                autoPlay
                loop
                playsInline
                style={{
                  width:"100%", borderRadius:12, display:"block",
                  border:"1px solid rgba(180,139,250,0.3)",
                  maxHeight:320, objectFit:"cover",
                }}
              />
              <button onClick={()=>{ setVidState("idle"); setVideoUrl(null); }} style={{
                marginTop:8, width:"100%", padding:"8px 0", borderRadius:10, border:"1px solid rgba(255,255,255,0.08)",
                background:"transparent", color:T.muted, fontSize:"0.7rem", cursor:"pointer", fontFamily:"'Outfit',sans-serif",
              }}>
                ↺ Regenerate
              </button>
            </div>
          )}

          {vidState === "error" && (
            <div style={{ textAlign:"center", padding:"8px 0" }}>
              <div style={{ fontSize:"0.78rem", color:T.red, marginBottom:10 }}>{statusMsg}</div>
              <button onClick={()=>setVidState("idle")} style={{
                padding:"8px 20px", borderRadius:10, border:`1px solid ${T.red}44`,
                background:`${T.red}12`, color:T.red, fontSize:"0.75rem", cursor:"pointer", fontFamily:"'Outfit',sans-serif", fontWeight:700,
              }}>Try Again</button>
            </div>
          )}
        </div>

        <button onClick={onToggleDone} style={{
          width:"100%", padding:"13px 0", borderRadius:14, border:"none", cursor:"pointer",
          background: isDone ? "rgba(94,234,212,0.15)" : `linear-gradient(135deg,${dayColor},${dayColor}bb)`,
          color: isDone ? T.green : "#fff",
          fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:"0.95rem",
          transition:"all 0.2s",
          boxShadow: isDone ? "none" : `0 6px 20px ${dayColor}44`,
        }}>
          {isDone ? "✓ Completed — Tap to Undo" : "Mark as Done ✓"}
        </button>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────
export default function App() {
  const [profile, setProfile] = useState(() => Storage.get('profile', null));
  const [tab, setTab] = useState("plan");
  const [selectedDay, setSelectedDay] = useState(0);
  const weekKey = Storage.getWeekKey();
  const [done, setDone] = useState(() => Storage.get(`done_${weekKey}`, {}));
  const [modal, setModal] = useState(null);
  const [liveData, setLiveData] = useState(HEALTH_SNAPSHOT);
  const [lastSync, setLastSync] = useState(new Date());
  const [resetConfirm, setResetConfirm] = useState(false);
  const [readiness, setReadiness] = useState(() => Storage.get(`readiness_${Storage.getTodayKey()}`, null));
  const [showReadiness, setShowReadiness] = useState(false);

  const cycleState = profile?.cycleTracking
    ? getCycleState(profile.cycleStartDate, profile.cycleLength)
    : null;

  useEffect(() => { Storage.set(`done_${weekKey}`, done); }, [done, weekKey]);
  useEffect(() => { if (readiness) Storage.set(`readiness_${Storage.getTodayKey()}`, readiness); }, [readiness]);

  useEffect(() => {
    const id = setInterval(() => {
      setLiveData(p => ({
        ...p,
        steps: p.steps + Math.floor(Math.random() * 80),
        kcal: p.kcal + Math.floor(Math.random() * 12),
      }));
      setLastSync(new Date());
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const handleOnboardingComplete = (p) => { Storage.set('profile', p); setProfile(p); };
  if (!profile) return <Onboarding onComplete={handleOnboardingComplete} />;

  const day = WEEK_PLAN[selectedDay];
  const doneCount = day.exercises.filter(e => done[`${selectedDay}-${e.id}`]).length;
  const totalKcal = day.exercises.reduce((a,e)=>a+e.kcal,0);
  const burnedKcal = day.exercises.filter(e=>done[`${selectedDay}-${e.id}`]).reduce((a,e)=>a+e.kcal,0);
  const stepPct = Math.min(100, Math.round((liveData.steps / liveData.stepGoal) * 100));
  const kcalPct = Math.min(100, Math.round((liveData.kcal / liveData.kcalGoal) * 100));

  const handleReset = () => { setDone({}); Storage.set(`done_${weekKey}`, {}); setResetConfirm(false); };

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:${T.bg};color:${T.text};font-family:'Outfit',sans-serif;-webkit-font-smoothing:antialiased}
    ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:3px}
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    .fu{animation:fadeUp 0.4s ease both}
    .d1{animation-delay:.05s}.d2{animation-delay:.1s}.d3{animation-delay:.15s}.d4{animation-delay:.2s}.d5{animation-delay:.25s}
  `;

  return (
    <div style={{ minHeight:"100vh", background:T.bg }}>
      <style>{CSS}</style>

      <div style={{ position:"fixed", top:"-30%", left:"-15%", width:"60%", height:"70%",
        background:`radial-gradient(ellipse,${day.color}0c 0%,transparent 70%)`, pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", bottom:"-20%", right:"-10%", width:"50%", height:"60%",
        background:`radial-gradient(ellipse,${T.teal}08 0%,transparent 70%)`, pointerEvents:"none", zIndex:0 }} />

      <div style={{ maxWidth:860, margin:"0 auto", padding:"20px 14px 80px", position:"relative", zIndex:1 }}>

        {/* Header */}
        <div className="fu d1" style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20, gap:10, flexWrap:"wrap" }}>
          <div>
            <h1 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:"clamp(1.4rem,5vw,2rem)", letterSpacing:"-0.04em", lineHeight:1 }}>
              {profile.name}<span style={{ color:day.color }}>'s</span> Reset
            </h1>
            <p style={{ fontSize:"0.7rem", color:T.muted, marginTop:5, display:"flex", alignItems:"center" }}>
              <LiveDot />
              <span style={{ fontFamily:"'JetBrains Mono',monospace" }}>Synced {lastSync.toLocaleTimeString()} · 30s live</span>
            </p>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
            {cycleState ? (
              <div style={{ background:`${cycleState.color}18`, border:`1px solid ${cycleState.color}33`, borderRadius:50, padding:"6px 14px", fontSize:"0.7rem", fontWeight:700, color:cycleState.color }}>
                {PHASE_EMOJI[cycleState.phase]} {cycleState.label} · Day {cycleState.dayOfCycle}
              </div>
            ) : (
              <div style={{ background:`${T.violet}18`, border:`1px solid ${T.violet}33`, borderRadius:50, padding:"6px 14px", fontSize:"0.7rem", fontWeight:700, color:T.violet }}>
                ⚡ Adaptive Plan
              </div>
            )}
            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:50, padding:"6px 14px", fontSize:"0.7rem", color:T.muted, fontFamily:"'JetBrains Mono',monospace" }}>
              {profile.goal?.replace("_", " ")}
            </div>
            {resetConfirm ? (
              <div style={{ display:"flex", gap:5 }}>
                <button onClick={handleReset} style={{ background:T.pink, border:"none", borderRadius:50, padding:"6px 12px", fontSize:"0.68rem", color:"#fff", fontWeight:700, cursor:"pointer" }}>Reset ✓</button>
                <button onClick={()=>setResetConfirm(false)} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:50, padding:"6px 12px", fontSize:"0.68rem", color:T.muted, cursor:"pointer" }}>Cancel</button>
              </div>
            ) : (
              <button onClick={()=>setResetConfirm(true)} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:50, padding:"6px 14px", fontSize:"0.68rem", color:T.muted, cursor:"pointer", fontFamily:"'Outfit',sans-serif", fontWeight:600 }}>↺ Reset</button>
            )}
          </div>
        </div>

        {/* Nav Tabs */}
        <div className="fu d1" style={{ display:"flex", gap:6, marginBottom:20 }}>
          {[["plan","📋 Plan"], ["metrics","📊 Metrics"], ["cycle","🌸 Cycle"], ["settings","⚙️ Settings"]].map(([k,l])=>(
            <button key={k} onClick={()=>setTab(k)} style={{
              flex:1, padding:"10px 0", borderRadius:12, border:"none", cursor:"pointer",
              fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:"0.78rem",
              background: tab===k ? day.color : T.card,
              color: tab===k ? "#fff" : T.muted,
              boxShadow: tab===k ? `0 4px 16px ${day.color}44` : "none",
              transition:"all 0.2s",
            }}>{l}</button>
          ))}
        </div>

        {/* PLAN TAB */}
        {tab === "plan" && (
          <>
            {/* Readiness Check */}
            {!readiness && !showReadiness && (
              <div className="fu d1" style={{ background: T.card, border: `1px solid ${T.teal}33`, borderRadius: 16, padding: "14px 18px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <div>
                  <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "0.88rem", color: T.teal }}>🌤 How are you feeling today?</div>
                  <div style={{ fontSize: "0.7rem", color: T.muted, marginTop: 2 }}>Takes 10 seconds · adapts your workout</div>
                </div>
                <button onClick={() => setShowReadiness(true)} style={{ background: `${T.teal}20`, border: `1px solid ${T.teal}44`, borderRadius: 10, padding: "8px 14px", color: T.teal, fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>Check in</button>
              </div>
            )}
            {showReadiness && !readiness && (
              <div className="fu d1" style={{ background: T.card, border: `1px solid ${T.teal}44`, borderRadius: 18, padding: "18px 20px", marginBottom: 16 }}>
                <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "0.9rem", color: T.teal, marginBottom: 14 }}>🌤 Today's check-in</div>
                {[
                  { key: "energy", label: "Energy", options: ["😴 1", "😐 2", "🙂 3", "😊 4", "⚡ 5"] },
                  { key: "sleep", label: "Sleep", options: ["💀 Bad", "😐 OK", "😴 Good"] },
                  { key: "soreness", label: "Soreness", options: ["✅ None", "😬 Some", "🔥 High"] },
                ].map(({ key, label, options }) => (
                  <div key={key} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: "0.68rem", color: T.muted, marginBottom: 6 }}>{label}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {options.map((opt, idx) => {
                        const val = key === "energy" ? idx + 1 : opt.split(" ")[1].toLowerCase();
                        const active = (readiness?.[key] ?? showReadiness?.[key]) === val;
                        return (
                          <button key={opt} onClick={() => setShowReadiness(prev => ({ ...prev, [key]: val }))}
                            style={{ padding: "6px 10px", borderRadius: 9, border: `1px solid ${showReadiness?.[key] === val ? T.teal : T.border}`, background: showReadiness?.[key] === val ? `${T.teal}20` : T.card2, color: showReadiness?.[key] === val ? T.teal : T.muted, fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: "0.75rem", cursor: "pointer" }}>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <button
                  disabled={!showReadiness?.energy || !showReadiness?.sleep || !showReadiness?.soreness}
                  onClick={() => { setReadiness(showReadiness); setShowReadiness(false); }}
                  style={{ width: "100%", padding: "10px 0", borderRadius: 12, border: "none", cursor: (showReadiness?.energy && showReadiness?.sleep && showReadiness?.soreness) ? "pointer" : "not-allowed", background: (showReadiness?.energy && showReadiness?.sleep && showReadiness?.soreness) ? `linear-gradient(135deg,${T.teal},${T.violet})` : T.card2, color: "#fff", fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: "0.85rem", marginTop: 4 }}>
                  Save & adapt plan ✓
                </button>
              </div>
            )}
            {readiness && cycleState && (
              <div className="fu d1" style={{ background: `${cycleState.color}10`, border: `1px solid ${cycleState.color}33`, borderRadius: 14, padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: cycleState.color }}>{PHASE_EMOJI[cycleState.phase]} {cycleState.label} · {cycleState.setsReps}</div>
                  <div style={{ fontSize: "0.68rem", color: T.muted, marginTop: 2 }}>Energy {readiness.energy}/5 · Sleep {readiness.sleep} · Soreness {readiness.soreness}</div>
                </div>
                <button onClick={() => { setReadiness(null); setShowReadiness(false); }} style={{ fontSize: "0.6rem", color: T.muted, background: "transparent", border: "none", cursor: "pointer" }}>redo</button>
              </div>
            )}

            <div className="fu d2" style={{ display:"flex", gap:6, marginBottom:20, overflowX:"auto", paddingBottom:4 }}>
              {WEEK_PLAN.map((d,i)=>(
                <button key={i} onClick={()=>setSelectedDay(i)}
                  style={{ flexShrink:0, padding:"10px 14px", borderRadius:14, border:`1px solid ${selectedDay===i ? d.color : T.border}`,
                    cursor:"pointer", fontFamily:"'Outfit',sans-serif", fontWeight:700,
                    background: selectedDay===i ? `${d.color}18` : T.card,
                    color: selectedDay===i ? d.color : T.muted,
                    boxShadow: selectedDay===i ? `0 4px 14px ${d.color}30` : "none",
                    transition:"all 0.2s", textAlign:"center", minWidth:72,
                  }}>
                  <div style={{ fontSize:"1.2rem", marginBottom:2 }}>{d.emoji}</div>
                  <div style={{ fontSize:"0.6rem", textTransform:"uppercase", letterSpacing:"0.04em" }}>{i===0 ? "TODAY" : d.name.slice(0,3)}</div>
                </button>
              ))}
            </div>

            <div className="fu d2" style={{ background:T.card, border:`1px solid ${day.color}33`, borderRadius:20, padding:"18px 20px", marginBottom:16, borderLeft:`4px solid ${day.color}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:10 }}>
                <div>
                  <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:"1.2rem", color:day.color }}>{day.emoji} {day.label}</div>
                  <div style={{ fontSize:"0.72rem", color:T.muted, marginTop:3 }}>{day.focus} · {day.exercises.length} exercises</div>
                  <div style={{ fontSize:"0.75rem", color:"rgba(240,238,255,0.6)", marginTop:6, lineHeight:1.5, maxWidth:380 }}>{day.tip}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:"1.5rem", color:day.color }}>{doneCount}/{day.exercises.length}</div>
                  <div style={{ fontSize:"0.62rem", color:T.muted, textTransform:"uppercase" }}>Completed</div>
                  <div style={{ marginTop:6, fontFamily:"'JetBrains Mono',monospace", fontSize:"0.72rem", color:T.amber }}>🔥 {burnedKcal}/{totalKcal} kcal</div>
                </div>
              </div>
              <div style={{ marginTop:14 }}>
                <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:100, height:6, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${Math.round((doneCount/day.exercises.length)*100)}%`, background:`linear-gradient(90deg,${day.color},${T.teal})`, borderRadius:100, transition:"width 0.5s ease" }} />
                </div>
              </div>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {day.exercises.map((ex,i) => {
                const key = `${selectedDay}-${ex.id}`;
                const isDone = done[key];
                const required = EQUIPMENT_MAP[ex.id] || [];
                const missing = required.filter(e => !(profile.equipment || []).includes(e));
                const hasMissing = missing.length > 0;
                const sub = SUBSTITUTIONS[ex.id];
                return (
                  <div key={ex.id}
                    className="fu"
                    style={{
                      animationDelay:`${0.05*i}s`,
                      background:T.card,
                      border:`1px solid ${isDone ? T.green+"33" : hasMissing ? T.amber+"44" : T.border}`,
                      borderRadius:16, padding:"14px 16px",
                      display:"flex", alignItems:"center", gap:14, cursor:"pointer",
                      opacity: isDone ? 0.55 : 1,
                      transition:"all 0.18s",
                    }}
                    onClick={()=>setModal(ex)}
                    onMouseEnter={e=>{ e.currentTarget.style.borderColor=isDone?T.green+"44":hasMissing?T.amber+"66":`${day.color}44`; e.currentTarget.style.transform="translateX(4px)"; }}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor=isDone?T.green+"33":hasMissing?T.amber+"44":T.border; e.currentTarget.style.transform=""; }}
                  >
                    <div style={{ width:64, height:64, flexShrink:0, borderRadius:14, background:`${hasMissing ? T.amber : day.color}10`, overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <div style={{ transform:"scale(0.45)", transformOrigin:"center" }}>
                        <ExerciseAnimation type={ex.anim} color={isDone ? T.green : hasMissing ? T.amber : day.color} />
                      </div>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:"0.9rem", textDecoration:isDone?"line-through":"none", marginBottom:2 }}>{ex.name}</div>
                      <div style={{ fontSize:"0.7rem", color:T.muted }}>{ex.sets} · {ex.muscle}</div>
                      <div style={{ display:"flex", gap:5, marginTop:5, flexWrap:"wrap" }}>
                        <span style={{ fontSize:"0.6rem", padding:"2px 7px", borderRadius:100, background:`${day.color}15`, color:day.color, fontWeight:700 }}>{ex.type}</span>
                        <span style={{ fontSize:"0.6rem", padding:"2px 7px", borderRadius:100, background:"rgba(255,179,71,0.12)", color:T.amber, fontWeight:700 }}>🔥 {ex.kcal} kcal</span>
                        {hasMissing && (
                          <span style={{ fontSize:"0.6rem", padding:"2px 7px", borderRadius:100, background:`${T.amber}18`, color:T.amber, fontWeight:700 }}>⚠️ Need {missing.join(", ")}</span>
                        )}
                      </div>
                      {hasMissing && sub && (
                        <div style={{ fontSize:"0.65rem", color:T.muted, marginTop:5, fontStyle:"italic" }}>💡 Swap: {sub}</div>
                      )}
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
                      <div style={{ width:32, height:32, borderRadius:10, background: isDone ? "rgba(94,234,212,0.15)" : hasMissing ? `${T.amber}18` : `${day.color}18`, color: isDone ? T.green : hasMissing ? T.amber : day.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.75rem", fontWeight:700, flexShrink:0 }}>
                        {isDone ? "✓" : `${i+1}`}
                      </div>
                      <div style={{ fontSize:"0.58rem", color:T.muted }}>tap</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* METRICS TAB */}
        {tab === "metrics" && (
          <div className="fu d2">
            <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap", background:T.card, border:`1px solid ${T.border}`, borderRadius:20, padding:"22px", marginBottom:16 }}>
              <Ring pct={stepPct} color={T.amber} val={liveData.steps.toLocaleString()} unit="Steps" />
              <Ring pct={kcalPct} color={T.pink} val={liveData.kcal} unit="Active kcal" />
              <Ring pct={Math.round((liveData.exMin/60)*100)} color={T.violet} val={liveData.exMin+"m"} unit="Exercise" />
              <Ring pct={68} color={T.red} val={liveData.rhr} unit="Resting HR" />
            </div>

            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:20, padding:"20px", marginBottom:16 }}>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:"0.9rem", marginBottom:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span>👣 Step History</span>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.7rem", color:T.muted }}>
                  avg {Math.round([3752,5755,6843,3890,11607,9595,10067,5694,3144,5659,4273,11707,12390,7322].reduce((a,b)=>a+b)/14).toLocaleString()}
                </span>
              </div>
              <SparkBars vals={[3752,5755,6843,3890,11607,9595,10067,5694,3144,5659,4273,11707,12390,7322,1006,11642,8662,4124,1066,1123,536,435,2784,9194,10731,3364,3575,3449,17556,liveData.steps]} color={T.amber} goal={10000} />
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:6, fontSize:"0.58rem", color:T.muted }}>
                <span>Mar 14</span><span style={{ color:T.amber, fontWeight:700 }}>Today</span>
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {[
                { label:"Weight", val:"63.5 kg", color:T.teal, icon:"⚖️", sub:"Goal: 60 kg" },
                { label:"Resting HR", val:`${liveData.rhr} bpm`, color:"#fc8181", icon:"❤️", sub:"30d avg: 75" },
                { label:"BMR Estimate", val:"~1,450 kcal", color:T.violet, icon:"⚡", sub:"25F, 63.5 kg" },
                { label:"Deficit Today", val:`~${Math.max(0, liveData.kcal-150)} kcal`, color:T.green, icon:"📉", sub:"Keep going!" },
              ].map(m=>(
                <div key={m.label} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"16px 18px" }}>
                  <div style={{ fontSize:"1rem", marginBottom:8 }}>{m.icon}</div>
                  <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:"1.5rem", color:m.color }}>{m.val}</div>
                  <div style={{ fontSize:"0.65rem", color:T.muted, textTransform:"uppercase", letterSpacing:"0.05em", marginTop:3 }}>{m.label}</div>
                  <div style={{ fontSize:"0.68rem", color:"rgba(240,238,255,0.35)", marginTop:4 }}>{m.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CYCLE TAB */}
        {tab === "cycle" && (
          <div className="fu d2">
            {cycleState ? (
              <div style={{ background:T.card, border:`1px solid ${cycleState.color}33`, borderRadius:20, padding:"22px", marginBottom:16, borderLeft:`4px solid ${cycleState.color}` }}>
                <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:"1rem", color:cycleState.color, marginBottom:8 }}>
                  {PHASE_EMOJI[cycleState.phase]} {cycleState.label} · Day {cycleState.dayOfCycle} of {cycleState.cycleLength}
                </div>
                <div style={{ fontSize:"0.78rem", color:"rgba(240,238,255,0.65)", lineHeight:1.6, marginBottom:10 }}>{cycleState.tip}</div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {[["Intensity", cycleState.intensity], ["Sets/Reps", cycleState.setsReps], ["Cardio", cycleState.cardio]].map(([l,v])=>(
                    <div key={l} style={{ background:`${cycleState.color}12`, border:`1px solid ${cycleState.color}22`, borderRadius:10, padding:"6px 12px", fontSize:"0.68rem" }}>
                      <span style={{ color:T.muted }}>{l}: </span><span style={{ color:cycleState.color, fontWeight:700 }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:12, fontSize:"0.72rem", color:T.amber }}>🍽 {cycleState.nutrition}</div>
              </div>
            ) : (
              <div style={{ background:T.card, border:`1px solid ${T.violet}33`, borderRadius:20, padding:"22px", marginBottom:16, borderLeft:`4px solid ${T.violet}` }}>
                <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:"1rem", color:T.violet, marginBottom:8 }}>⚡ Adaptive Training Mode</div>
                <div style={{ fontSize:"0.78rem", color:"rgba(240,238,255,0.65)", lineHeight:1.6 }}>Your plan adapts based on your readiness check-in and selected equipment. Update your profile to enable cycle-aware programming.</div>
                <button onClick={() => { Storage.set('profile', null); setProfile(null); }} style={{ marginTop:12, padding:"8px 16px", borderRadius:10, border:`1px solid ${T.violet}44`, background:`${T.violet}12`, color:T.violet, fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:"0.75rem", cursor:"pointer" }}>Update profile →</button>
              </div>
            )}

            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:20, padding:"20px", marginBottom:16 }}>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:"0.9rem", marginBottom:14 }}>28-Day Cycle Map</div>
              <div style={{ display:"flex", gap:3 }}>
                {Array.from({length: cycleState?.cycleLength || 28},(_,i)=>i+1).map(d=>{
                  const phase = d<=5?"menstrual":d<=13?"follicular":d<=16?"ovulatory":d<=23?"luteal_early":"luteal_late";
                  const cols = { menstrual:T.pink, follicular:T.teal, ovulatory:T.amber, luteal_early:T.violet, luteal_late:T.muted };
                  const col = cols[phase];
                  const isNow = cycleState ? d===cycleState.dayOfCycle : d===7;
                  return (
                    <div key={d} title={`Day ${d}`} style={{
                      flex:1, height:36, borderRadius:6, background:`${col}22`,
                      border:`2px solid ${isNow?col:"transparent"}`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:"0.5rem", color:col, fontWeight:700,
                      transform:isNow?"scaleY(1.25)":"scaleY(1)",
                      boxShadow:isNow?`0 0 14px ${col}88`:"none",
                      transition:"transform 0.2s", cursor:"default",
                    }}>
                      {isNow ? "▲" : ""}
                    </div>
                  );
                })}
              </div>
              <div style={{ display:"flex", gap:16, marginTop:12, flexWrap:"wrap" }}>
                {[["menstrual","🌑","Menstrual","1–5",T.pink],["follicular","🌱","Follicular","6–13",T.teal],
                  ["ovulatory","⚡","Ovulatory","14–16",T.amber],["luteal_early","🍂","Luteal","17–28",T.violet]].map(([,ico,name,days,col])=>(
                  <div key={name} style={{ display:"flex", alignItems:"center", gap:5, fontSize:"0.68rem", color:T.muted }}>
                    <div style={{ width:8, height:8, borderRadius:2, background:col }} />
                    {ico} {name} <span style={{ color:"rgba(255,255,255,0.25)" }}>({days})</span>
                  </div>
                ))}
              </div>
            </div>

            {[
              { key:"menstrual", phase:"Menstrual", days:"Days 1–5", color:T.pink, icon:"🌑", workouts:["Gentle yoga", "10-min walks", "Breathwork", "Light stretching"] },
              { key:"follicular", phase:"Follicular", days:"Days 6–13", color:T.teal, icon:"🌱", workouts:["Heavy lifting", "HIIT", "PR attempts", "Long runs"] },
              { key:"ovulatory", phase:"Ovulatory", days:"Days 14–16", color:T.amber, icon:"⚡", workouts:["Max effort", "Full body", "Plyometrics", "Sprint intervals"] },
              { key:"luteal_early", phase:"Luteal (early)", days:"Days 17–23", color:T.violet, icon:"🍂", workouts:["Moderate strength", "Steady-state cardio", "Pilates", "Technique work"] },
              { key:"luteal_late", phase:"Luteal (late)", days:"Days 24–28", color:T.muted, icon:"🌙", workouts:["Mobility", "Low-impact cardio", "Deload", "Restorative strength"] },
            ].map(p=>(
              <div key={p.phase} style={{ background:T.card, border:`1px solid ${p.color}22`, borderRadius:16, padding:"16px 18px", marginBottom:10, borderLeft:`3px solid ${p.color}`, opacity: cycleState && cycleState.phase === p.key ? 1 : 0.75 }}>
                <div style={{ marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, color:p.color, fontSize:"0.88rem" }}>{p.icon} {p.phase} {cycleState && cycleState.phase === p.key ? "← you're here" : ""}</div>
                    <div style={{ fontSize:"0.65rem", color:T.muted }}>{p.days} · {PHASES[p.key]?.setsReps}</div>
                  </div>
                </div>
                <div style={{ fontSize:"0.75rem", color:"rgba(240,238,255,0.6)", lineHeight:1.5, marginBottom:10 }}>{PHASES[p.key]?.tip}</div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {p.workouts.map(w=>(
                    <span key={w} style={{ fontSize:"0.62rem", padding:"3px 9px", borderRadius:100, background:`${p.color}15`, color:p.color, fontWeight:700 }}>{w}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SETTINGS TAB */}
        {tab === "settings" && (
          <div className="fu d2">
            <SettingsPage profile={profile} onSave={(p) => { Storage.set('profile', p); setProfile(p); }} />
          </div>
        )}
      </div>

      {modal && (
        <ExerciseModal
          ex={modal}
          dayColor={day.color}
          onClose={()=>setModal(null)}
          isDone={done[`${selectedDay}-${modal.id}`]}
          onToggleDone={()=>setDone(p=>({...p,[`${selectedDay}-${modal.id}`]:!p[`${selectedDay}-${modal.id}`]}))}
          selectedDay={selectedDay}
          weekKey={weekKey}
          phaseNote={cycleState ? buildPhaseNote(modal.type, cycleState.intensity) : null}
        />
      )}
    </div>
  );
}
