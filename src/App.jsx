import { useEffect, useState } from "react";

/* ══════════════════════════════════════════════════════════════
   THEME
══════════════════════════════════════════════════════════════ */

const THEMES = [
  { id: "cyber", name: "Cyber Dark", bg: "#05060f", card: "#0b0d1c", card2: "#101224", border: "rgba(255,255,255,0.07)", pink: "#ff5fa0", teal: "#2de2c8", amber: "#ffb84d", violet: "#b388ff", green: "#4fffb0", red: "#ff6060", blue: "#5bc8ff", text: "#f0eeff", muted: "#55557a" },
  { id: "light", name: "Clean Light", bg: "#ffffff", card: "#f4f7f6", card2: "#eaeef2", border: "rgba(0,0,0,0.06)", pink: "#f06292", teal: "#4db6ac", amber: "#ffb74d", violet: "#ba68c8", green: "#81c784", red: "#e57373", blue: "#64b5f6", text: "#2c3e50", muted: "#90a4ae" },
  { id: "midnight", name: "Midnight Ocean", bg: "#020c1b", card: "#0a192f", card2: "#112240", border: "rgba(100,255,218,0.1)", pink: "#f50057", teal: "#64ffda", amber: "#ff9100", violet: "#651fff", green: "#00e676", red: "#d50000", blue: "#00b0ff", text: "#ccd6f6", muted: "#8892b0" },
  { id: "sunset", name: "Sunset Horizon", bg: "#1f0c1b", card: "#2d1326", card2: "#3b1a32", border: "rgba(255,183,77,0.1)", pink: "#ff4081", teal: "#1de9b6", amber: "#ffab40", violet: "#e040fb", green: "#00e676", red: "#ff1744", blue: "#00e5ff", text: "#ffebee", muted: "#bcaaa4" }
];

const getGlobalCSS = (T) => `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:${T.bg};color:${T.text};font-family:'Outfit',sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden}
  ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.09);border-radius:3px}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes ping{0%{transform:scale(1);opacity:.6}80%,100%{transform:scale(2.8);opacity:0}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  @keyframes glow{0%,100%{opacity:.6}50%{opacity:1}}
  .fu{animation:fadeUp 0.38s ease both}
  .d0{animation-delay:0s}.d1{animation-delay:.06s}.d2{animation-delay:.12s}.d3{animation-delay:.18s}.d4{animation-delay:.24s}.d5{animation-delay:.3s}
`;

/* ══════════════════════════════════════════════════════════════
   REAL HEALTH DATA (from Apple Health — last 30 days)
══════════════════════════════════════════════════════════════ */
const REAL = {
  stepHistory:  [3752,5755,6843,3890,11607,9595,10067,5694,3144,5659,4273,11707,12390,7322,1006,11642,8662,4124,1066,1123,536,435,2784,9194,10731,3364,3575,3449,17556,5943],
  kcalHistory:  [148,526,257,214,666,170,527,622,56,550,235,631,502,369,18,364,296,73,21,20,10,8,50,160,537,172,63,59,764,210],
  rhrHistory:   [0,0,59,83,71,80,0,90,80,0,69,80,85,72,71,0,86,72,0,0,0,0,0,0,74,59,0,0,66,70],
  exHistory:    [30,89,28,13,115,0,93,119,70,18,95,43,30,0,39,33,0,0,0,0,0,0,0,71,8,0,0,0,142,22],
  distHistory:  [2450,4430,5044,2819,8171,7462,6587,3679,2504,3708,2873,8779,8109,5209,856,7961,5669,3184,917,936,460,357,2116,7007,7487,2308,2790,2625,12457,4040],
  dateLabels:   ["Mar14","Mar15","Mar16","Mar17","Mar18","Mar19","Mar20","Mar21","Mar22","Mar23","Mar24","Mar25","Mar26","Mar27","Mar28","Mar29","Mar30","Mar31","Apr1","Apr2","Apr3","Apr4","Apr5","Apr6","Apr7","Apr8","Apr9","Apr10","Apr11","Apr12"],
  weight: 63.5, rhr: 70, exMin: 22, age: 25,
  stepGoal: 10000, kcalGoal: 500,
};

/* ══════════════════════════════════════════════════════════════
   3-D FIGURE ENGINE
══════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════
   EXERCISE IMAGE MAP
══════════════════════════════════════════════════════════════ */
const EXERCISE_IMAGE_MAP = {
  armCircles:      'https://yuhonas.github.io/free-exercise-db/exercises/Arm_Circles/0.jpg',
  bicepCurl:       'https://yuhonas.github.io/free-exercise-db/exercises/Dumbbell_Bicep_Curl/0.jpg',
  burpee:          'https://yuhonas.github.io/free-exercise-db/exercises/Freehand_Jump_Squat/0.jpg',
  catCow:          'https://yuhonas.github.io/free-exercise-db/exercises/Cat_Stretch/0.jpg',
  chestPress:      'https://yuhonas.github.io/free-exercise-db/exercises/Barbell_Bench_Press_-_Medium_Grip/0.jpg',
  childPose:       'https://yuhonas.github.io/free-exercise-db/exercises/Childs_Pose/0.jpg',
  deepBreath:      'https://yuhonas.github.io/free-exercise-db/exercises/Stomach_Vacuum/0.jpg',
  hamstringStretch:'https://yuhonas.github.io/free-exercise-db/exercises/Hamstring_Stretch/0.jpg',
  highKnees:       'https://yuhonas.github.io/free-exercise-db/exercises/Double_Leg_Butt_Kick/0.jpg',
  hipCircles:      'https://yuhonas.github.io/free-exercise-db/exercises/Standing_Hip_Circles/0.jpg',
  hipThrust:       'https://yuhonas.github.io/free-exercise-db/exercises/Barbell_Hip_Thrust/0.jpg',
  inclineWalk:     'https://yuhonas.github.io/free-exercise-db/exercises/Walking_Treadmill/0.jpg',
  jumpRope:        'https://yuhonas.github.io/free-exercise-db/exercises/Rope_Jumping/0.jpg',
  jumpingJacks:    'https://yuhonas.github.io/free-exercise-db/exercises/Star_Jump/0.jpg',
  kbSwing:         'https://yuhonas.github.io/free-exercise-db/exercises/One-Arm_Kettlebell_Swings/0.jpg',
  latPulldown:     'https://yuhonas.github.io/free-exercise-db/exercises/Wide-Grip_Lat_Pulldown/0.jpg',
  lateralRaise:    'https://yuhonas.github.io/free-exercise-db/exercises/Side_Lateral_Raise/0.jpg',
  lunge:           'https://yuhonas.github.io/free-exercise-db/exercises/Barbell_Lunge/0.jpg',
  mountainClimber: 'https://yuhonas.github.io/free-exercise-db/exercises/Mountain_Climbers/0.jpg',
  pigeonPose:      'https://yuhonas.github.io/free-exercise-db/exercises/Runners_Stretch/0.jpg',
  plank:           'https://yuhonas.github.io/free-exercise-db/exercises/Plank/0.jpg',
  pushup:          'https://yuhonas.github.io/free-exercise-db/exercises/Push-Up_Wide/0.jpg',
  quadStretch:     'https://yuhonas.github.io/free-exercise-db/exercises/Quad_Stretch/0.jpg',
  rdl:             'https://yuhonas.github.io/free-exercise-db/exercises/Romanian_Deadlift/0.jpg',
  russianTwist:    'https://yuhonas.github.io/free-exercise-db/exercises/Cable_Russian_Twists/0.jpg',
  shoulderPress:   'https://yuhonas.github.io/free-exercise-db/exercises/Dumbbell_Shoulder_Press/0.jpg',
  shoulderStretch: 'https://yuhonas.github.io/free-exercise-db/exercises/Shoulder_Stretch/0.jpg',
  spinalTwist:     'https://yuhonas.github.io/free-exercise-db/exercises/Spinal_Stretch/0.jpg',
  squat:           'https://yuhonas.github.io/free-exercise-db/exercises/Barbell_Squat/0.jpg',
};

