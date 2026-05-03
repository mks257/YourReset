import { T } from "./theme";

// ── Equipment requirements per exercise ────────────────────────────────────
// Values map to profile.equipment ids: dumbbells|barbell|cable|machines|kettlebell|cardio|bands
export const EQUIPMENT_MAP = {
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

export const SUBSTITUTIONS = {
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

// ── Full exercise objects for one-tap swaps ────────────────────────────────
// Keyed by the original exercise id that requires missing equipment.
// Each value is a complete exercise object ready to drop into the plan.
export const SWAP_LIBRARY = {
  tricep_push: {
    id:"swap_diamond_pushup", name:"Diamond Push-Ups",
    sets:"3×12", reps:"12", kcal:28,
    muscle:"Triceps, Chest", type:"Toning", anim:"pushup",
    tip:"Hands close in a diamond shape below chest. Keep elbows tracking back, not flaring out.",
  },
  cable_kick: {
    id:"swap_donkey_kick", name:"Donkey Kicks",
    sets:"3×15 each", reps:"15", kcal:35,
    muscle:"Glutes", type:"Toning", anim:"cableKickback",
    tip:"On all fours. Drive heel toward ceiling, squeeze glute at top. Hips stay square throughout.",
  },
  lat_pull: {
    id:"swap_table_row", name:"Bodyweight Rows",
    sets:"3×10", reps:"10", kcal:40,
    muscle:"Lats, Mid Back", type:"Strength", anim:"seatedRow",
    tip:"Lie under a sturdy table, grip edge, pull chest up to hands. Keep body straight like a plank.",
  },
  seated_row: {
    id:"swap_db_row", name:"Dumbbell Bent-Over Row",
    sets:"3×12 each", reps:"12", kcal:52,
    muscle:"Mid Back", type:"Strength", anim:"dbRow",
    tip:"Hip hinge forward, row dumbbell to hip. Same pull pattern as the cable row — heavy is fine.",
  },
  face_pull: {
    id:"swap_band_pull", name:"Band Pull-Aparts",
    sets:"3×15", reps:"15", kcal:18,
    muscle:"Rear Delts, Upper Back", type:"Toning", anim:"lateralRaise",
    tip:"Hold band at shoulder width with straight arms, pull apart until hands reach ears. Squeeze blades.",
  },
  row_machine: {
    id:"swap_burpee_cardio", name:"Burpee Intervals",
    sets:"10 min", reps:"40s on / 20s off", kcal:110,
    muscle:"Full Body", type:"Fat Burn", anim:"burpee",
    tip:"Same cardiovascular demand as rowing. Work at 80% effort during each interval.",
  },
  finisher_stairs: {
    id:"swap_step_up", name:"Box Step-Ups",
    sets:"10 min", reps:"continuous", kcal:80,
    muscle:"Glutes, Quads", type:"Fat Burn", anim:"stepUp",
    tip:"Use a sturdy chair, step, or bench. Full foot on surface, drive through heel. Add dumbbells to progress.",
  },
  stairs_leg: {
    id:"swap_bulgarian", name:"Bulgarian Split Squats",
    sets:"3×12 each", reps:"12", kcal:68,
    muscle:"Quads, Glutes", type:"Strength", anim:"lunge",
    tip:"Rear foot elevated on bench or chair. Deep front-leg squat. One of the best lower-body builders.",
  },
  incline_walk: {
    id:"swap_hill_walk", name:"Outdoor Hill Walk",
    sets:"30 min", reps:"moderate pace", kcal:168,
    muscle:"Full Body", type:"Fat Burn", anim:"inclineWalk",
    tip:"Any incline works — stairs, parking ramps, hill paths. Same fat-burn stimulus as treadmill incline.",
  },
  hiit_sprint: {
    id:"swap_outdoor_sprint", name:"Outdoor Sprint Intervals",
    sets:"12 min", reps:"30s sprint / 90s walk", kcal:122,
    muscle:"Full Body", type:"Fat Burn", anim:"treadmill",
    tip:"Flat ground or slight slope. 80% sprint effort. Same EPOC afterburn as treadmill intervals.",
  },
  kb_swing: {
    id:"swap_db_swing", name:"Dumbbell Swings",
    sets:"4×20", reps:"20", kcal:85,
    muscle:"Glutes, Core, Back", type:"Fat Burn", anim:"kbSwing",
    tip:"Hold one dumbbell by one end with both hands. Identical hip-hinge and drive as the kettlebell swing.",
  },
};

// ── Live health data ───────────────────────────────────────────────────────
export const HEALTH_SNAPSHOT = {
  steps: 5943, stepGoal: 10000,
  kcal: 210, kcalGoal: 500,
  rhr: 70, exMin: 22,
  weight: 63.5, age: 25,
};

// ── 7-Day Workout Plan ─────────────────────────────────────────────────────
export const WEEK_PLAN = [
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