const FEMALE_HERO = './ex_default_female.png';
const MALE_HERO   = './hero_male.png';

function Figure3D({ animKey, color, height = 220, charType = 'female' }) {
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




/* ══════════════════════════════════════════════════════════════
   WORKOUT DATA  — warm-up → main → cooldown per day
══════════════════════════════════════════════════════════════ */
const getMuscleGroups = (T) => [
  {
    day:0, name:"Chest", emoji:"🏋️", label:"Chest & Triceps",
    color:T.pink, focus:"Heavy Fat Loss", phase:"follicular", stepGoal: 12000,
    tip:"Follicular phase — estrogen rising. Best window for chest. Push hard today!",
    warmUp: [
      { id:"wu1", name:"Jumping Jacks", anim:"jumpingJacks", sets:"3 min", kcal:20, tip:"Full arm swing, land softly. Raises core temp before lifting." },
      { id:"wu2", name:"Arm Circles",   anim:"armCircles",   sets:"60s each dir", kcal:8, tip:"Big slow circles first, then small fast. Opens up shoulder joint." },
      { id:"wu3", name:"Hip Circles",   anim:"hipCircles",   sets:"30s each way", kcal:6, tip:"Hands on hips, big rotations. Lubricates hip flexors." },
    ],
    main: [
      { id:"m1", name:"Dumbbell Chest Press", anim:"chestPress",   sets:"3 × 15", kcal:55, muscle:"Chest, Triceps", tip:"Lower to chest, press straight up. Squeeze pecs at top." },
      { id:"m2", name:"Incline DB Press",     anim:"chestPress",   sets:"3 × 12", kcal:50, muscle:"Upper Chest",   tip:"30–45° angle. Targets upper chest for lift and toning." },
      { id:"m3", name:"Push-Ups",             anim:"pushup",       sets:"3 × 15", kcal:40, muscle:"Chest, Core",   tip:"Wide hands for chest. Body in a straight line always." },
      { id:"m4", name:"Lateral Raises",       anim:"lateralRaise", sets:"3 × 15", kcal:35, muscle:"Shoulders",     tip:"Lead with elbows. Control on the way down." },
      { id:"m5", name:"Bicep Curl",           anim:"bicepCurl",    sets:"3 × 15", kcal:30, muscle:"Biceps",        tip:"Supinate at top. 3-sec slow lower. No elbow swing." },
      { id:"m6", name:"Lat Pulldown",         anim:"latPulldown",  sets:"3 × 12", kcal:55, muscle:"Back, Lats",    tip:"Wide grip. Pull to upper chest. Squeeze lats at bottom." },
    ],
    coolDown: [
      { id:"cd1", name:"Chest Door Stretch",    anim:"shoulderStretch", sets:"45s", kcal:4, tip:"Arm at 90° on wall/door. Gentle press forward. Feel chest open." },
      { id:"cd2", name:"Shoulder Cross Stretch", anim:"shoulderStretch", sets:"30s each", kcal:3, tip:"Pull arm across chest. Hold 30 seconds each side." },
      { id:"cd3", name:"Child's Pose",           anim:"childPose",       sets:"60s", kcal:4, tip:"Sink hips back to heels. Arms stretched forward. Breathe deep." },
      { id:"cd4", name:"Spinal Twist",           anim:"spinalTwist",     sets:"30s each", kcal:3, tip:"Seated twist. Exhale to rotate deeper. Releases spine." },
      { id:"cd5", name:"Deep Breath Hold",       anim:"deepBreath",      sets:"5 breaths", kcal:2, tip:"Inhale 4 counts, hold 4, exhale 6. Brings HR down fast." },
    ],
  },
  {
    day:1, name:"Legs", emoji:"🦵", label:"Legs & Glutes",
    color:"#f472b6", focus:"Intense Fat Loss", phase:"follicular", stepGoal: 10000,
    tip:"Leg day on follicular = GOLD. Pain tolerance elevated — go heavier!",
    warmUp: [
      { id:"wu1", name:"High Knees",   anim:"highKnees",    sets:"2 min", kcal:25, tip:"Drive knees above hip height. Land on ball of foot. Stay light." },
      { id:"wu2", name:"Hip Circles",  anim:"hipCircles",   sets:"30s each", kcal:6, tip:"Wide circles. Warm up hip flexors before heavy squats and lunges." },
      { id:"wu3", name:"Arm Circles",  anim:"armCircles",   sets:"30s", kcal:5, tip:"Gets blood flowing and shoulders mobile before deadlifts." },
    ],
    main: [
      { id:"m1", name:"Goblet Squat",       anim:"squat",       sets:"4 × 15", kcal:75, muscle:"Quads, Glutes",  tip:"Deep squat — thighs parallel or below. Drive through heels." },
      { id:"m2", name:"Hip Thrust",         anim:"hipThrust",   sets:"4 × 15", kcal:65, muscle:"Glutes",         tip:"Squeeze HARD at top. Best exercise for glute shaping." },
      { id:"m3", name:"Romanian Deadlift",  anim:"rdl",         sets:"3 × 12", kcal:65, muscle:"Hamstrings",     tip:"Hinge at hips. Feel hamstring stretch. Neutral spine always." },
      { id:"m4", name:"Reverse Lunges",     anim:"lunge",       sets:"3 × 12e", kcal:55, muscle:"Quads, Glutes", tip:"Step back, lower back knee to floor. Front shin vertical." },
      { id:"m5", name:"Kettlebell Swings",  anim:"kbSwing",     sets:"3 × 20", kcal:80, muscle:"Glutes, Core",   tip:"Hips drive the swing — not arms. Explosive hip extension." },
    ],
    coolDown: [
      { id:"cd1", name:"Pigeon Pose",         anim:"pigeonPose",       sets:"90s each", kcal:5, tip:"Square hips. Breathe into the tension. Releases tight glutes." },
      { id:"cd2", name:"Hamstring Stretch",   anim:"hamstringStretch", sets:"45s each", kcal:4, tip:"Hinge forward standing. Feel the stretch up back of leg." },
      { id:"cd3", name:"Quad Stretch",        anim:"quadStretch",      sets:"30s each", kcal:3, tip:"Stand on one leg, pull heel to glute. Squeeze core to balance." },
      { id:"cd4", name:"Spinal Twist",        anim:"spinalTwist",      sets:"30s each", kcal:3, tip:"Seated. Exhale into the twist. Decompresses lumbar spine." },
      { id:"cd5", name:"Child's Pose",        anim:"childPose",        sets:"60s", kcal:4, tip:"Hips to heels. Full spine elongation. Breathe slowly." },
    ],
  },
  {
    day:2, name:"Back", emoji:"💪", label:"Back & Posture",
    color:T.teal, focus:"Targeted Fat Loss", phase:"follicular", stepGoal: 12000,
    tip:"Strong back = better posture and faster metabolism. Pull hard.",
    warmUp: [
      { id:"wu1", name:"Jumping Jacks", anim:"jumpingJacks", sets:"2 min", kcal:18, tip:"Gets the whole body warm. Good rhythm before back day." },
      { id:"wu2", name:"Arm Circles",   anim:"armCircles",   sets:"45s each", kcal:6, tip:"Especially important — shoulder health is crucial for pulling movements." },
      { id:"wu3", name:"Hip Circles",   anim:"hipCircles",   sets:"30s", kcal:5, tip:"Loosens up lower back before rows and deadlifts." },
    ],
    main: [
      { id:"m1", name:"Lat Pulldown",       anim:"latPulldown",  sets:"3 × 12", kcal:55, muscle:"Lats",      tip:"Wide grip. Pull to upper chest. Lean back slightly." },
      { id:"m2", name:"Seated Cable Row",   anim:"latPulldown",  sets:"3 × 15", kcal:45, muscle:"Mid Back",  tip:"Full extension then row to navel. Chest stays tall." },
      { id:"m3", name:"Dumbbell RDL",       anim:"rdl",          sets:"3 × 12", kcal:60, muscle:"Back, Hams", tip:"Back muscle activation all the way through hip hinge." },
      { id:"m4", name:"Lateral Raises",     anim:"lateralRaise", sets:"3 × 15", kcal:35, muscle:"Rear Delts", tip:"Crucial for balanced shoulders and posture." },
      { id:"m5", name:"Mountain Climbers",  anim:"mountainClimber", sets:"3 × 30s", kcal:40, muscle:"Core", tip:"Maintain plank. Drives core and hits upper body too." },
    ],
    coolDown: [
      { id:"cd1", name:"Cat-Cow Stretch",     anim:"catCow",           sets:"2 min", kcal:6, tip:"Move with breath. Cow on inhale, cat on exhale. Spine loves this." },
      { id:"cd2", name:"Child's Pose",        anim:"childPose",        sets:"90s", kcal:5, tip:"Decompresses lumbar spine after all that pulling work." },
      { id:"cd3", name:"Shoulder Stretch",    anim:"shoulderStretch",  sets:"30s each", kcal:3, tip:"Cross-body pull. Targets rear delts which get tight after rows." },
      { id:"cd4", name:"Spinal Twist",        anim:"spinalTwist",      sets:"30s each", kcal:3, tip:"Releases rotational tension in the thoracic spine." },
      { id:"cd5", name:"Deep Breath",         anim:"deepBreath",       sets:"5 breaths", kcal:2, tip:"Calms nervous system. Recovery begins here." },
    ],
  },
  {
    day:3, name:"Recover", emoji:"🧘", label:"Active Recovery",
    color:T.green, focus:"Steady State Fat Loss", phase:"follicular", stepGoal: 15000,
    tip:"Recovery is where the gains happen. Light movement and deep stretching today.",
    warmUp: [
      { id:"wu1", name:"Arm Circles",  anim:"armCircles",  sets:"60s", kcal:5, tip:"Gentle circles to get joints moving. No intensity needed today." },
      { id:"wu2", name:"Hip Circles",  anim:"hipCircles",  sets:"45s", kcal:4, tip:"Loosen up the hips — they got worked the last two days." },
    ],
    main: [
      { id:"m1", name:"Incline Walk",      anim:"inclineWalk",    sets:"30 min", kcal:180, muscle:"Full Body", tip:"12–15% incline. 3.5–4 mph. Hands off rails! Fat burn, low impact." },
      { id:"m2", name:"Plank Hold",        anim:"plank",          sets:"3 × 45s", kcal:15, muscle:"Core",     tip:"Squeeze everything. No hip sag. Breathe steadily." },
      { id:"m3", name:"Russian Twist",     anim:"russianTwist",   sets:"3 × 20", kcal:25, muscle:"Obliques",  tip:"Hold weight. Lean 45°. Rotate fully each side." },
      { id:"m4", name:"Mountain Climbers", anim:"mountainClimber", sets:"3 × 30s", kcal:35, muscle:"Core",    tip:"Keep hips level. Drive knees fast to chest." },
    ],
    coolDown: [
      { id:"cd1", name:"Pigeon Pose",       anim:"pigeonPose",       sets:"90s each", kcal:5, tip:"Your hips need this after incline walking. Stay here longer if needed." },
      { id:"cd2", name:"Cat-Cow",           anim:"catCow",           sets:"2 min", kcal:5, tip:"Counteracts all that forward lean from incline walking." },
      { id:"cd3", name:"Hamstring Stretch", anim:"hamstringStretch", sets:"60s each", kcal:4, tip:"Hamstrings tighten from walking. Essential stretch." },
      { id:"cd4", name:"Child's Pose",      anim:"childPose",        sets:"90s", kcal:4, tip:"Full body release. Breathe into lower back. Stay as long as you like." },
      { id:"cd5", name:"Spinal Twist",      anim:"spinalTwist",      sets:"45s each", kcal:3, tip:"Wrings out tension from the spine. Great digestive benefit too." },
    ],
  },
  {
    day:4, name:"Shoulders", emoji:"🔺", label:"Shoulders & Arms",
    color:T.amber, focus:"Explosive Fat Loss", phase:"follicular", stepGoal: 12000,
    tip:"Energy building toward ovulation. Great day for shoulder press PRs!",
    warmUp: [
      { id:"wu1", name:"Arm Circles",   anim:"armCircles",   sets:"60s each", kcal:7, tip:"Full range — essential warm-up before overhead pressing." },
      { id:"wu2", name:"Jumping Jacks", anim:"jumpingJacks", sets:"2 min", kcal:20, tip:"Full body warm, then focus shifts to upper body." },
      { id:"wu3", name:"Hip Circles",   anim:"hipCircles",   sets:"30s", kcal:4, tip:"Lower body stays active even on arm days." },
    ],
    main: [
      { id:"m1", name:"Shoulder Press",  anim:"shoulderPress", sets:"3 × 12", kcal:55, muscle:"Shoulders",      tip:"Press overhead. Full extension. Core tight throughout." },
      { id:"m2", name:"Lateral Raises",  anim:"lateralRaise",  sets:"3 × 15", kcal:35, muscle:"Side Delts",    tip:"Lead with elbows. Slight forward lean. Control descent." },
      { id:"m3", name:"Bicep Curl",      anim:"bicepCurl",     sets:"3 × 15", kcal:30, muscle:"Biceps",         tip:"Supinate at top. 3-sec slow eccentric. Don't swing." },
      { id:"m4", name:"Lat Pulldown",    anim:"latPulldown",   sets:"3 × 12", kcal:55, muscle:"Back",           tip:"Back balances shoulder pressing. Never skip it." },
      { id:"m5", name:"Jump Rope HIIT",  anim:"jumpRope",      sets:"10 min", kcal:120, muscle:"Full Body",     tip:"45s on / 15s off. Stay on toes. Wrists do the turning." },
    ],
    coolDown: [
      { id:"cd1", name:"Shoulder Stretch",  anim:"shoulderStretch",  sets:"45s each", kcal:4, tip:"Cross-body arm pull. Rear delts need this after pressing." },
      { id:"cd2", name:"Spinal Twist",      anim:"spinalTwist",      sets:"30s each", kcal:3, tip:"Decompress after all the pushing and pulling." },
      { id:"cd3", name:"Hamstring Stretch", anim:"hamstringStretch", sets:"45s", kcal:3, tip:"Jump rope tightens calves and hamstrings — stretch them out." },
      { id:"cd4", name:"Child's Pose",      anim:"childPose",        sets:"60s", kcal:3, tip:"Full reset. Spine lengthens, shoulders release." },
      { id:"cd5", name:"Deep Breath",       anim:"deepBreath",       sets:"5 breaths", kcal:2, tip:"Activates parasympathetic nervous system. Your recovery starts now." },
    ],
  },
  {
    day:5, name:"Core", emoji:"⚡", label:"Core & HIIT",
    color:T.violet, focus:"High Calorie Fat Burn", phase:"ovulation", stepGoal: 13000,
    tip:"Ovulation — PEAK power! Your best HIIT session of the month. Crush it.",
    warmUp: [
      { id:"wu1", name:"High Knees",    anim:"highKnees",    sets:"2 min", kcal:28, tip:"Get heart rate up fast. Full drive — arms pump hard." },
      { id:"wu2", name:"Jumping Jacks", anim:"jumpingJacks", sets:"90s", kcal:18, tip:"Transition from high knees. Keep the HR elevated." },
      { id:"wu3", name:"Hip Circles",   anim:"hipCircles",   sets:"30s", kcal:5, tip:"Core exercises need mobile hips. This does it fast." },
    ],
    main: [
      { id:"m1", name:"Plank Hold",         anim:"plank",          sets:"3 × 45s", kcal:15, muscle:"Core",     tip:"Squeeze abs, glutes, quads — all at once. No holding breath." },
      { id:"m2", name:"Russian Twist",      anim:"russianTwist",   sets:"3 × 20", kcal:25, muscle:"Obliques",  tip:"Add weight. Lean 45°. Waist definition lives here." },
      { id:"m3", name:"Mountain Climbers",  anim:"mountainClimber", sets:"4 × 30s", kcal:40, muscle:"Core",   tip:"Fast tempo. Cardio AND core. Keep plank locked." },
      { id:"m4", name:"Burpees",            anim:"burpee",         sets:"4 × 10", kcal:80, muscle:"Full Body",  tip:"Best fat burner. Squat → plank → push-up → jump." },
      { id:"m5", name:"Kettlebell Swings",  anim:"kbSwing",        sets:"4 × 20", kcal:90, muscle:"Glutes, Core", tip:"Hip drive! KB feels weightless at top when done right." },
    ],
    coolDown: [
      { id:"cd1", name:"Cat-Cow Stretch",   anim:"catCow",           sets:"2 min", kcal:6, tip:"After HIIT, spine needs decompression. Breathe into every rep." },
      { id:"cd2", name:"Child's Pose",      anim:"childPose",        sets:"90s", kcal:5, tip:"Full reset after burpees and swings. Take your time here." },
      { id:"cd3", name:"Pigeon Pose",       anim:"pigeonPose",       sets:"90s each", kcal:5, tip:"Hip flexors and glutes get tight from HIIT. Hold it." },
      { id:"cd4", name:"Spinal Twist",      anim:"spinalTwist",      sets:"30s each", kcal:3, tip:"Wrings out lactic acid from the core and lower back." },
      { id:"cd5", name:"Deep Breath",       anim:"deepBreath",       sets:"5 breaths", kcal:2, tip:"Slow inhale–hold–exhale. Brings cortisol down after HIIT." },
    ],
  },
  {
    day:6, name:"Full Body", emoji:"🔥", label:"Full Body Burn",
    color:"#fb7185", focus:"Maximal Fat Loss", phase:"ovulation", stepGoal: 10000,
    tip:"Peak power day! Compound moves = max calorie burn. Leave it all there.",
    warmUp: [
      { id:"wu1", name:"High Knees",    anim:"highKnees",    sets:"2 min", kcal:28, tip:"Max drive. Full body is about to get taxed — prime it right." },
      { id:"wu2", name:"Arm Circles",   anim:"armCircles",   sets:"45s each", kcal:6, tip:"Shoulders will be involved in every exercise today." },
      { id:"wu3", name:"Jumping Jacks", anim:"jumpingJacks", sets:"90s", kcal:18, tip:"Gets every joint warm and every muscle group primed." },
    ],
    main: [
      { id:"m1", name:"Dumbbell Deadlift",  anim:"rdl",          sets:"4 × 12", kcal:80, muscle:"Hamstrings, Back", tip:"Full hinge. Hips drive standing. Biggest calorie burn." },
      { id:"m2", name:"Squat",             anim:"squat",         sets:"4 × 15", kcal:75, muscle:"Quads, Glutes",    tip:"Heels down. Deep as possible. Drive up explosively." },
      { id:"m3", name:"Reverse Lunges",    anim:"lunge",         sets:"3 × 12e", kcal:55, muscle:"Glutes, Quads",  tip:"Full step. Front knee tracks over toes. Control it." },
      { id:"m4", name:"Kettlebell Swings", anim:"kbSwing",       sets:"4 × 20", kcal:90, muscle:"Glutes, Core",    tip:"Explosive! Hip snap sends KB up. Core stays tight." },
      { id:"m5", name:"Push-Ups",          anim:"pushup",        sets:"3 × 15", kcal:40, muscle:"Chest, Core",     tip:"Wide hands. Chest to floor. Explosive press up." },
      { id:"m6", name:"Burpees",           anim:"burpee",        sets:"3 × 10", kcal:80, muscle:"Full Body",       tip:"Last exercise. Everything you have left — pour it in." },
    ],
    coolDown: [
      { id:"cd1", name:"Hamstring Stretch", anim:"hamstringStretch", sets:"60s each", kcal:5, tip:"Hamstrings worked hard from deadlifts and squats. Honour them." },
      { id:"cd2", name:"Pigeon Pose",       anim:"pigeonPose",       sets:"90s each", kcal:5, tip:"Hip flexors and glutes fire in every compound. This is non-negotiable." },
      { id:"cd3", name:"Cat-Cow Stretch",   anim:"catCow",           sets:"2 min", kcal:6, tip:"Lower back decompression after heavy lifting. Go slow." },
      { id:"cd4", name:"Child's Pose",      anim:"childPose",        sets:"90s", kcal:4, tip:"Full body release. You earned this. Breathe into every tight spot." },
      { id:"cd5", name:"Deep Breath",       anim:"deepBreath",       sets:"5 breaths", kcal:2, tip:"Recovery begins with the breath. Inhale 4, hold 4, exhale 6." },
    ],
  },
];

/* ── Small helpers ─────────────────────────────────────────────────────── */
const LiveDot = ({T}) => (
  <span style={{ position:"relative", display:"inline-block", width:8, height:8, marginRight:6 }}>
    <span style={{ position:"absolute", inset:0, borderRadius:"50%", background:T.green, animation:"ping 2s ease infinite", opacity:.55 }} />
    <span style={{ position:"absolute", inset:0, borderRadius:"50%", background:T.green }} />
  </span>
);

const Ring = ({ T, pct, size=92, stroke=7, color, val, unit }) => {
  const r=(size-stroke)/2, circ=2*Math.PI*r;
  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)}
          style={{ transition:"stroke-dashoffset 1s ease" }} />
      </svg>
      <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center" }}>
        <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:"0.88rem", color, lineHeight:1 }}>{val}</div>
        <div style={{ fontSize:"0.48rem", color:T.muted, textTransform:"uppercase", letterSpacing:"0.05em", marginTop:1 }}>{unit}</div>
      </div>
    </div>
  );
};

const Sparks = ({ T, vals, color, goal }) => {
  const mx = Math.max(...vals, goal||0);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:2, height:40 }}>
      {vals.map((v,i) => (
        <div key={i} title={v.toLocaleString()} style={{
          flex:1, height:Math.max(2,(v/mx)*40), borderRadius:"2px 2px 0 0",
          background: i===vals.length-1?color:goal&&v>=goal?T.teal:T.border,
          transition:"height 0.4s",
        }} />
      ))}
    </div>
  );
};

/* ── Exercise modal ────────────────────────────────────────────────────── */
const ExModal = ({ T, ex, color, onClose, onDone, isDone }) => (
  <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)",
    zIndex:2000, display:"flex", alignItems:"center", justifyContent:"center", padding:16,
    backdropFilter:"blur(14px)" }}>
    <div onClick={e=>e.stopPropagation()} style={{
      background:T.card, border:`1px solid ${color}55`, borderRadius:24,
      width:"100%", maxWidth:400, overflow:"hidden",
      boxShadow:`0 0 80px ${color}20`,
    }}>
      <div style={{ background:`radial-gradient(circle at 50% 30%, transparent 0%, #000 120%), linear-gradient(to bottom, ${color}30, ${color}15 100%), url('./gym.png') center/cover`, position:"relative" }}>
        <Figure3D animKey={ex.anim} color={color} height={250} />
        <button onClick={onClose} style={{ position:"absolute", top:12, right:12,
          background:"rgba(0,0,0,0.55)", border:`1px solid ${T.border}`,
          borderRadius:"50%", width:34, height:34, cursor:"pointer", color:T.muted,
          fontSize:"1rem", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:1,
          background:`linear-gradient(90deg,transparent,${color},transparent)` }} />
      </div>
      <div style={{ padding:"18px 22px 22px" }}>
        <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:"1.1rem", marginBottom:8 }}>{ex.name}</div>
        <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
          {ex.muscle && <span style={{ fontSize:"0.67rem", padding:"3px 9px", borderRadius:100, background:`${color}20`, color, fontWeight:700 }}>{ex.muscle}</span>}
          <span style={{ fontSize:"0.67rem", padding:"3px 9px", borderRadius:100, background:"rgba(255,184,77,0.15)", color:T.amber, fontWeight:700 }}>🔥 ~{ex.kcal} kcal</span>
          <span style={{ fontSize:"0.67rem", padding:"3px 9px", borderRadius:100, background:"rgba(255,255,255,0.05)", color:T.muted, fontWeight:600 }}>{ex.sets}</span>
        </div>
        <div style={{ background:`${color}0c`, border:`1px solid ${color}1f`,
          borderRadius:12, padding:"12px 14px", marginBottom:16, lineHeight:1.6,
          fontSize:"0.78rem", color:"rgba(240,238,255,0.8)" }}>💡 {ex.tip}</div>
        <button onClick={onDone} style={{ width:"100%", padding:"12px", borderRadius:14, border:"none",
          cursor:"pointer", fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:"0.92rem",
          background: isDone ? "rgba(79,255,176,0.1)" : `linear-gradient(135deg,${color},${color}aa)`,
          color: isDone ? T.green : "#fff",
          boxShadow: isDone ? "none" : `0 6px 22px ${color}40`, transition:"all 0.2s" }}>
          {isDone ? "✓ Done — Tap to Undo" : "Mark Complete ✓"}
        </button>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════════════════════ */
export default function App() {
  const [charType,   setCharType]  = useState("female");   // female | male
  const [themeIdx,   setThemeIdx]  = useState(0);
  const T = THEMES[themeIdx];
  const MUSCLE_GROUPS = getMuscleGroups(T);
  const [tab,        setTab]       = useState("dashboard");   // dashboard | plan | cycle
  const [dayIdx,     setDayIdx]    = useState(0);
  const [section,    setSection]   = useState("warmUp");      // warmUp | main | coolDown
  const [done,       setDone]      = useState({});
  const [modal,      setModal]     = useState(null);
  const [syncTime,   setSyncTime]  = useState(new Date());
  const [health,     setHealth]    = useState({
    steps: 5943, kcal: 210, rhr: 70, exMin: 22, weight: 63.5,
    kcalGoal: 500,
  });

  // Live 30-s poll simulation (replaces live health_query)
  useEffect(() => {
    const id = setInterval(() => {
      setHealth(p => ({
        ...p,
        steps: p.steps + Math.floor(Math.random()*55+8),
        kcal:  p.kcal  + Math.floor(Math.random()*7+1),
      }));
      setSyncTime(new Date());
    }, 30000);
    return () => clearInterval(id);
  }, [charType]);

  const day = MUSCLE_GROUPS[dayIdx];
  const stepPct  = Math.min(100, Math.round((health.steps / day.stepGoal) * 100));
  const kcalPct  = Math.min(100, Math.round((health.kcal  / health.kcalGoal) * 100));

  // Current section exercises
  const sectionExs = day[section] || [];
  const allExs      = [...day.warmUp, ...day.main, ...day.coolDown];
  const totalDone   = allExs.filter(e => done[`${dayIdx}-${e.id}`]).length;
  const totalKcal   = allExs.reduce((a,e)=>a+e.kcal,0);
  const burnedKcal  = allExs.filter(e=>done[`${dayIdx}-${e.id}`]).reduce((a,e)=>a+e.kcal,0);
  const totalPct    = Math.round((totalDone/allExs.length)*100);

  const modalEx     = modal ? sectionExs.find(e=>e.id===modal) : null;
  const toggleDone  = (id) => setDone(p=>({...p,[`${dayIdx}-${id}`]:!p[`${dayIdx}-${id}`]}));

  const SECTION_META = {
    warmUp:   { label:"🔥 Warm-Up",    color:T.amber,  desc:"Raises core temp, primes joints. Never skip." },
    main:     { label:"💪 Main Work",  color:day.color, desc:"Today's focused training block." },
    coolDown: { label:"🧘 Cool-Down",  color:T.teal,   desc:"Reduces injury risk & speeds recovery." },
  };

  return (
    <div style={{ minHeight:"100vh", background:T.bg }}>
      <style>{getGlobalCSS(T)}</style>

      {/* Ambient blobs */}
      <div style={{ position:"fixed", top:"-25%", left:"-15%", width:"55%", height:"65%",
        background:`radial-gradient(ellipse,${day.color}0e 0%,transparent 70%)`, pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", bottom:"-20%", right:"-10%", width:"50%", height:"60%",
        background:`radial-gradient(ellipse,${T.teal}09 0%,transparent 70%)`, pointerEvents:"none", zIndex:0 }} />

      <div style={{ maxWidth:860, margin:"0 auto", padding:"18px 14px 80px", position:"relative", zIndex:1 }}>

        {/* ═══ HEADER ═══ */}
        <div className="fu d0" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
          marginBottom:18, gap:10, flexWrap:"wrap" }}>
          <div>
            <h1 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900,
              fontSize:"clamp(1.5rem,5vw,2.1rem)", letterSpacing:"-0.04em", lineHeight:1.1 }}>
              Health <span style={{ color:day.color }}>Live</span>
            </h1>
            <p style={{ fontSize:"0.67rem", color:T.muted, marginTop:4,
              display:"flex", alignItems:"center", fontFamily:"'JetBrains Mono',monospace" }}>
              <LiveDot T={T} />Synced {syncTime.toLocaleTimeString()} · auto-refresh 30s
            </p>
          </div>
          <div style={{ display:"flex", gap:7, flexWrap:"wrap", alignItems:"center" }}>
            <div style={{ background:`${T.pink}18`, border:`1px solid ${T.pink}33`,
              borderRadius:50, padding:"5px 13px", fontSize:"0.67rem", fontWeight:700, color:T.pink }}>
              🌱 Follicular · Day 7
            </div>
            <div style={{ background:T.card, border:`1px solid ${T.border}`,
              borderRadius:50, padding:"5px 13px", fontSize:"0.67rem", color:T.muted,
              fontFamily:"'JetBrains Mono',monospace" }}>25F · 63.5 kg · 🇮🇳</div>
          </div>
        </div>

        {/* ═══ MAIN NAV ═══ */}
        <div className="fu d1" style={{ display:"flex", gap:6, marginBottom:18, flexWrap:"wrap" }}>
          {[
            ["dashboard","📊 Dashboard"],
            ["plan","📋 Workout"],
            ...(charType === "female" ? [["cycle","🌸 Cycle"]] : []),
            ["gut","🦠 Gut"],
            ["profile","👤 Profile"]
          ].map(([k,l])=>(
            <button key={k} onClick={()=>setTab(k)} style={{
              flex:"1 1 auto", minWidth:80, padding:"10px 0", borderRadius:12, border:"none", cursor:"pointer",
              fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:"0.78rem",
              background: tab===k ? day.color : T.card,
              color: tab===k ? "#fff" : T.muted,
              boxShadow: tab===k ? `0 4px 18px ${day.color}44` : "none",
              transition:"all 0.2s",
            }}>{l}</button>
          ))}
        </div>

        {/* ════════════════ DASHBOARD TAB ════════════════ */}
        {tab === "dashboard" && (
          <>
            {/* Hero Feature Card */}
            <div className="fu d2" style={{
              position:"relative", height:240, borderRadius:24, overflow:"hidden", marginBottom:18,
              background:`linear-gradient(to right, ${T.card} 50%, transparent 100%)`,
              border:`1px solid ${day.color}33`, boxShadow:`0 10px 40px -10px ${day.color}30`
            }}>
              <img src={`./hero_${charType}.png`} style={{
                position:"absolute", right:"-10%", top:"-10%", height:"120%", width:"auto", 
                objectFit:"contain", filter:"drop-shadow(0 0 30px rgba(0,0,0,0.5))"
              }} />
              <div style={{ position:"absolute", inset:0, background:`linear-gradient(90deg, ${T.card} 30%, transparent 100%)`, zIndex:1 }} />
              <div style={{ position:"relative", zIndex:2, padding:"30px 24px", height:"100%", display:"flex", flexDirection:"column", justifyContent:"center", maxWidth:"60%" }}>
                <div style={{ background:`${day.color}22`, color:day.color, fontSize:"0.65rem", fontWeight:900,
                  padding:"4px 10px", borderRadius:50, width:"fit-content", marginBottom:10, textTransform:"uppercase" }}>
                  Active {charType === "female" ? "Follicular" : "Performance"} Phase
                </div>
                <h2 style={{ fontSize:"1.6rem", fontWeight:900, lineHeight:1.1, marginBottom:10 }}>Finish Today's {day.name} Goal</h2>
                <div style={{ fontSize:"0.8rem", color:T.muted, marginBottom:20, lineHeight:1.5 }}>
                  {charType === "female" ? "Estrogen is peaking. Your body is primed for maximum fat loss and strength gains." : "Testosterone and energy levels are optimal. Focus on explosive compound movements today."}
                </div>
                <button onClick={()=>setTab("plan")} style={{
                  background:day.color, color:"#fff", border:"none", padding:"10px 22px", borderRadius:12,
                  fontWeight:800, fontSize:"0.85rem", cursor:"pointer", width:"fit-content",
                  boxShadow:`0 8px 15px ${day.color}44`
                }}>Start Session →</button>
              </div>
            </div>

            {/* Top stat rings */}
            <div className="fu d2" style={{ background:T.card, border:`1px solid ${T.border}`,
              borderRadius:20, padding:"20px", marginBottom:14 }}>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:"0.85rem",
                color:T.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:16 }}>
                Today's Metrics
              </div>
              <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
                <Ring T={T} pct={stepPct} color={T.amber} val={health.steps.toLocaleString()} unit="Steps" />
                <Ring T={T} pct={kcalPct} color={T.pink}  val={health.kcal} unit="Active kcal" />
                <Ring T={T} pct={Math.min(100,Math.round((health.exMin/60)*100))} color={T.violet} val={`${health.exMin}m`} unit="Exercise" />
                <Ring T={T} pct={68}      color={T.red}    val={health.rhr} unit="Resting HR" />
                <Ring T={T} pct={74}      color={T.teal}   val={`${(health.steps*0.000762).toFixed(1)}km`} unit="Distance" />
              </div>
            </div>

            {/* Progress bars */}
            <div className="fu d2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
              {[
                { label:"Steps to Goal", val:`${Math.max(0,day.stepGoal-health.steps).toLocaleString()} left`, pct:stepPct, color:T.amber },
                { label:"Calorie Goal",  val:`${health.kcal} / ${health.kcalGoal} kcal`,                          pct:kcalPct, color:T.pink },
              ].map(m=>(
                <div key={m.label} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"14px 16px" }}>
                  <div style={{ fontSize:"0.65rem", color:T.muted, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:8 }}>{m.label}</div>
                  <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:"1rem", color:m.color, marginBottom:8 }}>{m.val}</div>
                  <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:100, height:6, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${m.pct}%`, background:m.color, borderRadius:100, transition:"width 1s ease" }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Step history */}
            <div className="fu d3" style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:20, padding:"18px 18px 14px", marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:"0.88rem" }}>👣 30-Day Steps</div>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.66rem", color:T.muted }}>
                  avg {Math.round(REAL.stepHistory.reduce((a,b)=>a+b)/REAL.stepHistory.length).toLocaleString()} · dynamic goal
                </div>
              </div>
              <Sparks T={T} vals={REAL.stepHistory} color={T.amber} goal={day.stepGoal} />
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:5, fontSize:"0.55rem", color:T.muted }}>
                <span>Mar 14</span><span style={{ color:T.amber, fontWeight:700 }}>Today ▲</span>
              </div>
            </div>

            {/* Calorie + HR history */}
            <div className="fu d3" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
              <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"16px" }}>
                <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:"0.82rem", marginBottom:10 }}>🔥 Active kcal</div>
                <Sparks T={T} vals={REAL.kcalHistory} color={T.pink} goal={500} />
                <div style={{ fontSize:"0.58rem", color:T.muted, marginTop:4 }}>best {Math.max(...REAL.kcalHistory)} kcal</div>
              </div>
              <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"16px" }}>
                <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:"0.82rem", marginBottom:10 }}>❤️ Resting HR</div>
                <Sparks T={T} vals={REAL.rhrHistory.map(v=>v||0)} color={T.red} />
                <div style={{ fontSize:"0.58rem", color:T.muted, marginTop:4 }}>avg {Math.round(REAL.rhrHistory.filter(Boolean).reduce((a,b)=>a+b)/REAL.rhrHistory.filter(Boolean).length)} bpm</div>
              </div>
            </div>

            {/* Key stats */}
            <div className="fu d4" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:12 }}>
              {[
                { icon:"⚖️", label:"Weight",       val:"63.5 kg",    sub:"Target: 55 kg",     color:T.teal   },
                { icon:"🎯", label:"BMR",           val:"~1,450 kcal",sub:"25F · 63.5 kg",     color:T.violet },
                { icon:"📏", label:"Avg Distance",  val:"4.55 km",    sub:"30-day avg/day",    color:T.blue   },
                { icon:"🏆", label:"Best Day",      val:"17,556",     sub:"steps on Apr 11",   color:T.green  },
              ].map(m=>(
                <div key={m.label} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"14px 16px" }}>
                  <div style={{ fontSize:"1rem", marginBottom:7 }}>{m.icon}</div>
                  <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:"1.25rem", color:m.color }}>{m.val}</div>
                  <div style={{ fontSize:"0.62rem", color:T.muted, textTransform:"uppercase", letterSpacing:"0.05em", marginTop:3 }}>{m.label}</div>
                  <div style={{ fontSize:"0.62rem", color:"rgba(240,238,255,0.28)", marginTop:3 }}>{m.sub}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ════════════════ WORKOUT TAB ════════════════ */}
        {tab === "plan" && (
          <>
            {/* Day strip */}
            <div className="fu d2" style={{ display:"flex", gap:6, marginBottom:16, overflowX:"auto", paddingBottom:4 }}>
              {MUSCLE_GROUPS.map((d,i)=>(
                <button key={i} onClick={()=>{ setDayIdx(i); setSection("warmUp"); }}
                  style={{ flexShrink:0, minWidth:70, padding:"9px 8px", borderRadius:14,
                    border:`1px solid ${dayIdx===i?d.color:T.border}`,
                    background: dayIdx===i?`${d.color}18`:T.card,
                    color: dayIdx===i?d.color:T.muted, cursor:"pointer",
                    fontFamily:"'Outfit',sans-serif", fontWeight:700,
                    boxShadow: dayIdx===i?`0 4px 14px ${d.color}30`:"none",
                    transition:"all 0.2s", textAlign:"center" }}>
                  <div style={{ fontSize:"1.1rem", marginBottom:2 }}>{d.emoji}</div>
                  <div style={{ fontSize:"0.57rem", textTransform:"uppercase", letterSpacing:"0.04em" }}>
                    {d.name}
                  </div>
                </button>
              ))}
            </div>

            {/* Day info */}
            <div className="fu d2" style={{ background:T.card, border:`1px solid ${day.color}33`,
              borderRadius:20, padding:"16px 18px", marginBottom:14, borderLeft:`4px solid ${day.color}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
                <div>
                  <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:"1.05rem", color:day.color }}>
                    {day.emoji} {day.label}
                  </div>
                  <div style={{ fontSize:"0.68rem", color:T.muted, marginTop:2 }}>
                    {day.focus} · {allExs.length} total exercises
                  </div>
                  <div style={{ fontSize:"0.73rem", color:"rgba(240,238,255,0.5)", marginTop:6, lineHeight:1.55, maxWidth:370 }}>{day.tip}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:"1.5rem", color:day.color }}>
                    {totalDone}/{allExs.length}
                  </div>
                  <div style={{ fontSize:"0.58rem", color:T.muted, textTransform:"uppercase" }}>done</div>
                  <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.68rem", color:T.amber, marginTop:4 }}>
                    🔥 {burnedKcal}/{totalKcal} kcal
                  </div>
                </div>
              </div>
              <div style={{ marginTop:12, background:"rgba(255,255,255,0.04)", borderRadius:100, height:5, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${totalPct}%`,
                  background:`linear-gradient(90deg,${day.color},${T.teal})`, borderRadius:100, transition:"width 0.5s" }} />
              </div>
            </div>

            {/* Section selector */}
            <div className="fu d2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:16 }}>
              {Object.entries(SECTION_META).map(([k,m])=>(
                <button key={k} onClick={()=>setSection(k)} style={{
                  padding:"10px 6px", borderRadius:14, border:`1px solid ${section===k?m.color:T.border}`,
                  background: section===k?`${m.color}18`:T.card,
                  color: section===k?m.color:T.muted, cursor:"pointer",
                  fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:"0.72rem",
                  textAlign:"center", transition:"all 0.2s",
                  boxShadow: section===k?`0 4px 14px ${m.color}28`:"none",
                }}>
                  <div>{m.label}</div>
                  <div style={{ fontSize:"0.58rem", color:section===k?m.color:T.muted, marginTop:3, fontWeight:500 }}>
                    {day[k].length} exercises
                  </div>
                </button>
              ))}
            </div>

            {/* Section description */}
            <div className="fu d2" style={{
              background:`${SECTION_META[section].color}0c`,
              border:`1px solid ${SECTION_META[section].color}22`,
              borderRadius:12, padding:"10px 14px", marginBottom:14,
              fontSize:"0.75rem", color:SECTION_META[section].color, lineHeight:1.5,
            }}>
              {SECTION_META[section].desc}
            </div>

            {/* Exercise list */}
            <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
              {sectionExs.map((ex,i)=>{
                const key=`${dayIdx}-${ex.id}`;
                const isDone=done[key];
                const secColor=SECTION_META[section].color;
                return (
                  <div key={ex.id} className="fu" style={{ animationDelay:`${i*0.04}s` }}>
                    <div onClick={()=>setModal(ex.id)}
                      style={{ background:T.card, border:`1px solid ${isDone?T.green+"30":T.border}`,
                        borderRadius:16, padding:"13px 14px", display:"flex", alignItems:"center",
                        gap:13, cursor:"pointer", opacity:isDone?0.5:1, transition:"all 0.18s" }}
                      onMouseEnter={e=>{ e.currentTarget.style.transform="translateX(5px)"; e.currentTarget.style.borderColor=isDone?T.green+"44":`${secColor}44`; }}
                      onMouseLeave={e=>{ e.currentTarget.style.transform=""; e.currentTarget.style.borderColor=isDone?T.green+"30":T.border; }}
                    >
                      {/* Mini 3D */}
                      <div style={{ width:70, height:70, flexShrink:0, borderRadius:12,
                        background:`linear-gradient(to bottom, ${secColor}40, ${secColor}30), url('./gym.png') center/cover`, overflow:"hidden" }}>
                        <Figure3D animKey={ex.anim} color={isDone?T.green:secColor} height={70} charType={charType} />
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:"0.86rem",
                          textDecoration:isDone?"line-through":"none", marginBottom:3 }}>{ex.name}</div>
                        <div style={{ fontSize:"0.67rem", color:T.muted, marginBottom:5 }}>
                          {ex.sets}{ex.muscle?` · ${ex.muscle}`:""}
                        </div>
                        <div style={{ display:"flex", gap:5 }}>
                          <span style={{ fontSize:"0.59rem", padding:"2px 7px", borderRadius:100,
                            background:`${secColor}14`, color:secColor, fontWeight:700 }}>
                            {section==="warmUp"?"Warm-Up":section==="coolDown"?"Cool-Down":ex.muscle?.split(",")[0]||"Exercise"}
                          </span>
                          <span style={{ fontSize:"0.59rem", padding:"2px 7px", borderRadius:100,
                            background:"rgba(255,184,77,0.12)", color:T.amber, fontWeight:700 }}>
                            🔥 {ex.kcal} kcal
                          </span>
                        </div>
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5, flexShrink:0 }}>
                        <div style={{ width:30, height:30, borderRadius:9,
                          background: isDone?"rgba(79,255,176,0.1)":`${secColor}18`,
                          color: isDone?T.green:secColor,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontWeight:700, fontSize:"0.72rem" }}>
                          {isDone?"✓":i+1}
                        </div>
                        <div style={{ fontSize:"0.54rem", color:T.muted }}>tap</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ════════════════ CYCLE TAB ════════════════ */}
        {tab === "cycle" && (
          <>
            <div className="fu d2" style={{ background:T.card, border:`1px solid ${T.pink}33`,
              borderRadius:20, padding:"18px 20px", marginBottom:14, borderLeft:`4px solid ${T.pink}` }}>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:"0.95rem", color:T.pink, marginBottom:7 }}>
                🌸 Currently: Follicular Phase · Day 7 of 28
              </div>
              <div style={{ fontSize:"0.77rem", color:"rgba(240,238,255,0.58)", lineHeight:1.65 }}>
                Estrogen rising — BEST window for heavy lifting, HIIT, and intense cardio.
                Recovery is fastest and fat oxidation peaks. Make the most of days 6–13!
              </div>
            </div>

            {/* 28-day strip */}
            <div className="fu d2" style={{ background:T.card, border:`1px solid ${T.border}`,
              borderRadius:20, padding:"18px 18px 16px", marginBottom:14 }}>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:"0.86rem", marginBottom:13 }}>28-Day Cycle Map</div>
              <div style={{ display:"flex", gap:3 }}>
                {Array.from({length:28},(_,i)=>i+1).map(d=>{
                  const c=d<=5?T.pink:d<=13?T.teal:d<=16?T.amber:T.violet;
                  const now=d===7;
                  return (
                    <div key={d} title={`Day ${d}`} style={{
                      flex:1, height:30, borderRadius:5, background:`${c}22`,
                      border:`2px solid ${now?c:"transparent"}`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:"0.46rem", color:c, fontWeight:700,
                      transform:now?"scaleY(1.3)":"scaleY(1)",
                      boxShadow:now?`0 0 12px ${c}99`:"none",
                      transition:"transform 0.2s", cursor:"default",
                    }}>{now?"▲":""}</div>
                  );
                })}
              </div>
              <div style={{ display:"flex", gap:14, marginTop:11, flexWrap:"wrap" }}>
                {[[T.pink,"🌑","Menstrual","1–5"],[T.teal,"🌱","Follicular","6–13 ← Now"],[T.amber,"☀️","Ovulation","14–16"],[T.violet,"🌙","Luteal","17–28"]].map(([c,ico,n,d])=>(
                  <div key={n} style={{ display:"flex", alignItems:"center", gap:5, fontSize:"0.65rem" }}>
                    <div style={{ width:8, height:8, borderRadius:2, background:c }} />
                    <span style={{ color:n.includes("Follicular")?c:T.muted, fontWeight:n.includes("Follicular")?700:400 }}>{ico} {n} <span style={{ opacity:0.38 }}>({d})</span></span>
                  </div>
                ))}
              </div>
            </div>

            {/* Phase cards */}
            {[
              { c:T.pink,   ico:"🌑", n:"Menstrual",  d:"1–5",   note:"Rest is medicine. Gentle walks, yoga, stretching only. Body is recovering.",     ex:["Yoga","Short walks","Stretching","Breathing"] },
              { c:T.teal,   ico:"🌱", n:"Follicular", d:"6–13",  note:"Push hard here. Heavy lifts, HIIT, long cardio. Fastest recovery of the month.", ex:["Heavy lifting","HIIT","Chest/Back","Long runs"] },
              { c:T.amber,  ico:"☀️", n:"Ovulation",  d:"14–16", note:"Peak power output. Absolute hardest workouts. Full body compound movements.",     ex:["Max effort","Full body","Plyometrics","Sprints"] },
              { c:T.violet, ico:"🌙", n:"Luteal",     d:"17–28", note:"Energy dips. Swap HIIT for steady-state. Weights ok but go lighter.",             ex:["Incline walks","Yoga","Light weights","Swimming"] },
            ].map(p=>(
              <div key={p.n} className="fu d3" style={{ background:T.card, border:`1px solid ${p.c}22`,
                borderRadius:16, padding:"15px 18px", marginBottom:10, borderLeft:`3px solid ${p.c}` }}>
                <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, color:p.c, fontSize:"0.86rem", marginBottom:5 }}>
                  {p.ico} {p.n} <span style={{ opacity:0.45, fontWeight:500 }}>· Days {p.d}</span>
                </div>
                <div style={{ fontSize:"0.73rem", color:"rgba(240,238,255,0.5)", lineHeight:1.55, marginBottom:9 }}>{p.note}</div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {p.ex.map(w=>(
                    <span key={w} style={{ fontSize:"0.6rem", padding:"2px 9px", borderRadius:100,
                      background:`${p.c}14`, color:p.c, fontWeight:700 }}>{w}</span>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {/* ════════════════ GUT RESET TAB ════════════════ */}
        {tab === "gut" && (
          <>
            <div className="fu d2" style={{ background:T.card, border:`1px solid ${T.blue}33`,
              borderRadius:20, padding:"18px 20px", marginBottom:14, borderLeft:`4px solid ${T.blue}` }}>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:"0.95rem", color:T.blue, marginBottom:7 }}>
                🦠 Gut Reset: Phase 1 (Elimination)
              </div>
              <div style={{ fontSize:"0.77rem", color:"rgba(240,238,255,0.58)", lineHeight:1.65 }}>
                Focusing on removing inflammatory triggers and restoring microbial balance. Stay hydrated and prioritize whole foods.
              </div>
            </div>

            <div className="fu d3" style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:20, padding:"18px 18px", marginBottom:14 }}>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:"0.86rem", marginBottom:13 }}>Daily Protocol Checklist</div>
              {[
                "Morning Probiotic (Empty Stomach)",
                "Bone Broth / L-Glutamine",
                "Hit 25g Fiber Target",
                "No Processed Sugars",
                "Post-Meal Digestive Walk (10m)",
              ].map((item, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
                  <input type="checkbox" style={{ width:18, height:18, accentColor:T.blue }} />
                  <div style={{ fontSize:"0.78rem" }}>{item}</div>
                </div>
              ))}
            </div>

            <div className="fu d4" style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:20, padding:"18px 18px", marginBottom:14 }}>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:"0.86rem", marginBottom:13 }}>Symptoms Tracker</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", gap:10 }}>
                {[
                  { lbl:"Bloating", color:T.amber },
                  { lbl:"Energy Crash", color:T.red },
                  { lbl:"Good Digestion", color:T.green },
                  { lbl:"Brain Fog", color:T.violet }
                ].map(s=>(
                  <button key={s.lbl} style={{ background:`${s.color}11`, border:`1px solid ${s.color}33`, borderRadius:12, padding:"12px", color:s.color, fontWeight:600, fontSize:"0.72rem", cursor:"pointer" }}>
                    + {s.lbl}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ════════════════ PROFILE TAB ════════════════ */}
        {tab === "profile" && (
          <>
            <div className="fu d2" style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:20, padding:"20px", marginBottom:14, textAlign:"center" }}>
              <div style={{ width:80, height:80, margin:"0 auto", borderRadius:"50%", background:`linear-gradient(135deg, ${T.pink}, ${T.teal})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2.5rem", marginBottom:12 }}>
                👤
              </div>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:"1.2rem" }}>Profile Settings</div>
              <div style={{ fontSize:"0.75rem", color:T.muted, marginTop:4 }}>Premium Access</div>
            </div>

            <div className="fu d3" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(100px, 1fr))", gap:12, marginBottom:14 }}>
              <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"16px", textAlign:"center" }}>
                <div style={{ fontSize:"1.4rem", color:T.teal, fontWeight:800 }}>25</div>
                <div style={{ fontSize:"0.6rem", color:T.muted, textTransform:"uppercase", marginTop:4 }}>Age</div>
              </div>
              <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"16px", textAlign:"center" }}>
                <div style={{ fontSize:"1.4rem", color:T.pink, fontWeight:800 }}>63.5</div>
                <div style={{ fontSize:"0.6rem", color:T.muted, textTransform:"uppercase", marginTop:4 }}>Weight (kg)</div>
              </div>
              <div onClick={()=>setCharType(charType==="female"?"male":"female")} style={{ background:T.card, border:`1px solid ${charType==="female"?T.pink:T.amber}`, borderRadius:16, padding:"16px", textAlign:"center", cursor:"pointer", transition:"all 0.2s" }}>
                <div style={{ fontSize:"1.4rem", color:charType==="female"?T.pink:T.amber, fontWeight:800 }}>{charType==="female"?"F":"M"}</div>
                <div style={{ fontSize:"0.6rem", color:T.muted, textTransform:"uppercase", marginTop:4 }}>Style Toggle</div>
              </div>
            </div>

            <div className="fu d4" style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:20, padding:"18px 18px", marginBottom:14 }}>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:"0.86rem", marginBottom:13 }}>Data Integrations</div>
              <div style={{ display:"flex", alignItems:"center", justifyItems:"center", justifyContent:"space-between", padding:"12px", background:`${T.red}11`, border:`1px solid ${T.red}33`, borderRadius:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:"1.2rem" }}>❤️</span>
                  <div>
                    <div style={{ fontWeight:700, fontSize:"0.8rem", color:T.red }}>Apple Health</div>
                    <div style={{ fontSize:"0.65rem", color:T.muted, marginTop:2 }}>Synced: Just now</div>
                  </div>
                </div>
                <div style={{ fontSize:"0.7rem", fontWeight:700, color:T.green }}>Connected ✓</div>
              </div>
            </div>

            <div className="fu d5" style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:20, padding:"18px 18px", marginBottom:14 }}>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:"0.86rem", marginBottom:13 }}>App Themes</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
                {THEMES.map((theme, i) => (
                  <button key={theme.id} onClick={() => setThemeIdx(i)} style={{
                    padding:"12px", borderRadius:12, border:`2px solid ${themeIdx===i?T.pink:T.border}`,
                    background:theme.card, color:theme.text, cursor:"pointer",
                    textAlign:"left", fontWeight:600, fontSize:"0.8rem", transition:"all 0.2s"
                  }}>
                    <div style={{ display:"flex", gap:5, marginBottom:6 }}>
                      {[theme.pink, theme.teal, theme.amber].map(c=>(
                        <div key={c} style={{ width:12, height:12, borderRadius:"50%", background:c }} />
                      ))}
                    </div>
                    {theme.name}
                  </button>
                ))}
              </div>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:"0.86rem", marginBottom:13, marginTop:18 }}>App Settings</div>
              {[
                { l:"Push Notifications", v:true },
                { l:"Auto-Detect Workouts", v:true },
                { l:"Dark Mode", v:true },
              ].map(s=>(
                <div key={s.l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:`1px solid ${T.border}` }}>
                  <div style={{ fontSize:"0.8rem" }}>{s.l}</div>
                  <div style={{ width:40, height:22, background:s.v?T.green:T.border, borderRadius:20, position:"relative", transition:"all 0.2s" }}>
                    <div style={{ width:18, height:18, background:"#fff", borderRadius:"50%", position:"absolute", top:2, left:s.v?20:2, transition:"all 0.2s" }} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ═══ EXERCISE MODAL ═══ */}
      {modal && modalEx && (
        <ExModal T={T}
          ex={modalEx}
          color={SECTION_META[section].color}
          onClose={()=>setModal(null)}
          isDone={done[`${dayIdx}-${modalEx.id}`]}
          onDone={()=>toggleDone(modalEx.id)}
          charType={charType}
        />
      )}
    </div>
  );
}
